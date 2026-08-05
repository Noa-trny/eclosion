import type { NextConfig } from "next";

/** Security headers on every response.
 *
 *  The CSP here is deliberately a single directive. A full policy would break
 *  the site as it stands: the HTML Next serves carries an inline hydration
 *  script, which a strict `script-src` rejects. Allowing it needs per-request
 *  nonces, so a middleware — its own piece of work, with its own test pass.
 *  `frame-ancestors` is the one directive that constrains nothing about how
 *  resources load, so it can ship on its own today.
 *
 *  It duplicates `X-Frame-Options` on purpose: recent browsers ignore the
 *  latter when a CSP frame-ancestors is present, older ones only know it. */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // Nothing the experience relies on is listed: pointer lock and fullscreen
    // are not governed by these directives.
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
