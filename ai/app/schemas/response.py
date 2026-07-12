"""Response schemas for the AI microservice API."""

from typing import Optional
from pydantic import BaseModel


class ChatResponse(BaseModel):
    answer: str
    sql: Optional[str] = None
    data: list = []
    # Plotly figure serialized via fig.to_json() - a JSON string, not a
    # nested object. The frontend parses this directly into Plotly.js /
    # react-plotly.js's <Plot data={...} layout={...} /> props.
    chart: Optional[str] = None