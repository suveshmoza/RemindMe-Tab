# Contributing to RemindMe Tab

Contributions are welcome! Whether it's bug fixes, new features, or improvements.

## Prerequisites

- **Node.js** 20+ (LTS recommended)

- **pnpm**

## Build Instructions

```bash
git clone git@github.com:suveshmoza/RemindMe-Tab.git
cd RemindMe-Tab
pnpm install

```

**Firefox:**

```bash
pnpm build:firefox
```

**Chrome:**

```bash
pnpm build
```

## Development

| Command | Description |
| ----------------- | ------------------------------------ |
| `pnpm dev` | Dev server for Chrome (hot-reload) |
| `pnpm dev:firefox` | Dev server for Firefox (hot-reload) |
| `pnpm zip` | Create ZIP for Chrome |
| `pnpm zip:firefox` | Create ZIP for Firefox |
| `pnpm compile` | TypeScript type checking |

## Load in Browser

**Chrome:** `chrome://extensions/` → Enable Developer mode → Load unpacked → select `dist/`

**Firefox:** `about:debugging` → This Firefox → Load Temporary Add-on → select `manifest.json` in `dist/`

## Project Structure

``` txt
src/
├── entrypoints/
│ ├── popup/ # Popup UI (React)
│ └── background.ts # Background service worker
├── components/ # React components
├── utils/ # Storage, notifications
└── assets/ # Static assets
```

## Permissions

- `alarms` - Schedule reminders
- `storage` - Persist reminder data
- `notifications` - Show alerts
- `tabs` / `activeTab` - Tab information

## Contributing Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

**Build fails:** Verify Node 20+ and pnpm. Clear cache: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

**Extension not loading:** Check `dist/manifest.json` exists and browser console for errors.
