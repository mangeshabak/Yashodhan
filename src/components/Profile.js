import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Profile.css';

function Profile({ id, role }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      let url = '';

      if (role === 'employee') {
        url = `/users/profile/${id}`;
      } else if (role === 'admin') {
        url = `/users/profile/${id}`;
      }

      const res = await api.get(url);
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">

        <h2 className="profile-title">
          {role === 'admin' ? 'Admin Profile' : 'Employee Profile'}
        </h2>

        <div className="profile-grid">

          <div className="profile-field">
            <label>ID</label>
            <div className="profile-box">{user.id}</div>
          </div>

          <div className="profile-field">
            <label>First Name</label>
            <div className="profile-box">{user.firstname}</div>
          </div>

            <div className="profile-field">
            <label>Middle Name</label>
            <div className="profile-box">{user.middlename}</div>
          </div>

          <div className="profile-field">
            <label>Last Name</label>
            <div className="profile-box">{user.lastname}</div>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <div className="profile-box">{user.email}</div>
          </div>

          <div className="profile-field">
            <label>Mobile</label>
            <div className="profile-box">{user.mobileNo || '-'}</div>
          </div>

          <div className="profile-field">
            <label>Date of Birth</label>
            <div className="profile-box">
              {user.dob ? new Date(user.dob).toLocaleDateString() : '-'}
            </div>
          </div>

          <div className="profile-field full-width">
            <label>Address</label>
            <div className="profile-box">{user.address}</div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;