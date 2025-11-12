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
        name: 'RemindMe Tab',
        version: '1.0.0',
        description: 'Remind yourself about tabs after a certain period of time',
        permissions: ['alarms', 'storage', 'notifications', 'tabs', 'activeTab'],
        background: {
            service_worker: 'background.js',
            type: 'module',
        },
        action: {
            default_title: 'RemindMe Tab',
            default_popup: 'index.html',
        },
        browser_specific_settings: {
            gecko: {
                id: 'remindme-tab@suvesh',
                // @ts-ignore
                data_collection_permissions: {
                    required: ['none'],
                },
            },
        },
    },
});
