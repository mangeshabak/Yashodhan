import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/AttendanceHistory.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function AttendanceHistory({ employeeId }) {
  const currentMonth = new Date().getMonth() + 1;

  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/attendance/history/${employeeId}?month=${selectedMonth}`
      );

      setAttendanceList(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = attendanceList.reduce((sum, item) => {
    if (item.checkInTime && item.checkOutTime) {
      const checkIn = new Date(item.checkInTime);
      const checkOut = new Date(item.checkOutTime);

      const diffMs = checkOut - checkIn;
      const hours = diffMs / (1000 * 60 * 60);

      return sum + hours;
    }
    return sum;
  }, 0);

  const formatHours = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.floor((decimalHours - hours) * 60);

    return `${hours}h ${minutes}m`;
  };

  const presentCount = attendanceList.length;

  const daysInMonth = new Date(
    new Date().getFullYear(),
    selectedMonth,
    0
  ).getDate();

  const absentCount = daysInMonth - presentCount;

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(attendanceList);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const data = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });

    saveAs(data, 'Attendance.xlsx');
  };

  const openDeleteModal = (id) => {
    setSelectedAttendanceId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.post(`/attendance/delete/${selectedAttendanceId}`);

      setAttendanceList((prev) =>
        prev.filter((item) => item.id !== selectedAttendanceId)
      );

      setShowDeleteModal(false);
      setSelectedAttendanceId(null);
    } catch (error) {
      console.log(error);
      alert('Failed to delete attendance');
    }
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setSelectedAttendanceId(null);
  };
  return (
    <div className="attendance-container">
      {/* HEADER */}
      <div className="attendance-header">
        <h2>Attendance History</h2>

        <div className="toolbar-actions">
          <select
            className="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <button onClick={exportToExcel} className="export-btn">
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading Attendance...</p>
        </div>
      ) : (
        <>
          {/* SUMMARY */}
          <div className="attendance-summary">
            <div>
              <h4>Total Work Hours</h4>
              <p>{formatHours(totalHours)}</p>
            </div>

            <div>
              <h4>Present Days</h4>
              <p>{presentCount}</p>
            </div>

            <div>
              <h4>Absent Days</h4>
              <p>{absentCount}</p>
            </div>
          </div>

          {/* TABLE */}
          <table className="attendance-table">
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
              {attendanceList.map((item, index) => (
                <tr key={index}>
                  <td>{item.attendanceDate}</td>

                  <td>
                    {item.checkInTime
                      ? new Date(item.checkInTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                      : '-'}
                  </td>

                  <td>
                    {item.checkOutTime
                      ? new Date(item.checkOutTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                      : '-'}
                  </td>

                  <td>
                    {item.checkInTime && item.checkOutTime
                      ? (() => {
                        const checkIn = new Date(item.checkInTime);
                        const checkOut = new Date(item.checkOutTime);

                        const diffMs = checkOut - checkIn;

                        const hours = Math.floor(
                          diffMs / (1000 * 60 * 60)
                        );

                        const minutes = Math.floor(
                          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                        );

                        return `${hours}h ${minutes}m`;
                      })()
                      : '-'}
                  </td>
                  {/* DELETE */}
                  <td>
                    <div className="icon-wrapper">
                      <button
                        className="icon-btn delete"
                        onClick={() => openDeleteModal(item.id)}
                      >
                        🗑️
                      </button>

                      <span className="icon-label">Delete</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Attendance</h3>
            <p>Are you sure you want to delete this entry?</p>

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>

              <button className="confirm-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceHistory;