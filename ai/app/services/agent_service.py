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
from datetime import datetime

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

VALID_MAINTENANCE_STATUSES = ["PENDING", "APPROVED", "REJECTED", "TECH_ASSIGNED", "IN_PROGRESS", "RESOLVED"]
VALID_MAINTENANCE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
VALID_ALLOCATION_STATUSES = ["ACTIVE", "RETURNED", "TRANSFER_REQUESTED"]
VALID_BOOKING_STATUSES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]

# A compact set of tools so the agent can perform a few realistic asset
# operations without opening the door to arbitrary SQL.
_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "update_asset_status",
            "description": (
                "Update the status of a single asset identified by name or asset tag."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "asset_identifier": {
                        "type": "string",
                        "description": "The asset's name or asset_tag as mentioned by the user.",
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
    },
    {
        "type": "function",
        "function": {
            "name": "create_maintenance_request",
            "description": "Create a maintenance request for a single asset.",
            "parameters": {
                "type": "object",
                "properties": {
                    "asset_identifier": {
                        "type": "string",
                        "description": "The asset's name or asset_tag as mentioned by the user.",
                    },
                    "issue_description": {
                        "type": "string",
                        "description": "A short description of the issue.",
                    },
                    "requested_by_user_identifier": {
                        "type": "string",
                        "description": "The requesting user's name or email.",
                    },
                    "priority": {
                        "type": "string",
                        "enum": VALID_MAINTENANCE_PRIORITIES,
                        "description": "The request priority.",
                    },
                },
                "required": ["asset_identifier", "issue_description", "requested_by_user_identifier"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "resolve_maintenance_request",
            "description": "Resolve an existing maintenance request.",
            "parameters": {
                "type": "object",
                "properties": {
                    "request_identifier": {
                        "type": "string",
                        "description": "The maintenance request id or a short identifier if the user mentioned one.",
                    },
                    "resolution_notes": {
                        "type": "string",
                        "description": "Notes about how the issue was resolved.",
                    },
                    "new_status": {
                        "type": "string",
                        "enum": ["RESOLVED", "REJECTED"],
                        "description": "The final maintenance status.",
                    },
                },
                "required": ["request_identifier", "resolution_notes", "new_status"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "reallocate_asset_to_department",
            "description": "Create an asset allocation for a department.",
            "parameters": {
                "type": "object",
                "properties": {
                    "asset_identifier": {
                        "type": "string",
                        "description": "The asset's name or asset_tag as mentioned by the user.",
                    },
                    "department_identifier": {
                        "type": "string",
                        "description": "The department name or id.",
                    },
                },
                "required": ["asset_identifier", "department_identifier"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "book_asset",
            "description": "Book an asset for a user for a time window.",
            "parameters": {
                "type": "object",
                "properties": {
                    "asset_identifier": {
                        "type": "string",
                        "description": "The asset's name or asset_tag as mentioned by the user.",
                    },
                    "user_identifier": {
                        "type": "string",
                        "description": "The user's name or email.",
                    },
                    "start_time": {
                        "type": "string",
                        "description": "ISO-8601 start datetime for the booking.",
                    },
                    "end_time": {
                        "type": "string",
                        "description": "ISO-8601 end datetime for the booking.",
                    },
                },
                "required": ["asset_identifier", "user_identifier", "start_time", "end_time"],
            },
        },
    },
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


def _find_user(identifier: str) -> dict | None:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT id, name, email
                FROM users
                WHERE LOWER(email) = LOWER(:identifier)
                   OR LOWER(name) = LOWER(:identifier)
                   OR LOWER(name) LIKE LOWER(:identifier_like)
                LIMIT 2
                """
            ),
            {"identifier": identifier, "identifier_like": f"%{identifier}%"},
        )
        rows = result.mappings().all()

    if len(rows) == 0:
        return None
    if len(rows) > 1:
        return {"ambiguous": True, "matches": [dict(r) for r in rows]}
    return dict(rows[0])


def _find_department(identifier: str) -> dict | None:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT id, name
                FROM departments
                WHERE LOWER(name) = LOWER(:identifier)
                   OR LOWER(name) LIKE LOWER(:identifier_like)
                LIMIT 2
                """
            ),
            {"identifier": identifier, "identifier_like": f"%{identifier}%"},
        )
        rows = result.mappings().all()

    if len(rows) == 0:
        return None
    if len(rows) > 1:
        return {"ambiguous": True, "matches": [dict(r) for r in rows]}
    return dict(rows[0])


def _create_maintenance_request(asset_id: str, issue_description: str, requested_by_user_id: str, priority: str | None = None) -> dict:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                INSERT INTO maintenance_requests (
                    id, asset_id, requested_by_user_id, issue_description, priority, status, created_at, updated_at
                ) VALUES (
                    :id, :asset_id, :requested_by_user_id, :issue_description, :priority, :status, :created_at, :updated_at
                ) RETURNING id
                """
            ),
            {
                "id": f"mr-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}",
                "asset_id": asset_id,
                "requested_by_user_id": requested_by_user_id,
                "issue_description": issue_description,
                "priority": priority or "MEDIUM",
                "status": "PENDING",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
        )
        conn.commit()
        request_id = result.scalar_one()

    return {"id": request_id}


def _resolve_maintenance_request(request_id: str, resolution_notes: str, new_status: str) -> dict:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                UPDATE maintenance_requests
                SET status = :status, resolution_notes = :resolution_notes, updated_at = :updated_at
                WHERE id = :id
                RETURNING id, asset_id, status
                """
            ),
            {
                "status": new_status,
                "resolution_notes": resolution_notes,
                "updated_at": datetime.utcnow(),
                "id": request_id,
            },
        )
        conn.commit()
        row = result.mappings().first()

    if row is None:
        raise ValueError("maintenance request not found")
    return dict(row)


def _create_asset_allocation(asset_id: str, department_id: str) -> dict:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                INSERT INTO asset_allocations (
                    id, asset_id, allocated_to_department_id, status, created_at, updated_at
                ) VALUES (
                    :id, :asset_id, :allocated_to_department_id, :status, :created_at, :updated_at
                ) RETURNING id
                """
            ),
            {
                "id": f"alloc-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}",
                "asset_id": asset_id,
                "allocated_to_department_id": department_id,
                "status": "ACTIVE",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
        )
        conn.commit()
        allocation_id = result.scalar_one()

    return {"id": allocation_id}


def _create_resource_booking(asset_id: str, user_id: str, start_time: str, end_time: str) -> dict:
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                INSERT INTO resource_bookings (
                    id, asset_id, user_id, start_time, end_time, status, created_at, updated_at
                ) VALUES (
                    :id, :asset_id, :user_id, :start_time, :end_time, :status, :created_at, :updated_at
                ) RETURNING id
                """
            ),
            {
                "id": f"booking-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}",
                "asset_id": asset_id,
                "user_id": user_id,
                "start_time": start_time,
                "end_time": end_time,
                "status": "UPCOMING",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
        )
        conn.commit()
        booking_id = result.scalar_one()

    return {"id": booking_id}


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
                            "You help manage asset records. Use the appropriate tool "
                            "for status changes, maintenance requests, maintenance "
                            "resolution, asset reallocation, or asset bookings. If "
                            "the message is a question or does not clearly request one "
                            "of these actions, do not call any tool."
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
    action_name = call.function.name

    try:
        args = json.loads(call.function.arguments)
    except (json.JSONDecodeError, TypeError):
        return {
            "success": False,
            "message": "Could not parse the requested action's parameters.",
            "action": action_name,
            "details": None,
        }

    if action_name == "update_asset_status":
        asset_identifier = args.get("asset_identifier", "").strip()
        new_status = args.get("new_status", "").strip().upper()

        if not asset_identifier or new_status not in VALID_STATUSES:
            return {
                "success": False,
                "message": (
                    f"Invalid parameters extracted (asset='{asset_identifier}', "
                    f"status='{new_status}'). Valid statuses are: {', '.join(VALID_STATUSES)}."
                ),
                "action": action_name,
                "details": None,
            }

        try:
            asset = _find_asset(asset_identifier)
        except Exception as e:
            return {
                "success": False,
                "message": f"Database error while looking up the asset: {e}",
                "action": action_name,
                "details": None,
            }

        if asset is None:
            return {
                "success": False,
                "message": f"No asset found matching '{asset_identifier}'.",
                "action": action_name,
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
                "action": action_name,
                "details": None,
            }

        previous_status = asset["status"]

        if previous_status == new_status:
            return {
                "success": True,
                "message": f"{asset['name']} ({asset['asset_tag']}) is already {new_status}.",
                "action": action_name,
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
                "action": action_name,
                "details": None,
            }

        return {
            "success": True,
            "message": (
                f"Updated {asset['name']} ({asset['asset_tag']}) from "
                f"{previous_status} to {new_status}."
            ),
            "action": action_name,
            "details": {
                "asset_id": str(asset["id"]),
                "asset_name": asset["name"],
                "asset_tag": asset["asset_tag"],
                "previous_status": previous_status,
                "new_status": new_status,
            },
        }

    if action_name == "create_maintenance_request":
        asset_identifier = args.get("asset_identifier", "").strip()
        issue_description = args.get("issue_description", "").strip()
        requested_by_user_identifier = args.get("requested_by_user_identifier", "").strip()
        priority = args.get("priority", "MEDIUM").strip().upper()

        if not asset_identifier or not issue_description or not requested_by_user_identifier:
            return {
                "success": False,
                "message": "Missing required details for creating a maintenance request.",
                "action": action_name,
                "details": None,
            }

        if priority not in VALID_MAINTENANCE_PRIORITIES:
            priority = "MEDIUM"

        try:
            asset = _find_asset(asset_identifier)
            user = _find_user(requested_by_user_identifier)
        except Exception as e:
            return {
                "success": False,
                "message": f"Database error while looking up request context: {e}",
                "action": action_name,
                "details": None,
            }

        if asset is None:
            return {
                "success": False,
                "message": f"No asset found matching '{asset_identifier}'.",
                "action": action_name,
                "details": None,
            }
        if asset.get("ambiguous"):
            return {
                "success": False,
                "message": f"'{asset_identifier}' matches multiple assets. Please specify the exact asset tag.",
                "action": action_name,
                "details": None,
            }
        if user is None or user.get("ambiguous"):
            return {
                "success": False,
                "message": f"Could not resolve the requesting user '{requested_by_user_identifier}'.",
                "action": action_name,
                "details": None,
            }

        try:
            created_request = _create_maintenance_request(asset["id"], issue_description, user["id"], priority)
        except Exception as e:
            return {
                "success": False,
                "message": f"Database error while creating the maintenance request: {e}",
                "action": action_name,
                "details": None,
            }

        return {
            "success": True,
            "message": f"Created a maintenance request for {asset['name']} ({asset['asset_tag']}) with priority {priority}.",
            "action": action_name,
            "details": {
                "request_id": created_request["id"],
                "asset_id": str(asset["id"]),
                "asset_name": asset["name"],
                "asset_tag": asset["asset_tag"],
            },
        }

    if action_name == "resolve_maintenance_request":
        request_identifier = args.get("request_identifier", "").strip()
        resolution_notes = args.get("resolution_notes", "").strip()
        new_status = args.get("new_status", "").strip().upper()

        if not request_identifier or not resolution_notes or new_status not in ["RESOLVED", "REJECTED"]:
            return {
                "success": False,
                "message": "Missing or invalid details for resolving the maintenance request.",
                "action": action_name,
                "details": None,
            }

        try:
            _resolve_maintenance_request(request_identifier, resolution_notes, new_status)
        except Exception as e:
            return {
                "success": False,
                "message": f"Database error while resolving the maintenance request: {e}",
                "action": action_name,
                "details": None,
            }

        return {
            "success": True,
            "message": f"Resolved maintenance request {request_identifier} with status {new_status}.",
            "action": action_name,
            "details": {"request_id": request_identifier, "status": new_status},
        }

    if action_name == "reallocate_asset_to_department":
        asset_identifier = args.get("asset_identifier", "").strip()
        department_identifier = args.get("department_identifier", "").strip()

        if not asset_identifier or not department_identifier:
            return {
                "success": False,
                "message": "Missing asset or department details for reallocation.",
                "action": action_name,
                "details": None,
            }

        try:
            asset = _find_asset(asset_identifier)
            department = _find_department(department_identifier)
        except Exception as e:
            return {
                "success": False,
                "message": f"Database error while looking up allocation context: {e}",
                "action": action_name,
                "details": None,
            }

        if asset is None:
            return {
                "success": False,
                "message": f"No asset found matching '{asset_identifier}'.",
                "action": action_name,
                "details": None,
            }
        if asset.get("ambiguous"):
            return {
                "success": False,
                "message": f"'{asset_identifier}' matches multiple assets. Please specify the exact asset tag.",
                "action": action_name,
                "details": None,
            }
        if department is None or department.get("ambiguous"):
            return {
                "success": False,
                "message": f"Could not resolve department '{department_identifier}'.",
                "action": action_name,
                "details": None,
            }

        try:
            allocation = _create_asset_allocation(asset["id"], department["id"])
        except Exception as e:
            return {
                "success": False,
                "message": f"Database error while creating the allocation: {e}",
                "action": action_name,
                "details": None,
            }

        return {
            "success": True,
            "message": f"Allocated {asset['name']} ({asset['asset_tag']}) to {department['name']}.",
            "action": action_name,
            "details": {
                "allocation_id": allocation["id"],
                "asset_id": str(asset["id"]),
                "department_id": department["id"],
            },
        }

    if action_name == "book_asset":
        asset_identifier = args.get("asset_identifier", "").strip()
        user_identifier = args.get("user_identifier", "").strip()
        start_time = args.get("start_time", "").strip()
        end_time = args.get("end_time", "").strip()

        if not asset_identifier or not user_identifier or not start_time or not end_time:
            return {
                "success": False,
                "message": "Missing required details for booking the asset.",
                "action": action_name,
                "details": None,
            }

        try:
            asset = _find_asset(asset_identifier)
            user = _find_user(user_identifier)
            datetime.fromisoformat(start_time.replace("Z", "+00:00"))
            datetime.fromisoformat(end_time.replace("Z", "+00:00"))
        except Exception as e:
            return {
                "success": False,
                "message": f"Invalid booking time or database lookup failed: {e}",
                "action": action_name,
                "details": None,
            }

        if asset is None:
            return {
                "success": False,
                "message": f"No asset found matching '{asset_identifier}'.",
                "action": action_name,
                "details": None,
            }
        if asset.get("ambiguous"):
            return {
                "success": False,
                "message": f"'{asset_identifier}' matches multiple assets. Please specify the exact asset tag.",
                "action": action_name,
                "details": None,
            }
        if user is None or user.get("ambiguous"):
            return {
                "success": False,
                "message": f"Could not resolve user '{user_identifier}'.",
                "action": action_name,
                "details": None,
            }

        try:
            booking = _create_resource_booking(asset["id"], user["id"], start_time, end_time)
        except Exception as e:
            return {
                "success": False,
                "message": f"Database error while creating the booking: {e}",
                "action": action_name,
                "details": None,
            }

        return {
            "success": True,
            "message": f"Booked {asset['name']} ({asset['asset_tag']}) for {user['name']}.",
            "action": action_name,
            "details": {
                "booking_id": booking["id"],
                "asset_id": str(asset["id"]),
                "user_id": user["id"],
            },
        }

    return {
        "success": False,
        "message": f"Unsupported action requested: {action_name}",
        "action": action_name,
        "details": None,
    }