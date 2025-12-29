'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RedeemPage() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')

  const redeem = async () => {
    setMsg('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMsg('未ログインです')
      return
    }

    // 招待コードから senior_id を取得（未使用＆期限内）
    const { data: inv, error: e1 } = await supabase
      .from('invites')
      .select('code, senior_id, expires_at, used_at')
      .eq('code', code.trim())
      .maybeSingle()

    if (e1 || !inv) {
      setMsg('コードが見つかりません')
      return
    }

    if (inv.used_at) {
      setMsg('このコードは既に使用済みです')
      return
    }

    if (inv.expires_at && new Date(inv.expires_at).getTime() < Date.now()) {
      setMsg('このコードは期限切れです')
      return
    }

    // links に紐付けを作成（family_id はログインユーザー）
    const { error: e2 } = await supabase
      .from('links')
      .insert({ family_id: user.id, senior_id: inv.senior_id })

    if (e2) {
      setMsg('紐付け作成に失敗: ' + e2.message)
      return
    }

    // invites を使用済みに更新（家族IDと使用時刻）
    const { error: e3 } = await supabase
      .from('invites')
      .update({ used_by_family_id: user.id, used_at: new Date().toISOString() })
      .eq('code', inv.code)

    if (e3) {
      setMsg('使用済み更新に失敗: ' + e3.message)
      return
    }

    setMsg('紐付け完了しました！')
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>招待コード入力（家族側）</h1>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="招待コード"
        style={{ fontSize: 18, padding: 8, width: 320 }}
      />
      <div style={{ height: 12 }} />
      <button onClick={redeem}>紐付けする</button>
      {msg && <p>{msg}</p>}
    </main>
  )
}
