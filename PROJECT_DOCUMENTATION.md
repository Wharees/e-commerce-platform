# Digital LASU E-Commerce System - Project Documentation

## Executive Summary

The **Digital LASU E-Commerce System** is a comprehensive, full-stack web application designed to facilitate buying, selling, and advertising of products and services within the Lagos State University (LASU) community. The platform serves three distinct user roles: customers, vendors, and administrators, providing a seamless marketplace experience.

### Project Objectives

1. Create a centralized online marketplace for LASU students and staff
2. Enable users to buy, sell, and advertise products and services
3. Provide a secure, scalable platform with modern UI/UX
4. Implement role-based access control and features
5. Support multiple payment methods for transactions
6. Facilitate vendor management and order fulfillment
7. Provide administrative oversight and reporting tools

### Key Features

**For Customers:**
- Browse and search products across categories
- Apply filters and sorting options
- Add items to cart and checkout
- Make secure payments via Paystack
- Track orders in real-time
- Write and read product reviews
- Message vendors directly
- View order history and manage account

**For Vendors:**
- Create and manage product listings
- Track inventory and stock levels
- Process and fulfill customer orders
- View sales analytics and revenue
- Respond to customer reviews and messages
- Monitor vendor performance
- Request payments/withdrawals

**For Administrators:**
- Manage user accounts and roles
- Approve vendor applications and products
- Monitor orders and transactions
- Handle customer disputes
- View system analytics and reports
- Configure system settings
- Manage categories and content

---

## Technical Architecture

### Technology Stack

**Backend:**
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with access/refresh tokens
- **Security**: bcryptjs for password hashing, Helmet for HTTP headers
- **Payment**: Paystack API integration
- **File Storage**: Cloudinary
- **Utilities**: Morgan (logging), node-cron (scheduling), express-validator (validation)

**Frontend:**
- **Framework**: React 18.2.0
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS 3.2.7
- **HTTP Client**: Axios
- **UI Components**: React Icons, Recharts for analytics
- **Date Handling**: date-fns

### Architecture Patterns

#### MVC Architecture
- **Models**: Mongoose schemas defining data structure
- **Controllers**: Business logic and request handling
- **Routes**: API endpoints with middleware pipeline

#### Middleware Pipeline
```
Request → CORS → Helmet → Logger → Parse JSON → Validate Input 
→ Authentication → Authorization → Business Logic → Response
```

#### API Client Pattern
- Centralized Axios instance with global interceptors
- Automatic token attachment to requests
- Automatic logout on 401 responses
- 10-second timeout for all requests

#### State Management
- Zustand stores with lazy evaluation
- localStorage persistence for auth and cart
- Single source of truth for application state

---

## Database Design

### Collections Overview

| Collection | Purpose | Key Fields | Relationships |
|-----------|---------|-----------|--------------|
| **Users** | User accounts (Admin/Vendor/Customer) | email, role, isSuspended | Referenced by Products, Orders, Messages |
| **Products** | Product catalog | name, price, vendor, category | vendor↔User, category↔Category |
| **Categories** | Product classification | name, slug | Referenced by Products |
| **Cart** | Shopping carts | items[], totalPrice | customer↔User |
| **Orders** | Purchase transactions | orderNumber, status, items[] | customer↔User, items→Product |
| **Payments** | Payment records | reference, status, paystackResponse | order↔Order |
| **Reviews** | Product ratings | rating, comment, product | product↔Product, customer↔User |
| **Messages** | Direct messaging | conversationId, content | sender↔User, receiver↔User |
| **Notifications** | System alerts | type, relatedId, relatedModel | user↔User |

### Key Indexes

```javascript
// Text search
db.products.createIndex({ name: 'text', description: 'text', tags: 'text' })

// Performance
db.orders.createIndex({ customer: 1, createdAt: -1 })
db.messages.createIndex({ conversationId: 1, createdAt: -1 })
db.notifications.createIndex({ user: 1, isRead: 1, createdAt: -1 })
```

---

## API Endpoints Summary

### Authentication (8 endpoints)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout

### Products (7 endpoints)
- `GET /products` - List products with filtering
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Vendor)
- `PUT /products/:id` - Update product (Vendor)
- `DELETE /products/:id` - Delete product (Vendor)
- `GET /products/trending` - Get trending products
- `GET /products/search` - Search products

### Orders (6 endpoints)
- `POST /orders` - Create order
- `GET /orders` - Get customer orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update status (Vendor)
- `POST /orders/:id/cancel` - Cancel order (Customer)

### Payments (5 endpoints)
- `POST /payments/initialize` - Initialize Paystack payment
- `POST /payments/verify` - Verify payment
- `GET /payments/reference/:reference` - Get payment by reference
- `GET /payments` - Get user payments

### Cart (5 endpoints)
- `GET /cart` - Get cart
- `POST /cart/add` - Add item
- `PUT /cart/update` - Update quantity
- `DELETE /cart/remove/:productId` - Remove item
- `POST /cart/clear` - Clear cart

### Reviews (5 endpoints)
- `POST /reviews` - Create review
- `GET /reviews/product/:id` - Get product reviews
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review
- `POST /reviews/:id/helpful` - Mark as helpful

### Messages (5 endpoints)
- `POST /messages/send` - Send message
- `GET /messages/conversations` - Get conversations
- `GET /messages/conversation/:otherUserId` - Get conversation
- `POST /messages/:id/read` - Mark as read
- `DELETE /messages/:id` - Delete message

### Notifications (6 endpoints)
- `GET /notifications` - Get notifications
- `GET /notifications/unread/count` - Get unread count
- `POST /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `POST /notifications/clear-all` - Clear all

**Total: 52+ API endpoints**

---

## Frontend Component Structure

```
App.js (Main Router)
├── Public Routes
│   ├── HomePage
│   ├── LoginPage
│   ├── RegisterPage
│   ├── ProductListPage
│   └── ProductDetailPage
├── Protected Customer Routes
│   ├── CartPage
│   ├── CheckoutPage
│   ├── OrderHistoryPage
│   ├── ProfilePage
│   ├── MessagesPage
│   └── ReviewsPage
├── Protected Vendor Routes
│   └── VendorDashboardPage
├── Protected Admin Routes
│   └── AdminDashboardPage
├── Shared Components
│   ├── Navbar
│   ├── Footer
│   └── Notification (Toast)
└── NotFoundPage
```

### Component Responsibility

| Component | Purpose |
|-----------|---------|
| **Navbar** | Navigation, auth status, cart badge, user menu |
| **Footer** | Footer links, social media, company info |
| **Notification** | Toast notifications with auto-dismiss |
| **HomePage** | Landing page with features and CTA |
| **ProductListPage** | Browse products with filtering/sorting |
| **CartPage** | Manage items, view totals, checkout |
| **CheckoutPage** | Shipping address, payment method selection |
| **OrderHistoryPage** | View all orders with status tracking |
| **VendorDashboard** | Vendor analytics, order management, inventory |
| **AdminDashboard** | User management, product approval, reports |

---

## Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Access token (expires in 1 hour) + Refresh token (7 days)
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Role-Based Access Control**: Admin, Vendor, Customer roles with middleware validation

### Data Protection
- **HTTPS**: Required in production
- **CORS**: Configured to allow frontend domain only
- **Helmet**: HTTP header security
- **Input Validation**: express-validator on all inputs
- **Rate Limiting**: 100 requests per 15 minutes

### Payment Security
- **Paystack Integration**: Secure payment gateway
- **Reference Tokens**: Unique payment references for tracking
- **Webhook Verification**: Verify Paystack signatures
- **No Card Storage**: PCI compliance via Paystack

---

## Error Handling

### HTTP Status Codes
- **200 OK** - Request successful
- **201 Created** - Resource created
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Missing/invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

### Error Response Format
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is already registered"
    }
  ]
}
```

---

## Performance Optimizations

### Backend
- Database indexes on frequently queried fields
- MongoDB aggregation for complex queries
- Middleware for request compression
- Connection pooling for database

### Frontend
- Code splitting with React lazy loading
- Image optimization with Cloudinary
- Local caching with Zustand + localStorage
- Pagination for large result sets

---

## Deployment Considerations

### Environment Variables
- Database connection strings
- JWT secrets (different per environment)
- API keys (Paystack, Cloudinary, email service)
- Frontend API URL

### Scalability
- Horizontal scaling with load balancing
- Database replication and backups
- CDN for static assets
- Caching layer (Redis)

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Log aggregation (ELK stack)
- Uptime monitoring

---

## Future Enhancements

### Phase 2 Features
1. **Real-time Messaging**: WebSocket integration
2. **Advanced Search**: Elasticsearch integration
3. **Recommendations**: ML-based product suggestions
4. **Email Notifications**: Automated email campaigns
5. **Mobile App**: React Native or Flutter

### Phase 3 Features
1. **Subscription Model**: Vendor subscription tiers
2. **Analytics Dashboard**: Advanced vendor analytics
3. **Logistics Integration**: Real-time tracking
4. **Social Features**: User following, wishlists
5. **Marketplace Reports**: Advanced reporting tools

### Technical Debt
1. Add comprehensive unit and integration tests
2. Implement E2E testing with Cypress
3. Add API documentation with Swagger UI
4. Set up CI/CD pipeline
5. Docker containerization

---

## Team Roles

For a Final Year Project, these roles are recommended:

| Role | Responsibilities |
|------|------------------|
| **Backend Lead** | Database design, API development, security |
| **Frontend Lead** | UI/UX design, component development, state management |
| **DevOps/Infra** | Deployment, databases, monitoring, CI/CD |
| **QA/Testing** | Test planning, bug reporting, quality assurance |
| **Project Manager** | Timeline, coordination, documentation |

---

## Project Timeline

Typical 6-month development cycle:

- **Month 1**: Backend setup, database design, authentication
- **Month 2**: Core features (products, orders, payments)
- **Month 3**: Frontend development, integration
- **Month 4**: Advanced features, testing
- **Month 5**: Bug fixes, optimization, deployment
- **Month 6**: Documentation, final polish, defense prep

---

## Conclusion

The Digital LASU E-Commerce System provides a solid foundation for a modern, scalable marketplace platform. The modular architecture, comprehensive API, and well-structured frontend codebase make it suitable for extension and customization. The system demonstrates best practices in web development including MVC architecture, security, state management, and API design.

This implementation serves as an excellent final-year project demonstrating:
- Full-stack development capabilities
- Database design and optimization
- RESTful API development
- Modern frontend frameworks
- Security best practices
- Project documentation
- Production-ready code quality

---

## Contact & Support

For questions or clarifications regarding this project:

- **Documentation**: Refer to API_DOCUMENTATION.md, USER_MANUAL.md, INSTALLATION_GUIDE.md
- **Code**: Well-commented code with clear structure
- **Support**: See USER_MANUAL.md contact section
