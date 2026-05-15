import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN IPs in dev so phone testing works.
  allowedDevOrigins: ["127.0.0.1", "192.168.1.0/24", "192.168.0.0/24"],
};

export default nextConfig;
