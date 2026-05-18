import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ChevronRight, ClipboardList, Gift, Map, UtensilsCrossed } from 'lucide-react';
import { Button, Card } from '../../components/ui';

const steps = [
  {
    icon: <CalendarCheck size={22} />,
    title: '1. Chon ngay gio va so khach',
    text: 'Vao Dat ban cua toi, chon thoi gian, so luong khach va xem ban phu hop con trong.',
  },
  {
    icon: <Map size={22} />,
    title: '2. Chon ban tren so do',
    text: 'Kiem tra tang, khu vuc, suc chua va trang thai ban truoc khi gui yeu cau dat ban.',
  },
  {
    icon: <UtensilsCrossed size={22} />,
    title: '3. Xem thuc don va goi mon',
    text: 'Sau khi co ban, ban co the xem mon dang ban, thoi gian chuan bi va tao order.',
  },
  {
    icon: <ClipboardList size={22} />,
    title: '4. Theo doi trang thai',
    text: 'Order se di qua cac buoc: moi tao, bep nhan, dang nau, san sang phuc vu, da phuc vu.',
  },
];

export const CustomerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <section className="customer-guide-hero">
        <div>
          <span>Customer dashboard</span>
          <h1>Huong dan dat ban va dat mon</h1>
          <p>
            Bat dau bang viec dat ban, sau do xem thuc don va tao order. Moi thao tac cua ban se duoc nha hang tiep nhan
            theo dung luong phuc vu.
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => navigate('/reservations')}>
              Dat ban ngay <ChevronRight size={16} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/menu')}>
              Xem thuc don
            </Button>
          </div>
        </div>
      </section>

      <div className="customer-step-grid">
        {steps.map(step => (
          <Card key={step.title}>
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
              <div className="customer-step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Card.Content>
          </Card>
        ))}
      </div>

      <Card>
        <Card.Content style={{ padding: 'var(--sp-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ marginBottom: 6 }}>Diem thuong thanh vien</h3>
            <p style={{ color: 'var(--text-muted)' }}>Moi lan thanh toan thanh cong se cong diem vao tai khoan customer cua ban.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/loyalty')}>
            <Gift size={16} /> Xem diem thuong
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
};
