'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    // すでにログイン済みならダッシュボードへ
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router, supabase])

  const onSubmit = async () => {
    setMessage('')
    if (!email || !password) {
      setMessage('メールとパスワードを入力してください')
      return
    }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(`ログイン失敗: ${error.message}`)
      else router.replace('/dashboard')
      return
    }

    // signup
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(`新規登録失敗: ${error.message}`)
      return
    }
    setMessage('新規登録OK。メール確認が必要な設定の場合は、届いたメールから確認してください。')
    router.replace('/dashboard')
  }

  const onLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  return (
    <main style={{ maxWidth: 520, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1>ログイン</h1>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <button onClick={() => setMode('login')} disabled={mode === 'login'}>ログイン</button>
        <button onClick={() => setMode('signup')} disabled={mode === 'signup'}>新規登録</button>
      </div>

      <label style={{ display: 'block', marginTop: 12 }}>メール</label>
      <input
        style={{ width: '100%', padding: 10 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@mail.com"
        inputMode="email"
        autoComplete="email"
      />

      <label style={{ display: 'block', marginTop: 12 }}>パスワード</label>
      <input
        style={{ width: '100%', padding: 10 }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="8文字以上推奨"
        type="password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={onSubmit}>{mode === 'login' ? 'ログイン' : '新規登録'}</button>
        <button onClick={onLogout} type="button">ログアウト</button>
      </div>

      {message && <p style={{ marginTop: 16, color: '#b00020' }}>{message}</p>}

      <p style={{ marginTop: 24 }}>
        ログイン後は <a href="/dashboard">/dashboard</a> に入ります。
      </p>
    </main>
  )
}
