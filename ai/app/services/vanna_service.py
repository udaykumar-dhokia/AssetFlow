"""
Vanna AI service.

Responsible ONLY for:
- Text -> SQL generation (Vanna + Groq as the SQL-generating LLM)
- Running the generated SQL against Postgres
- Holding/training the vector store of schema + example Q&A pairs

Groq's API is OpenAI-compatible, so we reuse Vanna's OpenAI_Chat mixin and
just point it at Groq's base_url instead of OpenAI's. No separate Groq
integration needed.
"""

import os
from urllib.parse import urlparse

from dotenv import load_dotenv
from openai import OpenAI
from vanna.chromadb import ChromaDB_VectorStore
from vanna.openai import OpenAI_Chat

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
DATABASE_URL = os.getenv("DATABASE_URL")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_store")


class AssetFlowVanna(ChromaDB_VectorStore, OpenAI_Chat):
    """Combines a local ChromaDB vector store with Groq (via OpenAI-compatible API) as the SQL LLM."""

    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        # Build the OpenAI client ourselves, pointed at Groq's endpoint, and
        # hand it to OpenAI_Chat directly. Vanna 0.7.9 does not reliably pick
        # up base_url from the config dict, so this avoids silently hitting
        # OpenAI's real servers with a Groq key.
        groq_client = OpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
        OpenAI_Chat.__init__(self, client=groq_client, config=config)


_vn_instance: AssetFlowVanna | None = None


def get_vanna() -> AssetFlowVanna:
    """Returns a singleton, already-connected Vanna instance."""
    global _vn_instance

    if _vn_instance is not None:
        return _vn_instance

    if not GROQ_API_KEY or GROQ_API_KEY.startswith("paste-"):
        raise RuntimeError("GROQ_API_KEY not set in .env")

    vn = AssetFlowVanna(config={
        "api_key": GROQ_API_KEY,
        "base_url": GROQ_BASE_URL,
        "model": GROQ_MODEL,
        "path": CHROMA_PERSIST_DIR,
    })

    _connect_to_db(vn)

    _vn_instance = vn
    return _vn_instance


def _connect_to_db(vn: AssetFlowVanna) -> None:
    """Parses DATABASE_URL and connects Vanna directly to Postgres."""
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL not set in .env")

    parsed = urlparse(DATABASE_URL)

    vn.connect_to_postgres(
        host=parsed.hostname,
        dbname=parsed.path.lstrip("/"),
        user=parsed.username,
        password=parsed.password,
        port=parsed.port or 5432,
    )


def generate_chart(question: str, sql: str, df) -> str | None:
    """
    Generates a Plotly chart for a result set, using Vanna's built-in
    chart-code generation (Groq writes the Plotly code, Vanna executes it).

    Returns the chart as a JSON string (Plotly's fig.to_json() format,
    directly renderable by Plotly.js on the frontend), or None if a chart
    doesn't make sense for this result (e.g. a single-value COUNT result,
    or fewer than 2 rows).
    """
    if df is None or len(df) < 2:
        return None

    vn = get_vanna()

    try:
        plotly_code = vn.generate_plotly_code(question=question, sql=sql, df=df)
        fig = vn.get_plotly_figure(plotly_code=plotly_code, df=df)
        return fig.to_json()
    except Exception:
        # Charting is a nice-to-have for the demo, not a critical path -
        # if Groq produces bad chart code for an unusual result shape,
        # fail soft and just return no chart rather than breaking /chat.
        return None


def ask_sql(question: str) -> dict:
    """
    Runs the full Vanna pipeline: question -> SQL -> executed result.
    Returns the raw dataframe too (not just serialized records) so the
    caller can pass it straight into generate_chart() without a second
    query round-trip.
    """
    vn = get_vanna()

    sql = vn.generate_sql(question=question)
    df = vn.run_sql(sql)

    return {
        "question": question,
        "sql": sql,
        "result": df.to_dict(orient="records"),
        "df": df,
    }