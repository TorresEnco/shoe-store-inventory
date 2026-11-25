# 📋 MASTER PROJECT PLAN: COMERCIAL TORRES

## 1. Business & Domain Overview
- **Store Name:** "Comercial Torres" (Peruvian retail shoe store).
- **Core Operations:**
  1. Fast Mobile Point-of-Sale (POS) with editable negotiated prices and cash/Yape payments.
  2. Inventory Restock & Manual Adjustment when physical shoe boxes arrive.
  3. Pareto (ABC) Inventory Rotation Analysis for the store owner.
  4. New Product & Size Run Catalog Registration.
- **Currency:** Peruvian Soles (`S/.`).
- **Language Policy:**
  - User Interface (labels, alerts, buttons): 100% Spanish.
  - Code (Java, TypeScript, DB columns, commits): 100% English.

---

## 2. Technical Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4.
  - Custom Palette:
    - Leather Brown: `#5C3D28` (`bg-leather`, `text-leather`)
    - Dark Leather: `#3E2718` (`bg-leather-dark`)
    - Warm Cream Background: `#FAF8F5` (`bg-cream`)
    - Amber Accent: `#D97706` (`text-amber-accent`)
- **Backend:** Java 25, Spring Boot 4.1.1, Maven, PostgreSQL.
  - Pattern: Hexagonal Architecture (Modular Monolith: `product`, `sale`, `analytics`, `user`).

---

## 3. Database Schema Contract (PostgreSQL)

### Catalogs & Inventory
- `Category` (id, description)
- `Brand` (id, name)
- `Color` (id, name)
- `Product` (id, category_id, brand_id, name, description, status, created_at)
  - *Note:* `created_at` (TIMESTAMP DEFAULT NOW()) is MANDATORY to differentiate brand-new arrivals from real dead stock.
- `ProductVariant` (id, product_id, color_id, size, catalog_price, stock, created_at)

### Customers & Authentication
- `Customer` (id, name, phone)
  - *Note:* Optional in sales. If blank, defaults to "Público General".
- `User` (id, full_name, username, password_hash, role)
  - `role`: 'ADMIN' | 'CASHIER'
  - `full_name`: Display name on POS and tickets.

### Sales & Details
- `Sale` (id, user_id, customer_id [nullable], date, total, payment_type)
  - `payment_type`: 'CASH' | 'YAPE_PLIN' (Card payments removed per owner request).
- `SaleItem` (id, sale_id, variant_id, unit_price, quantity, subtotal)
  - *Note:* `unit_price` is the actual sold price (allows negotiated retail discounts).

---

## 4. Development Checklist

### Phase 1: Frontend UI Prototype (React + Vite)
- [x] Step 1: Layout Shell & Navigation (`BottomNavBar.tsx`, `Header.tsx`)
- [x] Step 2: POS Shoe Catalog & Category Filtering (`ShoeCard.tsx`, `PosView.tsx`)
- [x] Step 3: Quantity Drawer with Editable Negotiated Price (`QuantityDrawer.tsx`)
- [x] Step 4: Floating Cart Bar & Checkout Modal with Yape/Plin QR (`CheckoutModal.tsx`)
- [x] Step 5: Ajuste de Existencias View (`InventoryView.tsx`)
  - Model & Color selector.
  - Delta indicators (`+2 nuevos pares`, `vuelve a stock`, `sin variación`).
  - Reception summary sanity check before saving.
- [ ] Step 6: Rotación y Análisis ABC Pareto View (`MetricsView.tsx`)
  - Class A (80% revenue), Class B (15%), Class C (5% dead stock).
  - Velocity run rate (`pares/día`).
  - Liquidation opportunities (evaluating items > 45 days old using `created_at`).
- [ ] Step 7: Alta y Edición de Calzado (`ProductFormModal.tsx`)
  - Reusable modal for creating new shoes AND editing prices, names, and colors.
- [ ] Step 8: Minimalist Login View (`LoginView.tsx`)
  - 2 inputs: Usuario and Contraseña.

### Phase 2: Backend Core (Spring Boot + Hexagonal)
- [ ] Step 9: PostgreSQL setup & `application.properties` connection.
- [ ] Step 10: `product` Hexagonal Module (Domain Models, Ports, JPA Entities, Mappers).
- [ ] Step 11: `sale` Hexagonal Module (Atomic sale transaction & stock decrement).
- [ ] Step 12: `analytics` Hexagonal Module (Pareto ABC SQL queries & rotation metrics).
- [ ] Step 13: `user` Hexagonal Module (Authentication & JWT).

### Phase 3: Integration
- [ ] Step 14: Connect React frontend fetch services to Spring Boot REST endpoints.
- [ ] Step 15: End-to-end testing of real sale flow and stock updates.
