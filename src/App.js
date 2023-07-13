import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const BASE_URL = 'https://user-management-system-backend.vercel.app'; // Replace with your actual backend URL

// Styled components for styling

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px;
    border: 1px solid #ddd;
  }

  th {
    background-color: #f2f2f2;
  }
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 5px;

  &:hover {
    background-color: #45a049;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin-top: 20px;

  label {
    margin-bottom: 10px;
  }

  input {
    padding: 5px;
    margin-bottom: 10px;
  }

  button {
    padding: 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
  }
`;

// App component
function App() {
  return (
    <Router>
      <Container>
        <nav>
          <ul>
            <li>
              <Link to="/">Users</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<UserList />} />
          <Route path="/users/add" element={<UserForm />} />
          <Route path="/users/:userId" element={<UserView />} />
          <Route path="/users/:userId/edit" element={<UserForm isEditing={true} />} />
        </Routes>
      </Container>
    </Router>
  );
}

// UserList component
function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from the backend
    fetch(`${BASE_URL}/users`)
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Delete user from the backend
      fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            setUsers(users.filter((user) => user.id !== userId));
          } else {
            throw new Error('Error deleting user');
          }
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
        });
    }
  };

  return (
    <div>
      <h2>Users</h2>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>
                <Link to={`/users/${user.id}`}>
                  <Button>View</Button>
                </Link>
                <Link to={`/users/${user.id}/edit`}>
                  <Button>Edit</Button>
                </Link>
                <Button onClick={() => handleDelete(user.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Link to="/users/add">
        <Button>Add User</Button>
      </Link>
    </div>
  );
}

// UserForm component
function UserForm({ isEditing }) {
  const navigate = useNavigate();
  const userId = window.location.pathname.split('/')[2];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (isEditing) {
      // Fetch the user data for editing
      fetch(`${BASE_URL}/users/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });
    }
  }, [isEditing, userId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedUser = {
      name: name,
      email: email,
      phone: phone,
    };

    if (isEditing) {
      // Update existing user
      fetch(`${BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      })
        .then((response) => {
          if (response.ok) {
            navigate(`/users/${userId}`);
          } else {
            throw new Error('Error updating user');
          }
        })
        .catch((error) => {
          console.error('Error updating user:', error);
        });
    } else {
      // Create new user
      fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      })
        .then((response) => {
          if (response.ok) {
            navigate('/');
          } else {
            throw new Error('Error creating user');
          }
        })
        .catch((error) => {
          console.error('Error creating user:', error);
        });
    }
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit User' : 'Create User'}</h2>
      <Form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Phone:
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <br />
        <button type="submit">{isEditing ? 'Update' : 'Create'}</button>
      </Form>
    </div>
  );
}

// UserView component
function UserView() {
  const [user, setUser] = useState(null);
  const userId = window.location.pathname.split('/')[2];

  useEffect(() => {
    // Fetch user details from the backend
    fetch(`${BASE_URL}/users/${userId}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => {
        console.error('Error fetching user:', error);
      });
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Details</h2>
      <Table>
        <tbody>
          <tr>
            <th>ID:</th>
            <td>{user.id}</td>
          </tr>
          <tr>
            <th>Name:</th>
            <td>{user.name}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>{user.email}</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>{user.phone}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default App;
