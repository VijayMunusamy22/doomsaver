import { ImageResponse } from 'next/og'

export const alt = 'DoomSaver - Family Budget Planner'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(140deg, #F2EDE4 0%, #E8B84B 100%)',
          color: '#1A1B22',
          padding: '72px',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '4px solid #1A1B22',
            borderRadius: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px',
            backgroundColor: 'rgba(242, 237, 228, 0.92)',
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>DoomSaver</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.03em' }}>
              Family Budget Planner
            </div>
            <div style={{ fontSize: 30, opacity: 0.9 }}>
              Track income, assign expenses, and plan together.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
