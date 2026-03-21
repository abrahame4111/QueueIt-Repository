import requests
import sys
import json
from datetime import datetime

class HostelMusicQueueTester:
    def __init__(self, base_url="https://queue-it-preview.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200 and "Hostel Music Queue API" in response.text
            self.log_test("API Root", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_admin_login(self):
        """Test admin login"""
        try:
            response = requests.post(
                f"{self.api_url}/admin/login",
                json={"password": "hostel2024"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.admin_token = data["token"]
                    self.log_test("Admin Login", True)
                    return True
            
            self.log_test("Admin Login", False, f"Status: {response.status_code}")
            return False
        except Exception as e:
            self.log_test("Admin Login", False, str(e))
            return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid password"""
        try:
            response = requests.post(
                f"{self.api_url}/admin/login",
                json={"password": "wrongpassword"},
                timeout=10
            )
            success = response.status_code == 401
            self.log_test("Admin Login Invalid", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Admin Login Invalid", False, str(e))
            return False

    def test_spotify_search(self):
        """Test Spotify song search"""
        try:
            response = requests.get(
                f"{self.api_url}/songs/search?q=believer",
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                songs = data.get("songs", [])
                success = len(songs) > 0 and all(
                    "id" in song and "name" in song and "artist" in song 
                    for song in songs
                )
                self.log_test("Spotify Search", success, f"Found {len(songs)} songs")
                return success, songs[:1] if songs else []
            
            self.log_test("Spotify Search", False, f"Status: {response.status_code}")
            return False, []
        except Exception as e:
            self.log_test("Spotify Search", False, str(e))
            return False, []

    def test_get_playlists(self):
        """Test get playlists"""
        try:
            response = requests.get(f"{self.api_url}/songs/playlists", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                playlists = data.get("playlists", [])
                success = len(playlists) > 0 and all(
                    "id" in playlist and "name" in playlist 
                    for playlist in playlists
                )
                self.log_test("Get Playlists", success, f"Found {len(playlists)} playlists")
                return success, playlists[:1] if playlists else []
            
            self.log_test("Get Playlists", False, f"Status: {response.status_code}")
            return False, []
        except Exception as e:
            self.log_test("Get Playlists", False, str(e))
            return False, []

    def test_get_playlist_tracks(self, playlist_id):
        """Test get playlist tracks"""
        try:
            response = requests.get(
                f"{self.api_url}/songs/playlist/{playlist_id}",
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                songs = data.get("songs", [])
                success = len(songs) > 0
                self.log_test("Get Playlist Tracks", success, f"Found {len(songs)} tracks")
                return success, songs[:1] if songs else []
            
            self.log_test("Get Playlist Tracks", False, f"Status: {response.status_code}")
            return False, []
        except Exception as e:
            self.log_test("Get Playlist Tracks", False, str(e))
            return False, []

    def test_add_to_queue(self, song):
        """Test adding song to queue"""
        try:
            response = requests.post(
                f"{self.api_url}/queue/add",
                json={
                    "song": song,
                    "requested_by": "Test User"
                },
                timeout=10
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get("success", False)
            
            self.log_test("Add to Queue", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Add to Queue", False, str(e))
            return False

    def test_get_queue(self):
        """Test get queue"""
        try:
            response = requests.get(f"{self.api_url}/queue", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                queue = data.get("queue", [])
                success = isinstance(queue, list)
                self.log_test("Get Queue", success, f"Queue length: {len(queue)}")
                return success, queue
            
            self.log_test("Get Queue", False, f"Status: {response.status_code}")
            return False, []
        except Exception as e:
            self.log_test("Get Queue", False, str(e))
            return False, []

    def test_get_current_song(self):
        """Test get current song"""
        try:
            response = requests.get(f"{self.api_url}/queue/current", timeout=10)
            
            success = response.status_code == 200
            current = None
            if success:
                data = response.json()
                current = data.get("current")
            
            self.log_test("Get Current Song", success, f"Status: {response.status_code}")
            return success, current
        except Exception as e:
            self.log_test("Get Current Song", False, str(e))
            return False, None

    def test_skip_song(self):
        """Test skip song (admin only)"""
        if not self.admin_token:
            self.log_test("Skip Song", False, "No admin token")
            return False
        
        try:
            response = requests.post(
                f"{self.api_url}/queue/skip",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            self.log_test("Skip Song", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Skip Song", False, str(e))
            return False

    def test_clear_queue(self):
        """Test clear queue (admin only)"""
        if not self.admin_token:
            self.log_test("Clear Queue", False, "No admin token")
            return False
        
        try:
            response = requests.post(
                f"{self.api_url}/queue/clear",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                timeout=10
            )
            
            success = response.status_code == 200
            self.log_test("Clear Queue", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Clear Queue", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🎵 Starting Hostel Music Queue Backend Tests...")
        print(f"Testing API at: {self.api_url}")
        print("=" * 60)

        # Basic API tests
        if not self.test_api_root():
            print("❌ API not accessible, stopping tests")
            return False

        # Admin authentication tests
        self.test_admin_login_invalid()
        if not self.test_admin_login():
            print("❌ Admin login failed, continuing with limited tests")

        # Spotify integration tests
        search_success, sample_songs = self.test_spotify_search()
        playlist_success, sample_playlists = self.test_get_playlists()
        
        # Test playlist tracks if we have playlists
        if sample_playlists:
            self.test_get_playlist_tracks(sample_playlists[0]["id"])

        # Queue management tests
        queue_success, queue = self.test_get_queue()
        current_success, current = self.test_get_current_song()

        # Test adding to queue if we have songs
        if sample_songs:
            self.test_add_to_queue(sample_songs[0])
            # Re-check queue after adding
            self.test_get_queue()
            self.test_get_current_song()

        # Admin operations (if authenticated)
        if self.admin_token:
            self.test_skip_song()
            # Don't clear queue in tests to avoid disrupting service
            # self.test_clear_queue()

        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")

        return self.tests_passed == self.tests_run

def main():
    tester = HostelMusicQueueTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())