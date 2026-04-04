# EXECUTION GUIDE - Create 7 Test Directories

## Quick Start

The **fastest way** to create all 7 test directories is to run:

```batch
D:\restaurant-platform\MASTER_CREATE_DIRS.bat
```

This is a "smart" script that automatically detects available tools on your system and uses the best one.

---

## Directories to Create

The following 7 directories need to be created:

```
1. src\test\resources
2. src\test\java\com\restaurant\platform\modules\auth
3. src\test\java\com\restaurant\platform\modules\menu
4. src\test\java\com\restaurant\platform\modules\order
5. src\test\java\com\restaurant\platform\modules\loyalty
6. src\test\java\com\restaurant\platform\modules\notification
7. src\test\java\com\restaurant\platform\modules\reservation
```

---

## Available Execution Methods

### ✅ Method 1: Master Script (RECOMMENDED)
**File**: `MASTER_CREATE_DIRS.bat`

This script automatically detects and uses the best available tool:
- ✓ Try Python first (most reliable)
- ✓ Try Node.js second
- ✓ Fall back to Windows mkdir

**How to run**:
```batch
Double-click: MASTER_CREATE_DIRS.bat
OR
Command prompt: MASTER_CREATE_DIRS.bat
```

**Output**: Detailed progress for each directory + verification

---

### ✅ Method 2: Simple Batch Script
**File**: `SIMPLE_CREATE_DIRS.bat`

Pure Windows batch file with mkdir commands and verification.

**How to run**:
```batch
Double-click: SIMPLE_CREATE_DIRS.bat
OR
Command prompt: SIMPLE_CREATE_DIRS.bat
```

**Output**: Directory creation progress + tree view

---

### ✅ Method 3: Python Script (If Python Installed)
**File**: `create_test_directories.py`

Uses Python's Path.mkdir with comprehensive error handling.

**How to run**:
```bash
cd D:\restaurant-platform
python create_test_directories.py
```

OR

```bash
cd D:\restaurant-platform
python3 create_test_directories.py
```

**Output**: Detailed progress [1/7] format + summary + verification

---

### ✅ Method 4: Node.js Script (If Node Installed)
**File**: `create_dirs_task.js`

Uses Node.js fs.mkdirSync with recursive directory creation.

**How to run**:
```bash
cd D:\restaurant-platform
node create_dirs_task.js
```

**Output**: Status messages + summary + final verification

---

### ✅ Method 5: Windows Command Prompt (Manual)
**Tools**: Windows built-in mkdir command

**How to run**:
```batch
cd /d D:\restaurant-platform
mkdir src\test\resources
mkdir src\test\java\com\restaurant\platform\modules\auth
mkdir src\test\java\com\restaurant\platform\modules\menu
mkdir src\test\java\com\restaurant\platform\modules\order
mkdir src\test\java\com\restaurant\platform\modules\loyalty
mkdir src\test\java\com\restaurant\platform\modules\notification
mkdir src\test\java\com\restaurant\platform\modules\reservation
```

Then verify:
```batch
tree /a src\test
```

---

### ✅ Method 6: PowerShell (If Available)
**Tools**: PowerShell New-Item cmdlet

**How to run**:
```powershell
cd D:\restaurant-platform
@(
    'src\test\resources',
    'src\test\java\com\restaurant\platform\modules\auth',
    'src\test\java\com\restaurant\platform\modules\menu',
    'src\test\java\com\restaurant\platform\modules\order',
    'src\test\java\com\restaurant\platform\modules\loyalty',
    'src\test\java\com\restaurant\platform\modules\notification',
    'src\test\java\com\restaurant\platform\modules\reservation'
) | ForEach-Object { New-Item -ItemType Directory -Path $_ -Force | Out-Null }

# Verify
tree /a src\test
```

---

### ✅ Method 7: Git Bash (If Installed)
**Tools**: Git Bash with mkdir -p

**How to run**:
```bash
cd D:\restaurant-platform
mkdir -p src/test/resources
mkdir -p src/test/java/com/restaurant/platform/modules/{auth,menu,order,loyalty,notification,reservation}

# Verify
tree -a src/test
```

---

## Recommended Execution Priority

1. **First Choice**: `MASTER_CREATE_DIRS.bat` - Automatic, no thinking required
2. **Second Choice**: `SIMPLE_CREATE_DIRS.bat` - Pure Windows, always works
3. **Third Choice**: Python script - If Python is available
4. **Fourth Choice**: Node.js script - If Node is available
5. **Last Resort**: Manual Windows commands

---

## Expected Success Output

When all 7 directories are created successfully, you should see:

```
[1/7] Creating: src\test\resources ... ✓ SUCCESS
[2/7] Creating: src\test\java\com\restaurant\platform\modules\auth ... ✓ SUCCESS
[3/7] Creating: src\test\java\com\restaurant\platform\modules\menu ... ✓ SUCCESS
[4/7] Creating: src\test\java\com\restaurant\platform\modules\order ... ✓ SUCCESS
[5/7] Creating: src\test\java\com\restaurant\platform\modules\loyalty ... ✓ SUCCESS
[6/7] Creating: src\test\java\com\restaurant\platform\modules\notification ... ✓ SUCCESS
[7/7] Creating: src\test\java\com\restaurant\platform\modules\reservation ... ✓ SUCCESS

========== SUMMARY ==========
✓ All directories created successfully!
```

---

## Verification

After running ANY of the above methods, verify success with:

### Using Tree Command:
```batch
cd D:\restaurant-platform
tree /a src\test
```

Expected output:
```
src\test
│
├── resources
│
└── java
    └── com
        └── restaurant
            └── platform
                ├── RestaurantPlatformApplicationTests.java
                └── modules
                    ├── auth
                    ├── menu
                    ├── order
                    ├── loyalty
                    ├── notification
                    └── reservation
```

### Using Dir Command:
```batch
cd D:\restaurant-platform
dir /s /b src\test
```

### Using PowerShell:
```powershell
cd D:\restaurant-platform
Get-ChildItem -Path src\test -Recurse -Directory | Select-Object -ExpandProperty FullName
```

---

## Troubleshooting

### Problem: Scripts won't run
**Solution**: Use right-click → "Run as Administrator" on the batch file

### Problem: "Access Denied" error
**Solution**: Check file permissions on D:\restaurant-platform directory
```batch
icacls D:\restaurant-platform /grant %USERNAME%:F /T
```

### Problem: mkdir command says "already exists"
**Solution**: This is normal and not an error. The mkdir command doesn't fail on existing directories.

### Problem: Some directories created but not all
**Solution**: Run the script again - it uses recursive creation and idempotent operations

### Problem: "Cannot find path" error
**Solution**: Make sure you're in the correct directory:
```batch
cd /d D:\restaurant-platform
```
(Note the `/d` flag for changing drives)

---

## Verification Checklist

After running the script, confirm:

- [ ] All 7 directories exist
- [ ] Directories are under src\test
- [ ] Module directories are under src\test\java\com\restaurant\platform\modules
- [ ] Resources directory is under src\test
- [ ] No errors or failures reported
- [ ] Tree command shows all directories

---

## Next Steps After Creation

Once all directories are created, you can:

1. **Add test files**: Place .java test files in each module directory
2. **Add resources**: Place configuration files, test data in src\test\resources
3. **Run Maven tests**: `mvn clean test`
4. **IDE integration**: Refresh your IDE (Eclipse, IntelliJ) to see new directories

---

## File Reference

Available scripts in D:\restaurant-platform:

| File | Type | Purpose |
|------|------|---------|
| MASTER_CREATE_DIRS.bat | Batch | Smart script that auto-detects tools |
| SIMPLE_CREATE_DIRS.bat | Batch | Pure Windows mkdir commands |
| create_test_directories.py | Python | Comprehensive Python implementation |
| create_dirs_task.js | Node.js | Comprehensive Node.js implementation |
| create_dirs.sh | Bash | Bash/Git Bash script |
| TEST_DIRECTORY_CREATION_REPORT.md | Markdown | Detailed technical documentation |

---

**Status**: Ready to execute
**Last Updated**: Current session
**Recommendation**: Run `MASTER_CREATE_DIRS.bat` for fastest results
