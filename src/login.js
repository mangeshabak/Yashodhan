import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import api from './services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      if (role === '1') {
        navigate('/admin-dashboard', { replace: true });
      } else if (role === '2') {
        navigate('/employee-dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const login = async () => {
    localStorage.removeItem('token');

    try {
      setLoading(true);

      const response = await api.post('/auth/login', {
        username,
        password,
      });

      console.log(response.data);

      const token = response.data.token;
      const role = response.data.role;
      const employeeId = response.data.userId;
      const employeename = response.data.employeename;
      const id = response.data.id;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('employeeId', employeeId);
      localStorage.setItem('employeename', employeename);
      localStorage.setItem('adminId', id);

      if (role === '1') {
        navigate('/admin-dashboard', { replace: true });
      } else if (role === '2') {
        navigate('/employee-dashboard', { replace: true });
      }

    } catch (error) {
      alert('Invalid Login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="overlay"></div>

      <div className="login-card">
        <h1 className="company-name">Yashodhan Energy Solution</h1>

        <p className="welcome-text">Login Portal</p>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        <button
          onClick={login}
          className="login-button"
          disabled={loading}
        >
          {loading ? <div className="loader"></div> : 'Login'}
        </button>

        <button
          onClick={() => navigate('/register')}
          className="login-button"
          style={{ marginTop: '10px', backgroundColor: '#555' }}
        >
          Register
        </button>

        {/* <p className="copyright">
          © 2026 Yashodhan Energy Solution. All Rights Reserved.
        </p> */}
      </div>
    </div>
  );
}

export default Login;