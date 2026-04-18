import { createClient } from '@/lib/supabase/server'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query

  if (code) {
    const supabase = createClient({ req, res })
    await supabase.auth.exchangeCodeForSession(String(code))
  }

  res.redirect('/')
}
