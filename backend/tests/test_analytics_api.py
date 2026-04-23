"""
Test Analytics API endpoints for QueueIt
Tests: /api/analytics/overview, /api/analytics/top-songs, /api/analytics/hourly, /api/analytics/daily, /api/analytics/recent
All endpoints require admin authentication (Bearer token = password)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_PASSWORD = "hostel2024"

class TestAnalyticsAPI:
    """Analytics endpoint tests - all require admin auth"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth headers for all tests"""
        self.headers = {"Authorization": f"Bearer {ADMIN_PASSWORD}"}
    
    # ─── Overview Endpoint ───
    def test_analytics_overview_without_auth(self):
        """Overview endpoint should require auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/overview")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/analytics/overview without auth returns 401")
    
    def test_analytics_overview_with_auth(self):
        """Overview endpoint returns stats with auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/overview", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify response structure
        assert "total_requests" in data, "Missing total_requests field"
        assert "total_played" in data, "Missing total_played field"
        assert "requests_today" in data, "Missing requests_today field"
        assert "unique_songs" in data, "Missing unique_songs field"
        assert "unique_requesters" in data, "Missing unique_requesters field"
        
        # Verify data types
        assert isinstance(data["total_requests"], int), "total_requests should be int"
        assert isinstance(data["total_played"], int), "total_played should be int"
        assert isinstance(data["requests_today"], int), "requests_today should be int"
        assert isinstance(data["unique_songs"], int), "unique_songs should be int"
        assert isinstance(data["unique_requesters"], int), "unique_requesters should be int"
        
        print(f"✓ GET /api/analytics/overview returns valid data: {data}")
    
    # ─── Top Songs Endpoint ───
    def test_analytics_top_songs_without_auth(self):
        """Top songs endpoint should require auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/top-songs")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/analytics/top-songs without auth returns 401")
    
    def test_analytics_top_songs_with_auth(self):
        """Top songs endpoint returns list with auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/top-songs", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "top_songs" in data, "Missing top_songs field"
        assert isinstance(data["top_songs"], list), "top_songs should be a list"
        
        # If there are songs, verify structure
        if len(data["top_songs"]) > 0:
            song = data["top_songs"][0]
            assert "name" in song, "Song missing name field"
            assert "artist" in song, "Song missing artist field"
            assert "count" in song, "Song missing count field"
            assert isinstance(song["count"], int), "count should be int"
        
        print(f"✓ GET /api/analytics/top-songs returns {len(data['top_songs'])} songs")
    
    # ─── Hourly Distribution Endpoint ───
    def test_analytics_hourly_without_auth(self):
        """Hourly endpoint should require auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/hourly")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/analytics/hourly without auth returns 401")
    
    def test_analytics_hourly_with_auth(self):
        """Hourly endpoint returns 24-hour distribution with auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/hourly", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "hourly" in data, "Missing hourly field"
        assert isinstance(data["hourly"], list), "hourly should be a list"
        assert len(data["hourly"]) == 24, f"Expected 24 hours, got {len(data['hourly'])}"
        
        # Verify structure of each hour
        for h in data["hourly"]:
            assert "hour" in h, "Hour entry missing hour field"
            assert "count" in h, "Hour entry missing count field"
            assert isinstance(h["hour"], int), "hour should be int"
            assert 0 <= h["hour"] <= 23, f"hour should be 0-23, got {h['hour']}"
            assert isinstance(h["count"], int), "count should be int"
        
        print(f"✓ GET /api/analytics/hourly returns 24-hour distribution")
    
    # ─── Daily Activity Endpoint ───
    def test_analytics_daily_without_auth(self):
        """Daily endpoint should require auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/daily")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/analytics/daily without auth returns 401")
    
    def test_analytics_daily_with_auth(self):
        """Daily endpoint returns 7-day activity with auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/daily", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "daily" in data, "Missing daily field"
        assert isinstance(data["daily"], list), "daily should be a list"
        assert len(data["daily"]) == 7, f"Expected 7 days, got {len(data['daily'])}"
        
        # Verify structure of each day
        for d in data["daily"]:
            assert "date" in d, "Day entry missing date field"
            assert "count" in d, "Day entry missing count field"
            assert isinstance(d["count"], int), "count should be int"
        
        print(f"✓ GET /api/analytics/daily returns 7-day activity")
    
    # ─── Recent Activity Endpoint ───
    def test_analytics_recent_without_auth(self):
        """Recent endpoint should require auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/recent")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ GET /api/analytics/recent without auth returns 401")
    
    def test_analytics_recent_with_auth(self):
        """Recent endpoint returns activity list with auth"""
        response = requests.get(f"{BASE_URL}/api/analytics/recent", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "recent" in data, "Missing recent field"
        assert isinstance(data["recent"], list), "recent should be a list"
        
        # If there are activities, verify structure
        if len(data["recent"]) > 0:
            activity = data["recent"][0]
            assert "song_name" in activity, "Activity missing song_name field"
            assert "action" in activity, "Activity missing action field"
            assert "timestamp" in activity, "Activity missing timestamp field"
            assert activity["action"] in ["request", "play"], f"Invalid action: {activity['action']}"
        
        print(f"✓ GET /api/analytics/recent returns {len(data['recent'])} activities")


class TestQueueAPI:
    """Queue API tests - verify queue endpoints still work"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup auth headers"""
        self.headers = {"Authorization": f"Bearer {ADMIN_PASSWORD}"}
    
    def test_get_queue(self):
        """GET /api/queue returns queue list"""
        response = requests.get(f"{BASE_URL}/api/queue")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "queue" in data, "Missing queue field"
        assert isinstance(data["queue"], list), "queue should be a list"
        print(f"✓ GET /api/queue returns {len(data['queue'])} items")
    
    def test_get_current_song(self):
        """GET /api/queue/current returns current song or null"""
        response = requests.get(f"{BASE_URL}/api/queue/current")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "current" in data, "Missing current field"
        print(f"✓ GET /api/queue/current returns: {'song playing' if data['current'] else 'no song'}")
    
    def test_add_to_queue(self):
        """POST /api/queue/add adds song to queue"""
        payload = {
            "song": {
                "id": "test_analytics_song_123",
                "name": "Test Analytics Song",
                "artist": "Test Artist",
                "album": "Test Album",
                "duration_ms": 180000,
                "album_art": "https://via.placeholder.com/64",
                "spotify_uri": "spotify:track:test123"
            },
            "requested_by": "TEST_Analytics_User"
        }
        
        response = requests.post(f"{BASE_URL}/api/queue/add", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success: true"
        assert "id" in data, "Missing id in response"
        print(f"✓ POST /api/queue/add successfully added song")
        
        # Verify analytics logged the request
        analytics_response = requests.get(f"{BASE_URL}/api/analytics/recent", headers=self.headers)
        if analytics_response.status_code == 200:
            recent = analytics_response.json().get("recent", [])
            found = any(a.get("song_name") == "Test Analytics Song" for a in recent)
            if found:
                print("✓ Analytics logged the song request")


class TestStarterKitRoute:
    """Test that starter kit route exists (frontend route, just verify no 404)"""
    
    def test_admin_route_exists(self):
        """Admin route should return HTML (not 404)"""
        response = requests.get(f"{BASE_URL.replace('/api', '')}/admin")
        # Frontend routes return 200 with HTML
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ /admin route exists")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
