import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Employee.css';

function Employee() {
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    id: null,
    username: '',
    password: '',
    role: 2,
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    address: '',
    dob: '',
    mobileNo: '',
    age: ''
  });

  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewEmp, setViewEmp] = useState(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedSearch]);

  // ---------------- FETCH ----------------
  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/users/all?page=${page}&size=${size}&search=${debouncedSearch}`
      );

      setEmployees(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AGE ----------------
  const calculateAge = (dob) => {
    if (!dob) return '';

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const validate = (name, value) => {
    let msg = '';

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileRegex = /^[789]\d{9}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!value && name !== 'middlename') {
      msg = 'Required';
    }

    if (name === 'email' && value && !emailRegex.test(value)) {
      msg = 'Invalid email format';
    }

    if (name === 'mobileNo' && value && !mobileRegex.test(value)) {
      msg = 'Must be 10 digits starting 7/8/9';
    }

    if (name === 'password' && value && !passwordRegex.test(value)) {
      msg = 'Weak password';
    }

    return msg;
  };
  const handleChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    // ✅ MOBILE: only numbers + max 10 digits
    if (name === 'mobileNo') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    const updatedForm = {
      ...form,
      [name]: value
    };

    setForm(updatedForm);

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
  // ---------------- SAVE ----------------
  const saveEmployee = async () => {
    try {

      setLoading(true);

      await api.post('/users/save', form);

      await fetchEmployees();
      clearForm();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EDIT ----------------
  const editEmployee = (emp) => {
    const dob = emp.dob
      ? emp.dob.split('T')[0]
      : '';

    setForm({
      ...emp,
      dob,
      age: calculateAge(dob)
    });

    setIsEdit(true);
    setShowForm(true);
  };

  // ---------------- DELETE ----------------
  const deleteEmployee = async (id) => {
    try {
      setLoading(true);

      await api.post('/users/delete', { id });

      await fetchEmployees();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CLEAR ----------------
  const clearForm = () => {
    setForm({
      id: null,
      username: '',
      password: '',
      role: 2,
      firstname: '',
      middlename: '',
      lastname: '',
      email: '',
      address: '',
      dob: '',
      mobileNo: '',
      age: ''
    });

    setIsEdit(false);
    setShowForm(false);
  };

  return (
    <div className="employees-container">

      {/* FULL PAGE LOADER */}
      {loading && (
        <div className="global-loader">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {/* TOP BAR */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <button onClick={() => setShowForm(true)}>
          + Add Employee
        </button>
      </div>

      {/* TABLE */}
      {!showForm && (
        <>
          <table className="employee-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.username}</td>
                  <td>
                    {emp.firstname} {emp.lastname}
                  </td>
                  <td>
                    {emp.role === '1'
                      ? 'Admin'
                      : 'Employee'}
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.mobileNo}</td>

                  {/* ACTION ICONS */}
                  <td className="action-icons">

                    {/* EDIT (opens form) */}
                    <div className="icon-wrapper">
                      <button
                        className="icon-btn edit"
                        onClick={() => editEmployee(emp)}
                      >
                        ✏️
                      </button>
                      <span className="icon-label">Edit</span>
                    </div>

                    {/* VIEW */}
                    <div className="icon-wrapper">
                      <button
                        className="icon-btn view"
                        onClick={() => setViewEmp(emp)}
                      >
                        👁️
                      </button>
                      <span className="icon-label">View</span>
                    </div>

                    {/* DELETE */}
                    <div className="icon-wrapper">
                      <button
                        className="icon-btn delete"
                        onClick={() => setDeleteId(emp.id)}

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

          {/* PAGINATION */}
          <div className="pagination">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span>
              {page + 1} / {totalPages}
            </span>

            <button
              disabled={page + 1 === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>
              {isEdit ? 'Edit Employee' : 'Add Employee'}
            </h3>

            {/* LABEL MAP */}
            {(() => {
              const fieldLabels = {
                username: 'User Name',
                password: 'Password',
                firstname: 'First Name',
                middlename: 'Middle Name',
                lastname: 'Last Name',
                email: 'Email',
                address: 'Address',
                mobileNo: 'Mobile Number'
              };

              return (
                <div className="form-grid">

                  {/* TEXT FIELDS */}
                  {[
                    'username',
                    'password',
                    'firstname',
                    'middlename',
                    'lastname',
                    'email',
                    'address',
                    'mobileNo'
                  ].map((field) => (
                    <div className="floating" key={field}>

                      <input
                        name={field}
                        value={form[field]}
                        onChange={(e) => {
                          let value = e.target.value;

                          // ✅ MOBILE: only numbers + max 10 digits
                          if (field === 'mobileNo') {
                            value = value.replace(/\D/g, '').slice(0, 10);
                          }

                          setForm(prev => ({
                            ...prev,
                            [field]: value
                          }));
                        }}
                        placeholder=" "

                        // ✅ email + password type handling
                        type={
                          field === 'password'
                            ? 'password'
                            : field === 'email'
                              ? 'email'
                              : 'text'
                        }

                        // mobile keypad + restriction
                        inputMode={field === 'mobileNo' ? 'numeric' : undefined}
                        maxLength={field === 'mobileNo' ? 10 : undefined}
                      />

                      <label>{fieldLabels[field]}</label>

                      {/* ERROR MESSAGE */}
                      {errors[field] && (
                        <span className="error">{errors[field]}</span>
                      )}

                      {/* HINTS */}
                      {field === 'email' && (
                        <small className="hint">example: name@gmail.com</small>
                      )}

                      {field === 'password' && (
                        <small className="hint">
                          Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
                        </small>
                      )}

                    </div>
                  ))}


                  {/* ROLE */}
                  <div className="floating">
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          role: Number(e.target.value)
                        })
                      }
                      disabled={isEdit}
                    >
                      <option value={2}>Employee</option>
                      <option value={1}>Admin</option>
                    </select>
                    <label>Role</label>
                  </div>

                  {/* DOB */}
                  <div className="floating">
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => {
                        const dob = e.target.value;

                        setForm({
                          ...form,
                          dob,
                          age: calculateAge(dob)
                        });
                      }}
                    />
                    <label>Date of Birth</label>
                  </div>

                  {/* AGE */}
                  <div className="floating">
                    <input
                      value={form.age}
                      readOnly
                      placeholder=" "
                    />
                    <label>Age</label>
                  </div>

                </div>
              );
            })()}

            {/* ACTION BUTTONS */}
            <div className="modal-actions">
              <button onClick={saveEmployee}>
                {isEdit ? 'Update' : 'Add'}
              </button>

              <button onClick={clearForm}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
      {/* VIEW MODAL */}
      {viewEmp && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Employee Details</h3>

            <div className="form-grid">

              {[
                ['Username', viewEmp.username],
                ['First Name', viewEmp.firstname],
                ['Middle Name', viewEmp.middlename],
                ['Last Name', viewEmp.lastname],
                ['Email', viewEmp.email],
                ['Mobile', viewEmp.mobileNo],
                ['Address', viewEmp.address],
                ['DOB', formatDate(viewEmp.dob)],
                ['Age', viewEmp.age]
              ].map(([label, value]) => (
                <div className="floating" key={label}>
                  <input value={value || ''} disabled />
                  <label>{label}</label>
                </div>
              ))}

            </div>

            <div className="modal-actions">
              <button onClick={() => setViewEmp(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal small-modal">

            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this employee?</p>

            <div className="modal-actions">
              <button
                onClick={() => {
                  deleteEmployee(deleteId);
                  setDeleteId(null);
                }}
              >
                Yes, Delete
              </button>

              <button onClick={() => setDeleteId(null)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

const formatDate = (dateStr) => {
  try {
    return dateStr
      ? new Date(dateStr).toISOString().split('T')[0]
      : '';
  } catch {
    return '';
  }
};


export default Employee;