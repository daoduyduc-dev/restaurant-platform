import { useNavigate } from 'react-router-dom';
import { CalendarCheck, ChevronRight, ClipboardList, Gift, Map, UtensilsCrossed } from 'lucide-react';
import { Button, Card } from '../../components/ui';

const steps = [
  {
    icon: <CalendarCheck size={22} />,
    title: '1. Chọn ngày giờ và số khách',
    text: 'Vào màn đặt bàn, chọn thời gian, số lượng khách và xem các bàn phù hợp còn trống.',
  },
  {
    icon: <Map size={22} />,
    title: '2. Chọn bàn trên sơ đồ',
    text: 'Kiểm tra tầng, khu vực, sức chứa và loại bàn trước khi gửi yêu cầu đặt bàn.',
  },
  {
    icon: <UtensilsCrossed size={22} />,
    title: '3. Xem thực đơn và gọi món',
    text: 'Sau khi có bàn, bạn có thể xem món đang bán, thời gian chuẩn bị và tạo order.',
  },
  {
    icon: <ClipboardList size={22} />,
    title: '4. Theo dõi trạng thái',
    text: 'Order sẽ đi qua các bước: mới tạo, bếp nhận, đang nấu, sẵn sàng phục vụ, đã phục vụ.',
  },
];

export const CustomerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <section className="customer-guide-hero">
        <div>
          <span>Customer dashboard</span>
          <h1>Hướng dẫn đặt bàn và đặt món</h1>
          <p>
            Bắt đầu bằng việc đặt bàn, sau đó xem thực đơn và tạo order. Mỗi thao tác của bạn sẽ được nhà hàng tiếp nhận
            theo đúng luồng phục vụ.
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => navigate('/app/tables')}>
              Đặt bàn ngay <ChevronRight size={16} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app/menu')}>
              Xem thực đơn
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
            <h3 style={{ marginBottom: 6 }}>Điểm thưởng thành viên</h3>
            <p style={{ color: 'var(--text-muted)' }}>Mỗi lần thanh toán thành công, hệ thống sẽ cộng điểm vào tài khoản của bạn.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/app/loyalty')}>
            <Gift size={16} /> Xem điểm thưởng
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
};
