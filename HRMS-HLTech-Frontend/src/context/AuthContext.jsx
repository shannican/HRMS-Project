import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to validate token expiration
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch user profile');
      }

      const userData = await response.json();
      console.log('User profile fetched:', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  // Load user from token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        if (isTokenExpired(token)) {
          console.log('Token is expired, removing from localStorage');
          localStorage.removeItem('token');
          setUser(null);
          navigate('/login', { replace: true });
        } else {
          try {
            const decoded = jwtDecode(token);
            console.log('Token loaded from localStorage on app load:', token);
            console.log('Token decoded on app load:', decoded);

            if (!decoded.userId) {
              console.error('Token does not contain userId:', decoded);
              throw new Error('Invalid token: userId missing');
            }

            const userData = await fetchUserProfile(token);
            setUser({
              userId: decoded.userId,
              role: decoded.role,
              fullName: userData.fullName,
              email: userData.email,
              phoneNumber: userData.phoneNumber,
              dateOfBirth: userData.dateOfBirth,
              gender: userData.gender,
              department: userData.department,
              jobTitle: userData.jobTitle,
              position: userData.position,
              joiningDate: userData.joiningDate,
              employmentType: userData.employmentType,
              address: userData.address,
              profileImage: userData.profileImage,
            });
          } catch (error) {
            console.error('Error initializing auth:', error.message);
            localStorage.removeItem('token');
            setUser(null);
            navigate('/login', { replace: true });
          }
        }
      } else {
        console.log('No token found in localStorage on app load');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [navigate]);

  const register = async (fullName, email, phoneNumber, dateOfBirth, gender, password, role) => {
    try {
      console.log('Register attempt:', { fullName, email, role });
      const payload = {
        fullName,
        email,
        phoneNumber,
        dateOfBirth,
        gender,
        password,
      };
      if (role) payload.role = role;

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Register response status:', response.status);
      const data = await response.json();
      console.log('Register response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Registration failed with status ${response.status}`);
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('JWT token saved in localStorage (register):', data.token);
        const decoded = jwtDecode(data.token);
        console.log('Register token decoded:', decoded);

        if (!decoded.userId) {
          console.error('Token does not contain userId:', decoded);
          throw new Error('Invalid token: userId missing');
        }

        const userData = await fetchUserProfile(data.token);
        const newUser = {
          userId: decoded.userId,
          role: decoded.role,
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          department: userData.department,
          jobTitle: userData.jobTitle,
          position: userData.position,
          joiningDate: userData.joiningDate,
          employmentType: userData.employmentType,
          address: userData.address,
          profileImage: userData.profileImage,
        };
        setUser(newUser);
        navigate(newUser.role === 'employee' ? '/dashboard/employee' : '/admin/dashboard');
      } else {
        throw new Error(data.message || 'No token received after registration');
      }
    } catch (error) {
      console.error('Registration error:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const login = async (email, password, isAdminHr) => {
    try {
      console.log('Login attempt:', { email, password, isAdminHr });
      const endpoint = 'http://localhost:5000/api/auth/login';
      console.log('Login endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', [...response.headers.entries()]);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        console.log('Login failed with status:', response.status, 'Message:', data.message);
        throw new Error(data.message || 'Invalid credentials');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('JWT token saved in localStorage (login):', data.token);
        const decoded = jwtDecode(data.token);
        console.log('Login token decoded:', decoded);

        if (!decoded.userId) {
          console.error('Token does not contain userId:', decoded);
          throw new Error('Invalid token: userId missing');
        }

        const userData = await fetchUserProfile(data.token);
        const newUser = {
          userId: decoded.userId,
          role: decoded.role,
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          department: userData.department,
          jobTitle: userData.jobTitle,
          position: userData.position,
          joiningDate: userData.joiningDate,
          employmentType: userData.employmentType,
          address: userData.address,
          profileImage: userData.profileImage,
        };
        setUser(newUser);

        if (newUser.role === 'admin' || newUser.role === 'hr') {
          console.log('Redirecting to admin dashboard for role:', newUser.role);
          navigate('/admin/dashboard');
        } else if (newUser.role === 'employee') {
          console.log('Redirecting to employee dashboard for role:', newUser.role);
          navigate('/dashboard/employee');
        } else {
          throw new Error(`Unknown user role: ${newUser.role}`);
        }
      } else {
        throw new Error(data.message || 'No token received after login');
      }
    } catch (error) {
      console.error('Login error:', error.message);
      const errorMessage = error.message === 'Invalid credentials' && !error.message.includes('status')
        ? 'Invalid email or password. Please try again.'
        : error.message;
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    console.log('Logging out user:', user);
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      // Reset user state
      setUser(null);
      // Redirect to login page
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
      console.log('Logout successful, redirected to /login');
    } catch (error) {
      console.error('Logout error:', error.message);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, register, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };