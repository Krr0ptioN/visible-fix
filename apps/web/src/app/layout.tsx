import './global.css';

export const metadata = {
  title: 'VisibleFix Web',
  description: 'VisibleFix reporting flow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
