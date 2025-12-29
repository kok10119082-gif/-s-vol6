'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const signUp = async () => {
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signUp({ email, password })
    setMsg(error ? `ERROR: ${error.message}` : 'OK: signUp（確認メールが必要な設定の場合はメールを確認）')
    setLoading(false)
  }

  const signIn = async () => {
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMsg(error ? `ERROR: ${error.message}` : 'OK: signIn')
    setLoading(false)
  }

  const signOut = async () => {
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signOut()
    setMsg(error ? `ERROR: ${error.message}` : 'OK: signOut')
    setLoading(false)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>/auth（ログイン）</h1>

      <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <label>
          メール
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          パスワード
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={signIn} disabled={loading}>ログイン</button>
          <button onClick={signUp} disabled={loading}>新規登録</button>
          <button onClick={signOut} disabled={loading}>ログアウト</button>
        </div>

        {msg && <pre style={{ whiteSpace: 'pre-wrap' }}>{msg}</pre>}

        <a href="/" style={{ marginTop: 12 }}>← トップへ戻る</a>
      </div>
    </main>
  )
}
