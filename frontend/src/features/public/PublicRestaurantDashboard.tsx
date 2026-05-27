import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  LayoutGrid,
  MapPin,
  MessageSquareQuote,
  Phone,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';

import i18n from '../../i18n';
import { useAuthStore } from '../../store/authStore';
import './public.css';

export const PublicRestaurantDashboard = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const user = useAuthStore((state) => state.user);
  const isVi = i18n.language === 'vi';

  const reserveHref = user ? '/app/tables' : '/reserve';
  const menuHref = user ? '/app/menu' : '/menu';
  const accountHref = user ? '/app/dashboard' : '/login';
  const rewardHref = user ? '/app/loyalty' : '/login';

  const features = [
    {
      icon: <Award size={28} />,
      title: t('public.feature1Title'),
      desc: t('public.feature1Desc'),
    },
    {
      icon: <CalendarCheck size={28} />,
      title: t('public.feature2Title'),
      desc: t('public.feature2Desc'),
    },
    {
      icon: <Wine size={28} />,
      title: t('public.feature3Title'),
      desc: t('public.feature3Desc'),
    },
    {
      icon: <Clock3 size={28} />,
      title: t('public.feature4Title'),
      desc: t('public.feature4Desc'),
    },
  ];

  const bookingSteps = [
    { icon: <LayoutGrid size={24} />, title: t('public.step1Title'), desc: t('public.step1Desc') },
    { icon: <CalendarCheck size={24} />, title: t('public.step2Title'), desc: t('public.step2Desc') },
    { icon: <Users size={24} />, title: t('public.step3Title'), desc: t('public.step3Desc') },
    { icon: <CheckCircle2 size={24} />, title: t('public.step4Title'), desc: t('public.step4Desc') },
  ];

  const dishes = [
    isVi ? 'Bít tết Ribeye sốt nấm truffle' : 'Truffle Ribeye Steak',
    isVi ? 'Ravioli tôm hùm' : 'Lobster Ravioli',
    isVi ? 'Bò Wagyu tartare' : 'Wagyu Beef Tartare',
    isVi ? 'Souffle chocolate' : 'Chocolate Souffle',
  ];

  const testimonials = [
    {
      name: 'Emily Carter',
      text: isVi
        ? 'Một trải nghiệm trọn vẹn từ lúc chọn bàn, gọi món cho tới khi thanh toán.'
        : 'An exceptional dining experience from reservation to dessert.',
    },
    {
      name: 'Daniel Kim',
      text: isVi
        ? 'Quy trình đặt bàn trực tuyến mượt, rõ ràng và rất dễ dùng.'
        : 'The online booking process was effortless and elegant.',
    },
    {
      name: 'Sophia Nguyen',
      text: isVi
        ? 'Rất phù hợp cho dịp đặc biệt, đặc biệt là khu VIP và trải nghiệm phục vụ chỉn chu.'
        : 'Perfect for special occasions. Professional and polished.',
    },
  ];

  const faqs = [
    { question: t('public.faq1Q'), answer: t('public.faq1A') },
    { question: t('public.faq2Q'), answer: t('public.faq2A') },
    { question: t('public.faq3Q'), answer: t('public.faq3A') },
    { question: t('public.faq4Q'), answer: t('public.faq4A') },
  ];

  const languageOptions = [
    { value: 'vi', label: 'VI' },
    { value: 'en', label: 'EN' },
  ];

  return (
    <main className="public-site">
      <header className="public-header">
        <div className="public-navbar">
          <div className="public-navbar-brand">
            <UtensilsCrossed size={22} />
            <span>{t('public.brand')}</span>
          </div>

          <div className="public-navbar-actions">
            <div style={{ display: 'flex', gap: 8 }}>
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => void i18n.changeLanguage(option.value)}
                  className="btn btn-ghost"
                  style={{
                    padding: '8px 12px',
                    border: i18n.language === option.value ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid transparent',
                    background: i18n.language === option.value ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Link to={accountHref} className="public-nav-link">
              {user ? (isVi ? 'Tài khoản' : 'Account') : t('public.login')}
            </Link>

            <Link to={reserveHref} className="public-nav-cta">
              {isVi ? 'Đặt bàn' : t('public.reserveNow')}
            </Link>
          </div>
        </div>
      </header>

      <section className="public-hero">
        <div className="public-container">
          <div className="public-hero-content">
            <div className="public-pill">
              <Sparkles size={16} />
              {t('public.heroKicker')}
            </div>

            <h1 className="public-hero-title">{t('public.heroTitle')}</h1>

            <p className="public-hero-subtitle">{t('public.heroSubtitle')}</p>

            <div className="public-hero-buttons">
              <Link to={reserveHref} className="public-primary-btn">
                {isVi ? 'Đặt bàn và chọn món' : t('public.heroPrimary')}
                <ChevronRight size={18} />
              </Link>

              <Link to={menuHref} className="public-secondary-btn">
                {isVi ? 'Xem thực đơn trước' : 'View menu first'}
              </Link>
            </div>

            <div
              style={{
                marginTop: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 14,
                maxWidth: 760,
              }}
            >
              <div className="public-card" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.15)' }}>
                <h3 style={{ marginTop: 0, color: 'white' }}>{isVi ? 'Đặt bàn không cần đăng nhập' : 'Book without an account'}</h3>
                <p style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {isVi ? 'Khách mới vẫn có thể chọn bàn và chọn món ngay.' : 'Guests can still reserve a table and pre-order dishes instantly.'}
                </p>
              </div>
              <div className="public-card" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.15)' }}>
                <h3 style={{ marginTop: 0, color: 'white' }}>{isVi ? 'Đăng nhập để tích điểm' : 'Sign in for rewards'}</h3>
                <p style={{ color: 'rgba(255,255,255,0.82)' }}>
                  {isVi ? 'Tài khoản giúp lưu lịch sử, hóa đơn và cộng điểm đổi ưu đãi.' : 'Accounts unlock order history, invoices, and loyalty rewards.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-grid-4">
            {features.map((feature) => (
              <div key={feature.title} className="public-card">
                <div className="public-icon-accent">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-about-grid">
            <div>
              <div className="public-eyebrow">{t('public.aboutEyebrow')}</div>
              <h2 className="public-section-title">{t('public.aboutTitle')}</h2>
              <p className="public-body-text">{t('public.aboutBody')}</p>

              <div className="public-check-list">
                {[
                  t('public.aboutPoint1'),
                  t('public.aboutPoint2'),
                  t('public.aboutPoint3'),
                  t('public.aboutPoint4'),
                ].map((item) => (
                  <div key={item} className="public-check-item">
                    <CheckCircle2 size={18} color="#059669" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
                <Link to={accountHref} className="public-primary-btn">
                  {user ? (isVi ? 'Vào dashboard của tôi' : 'Open my dashboard') : (isVi ? 'Đăng nhập để quản lý đơn' : 'Sign in to manage orders')}
                </Link>
                <Link to={rewardHref} className="public-secondary-btn" style={{ color: '#92400e', borderColor: 'rgba(146,64,14,0.2)' }}>
                  {isVi ? 'Tìm hiểu tích điểm' : 'Explore loyalty'}
                </Link>
              </div>
            </div>

            <img
              className="public-about-image"
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9"
              alt="restaurant"
            />
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-center-heading">
            <div className="public-eyebrow">{t('public.bookingEyebrow')}</div>
            <h2 className="public-section-title">{t('public.bookingTitle')}</h2>
          </div>

          <div className="public-grid-4">
            {bookingSteps.map((step, index) => (
              <div key={step.title} className="public-card">
                <div className="public-step-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="public-icon-accent">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section" style={{ paddingTop: 0 }}>
        <div className="public-container">
          <div className="public-grid-3">
            <div className="public-card">
              <div className="public-icon-accent"><CalendarCheck size={24} /></div>
              <h3>{isVi ? '1. Chọn bàn phù hợp' : '1. Pick the right table'}</h3>
              <p>{isVi ? 'Xem sơ đồ bàn thường và VIP, số chỗ ngồi, tầng và khung giờ còn trống.' : 'Review standard and VIP tables, seating capacity, floors, and available time slots.'}</p>
            </div>
            <div className="public-card">
              <div className="public-icon-accent"><UtensilsCrossed size={24} /></div>
              <h3>{isVi ? '2. Chọn món ngay sau khi đặt' : '2. Pre-order right after booking'}</h3>
              <p>{isVi ? 'Sau khi gửi đặt bàn thành công, hệ thống chuyển thẳng sang bước chọn món để nhà hàng chuẩn bị trước.' : 'Once the reservation is created, the app moves directly to the menu so the kitchen can prepare ahead.'}</p>
            </div>
            <div className="public-card">
              <div className="public-icon-accent"><Award size={24} /></div>
              <h3>{isVi ? '3. Thanh toán và tích điểm' : '3. Pay and earn rewards'}</h3>
              <p>{isVi ? 'Khách đã có tài khoản sẽ được cộng điểm sau khi nhân viên xác nhận thanh toán thành công.' : 'Registered customers receive loyalty points after staff confirms a successful payment.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-floor-preview">
            <div>
              <div className="public-eyebrow">{t('public.floorEyebrow')}</div>
              <h2 className="public-section-title">{t('public.floorTitle')}</h2>
              <p className="public-body-text">{t('public.floorBody')}</p>

              <Link to={reserveHref} className="public-primary-btn">
                {isVi ? 'Chọn bàn trên sơ đồ' : t('public.floorAction')}
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="public-floor-mock">
              <div className="floor-grid">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className={`floor-table ${index % 4 === 0 ? 'selected' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-center-heading">
            <div className="public-eyebrow">{t('public.menuEyebrow')}</div>
            <h2 className="public-section-title">{t('public.menuTitle')}</h2>
          </div>

          <div className="public-grid-4">
            {dishes.map((dish, index) => (
              <div key={dish} className="public-card">
                <div className="public-step-number">{String(index + 1).padStart(2, '0')}</div>
                <h3>{dish}</h3>

                <div className="public-stars">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} size={16} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>

                <p>{t('public.menuBody')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-center-heading">
            <div className="public-eyebrow">{t('public.reviewsEyebrow')}</div>
            <h2 className="public-section-title">{t('public.reviewsTitle')}</h2>
          </div>

          <div className="public-grid-3">
            {testimonials.map((item) => (
              <div key={item.name} className="public-card">
                <div className="public-icon-accent">
                  <MessageSquareQuote size={24} />
                </div>

                <p className="testimonial-text">"{item.text}"</p>
                <strong>{item.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-center-heading">
            <div className="public-eyebrow">{t('public.faqEyebrow')}</div>
            <h2 className="public-section-title">{t('public.faqTitle')}</h2>
          </div>

          <div className="public-faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question} className="public-faq-card">
                  <button className="public-faq-button" onClick={() => setOpenFaq(isOpen ? null : index)}>
                    <span>{faq.question}</span>
                    <ChevronDown size={18} className={isOpen ? 'faq-open' : ''} />
                  </button>

                  {isOpen && <div className="public-faq-answer">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="public-cta-box">
            <h2>{t('public.ctaTitle')}</h2>
            <p>{t('public.ctaBody')}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link to={reserveHref} className="public-white-btn">
                {isVi ? 'Bắt đầu đặt bàn' : t('public.ctaAction')}
              </Link>
              <Link to={menuHref} className="public-secondary-btn">
                {isVi ? 'Xem món trước' : 'Browse menu'}
              </Link>
            </div>
            <div style={{ marginTop: 18, color: 'rgba(255,255,255,0.88)', fontSize: 15 }}>
              {isVi
                ? 'Đăng nhập để theo dõi lịch sử đặt bàn, đơn món và tích điểm đổi thưởng sau thanh toán.'
                : 'Sign in to track reservations, orders, and earn loyalty points after payment.'}
            </div>
          </div>
        </div>
      </section>

      <footer className="public-footer-wrap">
        <div className="public-container">
          <div className="public-footer">
            <div>
              <div className="public-footer-brand">{t('public.brand')}</div>
              <div className="public-footer-copy">{t('public.footerBody')}</div>
            </div>

            <div className="public-footer-contact">
              <div>
                <MapPin size={16} />
                {t('public.footerAddress')}
              </div>

              <div>
                <Phone size={16} />
                {t('public.footerPhone')}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};
