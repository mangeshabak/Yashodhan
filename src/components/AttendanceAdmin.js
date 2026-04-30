import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AttendanceAdmin.css';
import api from '../services/api';

function AttendanceAdmin() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState('summary');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [mapData, setMapData] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ---------------- FETCH ----------------
  const fetchAttendance = async () => {
  try {
    setLoading(true);

    const res = await api.get('/attendance/all');

    setAttendance(res.data);
  } catch (err) {
    console.error('Attendance fetch error:', err);
  } finally {
    setLoading(false);
  }
};

  // ---------------- WORK HOURS FIX (MAIN FIX) ----------------
  const calculateMinutes = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;

    const diffMs = new Date(checkOut) - new Date(checkIn);

    if (diffMs < 0) return 0;

    return diffMs / 60000;
  };

  const formatWorkHours = (checkIn, checkOut) => {
    const minutes = calculateMinutes(checkIn, checkOut);

    if (!minutes) return '-';

    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);

    return `${hours}h ${mins}m`;
  };

  // ---------------- MAP ----------------
  const MapView = ({ lat, lng }) => {
    if (!lat || !lng) return <p style={{ fontSize: '12px' }}>No location</p>;

    return (
      <iframe
        width="100%"
        height="180"
        style={{ border: 0, borderRadius: '8px' }}
        loading="lazy"
        src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
      />
    );
  };

  // ---------------- FILTER ----------------
  const filteredAttendance = attendance.filter((a) =>
    a.attendanceDate?.startsWith(selectedMonth)
  );

  // ---------------- SUMMARY ----------------
  const getSummary = () => {
    const map = {};

    filteredAttendance.forEach((a) => {
      const name = a.employeeName;

      if (!map[name]) {
        map[name] = {
          employeeName: name,
          records: [],
          present: 0,
          totalMinutes: 0,
        };
      }

      map[name].records.push(a);

      if (a.checkInTime) map[name].present++;

      map[name].totalMinutes += calculateMinutes(
        a.checkInTime,
        a.checkOutTime
      );
    });

    return Object.values(map);
  };

  // ---------------- UI ----------------
  return (
    <div className="attendance-page">

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading attendance...</p>
        </div>
      ) : (
        <>
          {/* ---------------- SUMMARY ---------------- */}
          {view === 'summary' && (
            <>
              <div className="attendance-header">

                <div>
                  <h2>Attendance Dashboard</h2>
                  <p className="subtitle">
                    Monthly Employee Attendance Summary
                  </p>
                </div>

                <div className="filter-box">

                  <div className="month-wrapper">
                    <label>Select Month</label>

                    <input
                      type="month"
                      value={selectedMonth}
                      max={currentMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="month-picker"
                    />
                  </div>

                  <button
                    className="current-btn"
                    onClick={() => setSelectedMonth(currentMonth)}
                  >
                    Current Month
                  </button>
                </div>
              </div>

              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Present</th>
                      <th>Total Hours</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {getSummary().map((emp, index) => (
                      <tr key={index}>
                        <td>{emp.employeeName}</td>
                        <td>{emp.present}</td>

                        <td>
                          {emp.totalMinutes
                            ? `${Math.floor(emp.totalMinutes / 60)}h ${Math.floor(emp.totalMinutes % 60)}m`
                            : '-'}
                        </td>

                        <td>
                          <button
                            className="view-btn"
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setView('detail');
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ---------------- DETAIL ---------------- */}
          {view === 'detail' && selectedEmployee && (
            <>
              <button
                className="back-btn"
                onClick={() => setView('summary')}
              >
                ← Back
              </button>

              <div className="detail-header">
                <h2>{selectedEmployee.employeeName}</h2>
                <p>Attendance Details</p>
              </div>

              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Work Hours</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedEmployee.records.map((a, i) => (
                      <tr key={i}>
                        <td>{a.attendanceDate}</td>
                        <td>{a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : '-'}</td>
                        <td>{a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : '-'}</td>

                        <td>
                          {formatWorkHours(a.checkInTime, a.checkOutTime)}
                        </td>

                        <td>
                          <button
                            className="view-btn"
                            onClick={() => setMapData(a)}
                          >
                            View Location
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ---------------- MAP MODAL ---------------- */}
          {mapData && (
            <div className="modal-overlay" onClick={() => setMapData(null)}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Attendance Location</h2>

                <p><b>Date:</b> {mapData.attendanceDate}</p>

                <h3>Check-In Location</h3>
                <MapView
                  lat={mapData.checkInLatitude}
                  lng={mapData.checkInLongitude}
                />

                <h3>Check-Out Location</h3>
                <MapView
                  lat={mapData.checkOutLatitude}
                  lng={mapData.checkOutLongitude}
                />

                <button
                  className="close-btn"
                  onClick={() => setMapData(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}

export default AttendanceAdmin;