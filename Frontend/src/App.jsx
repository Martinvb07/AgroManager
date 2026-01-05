import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './views/Landing.jsx';
import Login from './views/Login.jsx';
import CropManagementDashboard from './views/CropManagementDashboard.jsx';
import CampanaDetail from './views/CampanaDetail.jsx';
import OwnerDashboard from './views/OwnerDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/admin" element={<CropManagementDashboard />} />
        <Route path="/admin/campanas/:id" element={<CampanaDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
