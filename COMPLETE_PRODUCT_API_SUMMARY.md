# 🔗 Complete Product API Endpoints Summary

## 📍 **Public Routes**

### **GET `/products`**
**Get all approved products**
- **Query**: `cropType`, `region`, `district`, `minPrice`, `maxPrice`, `page=1`, `limit=10`
- **Response**: `{ success, products[], totalPages, currentPage, totalProducts, maxPrice }`

### **GET `/products/search`**
**Filtered product search**
- **Query**: `cropType`, `region`, `minPrice`, `maxPrice`, `page=1`, `limit=10`
- **Response**: `{ success, products[], totalPages, currentPage, totalProducts }`

### **GET `/products/crop-types`**
**Get available crop types**
- **Query**: None
- **Response**: `{ success, data: [cropTypes] }`

---

## 🔗 **Agent Product API Endpoints (NEW FORMAT)**

### **1. Get Regional Products**
```http
GET /products/agent/regional
```
**Query Parameters:**
- `page`: "1" (Page number)
- `limit`: "10" (Items per page)
- `region`: "Dhaka" (Agent's operational region)
- `district`: "Dhaka" (Agent's operational district)
- `status`: "pending" (Optional: "pending", "approved", "rejected", "live", "suspended")
- `cropType`: "Vegetables" (Optional: Product category filter)
- `search`: "rice" (Optional: Search term)

**Response Format:**
```json
{
  "success": true,
  "message": "Regional products retrieved successfully",
  "products": [
    {
      "id": "prod_123",
      "title": "Premium Basmati Rice",
      "description": "High quality basmati rice from local farm",
      "category": "Grains",
      "price": 80,
      "unit": "kg",
      "stock": 500,
      "minimumOrderQuantity": 10,
      "qualityScore": 95,
      "image": "https://example.com/image.jpg",
      "status": "pending",
      "seller": {
        "id": "seller_456",
        "name": "John Farmer",
        "farmName": "Green Valley Farm",
        "email": "john@example.com",
        "phone": "+8801234567890"
      },
      "location": {
        "region": "Dhaka",
        "district": "Dhaka",
        "upazila": "Dhanmondi",
        "address": "123 Farm Road"
      },
      "submittedAt": "2024-01-15T10:30:00Z",
      "approvedAt": null,
      "approvedBy": null,
      "rejectedAt": null,
      "rejectionReason": null,
      "suspendedAt": null,
      "suspensionReason": null
    }
  ],
  "totalProducts": 25,
  "totalPages": 3,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

### **2. Get Agent Statistics**
```http
GET /products/agent/statistics
```
**Query Parameters:** None (uses agent's operational area from authentication)

**Response Format:**
```json
{
  "success": true,
  "message": "Agent statistics retrieved successfully",
  "statistics": {
    "total": 150,
    "pending": 25,
    "approved": 80,
    "rejected": 20,
    "live": 75,
    "suspended": 5,
    "avgQualityScore": 87.5,
    "thisMonth": {
      "reviewed": 35,
      "approved": 28,
      "rejected": 7
    },
    "topCategories": [
      { "category": "Vegetables", "count": 45 },
      { "category": "Grains", "count": 30 }
    ]
  }
}
```

---

### **3. Get Operational Area Info**
```http
GET /products/agent/operational-area
```
**Query Parameters:** None

**Response Format:**
```json
{
  "success": true,
  "message": "Operational area information retrieved",
  "operationalArea": {
    "region": "Dhaka",
    "district": "Dhaka",
    "assignedAt": "2024-01-01T00:00:00Z",
    "totalSellers": 120,
    "activeSellers": 95,
    "totalProducts": 350,
    "coverage": {
      "upazilas": ["Dhanmondi", "Gulshan", "Banani", "Uttara"],
      "totalArea": "1500 sq km"
    }
  }
}
```

---

### **4. Approve Product**
```http
PATCH /products/{productId}/approve
```
**URL Parameters:**
- `productId`: "prod_123" (Product ID)

**Request Body:**
```json
{
  "reviewedBy": "agent_789",
  "agentOperationalArea": {
    "region": "Dhaka",
    "district": "Dhaka"
  },
  "reason": "Product meets quality standards"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Product approved successfully",
  "product": {
    "id": "prod_123",
    "status": "approved",
    "approvedAt": "2024-01-15T14:30:00Z",
    "approvedBy": "agent_789",
    "approvalReason": "Product meets quality standards"
  }
}
```

---

### **5. Reject Product**
```http
PATCH /products/{productId}/reject
```
**URL Parameters:**
- `productId`: "prod_123" (Product ID)

**Request Body:**
```json
{
  "reviewedBy": "agent_789",
  "agentOperationalArea": {
    "region": "Dhaka",
    "district": "Dhaka"
  },
  "reason": "Poor quality images, incomplete description"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Product rejected successfully",
  "product": {
    "id": "prod_123",
    "status": "rejected",
    "rejectedAt": "2024-01-15T14:30:00Z",
    "rejectedBy": "agent_789",
    "rejectionReason": "Poor quality images, incomplete description"
  }
}
```

---

### **6. Suspend Product**
```http
PATCH /products/{productId}/suspend
```
**URL Parameters:**
- `productId`: "prod_123" (Product ID)

**Request Body:**
```json
{
  "reviewedBy": "agent_789",
  "agentOperationalArea": {
    "region": "Dhaka",
    "district": "Dhaka"
  },
  "reason": "Policy violation detected"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Product suspended successfully",
  "product": {
    "id": "prod_123",
    "status": "suspended",
    "suspendedAt": "2024-01-15T14:30:00Z",
    "suspendedBy": "agent_789",
    "suspensionReason": "Policy violation detected"
  }
}
```

---

### **7. Get Product Details**
```http
GET /products/{productId}
```
**URL Parameters:**
- `productId`: "prod_123" (Product ID)

**Query Parameters:**
- `includeSellerDetails`: "true" (Optional: Include detailed seller info)

**Response Format:**
```json
{
  "success": true,
  "message": "Product details retrieved successfully",
  "product": {
    "id": "prod_123",
    "title": "Premium Basmati Rice",
    "description": "High quality basmati rice from local farm",
    "category": "Grains",
    "price": 80,
    "unit": "kg",
    "stock": 500,
    "minimumOrderQuantity": 10,
    "qualityScore": 95,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "specifications": {
      "variety": "Basmati",
      "grade": "A+",
      "harvestDate": "2024-01-10",
      "processingMethod": "Sun-dried"
    },
    "status": "pending",
    "seller": {
      "id": "seller_456",
      "name": "John Farmer",
      "farmName": "Green Valley Farm",
      "email": "john@example.com",
      "phone": "+8801234567890",
      "verificationStatus": "verified",
      "rating": 4.8,
      "totalProducts": 25
    },
    "location": {
      "region": "Dhaka",
      "district": "Dhaka",
      "upazila": "Dhanmondi",
      "address": "123 Farm Road",
      "coordinates": {
        "lat": 23.7465,
        "lng": 90.3772
      }
    },
    "timeline": {
      "submittedAt": "2024-01-15T10:30:00Z",
      "lastUpdated": "2024-01-15T12:00:00Z",
      "reviewDeadline": "2024-01-18T10:30:00Z"
    }
  }
}
```

---

### **8. Get Agent Review History**
```http
GET /products/agent/review-history
```
**Query Parameters:**
- `page`: "1"
- `limit`: "20"
- `startDate`: "2024-01-01" (Optional: Filter by date range)
- `endDate`: "2024-01-31" (Optional: Filter by date range)
- `action`: "approved" (Optional: "approved", "rejected", "suspended")
- `productId`: "prod_123" (Optional: Specific product)

**Response Format:**
```json
{
  "success": true,
  "message": "Review history retrieved successfully",
  "reviews": [
    {
      "id": "review_123",
      "productId": "prod_456",
      "productTitle": "Fresh Tomatoes",
      "action": "approved",
      "reason": "Product meets quality standards",
      "reviewedAt": "2024-01-15T14:30:00Z",
      "seller": {
        "name": "Jane Farmer",
        "farmName": "Sunny Acres"
      }
    }
  ],
  "totalReviews": 45,
  "totalPages": 3,
  "currentPage": 1,
  "summary": {
    "totalApproved": 35,
    "totalRejected": 8,
    "totalSuspended": 2
  }
}
```

---

## 📍 **Admin Routes (Existing)**

### **GET `/products/admin/all`**
**Get all products (any status) for admin**
- **Query**: `page=1`, `limit=10`, `status?`, `cropType?`, `region?`, `search?`
- **Response**: `{ success, products[], totalPages, currentPage, totalProducts }`

### **GET `/products/admin/statistics`**
**Get comprehensive product statistics**
- **Query**: None
- **Response**: `{ success, statistics: { total, pending, approved, rejected, byRegion: {}, byCropType: {}, byStatus: {} } }`

### **PATCH `/products/admin/approve/:id`**
**Admin approve product**
- **Params**: `id` (product ID)
- **Body**: `{ reviewedBy: "optional" }`
- **Response**: `{ success, message, product }`

### **PATCH `/products/admin/reject/:id`**
**Admin reject product**
- **Params**: `id` (product ID)
- **Body**: `{ reason: "required", reviewedBy: "optional" }`
- **Response**: `{ success, message, product }`

### **PATCH `/products/bulk-action`**
**Bulk approve/reject products**
- **Body**: `{ productIds: [], action: "approve|reject", reason?: "string", reviewedBy?: "string" }`
- **Response**: `{ success, message, results: { successful: [], failed: [] } }`

### **GET `/products/admin/analytics`**
**Product analytics for dashboard**
- **Query**: `timeRange?` (7d, 30d, 90d, 1y)
- **Response**: `{ success, analytics: { overview: {}, trends: [], regionPerformance: [] } }`

---

## 📍 **Protected Routes (Existing)**

### **GET `/products/seller/:email`**
**Get seller's products (JWT + email verification)**
- **Params**: `email` (seller email)
- **Response**: `{ success, products[] }`

### **POST `/products/add-product`**
**Add new product (Seller only)**
- **Body**: Product data + `sellerInfo`
- **Response**: `{ success, product }`

### **DELETE `/products/:id`**
**Delete product (Seller/Admin only)**
- **Params**: `id` (product ID)
- **Response**: `{ success, message }`

---

## 🔒 **Authentication & Authorization**

**Headers Required:**
```javascript
{
  "Authorization": "Bearer {jwt_token}",
  "Content-Type": "application/json"
}
```

**Role-Based Access:**
- **Public**: No authentication required
- **Agent**: JWT + Agent role verification + Regional access control
- **Admin**: JWT + Admin role verification + Full access
- **Seller**: JWT + Seller role verification + Own products only

---

## ❌ **Error Response Format**

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "Specific validation issues",
    "field": "fieldName"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Agent not authorized for this region
- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Product not found
- `ALREADY_PROCESSED` - Product already approved/rejected
- `OPERATIONAL_AREA_NOT_ASSIGNED` - Agent has no operational area

---

## 🔄 **Model Updates Applied**

### **Product Model Enhancements:**
- Added `farmName`, `verificationStatus`, `rating`, `totalProducts` to sellerInfo
- Added `upazila`, `address`, `coordinates` to location
- Added `live` status, `approvalReason`, rejection/suspension tracking
- Added `qualityScore`, `specifications`, `timeline` fields
- Updated indexes for efficient regional queries

### **New AgentReviewHistory Model:**
- Tracks all agent review actions
- Includes product, seller, and operational area details
- Supports comprehensive reporting and history

---

## ✅ **Status: COMPLETE**

All 8 agent product API endpoints have been implemented following the exact format specifications:
1. ✅ Regional Products Retrieval
2. ✅ Agent Statistics
3. ✅ Operational Area Information
4. ✅ Enhanced Product Approval
5. ✅ Enhanced Product Rejection
6. ✅ Product Suspension
7. ✅ Enhanced Product Details
8. ✅ Agent Review History

**Key Features:**
- **Regional Access Control**: Enforced at backend level
- **Enhanced Response Formats**: Matching exact specifications
- **Comprehensive Error Handling**: Proper error codes and messages
- **Audit Trail**: Complete action history tracking
- **Performance Optimized**: Efficient database queries and indexes
- **Backward Compatibility**: Legacy routes preserved 