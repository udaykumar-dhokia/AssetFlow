"""
Agentic Action service - Feature 3.

Responsible ONLY for:
- Taking a natural language instruction ("mark the Dell XPS 15 as under
  maintenance") and, via Groq function-calling, extracting a structured
  action + parameters
- Validating those parameters against the real database (does this asset
  exist? is the requested status a real enum value?)
- Executing exactly one fixed, parameterized SQL statement to make the
  change
- Returning a clear confirmation (what changed, from what, to what)

Deliberately NOT a general agent loop: one tool, one action, no multi-step
planning, no chained tool calls. This keeps behavior predictable and safe
to demo live - Groq only ever decides *which* asset and *which* status,
never what SQL to run.

ASSUMPTION (update once real files are shared): `database.connection`
exposes a SQLAlchemy `engine`. If your actual module instead exposes a
`get_db()` dependency yielding a Session, swap the query execution below
to use that Session instead of a raw engine connection - the SQL/logic
does not change, only how the connection is obtained.
"""

import json
import os

from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import text

from database.connection import engine  # ASSUMPTION - adjust import if your connection.py differs

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

_groq_client: OpenAI | None = None

# Must match the real enum values in your assets.status column exactly -
# per your project summary: AVAILABLE, ALLOCATED, RESERVED,
# UNDER_MAINTENANCE, LOST, RETIRED, DISPOSED
VALID_STATUSES = [
    "AVAILABLE",
    "ALLOCATED",
    "RESERVED",
    "UNDER_MAINTENANCE",
    "LOST",
    "RETIRED",
    "DISPOSED",
]

# The single tool Groq is allowed to call. Deliberately narrow: one action,
# two required params, status constrained to a real enum so Groq physically
# cannot return a value that would fail validation downstream.
_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "update_asset_status",
            "description": (
                "Update the status of a single asset identified by name or "
                "asset tag. Use this when the user asks to mark, set, change, "
                "or update an asset's status (e.g. 'mark the Dell XPS 15 as "
                "under maintenance', 'the Razer Blade 15 is lost')."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "asset_identifier": {
                        "type": "string",
                        "description": (
                            "The asset's name or asset_tag as mentioned by the "
                            "user, e.g. 'Dell XPS 15' or 'IT-V4O1-6640-9'. Pass "
                            "through exactly what the user said - do not guess "
                            "an ID."
                        ),
                    },
                    "new_status": {
                        "type": "string",
                        "enum": VALID_STATUSES,
                        "description": "The new status to set for the asset.",
                    },
                },
                "required": ["asset_identifier", "new_status"],
            },
        },
    }
]


def _get_groq_client() -> OpenAI:
    global _groq_client
    if _groq_client is None:
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY not set in .env")
        _groq_client = OpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
    return _groq_client


def _find_asset(asset_identifier: str) -> dict | None:
    """Looks up a single asset by name or asset_tag (case-insensitive, partial match on name).
    Returns None if no match or if the match is ambiguous (multiple rows).
    """
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT id, name, asset_tag, status
                FROM assets
                WHERE LOWER(asset_tag) = LOWER(:identifier)
                   OR LOWER(name) = LOWER(:identifier)
                   OR LOWER(name) LIKE LOWER(:identifier_like)
                LIMIT 2
                """
            ),
            {"identifier": asset_identifier, "identifier_like": f"%{asset_identifier}%"},
        )
        rows = result.mappings().all()

    if len(rows) == 0:
        return None
    if len(rows) > 1:
        # Ambiguous match (e.g. multiple "MacBook Air M2" units) - caller
        # should ask the user to be more specific (e.g. asset tag) rather
        # than silently picking one.
        return {"ambiguous": True, "matches": [dict(r) for r in rows]}
    return dict(rows[0])


def _update_asset_status(asset_id: str, new_status: str) -> None:
    with engine.connect() as conn:
        conn.execute(
            text("UPDATE assets SET status = :status WHERE id = :id"),
            {"status": new_status, "id": asset_id},
        )
        conn.commit()


def handle_agent_action(message: str) -> dict:
    """
    Full pipeline: message -> Groq tool call -> validate -> execute -> confirm.

    Returns a dict always containing:
      - success: bool
      - message: str (human-readable confirmation or explanation)
      - action: str | None (which tool was invoked, if any)
      - details: dict | None (asset_id, previous_status, new_status on success)

    Never raises - all failure modes (no tool call, unknown asset, ambiguous
    match, invalid status, DB error) are caught and returned as a clear
    success=False message so the API layer can just pass this straight
    through to the response schema.
    """
    client = _get_groq_client()

    # Llama-family models via Groq occasionally emit the function call as
    # literal text (e.g. "<function=name,{...}</function>") instead of the
    # proper structured tool_calls format, which Groq's API then rejects
    # with a 400 tool_use_failed error. This is a known model-behavior
    # quirk, not a bug in our request - lowering temperature reduces how
    # often it happens, and retrying once resolves it the rest of the time
    # since the failure is non-deterministic.
    response = None
    last_error = None

    for attempt in range(2):
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You help manage asset records. If the user's message "
                            "asks to change an asset's status, call the "
                            "update_asset_status tool. If it's just a question or "
                            "doesn't clearly request a status change, do not call "
                            "any tool."
                        ),
                    },
                    {"role": "user", "content": message},
                ],
                tools=_TOOLS,
                tool_choice="auto",
                temperature=0,
            )
            break
        except Exception as e:
            last_error = e
            continue

    if response is None:
        return {
            "success": False,
            "message": (
                "The assistant failed to interpret this request after retrying "
                f"(likely a transient model formatting issue): {last_error}"
            ),
            "action": None,
            "details": None,
        }

    tool_calls = response.choices[0].message.tool_calls

    if not tool_calls:
        return {
            "success": False,
            "message": (
                "I didn't detect a specific action to take from that message. "
                "Try phrasing it like: 'Mark the Dell XPS 15 as under maintenance.'"
            ),
            "action": None,
            "details": None,
        }

    call = tool_calls[0]

    if call.function.name != "update_asset_status":
        return {
            "success": False,
            "message": f"Unsupported action requested: {call.function.name}",
            "action": call.function.name,
            "details": None,
        }

    try:
        args = json.loads(call.function.arguments)
    except (json.JSONDecodeError, TypeError):
        return {
            "success": False,
            "message": "Could not parse the requested action's parameters.",
            "action": "update_asset_status",
            "details": None,
        }

    asset_identifier = args.get("asset_identifier", "").strip()
    new_status = args.get("new_status", "").strip().upper()

    if not asset_identifier or new_status not in VALID_STATUSES:
        return {
            "success": False,
            "message": (
                f"Invalid parameters extracted (asset='{asset_identifier}', "
                f"status='{new_status}'). Valid statuses are: {', '.join(VALID_STATUSES)}."
            ),
            "action": "update_asset_status",
            "details": None,
        }

    try:
        asset = _find_asset(asset_identifier)
    except Exception as e:
        return {
            "success": False,
            "message": f"Database error while looking up the asset: {e}",
            "action": "update_asset_status",
            "details": None,
        }

    if asset is None:
        return {
            "success": False,
            "message": f"No asset found matching '{asset_identifier}'.",
            "action": "update_asset_status",
            "details": None,
        }

    if asset.get("ambiguous"):
        names = [f"{m['name']} ({m['asset_tag']})" for m in asset["matches"]]
        return {
            "success": False,
            "message": (
                f"'{asset_identifier}' matches multiple assets: {', '.join(names)}. "
                "Please specify the exact asset tag."
            ),
            "action": "update_asset_status",
            "details": None,
        }

    previous_status = asset["status"]

    if previous_status == new_status:
        return {
            "success": True,
            "message": f"{asset['name']} ({asset['asset_tag']}) is already {new_status}.",
            "action": "update_asset_status",
            "details": {
                "asset_id": str(asset["id"]),
                "asset_name": asset["name"],
                "asset_tag": asset["asset_tag"],
                "previous_status": previous_status,
                "new_status": new_status,
            },
        }

    try:
        _update_asset_status(asset["id"], new_status)
    except Exception as e:
        return {
            "success": False,
            "message": f"Database error while updating the asset: {e}",
            "action": "update_asset_status",
            "details": None,
        }

    return {
        "success": True,
        "message": (
            f"Updated {asset['name']} ({asset['asset_tag']}) from "
            f"{previous_status} to {new_status}."
        ),
        "action": "update_asset_status",
        "details": {
            "asset_id": str(asset["id"]),
            "asset_name": asset["name"],
            "asset_tag": asset["asset_tag"],
            "previous_status": previous_status,
            "new_status": new_status,
        },
    }