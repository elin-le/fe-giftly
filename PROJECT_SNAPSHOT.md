# PROJECT SNAPSHOT — Giftly Frontend

> Tự động sinh bởi `scripts/snapshot.sh`. **Không sửa tay** — chạy lại `npm run snapshot` khi cần.
> Nguyên tắc làm việc: xem `AGENTS.md`.

- Thời điểm tạo: 2026-11-19 09:29:58 +0000
- Git: chưa khởi tạo repository

## Stack & phiên bản

**dependencies**

| Package | Version |
|---|---|
| `@emotion/react` | ^11.14.0 |
| `@emotion/styled` | ^11.14.1 |
| `@fontsource-variable/lora` | ^5.3.0 |
| `@fontsource-variable/playfair-display` | ^5.3.0 |
| `@hookform/resolvers` | ^7.0.6 |
| `@mui/icons-material` | ^9.5.0 |
| `@mui/material` | ^9.5.0 |
| `@mui/x-data-grid` | ^9.17.0 |
| `@radix-ui/react-dialog` | ^1.3.1 |
| `@radix-ui/react-dropdown-menu` | ^2.2.1 |
| `@radix-ui/react-label` | ^2.1.17 |
| `@radix-ui/react-select` | ^2.4.1 |
| `@radix-ui/react-slot` | ^1.5.0 |
| `@radix-ui/react-switch` | ^1.4.1 |
| `@radix-ui/react-tabs` | ^1.2.1 |
| `@tailwindcss/vite` | ^4.3.5 |
| `axios` | ^1.21.1 |
| `class-variance-authority` | ^0.7.1 |
| `clsx` | ^2.1.1 |
| `lucide-react` | ^1.72.0 |
| `motion` | ^14.12.0 |
| `react` | ^19.3.1 |
| `react-dom` | ^19.3.1 |
| `react-hook-form` | ^7.92.0 |
| `react-router-dom` | ^7.18.5 |
| `tailwind-merge` | ^3.7.0 |
| `tailwindcss` | ^4.3.5 |
| `tw-animate-css` | ^1.4.0 |
| `zod` | ^4.6.7 |
| `zustand` | ^5.1.0 |

**devDependencies**

| Package | Version |
|---|---|
| `@testing-library/jest-dom` | ^7.0.1 |
| `@testing-library/react` | ^16.3.3 |
| `@testing-library/user-event` | ^14.6.10 |
| `@types/node` | ^24.19.2 |
| `@types/react` | ^19.3.0 |
| `@types/react-dom` | ^19.3.0 |
| `@vitejs/plugin-react` | ^6.1.2 |
| `@vitest/coverage-v8` | ^5.1.0 |
| `axios-mock-adapter` | ^2.1.0 |
| `jsdom` | ^31.0.0 |
| `oxlint` | ^1.90.0 |
| `typescript` | ~7.0.2 |
| `vite` | ^8.3.6 |
| `vitest` | ^5.1.0 |


## Scripts

- `npm run dev` → `vite`
- `npm run build` → `tsc -b && vite build`
- `npm run lint` → `oxlint`
- `npm run preview` → `vite preview`
- `npm run test` → `vitest run`
- `npm run test:watch` → `vitest`
- `npm run test:coverage` → `vitest run --coverage`
- `npm run typecheck` → `tsc -b`
- `npm run snapshot` → `bash scripts/snapshot.sh`

## Cấu trúc thư mục

```
docs
  api
    api-specification.md
  architecture
    database-design.md
    diagrams
      checkout-flow.md
    system-architecture.md
  development
    setup-guide.md
  requirements
    SRS.md
    use-cases.md
scripts
  snapshot.sh
src
  api
    client.test.ts
    client.ts
    ensureArray.test.ts
    ensureArray.ts
    ensureObject.test.ts
    ensureObject.ts
    errors.test.ts
    errors.ts
    mock
      cartView.ts
      catalogView.ts
      data.ts
      db.ts
      demoHistory.ts
      giftBoxConfig.ts
      giftBoxRequests.ts
      http.ts
      index.ts
      orderFlow.ts
      orderSnapshot.ts
      routes
        addresses.test.ts
        addresses.ts
        admin.test.ts
        admin.ts
        auth.test.ts
        auth.ts
        cart.test.ts
        cart.ts
        catalog.test.ts
        catalog.ts
        giftBoxConfigs.test.ts
        giftBoxConfigs.ts
        orders.test.ts
        orders.ts
        reviews.test.ts
        reviews.ts
        uploads.test.ts
        uploads.ts
      selections.ts
      stats.test.ts
      stats.ts
      stock.ts
      testUtils.ts
  app
    AppRoot.tsx
    router.test.tsx
    router.tsx
  components
    layout
      ContactLinks.test.tsx
      ContactLinks.tsx
      Logo.tsx
      MobileTabBar.tsx
      PageTransition.tsx
      StoreHeader.tsx
      StoreLayout.tsx
      ThemeToggle.test.tsx
      ThemeToggle.tsx
    ui
      badge.tsx
      button.tsx
      dialog.tsx
      dropdown-menu.tsx
      form-field.tsx
      input.tsx
      label.tsx
      quantity-stepper.tsx
      toaster.test.tsx
      toaster.tsx
  features
    addresses
      addressSchema.test.ts
      addressSchema.ts
      api
        addressesApi.ts
      components
        AddressForm.tsx
      formatAddress.test.ts
      formatAddress.ts
      hooks
        useAddresses.ts
      types.ts
    admin
      analytics
        AnalyticsPage.tsx
        CustomerAndGiftBoxPanels.tsx
        types.ts
      api
        adminApi.ts
      components
        ConfirmDialog.tsx
        DataTable.tsx
        KpiCard.tsx
        Money.tsx
        NoticeSnackbar.tsx
        PageHeader.tsx
        Panel.tsx
        StockChip.tsx
        charts
          AreaChart.tsx
          BarList.tsx
          ColumnChart.tsx
          DonutChart.tsx
          chartMath.test.ts
          chartMath.ts
          useChartColors.ts
      dashboard
        AttentionStrip.tsx
        DashboardPage.tsx
        LowStockList.tsx
        RecentOrders.tsx
      gift-box-requests
        GiftBoxRequestsPage.test.tsx
        GiftBoxRequestsPage.tsx
        RejectDialog.tsx
        RequestDetail.tsx
        requestRules.test.ts
        requestRules.ts
      hooks
        useAdminAction.ts
        useNotice.test.ts
        useNotice.ts
      layout
        AdminLayout.tsx
      management
        CategoriesPage.tsx
        CategoryFormDialog.tsx
        CustomersAndReviewsPages.test.tsx
        CustomersPage.tsx
        ReviewsPage.tsx
        categoryRules.test.ts
        categoryRules.ts
        customerRules.test.ts
        customerRules.ts
        types.ts
      orders
        AdminOrdersPage.tsx
        OrderDetailDialog.test.tsx
        OrderDetailDialog.tsx
        OrderStatusSelect.tsx
        orderStatusColor.test.ts
        orderStatusColor.ts
      products
        AdminProductsPage.test.tsx
        AdminProductsPage.tsx
        ConfirmDeleteDialog.tsx
        ProductFormDialog.test.tsx
        ProductFormDialog.tsx
        ProductRow.tsx
        ProductToolbar.tsx
        ProductsTable.tsx
        VariantDetailTable.tsx
        form
          BundleEditor.tsx
          FormFields.tsx
          GeneralTab.tsx
          ImagesTab.tsx
          OptionsTab.tsx
          VariantCard.tsx
          VariantsTab.tsx
          bundleCandidates.test.ts
          bundleCandidates.ts
        productFormSchema.test.ts
        productFormSchema.ts
        productTableRules.test.ts
        productTableRules.ts
      theme
        muiTheme.ts
    auth
      api
        authApi.ts
      authSchemas.test.ts
      authSchemas.ts
      components
        AuthCard.tsx
        DemoAccountsHint.tsx
        PasswordInput.tsx
        RequireAuth.test.tsx
        RequireAuth.tsx
        UserMenu.test.tsx
        UserMenu.tsx
      hooks
        useAuthDestination.ts
        useAuthGate.test.tsx
        useAuthGate.ts
      pages
        ForbiddenPage.tsx
        RegisterPage.test.tsx
        RegisterPage.tsx
        SignInPage.test.tsx
        SignInPage.tsx
      redirectState.test.ts
      redirectState.ts
      types.ts
    cart
      api
        cartApi.ts
      cartItemName.test.ts
      cartItemName.ts
      cartStore.test.ts
      cartStore.ts
      components
        CartBadgeLink.tsx
        CartGiftBoxLine.test.tsx
        CartGiftBoxLine.tsx
        CartItemThumb.tsx
        CartLine.test.tsx
        CartLine.tsx
        CartTotals.test.tsx
        CartTotals.tsx
      hooks
        useCartActions.test.tsx
        useCartActions.ts
        useCartSync.test.tsx
        useCartSync.ts
      pages
        CartPage.test.tsx
        CartPage.tsx
      testUtils.ts
      types.ts
    checkout
      components
        AddressPicker.tsx
        ConfirmOrderDialog.tsx
        OrderSuccess.tsx
        OrderSummary.tsx
        PaymentPicker.tsx
      hooks
        useCheckout.ts
      pages
        CheckoutPage.test.tsx
        CheckoutPage.tsx
    gift-builder
      api
        giftBoxApi.ts
      builderSteps.test.ts
      builderSteps.ts
      catalog.test.ts
      catalog.ts
      componentRole.test.ts
      componentRole.ts
      components
        BoxPreview.tsx
        BoxStep.tsx
        BuilderStepper.tsx
        CardMessageEditor.tsx
        DecorStep.tsx
        EditBanner.tsx
        FitMeter.tsx
        GiftBoxContents.test.tsx
        GiftBoxContents.tsx
        ItemsStep.tsx
        OptionPicker.tsx
        PolicyNotes.tsx
        ReviewStatusBadge.tsx
        ReviewStep.tsx
      constants.ts
      fit.test.ts
      fit.ts
      giftBox.test.ts
      giftBox.ts
      giftBuilderStore.test.ts
      giftBuilderStore.ts
      hooks
        useAddGiftBoxToCart.ts
        useBuilderCatalog.ts
        useEditGiftBox.ts
      pages
        GiftBuilderPage.test.tsx
        GiftBuilderPage.tsx
      testUtils.ts
      types.ts
    home
      HomePage.test.tsx
      HomePage.tsx
      NotFoundPage.tsx
      components
        CategoryShowcase.tsx
        HomeHero.tsx
        HotProducts.tsx
        SectionHeading.tsx
    orders
      api
        ordersApi.ts
        reviewsApi.ts
      components
        OrderCard.tsx
        OrderItemList.tsx
        OrderStatusBadge.tsx
        PaymentList.tsx
        ReviewDialog.tsx
      orderRules.ts
      orderStatus.test.ts
      orderStatus.ts
      pages
        OrdersPage.test.tsx
        OrdersPage.tsx
      types.ts
    products
      api
        productsApi.ts
        uploadsApi.ts
      bundleSelection.ts
      components
        BundleOptionPicker.tsx
        ProductCard.test.tsx
        ProductCard.tsx
        ProductFilters.tsx
        ProductGrid.tsx
        ProductImage.tsx
        RatingStars.tsx
        ReviewList.tsx
        VariantOptionPicker.tsx
      hooks
        useDebouncedValue.test.ts
        useDebouncedValue.ts
        useProducts.test.ts
        useProducts.ts
      imageUpload.test.ts
      imageUpload.ts
      pages
        ProductDetailPage.tsx
        ProductsPage.tsx
      policy.test.ts
      policy.ts
      productInputRules.test.ts
      productInputRules.ts
      productRules.test.ts
      productRules.ts
      testUtils.ts
      types.ts
  lib
    cn.test.ts
    cn.ts
    flyToCart.test.ts
    flyToCart.ts
    format.test.ts
    format.ts
    phone.test.ts
    phone.ts
    shopContact.ts
    useAsync.test.ts
    useAsync.ts
  main.tsx
  stores
    authStore.test.ts
    authStore.ts
    themeStore.test.ts
    themeStore.ts
    toastStore.test.ts
    toastStore.ts
  styles
    fonts.css
    index.css
  test
    setup.ts
  vite-env.d.ts
```

## Routes (src/app/router.tsx)

```
L52  element: <AppRoot />,
L55  element: <StoreLayout />,
L57  { index: true, element: <HomePage /> },
L58  { path: 'products', element: <ProductsPage /> },
L59  { path: 'products/:id', element: <ProductDetailPage /> },
L60  { path: 'builder', element: <GiftBuilderPage /> },
L61  { path: 'signin', element: <SignInPage /> },
L62  { path: 'register', element: <RegisterPage /> },
L65  element: <RequireAuth reason="Vui lòng đăng nhập để tiếp tục." />,
L67  { path: 'cart', element: <CartPage /> },
L68  { path: 'checkout', element: <CheckoutPage /> },
L69  { path: 'orders', element: <OrdersPage /> },
L72  { path: '*', element: <NotFoundPage /> },
L76  path: 'admin',
L77  element: (
L85  { index: true, element: <Navigate to="dashboard" replace /> },
L86  { path: 'dashboard', element: <Suspense fallback={null}><AdminDashboard /></Suspense> },
L87  { path: 'analytics', element: <Suspense fallback={null}><AdminAnalytics /></Suspense> },
L88  { path: 'categories', element: <Suspense fallback={null}><AdminCategories /></Suspense> },
L89  { path: 'customers', element: <Suspense fallback={null}><AdminCustomers /></Suspense> },
L90  { path: 'reviews', element: <Suspense fallback={null}><AdminReviews /></Suspense> },
L91  { path: 'gift-box-requests', element: <Suspense fallback={null}><AdminGiftBoxRequests /></Suspense> },
L92  { path: 'products', element: <Suspense fallback={null}><AdminProductsPage /></Suspense> },
L93  { path: 'orders', element: <Suspense fallback={null}><AdminOrdersPage /></Suspense> },
```

## Features

| Feature | Source | Test | Store | Có pages |
|---|---|---|---|---|
| `addresses` | 6 | 2 | — | không |
| `admin` | 58 | 14 | — | không |
| `auth` | 14 | 7 | — | có |
| `cart` | 13 | 8 | cartStore.ts | có |
| `checkout` | 7 | 1 | — | có |
| `gift-builder` | 27 | 8 | giftBuilderStore.ts | có |
| `home` | 6 | 1 | — | không |
| `orders` | 11 | 2 | — | có |
| `products` | 21 | 7 | — | có |

## Thống kê

- File mã nguồn (không tính test): 219
- File test: 76
- Số dòng mã nguồn: 12041

**File nguồn chưa có test đi kèm** (logic nên có test):

- `src/features/addresses/hooks/useAddresses.ts`
- `src/features/admin/hooks/useAdminAction.ts`
- `src/features/auth/hooks/useAuthDestination.ts`
- `src/features/checkout/hooks/useCheckout.ts`
- `src/features/gift-builder/hooks/useAddGiftBoxToCart.ts`
- `src/features/gift-builder/hooks/useBuilderCatalog.ts`
- `src/features/gift-builder/hooks/useEditGiftBox.ts`
- `src/lib/shopContact.ts`

## TODO / FIXME

- _(không có)_

## Biến môi trường (.env.example)

```
# URL của backend Spring Boot (mặc định '/api' nếu không khai báo)
VITE_API_BASE_URL=http://localhost:8080/api

# true: dùng backend giả lập trong bộ nhớ (không cần Spring Boot)
VITE_USE_MOCK=true
```

## Tài liệu (docs/)

| File | Số dòng |
|---|---|
| `docs/api/api-specification.md` | 305 |
| `docs/architecture/database-design.md` | 108 |
| `docs/architecture/diagrams/checkout-flow.md` | 59 |
| `docs/architecture/system-architecture.md` | 101 |
| `docs/development/setup-guide.md` | 77 |
| `docs/requirements/SRS.md` | 101 |
| `docs/requirements/use-cases.md` | 102 |
