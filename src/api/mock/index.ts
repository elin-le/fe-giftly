import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '../client'
import { addDemoHistory } from './demoHistory'
import { createDb } from './db'
import { registerAdminRoutes } from './routes/admin'
import { registerAddressRoutes } from './routes/addresses'
import { registerAuthRoutes } from './routes/auth'
import { registerCartRoutes } from './routes/cart'
import { registerCatalogRoutes } from './routes/catalog'
import { registerGiftBoxRoutes } from './routes/giftBoxConfigs'
import { registerOrderRoutes } from './routes/orders'
import { registerReviewRoutes } from './routes/reviews'
import { registerUploadRoutes } from './routes/uploads'

const DEFAULT_LATENCY_MS = 350

/**
 * Backend giả lập trong bộ nhớ để phát triển FE khi Spring Boot chưa sẵn sàng.
 * Bật bằng VITE_USE_MOCK=true. Hợp đồng endpoint: docs/api/api-specification.md
 * Dữ liệu chỉ sống trong bộ nhớ: tải lại trang là về dữ liệu mẫu (kể cả tài khoản mới đăng ký).
 */
export function installMockApi({ latencyMs = DEFAULT_LATENCY_MS, demoHistory = true } = {}): void {
  const db = createDb()
  if (demoHistory) addDemoHistory(db)
  const mock = new MockAdapter(apiClient, { delayResponse: latencyMs })

  registerAuthRoutes(mock, db)
  registerCatalogRoutes(mock, db)
  registerAddressRoutes(mock, db)
  registerCartRoutes(mock, db)
  registerGiftBoxRoutes(mock, db)
  registerOrderRoutes(mock, db)
  registerReviewRoutes(mock, db)
  registerUploadRoutes(mock, db)
  registerAdminRoutes(mock, db)
}
