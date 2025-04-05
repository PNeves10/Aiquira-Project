import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders } from './utils/security';
import { RateLimiter } from './utils/security';

const rateLimiter = new RateLimiter();

export function middleware(request: NextRequest) {
  // Apply rate limiting
  const ip = request.ip ?? 'anonymous';
  if (rateLimiter.isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // Get the response
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Check GDPR consent for analytics
  const consent = request.cookies.get('gdpr-consent');
  if (consent) {
    try {
      const preferences = JSON.parse(consent.value);
      if (!preferences.analytics) {
        // Disable analytics tracking if not consented
        response.headers.set('X-Analytics-Disabled', 'true');
      }
    } catch (error) {
      console.error('Error parsing GDPR consent:', error);
    }
  }

  // Add security-related headers
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 