'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/auth')
        return
      }
      setEmail(data.user.email ?? '')
    })
  }, [router, supabase])

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  return (
    <main style={{ maxWidth: 520, margin: '40px auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1>ログイン成功</h1>
      <p>ログイン中: {email || '(emailなし)'}</p>

      <div style={{ marginTop: 16 }}>
        <button onClick={logout}>ログアウト</button>
      </div>

      <p style={{ marginTop: 24 }}>
        次は「profilesへ保存」→「招待・紐付け」です。
      </p>
    </main>
  )
}
