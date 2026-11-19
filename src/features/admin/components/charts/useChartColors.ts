import { useTheme } from '@mui/material/styles'

/** Bảng màu biểu đồ lấy từ theme (đổi theo sáng/tối), đủ phân biệt khi đặt cạnh nhau. */
export function useChartColors(): string[] {
  const { palette } = useTheme()
  return [palette.primary.main, palette.warning.main, palette.info.main, palette.success.main, palette.error.main, palette.text.secondary]
}
