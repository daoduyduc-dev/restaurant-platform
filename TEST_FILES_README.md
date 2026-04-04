# Restaurant Platform - Unit Test Files

This document describes the comprehensive unit test files created for the Restaurant Platform backend services.

## Overview

Four unit test files have been created to thoroughly test critical backend services:
- **AuthServiceTest.java** - Authentication and JWT handling
- **OrderServiceTest.java** - Order management and operations
- **MenuServiceTest.java** - Menu and menu item management
- **LoyaltyServiceTest.java** - Loyalty points and tier management

## Test Files Location

All test files should be placed in the following directory structure:

```
src/test/java/com/restaurant/platform/modules/
├── auth/service/
│   └── AuthServiceTest.java
├── order/service/
│   └── OrderServiceTest.java
├── menu/service/
│   └── MenuServiceTest.java
└── loyalty/service/
    └── LoyaltyServiceTest.java
```

## Setup Instructions

### Step 1: Create Directory Structure

Run the provided batch script to create all necessary directories:

```bash
cd D:\restaurant-platform
organize_tests.bat
```

Or manually create the directories using Command Prompt:

```cmd
mkdir src\test\java\com\restaurant\platform\modules\auth\service
mkdir src\test\java\com\restaurant\platform\modules\order\service
mkdir src\test\java\com\restaurant\platform\modules\menu\service
mkdir src\test\java\com\restaurant\platform\modules\loyalty\service
```

### Step 2: Place Test Files

Move the test files from the root directory to their respective module directories:

- `AuthServiceTest.java` → `src/test/java/com/restaurant/platform/modules/auth/service/`
- `OrderServiceTest.java` → `src/test/java/com/restaurant/platform/modules/order/service/`
- `MenuServiceTest.java` → `src/test/java/com/restaurant/platform/modules/menu/service/`
- `LoyaltyServiceTest.java` → `src/test/java/com/restaurant/platform/modules/loyalty/service/`

### Step 3: Verify Dependencies

Ensure your `pom.xml` includes the necessary test dependencies:

```xml
<!-- JUnit 5 -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>

<!-- Mockito -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>

<!-- Spring Boot Test -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

## Test File Details

### 1. AuthServiceTest.java

**Purpose**: Tests JWT generation, login, password hashing, and token management.

**Mocked Components**:
- `AuthenticationManager` - Authenticates user credentials
- `JwtService` - Generates and validates JWT tokens
- `RefreshTokenRepository` - Manages refresh tokens
- `BlacklistRepository` - Tracks blacklisted tokens
- `UserRepository` - Retrieves user data
- `PasswordEncoder` - Encodes and matches passwords
- `EmailService` - Sends email notifications

**Test Cases** (10 tests):
1. `testLoginSuccess` - Validates successful login with correct credentials
2. `testLoginInvalidCredentials` - Verifies exception on invalid credentials
3. `testLoginUserNotFound` - Validates exception when user doesn't exist
4. `testRefreshTokenSuccess` - Tests successful token refresh
5. `testRefreshTokenExpired` - Validates exception for expired refresh token
6. `testPasswordEncodingDuringRegistration` - Verifies password is encoded during registration
7. `testPasswordMatchesAfterEncoding` - Validates correct password matches encoded password
8. `testPasswordDoesNotMatchDifferentPassword` - Ensures different passwords don't match
9. `testLogoutInvalidatesToken` - Verifies token is blacklisted on logout
10. `testMultipleRolesHandling` - Validates handling of users with multiple roles

**Key Features**:
- Uses `@ExtendWith(MockitoExtension.class)` for Mockito integration
- Comprehensive setUp() with realistic test data
- Tests both happy path and error scenarios
- Verifies mock interactions using `verify()`

### 2. OrderServiceTest.java

**Purpose**: Tests order CRUD operations, status transitions, and item management.

**Mocked Components**:
- `OrderRepository` - Manages orders
- `OrderItemRepository` - Manages order items
- `MenuItemRepository` - Retrieves menu items
- `TableRepository` - Retrieves restaurant tables
- `ReservationRepository` - Manages reservations
- `OrderMapper` - Maps order entities to DTOs
- `OrderItemMapper` - Maps order item entities to DTOs

**Test Cases** (10 tests):
1. `testCreateOrderSuccess` - Validates successful order creation
2. `testCreateOrderTableNotFound` - Verifies exception when table doesn't exist
3. `testCreateOrderDuplicateOrder` - Validates exception for duplicate pending order
4. `testAddItemToOrder` - Tests adding items to existing order
5. `testRemoveItemFromOrder` - Tests removing items from order
6. `testUpdateOrderStatus` - Validates status transitions
7. `testGetOrderById` - Tests retrieving order by ID
8. `testCancelOrder` - Validates order cancellation
9. `testCalculateOrderTotal` - Tests correct total calculation
10. `testGetOrdersByTableId` - Tests retrieving all orders for a table

**Key Features**:
- Tests edge cases like missing items and invalid status transitions
- Validates order total calculation with multiple items
- Tests table and order relationships
- Uses `@DisplayName` for clear test descriptions

### 3. MenuServiceTest.java

**Purpose**: Tests menu operations, categories, and item management.

**Mocked Components**:
- `MenuItemRepository` - Manages menu items
- `CategoryRepository` - Manages menu categories
- `MenuItemMapper` - Maps menu items to DTOs
- `CategoryMapper` - Maps categories to DTOs

**Test Cases** (9 tests):
1. `testCreateMenuItemSuccess` - Validates successful menu item creation
2. `testCreateMenuItemCategoryNotFound` - Verifies exception when category doesn't exist
3. `testGetAllMenuItems` - Tests retrieving all menu items
4. `testSearchMenuItems` - Tests menu item search functionality
5. `testGetMenuItemById` - Tests retrieving menu item by ID
6. `testUpdateMenuItemAvailability` - Validates availability updates
7. `testDeleteMenuItem` - Tests menu item deletion
8. `testGetItemsByCategory` - Tests retrieving items by category
9. `testGetMenuItemsWithPagination` - Tests pagination functionality

**Key Features**:
- Comprehensive pagination testing
- Search functionality validation
- Category and item relationships
- Availability management testing

### 4. LoyaltyServiceTest.java

**Purpose**: Tests points calculation, tier management, and transaction recording.

**Mocked Components**:
- `LoyaltyAccountRepository` - Manages loyalty accounts
- `LoyaltyTransactionRepository` - Manages loyalty transactions
- `LoyaltyMapper` - Maps loyalty entities to DTOs
- `UserRepository` - Retrieves user data

**Test Cases** (10 tests):
1. `testAddPointsToAccount` - Validates adding points to account
2. `testRedeemPointsSuccess` - Tests successful point redemption
3. `testRedeemPointsInsufficientPoints` - Validates exception for insufficient points
4. `testGetAccountPoints` - Tests retrieving account points
5. `testCalculateTierBronze` - Tests BRONZE tier calculation (0-999 points)
6. `testCalculateTierSilver` - Tests SILVER tier calculation (1000-4999 points)
7. `testCalculateTierGold` - Tests GOLD tier calculation (5000-9999 points)
8. `testCalculateTierPlatinum` - Tests PLATINUM tier calculation (10000+ points)
9. `testGetLoyaltyHistory` - Tests retrieving transaction history
10. `testTransactionRecording` - Validates transaction recording

**Key Features**:
- Comprehensive tier management testing
- Points calculation and validation
- Transaction history tracking
- Edge case handling for insufficient points

## Running the Tests

### Run All Tests
```bash
mvn test
```

### Run Tests for Specific Module
```bash
# Auth tests
mvn test -Dtest=AuthServiceTest

# Order tests
mvn test -Dtest=OrderServiceTest

# Menu tests
mvn test -Dtest=MenuServiceTest

# Loyalty tests
mvn test -Dtest=LoyaltyServiceTest
```

### Run Specific Test Method
```bash
mvn test -Dtest=AuthServiceTest#testLoginSuccess
```

### Run with Coverage Report
```bash
mvn clean test jacoco:report
```

## Test Statistics

| Test File | Test Count | Coverage Area |
|-----------|-----------|--------------|
| AuthServiceTest | 10 | JWT, Login, Password, Tokens |
| OrderServiceTest | 10 | CRUD, Status, Items, Totals |
| MenuServiceTest | 9 | CRUD, Search, Categories, Pagination |
| LoyaltyServiceTest | 10 | Points, Tiers, Transactions, History |
| **TOTAL** | **39** | **Core Business Logic** |

## Best Practices Implemented

### 1. Comprehensive Mocking
- All external dependencies are mocked
- Mocks are properly configured with `when()` and `thenReturn()`
- Mock interactions are verified with `verify()`

### 2. Clear Test Structure
- **Arrange**: Setup test data and mock behavior
- **Act**: Execute the method being tested
- **Assert**: Verify results match expectations
- **Verify**: Confirm mocks were called correctly

### 3. Descriptive Naming
- Test methods follow convention: `test[Method][Condition]`
- `@DisplayName` provides human-readable descriptions
- Clear variable names (e.g., `testUser`, `loginRequest`)

### 4. Edge Case Coverage
- Tests for success scenarios
- Tests for error/exception scenarios
- Tests for boundary conditions
- Tests for data validation

### 5. Proper Setup/Teardown
- `@BeforeEach` initializes test data for each test
- Realistic test data mimics production scenarios
- Clean separation between test cases

## Common Issues and Solutions

### Issue: Tests not found by Maven
**Solution**: Ensure test files are in `src/test/java` and follow naming convention `*Test.java`

### Issue: Mocks not working
**Solution**: Verify `@ExtendWith(MockitoExtension.class)` is present and `@Mock` annotations are used

### Issue: Import errors
**Solution**: Check that JUnit 5 and Mockito dependencies are in `pom.xml`

### Issue: Tests pass individually but fail in suite
**Solution**: Check for test isolation issues - ensure `@BeforeEach` resets all state

## Extending the Tests

To add new test cases:

1. Follow the existing test structure and naming conventions
2. Use the same mocking patterns
3. Include both positive and negative test cases
4. Add `@DisplayName` annotations for clarity
5. Verify mock interactions appropriate to the test

Example:
```java
@Test
@DisplayName("Should [specific behavior]")
void test[Method][Condition]() {
    // Arrange
    when(mockObject.method()).thenReturn(expectedValue);
    
    // Act
    actualResult = serviceUnderTest.methodToTest(input);
    
    // Assert
    assertEquals(expectedValue, actualResult);
    verify(mockObject, times(1)).method();
}
```

## Integration with CI/CD

These unit tests are designed to run in:
- GitHub Actions
- Jenkins
- GitLab CI
- Any Maven-compatible CI/CD pipeline

Add to your CI/CD workflow:
```yaml
- name: Run Unit Tests
  run: mvn clean test
```

## Coverage Goals

Target test coverage for backend services:
- **Auth Service**: >90% coverage
- **Order Service**: >85% coverage
- **Menu Service**: >85% coverage
- **Loyalty Service**: >90% coverage

Run: `mvn clean test jacoco:report` to generate coverage report

## Contact & Support

For questions or issues regarding these tests, please refer to:
- Project documentation in `/docs`
- Spring Boot Testing Guide: https://spring.io/guides/gs/testing-web/
- Mockito Documentation: https://javadoc.io/doc/org.mockito/mockito-core/
- JUnit 5 Documentation: https://junit.org/junit5/docs/current/user-guide/
