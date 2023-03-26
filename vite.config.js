import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
export default defineConfig({
    optimizeDeps: {
        include: ['tar-stream']
    },
    build: {
        commonjsOptions: {
            include: [/tar-stream/, /node_modules/],
        }
    },
    plugins: [react(), svgr()]
});