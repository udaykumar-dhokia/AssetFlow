"""
Quick sanity check of the full /chat pipeline (SQL + summary + chart):

    python scripts/test_chat.py "Which laptops are available?"

Prints the English answer, the SQL, row count, and whether a chart was
generated (charts are large JSON, so just confirms presence/size).
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.chat_service import handle_chat_message

if __name__ == "__main__":
    question = " ".join(sys.argv[1:]) or "Which assets are available?"
    result = handle_chat_message(question)

    print(f"\nQuestion: {question}")
    print(f"\nAnswer:\n{result['answer']}")
    print(f"\nSQL:\n{result['sql']}")
    print(f"\nRows returned: {len(result['data'])}")
    print(f"\nChart generated: {'yes, ' + str(len(result['chart'])) + ' bytes of JSON' if result['chart'] else 'no'}")