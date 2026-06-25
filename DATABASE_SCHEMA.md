# Database Schema - Digital LASU E-Commerce System

## MongoDB Collections

### 1. Users Collection
```
{
  _id: ObjectId,
  fullName: String (required),
  email: String (required, unique),
  lasuEmail: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  role: String (enum: ['admin', 'vendor', 'customer'], default: 'customer'),
  profileImage: String,
  bio: String,
  address: {
    street: String,
    city: String (default: 'Lagos'),
    state: String (default: 'Lagos'),
    postalCode: String,
    country: String (default: 'Nigeria')
  },
  isEmailVerified: Boolean (default: false),
  isSuspended: Boolean (default: false),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 2. Categories Collection
```
{
  _id: ObjectId,
  name: String (required, unique),
  description: String (required),
  image: String,
  slug: String (unique, lowercase),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 3. Products Collection
```
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  quantity: Number (required, min: 0),
  category: ObjectId (ref: Category, required),
  vendor: ObjectId (ref: User, required),
  images: [String],
  thumbnail: String,
  rating: Number (default: 0, min: 0, max: 5),
  reviewCount: Number (default: 0),
  isApproved: Boolean (default: true),
  isActive: Boolean (default: true),
  tags: [String],
  sku: String (unique),
  discount: Number (default: 0, min: 0, max: 100),
  discountPrice: Number,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- Text index on: name, description, tags
- Index on: vendor, isActive
- Index on: category, isActive
```

### 4. Cart Collection
```
{
  _id: ObjectId,
  customer: ObjectId (ref: User, required),
  items: [{
    product: ObjectId (ref: Product, required),
    quantity: Number (required, min: 1),
    price: Number,
    addedAt: Date (default: now)
  }],
  totalPrice: Number (default: 0),
  lastUpdated: Date (default: now),
  createdAt: Date (auto)
}
```

### 5. Orders Collection
```
{
  _id: ObjectId,
  orderNumber: String (unique, required),
  customer: ObjectId (ref: User, required),
  items: [{
    product: ObjectId (ref: Product, required),
    vendor: ObjectId (ref: User, required),
    quantity: Number (required, min: 1),
    price: Number,
    totalPrice: Number
  }],
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  totalAmount: Number (required),
  shippingFee: Number (default: 0),
  discount: Number (default: 0),
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending'),
  paymentStatus: String (enum: ['unpaid', 'paid', 'failed'], default: 'unpaid'),
  paymentMethod: String (enum: ['paystack', 'cash_on_delivery'], default: 'paystack'),
  paymentReference: String,
  notes: String,
  cancellationReason: String,
  cancellationRequestedAt: Date,
  cancelledAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 6. Payments Collection
```
{
  _id: ObjectId,
  order: ObjectId (ref: Order, required),
  customer: ObjectId (ref: User, required),
  amount: Number (required),
  currency: String (default: 'NGN'),
  paymentMethod: String (enum: ['paystack', 'cash_on_delivery'], default: 'paystack'),
  reference: String (unique),
  status: String (enum: ['pending', 'success', 'failed', 'cancelled'], default: 'pending'),
  paystackResponse: Mixed,
  receiptUrl: String,
  paidAt: Date,
  description: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 7. Reviews Collection
```
{
  _id: ObjectId,
  product: ObjectId (ref: Product, required),
  customer: ObjectId (ref: User, required),
  vendor: ObjectId (ref: User, required),
  order: ObjectId (ref: Order),
  rating: Number (required, min: 1, max: 5),
  title: String (required),
  comment: String (required, minlength: 10),
  helpful: Number (default: 0),
  unhelpful: Number (default: 0),
  isVerifiedPurchase: Boolean (default: false),
  images: [String],
  status: String (enum: ['approved', 'pending', 'rejected'], default: 'approved'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- Index on: product, status
- Index on: customer
- Index on: vendor
```

### 8. Messages Collection
```
{
  _id: ObjectId,
  conversationId: String (required, indexed),
  sender: ObjectId (ref: User, required),
  receiver: ObjectId (ref: User, required),
  product: ObjectId (ref: Product),
  order: ObjectId (ref: Order),
  content: String (required),
  attachments: [String],
  isRead: Boolean (default: false),
  readAt: Date,
  createdAt: Date (auto, indexed),
  updatedAt: Date (auto)
}

Indexes:
- Index on: conversationId, createdAt
- Index on: sender, receiver
```

### 9. Notifications Collection
```
{
  _id: ObjectId,
  user: ObjectId (ref: User, required, indexed),
  type: String (enum: ['order', 'product', 'message', 'payment', 'review', 'vendor_approval'], required),
  title: String (required),
  message: String (required),
  relatedId: ObjectId,
  relatedModel: String (enum: ['Order', 'Product', 'Message', 'Payment', 'Review', 'User']),
  data: Mixed,
  isRead: Boolean (default: false),
  readAt: Date,
  createdAt: Date (auto, indexed),
  updatedAt: Date (auto)
}

Indexes:
- Index on: user, isRead, createdAt (descending)
```

---

## Relationships (ER Diagram in ASCII)

```
┌──────────────────┐
│     Users        │
│ (admin/vendor/   │
│  customer)       │
└────────┬─────────┘
         │
    ┌────┴─────┬──────────────┬─────────────┐
    │           │              │             │
    ▼           ▼              ▼             ▼
┌────────┐  ┌────────┐   ┌────────┐   ┌──────────┐
│Products│  │Messages│   │ Orders │   │Carts     │
└────┬───┘  └────────┘   └────┬───┘   └──────────┘
     │                        │
     ├────────────┬───────────┤
     │            │           │
     ▼            ▼           ▼
┌──────────┐ ┌────────┐  ┌──────────┐
│ Reviews  │ │Payments│  │Categories│
└──────────┘ └────────┘  └──────────┘

┌──────────────┐
│Notifications │
└──────────────┘
```

---

## Indexes for Performance

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ lasuEmail: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })

// Products
db.products.createIndex({ name: 'text', description: 'text', tags: 'text' })
db.products.createIndex({ vendor: 1, isActive: 1 })
db.products.createIndex({ category: 1, isActive: 1 })
db.products.createIndex({ createdAt: -1 })

// Orders
db.orders.createIndex({ customer: 1, createdAt: -1 })
db.orders.createIndex({ 'items.vendor': 1, status: 1 })
db.orders.createIndex({ status: 1 })

// Payments
db.payments.createIndex({ order: 1 })
db.payments.createIndex({ reference: 1 }, { unique: true, sparse: true })
db.payments.createIndex({ createdAt: -1 })

// Reviews
db.reviews.createIndex({ product: 1, status: 1 })
db.reviews.createIndex({ customer: 1 })
db.reviews.createIndex({ vendor: 1 })

// Messages
db.messages.createIndex({ conversationId: 1, createdAt: -1 })
db.messages.createIndex({ sender: 1, receiver: 1 })

// Notifications
db.notifications.createIndex({ user: 1, isRead: 1, createdAt: -1 })
```
