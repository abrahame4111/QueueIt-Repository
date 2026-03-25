import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerHome from '@/pages/CustomerHome';
import AdminDashboard from '@/pages/AdminDashboard';
import DownloadPage from '@/pages/DownloadPage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DownloadPage />} />
          <Route path="/downloads" element={<DownloadPage />} />
          <Route path="/request" element={<CustomerHome />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
