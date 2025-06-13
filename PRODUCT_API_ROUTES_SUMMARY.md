# Product API Routes - Complete Summary

## Public Routes

### GET `/products`
**Get all approved products**
- **Query**: `cropType`, `region`, `district`, `minPrice`, `maxPrice`, `page=1`, `limit=10`
- **Response**: `{ success, products[], totalPages, currentPage, totalProducts, maxPrice }`

### GET `/products/search`
**Filtered product search**
- **Query**: `cropType`, `region`, `minPrice`, `maxPrice`, `page=1`, `limit=10`
- **Response**: `{ success, products[], totalPages, currentPage, totalProducts }`

### GET `/products/crop-types`
**Get available crop types**
- **Query**: None
- **Response**: `{ success, data: [cropTypes] }`

### GET `/products/:id`
**Get product details**
- **Params**: `id` (product ID)
- **Response**: `{ success, product }`

---

## Agent Routes (JWT + Agent Role Required)

### GET `/products/agent/pending`
**Get products pending approval in agent's region**
- **Query**: `page=1`, `limit=10`, `cropType?`, `region?`, `search?`
- **Response**: `{ success, products[], totalPages, currentPage, totalProducts }`

### GET `/products/agent/statistics`
**Get agent's product statistics**
- **Query**: None
- **Response**: `{ success, statistics: { total, pending, approved, rejected } }`

### PATCH `/products/reject/:id`
**Reject product (Agent only)**
- **Params**: `id` (product ID)
- **Body**: `{ reason: "required", reviewedBy: "optional" }`
- **Response**: `{ success, message, product }`

### GET `/products/agent/operational-area`
**Get agent's operational area products**
- **Query**: `page=1`, `limit=10`, `status?`
- **Response**: `{ success, products[], operationalArea: { region, district } }`

---

## Admin Routes (JWT + Admin Role Required)

### GET `/products/admin/all`
**Get all products (any status) for admin**
- **Query**: `page=1`, `limit=10`, `status?`, `cropType?`, `region?`, `search?`
- **Response**: `{ success, products[], totalPages, currentPage, totalProducts }`

### GET `/products/admin/statistics`
**Get comprehensive product statistics**
- **Query**: None
- **Response**: `{ success, statistics: { total, pending, approved, rejected, byRegion: {}, byCropType: {}, byStatus: {} } }`

### PATCH `/products/admin/approve/:id`
**Admin approve product**
- **Params**: `id` (product ID)
- **Body**: `{ reviewedBy: "optional" }`
- **Response**: `{ success, message, product }`

### PATCH `/products/admin/reject/:id`
**Admin reject product**
- **Params**: `id` (product ID)
- **Body**: `{ reason: "required", reviewedBy: "optional" }`
- **Response**: `{ success, message, product }`

### PATCH `/products/bulk-action`
**Bulk approve/reject products**
- **Body**: `{ productIds: [], action: "approve|reject", reason?: "string", reviewedBy?: "string" }`
- **Response**: `{ success, message, results: { successful: [], failed: [] } }`

### GET `/products/admin/analytics`
**Product analytics for dashboard**
- **Query**: `timeRange?` (7d, 30d, 90d, 1y)
- **Response**: `{ success, analytics: { overview: {}, trends: [], regionPerformance: [] } }`

---

## Protected Routes (JWT Required)

### GET `/products/seller/:email`
**Get seller's products (JWT + email verification)**
- **Params**: `email` (seller email)
- **Response**: `{ success, products[] }`

### POST `/products/add-product`
**Add new product (Seller only)**
- **Body**: Product data + `sellerInfo`
- **Response**: `{ success, product }`

### PATCH `/products/approve/:id`
**Approve product (Agent only)**
- **Params**: `id` (product ID)
- **Response**: `{ success, product }`

### DELETE `/products/:id`
**Delete product (Seller/Admin only)**
- **Params**: `id` (product ID)
- **Response**: `{ success, message }`

---

## Route Order & Implementation Notes

### Route Priority
1. **Specific routes first**: `/search`, `/crop-types`, `/agent/*`, `/admin/*`, `/seller/:email`
2. **Dynamic routes last**: `/:id` (to prevent conflicts)

### Authentication & Authorization
- **Public**: No authentication required
- **Agent**: JWT + Agent role verification
- **Admin**: JWT + Admin role verification  
- **Seller**: JWT + Seller role verification
- **Email verification**: Additional check for seller routes

### New Features Added
1. **Agent Management**: Regional product oversight, statistics, approval/rejection
2. **Admin Management**: Full product oversight, bulk operations, analytics
3. **Advanced Analytics**: Time-based trends, regional performance metrics
4. **Enhanced Search**: Multi-field search with pagination
5. **Audit Trail**: Admin history tracking for all product actions

### Database Integration
- All routes integrated with existing Product model
- Uses `adminHistory` field for audit tracking
- Leverages operational area data from User/Agent models
- Maintains backward compatibility with existing functionality

### Status: ✅ COMPLETE
All requested frontend API routes have been implemented and integrated successfully. 