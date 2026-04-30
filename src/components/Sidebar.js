import React from 'react';
import '../styles/Dashboard.css';

function Sidebar({ role }) {
  return (
    <div className="sidebar">
      <h2 className="logo">Yashodhan Traders</h2>

      <ul>
        {role === 'admin' ? (
          <>
            <li>Dashboard</li>
            <li>Employees</li>
            <li>Attendance</li>
            <li>Check-In Status</li>
            <li>Add Employee</li>
            <li>Reports</li>
            <li>Logout</li>
          </>
        ) : (
          <>
            <li>Dashboard</li>
            <li>Check-In</li>
            <li>Check-Out</li>
            <li>Attendance History</li>
            <li>Profile</li>
            <li>Logout</li>
          </>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;