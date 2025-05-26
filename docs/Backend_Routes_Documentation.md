# Backend Routes Documentation for Smart Agro Connect

This document outlines all the backend routes required for the cart functionality and user management system.

## Cart Management Routes

### 1. Get User Cart

**Route:** `GET /carts/:email`
**Purpose:** Retrieve cart data for a specific user
**Authentication:** Required (withCredentials: true)
**Parameters:**

- `email` (URL parameter): User's email address

**Response Format:**

```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "_id": "product_id",
        "title": "Product Name",
        "price": 120,
        "unit": "kg",
        "minimumOrderQuantity": 10,
        "image": "image_url",
        "quantity": 15,
        "seller": {
          "sellerId": "seller_id",
          "name": "Seller Name"
        }
      }
    ],
    "totalItems": 15,
    "subtotal": 1800,
    "deliveryCharge": 300,
    "totalAmount": 2100
  }
}
```

### 2. Save/Update User Cart

**Route:** `POST /carts`
**Purpose:** Save or update entire cart for a user
**Authentication:** Required (withCredentials: true)
**Request Body:**

```json
{
  "email": "user@example.com",
  "items": [
    {
      "_id": "product_id",
      "title": "Product Name",
      "price": 120,
      "unit": "kg",
      "minimumOrderQuantity": 10,
      "image": "image_url",
      "quantity": 15,
      "seller": {
        "sellerId": "seller_id",
        "name": "Seller Name"
      }
    }
  ],
  "totalItems": 15,
  "subtotal": 1800,
  "deliveryCharge": 300,
  "totalAmount": 2100
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Cart saved successfully",
  "cart": {
    /* cart data */
  }
}
```

### 3. Update Cart Item Quantity

**Route:** `PUT /carts/:email/items/:itemId`
**Purpose:** Update quantity of a specific item in user's cart
**Authentication:** Required (withCredentials: true)
**Parameters:**

- `email` (URL parameter): User's email address
- `itemId` (URL parameter): Product ID

**Request Body:**

```json
{
  "quantity": 20
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "cart": {
    /* updated cart data */
  }
}
```

### 4. Remove Cart Item

**Route:** `DELETE /carts/:email/items/:itemId`
**Purpose:** Remove a specific item from user's cart
**Authentication:** Required (withCredentials: true)
**Parameters:**

- `email` (URL parameter): User's email address
- `itemId` (URL parameter): Product ID

**Response Format:**

```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": {
    /* updated cart data */
  }
}
```

### 5. Clear User Cart

**Route:** `DELETE /carts/:email`
**Purpose:** Clear all items from user's cart
**Authentication:** Required (withCredentials: true)
**Parameters:**

- `email` (URL parameter): User's email address

**Response Format:**

```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

## User Management Routes

### 6. Get User by Email

**Route:** `GET /users/:email`
**Purpose:** Get user details including role and profile information
**Authentication:** Required (withCredentials: true)
**Parameters:**

- `email` (URL parameter): User's email address

**Response Format:**

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "consumer",
    "phoneNumber": "+880123456789",
    "address": {
      "street": "123 Main St",
      "city": "Dhaka",
      "state": "Dhaka Division",
      "zip": "1000",
      "country": "Bangladesh"
    },
    "region": "Dhaka",
    "district": "Dhaka",
    "profilePicture": "image_url",
    "firebaseUID": "firebase_uid",
    "warehouseAddress": "warehouse_address" // for agents only
  }
}
```

### 7. Verify User Exists

**Route:** `GET /users/verifyUser?email=:email`
**Purpose:** Check if user exists in database
**Authentication:** Not required
**Query Parameters:**

- `email`: User's email address

**Response Format:**

```json
{
  "success": true,
  "exists": true,
  "user": {
    /* basic user info */
  }
}
```

### 8. Register User

**Route:** `POST /users/register`
**Purpose:** Create new user account
**Authentication:** Required (withCredentials: true)
**Request Body:**

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "hashed_password", // optional for social logins
  "provider": "email-pass", // "email-pass", "google", "facebook"
  "role": "consumer", // "consumer", "seller", "agent", "admin"
  "phoneNumber": "+880123456789",
  "address": {
    "street": "123 Main St",
    "city": "Dhaka",
    "state": "Dhaka Division",
    "zip": "1000",
    "country": "Bangladesh"
  },
  "firebaseUID": "firebase_uid",
  "profilePicture": "image_url"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    /* user data */
  }
}
```

### 9. Update User Profile

**Route:** `PATCH /users/:email`
**Purpose:** Update user profile information
**Authentication:** Required (withCredentials: true)
**Parameters:**

- `email` (URL parameter): User's email address

**Request Body:**

```json
{
  "name": "Updated Name",
  "phoneNumber": "+880987654321",
  "address": {
    "street": "456 New St",
    "city": "Chittagong",
    "state": "Chittagong Division",
    "zip": "4000",
    "country": "Bangladesh"
  },
  "region": "Chittagong",
  "district": "Chittagong",
  "warehouseAddress": "warehouse_address" // for agents only
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    /* updated user data */
  }
}
```

## Order Management Routes

### 10. Create Payment Intent

**Route:** `POST /create-payment-intent`
**Purpose:** Create Stripe payment intent for order
**Authentication:** Required
**Request Body:**

```json
{
  "amount": 2000, // amount in smallest currency unit (paisa)
  "userId": "firebase_uid",
  "items": [
    {
      "id": "product_id",
      "title": "Product Name",
      "quantity": 10,
      "price": 120
    }
  ],
  "deliveryDetails": {
    "region": "Dhaka",
    "district": "Dhaka",
    "address": "Full delivery address",
    "phone": "+880123456789",
    "orderNote": "Special instructions",
    "totalAmount": 2000
  }
}
```

**Response Format:**

```json
{
  "success": true,
  "clientSecret": "stripe_client_secret",
  "paymentIntentId": "pi_xxxxx"
}
```

### 11. Create Order

**Route:** `POST /orders`
**Purpose:** Create new order after successful payment
**Authentication:** Required
**Request Body:**

```json
{
  "userId": "firebase_uid",
  "items": [
    {
      "productId": "product_id",
      "title": "Product Name",
      "quantity": 10,
      "price": 120,
      "totalPrice": 1200,
      "sellerId": "seller_id"
    }
  ],
  "deliveryDetails": {
    "region": "Dhaka",
    "district": "Dhaka",
    "address": "Full delivery address",
    "phone": "+880123456789",
    "orderNote": "Special instructions",
    "totalAmount": 2000
  },
  "totalAmount": 2000,
  "advancePaymentAmount": 600,
  "paymentIntentId": "pi_xxxxx",
  "status": "pending"
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "order_id",
    "orderNumber": "ORD-2024-001"
    /* order details */
  }
}
```

## Regional Data Routes

### 12. Get Regions

**Route:** `GET /regions`
**Purpose:** Get list of all regions/divisions with districts
**Authentication:** Not required

**Response Format:**

```json
{
  "success": true,
  "regions": [
    {
      "name": "Dhaka",
      "districts": [
        { "name": "Dhaka" },
        { "name": "Gazipur" },
        { "name": "Narayanganj" },
        { "name": "Tangail" }
      ]
    },
    {
      "name": "Chittagong",
      "districts": [
        { "name": "Chittagong" },
        { "name": "Comilla" },
        { "name": "Cox's Bazar" },
        { "name": "Bandarban" }
      ]
    }
  ]
}
```

## Database Schema Recommendations

### Cart Collection

```javascript
{
  _id: ObjectId,
  email: String, // User identifier
  items: [
    {
      _id: String, // Product ID
      title: String,
      price: Number,
      unit: String,
      minimumOrderQuantity: Number,
      image: String,
      quantity: Number,
      seller: {
        sellerId: String,
        name: String
      }
    }
  ],
  totalItems: Number,
  subtotal: Number,
  deliveryCharge: Number,
  totalAmount: Number,
  updatedAt: Date,
  createdAt: Date
}
```

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String, // Unique index
  role: String, // "consumer", "seller", "agent", "admin"
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  region: String,
  district: String,
  profilePicture: String,
  firebaseUID: String, // Unique index
  warehouseAddress: String, // For agents only
  provider: String, // "email-pass", "google", "facebook"
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection

```javascript
{
  _id: ObjectId,
  orderNumber: String, // Unique order number
  userId: String, // Firebase UID
  items: [
    {
      productId: String,
      title: String,
      quantity: Number,
      price: Number,
      totalPrice: Number,
      sellerId: String
    }
  ],
  deliveryDetails: {
    region: String,
    district: String,
    address: String,
    phone: String,
    orderNote: String,
    totalAmount: Number
  },
  totalAmount: Number,
  advancePaymentAmount: Number,
  paymentIntentId: String,
  status: String, // "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All routes should return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information" // Optional, for development
}
```

## Authentication Middleware

All protected routes should verify:

1. Valid session/JWT token
2. User exists in database
3. User has appropriate permissions for the action

## CORS Configuration

Ensure CORS is configured to allow:

- Credentials: true
- Origin: Your frontend domain
- Methods: GET, POST, PUT, PATCH, DELETE
- Headers: Content-Type, Authorization

This documentation provides a complete overview of the backend API requirements for the Smart Agro Connect cart and user management system.
