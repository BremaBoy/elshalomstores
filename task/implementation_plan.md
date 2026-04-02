# Elshalomstores — Full Platform Implementation Plan

Elshalomstores is a complete digital retail ecosystem: a **Customer Shopping Website**, an **Admin & Super Admin Dashboard**, a **unified Mobile App** (iOS & Android, for both customers and admins), and a **Node.js/Express backend** with **Supabase (PostgreSQL)**.

---

## Architecture Overview

```
elshalomstores.com.ng       admin.elshalomstores.com.ng
 (Customer Website)          (Admin / Super Admin Website)
        │                               │
        └──────────────┬────────────────┘
                       │
           Unified Mobile App (iOS + Android)
           Expo React Native — role-based UI
                       │
                       ▼
          Backend API Server (Node.js / Express)
                       │
                       ▼
             Central Database (Supabase)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Customer Website | Next.js 14 (App Router) + TypeScript |
| Admin Dashboard | Next.js 14 (App Router) + TypeScript |
| Mobile App | React Native (Expo) — iOS & Android |
| Backend API | Node.js + Express.js + TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT + RBAC) |
| File Storage | Supabase Storage (product images) |
| Real-time | Supabase Realtime (WebSockets) |
| Payments | Paystack + Flutterwave |
| Email | Resend or Nodemailer |
| SMS | Termii or Twilio |
| Push Notifications | Expo Notifications + Firebase Cloud Messaging |
| Barcode (web) | `zxing-js` |
| Barcode (mobile) | `expo-barcode-scanner` |
| Deployment | Vercel (Websites) + Railway (Backend API) |

---

## Repository Structure

```
elshalomstores/
├── backend/        # Node.js/Express API
├── web-customer/   # elshalomstores.com.ng
├── web-admin/      # admin.elshalomstores.com.ng
└── mobile/         # Expo app (iOS + Android)
```

---

## User Roles

| Role | Access |
|---|---|
| `customer` | Customer website + Customer mobile app screens |
| `admin` | Admin website + Admin mobile app screens |
| `super_admin` | Admin website only — no mobile panel |

---

## Database Schema (Supabase / PostgreSQL)

| Table | Key Columns |
|---|---|
| `users` | id, name, email, phone, role, is_suspended, created_at |
| `addresses` | id, user_id, full_name, phone, address, city, state, is_default |
| `categories` | id, name, slug, parent_id, image_url |
| `products` | id, sku, barcode, name, description, price, quantity, category_id, images[], status, created_at |
| `product_variants` | id, product_id, name, price, quantity, sku |
| `reviews` | id, product_id, user_id, rating, comment, created_at |
| `carts` | id, user_id (nullable), created_at |
| `cart_items` | id, cart_id, product_id, quantity |
| `wishlists` | id, user_id, product_id |
| `orders` | id, customer_id, status, payment_method, payment_status, subtotal, shipping_cost, total, tracking_number, delivery_instructions, created_at |
| `order_items` | id, order_id, product_id, quantity, unit_price, subtotal |
| `payments` | id, order_id, method, status, reference, amount, verified_at, verified_by |
| `shipments` | id, order_id, courier, tracking_number, status, shipped_at, delivered_at |
| `coupons` | id, code, discount_type, discount_value, min_order, usage_limit, uses_count, expires_at |
| `refunds` | id, order_id, reason, status, amount, admin_note, created_at |
| `notifications` | id, user_id, type, title, message, read, created_at |
| `inventory_logs` | id, product_id, previous_qty, change_qty, new_qty, reason, admin_id, created_at |
| `activity_logs` | id, admin_id, action, entity_type, entity_id, description, created_at |
| `settings` | id, key, value, updated_at |

---

## Phases

### Phase 1 — Backend API + Database + Auth
- Initialize Node.js/Express + TypeScript project
- Set up Supabase project, define all database tables and RLS policies
- Implement Supabase Auth (register, login, logout, JWT refresh)
- Build role middleware (`customer`, `admin`, `super_admin`)
- Scaffold all route groups with placeholder handlers
- Set up environment config, error handling, and logging

### Phase 2 — Customer Website: Core Pages
- Initialize Next.js project (`web-customer`)
- Build Home, Shop, Categories, Product Detail pages
- Implement product search, filtering (category, price, brand, availability, ratings), and sorting
- Smart stock system: `Add to Cart` → `Pre-Order` when `quantity === 0`
- Product reviews and ratings display

### Phase 3 — Customer Website: Cart, Checkout & Payments
- Cart system (add, remove, update quantity, subtotal, delivery fee, total)
- 3-step checkout: Delivery Details → Shipping Method → Payment
- Payment options: Pay on Delivery, Card (Paystack + Flutterwave), Bank Transfer
- Bank Transfer flow: order created → customer transfers → admin verifies → order confirmed
- Order confirmation page

### Phase 4 — Customer Website: Account, Orders & Notifications
- Customer dashboard (profile, addresses, order history, wishlist, notifications)
- Order tracking page with real-time status via Supabase Realtime
- Order statuses: `Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered → Cancelled → Refunded`
- Email (Resend) + SMS (Termii) notification triggers on order events
- Contact / support form

### Phase 5 — Admin Dashboard: Products & Inventory
- Initialize Next.js project (`web-admin`) with role guards
- Product management: add, edit, delete, image upload, SKU, barcode assignment
- Inventory management: real-time stock tracking, low-stock alerts, stock history logs
- Barcode scanner via browser webcam (`zxing-js`) — scan to find/update product
- Automatic stock deduction on checkout via backend trigger

### Phase 6 — Admin Dashboard: Orders, Payments, Shipping, Refunds & Coupons
- Order management: view all orders, confirm, update status, cancel
- Payment monitoring: card payments, pay-on-delivery, bank transfers
- Manual bank transfer verification UI
- Shipping management: assign courier, add tracking number, update status
- Refund workflow: view request, approve/reject with admin notes
- Coupon management: create, edit, delete coupons with discount rules
- Customer management: view customers, purchase history, suspend accounts

### Phase 7 — Super Admin System
- Analytics dashboard: total users, orders, products, revenue, refunds (Recharts)
- Financial reports: daily / monthly / annual sales; revenue − refunds − expenses = profit
- Admin management: create, remove, assign roles, suspend admins
- Activity logs: all admin actions recorded and searchable
- Platform settings: payment gateways, shipping providers, tax, feature toggles
- All super admin pages role-locked — `admin` role gets 403 redirect

### Phase 8 — Mobile App: Customer Flows
- Initialize Expo project (`mobile`) — iOS + Android
- Onboarding, login, register screens
- Home, Shop, Categories, Product Detail, Cart, Wishlist
- 3-step checkout (Delivery → Shipping → Payment) with Paystack + Flutterwave SDK
- Order tracking with real-time Supabase Realtime updates
- Account dashboard: profile, addresses, orders, wishlist, notifications
- Push notifications via Expo Notifications + FCM

### Phase 9 — Mobile App: Admin Flows
- Role detection at login — show admin UI for `admin` role
- Admin dashboard screen: store performance summary
- Orders screen: view and update order status
- Barcode scanner screen: `expo-barcode-scanner` → product lookup
- Stock update screen: adjust quantity after barcode scan
- Real-time alerts: new orders and low-stock push notifications
- Super admin role: no admin mobile screens shown

### Phase 10 — QA, Optimization & Deployment
- Full E2E test suites for backend, web apps, and critical mobile flows
- Performance optimization (image optimization, lazy loading, API caching)
- Security review (RLS policies, input validation, rate limiting)
- Deploy: Vercel (web-customer + web-admin), Railway (backend)
- Configure custom domains: `elshalomstores.com.ng`, `admin.elshalomstores.com.ng`
- Expo EAS Build for iOS + Android app store submissions
- Write deployment documentation

---

## Verification Plan

### Automated Tests

**Backend**
```bash
cd backend && npm run test
```
Covers: auth flows, role enforcement, product CRUD, order lifecycle, Paystack/Flutterwave webhooks, inventory decrement, coupon validation.

**Customer Website**
```bash
cd web-customer && npm run test
```
Covers: checkout flow, pre-order trigger, bank transfer flow, order tracking, account dashboard.

**Admin Dashboard**
```bash
cd web-admin && npm run test
```
Covers: barcode scan, bank transfer verification, refund workflow, role guard (admin blocked from super admin routes).

### Manual Verification

1. **Card Payment** — Use Paystack test card `4084084084084081` (CVV: `408`); confirm webhook updates order to `confirmed`.
2. **Bank Transfer** — Place order with bank transfer; admin manually verifies; order transitions to `confirmed`.
3. **Real-Time Sync** — Update stock in admin; confirm customer website reflects new quantity instantly without refresh.
4. **Pre-Order** — Set product qty to `0`; confirm customer site shows `Pre-Order` instead of `Add to Cart`.
5. **Web Barcode** — Use admin dashboard barcode scanner (webcam); scan barcode; confirm correct product loads and stock updates.
6. **Mobile Barcode** — Scan physical barcode in mobile app; confirm stock reflected on admin web dashboard live.
7. **Super Admin Web-only** — Log in as `admin`; navigate to `/analytics`; confirm access denied. Confirm no super admin panel in mobile app.
8. **Push Notifications** — Place mobile order; confirm admin receives new-order notification; confirm customer receives order-confirmed notification.
