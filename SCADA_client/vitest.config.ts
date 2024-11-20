import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.ts'],
        exclude: ['dist'],
        coverage: {
            include: ['src/**/*.ts'],
            exclude: ['src/main/webapp/index/scada-svg-item-keys.ts']
        }
    }
})
