import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a fully static site into `out/` so GitHub Pages can serve it directly.
  output: 'export',

  // Without this, Turbopack walks up past the repo and infers the workspace
  // root from an unrelated package-lock.json in the home directory.
  turbopack: {
    root: projectRoot,
  },

  // This is a GitHub *user* site served from the domain root
  // (https://gonzalez.github.io/), so no basePath/assetPrefix is required.

  // The Next image optimizer needs a server; static hosting has none.
  images: {
    unoptimized: true,
  },

  // Emit `about/index.html` instead of `about.html` so paths work without
  // server-side rewrite rules.
  trailingSlash: true,

  reactStrictMode: true,
}

export default nextConfig
