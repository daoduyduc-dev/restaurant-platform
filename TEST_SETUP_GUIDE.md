# Test File Organization Guide

This guide provides multiple methods to organize the test files into the proper directory structure for the Restaurant Platform project.

## Overview

Four test files have been created and need to be placed in specific directories:

```
AuthServiceTest.java       → src/test/java/com/restaurant/platform/modules/auth/service/
OrderServiceTest.java      → src/test/java/com/restaurant/platform/modules/order/service/
MenuServiceTest.java       → src/test/java/com/restaurant/platform/modules/menu/service/
LoyaltyServiceTest.java    → src/test/java/com/restaurant/platform/modules/loyalty/service/
```

## Method 1: Using Windows Batch Script (Recommended)

### For Command Prompt / Windows PowerShell

1. Open Command Prompt (cmd.exe) in the project root: `D:\restaurant-platform\`
2. Run the provided batch script:
   ```bash
   organize_tests.bat
   ```
3. The script will:
   - Create all required directories
   - Move test files to their proper locations
   - Display a confirmation message

This is the **easiest method** and works on all Windows systems.

## Method 2: Using Python

If you prefer Python and want more control:

1. Open Command Prompt or PowerShell in `D:\restaurant-platform\`
2. Run the Python script:
   ```bash
   python create_test_dirs.py
   ```
3. Manually move the test files:
   ```bash
   move AuthServiceTest.java src\test\java\com\restaurant\platform\modules\auth\service\
   move OrderServiceTest.java src\test\java\com\restaurant\platform\modules\order\service\
   move MenuServiceTest.java src\test\java\com\restaurant\platform\modules\menu\service\
   move LoyaltyServiceTest.java src\test\java\com\restaurant\platform\modules\loyalty\service\
   ```

## Method 3: Manual Command Prompt Commands

If you prefer to do it step-by-step:

### Step 1: Create Directories

```cmd
cd /d D:\restaurant-platform

REM Create auth test directory
mkdir src\test\java\com\restaurant\platform\modules\auth\service

REM Create order test directory
mkdir src\test\java\com\restaurant\platform\modules\order\service

REM Create menu test directory
mkdir src\test\java\com\restaurant\platform\modules\menu\service

REM Create loyalty test directory
mkdir src\test\java\com\restaurant\platform\modules\loyalty\service
```

### Step 2: Move Test Files

```cmd
REM Move from root to module directories
move AuthServiceTest.java src\test\java\com\restaurant\platform\modules\auth\service\
move OrderServiceTest.java src\test\java\com\restaurant\platform\modules\order\service\
move MenuServiceTest.java src\test\java\com\restaurant\platform\modules\menu\service\
move LoyaltyServiceTest.java src\test\java\com\restaurant\platform\modules\loyalty\service\
```

## Method 4: Using Maven

If Maven is already set up:

1. Create directories via Maven resource plugin (advanced):
   ```bash
   mvn clean test-compile
   ```

2. Then manually copy files to the test directories

## Method 5: Windows PowerShell (PowerShell 7+)

If you have PowerShell 7 or newer installed:

```powershell
# Define paths
$basePath = "D:\restaurant-platform\src\test\java\com\restaurant\platform\modules"
$rootPath = "D:\restaurant-platform"

# Create directories
@("auth", "order", "menu", "loyalty") | ForEach-Object {
    $path = Join-Path $basePath $_ "service"
    New-Item -ItemType Directory -Path $path -Force | Out-Null
    Write-Host "Created: $path"
}

# Move files
@(
    @("AuthServiceTest.java", "auth"),
    @("OrderServiceTest.java", "order"),
    @("MenuServiceTest.java", "menu"),
    @("LoyaltyServiceTest.java", "loyalty")
) | ForEach-Object {
    $file = $_[0]
    $module = $_[1]
    $source = Join-Path $rootPath $file
    $dest = Join-Path $basePath $module "service" $file
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "Moved: $file → $dest"
    }
}

Write-Host "All files organized successfully!"
```

## Verification

After organizing files, verify the directory structure:

### Using Command Prompt
```cmd
dir src\test\java\com\restaurant\platform\modules /s /b
```

Expected output:
```
src\test\java\com\restaurant\platform\modules\auth\service\AuthServiceTest.java
src\test\java\com\restaurant\platform\modules\order\service\OrderServiceTest.java
src\test\java\com\restaurant\platform\modules\menu\service\MenuServiceTest.java
src\test\java\com\restaurant\platform\modules\loyalty\service\LoyaltyServiceTest.java
```

### Using PowerShell
```powershell
Get-ChildItem -Path "src\test\java\com\restaurant\platform\modules" -Recurse -Filter "*Test.java"
```

### Using Maven
```bash
mvn test --DmatchFileName="*Test.java"
```

## Running Tests After Organization

### Run All Tests
```bash
mvn clean test
```

### Run Specific Test File
```bash
mvn test -Dtest=AuthServiceTest
mvn test -Dtest=OrderServiceTest
mvn test -Dtest=MenuServiceTest
mvn test -Dtest=LoyaltyServiceTest
```

### Run Specific Test Method
```bash
mvn test -Dtest=AuthServiceTest#testLoginSuccess
```

### Run with Code Coverage
```bash
mvn clean test jacoco:report
```

## Troubleshooting

### Problem: Files not found after running organize_tests.bat
**Solution**: 
1. Verify you're running the script from `D:\restaurant-platform\`
2. Check that test files exist in the root directory
3. Run in Command Prompt with Administrator privileges

### Problem: Access Denied error when moving files
**Solution**:
1. Close any IDE or text editor that might have the files open
2. Run Command Prompt as Administrator
3. Try again

### Problem: Tests still not running after organization
**Solution**:
1. Verify package declarations match the directory structure
   - Auth tests should have: `package com.restaurant.platform.modules.auth.service;`
   - Order tests should have: `package com.restaurant.platform.modules.order.service;`
   - Menu tests should have: `package com.restaurant.platform.modules.menu.service;`
   - Loyalty tests should have: `package com.restaurant.platform.modules.loyalty.service;`

2. Check that Maven can find the tests:
   ```bash
   mvn test --test
   ```

3. Ensure pom.xml has test dependencies:
   ```xml
   <dependency>
       <groupId>org.junit.jupiter</groupId>
       <artifactId>junit-jupiter</artifactId>
       <scope>test</scope>
   </dependency>
   <dependency>
       <groupId>org.mockito</groupId>
       <artifactId>mockito-junit-jupiter</artifactId>
       <scope>test</scope>
   </dependency>
   ```

## Checklist

After organizing files, verify:

- [ ] All four test files are moved to correct directories
- [ ] Directory structure exists: `modules/{auth|order|menu|loyalty}/service/`
- [ ] Test files can be found by IDE (refresh project)
- [ ] Maven can find tests: `mvn test --test | grep "Tests run"`
- [ ] Tests compile without errors: `mvn test-compile`
- [ ] Tests run successfully: `mvn test`

## Quick Reference

| Test File | Target Directory | Package |
|-----------|------------------|---------|
| AuthServiceTest.java | src/test/java/com/restaurant/platform/modules/auth/service/ | com.restaurant.platform.modules.auth.service |
| OrderServiceTest.java | src/test/java/com/restaurant/platform/modules/order/service/ | com.restaurant.platform.modules.order.service |
| MenuServiceTest.java | src/test/java/com/restaurant/platform/modules/menu/service/ | com.restaurant.platform.modules.menu.service |
| LoyaltyServiceTest.java | src/test/java/com/restaurant/platform/modules/loyalty/service/ | com.restaurant.platform.modules.loyalty.service |

## Next Steps

1. **Organize test files** using one of the methods above
2. **Refresh your IDE** (F5 in Eclipse, Cmd+R in IntelliJ)
3. **Run tests** to verify everything works: `mvn test`
4. **Check coverage** with: `mvn clean test jacoco:report`
5. **Commit to version control** once tests pass

For more details about each test file, see: `TEST_FILES_README.md`
