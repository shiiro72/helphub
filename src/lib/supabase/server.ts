import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

export function createClient(
  context: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse }
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name]
        },
        set(name: string, value: string, options: CookieOptions) {
          context.res.appendHeader('Set-Cookie', serializeCookie(name, value, options))
        },
        remove(name: string, options: CookieOptions) {
          context.res.appendHeader('Set-Cookie', serializeCookie(name, '', { ...options, maxAge: 0 }))
        },
      },
    }
  )
}

function serializeCookie(name: string, value: string, options: CookieOptions) {
  const cookieParts = [`${name}=${value}; Path=${options.path || '/'}`]
  if (options.maxAge !== undefined) cookieParts.push(`Max-Age=${options.maxAge}`)
  if (options.domain) cookieParts.push(`Domain=${options.domain}`)
  if (options.httpOnly) cookieParts.push('HttpOnly')
  if (options.secure) cookieParts.push('Secure')
  if (options.sameSite) cookieParts.push(`SameSite=${options.sameSite}`)
  return cookieParts.join('; ')
}
