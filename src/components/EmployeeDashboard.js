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
  const [showCamera, setShowCamera] = useState(false);
const [stream, setStream] = useState(null);
const videoRef = React.useRef(null);
const canvasRef = React.useRef(null);

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

//---------------Capture Selfie--------------------------

const openCamera = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user'
      }
    });

    setStream(mediaStream);
    setShowCamera(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    }, 200);

  } catch (err) {
    alert('Camera access denied');
  }
};

const captureSelfie = () => {
  return new Promise((resolve) => {

    const canvas = canvasRef.current;
    const video = videoRef.current;

    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {

      const file = new File(
        [blob],
        'selfie.jpg',
        { type: 'image/jpeg' }
      );

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setShowCamera(false);

      resolve(file);

    }, 'image/jpeg');
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
//   const checkIn = async () => {
//     if (todayAttendance) {
//       alert('Already checked in today');
//       return;
//     }

//     try {
//       setLoading(true);

//       const location = await getCurrentLocation();

//       const res = await api.post(
//         `/attendance/checkin/${employeeId}`,
//         {
//           latitude: location.latitude,
//           longitude: location.longitude,
//         }
//       );

//       setTodayAttendance(res.data);
//       localStorage.setItem('attendanceId', res.data.id);

//       alert('Checked In Successfully');
//     } catch (error) {
//   console.log('CHECKIN ERROR:', error);

//   alert(
//     error?.message ||
//     JSON.stringify(error) ||
//     'Check In Failed or Location denied'
//   );
// }finally {
//       setLoading(false);
//     }
//   };
const checkIn = async () => {
  if (todayAttendance) {
    alert('Already checked in today');
    return;
  }

  try {
    setLoading(true);

    const location = await getCurrentLocation();

    // Open Camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user'
      }
    });

    // Create popup container
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    const container = document.createElement('div');
    container.style.background = '#fff';
    container.style.padding = '20px';
    container.style.borderRadius = '12px';

    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = stream;
    video.style.width = '350px';

    const button = document.createElement('button');
    button.innerText = 'Capture Selfie';
    button.style.marginTop = '10px';

    container.appendChild(video);
    container.appendChild(button);
    modal.appendChild(container);
    document.body.appendChild(modal);

    button.onclick = async () => {
      const canvas = document.createElement('canvas');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg')
      );

      const selfie = new File([blob], 'selfie.jpg', {
        type: 'image/jpeg'
      });

      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(modal);

      const formData = new FormData();

      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('selfie', selfie);

      const res = await api.post(
        `/attendance/checkin/${employeeId}`,
        formData
      );

      setTodayAttendance(res.data);

      alert('Checked In Successfully');
    };

  } catch (error) {
    console.log(error);
    alert('Camera or Check-In Failed');
  } finally {
    setLoading(false);
  }
};

// ---------------- CHECK OUT ----------------
  // const checkOut = async () => {
  //   if (!todayAttendance) {
  //     alert("You haven't checked in today");
  //     return;
  //   }

  //   if (todayAttendance.checkOutTime) {
  //     alert('Already checked out today');
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const location = await getCurrentLocation();

  //     const res = await api.put(
  //       `/attendance/checkout/${todayAttendance.id}`,
  //       {
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //       }
  //     );

  //     setTodayAttendance(res.data);

  //     alert('Checked Out Successfully');
  //   } catch (error) {
  //     console.log(error);
  //     alert('Check Out Failed or Location denied');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

    // 1. Get Current Location
    const location = await getCurrentLocation();

    // 2. Open Front Camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user'
      }
    });

    // 3. Create Camera Popup
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    const container = document.createElement('div');
    container.style.background = '#fff';
    container.style.padding = '20px';
    container.style.borderRadius = '12px';
    container.style.textAlign = 'center';

    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = stream;
    video.style.width = '350px';
    video.style.borderRadius = '10px';

    const captureBtn = document.createElement('button');
    captureBtn.innerText = 'Capture Selfie';
    captureBtn.style.marginTop = '15px';
    captureBtn.style.padding = '10px 20px';
    captureBtn.style.cursor = 'pointer';

    container.appendChild(video);
    container.appendChild(captureBtn);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // 4. Capture Image
    captureBtn.onclick = async () => {
      try {
        const canvas = document.createElement('canvas');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg')
        );

        const selfie = new File([blob], 'checkout-selfie.jpg', {
          type: 'image/jpeg'
        });

        // Stop Camera
        stream.getTracks().forEach(track => track.stop());

        // Remove Popup
        document.body.removeChild(modal);

        // 5. FormData
        const formData = new FormData();

        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
        formData.append('selfie', selfie);

        // 6. API Call
        const res = await api.put(
          `/attendance/checkout/${todayAttendance.id}`,
          formData
        );

        setTodayAttendance(res.data);

        alert('Checked Out Successfully');

      } catch (err) {
        console.log(err);
        alert('Capture Failed');
      } finally {
        setLoading(false);
      }
    };

  } catch (error) {
    console.log(error);
    alert('Camera Access Denied or Checkout Failed');
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