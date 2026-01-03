import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './views/Landing.jsx';
import Login from './views/Login.jsx';
import CropManagementDashboard from './views/CropManagementDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<CropManagementDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
