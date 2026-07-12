"""
Quick verification script for the generate_chart() fix.
Place this in app/scripts/ and run from app/ directory:
    python scripts/test_chart_fix.py

Tests the chart logic against realistic shapes WITHOUT hitting Groq or
Postgres, so you can confirm the filtering/fallback logic works before
testing the full live pipeline.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pandas as pd
from services.vanna_service import _chartable_columns, _deterministic_chart


def check(name, condition):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {name}")
    return condition


def main():
    all_passed = True

    # Case 1: the exact bug you hit - id + updated_at + real columns
    df1 = pd.DataFrame({
        "id": [
            "3f272026-1870-4849-b2b4-1f7e3841aa21",
            "c064817e-4f53-41b5-b93a-19b254ebd125",
            "9e548d4f-0bce-49c4-8582-ecc47c9e5604",
        ],
        "asset_name": ["Dell XPS 13", "MacBook Pro", "ThinkPad X1"],
        "category": ["Laptop", "Laptop", "Laptop"],
        "status": ["AVAILABLE", "AVAILABLE", "AVAILABLE"],
        "updated_at": [
            "2026-07-12T04:42:46", "2026-07-12T04:42:47", "2026-07-12T04:42:52"
        ],
    })
    filtered1 = _chartable_columns(df1)
    all_passed &= check(
        "id and updated_at stripped from chartable columns",
        "id" not in filtered1.columns and "updated_at" not in filtered1.columns,
    )
    all_passed &= check(
        "real columns (asset_name, category, status) retained",
        set(["asset_name", "category", "status"]).issubset(set(filtered1.columns)),
    )
    chart1 = _deterministic_chart(filtered1, title="test")
    all_passed &= check("deterministic chart builds successfully for case 1", chart1 is not None)

    # Case 2: uuid-shaped content in a column NOT named id/uuid (edge case)
    df2 = pd.DataFrame({
        "asset_ref": [
            "3f272026-1870-4849-b2b4-1f7e3841aa21",
            "c064817e-4f53-41b5-b93a-19b254ebd125",
        ],
        "department": ["Engineering", "Sales"],
    })
    filtered2 = _chartable_columns(df2)
    all_passed &= check(
        "uuid-content column caught even without id-like name",
        "asset_ref" not in filtered2.columns,
    )

    # Case 3: only id + timestamp columns - nothing chartable should remain
    df3 = pd.DataFrame({
        "id": ["a", "b", "c"],
        "updated_at": ["2026-01-01", "2026-01-02", "2026-01-03"],
    })
    filtered3 = _chartable_columns(df3)
    all_passed &= check(
        "case with only id+timestamp leaves zero chartable columns",
        filtered3.shape[1] == 0,
    )

    # Case 4: numeric-only result (e.g. count aggregates), no categorical column
    df4 = pd.DataFrame({"count": [5, 12, 3, 8, 20]})
    chart4 = _deterministic_chart(df4, title="test")
    all_passed &= check(
        "pure numeric result still produces a histogram fallback", chart4 is not None
    )

    # Case 5: single categorical column, no numeric - should value_count into a bar
    df5 = pd.DataFrame({"status": ["AVAILABLE", "AVAILABLE", "LOST", "AVAILABLE"]})
    chart5 = _deterministic_chart(df5, title="test")
    all_passed &= check(
        "categorical-only result produces value-count bar chart", chart5 is not None
    )

    print()
    print("ALL TESTS PASSED" if all_passed else "SOME TESTS FAILED - see above")
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())