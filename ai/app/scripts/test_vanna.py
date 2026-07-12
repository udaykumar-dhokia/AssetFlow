"""
Quick sanity check after training:

    python scripts/test_vanna.py "Which laptops are available?"

Prints the generated SQL and the query result so you can eyeball
correctness before wiring this into the /chat endpoint.
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.vanna_service import ask_sql

if __name__ == "__main__":
    question = " ".join(sys.argv[1:]) or "Which assets are available?"
    result = ask_sql(question)

    print(f"\nQuestion: {result['question']}")
    print(f"\nGenerated SQL:\n{result['sql']}")
    print(f"\nResult ({len(result['result'])} rows):")
    for row in result["result"][:10]:
        print(row)