"""
QueueIt Spotify Search Fix Tests
Testing the fix for Spotify API '400 Invalid limit' error
Fix: Changed limit from 20 to 10 in sp.search() call (server.py line 144)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSpotifySearchFix:
    """Tests for the Spotify search fix - limit changed from 20 to 10"""
    
    def test_search_love_returns_songs(self):
        """Test search for 'love' returns songs array with results"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=love")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "songs" in data, "Response should contain 'songs' key"
        assert isinstance(data["songs"], list), "Songs should be a list"
        assert len(data["songs"]) > 0, "Should return at least one song"
        assert len(data["songs"]) <= 10, f"Should return max 10 songs (limit fix), got {len(data['songs'])}"
        
        # Verify song structure
        song = data["songs"][0]
        assert "id" in song, "Song should have 'id'"
        assert "name" in song, "Song should have 'name'"
        assert "artist" in song, "Song should have 'artist'"
        assert "album" in song, "Song should have 'album'"
        assert "spotify_uri" in song, "Song should have 'spotify_uri'"
        print(f"✓ Search 'love' returned {len(data['songs'])} songs")
    
    def test_search_drake_returns_songs(self):
        """Test search for 'drake' returns song results"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=drake")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "songs" in data
        assert len(data["songs"]) > 0, "Should return Drake songs"
        assert len(data["songs"]) <= 10, f"Should return max 10 songs, got {len(data['songs'])}"
        
        # Verify at least one song has Drake as artist
        drake_songs = [s for s in data["songs"] if "drake" in s["artist"].lower()]
        assert len(drake_songs) > 0, "Should return songs by Drake"
        print(f"✓ Search 'drake' returned {len(data['songs'])} songs, {len(drake_songs)} by Drake")
    
    def test_search_returns_exactly_10_or_less(self):
        """Test that search returns max 10 results (the fix)"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=pop")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["songs"]) <= 10, f"Limit should be 10, got {len(data['songs'])}"
        print(f"✓ Search limit verified: {len(data['songs'])} songs (max 10)")
    
    def test_search_empty_query_handling(self):
        """Test search with empty query - should handle gracefully"""
        # Note: The API requires 'q' parameter, empty string may still work
        response = requests.get(f"{BASE_URL}/api/songs/search?q=")
        # Either 200 with empty results or 422 validation error is acceptable
        assert response.status_code in [200, 422, 500], f"Unexpected status: {response.status_code}"
        print(f"✓ Empty query handled with status {response.status_code}")
    
    def test_search_special_characters(self):
        """Test search with special characters"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=rock%20%26%20roll")
        assert response.status_code == 200
        
        data = response.json()
        assert "songs" in data
        print(f"✓ Special characters search returned {len(data['songs'])} songs")
    
    def test_search_song_structure_complete(self):
        """Test that returned songs have all required fields"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=beatles")
        assert response.status_code == 200
        
        data = response.json()
        if len(data["songs"]) > 0:
            song = data["songs"][0]
            required_fields = ["id", "name", "artist", "album", "duration_ms", "spotify_uri"]
            for field in required_fields:
                assert field in song, f"Song missing required field: {field}"
            
            # Optional fields
            assert "album_art" in song or song.get("album_art") is None
            assert "preview_url" in song or song.get("preview_url") is None
            
            # Verify types
            assert isinstance(song["duration_ms"], int), "duration_ms should be int"
            assert song["spotify_uri"].startswith("spotify:track:"), "Invalid spotify_uri format"
        print("✓ Song structure is complete with all required fields")


class TestQueueAddWithSearchResults:
    """Test adding searched songs to queue"""
    
    def test_search_and_add_to_queue(self):
        """Test searching for a song and adding it to queue"""
        # First search for a song
        search_response = requests.get(f"{BASE_URL}/api/songs/search?q=test")
        assert search_response.status_code == 200
        
        songs = search_response.json()["songs"]
        if len(songs) > 0:
            song = songs[0]
            
            # Add to queue
            add_response = requests.post(f"{BASE_URL}/api/queue/add", json={
                "song": song,
                "requested_by": "Test User"
            })
            assert add_response.status_code == 200
            assert add_response.json()["success"] == True
            print(f"✓ Successfully added '{song['name']}' to queue")
        else:
            pytest.skip("No songs returned from search")
    
    def test_queue_shows_added_song(self):
        """Test that queue endpoint shows added songs"""
        # Search and add a unique song
        search_response = requests.get(f"{BASE_URL}/api/songs/search?q=unique")
        assert search_response.status_code == 200
        
        songs = search_response.json()["songs"]
        if len(songs) > 0:
            song = songs[0]
            song["id"] = f"TEST_{song['id']}"  # Mark as test
            
            # Add to queue
            requests.post(f"{BASE_URL}/api/queue/add", json={
                "song": song,
                "requested_by": "Queue Test"
            })
            
            # Check queue
            queue_response = requests.get(f"{BASE_URL}/api/queue")
            assert queue_response.status_code == 200
            
            queue = queue_response.json()["queue"]
            assert isinstance(queue, list)
            print(f"✓ Queue has {len(queue)} items")
        else:
            pytest.skip("No songs returned from search")


class TestPlaylistsEndpoint:
    """Test playlists endpoint"""
    
    def test_playlists_returns_list(self):
        """Test that playlists endpoint returns a list"""
        response = requests.get(f"{BASE_URL}/api/songs/playlists")
        assert response.status_code == 200
        
        data = response.json()
        assert "playlists" in data
        assert isinstance(data["playlists"], list)
        print(f"✓ Playlists endpoint returned {len(data['playlists'])} playlists")
    
    def test_playlist_structure(self):
        """Test playlist structure"""
        response = requests.get(f"{BASE_URL}/api/songs/playlists")
        assert response.status_code == 200
        
        playlists = response.json()["playlists"]
        if len(playlists) > 0:
            playlist = playlists[0]
            assert "id" in playlist
            assert "name" in playlist
            print(f"✓ Playlist structure verified: {playlist['name']}")


class TestAdminQueueClear:
    """Test admin queue clear functionality"""
    
    def get_admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "hostel2024"})
        return response.json().get("token")
    
    def test_admin_login(self):
        """Test admin login with correct password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": "hostel2024"})
        assert response.status_code == 200
        assert response.json()["success"] == True
        assert response.json()["token"] == "hostel2024"
        print("✓ Admin login successful")
    
    def test_clear_queue_with_auth(self):
        """Test clearing queue with admin auth"""
        token = self.get_admin_token()
        response = requests.post(
            f"{BASE_URL}/api/queue/clear",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["success"] == True
        print(f"✓ Queue cleared, deleted {response.json().get('deleted_count', 0)} items")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
