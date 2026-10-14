import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

/*
 * Content-Security-Policy — shipped in REPORT-ONLY mode on purpose.
 *
 * Report-Only makes the browser log violations without blocking anything, so this cannot
 * break the app. Click through sign-in, /discover, /pitches and /deals once, watch the
 * console, then rename the header to `Content-Security-Policy` to start enforcing. The
 * README has the same note.
 *
 * Two directives are deliberately loose and will stay that way:
 *
 *  - `style-src` allows 'unsafe-inline' because the UI is built almost entirely from
 *    React inline `style` props. Removing that would mean rewriting the frontend.
 *  - `script-src` allows 'unsafe-inline' because Next streams the RSC payload through
 *    inline <script> tags. Tightening this needs a per-request nonce plumbed through
 *    src/proxy.ts, which is its own piece of work.
 *
 * The directives that cost nothing are strict: no plugins, no framing, no <base> games.
 */
const CSP_DIRECTIVES = [
  `default-src 'self'`,
  // 'unsafe-eval' is Turbopack's dev-time requirement only.
  `script-src 'self' 'unsafe-inline'${isProd ? '' : ` 'unsafe-eval'`}`,
  // fonts.googleapis.com serves the stylesheet @imported at the top of globals.css.
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  // Scraped business logos, OAuth avatars and Unsplash testimonial photos all land here,
  // and the set of hosts is not knowable ahead of time. Images cannot execute.
  `img-src 'self' data: blob: https:`,
  `media-src 'self'`,
  `connect-src 'self'`,
  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  // Google and GitHub both terminate their OAuth flow with a POST back to /api/auth/*,
  // which is same-origin; the outbound leg is a navigation, not a form submission.
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ')

const securityHeaders = [
  // Stops a response being reinterpreted as a different type than its Content-Type says —
  // the classic route from "user-supplied file" to "executed script".
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Full URL to same-origin, origin only cross-origin. Dashboard URLs carry ids.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Nothing here is meant to be embedded, and clickjacking a dashboard with destructive
  // actions in it is worth closing. Duplicated by `frame-ancestors` for modern browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  // None of these are used. Declining them means an injected script cannot ask either.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Content-Security-Policy-Report-Only', value: CSP_DIRECTIVES },
]

const nextConfig: NextConfig = {
  // `X-Powered-By: Next.js` tells an attacker which framework's advisories to read.
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Everything, including /api. HSTS is production-only: browsers ignore it over
        // plain http anyway, but pinning `localhost` to https would be a nuisance.
        source: '/:path*',
        headers: isProd
          ? [
              ...securityHeaders,
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              },
            ]
          : securityHeaders,
      },
      {
        // API responses are per-user and must never be stored by a shared cache. Next
        // does not set this for route handlers that return a plain NextResponse.
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },
};

export default nextConfig;
