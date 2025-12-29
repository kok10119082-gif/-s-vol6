'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const saveProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email ?? null)

      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
        })
    }

    saveProfile()
  }, [])

  return (
    <main>
      <h1>ログイン成功</h1>
      <p>ログイン中: {email}</p>
      <p>次は「profilesへ保存」→「招待・紐付け」です。</p>
    </main>
  )
}
