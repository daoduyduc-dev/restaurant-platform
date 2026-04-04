# 🚀 Restaurant Platform - Quick Start

## ⚡ Get Started in 3 Steps

### Step 1: Clean Project (Optional)
If you want to remove old test/temporary files:
```bash
DELETE_TEMP_FILES.bat
```

### Step 2: Build & Setup
Run this to compile everything:
```bash
SETUP_AND_RUN.bat
```

This will:
- ✅ Clean old builds
- ✅ Compile backend (Maven)
- ✅ Install frontend dependencies (npm)
- ✅ Build frontend (Vite)
- ✅ Optionally start the backend

### Step 3: Run Both Servers

**Option A: Separate Terminals (Recommended)**
```bash
Terminal 1:  RUN_BACKEND.bat    # Backend on http://localhost:8080
Terminal 2:  RUN_FRONTEND.bat   # Frontend on http://localhost:3000
```

**Option B: Manual Start**
```bash
# Terminal 1 - Backend
mvnw.cmd spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@restaurant.com | admin123 |
| Manager | manager@restaurant.com | manager123 |
| Waiter | waiter@restaurant.com | waiter123 |
| Receptionist | receptionist@restaurant.com | receptionist123 |
| Chef | chef@restaurant.com | chef123 |

---

## 📱 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Database** (if using): http://localhost:8080/h2-console

---

## 📋 What's Included

✅ **Backend**
- Spring Boot 4.0.3 with Java 21
- PostgreSQL Database
- JWT Authentication with Role-Based Access
- Real-time WebSocket Support
- Email Notifications
- Payment Integration (VNPay, Momo)
- Loyalty Program
- Complete API (Swagger Documented)

✅ **Frontend**
- React 19 with TypeScript
- Luxury UI Design (Gold & Teal)
- Real-time Updates (WebSocket)
- Responsive Design (Mobile/Tablet/Desktop)
- Charts & Analytics (Recharts)
- Toast Notifications

✅ **Features**
- 🔐 Multi-role authentication
- 📋 Order management
- 🪑 Table management
- 📅 Reservations
- 🍽️ Menu management
- 💳 Payment processing
- ⭐ Loyalty program
- 📊 Analytics & reports
- 📧 Email notifications
- 🔄 Real-time updates

---

## 🔧 Configuration

### Backend
Database is configured to run locally:
```properties
# src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/restaurant_db
spring.datasource.username=postgres
spring.datasource.password=123456
```

**Note**: Update these values for your PostgreSQL setup!

### Frontend
API endpoint is configured for localhost:
```typescript
// frontend/src/services/api.ts
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## 🐛 Troubleshooting

**Port Already in Use?**
```bash
# Change backend port
mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"

# Change frontend port
cd frontend && npm run dev -- --port 3001
```

**Database Connection Failed?**
- Ensure PostgreSQL is running
- Check credentials in application.properties
- Create database: `CREATE DATABASE restaurant_db;`

**npm install Issues?**
```bash
cd frontend
npm cache clean --force
rm -rf node_modules
npm install
```

---

## 📚 Learn More

- See `README.md` for full documentation
- See `DEPLOYMENT.md` for production deployment
- See `API_DOCUMENTATION.md` for API details

---

**Happy Coding! 🎉**
