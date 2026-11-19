import Analytics from '@mui/icons-material/Analytics'
import CardGiftcard from '@mui/icons-material/CardGiftcard'
import Category from '@mui/icons-material/Category'
import Dashboard from '@mui/icons-material/Dashboard'
import Groups from '@mui/icons-material/Groups'
import Logout from '@mui/icons-material/Logout'
import RateReview from '@mui/icons-material/RateReview'
import Inventory2 from '@mui/icons-material/Inventory2'
import MenuIcon from '@mui/icons-material/Menu'
import ReceiptLong from '@mui/icons-material/ReceiptLong'
import Storefront from '@mui/icons-material/Storefront'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { ThemeProvider } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { createAdminTheme } from '../theme/muiTheme'

const DRAWER_WIDTH = 240

const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Tổng quan', icon: <Dashboard /> },
  { to: '/admin/analytics', label: 'Phân tích', icon: <Analytics /> },
  { to: '/admin/orders', label: 'Đơn hàng', icon: <ReceiptLong /> },
  { to: '/admin/gift-box-requests', label: 'Yêu cầu hộp quà', icon: <CardGiftcard /> },
  { to: '/admin/products', label: 'Sản phẩm', icon: <Inventory2 /> },
  { to: '/admin/categories', label: 'Danh mục', icon: <Category /> },
  { to: '/admin/customers', label: 'Khách hàng', icon: <Groups /> },
  { to: '/admin/reviews', label: 'Đánh giá', icon: <RateReview /> },
  { to: '/', label: 'Về cửa hàng', icon: <Storefront /> },
]

export function AdminLayout() {
  const mode = useThemeStore((state) => state.mode)
  const theme = useMemo(() => createAdminTheme(mode), [mode])
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const signOut = useAuthStore((state) => state.signOut)

  const handleSignOut = () => {
    signOut()
    navigate('/signin', { replace: true })
  }

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Giftly Admin
        </Typography>
      </Toolbar>
      <List onClick={() => setMobileOpen(false)}>
        {ADMIN_NAV.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{ borderRadius: 999, mx: 1, '&.active': { bgcolor: 'action.selected' } }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            ml: { md: `${DRAWER_WIDTH}px` },
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1, display: { md: 'none' } }}
              aria-label="Mở menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography sx={{ flexGrow: 1, fontWeight: 700 }}>
              Bảng điều khiển
            </Typography>
            <ThemeToggle />
            <Button color="inherit" startIcon={<Logout />} onClick={handleSignOut} sx={{ ml: 1 }}>
              Đăng xuất
            </Button>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }} aria-label="Menu quản trị">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderColor: 'divider' },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
