# 🖥️ YTZ Project Tracker - Desktop Installer Guide

This guide will help you turn your web application into a fully functional **Windows Desktop Application** with a professional installer (.exe).

---

## 📋 Prerequisites

Before building, ensure you have the following installed:
- **Node.js** (which you already have for development)
- **npm** (comes with Node.js)

---

## 🛠️ Step-by-Step Instructions

### Step 1: Install Electron Dependencies
Open your terminal in the project folder and run:

```bash
npm install
```

This will download **Electron** and **Electron Builder**, which are necessary for the desktop app.

### Step 2: Test the Desktop App (Development)
You can run the app as a windowed desktop application without building the installer first:

1. In one terminal, start your dev server:
   ```bash
   npm run dev
   ```

2. In a second terminal, run the Electron app:
   ```bash
   npm run electron:dev
   ```

### Step 3: Build the Windows Installer (.exe)
When you are ready to create the final installer file, run:

```bash
npm run electron:build
```

**What this does:**
1. ✅ **Builds the Web App**: Runs `npm run build` to optimize your code.
2. ✅ **Packages the App**: Combines your web code with Electron.
3. ✅ **Creates Installer**: Generates a professional `.exe` installer in a new `release` folder.

---

## 📦 Where to find your Installer
After the build completes, look in the newly created folder:
`c:\Users\meyea\Documents\GitHub\YTZ Project Tracker\release`

You will find a file named:
**`YTZ Project Tracker Setup 1.0.0.exe`**

---

## ✨ Features of Your Desktop App

- ✅ **Professional Icon**: Uses your `Icon_01.png` as the taskbar and desktop icon.
- ✅ **Custom Window**: Pre-sized at 1400x900 for the best Gantt Chart view.
- ✅ **Desktop Shortcut**: The installer will automatically create a shortcut on your desktop.
- ✅ **Clean Interface**: Removes browser address bars and menus for a focused experience.
- ✅ **Native Performance**: Faster and more stable than running in a browser tab.

---

## 🔒 Privacy & Security

- **100% Private**: Your data stays on your machine.
- **Offline Reliable**: The app loads from your local files (once built).
- **No GitHub Needed**: You can share the `.exe` directly with your team/clients without hosting code online.

---

## 💡 Pro Tips

### **App Updates**
Whenever you change the code, just run `npm run electron:build` again to create a new installer with your latest updates.

### **Installer Customization**
I have configured the installer to allow you to choose the installation folder. If you want a "One-Click" installer instead, you can change the `oneClick` setting in `package.json`.

---

**Congratulations! Your architecture studio now has its own branded desktop software.** 🏗️🖥️
