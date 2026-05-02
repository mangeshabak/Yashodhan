import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/DashboardDetails.css';

function DashboardDetails({ type, onBack }) {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [type]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/attendance/stats/details/${type}`
      );

      setEmployees(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'total':
        return 'Total Employees';

      case 'present':
        return 'Present Employees';

      case 'absent':
        return 'Absent Employees';

      case 'checkin':
        return 'Checked-In Employees';

      case 'checkout':
        return 'Checked-Out Employees';

      default:
        return 'Employees';
    }
  };

  return (
    <div className="dashboard-details-page">

      <div className="details-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <h2>{getTitle()}</h2>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading Employees...</p>
        </div>
      ) : (
        <div className="details-table-card">

          <table className="details-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Last Name</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.firstname}</td>
                    <td>{emp.middlename || '-'}</td>
                    <td>{emp.lastname}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          emp.status === 'Present'
                            ? 'present'
                            : 'absent'
                        }`}
                      >
                        {emp.status || 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}

export default DashboardDetails;