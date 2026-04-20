import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((type, title, message = '') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title, message) => addToast('success', title, message), [addToast]);
  const error = useCallback((title, message) => addToast('error', title, message), [addToast]);
  const warning = useCallback((title, message) => addToast('warning', title, message), [addToast]);
  const info = useCallback((title, message) => addToast('info', title, message), [addToast]);

  const icons = {
    success: <FiCheckCircle style={{ color: 'var(--success-400)' }} />,
    error: <FiAlertCircle style={{ color: 'var(--danger-400)' }} />,
    warning: <FiAlertTriangle style={{ color: 'var(--warning-400)' }} />,
    info: <FiInfo style={{ color: 'var(--primary-400)' }} />,
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{icons[t.type]}</span>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
            </div>
            <button className="modal-close" onClick={() => removeToast(t.id)} style={{ width: 24, height: 24, fontSize: '0.9rem' }}>
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
