/** @type {import('next').NextConfig} */
const nextConfig = {
  // Necessário para processar PDFs grandes no servidor
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
};

module.exports = nextConfig;
