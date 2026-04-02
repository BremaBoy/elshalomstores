# API Requirements for Elshalomstores Backend

To fully support the frontend implemented in Phase 2, the following API endpoints and data models are required. You can implement these using **Supabase** (Edge Functions/Database) or any other backend framework (Node/Express, Django, etc.).

## 🔐 Authentication Endpoints
- **[POST]** `/auth/register`: Create a new user account.
- **[POST]** `/auth/login`: Authenticate user and return a JWT token.
- **[GET]** `/auth/profile`: Get the currently logged-in user's details (requires Auth Header).

## 📦 Product & Category Endpoints
- **[GET]** `/products`: List all products (supporting filters for `category`, `search`, etc.).
- **[GET]** `/products/featured`: Get high-rated or highlighted products for the homepage.
- **[GET]** `/products/:id`: Get full details for a single product.
- **[GET]** `/categories`: List all available shopping categories.

## 🛒 Shopping & Orders
- **[POST]** `/cart/sync`: Save/update the user's cart in the database (for multi-device sync).
- **[POST]** `/orders`: Submit a new order with shipping details and items.
- **[GET]** `/orders`: Get order history for the logged-in user (displayed on the Profile page).

## 📊 Suggested Data Models

### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string"
}
```

### Product
```json
{
  "id": "uuid",
  "name": "string",
  "price": "number",
  "discountPrice": "number?",
  "image": "string (URL)",
  "category": "string",
  "rating": "number",
  "description": "text",
  "stock": "number",
  "isNew": "boolean",
  "isSale": "boolean"
}
```

### Order
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": "Array<CartItem>",
  "totalAmount": "number",
  "shippingDetails": {
    "firstName": "string",
    "lastName": "string",
    "address": "string",
    "city": "string",
    "state": "string"
  },
  "status": "pending | processing | shipped | delivered",
  "createdAt": "timestamp"
}
```
