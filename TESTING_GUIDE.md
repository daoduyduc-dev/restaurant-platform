# 🧪 Testing Guide - ServeGenius Restaurant Platform

## 🚀 How to Start

### Terminal 1 - Backend
```bash
cd D:\restaurant-platform
mvn spring-boot:run
```
✅ Backend runs on: `http://localhost:8080`

### Terminal 2 - Frontend
```bash
cd D:\restaurant-platform\frontend
npm run dev
```
✅ Frontend runs on: `http://localhost:3000` (or the port shown in terminal)

---

## 👥 Demo Users (6 Roles)

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | admin@servegenius.com | admin123 | Full system control |
| **Manager** | manager@servegenius.com | manager123 | Operations & Reports |
| **Waiter** | waiter@servegenius.com | waiter123 | Orders & Tables |
| **Receptionist** | receptionist@servegenius.com | reception123 | Reservations |
| **Kitchen** | kitchen@servegenius.com | kitchen123 | Kitchen Display |
| **Customer** | customer@servegenius.com | customer123 | Loyalty & Reservations |

---

## 🎯 What to Test

### 1. **Login Page** (`http://localhost:3000/login`)
- ✅ Beautiful split-screen design (branding left, form right)
- ✅ Quick Login buttons for all 6 demo users
- ✅ Show/hide password toggle
- ✅ Form validation
- ✅ Error messages display
- ✅ Loading spinner during login
- ✅ Auto-redirect to role-specific dashboard

**Test Steps:**
1. Open `http://localhost:3000/login`
2. Click any Quick Login button (e.g., "Admin")
3. Should redirect to dashboard immediately
4. Or manually enter email/password and click "Sign In"

---

### 2. **Role-Based Dashboards**

#### **Admin Dashboard** (`/`)
- Login as: `admin@servegenius.com`
- Should see:
  - User management table
  - System configuration cards
  - Stats: Total Users, Active Users, Roles, Uptime
  - Sidebar: User Management, Menu, Tables, Reports, Settings

#### **Manager Dashboard** (`/`)
- Login as: `manager@servegenius.com`
- Should see:
  - Revenue overview cards
  - Top selling items
  - Staff on duty count
  - Sidebar: Menu, Tables, Orders, Reservations, Reports, Staff, Loyalty

#### **Waiter Dashboard** (`/`)
- Login as: `waiter@servegenius.com`
- Should see:
  - My Tables count
  - Active Orders
  - Ready to Serve orders
  - Sidebar: Orders, Table Map, Payments

#### **Receptionist Dashboard** (`/`)
- Login as: `receptionist@servegenius.com`
- Should see:
  - Today's Reservations list
  - Table Map overview
  - Check-in/Cancel buttons
  - Sidebar: Reservations, Table Map

#### **Kitchen Dashboard** (`/`)
- Login as: `kitchen@servegenius.com`
- Should see:
  - Pending Orders (to start cooking)
  - Currently Cooking orders
  - Mark Ready buttons
  - Sidebar: Kitchen Display, All Orders

#### **Customer Dashboard** (`/`)
- Login as: `customer@servegenius.com`
- Should see:
  - Loyalty Status card (Silver/Gold/Platinum/Diamond)
  - Upcoming Reservations
  - Favorite Dishes
  - Sidebar: My Reservations, Browse Menu, Loyalty Rewards

---

### 3. **Profile Page** (`/profile`)
- Login as ANY user
- Navigate to Profile in sidebar
- Should see:
  - Avatar with initial letter
  - Personal information (name, email, phone, address)
  - Role badges
  - Account status (Active/Inactive)
  - Edit Profile button
  - Change Password modal
  - Logout button
  - Role-specific sections:
    - **Customer**: Loyalty Information (points, tier, progress)
    - **Staff**: Work Information (position, join date, shift)

**Test Steps:**
1. Login as any user
2. Click "Profile" in sidebar footer
3. Click "Edit Profile" to edit fields
4. Click "Change Password" to open modal
5. Verify role-specific sections appear

---

### 4. **Authorization Tests**

#### URL Access Control
Try accessing these URLs while logged in as different roles:

| URL | Admin | Manager | Waiter | Receptionist | Kitchen | Customer |
|-----|-------|---------|--------|--------------|---------|----------|
| `/api/v1/dashboard` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/reports/**` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/users/**` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/api/v1/loyalty/me` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/v1/profile/me` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Expected Behavior:**
- Unauthorized access returns `403 Forbidden`
- Frontend should handle errors gracefully
- Sidebar only shows allowed navigation items

---

### 5. **UI/UX Features to Test**

#### Animations
- ✅ Page transitions (smooth fade/slide)
- ✅ Hover effects on cards (lift up)
- ✅ Button hover states (glow, transform)
- ✅ Loading spinners
- ✅ Toast notifications (slide in from right)
- ✅ Modal animations (scale in)

#### Responsive Design
- Resize browser window to test:
  - Desktop (>1280px): Full 4-column stats grid
  - Tablet (768px-1280px): 2-column grids
  - Mobile (<768px): Single column, collapsible sidebar

#### Visual Effects
- ✅ Glassmorphism on some components
- ✅ Gradient backgrounds (gold, teal, rose, purple)
- ✅ Soft shadows and glows
- ✅ Smooth color transitions
- ✅ Custom scrollbars

---

### 6. **Navigation Test**

#### Sidebar Changes Per Role
Each role should see different navigation items:

**Admin Sidebar:**
- Main → Dashboard
- Administration → User Management, Menu, Tables
- System → Reports, Settings
- Profile (footer)
- Sign Out (footer)
- Role badge: "ADMIN"

**Manager Sidebar:**
- Main → Dashboard
- Operations → Menu, Tables, Orders, Reservations
- Analytics → Reports, Staff, Loyalty
- Profile (footer)
- Sign Out (footer)
- Role badge: "MANAGER"

**Waiter Sidebar:**
- Main → Dashboard
- Service → Orders, Table Map, Payments
- Profile (footer)
- Sign Out (footer)
- Role badge: "WAITER"

**Receptionist Sidebar:**
- Main → Dashboard
- Front Desk → Reservations, Table Map
- Profile (footer)
- Sign Out (footer)
- Role badge: "RECEPTIONIST"

**Kitchen Sidebar:**
- Main → Dashboard
- Kitchen → Kitchen Display, All Orders
- Profile (footer)
- Sign Out (footer)
- Role badge: "KITCHEN"

**Customer Sidebar:**
- Main → Dashboard
- Dining → My Reservations, Browse Menu, Loyalty Rewards
- Profile (footer)
- Sign Out (footer)
- Role badge: "CUSTOMER"

---

## 🐛 Common Issues & Solutions

### Issue: "Backend server is not available"
**Solution:** 
```bash
cd D:\restaurant-platform
mvn spring-boot:run
```
Wait for "Started RestaurantPlatformApplication" message

### Issue: "403 Forbidden" on dashboard
**Solution:** 
- Make sure you're logged in with correct role
- Check browser console for specific error
- Verify token in localStorage

### Issue: "Database not seeded"
**Solution:**
- First run will auto-seed database
- Delete `data.mv.db` file and restart if needed
- Check logs for "DATABASE SEEDED SUCCESSFULLY"

### Issue: Frontend not loading
**Solution:**
```bash
cd D:\restaurant-platform\frontend
npm install
npm run dev
```

---

## ✅ Test Checklist

- [ ] Login page loads with beautiful design
- [ ] Quick Login buttons work for all 6 users
- [ ] Each role redirects to correct dashboard
- [ ] Sidebar shows role-specific navigation
- [ ] Profile page loads with correct data
- [ ] Edit profile works
- [ ] Change password works
- [ ] Logout works
- [ ] Stats cards show correct data
- [ ] Tables display correctly
- [ ] Orders display correctly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Responsive design works
- [ ] Authorization prevents unauthorized access

---

## 📊 Expected Results

### After Login as Admin:
1. See Admin Dashboard
2. Sidebar shows: Dashboard, User Management, Menu, Tables, Reports, Settings
3. Footer shows: Profile, Sign Out
4. Role badge: "ADMIN"
5. Can access all endpoints
6. Can manage users, menu, tables
7. Can view reports

### After Login as Customer:
1. See Customer Dashboard
2. Sidebar shows: Dashboard, My Reservations, Browse Menu, Loyalty Rewards
3. Footer shows: Profile, Sign Out
4. Role badge: "CUSTOMER"
5. Can view loyalty points
6. Can make reservations
7. Cannot access admin/manager endpoints

---

## 🎨 UI Highlights

### Login Page
- Split-screen layout (branding + form)
- Quick Login buttons with emoji icons
- Show/hide password toggle
- Animated entrance
- Gradient backgrounds
- Hover effects

### Dashboards
- Role-specific content
- Stats cards with icons
- Charts and graphs
- Data tables
- Action buttons

### Profile Page
- Avatar with gradient
- Edit form
- Change password modal
- Role-specific sections
- Security settings

### Sidebar
- Role badge display
- Contextual navigation
- Smooth transitions
- Active state highlighting
- Profile link in footer

---

## 🚀 Next Steps After Testing

1. **Add real data**: Create more menu items, tables, orders
2. **Test workflows**: Full reservation → check-in → order → kitchen → payment flow
3. **WebSocket testing**: Real-time updates for orders and tables
4. **Loyalty testing**: Earn points, tier upgrades, redeem rewards
5. **Mobile testing**: Test on actual mobile devices
6. **Performance testing**: Load testing with multiple users

---

**All tests should pass with no errors!** 🎉

If you encounter any issues, check:
- Backend logs for Java exceptions
- Browser console for JavaScript errors
- Network tab for API request/response details
- Database connection settings
