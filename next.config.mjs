/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', 
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

if(process.env.NODE_ENV !== 'production') {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}

export default nextConfig
