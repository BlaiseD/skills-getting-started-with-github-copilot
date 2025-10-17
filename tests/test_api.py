from fastapi.testclient import TestClient
import importlib


def get_app_and_client():
    # Import the app module fresh to reset in-memory data between test runs
    app_module = importlib.import_module("src.app")
    importlib.reload(app_module)
    client = TestClient(app_module.app)
    return app_module, client


def test_get_activities_returns_activities():
    _, client = get_app_and_client()
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # ensure at least one activity exists
    assert len(data) > 0


def test_signup_and_unregister_flow():
    app_module, client = get_app_and_client()

    # Pick an activity from the seeded activities
    activities = client.get("/activities").json()
    activity_name = next(iter(activities.keys()))

    test_email = "testuser@example.com"

    # Ensure not already signed up
    if test_email in activities[activity_name]["participants"]:
        # remove if present
        activities[activity_name]["participants"].remove(test_email)

    # Sign up
    resp = client.post(f"/activities/{activity_name}/signup?email={test_email}")
    assert resp.status_code == 200
    assert test_email in app_module.activities[activity_name]["participants"]

    # Try signing up again should yield 400
    resp = client.post(f"/activities/{activity_name}/signup?email={test_email}")
    assert resp.status_code == 400

    # Unregister
    resp = client.delete(f"/activities/{activity_name}/participants?email={test_email}")
    assert resp.status_code == 200
    assert test_email not in app_module.activities[activity_name]["participants"]

    # Unregistering again should return 404
    resp = client.delete(f"/activities/{activity_name}/participants?email={test_email}")
    assert resp.status_code == 404
