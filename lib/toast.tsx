'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  progress?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'info', options?: { progress?: number; persistent?: boolean }) => string;
  updateToast: (id: string, updates: Partial<Omit<Toast, 'id'>>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info', options?: { progress?: number; persistent?: boolean }) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, progress: options?.progress }]);

    if (!options?.persistent) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 5000);
    }

    return id;
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
    setToasts(prev => prev.map(toast => (toast.id === id ? { ...toast, ...updates } : toast)));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, updateToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, removeToast } = context;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'info':
        return 'bg-blue-500 text-white border-blue-600';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  return (
    <div className={`p-4 rounded-lg border shadow-lg max-w-sm animate-in slide-in-from-right-2 ${getToastStyles()}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {typeof toast.progress === 'number' && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-white/90">
            <span>Uploading</span>
            <span>{toast.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-200"
              style={{ width: `${toast.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
