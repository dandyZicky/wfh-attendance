import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  user_key: string;
  email: string;
  username: string;
  department_id?: number;
  department_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isHR: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isHR = user?.department_id === 1;

  const fetchUserDepartment = async (userKey: string): Promise<{ department_id: number; department_name: string } | null> => {
    try {
      const response = await fetch(`http://localhost:3001/users/department/${userKey}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          department_id: data.department_id,
          department_name: data.department_name || 'Unknown Department'
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user department:', error);
      return null;
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch('http://localhost:3000/auth/verify', {
        credentials: 'include',
      });
      
      console.log('Auth check response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Auth check successful, user data:', userData);
        
        // Fetch department information
        const departmentInfo = await fetchUserDepartment(userData.user.user_key);
        
        setUser({
          ...userData.user,
          ...departmentInfo
        });
      } else {
        const errorData = await response.json();
        console.log('Auth check failed:', errorData);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // The login endpoint returns user data in the response
        if (data.user) {
          // Fetch department information
          const departmentInfo = await fetchUserDepartment(data.user.user_key);
          
          setUser({
            ...data.user,
            ...departmentInfo
          });
        } else {
          // If no user data in response, we need to fetch it
          await checkAuthStatus();
        }
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData.msg);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isHR,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 