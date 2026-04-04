# Restaurant Platform - Unit Tests Quick Reference

## 🚀 Quick Start (2 minutes)

### Step 1: Create Directory Structure & Move Files
```batch
cd D:\restaurant-platform
organize_tests.bat
```

### Step 2: Run All Tests
```bash
mvn clean test
```

### Step 3: View Results
Tests will run in ~30-60 seconds with output showing:
- Test counts
- Success/Failure results
- Execution time

---

## 📁 Test Files Location

After organization, files will be at:

```
✓ src/test/java/com/restaurant/platform/modules/auth/service/AuthServiceTest.java
✓ src/test/java/com/restaurant/platform/modules/order/service/OrderServiceTest.java
✓ src/test/java/com/restaurant/platform/modules/menu/service/MenuServiceTest.java
✓ src/test/java/com/restaurant/platform/modules/loyalty/service/LoyaltyServiceTest.java
```

---

## 📊 Test Coverage

| Service | Tests | Methods Covered |
|---------|-------|-----------------|
| **Auth** | 10 | Login, JWT, Password, Refresh, Logout |
| **Order** | 10 | CRUD, Status, Items, Total, Cancel |
| **Menu** | 9 | CRUD, Search, Categories, Pagination |
| **Loyalty** | 10 | Points, Tiers, Transactions, History |
| **TOTAL** | **39** | **Core Business Logic** |

---

## ⚡ Common Commands

### Run All Tests
```bash
mvn clean test
```

### Run Specific Module Tests
```bash
mvn test -Dtest=AuthServiceTest
mvn test -Dtest=OrderServiceTest
mvn test -Dtest=MenuServiceTest
mvn test -Dtest=LoyaltyServiceTest
```

### Run Single Test Method
```bash
mvn test -Dtest=AuthServiceTest#testLoginSuccess
```

### Run with Code Coverage
```bash
mvn clean test jacoco:report
```

### Generate Coverage Report
```bash
mvn jacoco:report
# Then open: target/site/jacoco/index.html
```

### Parallel Test Execution
```bash
mvn test -DthreadCount=4
```

---

## 🔍 Test Details

### AuthServiceTest (10 tests)
✓ Login success with valid credentials
✓ Login failure with invalid credentials  
✓ Login with non-existent user
✓ Refresh token success
✓ Refresh token expiration handling
✓ Password encoding during registration
✓ Password matching after encoding
✓ Different password validation
✓ Token invalidation on logout
✓ Multiple roles handling

### OrderServiceTest (10 tests)
✓ Create order successfully
✓ Handle missing table
✓ Prevent duplicate orders
✓ Add items to order
✓ Remove items from order
✓ Update order status
✓ Get order by ID
✓ Cancel order
✓ Calculate order total
✓ Get orders by table

### MenuServiceTest (9 tests)
✓ Create menu item successfully
✓ Handle missing category
✓ Get all menu items
✓ Search menu items
✓ Get menu item by ID
✓ Update menu item availability
✓ Delete menu item
✓ Get items by category
✓ Get items with pagination

### LoyaltyServiceTest (10 tests)
✓ Add points to account
✓ Redeem points successfully
✓ Handle insufficient points
✓ Get account points
✓ Calculate BRONZE tier (0-999)
✓ Calculate SILVER tier (1000-4999)
✓ Calculate GOLD tier (5000-9999)
✓ Calculate PLATINUM tier (10000+)
✓ Get loyalty history
✓ Record transactions

---

## 📋 Setup Methods

### Method 1: Batch Script (Recommended)
```batch
organize_tests.bat
```
✓ Easiest and fastest
✓ One command does everything
✓ Works on all Windows systems

### Method 2: Manual Commands
```batch
mkdir src\test\java\com\restaurant\platform\modules\auth\service
mkdir src\test\java\com\restaurant\platform\modules\order\service
mkdir src\test\java\com\restaurant\platform\modules\menu\service
mkdir src\test\java\com\restaurant\platform\modules\loyalty\service

move AuthServiceTest.java src\test\java\com\restaurant\platform\modules\auth\service\
move OrderServiceTest.java src\test\java\com\restaurant\platform\modules\order\service\
move MenuServiceTest.java src\test\java\com\restaurant\platform\modules\menu\service\
move LoyaltyServiceTest.java src\test\java\com\restaurant\platform\modules\loyalty\service\
```

### Method 3: Python
```bash
python create_test_dirs.py
```
Then move files manually

---

## ✅ Verification Checklist

After setup, verify with:

- [ ] Directories created: `dir src\test\java\com\restaurant\platform\modules /s /b`
- [ ] Test files moved: `dir src\test\java\com\restaurant\platform\modules\*\service\*Test.java /s`
- [ ] Files compile: `mvn test-compile`
- [ ] Tests found: `mvn test --test | grep "Tests run"`
- [ ] Tests pass: `mvn clean test`

---

## 🛠️ Troubleshooting

### Tests Not Found
**Problem**: Maven can't find test files
**Solution**: 
- Refresh IDE (F5/Cmd+R)
- Check directory structure with `dir src\test\java\com\restaurant\platform\modules /s`
- Verify package declarations match directories

### Permission Denied
**Problem**: Can't move files
**Solution**:
- Close IDE/text editor
- Run Command Prompt as Administrator
- Try again

### Tests Fail to Compile
**Problem**: Import errors
**Solution**:
- Check pom.xml has JUnit 5 and Mockito dependencies
- Run `mvn clean install`
- Refresh IDE

### Tests Run but Some Fail
**Problem**: Individual test failures
**Solution**:
- Check mock setup in BeforeEach
- Verify repository methods match actual implementation
- Review test assertions match expected values
- Check test data initialization

---

## 📚 Documentation

For more details:
- **Setup Guide**: `TEST_SETUP_GUIDE.md`
- **Full Documentation**: `TEST_FILES_README.md`
- **Summary**: `UNIT_TESTS_SUMMARY.md`

---

## 🎯 Next Steps After Setup

1. **Organize files** (run organize_tests.bat)
2. **Refresh IDE** (F5 or Cmd+R)
3. **Run tests** (mvn clean test)
4. **Review results** (console output)
5. **Generate coverage** (mvn jacoco:report)
6. **Commit to Git** (if using version control)

---

## 📈 Expected Results

✅ All 39 tests should pass in ~30-60 seconds
✅ 0 failures expected
✅ Code coverage should be 85-90% for core services
✅ All mocks should be used correctly

```
[INFO] Tests run: 39, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 🔗 Useful Links

- **Spring Boot Testing**: https://spring.io/guides/gs/testing-web/
- **Mockito Documentation**: https://javadoc.io/doc/org.mockito/mockito-core/
- **JUnit 5 User Guide**: https://junit.org/junit5/docs/current/user-guide/
- **Maven Testing**: https://maven.apache.org/surefire/maven-surefire-plugin/

---

## 💡 Tips

### Run Tests Faster
```bash
mvn test -DskipTests=false -DfailIfNoTests=false
```

### View Test Output in IDE
Most IDEs show real-time test results:
- **IntelliJ IDEA**: Run → Run 'Tests'
- **Eclipse**: Run As → JUnit Test
- **VS Code**: Install Test Runner extension

### Generate HTML Coverage Report
```bash
mvn clean test jacoco:report
# Opens at: target/site/jacoco/index.html
```

### Skip Tests During Build
```bash
mvn clean install -DskipTests
```

---

## 📞 Support

If you encounter issues:

1. Check TEST_SETUP_GUIDE.md for troubleshooting
2. Review TEST_FILES_README.md for detailed documentation
3. Verify directory structure matches documentation
4. Ensure all dependencies are in pom.xml
5. Clean and rebuild: `mvn clean install`

---

**Created**: Restaurant Platform Unit Tests
**Test Framework**: JUnit 5 with Mockito
**Target Coverage**: 85-90%
**Execution Time**: <1 minute (all 39 tests)

Ready to run! 🚀
