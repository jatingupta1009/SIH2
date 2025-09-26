# Jharkhand Marketplace - Full Stack E-commerce Platform

A comprehensive marketplace platform for Jharkhand's local artisans, featuring Amazon-like cart functionality, Razorpay payment integration, and automated seller payouts.

## 🚀 Features

### Frontend
- **Amazon-style Product Cards**: Enhanced product display with hover effects
- **Rich Product Detail Pages**: Image carousels, reviews, Q&A sections
- **Advanced Cart System**: Persistent cart with seller grouping
- **Multi-step Checkout**: Address, payment, and order review
- **Razorpay Integration**: Secure payment processing
- **Responsive Design**: Mobile-first approach with TailwindCSS

### Backend
- **RESTful API**: Complete CRUD operations for all entities
- **JWT Authentication**: Secure user authentication
- **MongoDB Integration**: Scalable database with Mongoose ODM
- **Razorpay SDK**: Payment gateway integration
- **Webhook Handling**: Real-time payment status updates
- **Seller Payout System**: Automated payout management

### Payment & Payouts
- **Secure Payments**: PCI-compliant payment processing
- **Multiple Payment Methods**: Cards, UPI, Net Banking, Wallets
- **Seller Payouts**: Automated transfers to seller accounts
- **Refund Management**: Complete refund processing
- **Order Tracking**: Real-time order status updates

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **shadcn/ui** components
- **Axios** for API calls
- **React Context** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Razorpay** for payments
- **bcrypt** for password hashing

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Razorpay account

### 1. Clone Repository
```bash
git clone <repository-url>
cd jharkhand-marketplace
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
```

Configure `.env`:
```env
MONGO_URI=mongodb://localhost:27017/jharkhand_marketplace
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Setup
```bash
cd ../src
npm install
```

Create `.env.local`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 4. Database Setup
```bash
cd backend
npm run seed
```

### 5. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd src
npm run dev
```

## 🔑 Razorpay Configuration

### 1. Create Razorpay Account
- Sign up at [razorpay.com](https://razorpay.com)
- Complete KYC verification

### 2. Get API Keys
- Dashboard → Settings → API Keys
- Copy Key ID and Key Secret
- Add to environment variables

### 3. Configure Webhooks
- Dashboard → Settings → Webhooks
- Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
- Select events: `payment.captured`, `payment.failed`, `order.paid`, `transfer.processed`

### 4. Enable Marketplace Features (Optional)
- Contact Razorpay support
- Complete seller onboarding process
- Update code to use marketplace transfers

## 🧪 Testing

### Test Cards (Razorpay Test Mode)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Sample Data
The seed script creates:
- 3 verified artisans/sellers
- 3 sample products
- 2 test users
- Sample orders and payouts

### Test Credentials
- **User 1**: john.doe@example.com / password123
- **User 2**: jane.smith@example.com / password123

## 📱 User Flows

### 1. Product Browsing
- Browse products in grid layout
- Filter by category, price, location
- Search products by name/description
- View product details with image carousel

### 2. Shopping Cart
- Add products to cart
- Adjust quantities
- Apply coupon codes
- Group items by seller
- Calculate shipping and taxes

### 3. Checkout Process
- Select shipping address
- Choose payment method
- Review order summary
- Complete payment via Razorpay
- Receive order confirmation

### 4. Order Management
- Track order status
- View order history
- Cancel orders (if eligible)
- Request refunds

## 🏪 Seller Features

### 1. Product Management
- Add/edit products
- Upload product images
- Set pricing and inventory
- Manage product variants

### 2. Order Processing
- Receive order notifications
- Update order status
- Process shipments
- Handle returns/refunds

### 3. Payout Management
- View payout history
- Track payment status
- Manage bank details
- Set payout preferences

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configured origins only
- **Input Validation**: Server-side validation
- **Payment Security**: Razorpay PCI compliance
- **Webhook Verification**: Signature validation

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jharkhand_marketplace
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
CORS_ORIGIN=https://yourdomain.com
```

### Deployment Checklist
- [ ] Set up production MongoDB
- [ ] Configure Razorpay live keys
- [ ] Set up webhook endpoints
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring
- [ ] Configure backups

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Product Endpoints
```
GET    /api/products
GET    /api/products/:slug
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Cart Endpoints
```
GET  /api/cart
POST /api/cart
PUT  /api/cart/:productId
DELETE /api/cart/:productId
POST /api/cart/sync
```

### Checkout Endpoints
```
POST /api/checkout/create-order
POST /api/checkout/verify
GET  /api/checkout/orders
GET  /api/checkout/orders/:id
POST /api/checkout/orders/:id/cancel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Contact: support@jharkhandmarketplace.com

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Basic marketplace functionality
- [x] Razorpay payment integration
- [x] Cart and checkout system
- [x] Order management

### Phase 2 (Next)
- [ ] Advanced search and filters
- [ ] Product reviews and ratings
- [ ] Seller dashboard
- [ ] Admin panel
- [ ] Mobile app

### Phase 3 (Future)
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Marketplace automation
- [ ] International shipping

---

**Built with ❤️ for Jharkhand's artisans and craftspeople**