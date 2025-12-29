export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>動作確認</h1>
      <ul>
        <li><a href="/auth">/auth（ログイン）</a></li>
        <li><a href="/invite">/invite（招待・紐付け）</a></li>
      </ul>
      <p style={{ opacity: 0.7 }}>※ もし白画面になったら、URL末尾に /auth を直打ちして挙動確認してください。</p>
    </main>
  )
}
