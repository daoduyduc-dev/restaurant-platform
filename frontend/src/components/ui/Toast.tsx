import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import type { Toast as ToastType } from '../../store/toastStore';
import type { LucideIcon } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: 'var(--sp-6)',
        right: 'var(--sp-6)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        pointerEvents: 'none'
      }}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const TOAST_STYLES: Record<string, { icon: LucideIcon; color: string; bg: string; borderColor: string }> = {
  success: { icon: CheckCircle2, color: 'var(--teal)', bg: 'var(--teal-bg)', borderColor: 'var(--teal)' },
  error: { icon: XCircle, color: 'var(--rose)', bg: 'var(--rose-bg)', borderColor: 'var(--rose)' },
  warning: { icon: AlertTriangle, color: 'var(--amber)', bg: 'var(--amber-bg)', borderColor: 'var(--amber)' },
  info: { icon: Info, color: 'var(--orange-600)', bg: 'var(--orange-100)', borderColor: 'var(--orange-600)' },
};

interface ToastItemProps {
  toast: ToastType;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="toast-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
        padding: '12px 16px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: `4px solid ${style.borderColor}`,
        pointerEvents: 'auto',
        minWidth: '300px'
      }}
      role="status"
    >
      <div
        className="toast-icon"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: style.bg,
          color: style.color,
          flexShrink: 0
        }}
      >
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div className="toast-message" style={{
        flex: 1,
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: 'var(--text-heading)'
      }}>
        {toast.message}
      </div>
      <button
        onClick={onRemove}
        className="toast-close"
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-muted)',
          transition: 'color var(--dur-fast) var(--ease-out)'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-heading)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

