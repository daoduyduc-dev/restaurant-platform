import { motion } from 'framer-motion';
import { Card, Button } from './ui';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NoAccessView = ({ title = 'Access Restricted', message = 'Your current role does not have permission to view this page.' }: { title?: string, message?: string }) => {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
      <Card variant="elevated" style={{ textAlign: 'center', maxWidth: 400, padding: 'var(--sp-8)' }}>
        <ShieldAlert size={48} color="var(--rose)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
        <h2 style={{ color: 'var(--text-heading)', marginBottom: 8 }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{message}</p>
        <Button variant="secondary" onClick={() => navigate(-1)} style={{ width: '100%', justifyContent: 'center' }}>
          <ArrowLeft size={16} /> Go Back
        </Button>
      </Card>
    </motion.div>
  );
};
