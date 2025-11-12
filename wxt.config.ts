import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
    vite: () => ({
        plugins: [tailwindcss()],
    }),
    outDir: 'dist',
    srcDir: 'src',
    manifest: {
        name: 'Tab Reminder',
        version: '1.0.0',
        description: 'Remind yourself about tabs after a certain period of time',
        permissions: ['alarms', 'storage', 'notifications', 'tabs', 'activeTab'],
        background: {
            service_worker: 'background.js',
            type: 'module',
        },
        action: {
            default_title: 'Tab Reminder',
            default_popup: 'index.html',
        },
    },
});
