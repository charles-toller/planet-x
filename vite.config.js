import {defineConfig} from 'vite';
export default defineConfig({
    optimizeDeps: {
        include: ['tar-stream']
    },
    build: {
        commonjsOptions: {
            include: [/tar-stream/, /node_modules/],
        }
    }
});