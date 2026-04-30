import React, { useState, useEffect } from 'react';
import '../styles/Employee.css';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import AttendanceHistory from './AttendanceHistory';
import Profile from './Profile';

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  const employeeId = localStorage.getItem('employeeId');
  const username = localStorage.getItem('employeename');

  // ---------------- LOCATION ----------------
 const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error.message),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  });
};

  // ---------------- FETCH TODAY ATTENDANCE ----------------
  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get(`/attendance/today/${employeeId}`);
      setTodayAttendance(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  // ---------------- CHECK IN ----------------
  const checkIn = async () => {
    if (todayAttendance) {
      alert('Already checked in today');
      return;
    }

    try {
      setLoading(true);

      const location = await getCurrentLocation();

      const res = await api.post(
        `/attendance/checkin/${employeeId}`,
        {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      );

      setTodayAttendance(res.data);
      localStorage.setItem('attendanceId', res.data.id);

      alert('Checked In Successfully');
    } catch (error) {
  console.log('CHECKIN ERROR:', error);

  alert(
    error?.message ||
    JSON.stringify(error) ||
    'Check In Failed or Location denied'
  );
}finally {
      setLoading(false);
    }
  };

  // ---------------- CHECK OUT ----------------
  const checkOut = async () => {
    if (!todayAttendance) {
      alert("You haven't checked in today");
      return;
    }

    if (todayAttendance.checkOutTime) {
      alert('Already checked out today');
      return;
    }

    try {
      setLoading(true);

      const location = await getCurrentLocation();

      const res = await api.put(
        `/attendance/checkout/${todayAttendance.id}`,
        {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      );

      setTodayAttendance(res.data);

      alert('Checked Out Successfully');
    } catch (error) {
      console.log(error);
      alert('Check Out Failed or Location denied');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  // ---------------- UI ----------------
  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2>Employee Panel</h2>}

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
          <h2>Employee Dashboard</h2>

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
                  onClick={logout}
                  className="logout-btn"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PAGE CONTENT */}
        {activePage === 'attendance' ? (
          <AttendanceHistory employeeId={employeeId} />
        ) : activePage === 'profile' ? (
          <Profile id={employeeId} role="employee" />
        ) : (
          <div className="cards-container">

            {/* CHECK IN */}
            <div className="card">
              <h3>Check In</h3>
              <button
                onClick={checkIn}
                disabled={loading || todayAttendance}
              >
                {loading ? 'Processing...' : 'Check In'}
              </button>
            </div>

            {/* CHECK OUT */}
            <div className="card">
              <h3>Check Out</h3>
              <button
                onClick={checkOut}
                disabled={
                  loading ||
                  !todayAttendance ||
                  todayAttendance?.checkOutTime
                }
              >
                {loading ? 'Processing...' : 'Check Out'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;