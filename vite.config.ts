import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@app': resolve(__dirname, 'src/app'),
            '@widgets': resolve(__dirname, 'src/widgets'),
            '@features': resolve(__dirname, 'src/features'),
            '@shared': resolve(__dirname, 'src/shared'),
        },
    },
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://api.tilshunoslik.uz/',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
            },
        },
    },
})
