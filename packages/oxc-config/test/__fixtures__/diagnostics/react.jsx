export function BadComponent() {
  return (
    <div>
      <img src="profile.png" />
      <a href="https://example.com" />
      <div dangerouslySetInnerHTML={{ __html: 'bad' }} />
      {[1, 2].map(n => <span>{n}</span>)}
    </div>
  )
}
