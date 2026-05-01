import React, { useState, useEffect, useRef } from 'react';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Employee from './Employee';
import AttendanceAdmin from './AttendanceAdmin';
import Profile from './Profile';
import api from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const statsFetched = useRef(false);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    checkedIn: 0,
    checkedOut: 0,
  });

  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem('employeename');

  const logout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };


  useEffect(() => {
  if (activePage === 'dashboard' && !statsFetched.current) {
    statsFetched.current = true;
    fetchDashboardStats();
  }
}, [activePage]);
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const response = await api.get('/attendance/stats');

      setStats({
        totalEmployees: response.data.totalEmployees,
        presentToday: response.data.presentToday,
        absentToday: response.data.absentToday,
        checkedIn: response.data.checkedIn,
        checkedOut: response.data.checkedOut,
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container admin-theme">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2>Admin Panel</h2>}

          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        <ul>
          <li
            className={activePage === 'dashboard' ? 'active' : ''}
            onClick={() => setActivePage('dashboard')}
          >
            🏠 {sidebarOpen && 'Dashboard'}
          </li>

          <li
            className={activePage === 'employee' ? 'active' : ''}
            onClick={() => setActivePage('employee')}
          >
            👥 {sidebarOpen && 'Employees'}
          </li>

          <li
            className={activePage === 'attendance' ? 'active' : ''}
            onClick={() => setActivePage('attendance')}
          >
            📅 {sidebarOpen && 'Attendance'}
          </li>

          <li
            className={activePage === 'profile' ? 'active' : ''}
            onClick={() => setActivePage('profile')}
          >
            👤 {sidebarOpen && 'Profile'}
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className={`main-content ${sidebarOpen ? '' : 'full'}`}>
        {/* NAVBAR */}
        <div className="navbar">
          <div className="nav-title">
            <h2>Admin Dashboard</h2>
          </div>

          <div className="profile-menu">
            <div
              className="profile-icon"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              👤
            </div>

            {profileOpen && (
              <div className="dropdown-menu">
                <p>Welcome, {username}</p>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="logout-btn"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DASHBOARD */}
        {activePage === 'dashboard' && (
          <div className="cards-container">
            {loading ? (
              <h3 style={{ padding: '20px' }}>Loading Dashboard...</h3>
            ) : (
              <>
                <div className="card">
                  <h3>Total Employees</h3>
                  <h1>{stats.totalEmployees}</h1>
                </div>

                <div className="card">
                  <h3>Present Today</h3>
                  <h1>{stats.presentToday}</h1>
                </div>

                <div className="card">
                  <h3>Absent Today</h3>
                  <h1>{stats.absentToday}</h1>
                </div>

                <div className="card">
                  <h3>Checked In</h3>
                  <h1>{stats.checkedIn}</h1>
                </div>

                <div className="card">
                  <h3>Checked Out</h3>
                  <h1>{stats.checkedOut}</h1>
                </div>
              </>
            )}
          </div>
        )}

        {activePage === 'employee' && <Employee />}

        <div style={{ display: activePage === 'attendance' ? 'block' : 'none' }}>
          <AttendanceAdmin />
        </div>

        {activePage === 'profile' && (
          <Profile
            id={localStorage.getItem('adminId')}
            role="admin"
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
