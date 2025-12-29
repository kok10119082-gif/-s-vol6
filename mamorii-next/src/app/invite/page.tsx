'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InvitePage() {
  const [code, setCode] = useState<string>('')
  const [msg, setMsg] = useState<string>('')

  const createInvite = async () => {
    setMsg('')
    setCode('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMsg('未ログインです')
      return
    }

    const { data, error } = await supabase
      .from('invites')
      .insert({
        senior_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('code')
      .single()

    if (error) {
      setMsg('作成に失敗: ' + error.message)
      return
    }

    setCode(data.code)
    setMsg('招待コードを作成しました（7日間有効）')
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>招待コード発行（高齢者側）</h1>
      <button onClick={createInvite}>招待コードを作る</button>
      {msg && <p>{msg}</p>}
      {code && (
        <>
          <p><b>招待コード</b></p>
          <pre style={{ fontSize: 18 }}>{code}</pre>
        </>
      )}
      <p>家族は /redeem に行ってこのコードを入力します。</p>
    </main>
  )
}
