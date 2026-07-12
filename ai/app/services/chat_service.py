"""
Chat service - orchestrates Feature 1 (Natural Language to SQL) end-to-end.

Pipeline: question -> Vanna generates + runs SQL -> Groq (llm_service)
summarizes the result in English -> Vanna generates a chart if the result
shape supports one -> combined response.

This is the ONLY place that wires vanna_service + llm_service together.
Route files (api/routes/chat.py) call this, never vanna_service or
llm_service directly - keeps routing separate from orchestration logic.
"""

from services import vanna_service
from services import llm_service


def handle_chat_message(message: str) -> dict:
    """
    Runs the full /chat pipeline for one user message.

    Returns a dict shaped for the API response:
        {
            "answer": str,              - natural English answer
            "sql": str,                 - the SQL that was run (for transparency/debugging)
            "data": list[dict],         - raw result rows
            "chart": str | None,        - Plotly JSON, or None if not chartable
        }

    Fails soft: if SQL generation/execution itself fails (bad question,
    schema gap, etc.), returns a friendly answer instead of a raw
    traceback - this is a live hackathon demo, not a debugging console.
    """
    try:
        sql_result = vanna_service.ask_sql(message)
    except Exception as e:
        return {
            "answer": (
                "I couldn't turn that into a query I'm confident about. "
                "Try rephrasing, or ask about assets, allocations, "
                "bookings, maintenance requests, or departments."
            ),
            "sql": None,
            "data": [],
            "chart": None,
            "error": str(e),
        }

    question = sql_result["question"]
    sql = sql_result["sql"]
    rows = sql_result["result"]
    df = sql_result["df"]

    try:
        answer = llm_service.summarize_sql_result(question, sql, rows)
    except Exception:
        # Summarization failing shouldn't hide a successful query result -
        # fall back to a plain row-count sentence.
        answer = f"Found {len(rows)} result(s)."

    chart = vanna_service.generate_chart(question, sql, df)

    return {
        "answer": answer,
        "sql": sql,
        "data": rows,
        "chart": chart,
    }