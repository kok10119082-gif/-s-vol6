'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InvitePage() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setStatus(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setStatus('ログインしていません')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.rpc('use_invite', {
      invite_code: code,
    })

    if (error) {
      setStatus('エラー: ' + error.message)
    } else {
      setStatus('招待を受け取りました（紐付け完了）')
    }

    setLoading(false)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>招待・紐付け</h1>

      <p>家族から受け取った招待コードを入力してください</p>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="招待コード"
        style={{ padding: 8, width: 240 }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={submit} disabled={loading}>
          {loading ? '処理中…' : '紐付けする'}
        </button>
      </div>

      {status && (
        <p style={{ marginTop: 16 }}>
          {status}
        </p>
      )}
    </main>
  )
}
