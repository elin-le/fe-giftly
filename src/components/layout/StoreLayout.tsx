import { AnimatePresence } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { ContactLinks } from './ContactLinks'
import { MobileTabBar } from './MobileTabBar'
import { PageTransition } from './PageTransition'
import { StoreHeader } from './StoreHeader'

export function StoreLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-dvh flex-col">
      <StoreHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-8 md:pb-16">
        <AnimatePresence mode="wait">
          <PageTransition key={pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <footer className="border-t border-border bg-surface/60 px-4 pb-28 pt-8 text-sm text-muted-foreground md:pb-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <p>© 2026 Giftly — Quà tặng cá nhân hóa</p>
          <ContactLinks className="justify-center" />
        </div>
      </footer>
      <MobileTabBar />
    </div>
  )
}
