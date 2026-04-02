import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '.',
  },
  output: {
    fileTracingRoot: '.',
  },
};

export default nextConfig;
