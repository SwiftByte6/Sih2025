import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
};

export default withPWA(nextConfig);
