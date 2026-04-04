# Test Directory Setup Instructions

## Overview
This document provides instructions for creating the required test directory structure for the restaurant-platform project.

## Required Directories
The setup process will create the following 7 directories:

```
src\test\
├── resources\
└── java\
    └── com\
        └── restaurant\
            └── platform\
                └── modules\
                    ├── auth\
                    ├── menu\
                    ├── order\
                    ├── loyalty\
                    ├── notification\
                    └── reservation\
```

## Quick Start

### Option 1: Using the Batch Script (Recommended)
Run this in Command Prompt or PowerShell:
```cmd
D:\restaurant-platform\EXECUTE_DIRECTORY_SETUP.bat
```

Or navigate to the directory first:
```cmd
cd D:\restaurant-platform
EXECUTE_DIRECTORY_SETUP.bat
```

### Option 2: Using Maven
Run this command:
```cmd
cd D:\restaurant-platform
mvnw.cmd clean validate
```

The Maven validate phase includes a plugin that automatically creates all test directories (see pom.xml lines 184-206).

### Option 3: Using Python
If you have Python installed:
```cmd
cd D:\restaurant-platform
python setup_test_dirs.py
```

### Option 4: Using Windows PowerShell
If you have PowerShell 5.1 or later:
```powershell
cd D:\restaurant-platform
powershell.exe -ExecutionPolicy Bypass -File create_test_dirs_ps.ps1
```

### Option 5: Using VBScript
Windows built-in VBScript (no external dependencies):
```cmd
cd D:\restaurant-platform
cscript create_test_dirs.vbs
```

## Verification

After creating the directories, verify they exist by running:
```cmd
dir /s /b D:\restaurant-platform\src\test
```

You should see output listing all 7 directories created.

## Directory Purposes

- **src\test\resources** - Stores test resource files (properties, XML configs, test data)
- **src\test\java\com\restaurant\platform\modules\auth** - Authentication module tests
- **src\test\java\com\restaurant\platform\modules\menu** - Menu module tests
- **src\test\java\com\restaurant\platform\modules\order** - Order module tests
- **src\test\java\com\restaurant\platform\modules\loyalty** - Loyalty program module tests
- **src\test\java\com\restaurant\platform\modules\notification** - Notification module tests
- **src\test\java\com\restaurant\platform\modules\reservation** - Reservation module tests

## Maven Plugin Configuration

The pom.xml file contains automatic directory creation in the `validate` phase using the maven-antrun-plugin:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-antrun-plugin</artifactId>
    <version>3.1.0</version>
    <executions>
        <execution>
            <id>create-test-directories</id>
            <phase>validate</phase>
            <goals>
                <goal>run</goal>
            </goals>
            <configuration>
                <target>
                    <mkdir dir="${basedir}/src/test/resources"/>
                    <mkdir dir="${basedir}/src/test/java/com/restaurant/platform/modules/auth"/>
                    <mkdir dir="${basedir}/src/test/java/com/restaurant/platform/modules/menu"/>
                    <mkdir dir="${basedir}/src/test/java/com/restaurant/platform/modules/order"/>
                    <mkdir dir="${basedir}/src/test/java/com/restaurant/platform/modules/loyalty"/>
                    <mkdir dir="${basedir}/src/test/java/com/restaurant/platform/modules/notification"/>
                    <mkdir dir="${basedir}/src/test/java/com/restaurant/platform/modules/reservation"/>
                </target>
            </configuration>
        </execution>
    </executions>
</plugin>
```

This means running any Maven command (like `mvn clean`, `mvn install`, etc.) will automatically create these directories.

## Troubleshooting

### Command not found
- Ensure you are in the correct directory: `D:\restaurant-platform`
- Use the full path if the script is not in your PATH

### Access denied
- Run Command Prompt as Administrator
- Check file permissions on the D:\restaurant-platform directory

### Directories not created
- Check that D:\restaurant-platform\src\ directory exists
- Verify you have write permissions to the directory
- Try running with Administrator privileges

## Additional Scripts

Additional directory creation scripts are available:
- `create_test_dirs_simple.bat` - Simple batch version
- `create_test_dirs.py` - Python version
- `create_dirs_now.py` - Alternative Python version
- `create_test_dirs.vbs` - VBScript version
- `create_test_dirs_ps.ps1` - PowerShell version
- `setup_test_dirs.sh` - Bash/Unix version

All scripts create the same 7 directories and can be used interchangeably.
