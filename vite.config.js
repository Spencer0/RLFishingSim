import { defineConfig } from 'vite'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isUserOrOrgPagesRepo = repository.endsWith('.github.io')
const githubPagesBase = isUserOrOrgPagesRepo ? '/' : `/${repository}/`

export default defineConfig({
  root: './',
  base: process.env.GITHUB_PAGES === 'true' ? githubPagesBase : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  }
})
