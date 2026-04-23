import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerHome from '@/pages/CustomerHome';
import AdminDashboard from '@/pages/AdminDashboard';
import DownloadPage from '@/pages/DownloadPage';
import PostDownloadPage from '@/pages/PostDownloadPage';
import StarterKit from '@/pages/StarterKit';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DownloadPage />} />
          <Route path="/downloads" element={<DownloadPage />} />
          <Route path="/downloads/thanks" element={<PostDownloadPage />} />
          <Route path="/request" element={<CustomerHome />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/starter-kit" element={<StarterKit />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
