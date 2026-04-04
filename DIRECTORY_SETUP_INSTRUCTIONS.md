# Test Directory Structure Setup Instructions

## Overview
This document provides multiple methods to create the required 7 test directories for the Restaurant Platform project.

## Required Directories (7 total)

```
src/test/resources
src/test/java/com/restaurant/platform/modules/auth
src/test/java/com/restaurant/platform/modules/menu
src/test/java/com/restaurant/platform/modules/order
src/test/java/com/restaurant/platform/modules/loyalty
src/test/java/com/restaurant/platform/modules/notification
src/test/java/com/restaurant/platform/modules/reservation
```

## Method 1: Using Existing Batch File (RECOMMENDED)

The simplest method - use the pre-made batch file:

```batch
cd D:\restaurant-platform
create_test_dirs_simple.bat
```

This batch file will:
- Create all 7 directories
- Display creation status for each directory
- Show a final summary

## Method 2: Using Enhanced Batch File with Verification

For more detailed output including verification:

```batch
cd D:\restaurant-platform
full_setup_with_verification.bat
```

This will:
- Create all 7 directories
- Verify each directory was created
- Display the full directory tree
- Show final success/failure summary

## Method 3: Using VBScript

If you prefer VBScript:

```batch
cd D:\restaurant-platform
cscript.exe create_directories.vbs
```

The VBScript will:
- Create all 7 directories
- Verify each one
- Display the directory listing
- Show completion status

## Method 4: Using Java

Compile and run the Java program:

```batch
cd D:\restaurant-platform
javac SetupTestDirectories.java
java SetupTestDirectories
```

This will create and verify all directories with detailed output.

## Method 5: Using Node.js

If Node.js is installed:

```batch
cd D:\restaurant-platform
node create-test-dirs.js
```

This will create directories and provide a tree view.

## Method 6: Using Python

If Python is installed:

```batch
cd D:\restaurant-platform
python setup_directories.py
```

This will create directories recursively and show the directory tree.

## Verification

After running any of the above methods, verify all 7 directories were created:

```batch
dir /s /b D:\restaurant-platform\src\test
```

You should see output similar to:

```
D:\restaurant-platform\src\test\resources
D:\restaurant-platform\src\test\java
D:\restaurant-platform\src\test\java\com
D:\restaurant-platform\src\test\java\com\restaurant
D:\restaurant-platform\src\test\java\com\restaurant\platform
D:\restaurant-platform\src\test\java\com\restaurant\platform\modules
D:\restaurant-platform\src\test\java\com\restaurant\platform\modules\auth
D:\restaurant-platform\src\test\java\com\restaurant\platform\modules\menu
D:\restaurant-platform\src\test\java\com\restaurant\platform\modules\order
D:\restaurant-platform\src\test\java\com\restaurant\platform\modules\loyalty
D:\restaurant-platform\src\test\java\com\restaurant\platform\modules\notification
D:\restaurant-platform\src\test\java\com\restaurant\platform\modules\reservation
```

## Checklist

After creating the directories, verify all 7 exist:

- [ ] src\test\resources
- [ ] src\test\java\com\restaurant\platform\modules\auth
- [ ] src\test\java\com\restaurant\platform\modules\menu
- [ ] src\test\java\com\restaurant\platform\modules\order
- [ ] src\test\java\com\restaurant\platform\modules\loyalty
- [ ] src\test\java\com\restaurant\platform\modules\notification
- [ ] src\test\java\com\restaurant\platform\modules\reservation

## Manual Creation (Without Batch Files)

If you prefer to create directories manually through Windows Explorer:

1. Navigate to: `D:\restaurant-platform\src\test\`
2. Create folder: `resources`
3. Navigate to: `D:\restaurant-platform\src\test\java\com\restaurant\platform\`
4. Create folder: `modules`
5. Navigate to: `D:\restaurant-platform\src\test\java\com\restaurant\platform\modules\`
6. Create folders: `auth`, `menu`, `order`, `loyalty`, `notification`, `reservation`

## Troubleshooting

- **Permissions Error**: Run the batch file as Administrator if you get permission errors
- **Path Not Found**: Ensure you're in the correct directory (D:\restaurant-platform)
- **Special Characters**: The Unicode checkmarks (✓, ✗) require UTF-8 encoding support in your terminal

## Files Available

Multiple setup scripts have been created in the project root:

- `create_test_dirs_simple.bat` - Simple batch script
- `full_setup_with_verification.bat` - Batch with verification
- `create_directories.vbs` - VBScript version
- `SetupTestDirectories.java` - Java version
- `create-test-dirs.js` - Node.js version
- `setup_directories.py` - Python version
