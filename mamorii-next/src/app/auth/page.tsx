'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    // すでにログイン済みならトップへ
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) location.href = '/'
    })
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    setErr('')

    if (!email || !password) {
      setErr('email と password を入力してください')
      return
    }

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return setErr(error.message)
      setMsg('ログイン成功。トップへ移動します...')
      location.href = '/'
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return setErr(error.message)
    setMsg('登録しました。メール確認が必要な設定の場合は確認してください。ログイン後トップへ戻ります。')
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 520 }}>
      <h1>{mode === 'signin' ? 'ログイン' : '新規登録'}</h1>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button onClick={() => setMode('signin')} disabled={mode === 'signin'}>ログイン</button>
        <button onClick={() => setMode('signup')} disabled={mode === 'signup'}>新規登録</button>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <label>
          メール
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
        </label>

        <label>
          パスワード
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
        </label>

        <button type="submit">{mode === 'signin' ? 'ログイン' : '登録'}</button>
      </form>

      {msg ? <p>{msg}</p> : null}
      {err ? <pre style={{ whiteSpace: 'pre-wrap' }}>ERROR: {err}</pre> : null}

      <p style={{ marginTop: 16 }}>ログイン後、自動でトップ（/）に戻ります。</p>
    </main>
  )
}
