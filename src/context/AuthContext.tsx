'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// interface User {
//   id?: string;
  
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   profileImage?: string;
//   gender?: string;
  // location?: string;
  // emailVerified?: boolean;
  // profileCompleted: boolean;
// }


import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

interface User {
  id?: number;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  alt_mobile?: string;
  alternateNumber?: string;
  gender?: string;
  profileImage?: string | null;
  location?: string;
  emailVerified?: boolean;
  profileCompleted: boolean;
  contactVerified: boolean;
}
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUserProfile: (profileData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      // Check if user data exists in localStorage on initial load
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data from localStorage', error);
        }
      }

      // Sync fresh profile data from backend if token exists
      const token = localStorage.getItem('token');
      if (token && token !== 'null' && token !== 'undefined') {
        axios
          .get(`${API_BASE_URL}/customers/profile`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.data?.status && res.data?.data) {
              const u = res.data.data;
              const freshUser: User = {
                id: u.id,
                phone: u.mobile,
                firstName: u.first_name,
                lastName: u.last_name,
                email: u.email,
                mobile: u.mobile,
                alt_mobile: u.alt_mobile,
                alternateNumber: u.alt_mobile,
                gender: u.gender,
                profileImage: u.profile_url || u.profile || null,
                profileCompleted: Boolean(u.first_name && u.first_name.trim() !== ''),
                contactVerified: true,
              };
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            }
          })
          .catch((err) => {
            if (err?.response?.status === 401) {
              console.warn("Session token invalid or rejected by API (401). Clearing stale session.");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
            }
          });
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserProfile = (profileData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}