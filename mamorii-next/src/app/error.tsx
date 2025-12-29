'use client'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <main style={{ padding: 24 }}>
      <h1>画面エラー</h1>
      <p>下の内容をそのまま送ってください（原因特定できます）</p>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
        {String(error?.message ?? error)}
      </pre>
      <button onClick={() => reset()} style={{ marginTop: 12, padding: '10px 14px' }}>再読み込み</button>
    </main>
  )
}
