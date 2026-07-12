import json
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))

from services import agent_service


class FakeToolCall:
    def __init__(self, name: str, arguments: dict):
        self.function = SimpleNamespace(name=name, arguments=json.dumps(arguments))


class FakeCompletionsClient:
    def __init__(self, tool_call):
        self._tool_call = tool_call
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self._create))

    def _create(self, **kwargs):
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(tool_calls=[self._tool_call]))]
        )


class AgentServiceTests(unittest.TestCase):
    def test_create_maintenance_request_action(self):
        fake_client = FakeCompletionsClient(
            FakeToolCall(
                "create_maintenance_request",
                {
                    "asset_identifier": "IT-F31U-0896-26",
                    "issue_description": "Battery not charging",
                    "requested_by_user_identifier": "Jane Doe",
                    "priority": "HIGH",
                },
            )
        )

        with patch.object(agent_service, "_get_groq_client", return_value=fake_client), patch.object(
            agent_service, "_find_asset", return_value={"id": "asset-1", "name": "Laptop", "asset_tag": "IT-F31U-0896-26"}
        ), patch.object(agent_service, "_find_user", return_value={"id": "user-1", "name": "Jane Doe"}), patch.object(
            agent_service, "_create_maintenance_request", return_value={"id": "req-1"}
        ) as create_req:
            result = agent_service.handle_agent_action("Create a maintenance request for this laptop")

        self.assertTrue(result["success"])
        self.assertEqual(result["action"], "create_maintenance_request")
        self.assertEqual(create_req.call_args[0][0], "asset-1")
        self.assertEqual(create_req.call_args[0][1], "Battery not charging")

    def test_reallocate_asset_to_department_action(self):
        fake_client = FakeCompletionsClient(
            FakeToolCall(
                "reallocate_asset_to_department",
                {
                    "asset_identifier": "IT-F31U-0896-26",
                    "department_identifier": "Engineering",
                },
            )
        )

        with patch.object(agent_service, "_get_groq_client", return_value=fake_client), patch.object(
            agent_service, "_find_asset", return_value={"id": "asset-1", "name": "Laptop", "asset_tag": "IT-F31U-0896-26"}
        ), patch.object(agent_service, "_find_department", return_value={"id": "dept-1", "name": "Engineering"}), patch.object(
            agent_service, "_create_asset_allocation", return_value={"id": "allocation-1"}
        ) as create_alloc:
            result = agent_service.handle_agent_action("Reallocate this asset to Engineering")

        self.assertTrue(result["success"])
        self.assertEqual(result["action"], "reallocate_asset_to_department")
        self.assertEqual(create_alloc.call_args[0][0], "asset-1")
        self.assertEqual(create_alloc.call_args[0][1], "dept-1")

    def test_book_asset_action(self):
        fake_client = FakeCompletionsClient(
            FakeToolCall(
                "book_asset",
                {
                    "asset_identifier": "IT-F31U-0896-26",
                    "user_identifier": "Jane Doe",
                    "start_time": "2026-07-15T10:00:00",
                    "end_time": "2026-07-15T12:00:00",
                },
            )
        )

        with patch.object(agent_service, "_get_groq_client", return_value=fake_client), patch.object(
            agent_service, "_find_asset", return_value={"id": "asset-1", "name": "Laptop", "asset_tag": "IT-F31U-0896-26"}
        ), patch.object(agent_service, "_find_user", return_value={"id": "user-1", "name": "Jane Doe"}), patch.object(
            agent_service, "_create_resource_booking", return_value={"id": "booking-1"}
        ) as create_booking:
            result = agent_service.handle_agent_action("Book this laptop for Jane Doe")

        self.assertTrue(result["success"])
        self.assertEqual(result["action"], "book_asset")
        self.assertEqual(create_booking.call_args[0][0], "asset-1")
        self.assertEqual(create_booking.call_args[0][1], "user-1")


if __name__ == "__main__":
    unittest.main()
