# Restaurant Platform - Complete Startup Guide

## 🚀 Quick Start (Choose Your Method)

### Option 1: Automatic Build & Run Script (Recommended)
```bash
cd D:\restaurant-platform
BUILD_AND_RUN.bat
```

### Option 2: Manual Step-by-Step

#### Prerequisites Check
```bash
# Verify Java 21 is installed
java -version
# Expected: java version "21.x.x"

# Verify Maven works
mvnw.cmd -version
# Expected: Apache Maven 3.9+

# Verify Node.js is installed
node --version
# Expected: v18 or higher

npm --version
# Expected: v9 or higher
```

#### Step 1: Clean Previous Build
```bash
cd D:\restaurant-platform
mvnw.cmd clean
```

#### Step 2: Compile Backend
```bash
mvnw.cmd compile
# Expected: BUILD SUCCESS
```

#### Step 3: Package Backend
```bash
mvnw.cmd package -DskipTests
# Expected: BUILD SUCCESS, JAR created in target/
```

#### Step 4: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
# Expected: All packages installed successfully
```

#### Step 5: Build Frontend (Optional, for production)
```bash
cd frontend
npm run build
cd ..
# Expected: dist/ folder created with optimized bundle
```

#### Step 6: Start Backend
**Terminal 1:**
```bash
mvnw.cmd spring-boot:run
# Expected output:
# ...
# 2024-04-02 12:00:00.000  INFO : Started RestaurantPlatformApplication in X.XXX seconds
# 2024-04-02 12:00:01.000  INFO : Tomcat started on port(s): 8080 (http)
```

#### Step 7: Start Frontend Development Server
**Terminal 2:**
```bash
cd frontend
npm run dev
# Expected output:
# VITE v8.0.1 ready in XXX ms
# ➜  Local:   http://localhost:5173/
# ➜  Press q to quit
```

#### Step 8: Access Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080
- **Swagger API**: http://localhost:8080/swagger-ui.html (if enabled)
- **H2 Console**: http://localhost:8080/h2-console (dev only)

---

## 📱 Login Information

### Test Accounts (Auto-Created)
```
ADMIN ACCOUNT:
  Email: admin@restaurant.com
  Password: password123

STAFF ACCOUNT:
  Email: staff@restaurant.com
  Password: password123

CUSTOMER ACCOUNT:
  Email: customer@restaurant.com
  Password: password123
```

---

## 🔍 Troubleshooting

### Issue: Port 8080 Already in Use
**Solution 1:** Kill process on port 8080
```bash
# Find process using port 8080
netstat -ano | findstr :8080
# Kill the process (replace 1234 with PID)
taskkill /PID 1234 /F

# Or change port in application.properties
server.port=8081
```

### Issue: Port 5173 Already in Use
**Solution:** Vite will automatically use next available port
```bash
# Vite automatically tries: 5174, 5175, etc.
# Check terminal output for actual port
```

### Issue: Maven Compilation Fails
**Solution:**
```bash
# Clear Maven cache
mvnw.cmd clean install -DskipTests

# If still fails, check Java version
java -version  # Must be Java 21+

# If still fails, clear local Maven cache
rmdir /s %UserProfile%\.m2\repository
mvnw.cmd install -DskipTests
```

### Issue: Frontend Dependencies Failed to Install
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
cd frontend
rmdir /s node_modules
del package-lock.json

# Reinstall
npm install
```

### Issue: WebSocket Connection Failed
**Solution:** Ensure backend is running
```bash
# Check backend is alive
curl http://localhost:8080/api/health
# Expected: 200 OK response

# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:8080/ws
```

### Issue: API Returns 401 Unauthorized
**Solution:** JWT token expired or invalid
```bash
# Option 1: Login again in UI to get new token
# Option 2: Clear localStorage in browser
# Open DevTools (F12) → Application → localStorage → Clear all

# Then refresh and login again
```

### Issue: Database Connection Failed
**Solution:** H2 is embedded, but verify it's working
```bash
# Access H2 Console
# URL: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:restaurant_db
# Username: sa
# Password: (leave empty)
# Click Connect

# If H2 Console not accessible, check application.properties:
# spring.h2.console.enabled=true
```

### Issue: Page Refresh Shows "Page Not Found"
**Solution:** React Router issue with Vite
```bash
# This is normal in development
# Possible solutions:
# 1. Restart Vite dev server
# 2. Clear browser cache (Ctrl+Shift+Delete)
# 3. Try incognito window

# In production (npm run build), this won't happen
```

---

## ✅ Verification Checklist

### Backend Startup
- [ ] Terminal shows "Tomcat started on port(s): 8080"
- [ ] No ERROR or WARN messages
- [ ] Can access http://localhost:8080/api/health (200 OK)

### Frontend Startup
- [ ] Terminal shows "ready in XX ms"
- [ ] No compilation errors
- [ ] Can access http://localhost:5173
- [ ] No red errors in browser console (F12)

### Application Features
- [ ] Login page loads
- [ ] Can login with admin@restaurant.com / password123
- [ ] Dashboard shows statistics
- [ ] Menu page loads with categories
- [ ] Tables page shows 10 tables
- [ ] Orders page allows creating orders
- [ ] Reservations page loads
- [ ] Reports show data

### API Connectivity
- [ ] Frontend can communicate with backend
- [ ] API calls have JWT token in headers
- [ ] WebSocket connection established (check Network → WS)
- [ ] Real-time updates work (create order, see instant update)

### Database
- [ ] H2 Console accessible at http://localhost:8080/h2-console
- [ ] Demo data loaded (users, categories, items, tables)
- [ ] Can query tables

---

## 📚 Documentation Reference

- **GETTING_STARTED.md** - Quick start guide
- **README.md** - Project overview
- **API_DOCUMENTATION.md** - Complete API reference
- **DEPLOYMENT.md** - Production deployment guide
- **TESTING_GUIDE.md** - Testing strategies
- **UI_ENHANCEMENT_GUIDE.md** - UI improvements
- **CONTRIBUTING.md** - Development guidelines
- **QUICK_REFERENCE.md** - Command reference

---

## 🛠️ Useful Commands

### Backend
```bash
# Clean and compile
mvnw.cmd clean compile

# Run tests
mvnw.cmd test

# Run specific test
mvnw.cmd test -Dtest=AuthServiceTest

# Run with specific profile
mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Build production JAR
mvnw.cmd package -P production

# Run production JAR
java -jar target/restaurant-platform-0.0.1-SNAPSHOT.jar --server.port=8080
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Run tests (if configured)
npm test
```

### Database
```bash
# Access H2 Console (development)
# http://localhost:8080/h2-console

# Useful H2 Queries:
SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM menu_items;
SELECT * FROM orders;
SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED';
```

---

## 🔐 Security Notes

### Development Environment
- Default JWT secret in application.properties (CHANGE in production)
- H2 in-memory database (data lost on restart)
- CORS allows localhost:5173 (dev only)
- WebSocket allows all origins (CHANGE in production)

### Production Setup
- [ ] Change JWT_SECRET to strong random value
- [ ] Use PostgreSQL or MySQL instead of H2
- [ ] Set CORS to specific domains only
- [ ] Enable HTTPS/TLS
- [ ] Use environment variables for secrets
- [ ] Enable security headers
- [ ] Set up proper firewall rules

See **DEPLOYMENT.md** for complete production checklist.

---

## 📊 Development Workflow

### Daily Development
```bash
# Terminal 1: Backend
cd D:\restaurant-platform
mvnw.cmd spring-boot:run

# Terminal 2: Frontend
cd D:\restaurant-platform\frontend
npm run dev

# Terminal 3: Database (if using external DB)
# e.g., MySQL: mysql -u root -p
```

### Making Code Changes
```bash
# Backend changes:
# 1. Edit Java files
# 2. Spring Boot dev tools auto-reload (5-10 seconds)
# 3. Refresh browser to see changes

# Frontend changes:
# 1. Edit TypeScript/React files
# 2. Vite hot reload (instant)
# 3. Changes appear in browser automatically
```

### Before Committing
```bash
# Backend
mvnw.cmd clean test
mvnw.cmd checkstyle:check  # if configured

# Frontend
npm run lint
npm test  # if configured

# Git
git add .
git commit -m "descriptive message"
git push
```

---

## 📈 Performance Optimization

### Frontend
```bash
# Analyze bundle size
npm run build -- --analyze

# Current bundle: ~400KB (gzipped)
# Target: < 500KB for good performance
```

### Backend
```bash
# Check startup time
# Look for: "Started RestaurantPlatformApplication in X seconds"
# Target: < 10 seconds for fresh start

# Monitor memory usage
# Expected: 200-400MB during normal operation
```

---

## 🧪 Testing

### Quick Test
```bash
# Backend smoke test
mvnw.cmd test -Dtest=RestaurantPlatformApplicationTests

# All backend tests
mvnw.cmd test

# Specific module test
mvnw.cmd test -Dtest="*AuthServiceTest"
```

### Manual Testing Checklist
1. Login flow
2. Create order flow
3. Update order status
4. Reservation creation
5. Payment processing
6. Report generation
7. Real-time WebSocket updates

See **TESTING_GUIDE.md** for comprehensive testing strategies.

---

## 🚢 Deployment

### Docker Setup (Optional)
```bash
# Build Docker image
docker build -t restaurant-platform .

# Run Docker container
docker run -p 8080:8080 -p 5173:5173 restaurant-platform
```

### Production Deployment
See **DEPLOYMENT.md** for:
- AWS deployment
- Azure deployment
- GCP deployment
- Kubernetes setup
- CI/CD pipeline

---

## 📞 Support

### Common Issues
- See "Troubleshooting" section above
- Check browser console (F12) for errors
- Check backend logs for exceptions
- Check network tab for failed API calls

### Getting Help
1. Check documentation files in repository
2. Review error messages carefully
3. Search for similar issues
4. Check Spring Boot and React documentation

---

## 🎯 Next Steps

1. **Backend Verification**
   ```bash
   mvnw.cmd clean install -DskipTests
   mvnw.cmd spring-boot:run
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Application**
   - Open http://localhost:5173
   - Login with demo credentials
   - Test features

4. **Run Tests**
   ```bash
   mvnw.cmd test
   ```

5. **Review Documentation**
   - Read API_DOCUMENTATION.md
   - Review TESTING_GUIDE.md
   - Check UI_ENHANCEMENT_GUIDE.md

6. **Start Development**
   - Make changes to code
   - Test locally
   - Commit to version control
   - Deploy to staging/production

---

**Status**: ✅ Ready to Run
**Last Updated**: April 2, 2026
**Version**: 1.0.0 Production Ready
