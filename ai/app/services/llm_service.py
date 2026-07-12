"""
LLM service for natural-language reasoning on top of already-fetched data.

Responsible ONLY for:
- Turning a SQL result set into a plain-English answer (Feature 1)
- Turning dashboard KPI numbers into business insights (Feature 2)

Deliberately separate from vanna_service.py: Vanna's internal Groq client
is scoped to SQL generation only (it has schema context baked into its
prompt). This service is a plain Groq chat client for general reasoning,
reusable anywhere a "explain this data in English" step is needed.
"""

import os
import json

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY not set in .env")
        _client = OpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
    return _client


def summarize_sql_result(question: str, sql: str, rows: list[dict]) -> str:
    """
    Turns a SQL result set into a short natural-English answer.
    e.g. rows=[...8 laptop rows...] -> "There are 8 available laptops."
    """
    client = _get_client()

    # Cap how much raw data we send back to the LLM: for large result sets,
    # the row COUNT and a small sample are enough context for a summary
    # sentence, and keeps token usage (and latency) down.
    sample = rows[:15]
    truncated = len(rows) > 15

    prompt = (
        f"A user asked this question about an asset management system: "
        f"\"{question}\"\n\n"
        f"This SQL query was run:\n{sql}\n\n"
        f"It returned {len(rows)} row(s). "
        f"{'Here is a sample of the first 15:' if truncated else 'Here are all the rows:'}\n"
        f"{json.dumps(sample, default=str)}\n\n"
        "Write a short, natural, conversational English answer to the "
        "user's question based on this data. 1-3 sentences. Mention "
        "specific numbers/names where relevant. Do not mention SQL, "
        "queries, or databases in your answer - just answer naturally, "
        "like a knowledgeable colleague would."
    )

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()


def summarize_dashboard_insights(kpis: dict) -> str:
    """
    Turns dashboard KPI numbers into 2-4 short business insight bullets.
    No SQL generation involved - Groq only summarizes numbers it's handed.
    """
    client = _get_client()

    prompt = (
        "You are an assistant summarizing an asset management dashboard "
        "for a business user. Here are the current KPI numbers as JSON:\n\n"
        f"{json.dumps(kpis, default=str)}\n\n"
        "Write 2-4 short, punchy business insight bullet points based ONLY "
        "on these numbers (e.g. highlighting what's overdue, which "
        "department stands out, anything that looks like it needs "
        "attention). Do not invent numbers not present above. "
        "Format as plain bullet points starting with '- '."
    )

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()