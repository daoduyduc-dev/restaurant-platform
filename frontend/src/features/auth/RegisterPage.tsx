import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Phone, User, UtensilsCrossed } from 'lucide-react';
import api from '../../services/api';
import type { AuthResponseData } from '../../services/types';
import { useAuthStore } from '../../store/authStore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      const data: AuthResponseData = res.data.data;
      setAuth(
        { id: data.userId, name: data.name, email: data.email, roles: data.roles },
        data.accessToken,
        data.refreshToken
      );
      navigate('/');
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Khong the dang ky tai khoan luc nay.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel">
      <div className="auth-mark">
        <UtensilsCrossed size={28} />
      </div>
      <h1>Tao tai khoan customer</h1>
      <p>Dang ky de dat ban, goi mon va tich diem thanh vien. Tai khoan moi luon la role CUSTOMER.</p>

      <form onSubmit={handleRegister} className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        <Field icon={<User size={18} />} label="Ho ten" value={form.name} onChange={update('name')} placeholder="Nguyen Van A" />
        <Field icon={<Mail size={18} />} label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
        <Field icon={<Phone size={18} />} label="So dien thoai" value={form.phone} onChange={update('phone')} placeholder="0901234567" />
        <Field icon={<Lock size={18} />} label="Mat khau" type="password" value={form.password} onChange={update('password')} placeholder="Toi thieu 6 ky tu" />
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Dang tao...' : 'Dang ky va vao dashboard'} <ArrowRight size={18} />
        </button>
      </form>

      <div className="auth-switch">
        Da co tai khoan? <Link to="/login">Dang nhap</Link>
      </div>
    </div>
  );
};

function Field({
  icon,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  icon: ReactNode;
  label: string;
  type?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div>
        {icon}
        <input type={type} required value={value} onChange={onChange} placeholder={placeholder} />
      </div>
    </label>
  );
}
