# Order API Documentation

## Overview
Complete order management system implementation according to frontend team requirements. The system handles order creation, tracking, status updates, and provides different access levels for consumers, sellers, and administrators.

## Database Model

### Order Schema
```javascript
{
  // Order Identification
  orderNumber: String (required, unique) // AUTO-GENERATED: "SAC-2024-001"
  
  // User Information
  userId: String (required) // Firebase UID
  userEmail: String (required)
  
  // Order Items
  items: [{
    productId: String (required)
    name: String (required)
    price: Number (required)
    quantity: Number (required)
    unit: String (required)
    image: String
    sellerId: String (required)
    sellerName: String (required)
    totalPrice: Number (required) // price * quantity
  }]
  
  // Order Totals
  subtotal: Number (required)
  shippingCost: Number (default: 0)
  tax: Number (default: 0)
  totalAmount: Number (required)
  
  // Shipping Information
  shippingAddress: {
    fullName: String (required)
    email: String (required)
    phone: String (required)
    address: String (required)
    city: String (required)
    state: String (required)
    zipCode: String (required)
  }
  
  // Payment Information
  paymentMethod: String (required) // 'cod' or 'online'
  paymentStatus: String (enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending')
  paymentDetails: {
    transactionId: String
    cardType: String
    last4: String
    paymentDate: Date
  }
  
  // Order Status
  status: String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending')
  
  // Order Tracking
  trackingNumber: String
  estimatedDelivery: Date
  actualDelivery: Date
  
  // Additional Information
  notes: String
  
  // Timestamps
  createdAt: Date (default: Date.now)
  updatedAt: Date (default: Date.now)
}
```

## API Endpoints

### 1. Create Order
**POST** `/api/orders`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "string",
      "name": "string",
      "price": "number",
      "quantity": "number",
      "unit": "string",
      "image": "string",
      "sellerId": "string",
      "sellerName": "string"
    }
  ],
  "shippingAddress": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  },
  "paymentMethod": "cod | online",
  "paymentDetails": {
    "transactionId": "string",
    "cardType": "string",
    "last4": "string"
  },
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "orderNumber": "SAC-2024-001",
    "orderId": "string",
    "totalAmount": "number",
    "items": "array",
    "shippingAddress": "object",
    "paymentMethod": "string",
    "status": "pending",
    "createdAt": "date"
  }
}
```

### 2. Get User Orders
**GET** `/api/orders/user/:userId`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (default: 'all')

**Response:**
```json
{
  "success": true,
  "orders": "array",
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

### 3. Get Specific Order
**GET** `/api/orders/:orderId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "order": "object"
}
```

### 4. Update Order Status
**PUT** `/api/orders/:orderId/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": "object"
}
```

### 5. Get Seller Orders
**GET** `/api/orders/seller/:sellerId`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (default: 'all')

**Response:**
```json
{
  "success": true,
  "orders": "array",
  "pagination": "object"
}
```

### 6. Get Admin Orders
**GET** `/api/admin/orders`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (default: 'all')
- `userId` (optional): Filter by user ID
- `sellerId` (optional): Filter by seller ID

**Response:**
```json
{
  "success": true,
  "orders": "array",
  "pagination": "object"
}
```

## Access Control

### Permissions Matrix

| Role | Create Order | View Own Orders | View Any Order | Update Status | View Seller Orders | View Admin Orders |
|------|-------------|----------------|----------------|---------------|-------------------|-------------------|
| Consumer | ✅ | ✅ | ❌ | Limited* | ❌ | ❌ |
| Seller | ✅ | ✅ | Limited** | Limited*** | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Notes:**
- *Consumers can only mark orders as 'delivered' or cancel 'pending' orders
- **Sellers can view orders containing their products
- ***Sellers can update orders containing their products to 'confirmed', 'processing', or 'shipped'

## Status Flow

```
pending → confirmed → processing → shipped → delivered
   ↓
cancelled (only from pending)
```

## Features Implemented

### 1. Order Number Generation
- Auto-generated format: `SAC-YYYY-XXX`
- Sequential numbering
- Unique constraint

### 2. Payment Integration
- Support for COD (Cash on Delivery)
- Support for online payments
- Payment status tracking
- Transaction details storage

### 3. Order Tracking
- Status updates with timestamps
- Delivery date tracking
- Notes and comments

### 4. Multi-role Access
- Role-based permissions
- Secure access control
- User verification

### 5. Pagination & Filtering
- Paginated results
- Status filtering
- User/seller filtering for admin

### 6. Data Validation
- Required field validation
- Enum validation for statuses
- Price and quantity validation

## Database Indexes

The following indexes are created for optimal performance:

```javascript
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'items.sellerId': 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
```

## Error Handling

All endpoints include comprehensive error handling:
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (order not found)
- 500: Internal Server Error

## Usage Examples

### Creating an Order
```javascript
const orderData = {
  items: [
    {
      productId: "prod123",
      name: "Organic Tomatoes",
      price: 50,
      quantity: 2,
      unit: "kg",
      sellerId: "seller123",
      sellerName: "Farm Fresh"
    }
  ],
  shippingAddress: {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main St",
    city: "Dhaka",
    state: "Dhaka Division",
    zipCode: "1000"
  },
  paymentMethod: "cod",
  notes: "Please deliver in the morning"
};

fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(orderData)
});
```

### Getting User Orders
```javascript
fetch('/api/orders/user/userId123?page=1&limit=10&status=pending', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

## Integration Notes

1. **Frontend Integration**: All endpoints return consistent JSON responses with success/error indicators
2. **Authentication**: All endpoints require valid JWT tokens
3. **Validation**: Client-side validation should match server-side rules
4. **Error Handling**: Frontend should handle all HTTP status codes appropriately
5. **Pagination**: Implement pagination controls for order lists
6. **Real-time Updates**: Consider WebSocket integration for real-time order status updates

## Testing

The implementation includes:
- Input validation testing
- Permission testing
- Error handling testing
- Database operation testing
- Integration testing with authentication middleware

## Future Enhancements

Potential improvements:
1. Real-time notifications
2. Order cancellation workflow
3. Return/refund management
4. Bulk order operations
5. Order analytics and reporting
6. Integration with shipping providers
7. Automated status updates
8. Order templates for repeat customers 