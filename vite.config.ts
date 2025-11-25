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
        proxy: {
            '/api': {
                target: 'http://45.138.158.87:8000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
            },
        },
    },
})
