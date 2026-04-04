import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({ isOpen, onClose, title, children, width = '480px' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="drawer-overlay"
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.4)',
              zIndex: 100, backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="drawer-content"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width,
              backgroundColor: 'var(--bg-main)', zIndex: 101,
              boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{
              padding: 'var(--sp-5) var(--sp-6)', borderBottom: '1px solid var(--border-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: 'var(--bg-card)'
            }}>
              <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-heading)', margin: 0 }}>{title}</h2>
              <button className="btn btn-ghost" onClick={onClose} style={{ padding: '8px', borderRadius: 'var(--r-md)' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-6)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
