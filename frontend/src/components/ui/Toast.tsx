import React, { useEffect, useState } from 'react';
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
        top: 'var(--sp-6)',
        right: 'var(--sp-6)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        pointerEvents: 'none',
        maxWidth: '420px',
      }}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const TOAST_STYLES: Record<string, { icon: LucideIcon; gradient: string; bg: string; borderColor: string; glowColor: string }> = {
  success: { 
    icon: CheckCircle2, 
    gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(13, 148, 136, 0.05))',
    bg: 'rgba(20, 184, 166, 0.15)',
    borderColor: 'var(--teal)',
    glowColor: 'rgba(20, 184, 166, 0.4)'
  },
  error: { 
    icon: XCircle, 
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(225, 29, 72, 0.05))',
    bg: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'var(--rose)',
    glowColor: 'rgba(244, 63, 94, 0.4)'
  },
  warning: { 
    icon: AlertTriangle, 
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
    bg: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'var(--amber)',
    glowColor: 'rgba(245, 158, 11, 0.4)'
  },
  info: { 
    icon: Info, 
    gradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(180, 140, 40, 0.05))',
    bg: 'rgba(212, 175, 55, 0.15)',
    borderColor: 'var(--orange-600)',
    glowColor: 'rgba(212, 175, 55, 0.4)'
  },
};

interface ToastItemProps {
  toast: ToastType;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;
  const [progress, setProgress] = useState(100);
  const duration = 5000;

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = 100 - (elapsed / duration) * 100;
      setProgress(Math.max(remaining, 0));

      if (remaining <= 0) {
        clearInterval(timer);
        onRemove();
      }
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, [onRemove, duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.8, rotate: 5 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1, 
        rotate: 0,
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8
        }
      }}
      exit={{ 
        opacity: 0, 
        x: 100, 
        scale: 0.9,
        transition: { duration: 0.2 } 
      }}
      className="toast-item"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 'var(--r-lg)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
        border: `2px solid ${style.borderColor}`,
        pointerEvents: 'auto',
        minWidth: '320px',
        maxWidth: '420px',
        overflow: 'hidden',
        position: 'relative',
      }}
      role="status"
    >
      {/* Glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 1.5, repeat: 2 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: style.glowColor,
          filter: 'blur(4px)',
        }}
      />
      
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-3)',
          padding: 'var(--sp-4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Icon with animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            transition: { 
              type: "spring",
              stiffness: 500,
              damping: 20,
              delay: 0.1
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: style.gradient,
            border: `2px solid ${style.borderColor}`,
            color: style.borderColor,
            flexShrink: 0,
          }}
        >
          <Icon size={20} strokeWidth={2.5} />
        </motion.div>
        
        {/* Message */}
        <div 
          style={{
            flex: 1,
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-heading)',
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </div>
        
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            borderRadius: 'var(--r-md)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-heading)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={16} />
        </motion.button>
      </div>
      
      {/* Progress bar */}
      <div
        style={{
          height: '3px',
          background: 'rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
          style={{
            height: '100%',
            background: style.gradient,
            borderRight: `2px solid ${style.borderColor}`,
          }}
        />
      </div>
    </motion.div>
  );
};

