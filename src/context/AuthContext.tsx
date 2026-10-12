import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, setToken } from '../services/api';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  loginModalTab: 'login' | 'register';
  openLoginModal: (tab?: 'login' | 'register') => void;
  closeLoginModal: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: { name: string; email: string; password: string; phone?: string; address?: string; city?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name?: string; phone?: string; address?: string; city?: string }) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalTab, setLoginModalTab] = useState<'login' | 'register'>('login');
  const { showToast } = useNotification();

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openLoginModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setLoginModalTab(tab);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setIsLoginModalOpen(false);
      showToast(`Xin chào ${data.user.name}! Đăng nhập thành công.`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Đăng nhập thất bại', 'error');
      return false;
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
  }): Promise<boolean> => {
    try {
      const data = await api.register(payload);
      setToken(data.token);
      setUser(data.user);
      setIsLoginModalOpen(false);
      showToast(`Chào mừng ${data.user.name} đến với PhuAnh Sneaker!`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Đăng ký thất bại', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      setToken(null);
    }
    setUser(null);
    showToast('Đã đăng xuất tài khoản', 'info');
  };

  const updateProfile = async (payload: { name?: string; phone?: string; address?: string; city?: string }): Promise<boolean> => {
    try {
      const res = await api.updateProfile(payload);
      setUser(res.user);
      showToast('Cập nhật hồ sơ thành công', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Cập nhật thất bại', 'error');
      return false;
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isLoginModalOpen,
        loginModalTab,
        openLoginModal,
        closeLoginModal,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
