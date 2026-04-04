import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  actions?: React.ReactNode;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
}

const sizeMap = {
  small: '380px',
  medium: '480px',
  large: '640px'
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  actions,
  closeOnEscape = true,
  closeOnBackdropClick = true
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="modal-backdrop"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(17, 24, 39, 0.5)',
              backdropFilter: 'blur(4px)'
            }}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="modal-content card"
            style={{
              position: 'relative',
              width: sizeMap[size],
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-main)',
              zIndex: 1001,
              boxShadow: 'var(--shadow-xl)'
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className="modal-header"
              style={{
                padding: 'var(--sp-4) var(--sp-6)',
                borderBottom: '1px solid var(--border-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              <h2
                id="modal-title"
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 600,
                  color: 'var(--text-heading)',
                  margin: 0
                }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="btn btn-ghost"
                aria-label="Close modal"
                style={{
                  padding: '8px',
                  borderRadius: 'var(--r-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <div
              className="modal-body"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--sp-6)'
              }}
            >
              {children}
            </div>

            {actions && (
              <div
                className="modal-footer"
                style={{
                  padding: 'var(--sp-4) var(--sp-6)',
                  borderTop: '1px solid var(--border-main)',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 'var(--sp-3)'
                }}
              >
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
