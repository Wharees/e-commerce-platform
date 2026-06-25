# API Documentation - Digital LASU E-Commerce System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "lasuEmail": "john@lasu.edu.ng",
  "password": "password123",
  "phone": "+2349012345678",
  "role": "customer"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "accessToken": "token",
  "refreshToken": "token"
}
```

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "token",
  "refreshToken": "token"
}
```

### 3. Get Current User
**GET** `/auth/me` (Protected)

**Response:** `200 OK`
```json
{
  "user": { ... }
}
```

### 4. Refresh Token
**POST** `/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "token"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "token"
}
```

### 5. Logout
**POST** `/auth/logout` (Protected)

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Product Endpoints

### 1. Get All Products
**GET** `/products?page=1&limit=20&category=id&search=query&sort=newest&minPrice=0&maxPrice=1000`

**Response:** `200 OK`
```json
{
  "products": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### 2. Get Product by ID
**GET** `/products/:id`

**Response:** `200 OK`
```json
{
  "product": { ... }
}
```

### 3. Create Product (Vendor)
**POST** `/products` (Protected, Vendor only)

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 5000,
  "quantity": 10,
  "category": "categoryId",
  "tags": ["tag1", "tag2"],
  "sku": "SKU-123"
}
```

**Response:** `201 Created`
```json
{
  "message": "Product created successfully",
  "product": { ... }
}
```

### 4. Update Product (Vendor)
**PUT** `/products/:id` (Protected, Vendor only)

**Request Body:** (Same as create)

**Response:** `200 OK`

### 5. Delete Product (Vendor)
**DELETE** `/products/:id` (Protected, Vendor only)

**Response:** `200 OK`

### 6. Get Trending Products
**GET** `/products/trending?limit=10`

**Response:** `200 OK`

### 7. Search Products
**GET** `/products/search?query=search&page=1&limit=20`

**Response:** `200 OK`

---

## Cart Endpoints

### 1. Get Cart
**GET** `/cart` (Protected)

**Response:** `200 OK`
```json
{
  "cart": { ... }
}
```

### 2. Add to Cart
**POST** `/cart/add` (Protected)

**Request Body:**
```json
{
  "productId": "productId",
  "quantity": 2
}
```

**Response:** `200 OK`

### 3. Update Cart Item
**PUT** `/cart/update` (Protected)

**Request Body:**
```json
{
  "productId": "productId",
  "quantity": 3
}
```

**Response:** `200 OK`

### 4. Remove from Cart
**DELETE** `/cart/remove/:productId` (Protected)

**Response:** `200 OK`

### 5. Clear Cart
**POST** `/cart/clear` (Protected)

**Response:** `200 OK`

---

## Order Endpoints

### 1. Create Order
**POST** `/orders` (Protected)

**Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+2349012345678",
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "postalCode": "10001",
    "country": "Nigeria"
  },
  "paymentMethod": "paystack"
}
```

**Response:** `201 Created`

### 2. Get Customer Orders
**GET** `/orders?page=1&limit=20&status=pending` (Protected)

**Response:** `200 OK`

### 3. Get Order by ID
**GET** `/orders/:id` (Protected)

**Response:** `200 OK`

### 4. Update Order Status (Vendor)
**PUT** `/orders/:id/status` (Protected, Vendor)

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Response:** `200 OK`

### 5. Cancel Order
**POST** `/orders/:id/cancel` (Protected, Customer)

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:** `200 OK`

---

## Payment Endpoints

### 1. Initialize Payment
**POST** `/payments/initialize` (Protected)

**Request Body:**
```json
{
  "orderId": "orderId"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "access_code",
    "reference": "reference"
  }
}
```

### 2. Verify Payment
**POST** `/payments/verify` (Protected)

**Request Body:**
```json
{
  "reference": "paystack_reference"
}
```

**Response:** `200 OK`

### 3. Get Payment by Reference
**GET** `/payments/reference/:reference` (Protected)

**Response:** `200 OK`

### 4. Get Customer Payments
**GET** `/payments?page=1&limit=20` (Protected)

**Response:** `200 OK`

---

## Review Endpoints

### 1. Create Review
**POST** `/reviews` (Protected)

**Request Body:**
```json
{
  "productId": "productId",
  "orderId": "orderId",
  "rating": 5,
  "title": "Great product!",
  "comment": "This product is excellent and worth every penny."
}
```

**Response:** `201 Created`

### 2. Get Product Reviews
**GET** `/reviews/product/:id?page=1&limit=10&sort=recent`

**Response:** `200 OK`

### 3. Update Review
**PUT** `/reviews/:id` (Protected)

**Response:** `200 OK`

### 4. Delete Review
**DELETE** `/reviews/:id` (Protected)

**Response:** `200 OK`

### 5. Mark Review as Helpful
**POST** `/reviews/:id/helpful` (Protected)

**Request Body:**
```json
{
  "helpful": true
}
```

**Response:** `200 OK`

---

## Message Endpoints

### 1. Send Message
**POST** `/messages/send` (Protected)

**Request Body:**
```json
{
  "receiverId": "userId",
  "content": "Hello, how are you?",
  "productId": "optional",
  "orderId": "optional"
}
```

**Response:** `201 Created`

### 2. Get Conversations
**GET** `/messages/conversations?page=1&limit=20` (Protected)

**Response:** `200 OK`

### 3. Get Conversation with User
**GET** `/messages/conversation/:otherUserId?page=1&limit=50` (Protected)

**Response:** `200 OK`

### 4. Mark Message as Read
**POST** `/messages/:id/read` (Protected)

**Response:** `200 OK`

### 5. Delete Message
**DELETE** `/messages/:id` (Protected)

**Response:** `200 OK`

---

## Notification Endpoints

### 1. Get Notifications
**GET** `/notifications?page=1&limit=20&isRead=false` (Protected)

**Response:** `200 OK`

### 2. Get Unread Count
**GET** `/notifications/unread/count` (Protected)

**Response:** `200 OK`
```json
{
  "unreadCount": 5
}
```

### 3. Mark as Read
**POST** `/notifications/:id/read` (Protected)

**Response:** `200 OK`

### 4. Mark All as Read
**POST** `/notifications/read-all` (Protected)

**Response:** `200 OK`

### 5. Delete Notification
**DELETE** `/notifications/:id` (Protected)

**Response:** `200 OK`

### 6. Clear All
**POST** `/notifications/clear-all` (Protected)

**Response:** `200 OK`

---

## Admin Endpoints

### 1. Get Dashboard
**GET** `/admin/dashboard` (Protected, Admin only)

**Response:** `200 OK`
```json
{
  "dashboard": {
    "totalUsers": 100,
    "totalVendors": 20,
    "totalCustomers": 80,
    "totalProducts": 500,
    "totalOrders": 150,
    "totalRevenue": 1000000,
    "recentActivities": [ ... ]
  }
}
```

### 2. Get Users
**GET** `/admin/users?page=1&limit=20&role=vendor` (Protected, Admin)

**Response:** `200 OK`

### 3. Suspend User
**PUT** `/admin/users/:id/suspend` (Protected, Admin)

**Request Body:**
```json
{
  "isSuspended": true
}
```

**Response:** `200 OK`

### 4. Get Products
**GET** `/admin/products?page=1&limit=20` (Protected, Admin)

**Response:** `200 OK`

### 5. Approve Product
**PUT** `/admin/products/:id/approve` (Protected, Admin)

**Request Body:**
```json
{
  "isApproved": true
}
```

**Response:** `200 OK`

### 6. Get Sales Report
**GET** `/admin/reports/sales` (Protected, Admin)

**Response:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Error message",
  "errors": [ ... ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Status Codes Reference

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request
- **401 Unauthorized** - Not authenticated
- **403 Forbidden** - Not authorized
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error
