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
import re
from urllib.parse import urlparse

import pandas as pd
import plotly.express as px
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


_ID_LIKE = re.compile(r"(^id$|_id$|^uuid$|_uuid$)", re.IGNORECASE)
_TIMESTAMP_LIKE = re.compile(r"(_at$|_date$|^date$|^timestamp$)", re.IGNORECASE)
_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE
)


def _is_uuid_series(series) -> bool:
    """Catches uuid-shaped string columns even when the column name doesn't hint at it."""
    sample = series.dropna().astype(str).head(5)
    if sample.empty:
        return False
    return all(_UUID_RE.match(v) for v in sample)


def _is_identifier_like(series, total_rows: int) -> bool:
    """Catches tag/serial/code-style identifier columns that aren't UUID-shaped
    but still carry no chartable signal (e.g. 'IT-V4O1-6640-9' asset tags).
    Heuristic: near-unique, non-numeric string columns are almost always an
    identifier rather than a real category - genuine categories (status,
    department, model name) repeat across rows.
    """
    if pd.api.types.is_numeric_dtype(series):
        return False
    non_null = series.dropna()
    if non_null.empty or total_rows == 0:
        return False
    return (non_null.nunique() / total_rows) >= 0.9


def _chartable_columns(df):
    """Returns a copy of df with id/uuid/timestamp/identifier-like columns dropped,
    for charting only. The original df (with all columns) is still what's returned
    to the user as `result`; this filtered copy is only used to decide what to plot.
    """
    total_rows = len(df)
    keep = []
    for col in df.columns:
        if _ID_LIKE.search(col) or _TIMESTAMP_LIKE.search(col):
            continue
        # Check uuid-shaped content regardless of dtype label - depending on the
        # pandas version, string columns can report dtype as "object" or "str",
        # so we can't rely on a dtype check alone to spot them.
        if not pd.api.types.is_numeric_dtype(df[col]) and _is_uuid_series(df[col]):
            continue
        # Catches non-uuid identifiers (asset tags, serial numbers, SKUs, etc.)
        # that are near-unique per row and therefore not a real category.
        if _is_identifier_like(df[col], total_rows):
            continue
        keep.append(col)
    return df[keep]


def _deterministic_chart(df, title: str = ""):
    """Fallback chart builder used when Groq's generated Plotly code fails,
    or when filtering leaves a shape it can't handle well.
    Picks a categorical column for the x-axis and a numeric column for the
    y-axis if both exist; otherwise falls back to a value-count bar chart or
    a histogram. Returns None if nothing sensible can be built.
    """
    categorical, numeric = [], []
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            numeric.append(col)
        elif df[col].nunique() <= max(20, len(df) // 2):
            categorical.append(col)

    if categorical and numeric:
        fig = px.bar(df, x=categorical[0], y=numeric[0], title=title)
    elif categorical:
        counts = df[categorical[0]].value_counts().reset_index()
        counts.columns = [categorical[0], "count"]
        fig = px.bar(counts, x=categorical[0], y="count", title=title)
    elif numeric:
        fig = px.histogram(df, x=numeric[0], title=title)
    else:
        return None

    return fig.to_json()


def generate_chart(question: str, sql: str, df) -> str | None:
    """
    Generates a Plotly chart for a result set.

    Strategy:
    1. Strip id/uuid/timestamp/identifier-like columns from a copy of the
       dataframe before any chart-code generation happens - these make
       meaningless axes (e.g. plotting a row's UUID or asset tag against
       another column) and were the root cause of nonsense auto-generated
       charts.
    2. If nothing numeric remains (i.e. the result is just a list of
       records with only categorical columns, like "which laptops are
       available"), skip Groq's chart-code generation entirely and go
       straight to the deterministic value-count chart. Letting an LLM
       pick two arbitrary string columns for a bar chart's x/y axes is
       unreliable; a count-by-category chart is the only sane default
       for this shape of result.
    3. Otherwise (a numeric column is present, e.g. an aggregate query),
       let Groq write the Plotly code against the filtered dataframe, so
       it physically cannot pick a bad column even if it wanted to.
    4. If Groq's code fails, or nothing sensible remains at all, fall back
       to the deterministic chart or return None rather than emit junk.

    Returns the chart as a JSON string (Plotly's fig.to_json() format,
    directly renderable by Plotly.js on the frontend), or None if a chart
    doesn't make sense for this result (e.g. a single-value COUNT result,
    fewer than 2 rows, or no non-id/timestamp/identifier columns to plot).
    """
    if df is None or len(df) < 2:
        return None

    chart_df = _chartable_columns(df)

    if chart_df.shape[1] == 0 or len(chart_df) < 2:
        # Nothing left worth plotting (e.g. result was only id + updated_at)
        return None

    has_numeric = any(pd.api.types.is_numeric_dtype(chart_df[c]) for c in chart_df.columns)

    if not has_numeric:
        # Categorical-only result (e.g. a plain list of records) - don't let
        # an LLM guess which two string columns to put on x/y, go straight
        # to a reliable count-by-category chart.
        try:
            return _deterministic_chart(chart_df, title=question)
        except Exception:
            return None

    vn = get_vanna()

    try:
        plotly_code = vn.generate_plotly_code(question=question, sql=sql, df=chart_df)
        fig = vn.get_plotly_figure(plotly_code=plotly_code, df=chart_df)
        return fig.to_json()
    except Exception:
        # Groq's generated chart code failed for this result shape - fall
        # back to a deterministic chart built from the same filtered columns
        # rather than breaking /chat entirely.
        try:
            return _deterministic_chart(chart_df, title=question)
        except Exception:
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