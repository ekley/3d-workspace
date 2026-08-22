interface IconProps {
  name: string
  size?: number
}

const PATHS: Record<string, string> = {
  search: 'M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  settings:
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.4-2.1a7.7 7.7 0 0 0 .06-1.4l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.2-.7L15.5 4h-4l-.4 2.6a7.6 7.6 0 0 0-1.2.7l-2.5-1-2 3.5 2.1 1.6a7.7 7.7 0 0 0 0 1.4L5 14.4l2 3.5 2.5-1c.4.3.8.5 1.2.7L11.5 20h4l.4-2.6c.4-.2.8-.4 1.2-.7l2.5 1 2-3.5-2.1-1.6z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  layers:
    'M12 2l9 5-9 5-9-5 9-5zm-9 9l9 5 9-5M3 16l9 5 9-5',
  check: 'M4 12.5l5 5L20 6.5',
  folder:
    'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
  calendar:
    'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  plus: 'M12 5v14M5 12h14',
  upload: 'M12 16V4m0 0L7 9m5-5l5 5M4 20h16',
  zap: 'M13 2L3 14h7l-1 8 11-14h-7l1-6z',
  chevron: 'M6 9l6 6 6-6',
  close: 'M6 6l12 12M18 6L6 18',
  maximize: 'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3',
  monitor: 'M3 5h18v12H3zM9 21h6M12 17v4',
  file: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zm0 0v6h6',
  play: 'M5 3l14 9-14 9V3z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 2',
  volume: 'M11 5L6 9H2v6h4l5 4V5zm4.5 3.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14',
  'volume-x': 'M11 5L6 9H2v6h4l5 4V5zm12 4l-6 6m0-6l6 6',
  rotate: 'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15',
  terminal: 'M4 17l6-6-6-6M12 19h10',
}

export function Icon({ name, size = 18 }: IconProps) {
  const d = PATHS[name] ?? PATHS.grid
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
