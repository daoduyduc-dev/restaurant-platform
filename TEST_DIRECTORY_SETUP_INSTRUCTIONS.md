# Restaurant Platform - Test Directory Setup Guide

## Overview
This guide provides instructions for creating the 7 required test directories for the Restaurant Platform project.

## Directories to Create

1. **src\test\resources** - Test resource files (XML, JSON, properties files, etc.)
2. **src\test\java\com\restaurant\platform\modules\auth** - Authentication module tests
3. **src\test\java\com\restaurant\platform\modules\menu** - Menu module tests
4. **src\test\java\com\restaurant\platform\modules\order** - Order module tests
5. **src\test\java\com\restaurant\platform\modules\loyalty** - Loyalty module tests
6. **src\test\java\com\restaurant\platform\modules\notification** - Notification module tests
7. **src\test\java\com\restaurant\platform\modules\reservation** - Reservation module tests

## Setup Methods

### Method 1: Using Java Program (RECOMMENDED)
This is the most reliable method as it uses native Java APIs.

**Steps:**
1. Open Command Prompt (cmd.exe)
2. Navigate to the project: `cd D:\restaurant-platform`
3. Compile the Java program: `javac SetupTestDirectories.java`
4. Run the program: `java SetupTestDirectories`

**What it does:**
- Creates all 7 directories using Java NIO (java.nio.file.Files)
- Verifies each directory was created successfully
- Displays a tree view of the complete src/test structure
- Shows a summary report

### Method 2: Using Batch File
A convenient wrapper script that handles compilation and execution.

**Steps:**
1. Open Command Prompt (cmd.exe)
2. Navigate to the project: `cd D:\restaurant-platform`
3. Run the batch file: `RUN_SETUP_NOW.bat`

**What it does:**
- Automatically compiles SetupTestDirectories.java
- Runs the compiled program
- Displays all output in the command window

### Method 3: Using PowerShell Script
For users who prefer PowerShell.

**Steps:**
1. Open PowerShell (as Administrator recommended)
2. Navigate to the project: `cd D:\restaurant-platform`
3. Run the script: `.\Setup-TestDirectories.ps1`

**Note:** If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the script again.

### Method 4: Using Python Script
An alternative method using Python.

**Steps:**
1. Open Command Prompt (cmd.exe)
2. Navigate to the project: `cd D:\restaurant-platform`
3. Run the Python script: `python setup_test_dirs.py`

**What it does:**
- Creates all 7 directories using Python pathlib
- Verifies each directory
- Displays a tree view of src/test

### Method 5: Manual Directory Creation
If the above methods don't work for some reason, you can create the directories manually:

1. Open File Explorer
2. Navigate to `D:\restaurant-platform\src\test\`
3. Create folder: `resources`
4. Navigate to `D:\restaurant-platform\src\test\java\com\restaurant\platform\`
5. Create folder structure: `modules\auth`
6. Create folder structure: `modules\menu`
7. Create folder structure: `modules\order`
8. Create folder structure: `modules\loyalty`
9. Create folder structure: `modules\notification`
10. Create folder structure: `modules\reservation`

## Expected Output

When any of the above methods is executed successfully, you should see output similar to:

```
======================================================================
Creating test directory structure for Restaurant Platform
======================================================================

Creating the following 7 directories:
  1. src\test\resources
  2. src\test\java\com\restaurant\platform\modules\auth
  3. src\test\java\com\restaurant\platform\modules\menu
  4. src\test\java\com\restaurant\platform\modules\order
  5. src\test\java\com\restaurant\platform\modules\loyalty
  6. src\test\java\com\restaurant\platform\modules\notification
  7. src\test\java\com\restaurant\platform\modules\reservation

======================================================================
CREATION PHASE
======================================================================

✓ Created: src\test\resources
✓ Created: src\test\java\com\restaurant\platform\modules\auth
✓ Created: src\test\java\com\restaurant\platform\modules\menu
✓ Created: src\test\java\com\restaurant\platform\modules\order
✓ Created: src\test\java\com\restaurant\platform\modules\loyalty
✓ Created: src\test\java\com\restaurant\platform\modules\notification
✓ Created: src\test\java\com\restaurant\platform\modules\reservation

======================================================================
VERIFICATION PHASE
======================================================================

✓ VERIFIED: src\test\resources
✓ VERIFIED: src\test\java\com\restaurant\platform\modules\auth
✓ VERIFIED: src\test\java\com\restaurant\platform\modules\menu
✓ VERIFIED: src\test\java\com\restaurant\platform\modules\order
✓ VERIFIED: src\test\java\com\restaurant\platform\modules\loyalty
✓ VERIFIED: src\test\java\com\restaurant\platform\modules\notification
✓ VERIFIED: src\test\java\com\restaurant\platform\modules\reservation

======================================================================
SUMMARY
======================================================================
Created: 7/7
Verified: 7/7
✓ SUCCESS: All 7 directories created and verified!

======================================================================
DIRECTORY TREE - Complete src/test structure
======================================================================

src/test/
├── java/
│   └── com/
│       └── restaurant/
│           └── platform/
│               ├── RestaurantPlatformApplicationTests.java
│               └── modules/
│                   ├── auth/
│                   ├── loyalty/
│                   ├── menu/
│                   ├── notification/
│                   ├── order/
│                   └── reservation/
└── resources/

======================================================================
```

## Verification

After running any of the setup methods, verify the directories exist by:

1. Opening File Explorer
2. Navigating to: `D:\restaurant-platform\src\test\`
3. Checking that:
   - `java` folder exists
   - `resources` folder exists
   - Under `java\com\restaurant\platform\modules\` there are 6 folders:
     - auth
     - loyalty
     - menu
     - notification
     - order
     - reservation

## Available Setup Scripts

The following setup scripts are available in the `D:\restaurant-platform` directory:

1. **SetupTestDirectories.java** - Main Java program
2. **RUN_SETUP_NOW.bat** - Batch script wrapper
3. **Setup-TestDirectories.ps1** - PowerShell script
4. **setup_test_dirs.py** - Python script
5. **create_test_structure_now.py** - Alternative Python script

## Troubleshooting

### Issue: "javac not found"
**Solution:** Ensure Java is installed and added to PATH:
- Download Java from oracle.com or openjdk.net
- Add Java bin directory to Windows PATH environment variable

### Issue: PowerShell execution policy error
**Solution:** Run the following in PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Python not found
**Solution:** Ensure Python is installed and added to PATH:
- Download Python from python.org
- During installation, check "Add Python to PATH"

### Issue: Directory already exists
**Solution:** This is not a problem. The scripts check if directories already exist and will not fail.

## Next Steps

After creating the test directories, you can:

1. Add test classes to the module directories
2. Add test resources (XML, JSON, properties) to `src\test\resources`
3. Run Maven to execute all tests: `mvnw test`
4. Create integration tests under the appropriate module directories

## Questions?

For more information about the Restaurant Platform project, see:
- README.md
- GETTING_STARTED.md
- TESTING_GUIDE.md
