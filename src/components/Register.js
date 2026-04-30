import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../Login.css'; // reuse same styles

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    address: '',
    dob: '',
    mobileNo: '',
    role: 1
  });

  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    let msg = '';

    if (!value && name !== 'middlename') {
      msg = 'Required';
    }

    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      msg = 'Invalid email';
    }

    if (name === 'mobileNo' && value && !/^[789]\d{9}$/.test(value)) {
      msg = 'Invalid mobile';
    }

    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    setErrors({
      ...errors,
      [name]: validate(name, value)
    });
  };

  const validateAll = () => {
    const newErrors = {};

    Object.keys(form).forEach((key) => {
      const err = validate(key, form[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const register = async () => {
    if (!validateAll()) return;

    try {
      setLoading(true);

      await api.post('/users/save', form);

      alert('Registration successful!');
      navigate('/');
    } catch (err) {
      alert(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="overlay"></div>

      <div className="login-card">
        <h2>Register</h2>

        <div className="form-grid">

          {[
            'username',
            'password',
            'firstname',
            'middlename',
            'lastname',
            'email',
            'address',
            'mobileNo',
            'dob'
          ].map((field) => (
            <div key={field} className="input-box">

              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : field === 'dob' ? 'date' : 'text'}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field}
              />

              {errors[field] && (
                <span className="error">{errors[field]}</span>
              )}

            </div>
          ))}

        </div>

        <button onClick={register} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p onClick={() => navigate('/')} style={{ cursor: 'pointer', marginTop: 10 }}>
          Already have account? Login
        </p>
      </div>
    </div>
  );
}

export default Register;