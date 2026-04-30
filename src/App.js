import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import Register from './components/Register';


// Protected Route
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;