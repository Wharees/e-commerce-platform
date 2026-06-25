# Installation Guide - Digital LASU E-Commerce System

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

---

## Step 1: Clone or Setup the Project

```bash
# Navigate to your projects directory
cd ~/projects

# If cloning from Git
git clone <repository-url> lasu-digital-ecom
cd lasu-digital-ecom

# Or if you already have the folders created
cd lasu-digital-ecom
```

---

## Step 2: Backend Setup

### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Important Environment Variables:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lasu-ecommerce
JWT_SECRET=your-secret-key-here
PAYSTACK_SECRET_KEY=your-paystack-key
PAYSTACK_PUBLIC_KEY=your-paystack-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2.3 Setup MongoDB

**Option A: Local MongoDB**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongodb

# On Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Use it in MONGODB_URI in .env

### 2.4 Verify Backend Setup

```bash
# Still in backend directory
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

---

## Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies

```bash
# From project root
cd frontend
npm install
```

### 3.2 Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env file
nano .env
```

**Frontend .env:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Digital LASU E-Commerce
```

### 3.3 Start Frontend Development Server

```bash
# Still in frontend directory
npm start
```

The frontend will open automatically at `http://localhost:3000`

---

## Step 4: Initial Setup

### 4.1 Create Admin Account

Once the backend is running, make a POST request to register as admin:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Admin User",
    "email": "admin@lasucommerce.com",
    "lasuEmail": "admin@lasu.edu.ng",
    "password": "AdminPassword123",
    "phone": "+2349012345678",
    "role": "admin"
  }'
```

Or use Postman/Insomnia

### 4.2 Create Test Categories

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Books",
    "description": "Academic and recreational books"
  }'
```

Repeat for other categories:
- Electronics
- Fashion
- Food and Snacks
- Academic Materials
- Hostel Essentials
- Beauty Products
- Services
- Gadgets

### 4.3 Create Test Vendor Account

Register as a vendor user through the frontend or API

### 4.4 Create Test Products

Login as vendor and create sample products

---

## Running Both Frontend and Backend

### Option 1: Terminal Tabs/Windows

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: Concurrently (From Project Root)

```bash
npm install -g concurrently

# From root directory with both package.json files
concurrently \
  "npm run dev --prefix backend" \
  "npm start --prefix frontend"
```

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- If using Atlas, check whitelist IP address

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=5001
```

### Frontend Can't Connect to Backend
```
Network Error: Failed to fetch from API
```

**Solution:**
- Verify REACT_APP_API_URL in .env
- Check backend is running
- Ensure CORS is configured

### Module Not Found Error

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Development Tools

### Recommended Extensions

**VS Code Extensions:**
- REST Client (for API testing)
- Thunder Client (for API testing)
- MongoDB for VS Code
- ESLint
- Prettier

### API Testing Tools

- Postman: https://www.postman.com/
- Insomnia: https://insomnia.rest/
- Thunder Client: https://www.thunderclient.com/

---

## Database Seeding (Optional)

Create initial data:

```bash
# In backend directory
node scripts/seedDatabase.js
```

---

## Environment Configuration

### Development
```env
NODE_ENV=development
DEBUG=true
```

### Production
```env
NODE_ENV=production
DEBUG=false
```

---

## Build for Production

### Backend

No build needed - Node.js runs directly

### Frontend

```bash
cd frontend
npm run build
```

Output: `frontend/build/`

Serve with any static host (Netlify, Vercel, Firebase, etc.)

---

## Docker Setup (Optional)

### Dockerfile for Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://mongodb:27017/lasu-ecommerce

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongo_data:
```

Run with: `docker-compose up`

---

## Next Steps

1. Configure Paystack integration
2. Setup Cloudinary for image storage
3. Configure email service
4. Create additional test data
5. Deploy to hosting service

For detailed information, see other documentation files.
