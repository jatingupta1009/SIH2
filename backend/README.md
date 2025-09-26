# Jharkhand Marketplace Backend

A full-stack marketplace backend with Razorpay integration for Jharkhand's local artisans and products.

## Features

- **User Management**: Registration, authentication, profile management
- **Product Management**: CRUD operations for products with images, variants, and inventory
- **Cart System**: Persistent cart with server-side synchronization
- **Order Management**: Complete order lifecycle with status tracking
- **Payment Integration**: Razorpay payment gateway with webhook support
- **Seller Payouts**: Automated payout system for sellers
- **Admin Panel**: Order management, payout processing, and analytics

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Payment**: Razorpay SDK
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Express-validator

## Setup Instructions

### 1. Prerequisites

- Node.js 16 or higher
- MongoDB (local or Atlas)
- Razorpay account with API keys

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env
```

### 3. Environment Configuration

Edit `.env` file with your configuration:

```env
# Database
MONGO_URI=mongodb://localhost:27017/jharkhand_marketplace

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Razorpay Setup

1. **Create Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **Get API Keys**: 
   - Go to Dashboard → Settings → API Keys
   - Copy Key ID and Key Secret
   - Add them to your `.env` file
3. **Configure Webhooks**:
   - Go to Dashboard → Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`, `transfer.processed`, `transfer.failed`, `refund.processed`
   - Copy webhook secret to `.env`

### 5. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
npm run seed
```

### 6. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get products with filters
- `GET /api/products/:slug` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove cart item
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/sync` - Sync localStorage cart

### Checkout
- `POST /api/checkout/create-order` - Create order and Razorpay order
- `POST /api/checkout/verify` - Verify payment signature
- `GET /api/checkout/orders` - Get user orders
- `GET /api/checkout/orders/:id` - Get order details
- `POST /api/checkout/orders/:id/cancel` - Cancel order
- `POST /api/checkout/orders/:id/refund` - Process refund

### Webhooks
- `POST /api/webhooks/razorpay` - Razorpay webhook handler

## Razorpay Integration

### Payment Flow

1. **Create Order**: Frontend calls `/api/checkout/create-order`
2. **Razorpay Order**: Backend creates Razorpay order and returns order details
3. **Payment**: Frontend opens Razorpay checkout with order details
4. **Verification**: Frontend calls `/api/checkout/verify` with payment details
5. **Webhook**: Razorpay sends webhook events for payment status updates

### Marketplace Features (TODO)

To enable marketplace features:

1. **Enable Marketplace**: Contact Razorpay support to enable marketplace features
2. **Seller Onboarding**: Set up Razorpay Connect for sellers
3. **KYC Verification**: Complete KYC for all sellers
4. **Update Code**: Uncomment marketplace transfer code in `checkoutController.js`

### Payout System

Two approaches are implemented:

1. **Manual Payouts** (Default): Platform holds money, manual transfers to sellers
2. **Automatic Splits** (TODO): Razorpay marketplace splits payment automatically

## Testing

### Test Cards (Razorpay Test Mode)

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Webhook Testing

Use Razorpay's webhook testing tool or ngrok for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 5000

# Use ngrok URL for webhook endpoint
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent abuse with express-rate-limit
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Express-validator for request validation
- **Payment Security**: Razorpay handles PCI compliance

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jharkhand_marketplace
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
CORS_ORIGIN=https://yourdomain.com
```

### Deployment Checklist

- [ ] Set up production MongoDB
- [ ] Configure Razorpay live keys
- [ ] Set up webhook endpoints
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Razorpay Keys**: Verify API keys are correct and account is active
3. **Webhook Failures**: Check webhook URL is accessible and signature verification
4. **CORS Issues**: Ensure frontend URL is in CORS_ORIGIN

### Logs

Check server logs for detailed error information:

```bash
# Development
npm run dev

# Production
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the repository
- Contact: support@jharkhandmarketplace.com