"""
QueueIt Backend API Tests - Testing new features:
- Admin login flow
- Download website endpoint
- PWA manifest
- Queue management
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "hostel2024"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["token"] == "hostel2024"
        print("✓ Admin login with correct password works")
    
    def test_admin_login_invalid_password(self):
        """Test admin login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Admin login rejects invalid password")


class TestDownloadWebsite:
    """Download/marketing website tests"""
    
    def test_download_website_accessible(self):
        """Test that /api/download serves the marketing website"""
        response = requests.get(f"{BASE_URL}/api/download")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        
        # Check for key content
        content = response.text
        assert "QueueIt" in content
        assert "Let Your Guests" in content
        assert "DJ" in content
        print("✓ Download website is accessible at /api/download")
    
    def test_download_website_has_navigation(self):
        """Test that download website has proper navigation"""
        response = requests.get(f"{BASE_URL}/api/download")
        content = response.text
        
        assert "Features" in content
        assert "How It Works" in content
        assert "Download" in content
        print("✓ Download website has navigation elements")
    
    def test_download_website_has_hero_section(self):
        """Test that download website has hero section"""
        response = requests.get(f"{BASE_URL}/api/download")
        content = response.text
        
        assert "hero" in content.lower()
        assert "smart music queue system" in content.lower()
        print("✓ Download website has hero section")
    
    def test_download_website_has_features_section(self):
        """Test that download website has features section"""
        response = requests.get(f"{BASE_URL}/api/download")
        content = response.text
        
        assert "QR Code" in content
        assert "Real-Time Queue" in content or "Real-Time" in content
        assert "Spotify" in content
        print("✓ Download website has features section")
    
    def test_download_website_css_accessible(self):
        """Test that CSS assets are accessible"""
        response = requests.get(f"{BASE_URL}/api/download-assets/css/style.css")
        assert response.status_code == 200
        assert "text/css" in response.headers.get("content-type", "")
        print("✓ Download website CSS is accessible")


class TestPWAManifest:
    """PWA manifest tests"""
    
    def test_manifest_accessible(self):
        """Test that manifest.json is accessible"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        print("✓ PWA manifest is accessible")
    
    def test_manifest_has_required_fields(self):
        """Test that manifest has required PWA fields"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        data = response.json()
        
        assert "name" in data
        assert "short_name" in data
        assert "icons" in data
        assert "start_url" in data
        assert "display" in data
        
        assert data["name"] == "QueueIt - Music Queue System"
        assert data["short_name"] == "QueueIt"
        assert data["display"] == "standalone"
        print("✓ PWA manifest has all required fields")
    
    def test_manifest_has_icons(self):
        """Test that manifest has proper icons"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        data = response.json()
        
        icons = data.get("icons", [])
        assert len(icons) >= 2
        
        # Check for 192x192 and 512x512 icons
        sizes = [icon.get("sizes") for icon in icons]
        assert "192x192" in sizes
        assert "512x512" in sizes
        print("✓ PWA manifest has proper icons")


class TestCustomerPortal:
    """Customer portal tests"""
    
    def test_api_root_accessible(self):
        """Test that API root is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ API root is accessible")
    
    def test_queue_endpoint(self):
        """Test queue endpoint"""
        response = requests.get(f"{BASE_URL}/api/queue")
        assert response.status_code == 200
        data = response.json()
        assert "queue" in data
        print("✓ Queue endpoint works")
    
    def test_current_song_endpoint(self):
        """Test current song endpoint"""
        response = requests.get(f"{BASE_URL}/api/queue/current")
        assert response.status_code == 200
        data = response.json()
        assert "current" in data
        print("✓ Current song endpoint works")
    
    def test_playlists_endpoint(self):
        """Test playlists endpoint"""
        response = requests.get(f"{BASE_URL}/api/songs/playlists")
        assert response.status_code == 200
        data = response.json()
        assert "playlists" in data
        print("✓ Playlists endpoint works")
    
    def test_search_endpoint(self):
        """Test song search endpoint"""
        response = requests.get(f"{BASE_URL}/api/songs/search?q=test")
        assert response.status_code == 200
        data = response.json()
        assert "songs" in data
        print("✓ Song search endpoint works")


class TestQueueManagement:
    """Queue management tests with admin authentication"""
    
    def get_admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "hostel2024"
        })
        return response.json().get("token")
    
    def test_add_song_to_queue(self):
        """Test adding a song to queue"""
        song_data = {
            "song": {
                "id": "TEST_song_123",
                "name": "Test Song",
                "artist": "Test Artist",
                "album": "Test Album",
                "duration_ms": 180000,
                "album_art": "https://via.placeholder.com/300",
                "spotify_uri": "spotify:track:test123"
            },
            "requested_by": "Test User"
        }
        
        response = requests.post(f"{BASE_URL}/api/queue/add", json=song_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Add song to queue works")
    
    def test_skip_song_requires_auth(self):
        """Test that skip requires authentication"""
        response = requests.post(f"{BASE_URL}/api/queue/skip")
        assert response.status_code == 401
        print("✓ Skip song requires authentication")
    
    def test_skip_song_with_auth(self):
        """Test skip song with authentication"""
        token = self.get_admin_token()
        response = requests.post(
            f"{BASE_URL}/api/queue/skip",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Skip song with auth works")
    
    def test_clear_queue_requires_auth(self):
        """Test that clear queue requires authentication"""
        response = requests.post(f"{BASE_URL}/api/queue/clear")
        assert response.status_code == 401
        print("✓ Clear queue requires authentication")
    
    def test_clear_queue_with_auth(self):
        """Test clear queue with authentication"""
        token = self.get_admin_token()
        response = requests.post(
            f"{BASE_URL}/api/queue/clear",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Clear queue with auth works")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
