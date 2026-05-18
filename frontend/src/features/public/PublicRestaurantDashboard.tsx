import { Link } from 'react-router-dom';
import { CalendarCheck, ChevronRight, Clock, MapPin, Phone, Sparkles, Star, UtensilsCrossed, Wine } from 'lucide-react';

const highlights = [
  { icon: <UtensilsCrossed size={20} />, label: 'Chef tasting menu', value: '8 courses' },
  { icon: <Wine size={20} />, label: 'Wine cellar', value: '240 labels' },
  { icon: <Clock size={20} />, label: 'Dinner service', value: '17:30 - 22:30' },
  { icon: <CalendarCheck size={20} />, label: 'Reservations', value: 'Online only' },
];

const menuPreview = [
  'Truffle Ribeye Steak',
  'Lobster Ravioli',
  'Wagyu Beef Tartare',
  'Chocolate Souffle',
];

export const PublicRestaurantDashboard = () => {
  return (
    <main className="public-site">
      <section className="public-hero">
        <div className="public-nav">
          <div className="public-brand">
            <span><UtensilsCrossed size={18} /></span>
            ServeGenius
          </div>
          <div className="public-actions">
            <Link to="/login" className="public-link">Dang nhap</Link>
            <Link to="/register" className="public-button">Dang ky</Link>
          </div>
        </div>

        <div className="public-hero-content">
          <div className="public-kicker"><Sparkles size={16} /> Fine dining reservation experience</div>
          <h1>ServeGenius Restaurant</h1>
          <p>
            Khong gian am thuc cao cap voi thuc don theo mua, dich vu ban rieng va he thong dat ban truc tuyen
            giup moi bua toi duoc chuan bi tron ven tu truoc khi ban den.
          </p>
          <div className="public-cta-row">
            <Link to="/register" className="public-primary-cta">
              Dat ban voi tai khoan customer <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="public-secondary-cta">Toi da co tai khoan</Link>
          </div>
        </div>
      </section>

      <section className="public-section public-highlight-grid">
        {highlights.map(item => (
          <article className="public-highlight" key={item.label}>
            <div>{item.icon}</div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="public-section public-story">
        <div>
          <span className="public-eyebrow">The dining room</span>
          <h2>Duoc thiet ke cho nhung buoi toi can su rieng tu, chinh xac va tinh te.</h2>
        </div>
        <p>
          Khach hang dang ky tai khoan customer de dat ban, xem so do ban, chon mon va theo doi diem thuong.
          Nhan vien tiep nhan check-in, day order sang bep, phuc vu va thanh toan tren cung mot luong.
        </p>
      </section>

      <section className="public-section public-menu-band">
        <div className="public-menu-copy">
          <span className="public-eyebrow">Signature menu</span>
          <h2>Nhung mon noi bat cho bua toi hom nay</h2>
          <p>Thuc don duoc cap nhat theo tinh trang mon, thoi gian chuan bi va suc chua cua nha hang.</p>
        </div>
        <div className="public-menu-list">
          {menuPreview.map((item, index) => (
            <div key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
              <Star size={15} />
            </div>
          ))}
        </div>
      </section>

      <footer className="public-footer">
        <div><MapPin size={16} /> 88 Golden Avenue, District Dining</div>
        <div><Phone size={16} /> 090 123 4567</div>
        <div>Dang nhap de tiep tuc vao he thong quan ly va dat ban.</div>
      </footer>
    </main>
  );
};
