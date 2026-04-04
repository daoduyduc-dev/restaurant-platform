# Test Directory Creation - Complete Instructions

## 📍 Location
`D:\restaurant-platform`

## 📋 Directories to Create (7 Total)

1. `src\test\resources`
2. `src\test\java\com\restaurant\platform\modules\auth`
3. `src\test\java\com\restaurant\platform\modules\menu`
4. `src\test\java\com\restaurant\platform\modules\order`
5. `src\test\java\com\restaurant\platform\modules\loyalty`
6. `src\test\java\com\restaurant\platform\modules\notification`
7. `src\test\java\com\restaurant\platform\modules\reservation`

---

## ✨ Quick Start (Easiest Way)

### **Option 1: Run Batch File (No Setup Required)**

Simply **double-click** this file:
```
D:\restaurant-platform\RUN_THIS_FIRST.bat
```

**What happens:**
- Command Prompt window opens automatically
- All 7 directories are created
- Directory tree is displayed
- Press any key to close when done

---

## 🚀 Alternative Execution Methods

### **Option 2: Run VBScript**

Double-click:
```
D:\restaurant-platform\CreateDirsAndShowTree.vbs
```

**Advantages:**
- No command line window visible
- Automatic execution
- Dialog boxes show progress

---

### **Option 3: Manual Command Prompt**

1. Press `Win + R`
2. Type: `cmd` and press Enter
3. Copy and paste these commands one by one:

```batch
cd /d D:\restaurant-platform
mkdir src\test\resources
mkdir src\test\java\com\restaurant\platform\modules\auth
mkdir src\test\java\com\restaurant\platform\modules\menu
mkdir src\test\java\com\restaurant\platform\modules\order
mkdir src\test\java\com\restaurant\platform\modules\loyalty
mkdir src\test\java\com\restaurant\platform\modules\notification
mkdir src\test\java\com\restaurant\platform\modules\reservation
tree src\test /F
```

---

### **Option 4: Using Node.js**

If you have Node.js installed:

```bash
cd D:\restaurant-platform
node create_dirs_now.js
```

---

### **Option 5: Using Python**

If you have Python installed:

```bash
cd D:\restaurant-platform
python create_test_dirs.py
```

---

## 📊 Expected Output

After execution, you should see:

```
=========================================================
Creating 7 Test Directories for Restaurant Platform
=========================================================

[OK] Created: src\test\resources
[OK] Created: src\test\java\com\restaurant\platform\modules\auth
[OK] Created: src\test\java\com\restaurant\platform\modules\menu
[OK] Created: src\test\java\com\restaurant\platform\modules\order
[OK] Created: src\test\java\com\restaurant\platform\modules\loyalty
[OK] Created: src\test\java\com\restaurant\platform\modules\notification
[OK] Created: src\test\java\com\restaurant\platform\modules\reservation

=========================================================
SUCCESS: All 7 directories created!
=========================================================

Directory Tree for: D:\restaurant-platform\src\test

D:\RESTAURANT-PLATFORM\SRC\TEST
├── java
│   └── com
│       └── restaurant
│           └── platform
│               ├── RestaurantPlatformApplicationTests.java
│               └── modules
│                   ├── auth
│                   ├── menu
│                   ├── order
│                   ├── loyalty
│                   ├── notification
│                   └── reservation
└── resources
```

---

## ✅ Verification

To confirm all directories were created:

1. Open File Explorer
2. Navigate to: `D:\restaurant-platform\src\test\java\com\restaurant\platform\modules`
3. You should see these 6 folders:
   - auth
   - menu
   - order
   - loyalty
   - notification
   - reservation

4. Also verify: `D:\restaurant-platform\src\test\resources` exists

---

## 🆘 Troubleshooting

### Issue: "Access Denied" Error
**Solution:** 
- Right-click the batch file and select "Run as Administrator"
- Or open Command Prompt as Administrator first

### Issue: Directories Already Exist
**Solution:** 
- This is normal! The `mkdir` command won't fail if directories exist
- It will simply skip them and show "Already exists"

### Issue: "tree" Command Not Found
**Solution:**
- The directories have still been created successfully
- Use File Explorer to verify
- Or use: `dir /S src\test` instead

### Issue: "mkdir" Not Recognized
**Solution:**
- Make sure you're in Command Prompt (cmd.exe), not PowerShell
- Or use: `md` instead of `mkdir` (they're equivalent)

---

## 📄 Files Provided

1. **RUN_THIS_FIRST.bat** - Main batch file (Recommended)
2. **CreateDirsAndShowTree.vbs** - VBScript alternative
3. **create_dirs_now.js** - Node.js script
4. **create_test_dirs.py** - Python script
5. **DIRECTORY_CREATION_INSTRUCTIONS.html** - Detailed HTML guide

---

## 💡 Tips

- **Batch file (.bat)** works on all Windows systems without any setup
- If you want to run automatically on startup, use the VBScript option
- For CI/CD pipelines, use the batch or Node.js version
- All directories created are standard Java test package structure

---

## ✨ Next Steps

After creating these directories, you can:

1. Add test Java files to the module directories
2. Add test resources (XML, YAML, properties files) to `src/test/resources`
3. Configure Maven or your build tool to recognize these directories
4. Start writing unit tests for each module

---

**Status:** ✅ Ready to execute
**Last Updated:** 2024
**Platform:** Windows (D:\restaurant-platform)
