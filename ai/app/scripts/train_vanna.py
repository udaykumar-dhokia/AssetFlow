"""
Run this ONCE (and again only when the schema changes or you want to add
more examples):

    python scripts/train_vanna.py

It trains Vanna in three layers, per Vanna's recommended approach:
  1. DDL - auto-pulled from Postgres INFORMATION_SCHEMA (ground truth,
     no manual transcription/guessing of column names).
  2. Documentation - plain-English notes about enums/business rules that
     aren't obvious from column names alone.
  3. Example question -> SQL pairs - the highest-signal training data,
     directly improves demo-question accuracy.
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.vanna_service import get_vanna


def train_from_information_schema(vn):
    df_information_schema = vn.run_sql(
        "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = 'public'"
    )
    plan = vn.get_training_plan_generic(df_information_schema)
    vn.train(plan=plan)
    print(f"Trained on {len(df_information_schema)} column rows from INFORMATION_SCHEMA.")


def train_domain_documentation(vn):
    docs = [
        "assets.status is an enum: AVAILABLE, ALLOCATED, RESERVED, "
        "UNDER_MAINTENANCE, LOST, RETIRED, DISPOSED. 'Available assets' "
        "means assets.status = 'AVAILABLE'.",

        "asset_allocations.status is an enum: ACTIVE, RETURNED, "
        "TRANSFER_REQUESTED. An asset is currently allocated to someone "
        "when asset_allocations.status = 'ACTIVE'.",

        "An allocation is overdue when asset_allocations.status = 'ACTIVE' "
        "and asset_allocations.expected_return_date is in the past "
        "(< current date) and actual_return_date is null.",

        "resource_bookings.status is an enum: UPCOMING, ONGOING, "
        "COMPLETED, CANCELLED.",

        "maintenance_requests.status is an enum: PENDING, APPROVED, "
        "REJECTED, TECH_ASSIGNED, IN_PROGRESS, RESOLVED. An open/active "
        "maintenance request has status NOT IN ('RESOLVED', 'REJECTED').",

        "maintenance_requests.priority is an enum: LOW, MEDIUM, HIGH, "
        "CRITICAL.",

        "users.role is an enum: ADMIN, ASSET_MANAGER, DEPT_HEAD, EMPLOYEE.",

        "departments.status and users.status are an enum: ACTIVE, INACTIVE.",

        "audit_items.status is an enum: VERIFIED, MISSING, DAMAGED.",

        "Department utilization generally means how many assets allocated "
        "to a department (via asset_allocations.allocated_to_department_id) "
        "relative to assets available to it.",
    ]
    for doc in docs:
        vn.train(documentation=doc)
    print(f"Trained on {len(docs)} documentation notes.")


def train_example_questions(vn):
    examples = [
        (
            "Which laptops are available?",
            "SELECT a.* FROM assets a "
            "JOIN asset_categories c ON a.category_id = c.id "
            "WHERE c.name ILIKE '%laptop%' AND a.status = 'AVAILABLE';",
        ),
        (
            "How many assets are overdue?",
            "SELECT COUNT(*) FROM asset_allocations "
            "WHERE status = 'ACTIVE' "
            "AND expected_return_date < NOW() "
            "AND actual_return_date IS NULL;",
        ),
        (
            "Which department has the most allocated assets?",
            "SELECT d.name, COUNT(*) AS allocated_count "
            "FROM asset_allocations aa "
            "JOIN departments d ON aa.allocated_to_department_id = d.id "
            "WHERE aa.status = 'ACTIVE' "
            "GROUP BY d.name ORDER BY allocated_count DESC LIMIT 1;",
        ),
        (
            "How many maintenance requests are pending?",
            "SELECT COUNT(*) FROM maintenance_requests WHERE status = 'PENDING';",
        ),
    ]
    for question, sql in examples:
        vn.train(question=question, sql=sql)
    print(f"Trained on {len(examples)} example question/SQL pairs.")


if __name__ == "__main__":
    vn = get_vanna()
    train_from_information_schema(vn)
    train_domain_documentation(vn)
    train_example_questions(vn)
    print("\nTraining complete. Training data is persisted in CHROMA_PERSIST_DIR, "
          "so you only need to re-run this if the schema or example set changes.")