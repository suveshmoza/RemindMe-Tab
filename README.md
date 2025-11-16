# RemindMe Tab

> **Never lose track of important pages again.** Set reminders for your browser tabs and let RemindMe Tab bring you back when it matters.

Tired of opening dozens of tabs "for later" only to forget about them? RemindMe Tab is your personal tab assistant that ensures you never miss revisiting that article, product, or page you bookmarked in your mind. Whether you want to check back in 5 minutes or next week, we've got you covered.

**Perfect for:**

- Reading an article or blog post but need to switch tasks - get reminded to continue reading later
- Having dozens of tabs open and wanting to revisit specific pages after some time
- Checking back on a page after a few hours or days when something might have changed
- Pausing in the middle of a tutorial or documentation and wanting to resume at a specific time
- Revisiting a product page, job listing, or important page after a set duration

> ✅ **Now Available!** Download RemindMe Tab from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/remindme-tab/) or [Microsoft Edge Extensions](https://microsoftedge.microsoft.com/addons/detail/remindme-tab/jcfcbmjdgpipjmknfjnoanifmfjcdpcc)

## Features

- **Flexible Scheduling** - Set reminders by duration (minutes, hours, days) or pick a specific date and time
- **Real-time Progress** - Visual countdown bar shows exactly how much time remains until your reminder
- **Snooze** - Need more time? Snooze reminders with one click (Chromium browsers)
- **Cross-browser** - Works seamlessly on Chrome, Firefox, and other Chromium-based browsers
- **Persistent Storage** - Your reminders survive browser restarts and sync across sessions

## Quick Start

1. **Install the extension** from your browser's extension store:
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/remindme-tab/)
   - [Microsoft Edge Extensions](https://microsoftedge.microsoft.com/addons/detail/remindme-tab/jcfcbmjdgpipjmknfjnoanifmfjcdpcc)
2. **Click the extension icon** on any tab you want to remember
3. **Choose your reminder time** - set a duration or specific date/time
4. **Get notified** when it's time to revisit the page

That's it! No complex setup, no learning curve. Just simple, effective tab reminders.

---

## 🛠️ For Developers

Want to build from source or contribute? Read on!

### Required Programs

The following programs are required to build this extension:

1. **Node.js** - Version 20 or higher (LTS version recommended)
2. **pnpm**

## Step-by-Step Build Instructions

Follow these steps to create an exact copy of the add-on code:

### Step 1: Clone the Repository

```bash
git clone git@github.com:suveshmoza/RemindMe-Tab.git
cd RemindMe-Tab
```

### Step 2: Install Dependencies

This will install all required dependencies as specified in `package.json`:

```bash
pnpm install
```

### Step 3: Build the Extension

#### For Firefox

```bash
pnpm build:firefox
```

**What this does:**

- Executes `wxt build -b firefox` command
- Compiles TypeScript files to JavaScript
- Bundles React components and dependencies
- Processes Tailwind CSS styles
- Generates Firefox-compatible manifest.json
- Outputs all files to `dist/` directory

**Expected output:**

- `dist/` directory created with the following structure:
  - `manifest.json` - Extension manifest
  - `background.js` - Background service worker
  - `popup.html` - Popup HTML file
  - `assets/` - Compiled JavaScript and CSS files
  - `icons/` - Extension icons
  - Other required extension files

#### For Chrome

```bash
pnpm build
```

**What this does:**

- Executes `wxt build` command (defaults to Chrome)
- Same compilation process as Firefox but with Chrome-specific optimizations
- Outputs to `dist/` directory

### Step 4: Verify the Build

Check that the `dist/` directory contains all necessary files:

```bash
ls -la dist/
```

You should see:

- `manifest.json`
- `background.js`
- `popup.html` (or `index.html`)
- `assets/` directory
- `icons/` directory

## Build Scripts

All build scripts are defined in `package.json` and can be executed using `pnpm run <script-name>` or `pnpm <script-name>`:

### Available Scripts

| Script          | Command              | Description                          |
| --------------- | -------------------- | ------------------------------------ |
| `build`         | `pnpm build`         | Build extension for Chrome           |
| `build:firefox` | `pnpm build:firefox` | Build extension for Firefox          |
| `dev`           | `pnpm dev`           | Start development server for Chrome  |
| `dev:firefox`   | `pnpm dev:firefox`   | Start development server for Firefox |
| `zip`           | `pnpm zip`           | Create ZIP package for Chrome        |
| `zip:firefox`   | `pnpm zip:firefox`   | Create ZIP package for Firefox       |
| `compile`       | `pnpm compile`       | Run TypeScript type checking         |

### Complete Build Script

To execute all necessary technical steps in sequence, run:

**For Firefox:**

```bash
pnpm install && pnpm compile && pnpm build:firefox
```

**For Chrome:**

```bash
pnpm install && pnpm compile && pnpm build
```

This single command will:

1. Install all dependencies
2. Verify TypeScript compilation
3. Build the extension

## Installing the Extension in Browser

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

### Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the `dist` folder and select `manifest.json`

**Note:** Temporary add-ons in Firefox are removed when the browser restarts. For permanent installation during development, you can use `about:addons` → Settings → "Install Add-on From File..."

## Development

### Development Mode (Chrome)

```bash
pnpm dev
```

This starts the development server with hot-reload for Chrome. The extension will automatically reload when you make changes to the source code.

### Development Mode (Firefox)

```bash
pnpm dev:firefox
```

This starts the development server with hot-reload for Firefox. The extension will automatically reload when you make changes to the source code.

## Creating Distribution Packages

### Create ZIP for Chrome

```bash
pnpm zip
```

### Create ZIP for Firefox

```bash
pnpm zip:firefox
```

ZIP files will be created in the `output` directory.

## Project Structure

```txt
RemindMe-Tab/
├── src/
│   ├── entrypoints/
│   │   ├── popup/          # Popup UI (React app)
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.html
│   │   └── background.ts   # Background service worker
│   ├── components/         # React components
│   │   ├── ReminderForm.tsx
│   │   ├── ReminderItem.tsx
│   │   ├── ReminderList.tsx
│   │   └── ui/             # UI component library
│   ├── utils/              # Utility functions
│   │   ├── storage.ts      # Storage operations
│   │   └── notification.ts # Notification handling
│   └── assets/             # Static assets
├── dist/                   # Build output (generated)
├── wxt.config.ts           # WXT configuration
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml          # Locked dependency versions
└── tsconfig.json           # TypeScript configuration
```

## Permissions

The extension requires the following permissions:

- `alarms` - To schedule reminder notifications
- `storage` - To persist reminder data
- `notifications` - To show reminder alerts
- `tabs` - To access tab information
- `activeTab` - To get the current active tab

## Development Notes

- The extension uses WXT framework which automatically handles cross-browser compatibility
- Background scripts run as service workers (Chrome) or background scripts (Firefox)
- Storage and Notifications are handled via WXT's wrapper APIs
- The build process automatically generates browser-specific manifests

### Build Fails

1. Verify Node.js version: `node --version` (must be 20+)
2. Verify pnpm version: `pnpm --version` (must be 10.21.0)
3. Clear cache and reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

### Extension Not Loading

1. Verify `dist/manifest.json` exists
2. Check browser console for errors
3. Ensure all required files are in `dist/` directory

## Contributing

Contributions are welcome! Whether it's bug fixes, new features, or  improvements.  

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

Found a bug? Have a feature request? [Open an issue](https://github.com/suveshmoza/RemindMe-Tab/issues)

---
