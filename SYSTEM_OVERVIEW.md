# 🍽️ ServeGenius - Restaurant Management Platform

## 🎯 Overview
A comprehensive, role-based restaurant management system with real-time WebSocket communication, loyalty program, and end-to-end workflow automation.

---

## 🏗️ Architecture

### Tech Stack
**Backend:**
- Spring Boot 4.0.3 (Java 21)
- Spring Security + JWT Authentication
- Spring Data JPA (PostgreSQL)
- Spring WebSocket (STOMP over SockJS)
- MapStruct (Object Mapping)
- Lombok

**Frontend:**
- React 19 + TypeScript
- Vite (Build Tool)
- React Router 7
- Zustand (State Management)
- Framer Motion (Animations)
- Recharts (Data Visualization)
- Lucide React (Icons)
- Axios + STOMP.js

---

## 👥 Role-Based System

### 1. **CUSTOMER** 🧑‍💼
**Dashboard:** `/customer`
- View loyalty status (Silver/Gold/Platinum/Diamond tiers)
- Make reservations with pre-order
- Browse menu and favorite dishes
- Track order history
- View upcoming reservations
- Earn & redeem loyalty points

**Navigation:**
- Dashboard
- My Reservations
- Browse Menu
- Loyalty Rewards

---

### 2. **WAITER** 🤵
**Dashboard:** `/waiter`
- Manage assigned tables
- View active orders
- Receive ready-to-serve notifications
- Mark orders as served
- Create new orders
- Process payments

**Navigation:**
- Dashboard
- Orders
- Table Map
- Payments

---

### 3. **RECEPTIONIST** 🛎️
**Dashboard:** `/receptionist`
- Manage today's reservations
- Check-in customers
- Handle walk-ins
- View real-time table map
- Manage table status (Available → Reserved → Occupied → Dirty)

**Navigation:**
- Dashboard
- Reservations
- Table Map

---

### 4. **KITCHEN** 👨‍🍳
**Dashboard:** `/kitchen`
- Kitchen Display System (KDS)
- View pending orders
- Start cooking
- Mark orders as ready
- Real-time WebSocket updates
- Special instructions display

**Navigation:**
- Dashboard
- Kitchen Display
- All Orders

---

### 5. **MANAGER** 👔
**Dashboard:** `/manager`
- Revenue overview
- Top selling items
- Staff management
- Menu management
- Reports & analytics
- System settings

**Navigation:**
- Dashboard
- Menu, Tables, Orders, Reservations
- Reports, Staff, Loyalty

---

### 6. **ADMIN** ⚙️
**Dashboard:** `/admin`
- User management (CRUD)
- Role assignment
- System configuration
- Audit logs
- Business hours settings
- Notification templates

**Navigation:**
- Dashboard
- User Management
- Menu, Tables
- Reports, Settings

---

## 🔄 End-to-End Workflow

### Complete Customer Journey:
1. **Reservation** → Customer books table (with optional pre-order)
2. **Check-in** → Receptionist checks in customer
   - Table status: AVAILABLE → OCCUPIED
   - Auto-create order with pre-order items
   - Notify assigned waiter
3. **Ordering** → Waiter adds items to order
   - Order status: OPEN → PENDING
   - Send to kitchen via WebSocket
4. **Kitchen** → Kitchen prepares food
   - Order status: PENDING → COOKING → READY
   - Real-time notifications to waiter
5. **Serving** → Waiter delivers food
   - Order status: READY → SERVED
6. **Payment** → Customer pays
   - Order status: SERVED → PAID
   - Auto-calculate loyalty points
7. **Table Turnover** → Table cleaned
   - Table status: OCCUPIED → DIRTY → AVAILABLE

---

## 🎨 Design System

### Color Palette
- **Primary:** Gold (#D4AF37, #C5A033, #E2C25D)
- **Secondary:** Teal (#0D9488)
- **Semantic:**
  - Success: Green (#22C55E)
  - Warning: Amber (#D97706)
  - Error: Rose (#E11D48)
  - Info: Blue (#3B82F6)

### Typography
- **Sans-serif:** Inter (300-900 weights)
- **Serif:** Playfair Display (for headers)

### Spacing Scale
4px → 8px → 12px → 16px → 20px → 24px → 32px → 40px → 48px → 64px

### Components
- Cards (default, elevated, bordered)
- Buttons (primary, secondary, ghost)
- Badges (success, warning, error, info)
- Modals
- Toasts
- Data Tables
- Kanban Boards
- Floor Plan Grid

### Animations
- Fade Up
- Slide In (Left/Right)
- Scale In
- Float
- Pulse
- Shimmer (loading)
- Staggered children

---

## 📁 Project Structure

```
restaurant-platform/
├── src/main/java/com/restaurant/platform/
│   ├── config/                 # Security, CORS, WebSocket, JPA
│   ├── security/               # JWT filter, JwtService
│   ├── common/                 # Base entities, exceptions, utils
│   └── modules/
│       ├── auth/               # Login, Profile, Users, Roles
│       ├── dashboard/          # Role-based dashboards
│       ├── loyalty/            # Points, Tiers, Rewards
│       ├── menu/               # Menu items, Categories, Combos
│       ├── notification/       # Real-time notifications
│       ├── order/              # Orders, Order items
│       ├── payment/            # Payment processing
│       ├── report/             # Analytics, Reports
│       ├── reservation/        # Table bookings
│       └── table/              # Table management
│
└── frontend/src/
    ├── features/
    │   ├── auth/               # Login page
    │   ├── dashboard/          # 6 role-specific dashboards
    │   ├── profile/            # Universal profile page
    │   ├── menu/               # Menu browsing
    │   ├── orders/             # Order management
    │   ├── reservations/       # Reservation management
    │   ├── loyalty/            # Loyalty program
    │   ├── payment/            # Payment processing
    │   ├── report/             # Reports & analytics
    │   ├── staff/              # Staff management
    │   └── tables/             # Table map
    ├── components/ui/          # Reusable UI components
    ├── layouts/                # MainLayout, AuthLayout
    ├── services/               # API client, WebSocket, Types
    ├── store/                  # Zustand stores (auth, toast)
    ├── utils/                  # Role utilities, helpers
    └── styles/                 # Global CSS, components
```

---

## 🔐 Authentication & Authorization

### JWT Flow
1. User logs in with email/password
2. Server validates and returns:
   - Access token (15 min expiry)
   - Refresh token (7 days expiry)
3. Access token sent in `Authorization: Bearer <token>` header
4. Refresh token used to get new access token

### Role-Based Access Control
- **CUSTOMER:** View own data, make reservations, earn/redeem points
- **WAITER:** Manage orders, update order status, process payments
- **RECEPTIONIST:** Manage reservations, check-in customers, table map
- **KITCHEN:** View orders, update cooking status
- **MANAGER:** Full access to reports, menu, staff management
- **ADMIN:** Full system access, user management, config

---

## 🌟 Key Features

### 1. Profile System
- Universal `/profile` page for all roles
- Role-specific sections (Customer: Loyalty, Staff: Work info)
- Edit personal information
- Change password
- Logout from all devices

### 2. Loyalty Program
**Tiers:**
- **Silver:** Base tier, 1x points multiplier
- **Gold:** 500 points required, 1.5x multiplier
- **Platinum:** 1500 points required, 2x multiplier
- **Diamond:** 5000 points required, 3x multiplier

**Earning:** 1 point per $10 spent (multiplied by tier)
**Redeeming:** Use points for discounts

### 3. Real-time WebSocket
- Order status updates
- Kitchen notifications
- Table status changes
- Reservation reminders

### 4. Order Workflow
```
OPEN → PENDING → COOKING → READY → SERVED → PAID
                          ↓
                       CANCELED
```

### 5. Table Management
**Statuses:**
- AVAILABLE (Green)
- RESERVED (Yellow)
- OCCUPIED (Red)
- DIRTY (Gray)

---

## 🚀 Getting Started

### Backend
```bash
cd restaurant-platform
mvn spring-boot:run
```
Server runs on: `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on: `http://localhost:3000`

### Environment Variables
See `.env.example` for required variables:
- Database: PostgreSQL (localhost:5432)
- JWT Secret
- Mail configuration
- Payment gateway keys (VNPay, MoMo)

---

## 📊 API Endpoints

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

### Profile
- `GET /api/v1/profile/me`
- `PUT /api/v1/profile/me`

### Dashboard
- `GET /api/v1/dashboard` (Manager, Admin)

### Menu
- `GET /api/v1/menu`
- `POST /api/v1/menu` (Admin)
- `GET /api/v1/menu/{id}`
- `DELETE /api/v1/menu/{id}` (Admin)

### Orders
- `GET /api/v1/orders`
- `POST /api/v1/orders` (Waiter, Receptionist)
- `PATCH /api/v1/orders/{id}/status`
- `POST /api/v1/orders/{id}/pay`

### Reservations
- `GET /api/v1/reservations`
- `POST /api/v1/reservations`
- `POST /api/v1/reservations/{id}/check-in` (Receptionist)
- `POST /api/v1/reservations/{id}/cancel`

### Tables
- `GET /api/v1/tables`
- `PATCH /api/v1/tables/{id}/status` (Waiter, Manager)

### Loyalty
- `GET /api/v1/loyalty/me` (Customer)
- `POST /api/v1/loyalty/redeem` (Customer)
- `GET /api/v1/loyalty/all` (Admin, Manager)

### Reports
- `GET /api/v1/reports/revenue` (Manager)
- `GET /api/v1/reports/top-selling`
- `GET /api/v1/reports/no-show`
- `GET /api/v1/reports/occupancy`

### Notifications
- `GET /api/v1/notifications`
- `POST /api/v1/notifications` (Admin)
- `PUT /api/v1/notifications/{id}/read`

### WebSocket
- Endpoint: `/ws`
- Topics: `/topic/orders`, `/topic/tables`, `/topic/reservations`

---

## 🎨 UI/UX Features

### Animations
- Page transitions (Framer Motion)
- Staggered list animations
- Hover effects (lift, glow)
- Loading skeletons
- Smooth scrollbars

### Responsive Design
- Desktop: Full sidebar + grid layouts
- Tablet: 2-column grids
- Mobile: Single column, collapsible sidebar

### Accessibility
- Focus states
- Keyboard navigation
- ARIA labels
- Color contrast (WCAG AA)

---

## 📝 Development Conventions

### Backend
- Controller → Service → Repository pattern
- DTOs for API requests/responses
- Entity mappers (MapStruct)
- Exception handling with `@ControllerAdvice`
- Validation with `@Valid`

### Frontend
- Feature-based folder structure
- TypeScript strict mode
- Custom hooks for reusable logic
- Zustand for global state
- Component composition

---

## 🔮 Future Enhancements

- [ ] Multi-branch support
- [ ] Advanced analytics (ML predictions)
- [ ] Mobile app (React Native)
- [ ] Integration with delivery platforms
- [ ] Inventory management
- [ ] Employee scheduling
- [ ] Customer feedback system
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] PWA support

---

## 📄 License
Proprietary - ServeGenius Restaurant Platform

---

## 👨‍💻 Created By
Built with ❤️ for the restaurant industry

**Version:** 2.0.0  
**Last Updated:** April 2026
