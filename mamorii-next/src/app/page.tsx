'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [email, setEmail] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [status, setStatus] = useState<string>('loading...')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const run = async () => {
      setError('')
      setStatus('getting session...')

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr) {
        setError(`getSession error: ${sessionErr.message}`)
        setStatus('failed')
        return
      }

      const user = sessionData.session?.user
      if (!user) {
        // 未ログインならログイン画面へ
        location.href = '/auth'
        return
      }

      setEmail(user.email ?? '')
      setUserId(user.id)
      setStatus('upserting profile...')

      const upsertRes = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
      })

      if (upsertRes.error) {
        setError(`profiles upsert error: ${upsertRes.error.message}`)
        setStatus('failed')
        return
      }

      setStatus('ok (profile saved)')
    }

    run()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    location.href = '/auth'
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>ログイン成功</h1>
      <p>ログイン中: {email}</p>
      <p>user_id: {userId}</p>
      <p>status: {status}</p>
      {error ? <pre style={{ whiteSpace: 'pre-wrap' }}>ERROR: {error}</pre> : null}
      <button onClick={logout} style={{ marginTop: 12 }}>ログアウト</button>

      <p style={{ marginTop: 16 }}>次は「招待・紐付け」です。</p>
    </main>
  )
}
