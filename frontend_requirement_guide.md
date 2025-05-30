# Admin Implementation Guide - Backend API Routes

## Overview
This guide outlines the complete backend API routes required for the Smart Agro Market admin functionality. The frontend admin system is built around 6 main components that require specific API endpoints for full functionality.

## Admin Components & Required API Routes

### 1. Analytics Dashboard (`/dashboard/analytics`)

#### **Core Analytics Endpoint**
```
GET /admin/analytics?range={timeRange}
```
**Parameters:**
- `range`: `7d` | `30d` | `90d` | `6m` | `1y`

**Response Structure:**
```json
{
  "overview": {
    "totalRevenue": 2450000,
    "revenueChange": "+12.5%",
    "totalUsers": 12500,
    "usersChange": "+8.3%",
    "totalOrders": 8420,
    "ordersChange": "+15.2%",
    "totalProducts": 2840,
    "productsChange": "+22.1%"
  },
  "userGrowth": [
    {
      "month": "Jan",
      "users": 1200,
      "agents": 35,
      "sellers": 180,
      "consumers": 985
    }
  ],
  "revenueData": [
    {
      "month": "Jan",
      "revenue": 180000,
      "commission": 18000,
      "orders": 450
    }
  ],
  "categoryDistribution": [
    {
      "category": "Vegetables",
      "percentage": 35,
      "value": 980,
      "color": "#10b981"
    }
  ],
  "regionPerformance": [
    {
      "region": "Dhaka",
      "orders": 3200,
      "revenue": 980000,
      "growth": "+18%",
      "sellers": 120
    }
  ],
  "topSellers": [
    {
      "name": "Green Valley Farms",
      "revenue": 85000,
      "orders": 245,
      "rating": 4.8,
      "growth": "+25%"
    }
  ],
  "alerts": [
    {
      "type": "warning",
      "message": "Low stock alerts for 15 products",
      "count": 15
    }
  ]
}
```

### 2. User Management (`/dashboard/manage-users`)

#### **Get All Users**
```
GET /admin/users?page={page}&limit={limit}&role={role}&status={status}&search={search}
```
**Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: `admin` | `agent` | `seller` | `consumer` | `all`
- `status`: `active` | `inactive` | `suspended` | `pending` | `all`
- `search`: Search term for name, email, phone, or ID

**Response Structure:**
```json
{
  "users": [
    {
      "id": "USER-001",
      "name": "Ahmed Rahman",
      "email": "ahmed.rahman@example.com",
      "phone": "+8801712345678",
      "role": "seller",
      "status": "active",
      "joinDate": "2024-01-15",
      "lastLogin": "2024-01-22T10:30:00Z",
      "address": "Savar, Dhaka",
      "profilePicture": "https://example.com/avatar.jpg",
      "verified": true,
      "totalOrders": 45,
      "totalSpent": 125000,
      "managedSellers": 25,
      "suspensionReason": null
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "totalPages": 63
  },
  "statistics": {
    "total": 1250,
    "active": 1120,
    "suspended": 45,
    "agents": 52,
    "sellers": 380,
    "consumers": 818
  }
}
```

#### **User Actions**
```
PATCH /admin/users/{userId}/activate
PATCH /admin/users/{userId}/suspend
PATCH /admin/users/{userId}/delete
```
**Request Body:**
```json
{
  "reason": "Violation of platform policies",
  "adminId": "admin-user-id"
}
```

#### **Get User Details**
```
GET /admin/users/{userId}
```

#### **Update User**
```
PUT /admin/users/{userId}
```
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "phone": "+8801234567890",
  "role": "seller",
  "status": "active"
}
```

### 3. Product Management (`/dashboard/manage-products`)

#### **Get All Products**
```
GET /admin/products?page={page}&limit={limit}&category={category}&status={status}&search={search}
```
**Parameters:**
- `page`: Page number
- `limit`: Items per page
- `category`: Product category filter
- `status`: `approved` | `pending` | `rejected` | `suspended` | `outofstock`
- `search`: Search term

**Response Structure:**
```json
{
  "products": [
    {
      "id": "PROD-001",
      "name": "Premium Basmati Rice",
      "description": "High-quality aromatic basmati rice",
      "category": "Grains",
      "price": 850,
      "originalPrice": 900,
      "unit": "kg",
      "minimumOrder": 50,
      "stock": 500,
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:20:00Z",
      "seller": {
        "id": "SELLER-001",
        "name": "Ahmed Rahman",
        "email": "ahmed.rahman@example.com",
        "farmName": "Rahman Rice Farm"
      },
      "agent": {
        "id": "AGENT-001",
        "name": "Mohammad Ali",
        "region": "Dhaka Division"
      },
      "images": ["https://example.com/image.jpg"],
      "totalOrders": 45,
      "totalSold": 2250,
      "revenue": 1912500,
      "rejectionReason": null
    }
  ],
  "pagination": {
    "total": 2840,
    "page": 1,
    "limit": 20,
    "totalPages": 142
  }
}
```

#### **Product Actions**
```
PATCH /admin/products/{productId}/approve
PATCH /admin/products/{productId}/reject
PATCH /admin/products/{productId}/suspend
```
**Request Body:**
```json
{
  "reason": "Quality standards not met",
  "adminId": "admin-user-id"
}
```

#### **Bulk Product Actions**
```
PATCH /admin/products/bulk-action
```
**Request Body:**
```json
{
  "action": "approve" | "reject" | "suspend",
  "productIds": ["PROD-001", "PROD-002"],
  "reason": "Bulk approval",
  "adminId": "admin-user-id"
}
```

### 4. Order Management (`/dashboard/manage-orders`)

#### **Get All Orders**
```
GET /admin/orders?page={page}&limit={limit}&status={status}&search={search}&dateFrom={date}&dateTo={date}
```
**Parameters:**
- `status`: `pending` | `confirmed` | `processing` | `shipped` | `delivered` | `cancelled` | `refunded`
- `search`: Order number, customer name, seller name
- `dateFrom`: Start date filter
- `dateTo`: End date filter

**Response Structure:**
```json
{
  "orders": [
    {
      "id": "ORD-001",
      "orderNumber": "SAC-2024-001",
      "customer": {
        "id": "CUST-001",
        "name": "Rahman Chowdhury",
        "email": "rahman@example.com",
        "phone": "+8801712345678"
      },
      "seller": {
        "id": "SELLER-001",
        "name": "Ahmed Rahman",
        "farmName": "Rahman Rice Farm"
      },
      "agent": {
        "id": "AGENT-001",
        "name": "Mohammad Ali",
        "region": "Dhaka Division"
      },
      "products": [
        {
          "id": "PROD-001",
          "name": "Premium Basmati Rice",
          "quantity": 100,
          "unit": "kg",
          "price": 850,
          "total": 85000
        }
      ],
      "status": "confirmed",
      "paymentStatus": "paid",
      "totalAmount": 85000,
      "shippingCost": 500,
      "grandTotal": 85500,
      "orderDate": "2024-01-20T10:30:00Z",
      "deliveryDate": "2024-01-25T00:00:00Z",
      "shippingAddress": {
        "address": "House 123, Road 456",
        "city": "Dhaka",
        "district": "Dhaka",
        "postalCode": "1000"
      }
    }
  ],
  "pagination": {
    "total": 8420,
    "page": 1,
    "limit": 20,
    "totalPages": 421
  }
}
```

#### **Order Actions**
```
PATCH /admin/orders/{orderId}/status
```
**Request Body:**
```json
{
  "status": "confirmed" | "cancelled" | "refunded",
  "reason": "Customer request",
  "adminId": "admin-user-id"
}
```

#### **Get Order Details**
```
GET /admin/orders/{orderId}
```

### 5. Agent Management (`/dashboard/manage-agents`)

#### **Get Agent Applications**
```
GET /admin/agent-applications?page={page}&limit={limit}&status={status}&region={region}
```
**Parameters:**
- `status`: `pending` | `approved` | `rejected`
- `region`: Filter by region

**Response Structure:**
```json
{
  "applications": [
    {
      "id": "AGENT-APP-001",
      "applicationDate": "2024-01-20",
      "personalInfo": {
        "name": "Mohammad Hasan",
        "email": "hasan@example.com",
        "phone": "+8801712345678",
        "nid": "1234567890123",
        "address": "House 45, Road 12, Dhanmondi, Dhaka"
      },
      "businessInfo": {
        "companyName": "Dhaka Agricultural Hub",
        "businessType": "Agricultural Distribution",
        "experience": "5 years",
        "warehouseCapacity": "500 tons",
        "transportCapacity": "10 trucks",
        "coverage": "Dhaka Division"
      },
      "location": {
        "region": "Dhaka",
        "district": "Dhaka",
        "upazila": "Dhanmondi"
      },
      "documents": {
        "nidCopy": "https://example.com/nid.jpg",
        "businessLicense": "https://example.com/license.jpg",
        "warehousePhotos": ["https://example.com/warehouse1.jpg"],
        "bankStatement": "https://example.com/bank.pdf"
      },
      "status": "pending",
      "submittedAt": "2024-01-20T10:30:00Z"
    }
  ]
}
```

#### **Get Active Agents**
```
GET /admin/agents?page={page}&limit={limit}&region={region}&status={status}
```

#### **Agent Application Actions**
```
PATCH /admin/agent-applications/{applicationId}/approve
PATCH /admin/agent-applications/{applicationId}/reject
```
**Request Body:**
```json
{
  "reason": "All requirements met",
  "adminId": "admin-user-id"
}
```

#### **Agent Actions**
```
PATCH /admin/agents/{agentId}/suspend
PATCH /admin/agents/{agentId}/activate
```

### 6. System Settings (`/dashboard/system-settings`)

#### **Get Dashboard Stats**
```
GET /admin/dashboard-stats
```
**Response Structure:**
```json
{
  "totalUsers": 1250,
  "activeAgents": 45,
  "pendingAgentApplications": 12,
  "totalProducts": 2840,
  "pendingProducts": 156,
  "totalOrders": 8420,
  "activeOrders": 234,
  "platformRevenue": 245000,
  "monthlyGrowth": 8.2,
  "recentActivity": [
    {
      "type": "agent_application",
      "title": "New Agent Application",
      "description": "Rahman Trading Co. applied to become an agent",
      "time": "2 hours ago",
      "color": "blue"
    }
  ]
}
```

#### **System Configuration**
```
GET /admin/system/config
PUT /admin/system/config
```

#### **Platform Settings**
```
GET /admin/settings/categories
POST /admin/settings/categories
PUT /admin/settings/categories/{categoryId}
DELETE /admin/settings/categories/{categoryId}

GET /admin/settings/regions
POST /admin/settings/regions
PUT /admin/settings/regions/{regionId}
DELETE /admin/settings/regions/{regionId}

GET /admin/settings/payment-methods
POST /admin/settings/payment-methods
PUT /admin/settings/payment-methods/{methodId}
DELETE /admin/settings/payment-methods/{methodId}
```

## Authentication & Authorization

### **Admin Authentication**
All admin routes require JWT authentication with admin role verification.

**Headers Required:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### **Role-Based Access Control**
- All endpoints require `admin` role
- Some endpoints may require specific permissions within admin role
- Log all admin actions for audit trail

## Database Models Required

### **AdminAction Log**
```javascript
{
  id: String,
  adminId: String,
  action: String, // 'approve', 'reject', 'suspend', etc.
  targetType: String, // 'user', 'product', 'order', 'agent'
  targetId: String,
  reason: String,
  timestamp: Date,
  ipAddress: String
}
```

### **Analytics Cache**
```javascript
{
  timeRange: String,
  data: Object,
  lastUpdated: Date,
  expiresAt: Date
}
```

## Error Handling

All endpoints should return consistent error responses:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Detailed error message",
    "details": {}
  }
}
```

## Rate Limiting

Implement rate limiting for admin endpoints:
- Analytics: 100 requests per hour
- User Management: 1000 requests per hour
- Bulk Operations: 50 requests per hour

## Audit Trail

Log all admin actions with:
- Admin user ID
- Timestamp
- Action performed
- Target resource
- IP address
- Reason provided
- Previous and new values (for updates)

## Data Export

Support CSV/Excel export for:
- User lists
- Product lists
- Order reports
- Analytics data
- Agent applications

## Real-time Updates

Consider implementing WebSocket connections for:
- Live dashboard updates
- New application notifications
- System alerts
- Order status changes

## Implementation Priority

1. **Phase 1:** Core CRUD operations for users, products, orders
2. **Phase 2:** Analytics endpoints with caching
3. **Phase 3:** Agent management and applications
4. **Phase 4:** Advanced features (bulk operations, exports)
5. **Phase 5:** Real-time updates and notifications 