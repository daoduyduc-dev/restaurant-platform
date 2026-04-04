# 🏪 Restaurant Platform - Getting Started

## Quick Start (5 minutes)

### Prerequisites
- Java 21 JDK
- Node.js 18+
- Maven 3.9+ (included as `mvnw`)

### Step 1: Clone & Navigate
```bash
cd D:\restaurant-platform
```

### Step 2: Build Backend
```bash
mvnw.cmd clean install -DskipTests
```

Expected output: `BUILD SUCCESS`

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Start Backend (One Terminal)
```bash
mvnw.cmd spring-boot:run
```

Expected output: `Tomcat started on port(s): 8080`

### Step 5: Start Frontend (Another Terminal)
```bash
cd frontend
npm run dev
```

Expected output: `VITE v8.0.1 running at: http://localhost:5173/`

### Step 6: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html (optional)

---

## Login Credentials (Demo Data)

### Admin Account
- **Email**: admin@restaurant.com
- **Password**: password123

### Staff Account
- **Email**: staff@restaurant.com
- **Password**: password123

### Customer Account
- **Email**: customer@restaurant.com
- **Password**: password123

---

## Project Structure

```
restaurant-platform/
├── src/                          # Backend (Java Spring Boot)
│   ├── main/
│   │   ├── java/
│   │   │   └── com/restaurant/platform/
│   │   │       ├── modules/         # Business modules
│   │   │       │   ├── auth/        # Authentication & authorization
│   │   │       │   ├── menu/        # Menu & categories
│   │   │       │   ├── order/       # Orders & items
│   │   │       │   ├── reservation/ # Reservations
│   │   │       │   ├── table/       # Table management
│   │   │       │   ├── payment/     # Payment processing
│   │   │       │   ├── report/      # Reporting & analytics
│   │   │       │   ├── loyalty/     # Loyalty programs
│   │   │       │   ├── notification/# Notifications
│   │   │       │   └── dashboard/   # Dashboard stats
│   │   │       ├── common/          # Shared utilities
│   │   │       ├── bootstrap/       # Data initialization
│   │   │       ├── config/          # App configuration
│   │   │       └── security/        # Security config
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       └── application-prod.properties
│   └── test/                    # Backend tests
│
├── frontend/                    # Frontend (React 19 + TypeScript)
│   ├── src/
│   │   ├── features/            # Feature modules
│   │   │   ├── auth/            # Login/logout pages
│   │   │   ├── menu/            # Menu browsing
│   │   │   ├── order/           # Order creation
│   │   │   ├── reservation/     # Reservation booking
│   │   │   ├── table/           # Table management (admin)
│   │   │   ├── report/          # Reports (admin)
│   │   │   ├── loyalty/         # Loyalty program
│   │   │   └── dashboard/       # Dashboard (admin)
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # API & WebSocket services
│   │   ├── store/               # State management (Zustand)
│   │   ├── styles/              # CSS/styling
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── pom.xml                      # Maven configuration
├── mvnw & mvnw.cmd              # Maven wrapper
├── README.md                    # This file
├── DEPLOYMENT.md                # Deployment guide
├── API_DOCUMENTATION.md         # API reference
├── CONTRIBUTING.md              # Contributing guidelines
└── .env.example                 # Environment variables example

```

---

## Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- WebSocket secured with JWT tokens
- Password encryption with bcrypt

### 🍽️ Menu Management
- Categories and menu items
- Item descriptions and pricing
- Admin panel to manage menu

### 📋 Orders
- Create, view, update orders
- Order status tracking
- Real-time order updates via WebSocket
- Order items with quantity and price

### 🪑 Table Management
- Table status (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
- Capacity management
- QR code for quick ordering (setup in future)

### 📅 Reservations
- Book tables in advance
- Reservation status tracking
- Guest list management

### 💳 Payment Processing
- Order payment processing
- Payment method selection
- Transaction history

### 📊 Reports & Analytics
- Revenue reports (total, daily, monthly)
- Top-selling items
- No-show analytics
- Table occupancy reports

### 🎁 Loyalty Program
- Points accumulation on orders
- Points redemption
- Loyalty tier system

### 📬 Notifications
- Order status notifications
- Reservation confirmations
- Payment receipts

### 📈 Dashboard
- Real-time statistics
- Revenue metrics
- Order volume
- Table status overview

---

## Environment Configuration

### Development (.env.example)
```
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
DATABASE_URL=jdbc:mysql://localhost:3306/restaurant_db
DATABASE_USERNAME=root
DATABASE_PASSWORD=password
JWT_SECRET=your-secret-key-min-256-chars
JWT_EXPIRATION=86400000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Database Setup
```bash
# Using H2 (default for dev)
# Automatic in-memory database, no setup needed

# Using MySQL (for production)
mysql -u root -p
CREATE DATABASE restaurant_db;
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON restaurant_db.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Common Commands

### Backend
```bash
# Clean and build
mvnw.cmd clean install -DskipTests

# Run application
mvnw.cmd spring-boot:run

# Run tests
mvnw.cmd test

# Build JAR
mvnw.cmd package

# Run JAR
java -jar target/restaurant-platform-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Troubleshooting

### Backend won't compile
```bash
# Clear Maven cache and rebuild
mvnw.cmd clean install
```

### Frontend dependencies missing
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install
```

### Port 8080 already in use
```bash
# Change port in application.properties
server.port=8081
```

### Port 5173 already in use
```bash
# Vite will automatically use next available port
npm run dev
```

### Database connection failed
```bash
# Check H2 console at http://localhost:8080/h2-console
# Default credentials: sa / (empty password)
```

### WebSocket connection failed
```bash
# Ensure backend is running and JWT token is valid
# Check browser console for detailed error messages
```

---

## API Endpoints

See `API_DOCUMENTATION.md` for complete API reference.

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Menu
- `GET /api/menu/categories` - List categories
- `GET /api/menu/items` - List items
- `GET /api/menu/items/{id}` - Get item details

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}` - Update order

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - List reservations
- `PUT /api/reservations/{id}` - Update reservation

### Tables
- `GET /api/tables` - List tables
- `GET /api/tables/{id}` - Get table details
- `PUT /api/tables/{id}/status` - Update table status

### Reports
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/top-items` - Top-selling items
- `GET /api/reports/occupancy` - Table occupancy

### Loyalty
- `GET /api/loyalty/balance` - Get loyalty points
- `POST /api/loyalty/redeem` - Redeem points

---

## Testing

### Backend Tests
```bash
# Run all tests
mvnw.cmd test

# Run specific test
mvnw.cmd test -Dtest=AuthServiceTest
```

### Frontend Tests
```bash
# E2E tests with Playwright
npm run test:e2e
```

---

## Deployment

See `DEPLOYMENT.md` for comprehensive deployment guide including:
- Docker containerization
- Kubernetes deployment
- AWS deployment
- Azure deployment
- GCP deployment
- CI/CD setup

---

## Contributing

See `CONTRIBUTING.md` for:
- Code style guidelines
- Commit message format
- Pull request process
- Feature development workflow

---

## Support & Documentation

- **README.md** - This file
- **API_DOCUMENTATION.md** - Complete API reference
- **DEPLOYMENT.md** - Deployment and operations guide
- **CONTRIBUTING.md** - Development guidelines
- **QUICK_REFERENCE.md** - Quick lookup for commands and configs

---

## License

This project is proprietary software. All rights reserved.

---

**Last Updated**: April 2, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
