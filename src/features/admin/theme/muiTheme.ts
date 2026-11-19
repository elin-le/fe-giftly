import { createTheme, type Theme } from '@mui/material/styles'
import type { ThemeMode } from '@/stores/themeStore'

const FONT_STACK = "'Giftly Digits', 'Playfair Display Variable', Georgia, serif"

/** Palette MUI đồng bộ với design tokens của storefront (không dùng màu thuần). */
const PALETTES = {
  light: {
    background: '#e5eae2',
    paper: '#f1f4ee',
    text: '#2a0b26',
    textSecondary: '#6a5868',
    primary: '#3a0f34',
    primaryText: '#f1f4ee',
    secondary: '#eaaa00',
    divider: '#c9d1c5',
    zebra: '#ebf0e8',
    hover: '#fbe9bf',
    expanded: '#f6efe6',
    success: '#2f7d5b',
    warning: '#b87400',
    error: '#c2364a',
    info: '#6b4fa3',
  },
  dark: {
    background: '#190a16',
    paper: '#25101f',
    text: '#e5eae2',
    textSecondary: '#cdbdca',
    primary: '#eaaa00',
    primaryText: '#2a0b26',
    secondary: '#e5eae2',
    divider: '#5f3d56',
    zebra: '#2e1528',
    hover: '#4a2a3f',
    expanded: '#391a32',
    success: '#6fd1a3',
    warning: '#f0b73a',
    error: '#ff8a9b',
    info: '#b9a2ee',
  },
} as const

declare module '@mui/material/styles' {
  interface Palette {
    row: { zebra: string; hover: string; expanded: string }
  }
  interface PaletteOptions {
    row?: { zebra: string; hover: string; expanded: string }
  }
}

export function createAdminTheme(mode: ThemeMode): Theme {
  const p = PALETTES[mode]

  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary, contrastText: p.primaryText },
      secondary: { main: p.secondary },
      background: { default: p.background, paper: p.paper },
      text: { primary: p.text, secondary: p.textSecondary },
      divider: p.divider,
      row: { zebra: p.zebra, hover: p.hover, expanded: p.expanded },
      success: { main: p.success },
      warning: { main: p.warning },
      error: { main: p.error },
      info: { main: p.info },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: FONT_STACK,
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 999 } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      // Dấu * của trường bắt buộc luôn đỏ để dễ nhận biết.
      MuiFormLabel: { styleOverrides: { asterisk: { color: p.error, fontWeight: 700 } } },
      MuiTableCell: { styleOverrides: { head: { fontWeight: 700, color: p.text, backgroundColor: p.expanded, whiteSpace: 'nowrap' } } },
    },
  })
}
