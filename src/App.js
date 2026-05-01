import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import Register from './components/Register';
import Footer from './components/Footer'; // Import Footer

// Protected Route
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/register" element={<Register />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;