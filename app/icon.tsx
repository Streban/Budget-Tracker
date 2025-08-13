import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width="512"
        height="512"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="walletBody" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f4f4f7" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.18" />
          </filter>
        </defs>

        <circle cx="256" cy="256" r="240" fill="#48CCB3" />

        <g filter="url(#shadow)">
          <rect x="96" y="144" width="320" height="232" rx="36" fill="url(#walletBody)" />
          <rect x="112" y="160" width="288" height="200" rx="28" fill="#ffffff" />
        </g>

        <g filter="url(#shadow)">
          <rect x="304" y="204" width="128" height="112" rx="20" fill="#F59F3A" />
          <rect x="416" y="204" width="16" height="112" rx="8" fill="#E2851B" />
          <circle cx="344" cy="260" r="24" fill="#ffffff" />
        </g>

        <rect x="96" y="344" width="320" height="16" rx="8" fill="#ffffff" opacity="0.65" />
      </svg>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}


