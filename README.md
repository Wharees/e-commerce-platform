# Digital LASU E-Commerce System

A comprehensive, full-stack e-commerce platform designed for the Lagos State University (LASU) community, enabling students and staff to buy, sell, and advertise products and services.

## 🎯 Project Overview

The Digital LASU E-Commerce System is a modern marketplace platform that supports three user roles:

- **Customers**: Browse, purchase, and review products
- **Vendors**: Create and manage product listings, process orders, and track sales
- **Administrators**: Oversee platform operations, manage users, and generate reports

## ✨ Key Features

### Customer Features
- 🔍 Advanced product search and filtering
- 🛒 Shopping cart management
- 💳 Secure payment processing via Paystack
- 📦 Real-time order tracking
- ⭐ Product reviews and ratings
- 💬 Direct messaging with vendors
- 👤 Account management

### Vendor Features
- 📱 Product listing and inventory management
- 📊 Sales analytics and performance tracking
- 📋 Order fulfillment workflow
- 💰 Revenue tracking and payments
- ⭐ Review management
- 💬 Customer communication
- 📈 Vendor dashboard with insights

### Admin Features
- 👥 User and vendor management
- ✅ Product approval workflow
- 📊 Platform analytics and reports
- 💳 Payment and transaction monitoring
- 🛡️ Dispute resolution
- ⚙️ System configuration

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (jsonwebtoken 9.0.0)
- **Security**: Helmet, bcryptjs, CORS
- **Payment**: Paystack API
- **File Storage**: Cloudinary
- **Utilities**: Morgan, node-cron, express-validator

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS 3.2.7
- **HTTP Client**: Axios 1.3.2
- **UI Components**: React Icons, Recharts
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git
- Paystack account (for payment processing)
- Cloudinary account (for file storage)

## 🚀 Quick Start

### 1. Clone or Setup Project
```bash
# Clone the repository
git clone <repository-url> lasu-digital-ecom
cd lasu-digital-ecom

# Or if manually created, navigate to project
cd lasu-digital-ecom
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Start backend
npm run dev
```

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start frontend
npm start
```

The application will be available at `http://localhost:3000`

For detailed setup instructions, see [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

## 📁 Project Structure

```
lasu-digital-ecom/
├── backend/
│   ├── models/              # Mongoose schemas
│   ├── controllers/         # Business logic
│   ├── routes/             # API endpoints
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   ├── server.js           # Express app setup
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages/views
│   │   ├── components/     # Reusable components
│   │   ├── store/          # Zustand stores
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # CSS files
│   │   ├── App.js          # Main router
│   │   └── index.js        # React entry point
│   ├── public/             # Static files
│   ├── .env.example        # Environment template
│   └── package.json
├── API_DOCUMENTATION.md    # API reference
├── DATABASE_SCHEMA.md      # Database design
├── USER_MANUAL.md          # User guide
├── INSTALLATION_GUIDE.md   # Setup instructions
├── PROJECT_DOCUMENTATION.md # Project overview
├── UML_DIAGRAMS.md        # System diagrams
└── README.md               # This file
```

## 📚 Documentation

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with endpoints, request/response examples
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - MongoDB schema design, relationships, indexes
- **[USER_MANUAL.md](USER_MANUAL.md)** - User guide for customers, vendors, and admins
- **[INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)** - Step-by-step setup and deployment
- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Technical architecture and design decisions
- **[UML_DIAGRAMS.md](UML_DIAGRAMS.md)** - System use cases and relationships

## 🔐 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ Role-based access control (RBAC)
- ✅ CORS protection
- ✅ Helmet for HTTP security headers
- ✅ Input validation and sanitization
- ✅ Rate limiting (100 requests/15 min)
- ✅ Secure Paystack payment integration
- ✅ HTTPS support for production

## 💳 Payment Integration

The system uses **Paystack** for secure payment processing:

1. Customers initiate payment through cart checkout
2. Redirected to Paystack payment page
3. Payment verified through Paystack API
4. Order status updated upon successful payment
5. Webhook notifications for asynchronous confirmation

## 📊 Database Collections

| Collection | Purpose | Records |
|-----------|---------|---------|
| Users | User accounts (Admin/Vendor/Customer) | N/A |
| Products | Product listings | N/A |
| Categories | Product categories | 8+ |
| Cart | Shopping carts | N/A |
| Orders | Purchase orders | N/A |
| Payments | Payment transactions | N/A |
| Reviews | Product reviews | N/A |
| Messages | User-to-user messages | N/A |
| Notifications | System notifications | N/A |

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for detailed schema design.

## 🔌 API Endpoints

**52+ RESTful API endpoints** organized by resource:

- **Authentication**: 5 endpoints (register, login, logout, refresh token)
- **Products**: 7 endpoints (list, search, create, update, delete, trending)
- **Orders**: 6 endpoints (create, list, track, cancel, update status)
- **Cart**: 5 endpoints (add, remove, update, clear, view)
- **Payments**: 5 endpoints (initialize, verify, get history)
- **Reviews**: 5 endpoints (create, read, update, delete, mark helpful)
- **Messages**: 5 endpoints (send, get conversations, mark read, delete)
- **Notifications**: 6 endpoints (get, mark read, delete, clear)
- **Admin**: 8+ endpoints (user management, product approval, reports)
- **Categories**: 3 endpoints (list, get by ID, create)

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete reference.

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add/remove items from cart
- [ ] Complete checkout with Paystack
- [ ] Order tracking
- [ ] Review submission
- [ ] Vendor order management
- [ ] Admin dashboard operations

### Recommended Tools

- **Postman**: API endpoint testing
- **Insomnia**: Alternative REST client
- **Thunder Client**: VS Code extension

## 🚢 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy `build/` folder to Netlify, Vercel, or Firebase
```

### Backend Deployment
- Deploy to Heroku, Render, Railway, or DigitalOcean
- Configure environment variables in hosting platform
- Ensure MongoDB atlas is configured
- Set up SSL/HTTPS

## 📈 Performance Metrics

- Page load time: < 3 seconds
- API response time: < 500ms
- Database query optimization with indexes
- Frontend code splitting with lazy loading
- Image optimization via Cloudinary

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
✅ Solution: Ensure MongoDB is running or use MongoDB Atlas cloud connection

### Port Already in Use
```
Error: listen EADDRINUSE
```
✅ Solution: Change PORT in .env or kill process using the port

### CORS Error
✅ Solution: Check REACT_APP_API_URL in frontend .env matches backend URL

### Payment Integration Issues
✅ Solution: Verify Paystack keys in backend .env

See [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md#troubleshooting) for more solutions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📝 License

This project is available for educational purposes. Check LICENSE file for details.

## 👥 Authors

**Digital LASU E-Commerce Development Team**
- Backend Development
- Frontend Development
- Database Design
- Project Management

## 📞 Support & Contact

- **Documentation**: See docs folder for comprehensive guides
- **Email**: support@lasucommerce.com
- **Issue Tracker**: GitHub Issues
- **Help Center**: https://help.lasucommerce.com

## 🎓 Educational Value

This project demonstrates:

✅ Full-stack web application development
✅ RESTful API design and implementation
✅ Database design and optimization
✅ Authentication and authorization
✅ State management and component architecture
✅ Payment processing integration
✅ Error handling and validation
✅ Security best practices
✅ Production-ready code quality
✅ Professional documentation

Perfect for a **Computer Science Final Year Project**.

## 🔄 Version History

### v1.0 (Current)
- ✅ Core platform features
- ✅ Product management
- ✅ Order processing
- ✅ Payment integration
- ✅ Vendor dashboard
- ✅ Admin dashboard
- ✅ Messaging system
- ✅ Review system

### v2.0 (Planned)
- 🔄 Real-time messaging (WebSockets)
- 🔄 Advanced analytics
- 🔄 ML-based recommendations
- 🔄 Mobile app
- 🔄 Email notifications

## 📊 Project Statistics

- **Total API Endpoints**: 52+
- **Database Collections**: 9
- **Frontend Pages**: 10+
- **Reusable Components**: 3
- **Authentication Methods**: JWT
- **Payment Providers**: Paystack
- **Lines of Code**: 5000+
- **Development Time**: ~6 months

---

**Built with ❤️ for LASU Community**

For questions or support, refer to our comprehensive documentation or contact the development team.
