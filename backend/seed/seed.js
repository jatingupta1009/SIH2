const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const Order = require('../models/Order');
const Payout = require('../models/Payout');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jharkhand_marketplace');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample artisans/sellers
const artisans = [
  {
    name: 'Rajesh Munda',
    email: 'rajesh.munda@example.com',
    phone: '9876543210',
    bio: 'Master craftsman specializing in traditional Dhokra metal casting. With over 20 years of experience, Rajesh creates stunning bronze artifacts using ancient lost-wax technique passed down through generations.',
    specialty: 'Traditional Metal Crafts',
    shopName: 'Munda Craft Collective',
    location: 'Khunti',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    businessType: 'individual',
    gstNumber: '20ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    bankDetails: {
      accountNumber: '1234567890123456',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Rajesh Munda',
      bankName: 'State Bank of India',
      branchName: 'Khunti Branch'
    },
    kyc: {
      status: 'verified',
      documents: {
        pan: 'pan_doc_url',
        aadhar: 'aadhar_doc_url',
        bankStatement: 'bank_statement_url'
      },
      submittedAt: new Date(),
      verifiedAt: new Date()
    },
    rating: 4.9,
    reviewCount: 124,
    totalSales: 150000,
    totalOrders: 45,
    productsCount: 25,
    servicesCount: 3,
    isFeatured: true,
    isVerified: true,
    status: 'active',
    socialLinks: {
      website: 'https://mundacrafts.com',
      instagram: '@mundacrafts'
    },
    payoutSettings: {
      frequency: 'weekly',
      minimumAmount: 1000,
      autoPayout: true
    }
  },
  {
    name: 'Priya Devi',
    email: 'priya.devi@example.com',
    phone: '9876543211',
    bio: 'Expert weaver creating beautiful Tussar silk sarees with traditional tribal motifs. Her work has been featured in several fashion shows across India and she has trained over 50 young weavers.',
    specialty: 'Handwoven Textiles',
    shopName: 'Jharkhand Silk Weavers',
    location: 'Chaibasa',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
    businessType: 'individual',
    gstNumber: '20FGHIJ5678K2L6',
    panNumber: 'FGHIJ5678K',
    bankDetails: {
      accountNumber: '2345678901234567',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Priya Devi',
      bankName: 'HDFC Bank',
      branchName: 'Chaibasa Branch'
    },
    kyc: {
      status: 'verified',
      documents: {
        pan: 'pan_doc_url_2',
        aadhar: 'aadhar_doc_url_2',
        bankStatement: 'bank_statement_url_2'
      },
      submittedAt: new Date(),
      verifiedAt: new Date()
    },
    rating: 4.8,
    reviewCount: 203,
    totalSales: 200000,
    totalOrders: 67,
    productsCount: 18,
    servicesCount: 2,
    isFeatured: true,
    isVerified: true,
    status: 'active',
    socialLinks: {
      instagram: '@priyadevi_silks'
    },
    payoutSettings: {
      frequency: 'weekly',
      minimumAmount: 1000,
      autoPayout: true
    }
  },
  {
    name: 'Suresh Oraon',
    email: 'suresh.oraon@example.com',
    phone: '9876543212',
    bio: 'Forest honey collector and organic products specialist. Suresh works with tribal communities to sustainably harvest forest products while preserving traditional knowledge and supporting local livelihoods.',
    specialty: 'Organic Forest Products',
    shopName: 'Forest Honey Collective',
    location: 'Gumla',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    businessType: 'individual',
    gstNumber: '20MNOPQ9012R3S7',
    panNumber: 'MNOPQ9012R',
    bankDetails: {
      accountNumber: '3456789012345678',
      ifscCode: 'ICIC0001234',
      accountHolderName: 'Suresh Oraon',
      bankName: 'ICICI Bank',
      branchName: 'Gumla Branch'
    },
    kyc: {
      status: 'verified',
      documents: {
        pan: 'pan_doc_url_3',
        aadhar: 'aadhar_doc_url_3',
        bankStatement: 'bank_statement_url_3'
      },
      submittedAt: new Date(),
      verifiedAt: new Date()
    },
    rating: 4.9,
    reviewCount: 92,
    totalSales: 75000,
    totalOrders: 28,
    productsCount: 12,
    servicesCount: 1,
    isFeatured: false,
    isVerified: true,
    status: 'active',
    payoutSettings: {
      frequency: 'monthly',
      minimumAmount: 2000,
      autoPayout: true
    }
  }
];

// Sample products
const products = [
  {
    title: 'Traditional Dhokra Elephant',
    slug: 'traditional-dhokra-elephant',
    description: 'Handcrafted bronze metal casting by tribal artisans using ancient lost-wax technique. This beautiful elephant figurine represents the rich cultural heritage of Jharkhand and makes for an excellent decorative piece or gift.',
    shortDescription: 'Handcrafted bronze metal casting using ancient lost-wax technique',
    images: [
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', alt: 'Dhokra Elephant', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', alt: 'Dhokra Elephant Side View' },
      { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', alt: 'Dhokra Elephant Detail' }
    ],
    price: 1200,
    mrp: 1500,
    discount: 20,
    stock: 15,
    category: 'handicrafts',
    tags: ['Eco-friendly', 'Fair Trade', 'Handmade', 'Bronze', 'Traditional'],
    attributes: [
      { name: 'Material', value: 'Bronze' },
      { name: 'Size', value: '8 inches' },
      { name: 'Weight', value: '500g' },
      { name: 'Finish', value: 'Antique' }
    ],
    metaTitle: 'Traditional Dhokra Elephant - Handcrafted Bronze Art',
    metaDescription: 'Buy authentic Dhokra elephant figurine handcrafted by tribal artisans. Made using ancient lost-wax technique.',
    ratingAvg: 4.8,
    ratingCount: 124,
    status: 'active',
    weight: 500,
    dimensions: { length: 20, width: 15, height: 20 },
    deliveryTime: { min: 3, max: 7 },
    viewCount: 245
  },
  {
    title: 'Handwoven Tussar Silk Saree',
    slug: 'handwoven-tussar-silk-saree',
    description: 'Premium quality silk saree with traditional tribal motifs and golden threads. This exquisite saree showcases the traditional weaving techniques of Jharkhand and is perfect for special occasions.',
    shortDescription: 'Premium silk saree with traditional tribal motifs',
    images: [
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop', alt: 'Tussar Silk Saree', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop', alt: 'Saree Detail' },
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop', alt: 'Saree Back' }
    ],
    price: 3500,
    mrp: 4200,
    discount: 17,
    stock: 8,
    category: 'textiles',
    tags: ['Handwoven', 'Premium', 'Traditional', 'Silk', 'Tribal'],
    attributes: [
      { name: 'Fabric', value: 'Tussar Silk' },
      { name: 'Length', value: '5.5 meters' },
      { name: 'Blouse', value: 'Included' },
      { name: 'Care', value: 'Dry Clean Only' }
    ],
    metaTitle: 'Handwoven Tussar Silk Saree - Traditional Tribal Design',
    metaDescription: 'Buy authentic handwoven Tussar silk saree with traditional tribal motifs. Premium quality silk from Jharkhand.',
    ratingAvg: 4.7,
    ratingCount: 203,
    status: 'active',
    weight: 300,
    dimensions: { length: 550, width: 110, height: 2 },
    deliveryTime: { min: 5, max: 10 },
    viewCount: 189
  },
  {
    title: 'Organic Forest Honey',
    slug: 'organic-forest-honey',
    description: 'Pure forest honey collected by tribal communities from pristine forests. This natural honey is free from chemicals and pesticides, offering authentic taste and health benefits.',
    shortDescription: 'Pure forest honey collected by tribal communities',
    images: [
      { url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop', alt: 'Forest Honey', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop', alt: 'Honey Jar' },
      { url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop', alt: 'Honey Collection' }
    ],
    price: 450,
    mrp: null,
    discount: 0,
    stock: 25,
    category: 'food',
    tags: ['Organic', 'Natural', 'Tribal', 'Forest', 'Pure'],
    attributes: [
      { name: 'Weight', value: '500g' },
      { name: 'Type', value: 'Wild Forest Honey' },
      { name: 'Origin', value: 'Jharkhand Forests' },
      { name: 'Certification', value: 'Organic' }
    ],
    metaTitle: 'Organic Forest Honey - Pure Natural Honey from Jharkhand',
    metaDescription: 'Buy pure organic forest honey collected by tribal communities. Natural, chemical-free honey with authentic taste.',
    ratingAvg: 4.9,
    ratingCount: 92,
    status: 'active',
    weight: 500,
    dimensions: { length: 8, width: 8, height: 12 },
    deliveryTime: { min: 2, max: 5 },
    viewCount: 156
  }
];

// Sample users
const users = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '9876543210',
    addresses: [
      {
        type: 'home',
        name: 'John Doe',
        phone: '9876543210',
        address: '123 Main Street',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834001',
        landmark: 'Near Railway Station',
        isDefault: true
      }
    ],
    role: 'user',
    isVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    phone: '9876543211',
    addresses: [
      {
        type: 'home',
        name: 'Jane Smith',
        phone: '9876543211',
        address: '456 Park Avenue',
        city: 'Jamshedpur',
        state: 'Jharkhand',
        pincode: '831001',
        landmark: 'Near Tata Steel',
        isDefault: true
      }
    ],
    role: 'user',
    isVerified: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Artisan.deleteMany({});
    await Order.deleteMany({});
    await Payout.deleteMany({});

    console.log('Cleared existing data');

    // Create artisans
    const createdArtisans = await Artisan.insertMany(artisans);
    console.log(`Created ${createdArtisans.length} artisans`);

    // Create users
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create products with seller references
    const productsWithSellers = products.map((product, index) => ({
      ...product,
      sellerId: createdArtisans[index % createdArtisans.length]._id
    }));

    const createdProducts = await Product.insertMany(productsWithSellers);
    console.log(`Created ${createdProducts.length} products`);

    // Add some products to user carts
    const user1 = createdUsers[0];
    const user2 = createdUsers[1];

    user1.cart.items = [
      {
        productId: createdProducts[0]._id,
        quantity: 2,
        variant: null
      },
      {
        productId: createdProducts[1]._id,
        quantity: 1,
        variant: null
      }
    ];

    user2.cart.items = [
      {
        productId: createdProducts[2]._id,
        quantity: 3,
        variant: null
      }
    ];

    await user1.save();
    await user2.save();

    console.log('Added items to user carts');

    // Create sample orders
    const sampleOrders = [
      {
        orderNumber: 'ORD-001',
        userId: user1._id,
        userEmail: user1.email,
        userName: user1.name,
        items: [
          {
            productId: createdProducts[0]._id,
            productName: createdProducts[0].title,
            productImage: createdProducts[0].images[0].url,
            quantity: 1,
            price: createdProducts[0].price,
            sellerId: createdProducts[0].sellerId,
            sellerName: createdArtisans[0].name,
            variant: null,
            sku: null
          }
        ],
        totals: {
          subtotal: createdProducts[0].price,
          tax: Math.round(createdProducts[0].price * 0.18),
          shipping: 50,
          discounts: 0,
          grandTotal: createdProducts[0].price + Math.round(createdProducts[0].price * 0.18) + 50
        },
        shippingAddress: user1.addresses[0],
        razorpay: {
          orderId: 'order_test_123',
          paymentId: 'pay_test_123',
          signature: 'test_signature',
          status: 'captured',
          amount: (createdProducts[0].price + Math.round(createdProducts[0].price * 0.18) + 50) * 100,
          currency: 'INR',
          method: 'card',
          capturedAt: new Date()
        },
        status: 'DELIVERED',
        payouts: [
          {
            sellerId: createdArtisans[0]._id,
            sellerName: createdArtisans[0].name,
            amount: createdProducts[0].price,
            transferId: 'transfer_test_123',
            status: 'processed'
          }
        ]
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`Created ${createdOrders.length} sample orders`);

    // Create sample payouts
    const samplePayouts = [
      {
        sellerId: createdArtisans[0]._id,
        sellerName: createdArtisans[0].name,
        sellerEmail: createdArtisans[0].email,
        amount: createdProducts[0].price,
        currency: 'INR',
        razorpayTransferId: 'transfer_test_123',
        status: 'completed',
        orderIds: [createdOrders[0]._id],
        settlementPeriod: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        },
        platformFee: Math.round(createdProducts[0].price * 0.05),
        processingFee: 0,
        netAmount: createdProducts[0].price - Math.round(createdProducts[0].price * 0.05),
        method: 'razorpay_transfer',
        processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdPayouts = await Payout.insertMany(samplePayouts);
    console.log(`Created ${createdPayouts.length} sample payouts`);

    console.log('Database seeding completed successfully!');
    console.log('\nSample data created:');
    console.log(`- ${createdArtisans.length} artisans/sellers`);
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdProducts.length} products`);
    console.log(`- ${createdOrders.length} orders`);
    console.log(`- ${createdPayouts.length} payouts`);
    console.log('\nTest credentials:');
    console.log('User 1: john.doe@example.com / password123');
    console.log('User 2: jane.smith@example.com / password123');
    console.log('\nArtisan emails:');
    createdArtisans.forEach(artisan => {
      console.log(`- ${artisan.email}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase().then(() => {
      mongoose.connection.close();
      console.log('Database connection closed');
    });
  });
}

module.exports = { seedDatabase, connectDB };
