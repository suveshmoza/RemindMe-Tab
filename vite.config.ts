import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [
        tailwindcss(),
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: 'manifest.json',
                    dest: '.',
                },
                {
                    src: 'public/*',
                    dest: '.',
                },
            ],
        }),
        {
            name: 'service-worker-no-window',
            generateBundle(_options, bundle) {
                // Replace window references in background.js
                if (bundle['background.js']) {
                    const file = bundle['background.js'];
                    if (file.type === 'chunk') {
                        file.code = file.code.replace(/\bwindow\b/g, 'undefined');
                    }
                }
            },
        },
    ],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'index.html'),
                background: resolve(__dirname, 'src/background/index.ts'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js';
                },
                chunkFileNames: (chunkInfo) => {
                    // Don't create chunks for background script
                    if (chunkInfo.name === 'background') {
                        return 'background.js';
                    }
                    return 'assets/[name]-[hash].js';
                },
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
});
