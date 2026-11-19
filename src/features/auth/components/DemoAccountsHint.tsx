/** Gợi ý tài khoản demo — chỉ hiện khi chạy bằng mock API (không có backend thật). */
export function DemoAccountsHint() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return null

  return (
    <aside className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
      <p className="mb-1 font-semibold text-foreground">Tài khoản demo (mock API)</p>
      <p>Khách hàng: user@giftly.vn / User@123</p>
      <p>Quản trị: admin@giftly.vn / Admin@123</p>
    </aside>
  )
}
