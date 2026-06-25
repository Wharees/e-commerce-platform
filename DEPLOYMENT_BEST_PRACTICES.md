# Deployment & Best Practices Guide

## Table of Contents
1. [Production Deployment](#production-deployment)
2. [Security Best Practices](#security-best-practices)
3. [Performance Optimization](#performance-optimization)
4. [Monitoring and Logging](#monitoring-and-logging)
5. [Scaling Strategies](#scaling-strategies)

---

## Production Deployment

### Backend Deployment on Render

1. **Create Render Account**
   - Visit https://render.com
   - Sign up with GitHub account
   - Grant repository access

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select `backend` directory

3. **Configure Environment**
   ```
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   - NODE_ENV: production
   - MONGODB_URI: <Atlas connection string>
   - JWT_SECRET: <strong-random-string>
   - PAYSTACK_SECRET_KEY: <key>
   - All other required variables

5. **Deploy**
   - Click "Create Web Service"
   - Render automatically deploys on git push

### Frontend Deployment on Vercel

1. **Connect GitHub to Vercel**
   - Visit https://vercel.com
   - Click "Import Project"
   - Select GitHub repository

2. **Configure Project**
   - Framework: Create React App
   - Root Directory: ./frontend

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL: <backend-url-from-render>
   ```

4. **Deploy**
   - Click "Deploy"
   - Automatic deployments on push to main

### Backend Deployment on DigitalOcean

1. **Create Droplet**
   - Size: 1GB RAM minimum
   - OS: Ubuntu 20.04
   - Add SSH key

2. **Initial Setup**
   ```bash
   # SSH into droplet
   ssh root@your_ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs
   
   # Install MongoDB
   apt install -y mongodb
   systemctl start mongodb
   
   # Install PM2
   npm install -g pm2
   
   # Install Nginx
   apt install -y nginx
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repo-url>
   cd backend
   
   # Install dependencies
   npm install
   
   # Create .env file with production variables
   nano .env
   
   # Start with PM2
   pm2 start server.js --name "lasu-ecommerce"
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   
   ```nginx
   server {
       listen 80 default_server;
       server_name _;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable HTTPS**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com
   ```

---

## Security Best Practices

### 1. Environment Security

✅ **DO:**
```bash
# Use environment variables for secrets
NODE_ENV=production
JWT_SECRET=<64-char-random-string>
DB_PASSWORD=<strong-password>
API_KEY=<secure-key>
```

❌ **DON'T:**
```bash
# Never commit secrets
# Don't hardcode API keys
# Never expose tokens in logs
```

### 2. Authentication Security

✅ **Token Management:**
```javascript
// Use short-lived access tokens (1 hour)
const accessToken = jwt.sign(data, secret, { expiresIn: '1h' });

// Use long-lived refresh tokens (7 days)
const refreshToken = jwt.sign(data, secret, { expiresIn: '7d' });

// Store tokens securely
localStorage.setItem('accessToken', accessToken);
```

### 3. Password Security

✅ **Password Hashing:**
```javascript
const bcrypt = require('bcryptjs');

// Hash with 10 salt rounds (minimum)
const hashedPassword = await bcrypt.hash(password, 10);

// Compare for login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 4. Data Protection

✅ **Database:**
- Enable authentication
- Use strong database password
- Configure IP whitelist for MongoDB Atlas
- Enable encryption at rest
- Regular backups

✅ **API Security:**
- Use HTTPS only
- Set CORS properly
- Use Helmet for HTTP headers
- Implement rate limiting
- Validate all inputs

### 5. Payment Security

✅ **Paystack Integration:**
```javascript
// Verify Paystack signature
const crypto = require('crypto');

function verifyPaystackSignature(req) {
    const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');
    
    return hash === req.headers['x-paystack-signature'];
}

// Never expose secret key
// Always verify on backend
// Store payment references securely
```

### 6. File Upload Security

✅ **Image Upload:**
```javascript
// Use Cloudinary - handles security
// Validate file type and size
// Use signed URLs for access
// Delete old images when updating
```

### 7. Logging Security

✅ **Secure Logging:**
```javascript
// DO log
- API requests/responses
- Authentication events
- Error messages
- Business transactions

// DON'T log
- Passwords
- API keys
- Payment card details
- Personal user data
```

---

## Performance Optimization

### Backend Optimization

#### 1. Database Indexing
```javascript
// Create indexes for frequently queried fields
db.users.createIndex({ email: 1 })
db.products.createIndex({ vendor: 1, isActive: 1 })
db.orders.createIndex({ customer: 1, createdAt: -1 })

// Text search indexes
db.products.createIndex({ 
    name: 'text', 
    description: 'text', 
    tags: 'text' 
})
```

#### 2. Query Optimization
```javascript
// Use lean() for read-only queries
const products = await Product.find().lean();

// Use select() to exclude unused fields
const users = await User.find().select('-password -__v');

// Use pagination
const limit = 20;
const skip = (page - 1) * limit;
const products = await Product.find().skip(skip).limit(limit);
```

#### 3. Caching Strategy
```javascript
// Cache frequently accessed data
const redis = require('redis');
const client = redis.createClient();

// Get from cache or database
async function getProduct(id) {
    const cached = await client.get(`product:${id}`);
    if (cached) return JSON.parse(cached);
    
    const product = await Product.findById(id);
    client.setex(`product:${id}`, 3600, JSON.stringify(product));
    return product;
}
```

#### 4. Response Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### Frontend Optimization

#### 1. Code Splitting
```javascript
// Use React lazy loading
import { lazy, Suspense } from 'react';

const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));

export default function App() {
    return (
        <Suspense fallback={<Loading />}>
            <ProductDetailPage />
        </Suspense>
    );
}
```

#### 2. Image Optimization
```javascript
// Use Cloudinary transformations
// Original
<img src={cloudinaryUrl} />

// Optimized
<img 
    src={`${cloudinaryUrl}?w=300&q=auto&f=auto`}
    srcSet={`
        ${cloudinaryUrl}?w=200&q=auto&f=auto 200w,
        ${cloudinaryUrl}?w=400&q=auto&f=auto 400w,
        ${cloudinaryUrl}?w=600&q=auto&f=auto 600w
    `}
/>
```

#### 3. Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev source-map-explorer

# Run analysis
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

#### 4. Lazy Loading Data
```javascript
// Implement infinite scroll or pagination
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam = 1 }) => fetchProducts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

---

## Monitoring and Logging

### Backend Monitoring

#### 1. Error Tracking with Sentry
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

#### 2. Application Monitoring with New Relic
```javascript
require('newrelic');
```

#### 3. Log Aggregation with Winston
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

logger.info('Order created', { orderId: order._id });
```

### Frontend Monitoring

#### 1. Performance Monitoring
```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

#### 2. Error Boundary
```javascript
class ErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
        // Log to error service
        logErrorToService(error, errorInfo);
    }
}
```

---

## Scaling Strategies

### Horizontal Scaling

#### 1. Load Balancing
```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

#### 2. Database Replication
```javascript
// MongoDB replica set
// Enable in MongoDB configuration:
replication:
  replSetName: "rs0"
  
// Initialize replica set
rs.initiate({
    _id: "rs0",
    members: [
        { _id: 0, host: "primary.example.com:27017" },
        { _id: 1, host: "secondary1.example.com:27017" },
        { _id: 2, host: "secondary2.example.com:27017" }
    ]
})
```

### Vertical Scaling

#### Increase Server Resources
- Upgrade RAM from 1GB to 4GB+
- Increase CPU cores
- Upgrade storage capacity

### Caching Layer

```javascript
// Redis for session and cache
const redis = require('redis');
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

// Cache middleware
app.use(sessionMiddleware({
    store: new RedisStore({ client: redisClient })
}));
```

### CDN for Static Assets

```html
<!-- CloudFlare CDN -->
<img src="https://cdn.yourdomain.com/images/product.jpg" />

<!-- AWS CloudFront -->
<img src="https://d12345.cloudfront.net/images/product.jpg" />
```

---

## Pre-Launch Checklist

### Security
- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Performance
- [ ] Database indexes created
- [ ] Images optimized
- [ ] Code minified and split
- [ ] Caching headers set
- [ ] Compression enabled
- [ ] CDN configured

### Monitoring
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring setup
- [ ] Logging configured
- [ ] Alerts configured
- [ ] Uptime monitoring enabled

### Testing
- [ ] All endpoints tested
- [ ] Load testing completed
- [ ] Security testing passed
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified

### Documentation
- [ ] API documentation complete
- [ ] Deployment guide created
- [ ] Runbook for common issues
- [ ] Architecture documented

---

## Post-Launch Monitoring

### Daily Checks
- [ ] Server uptime status
- [ ] Error rates within threshold
- [ ] Response times acceptable
- [ ] Database performance normal
- [ ] Payment transactions successful

### Weekly Checks
- [ ] Review error logs
- [ ] Check security alerts
- [ ] Verify backups
- [ ] Review user feedback
- [ ] Monitor resource usage

### Monthly Reviews
- [ ] Database optimization
- [ ] Cache effectiveness
- [ ] User growth metrics
- [ ] Revenue analysis
- [ ] Performance trends

---

## Disaster Recovery

### Backup Strategy
```bash
# Daily MongoDB backups
0 2 * * * mongodump --uri="mongodb+srv://..." --out /backups/$(date +%Y%m%d)

# Retain last 30 days
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

### Restore Procedure
```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." /backups/20240101
```

### Failover Procedure
- Switch DNS to backup server
- Update database connection
- Verify all services
- Monitor for issues

---

## Cost Optimization

### Reduce Hosting Costs
- Use shared CDN for images
- Optimize database queries
- Remove unused dependencies
- Use serverless for functions
- Consolidate logging

### Recommended Services
- **Backend**: Render, Railway, Heroku
- **Frontend**: Vercel, Netlify
- **Database**: MongoDB Atlas (free tier available)
- **CDN**: Cloudflare (free tier)
- **File Storage**: Cloudinary (free tier)

---

## Continuous Improvement

1. **Monitor KPIs**
   - Page load time
   - API response time
   - Error rate
   - Uptime percentage
   - User satisfaction

2. **Regular Updates**
   - Update dependencies monthly
   - Security patches immediately
   - Feature improvements quarterly

3. **User Feedback**
   - Collect feedback regularly
   - Fix reported bugs quickly
   - Implement feature requests

4. **Performance Tuning**
   - Analyze slow queries monthly
   - Optimize frequently used endpoints
   - Review and update indexes

---

**Remember: Security and performance are ongoing processes, not one-time tasks.**
