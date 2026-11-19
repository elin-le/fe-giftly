import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import '@/styles/index.css'
// Import để store khởi tạo & áp dụng theme (sáng/tối) ngay khi ứng dụng chạy
import '@/stores/themeStore'

async function bootstrap() {
  // Khi chưa có Spring Boot, bật VITE_USE_MOCK=true để dùng backend giả lập
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { installMockApi } = await import('@/api/mock')
    installMockApi()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

void bootstrap()
