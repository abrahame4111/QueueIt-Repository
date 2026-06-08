"""
Test suite for QueueIt Venue Filters feature
Tests:
- GET /api/filters - returns current venue filter config (public endpoint)
- GET /api/filters/presets - returns all presets and genre/mood lists (public)
- PUT /api/filters - update filters with preset or custom genres (requires admin auth)
- PUT /api/filters with mode toggle - switch between strict and open
- GET /api/songs/search with genre parameter
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
AUTH_TOKEN = "hostel2024"  # Admin password is the token


class TestFiltersPublicEndpoints:
    """Test public filter endpoints (no auth required)"""
    
    def test_get_filters_returns_200(self):
        """GET /api/filters should return current filter config without auth"""
        response = requests.get(f"{BASE_URL}/api/filters")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "mode" in data, "Response should contain 'mode'"
        assert "preset" in data, "Response should contain 'preset'"
        assert "genres" in data, "Response should contain 'genres'"
        assert "moods" in data, "Response should contain 'moods'"
        assert "energy" in data, "Response should contain 'energy'"
        assert "label" in data, "Response should contain 'label'"
        
        # Verify mode is valid
        assert data["mode"] in ["strict", "open"], f"Mode should be 'strict' or 'open', got {data['mode']}"
        print(f"Current filters: preset={data['preset']}, mode={data['mode']}, genres={len(data['genres'])}")
    
    def test_get_presets_returns_200(self):
        """GET /api/filters/presets should return all presets without auth"""
        response = requests.get(f"{BASE_URL}/api/filters/presets")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "presets" in data, "Response should contain 'presets'"
        assert "all_genres" in data, "Response should contain 'all_genres'"
        assert "all_moods" in data, "Response should contain 'all_moods'"
        
        presets = data["presets"]
        # Verify all 5 presets exist
        expected_presets = ["fine_dining", "club", "cafe", "bar", "open"]
        for preset_key in expected_presets:
            assert preset_key in presets, f"Preset '{preset_key}' should exist"
            preset = presets[preset_key]
            assert "label" in preset, f"Preset {preset_key} should have 'label'"
            assert "icon" in preset, f"Preset {preset_key} should have 'icon'"
            assert "genres" in preset, f"Preset {preset_key} should have 'genres'"
            assert "moods" in preset, f"Preset {preset_key} should have 'moods'"
            assert "energy" in preset, f"Preset {preset_key} should have 'energy'"
            assert "description" in preset, f"Preset {preset_key} should have 'description'"
        
        # Verify genres and moods are lists
        assert isinstance(data["all_genres"], list), "all_genres should be a list"
        assert isinstance(data["all_moods"], list), "all_moods should be a list"
        assert len(data["all_genres"]) > 0, "all_genres should not be empty"
        assert len(data["all_moods"]) > 0, "all_moods should not be empty"
        
        print(f"Presets: {list(presets.keys())}")
        print(f"Total genres: {len(data['all_genres'])}, Total moods: {len(data['all_moods'])}")


class TestFiltersAuthEndpoints:
    """Test filter update endpoints (require admin auth)"""
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": f"Bearer {AUTH_TOKEN}"}
    
    def test_put_filters_without_auth_returns_401(self):
        """PUT /api/filters without auth should return 401"""
        response = requests.put(f"{BASE_URL}/api/filters", json={"preset": "cafe"})
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_put_filters_with_preset(self, auth_headers):
        """PUT /api/filters with preset should update filters"""
        # Apply cafe preset
        response = requests.put(
            f"{BASE_URL}/api/filters",
            json={"preset": "cafe", "mode": "open"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert data.get("preset") == "cafe", f"Preset should be 'cafe', got {data.get('preset')}"
        assert data.get("label") == "Cafe Chill", f"Label should be 'Cafe Chill', got {data.get('label')}"
        assert "lo-fi" in data.get("genres", []), "Cafe preset should include 'lo-fi' genre"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/filters")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["preset"] == "cafe", "Preset should persist after update"
        print(f"Applied cafe preset: {len(data.get('genres', []))} genres, {len(data.get('moods', []))} moods")
    
    def test_put_filters_toggle_strict_mode(self, auth_headers):
        """PUT /api/filters should toggle between strict and open mode"""
        # First set to strict mode
        response = requests.put(
            f"{BASE_URL}/api/filters",
            json={"preset": "fine_dining", "mode": "strict"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("mode") == "strict", f"Mode should be 'strict', got {data.get('mode')}"
        
        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/filters")
        assert get_response.json()["mode"] == "strict", "Strict mode should persist"
        
        # Now toggle to open mode
        response = requests.put(
            f"{BASE_URL}/api/filters",
            json={"preset": "fine_dining", "mode": "open"},
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json().get("mode") == "open", "Mode should be 'open' after toggle"
        
        print("Mode toggle test passed: strict -> open")
    
    def test_put_filters_custom_genres(self, auth_headers):
        """PUT /api/filters with custom genres should work"""
        custom_genres = ["rock", "pop", "jazz"]
        custom_moods = ["energetic", "chill"]
        
        response = requests.put(
            f"{BASE_URL}/api/filters",
            json={"genres": custom_genres, "moods": custom_moods, "mode": "strict"},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("preset") == "custom", f"Preset should be 'custom', got {data.get('preset')}"
        assert set(data.get("genres", [])) == set(custom_genres), "Custom genres should match"
        assert set(data.get("moods", [])) == set(custom_moods), "Custom moods should match"
        
        print(f"Custom filter applied: {custom_genres}, {custom_moods}")
    
    def test_put_filters_all_presets(self, auth_headers):
        """Test applying all 5 presets"""
        presets_to_test = ["fine_dining", "club", "cafe", "bar", "open"]
        
        for preset_key in presets_to_test:
            response = requests.put(
                f"{BASE_URL}/api/filters",
                json={"preset": preset_key, "mode": "open"},
                headers=auth_headers
            )
            assert response.status_code == 200, f"Failed to apply preset '{preset_key}': {response.text}"
            data = response.json()
            assert data.get("preset") == preset_key, f"Preset should be '{preset_key}'"
            print(f"Preset '{preset_key}' applied successfully")


class TestSongsSearchWithGenre:
    """Test song search endpoint with genre parameter"""
    
    def test_search_without_genre(self):
        """GET /api/songs/search should work without genre"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=love")
        # May return 500 if Spotify not configured, but endpoint should exist
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "songs" in data, "Response should contain 'songs'"
            print(f"Search returned {len(data['songs'])} songs")
    
    def test_search_with_genre_parameter(self):
        """GET /api/songs/search should accept genre parameter"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=love&genre=jazz")
        # May return 500 if Spotify not configured, but endpoint should exist
        assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "songs" in data, "Response should contain 'songs'"
            print(f"Search with genre=jazz returned {len(data['songs'])} songs")


class TestFiltersCleanup:
    """Cleanup: Reset filters to fine_dining strict mode (as per agent context)"""
    
    def test_reset_to_fine_dining_strict(self):
        """Reset filters to fine_dining preset in strict mode"""
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = requests.put(
            f"{BASE_URL}/api/filters",
            json={"preset": "fine_dining", "mode": "strict"},
            headers=headers
        )
        assert response.status_code == 200, f"Failed to reset filters: {response.text}"
        
        data = response.json()
        assert data.get("preset") == "fine_dining"
        assert data.get("mode") == "strict"
        print("Filters reset to fine_dining strict mode")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
