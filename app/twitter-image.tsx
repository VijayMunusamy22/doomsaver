import { ImageResponse } from 'next/og'

export const alt = 'DoomSaver - Family Budget Planner'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A1B22',
          color: '#F2EDE4',
          padding: '56px',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '2px solid #C9922B',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '18px',
            padding: '48px',
          }}
        >
          <div style={{ fontSize: 34, color: '#E8B84B', fontWeight: 700 }}>DoomSaver</div>
          <div style={{ fontSize: 68, lineHeight: 1.05, fontWeight: 700 }}>
            Family Budget Planner
          </div>
          <div style={{ fontSize: 30, color: '#F2EDE4' }}>
            Shared finances for modern families.
          </div>
        </div>
      </div>
    ),
    size,
  )
}
