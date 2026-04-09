import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setTokenState(storedToken);
      try {
        setUserState(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (jwtToken, objUser) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(objUser));
    setTokenState(jwtToken);
    setUserState(objUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTokenState(null);
    setUserState(null);
  };

  const setUser = (objUser) => {
    localStorage.setItem('user', JSON.stringify(objUser));
    setUserState(objUser);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    setUser,
    loading
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
