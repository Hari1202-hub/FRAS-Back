import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react'; 
export default defineConfig({
    //base: '/fras/build/',
    plugins: [
        laravel({
            input: ['resources/css/index.css', 'resources/js/main.tsx'], // change app.js to app.jsx if React
            refresh: true,
        }),
        react(),
    ],
});
