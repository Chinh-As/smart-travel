import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import '../styles/admin.css';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Shared State
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => {}, confirmText: 'Xác nhận' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ message: '', type: 'success' });
  }, []);

  const showConfirm = useCallback(({ title, message, type = 'danger', onConfirm, confirmText = 'Xác nhận' }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setIsCollapsed(false); // Mobile uses drawer
      } else if (width <= 1024) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Load Dark Mode state
    if (localStorage.getItem('adminDarkMode') === 'true') {
      document.body.classList.add('admin-dark');
    } else {
      document.body.classList.remove('admin-dark');
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="admin-module">
      <div className="admin-layout">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          isMobileOpen={isMobileOpen} 
          setMobileOpen={setIsMobileOpen} 
        />
        <div className="admin-main-wrapper">
          <AdminTopbar toggleSidebar={toggleSidebar} />
          <main className="admin-content">
            <div className="admin-content-inner">
              <Outlet context={{ showToast, showConfirm }} />
            </div>
          </main>
        </div>
      </div>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={hideToast} 
      />
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={hideConfirm}
      />
    </div>
  );
};

export default AdminLayout;
