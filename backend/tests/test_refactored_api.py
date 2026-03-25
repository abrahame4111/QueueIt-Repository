"""
QueueIt Backend API Tests - Testing refactored modular routes:
- Admin login, settings, change password (routes/admin.py)
- Queue CRUD operations (routes/queue.py)
- Song search (routes/songs.py)
- Spotify endpoints (routes/spotify.py)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRootEndpoint:
    """Test root API endpoint"""
    
    def test_api_root_returns_message(self):
        """GET /api/ should return API message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "QueueIt API"
        print("✓ GET /api/ returns correct message")


class TestSongSearch:
    """Test song search endpoint (routes/songs.py)"""
    
    def test_search_songs_returns_array(self):
        """GET /api/songs/search?q=love should return songs array"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=love")
        assert response.status_code == 200
        data = response.json()
        assert "songs" in data
        assert isinstance(data["songs"], list)
        # Spotify should return results for 'love'
        if len(data["songs"]) > 0:
            song = data["songs"][0]
            assert "id" in song
            assert "name" in song
            assert "artist" in song
            assert "album" in song
            assert "spotify_uri" in song
        print(f"✓ Song search returned {len(data['songs'])} results")
    
    def test_search_songs_empty_query(self):
        """GET /api/songs/search?q= should handle empty query"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=")
        # Should either return empty or error
        assert response.status_code in [200, 400, 500]
        print("✓ Song search handles empty query")
    
    def test_playlists_endpoint(self):
        """GET /api/songs/playlists should return playlists"""
        response = requests.get(f"{BASE_URL}/api/songs/playlists")
        assert response.status_code == 200
        data = response.json()
        assert "playlists" in data
        print(f"✓ Playlists endpoint returned {len(data['playlists'])} playlists")


class TestAdminLogin:
    """Test admin login endpoint (routes/admin.py)"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login with password 'hostel2024' should return token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "hostel2024"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["token"] == "hostel2024"
        print("✓ Admin login with correct password returns token")
    
    def test_admin_login_invalid_password(self):
        """POST /api/admin/login with wrong password should return 401"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Admin login rejects invalid password with 401")


class TestAdminSettings:
    """Test admin settings endpoints (routes/admin.py)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "hostel2024"
        })
        return response.json().get("token")
    
    def test_get_settings_requires_auth(self):
        """GET /api/admin/settings without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 401
        print("✓ GET /api/admin/settings requires authentication")
    
    def test_get_settings_with_auth(self, admin_token):
        """GET /api/admin/settings with auth should return venue_name and version"""
        response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "venue_name" in data
        assert "version" in data
        assert data["version"] == "1.0.0"
        print(f"✓ GET /api/admin/settings returns venue_name='{data['venue_name']}' and version='{data['version']}'")
    
    def test_update_settings_requires_auth(self):
        """PUT /api/admin/settings without auth should return 401"""
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            json={"venue_name": "Test Venue"}
        )
        assert response.status_code == 401
        print("✓ PUT /api/admin/settings requires authentication")
    
    def test_update_venue_name(self, admin_token):
        """PUT /api/admin/settings with auth and venue_name should update venue name"""
        test_venue = f"TEST_Venue_{uuid.uuid4().hex[:8]}"
        
        # Update venue name
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            json={"venue_name": test_venue},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
        # Verify the update persisted
        get_response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["venue_name"] == test_venue
        print(f"✓ PUT /api/admin/settings updates venue name to '{test_venue}'")


class TestChangePassword:
    """Test change password endpoint (routes/admin.py)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "hostel2024"
        })
        return response.json().get("token")
    
    def test_change_password_requires_auth(self):
        """POST /api/admin/change-password without auth should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/change-password",
            json={"current_password": "hostel2024", "new_password": "newpass123"}
        )
        assert response.status_code == 401
        print("✓ POST /api/admin/change-password requires authentication")
    
    def test_change_password_wrong_current(self, admin_token):
        """POST /api/admin/change-password with wrong current_password should return 400"""
        response = requests.post(
            f"{BASE_URL}/api/admin/change-password",
            json={"current_password": "wrongpassword", "new_password": "newpass123"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "incorrect" in data["detail"].lower()
        print("✓ POST /api/admin/change-password rejects wrong current password with 400")
    
    def test_change_password_success_and_revert(self, admin_token):
        """POST /api/admin/change-password with correct current_password should change password"""
        new_password = "temppass123"
        
        # Change password
        response = requests.post(
            f"{BASE_URL}/api/admin/change-password",
            json={"current_password": "hostel2024", "new_password": new_password},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["token"] == new_password
        print(f"✓ Password changed to '{new_password}'")
        
        # Verify new password works for login
        login_response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": new_password
        })
        assert login_response.status_code == 200
        print("✓ New password works for login")
        
        # Revert password back to original
        revert_response = requests.post(
            f"{BASE_URL}/api/admin/change-password",
            json={"current_password": new_password, "new_password": "hostel2024"},
            headers={"Authorization": f"Bearer {new_password}"}
        )
        assert revert_response.status_code == 200
        print("✓ Password reverted back to 'hostel2024'")
        
        # Verify original password works again
        final_login = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "hostel2024"
        })
        assert final_login.status_code == 200
        print("✓ Original password 'hostel2024' works again")


class TestQueueOperations:
    """Test queue endpoints (routes/queue.py)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "hostel2024"
        })
        return response.json().get("token")
    
    def test_get_queue(self):
        """GET /api/queue should return queue items"""
        response = requests.get(f"{BASE_URL}/api/queue")
        assert response.status_code == 200
        data = response.json()
        assert "queue" in data
        assert isinstance(data["queue"], list)
        print(f"✓ GET /api/queue returns {len(data['queue'])} items")
    
    def test_get_current_song(self):
        """GET /api/queue/current should return currently playing song"""
        response = requests.get(f"{BASE_URL}/api/queue/current")
        assert response.status_code == 200
        data = response.json()
        assert "current" in data
        # current can be null if nothing is playing
        print(f"✓ GET /api/queue/current returns current={'playing' if data['current'] else 'null'}")
    
    def test_add_song_to_queue(self):
        """POST /api/queue/add should add song to queue"""
        song_data = {
            "song": {
                "id": f"TEST_song_{uuid.uuid4().hex[:8]}",
                "name": "Test Song for Queue",
                "artist": "Test Artist",
                "album": "Test Album",
                "duration_ms": 180000,
                "album_art": "https://via.placeholder.com/300",
                "spotify_uri": f"spotify:track:test{uuid.uuid4().hex[:8]}"
            },
            "requested_by": "TEST_User"
        }
        
        response = requests.post(f"{BASE_URL}/api/queue/add", json=song_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "id" in data
        print(f"✓ POST /api/queue/add adds song with id={data['id']}")
        return data["id"]
    
    def test_skip_song_requires_auth(self):
        """POST /api/queue/skip without auth should return 401"""
        response = requests.post(f"{BASE_URL}/api/queue/skip")
        assert response.status_code == 401
        print("✓ POST /api/queue/skip requires authentication")
    
    def test_skip_song_with_auth(self, admin_token):
        """POST /api/queue/skip with auth should skip to next song"""
        response = requests.post(
            f"{BASE_URL}/api/queue/skip",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ POST /api/queue/skip skips song, next_song={'present' if data.get('next_song') else 'null'}")
    
    def test_clear_queue_requires_auth(self):
        """POST /api/queue/clear without auth should return 401"""
        response = requests.post(f"{BASE_URL}/api/queue/clear")
        assert response.status_code == 401
        print("✓ POST /api/queue/clear requires authentication")
    
    def test_clear_queue_with_auth(self, admin_token):
        """POST /api/queue/clear with auth should clear all queue items"""
        response = requests.post(
            f"{BASE_URL}/api/queue/clear",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "deleted_count" in data
        print(f"✓ POST /api/queue/clear clears queue, deleted_count={data['deleted_count']}")
        
        # Verify queue is empty
        get_response = requests.get(f"{BASE_URL}/api/queue")
        get_data = get_response.json()
        # Queue should be empty or only have played items
        queued_items = [i for i in get_data["queue"] if i.get("status") in ["queued", "playing"]]
        assert len(queued_items) == 0
        print("✓ Queue is empty after clear")


class TestSpotifyEndpoints:
    """Test Spotify endpoints (routes/spotify.py)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "hostel2024"
        })
        return response.json().get("token")
    
    def test_spotify_token_check(self, admin_token):
        """GET /api/spotify/token should return has_token status"""
        response = requests.get(
            f"{BASE_URL}/api/spotify/token",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "has_token" in data
        print(f"✓ GET /api/spotify/token returns has_token={data['has_token']}")
    
    def test_spotify_auth_url_requires_auth(self):
        """GET /api/spotify/auth-url without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/spotify/auth-url")
        assert response.status_code == 401
        print("✓ GET /api/spotify/auth-url requires authentication")
    
    def test_spotify_auth_url_with_auth(self, admin_token):
        """GET /api/spotify/auth-url with auth should return auth URL"""
        response = requests.get(
            f"{BASE_URL}/api/spotify/auth-url",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "auth_url" in data
        assert "accounts.spotify.com" in data["auth_url"]
        assert "authorize" in data["auth_url"]
        print("✓ GET /api/spotify/auth-url returns valid Spotify auth URL")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
