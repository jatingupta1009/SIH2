const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jharkhand_marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Artisan.deleteMany({});
    await Product.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Rajesh Munda',
        email: 'rajesh@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'artisan',
        address: {
          street: 'Village Road',
          city: 'Khunti',
          state: 'Jharkhand',
          pincode: '835210'
        },
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'Priya Devi',
        email: 'priya@example.com',
        password: 'password123',
        phone: '9876543211',
        role: 'artisan',
        address: {
          street: 'Weaver Street',
          city: 'Chaibasa',
          state: 'Jharkhand',
          pincode: '833001'
        },
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'Suresh Oraon',
        email: 'suresh@example.com',
        password: 'password123',
        phone: '9876543212',
        role: 'artisan',
        address: {
          street: 'Forest Road',
          city: 'Gumla',
          state: 'Jharkhand',
          pincode: '835207'
        },
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'Meera Singh',
        email: 'meera@example.com',
        password: 'password123',
        phone: '9876543213',
        role: 'artisan',
        address: {
          street: 'Camera Lane',
          city: 'Ranchi',
          state: 'Jharkhand',
          pincode: '834001'
        },
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'Lakshmi Devi',
        email: 'lakshmi@example.com',
        password: 'password123',
        phone: '9876543214',
        role: 'artisan',
        address: {
          street: 'Dance Street',
          city: 'Dumka',
          state: 'Jharkhand',
          pincode: '814101'
        },
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'Ram Kumar',
        email: 'ram@example.com',
        password: 'password123',
        phone: '9876543215',
        role: 'artisan',
        address: {
          street: 'Pottery Lane',
          city: 'Jamshedpur',
          state: 'Jharkhand',
          pincode: '831001'
        },
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        password: 'password123',
        phone: '9876543216',
        role: 'artisan',
        address: {
          street: 'Temple Road',
          city: 'Deoghar',
          state: 'Jharkhand',
          pincode: '814112'
        },
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543217',
        role: 'user',
        address: {
          street: 'Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '9876543218',
        role: 'user',
        address: {
          street: 'Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop',
        isVerified: true
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '9876543219',
        role: 'admin',
        address: {
          street: 'Admin Street',
          city: 'Ranchi',
          state: 'Jharkhand',
          pincode: '834001'
        },
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        isVerified: true
      }
    ]);

    console.log('👥 Created users');

    // Create artisans
    const artisans = await Artisan.create([
      {
        user: users[0]._id,
        bio: 'Master craftsman specializing in traditional Dhokra metal casting. With over 20 years of experience, Rajesh creates stunning bronze artifacts using ancient lost-wax technique.',
        specialty: 'Traditional Metal Crafts',
        skills: ['Dhokra Casting', 'Bronze Work', 'Traditional Art'],
        experience: {
          years: 20,
          description: 'Expert in traditional Dhokra metal casting techniques'
        },
        location: {
          address: 'Village Road, Khunti',
          city: 'Khunti',
          state: 'Jharkhand',
          pincode: '835210'
        },
        contact: {
          phone: '9876543210',
          email: 'rajesh@example.com'
        },
        businessInfo: {
          businessName: 'Munda Craft Collective',
          businessType: 'collective'
        },
        isVerified: true,
        isFeatured: true,
        joinedDate: new Date('2020-01-15')
      },
      {
        user: users[1]._id,
        bio: 'Expert weaver creating beautiful Tussar silk sarees with traditional tribal motifs. Her work has been featured in several fashion shows across India.',
        specialty: 'Handwoven Textiles',
        skills: ['Tussar Weaving', 'Silk Work', 'Traditional Motifs'],
        experience: {
          years: 15,
          description: 'Master weaver specializing in Tussar silk'
        },
        location: {
          address: 'Weaver Street, Chaibasa',
          city: 'Chaibasa',
          state: 'Jharkhand',
          pincode: '833001'
        },
        contact: {
          phone: '9876543211',
          email: 'priya@example.com'
        },
        businessInfo: {
          businessName: 'Jharkhand Silk Weavers',
          businessType: 'cooperative'
        },
        isVerified: true,
        isFeatured: true,
        joinedDate: new Date('2019-08-22')
      },
      {
        user: users[2]._id,
        bio: 'Forest honey collector and organic products specialist. Suresh works with tribal communities to sustainably harvest forest products while preserving traditional knowledge.',
        specialty: 'Organic Forest Products',
        skills: ['Honey Collection', 'Organic Farming', 'Forest Products'],
        experience: {
          years: 12,
          description: 'Expert in sustainable forest product collection'
        },
        location: {
          address: 'Forest Road, Gumla',
          city: 'Gumla',
          state: 'Jharkhand',
          pincode: '835207'
        },
        contact: {
          phone: '9876543212',
          email: 'suresh@example.com'
        },
        businessInfo: {
          businessName: 'Forest Honey Collective',
          businessType: 'collective'
        },
        isVerified: true,
        isFeatured: false,
        joinedDate: new Date('2021-03-10')
      },
      {
        user: users[3]._id,
        bio: 'Professional photographer specializing in cultural and wildlife photography. Meera captures the essence of Jharkhand\'s natural beauty and tribal culture.',
        specialty: 'Cultural Photography',
        skills: ['Cultural Photography', 'Wildlife Photography', 'Documentary'],
        experience: {
          years: 8,
          description: 'Professional photographer with cultural expertise'
        },
        location: {
          address: 'Camera Lane, Ranchi',
          city: 'Ranchi',
          state: 'Jharkhand',
          pincode: '834001'
        },
        contact: {
          phone: '9876543213',
          email: 'meera@example.com'
        },
        businessInfo: {
          businessName: 'Meera Photography Studio',
          businessType: 'individual'
        },
        isVerified: true,
        isFeatured: true,
        joinedDate: new Date('2020-11-05')
      },
      {
        user: users[4]._id,
        bio: 'Traditional folk dance performer and instructor. Lakshmi specializes in Santhali and Munda folk dances, teaching authentic cultural expressions.',
        specialty: 'Folk Dance Performance',
        skills: ['Santhali Dance', 'Munda Dance', 'Cultural Performance'],
        experience: {
          years: 10,
          description: 'Expert in traditional folk dance forms'
        },
        location: {
          address: 'Dance Street, Dumka',
          city: 'Dumka',
          state: 'Jharkhand',
          pincode: '814101'
        },
        contact: {
          phone: '9876543214',
          email: 'lakshmi@example.com'
        },
        businessInfo: {
          businessName: 'Cultural Dance Center',
          businessType: 'individual'
        },
        isVerified: true,
        isFeatured: false,
        joinedDate: new Date('2021-06-15')
      },
      {
        user: users[5]._id,
        bio: 'Master potter creating traditional clay artifacts and conducting pottery workshops. Ram teaches ancient pottery techniques to preserve cultural heritage.',
        specialty: 'Traditional Pottery',
        skills: ['Pottery Making', 'Clay Work', 'Traditional Techniques'],
        experience: {
          years: 18,
          description: 'Master potter with traditional knowledge'
        },
        location: {
          address: 'Pottery Lane, Jamshedpur',
          city: 'Jamshedpur',
          state: 'Jharkhand',
          pincode: '831001'
        },
        contact: {
          phone: '9876543215',
          email: 'ram@example.com'
        },
        businessInfo: {
          businessName: 'Clay Art Studio',
          businessType: 'individual'
        },
        isVerified: true,
        isFeatured: false,
        joinedDate: new Date('2020-09-12')
      },
      {
        user: users[6]._id,
        bio: 'Local heritage guide with deep knowledge of Jharkhand\'s historical sites, temples, and cultural landmarks. Vikram provides authentic cultural experiences.',
        specialty: 'Heritage Tourism',
        skills: ['Heritage Guiding', 'Cultural Interpretation', 'Local History'],
        experience: {
          years: 14,
          description: 'Expert heritage guide and cultural interpreter'
        },
        location: {
          address: 'Temple Road, Deoghar',
          city: 'Deoghar',
          state: 'Jharkhand',
          pincode: '814112'
        },
        contact: {
          phone: '9876543216',
          email: 'vikram@example.com'
        },
        businessInfo: {
          businessName: 'Heritage Tours Jharkhand',
          businessType: 'individual'
        },
        isVerified: true,
        isFeatured: true,
        joinedDate: new Date('2019-12-01')
      }
    ]);

    console.log('🎨 Created artisans');

    // Create products
    const products = await Product.create([
      {
        name: 'Traditional Dhokra Elephant',
        description: 'Handcrafted bronze metal casting by tribal artisans using ancient lost-wax technique. This beautiful elephant figurine represents traditional Jharkhand craftsmanship.',
        price: 1200,
        originalPrice: 1500,
        category: 'handicrafts',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            alt: 'Traditional Dhokra Elephant',
            isPrimary: true
          }
        ],
        seller: users[0]._id,
        location: 'Khunti',
        tags: ['Eco-friendly', 'Fair Trade', 'Handmade'],
        specifications: {
          material: 'Bronze',
          dimensions: '8x6x4 inches',
          weight: '500g',
          color: 'Bronze',
          careInstructions: 'Clean with soft cloth, avoid water'
        },
        inventory: {
          quantity: 5,
          sku: 'DHK-ELE-001',
          trackInventory: true
        },
        ratings: {
          average: 4.8,
          count: 124
        },
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Handwoven Tussar Silk Saree',
        description: 'Premium quality silk saree with traditional tribal motifs. Handwoven by expert artisans using traditional techniques passed down through generations.',
        price: 3500,
        originalPrice: 4200,
        category: 'textiles',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop',
            alt: 'Handwoven Tussar Silk Saree',
            isPrimary: true
          }
        ],
        seller: users[1]._id,
        location: 'Chaibasa',
        tags: ['Handwoven', 'Premium', 'Traditional'],
        specifications: {
          material: 'Tussar Silk',
          dimensions: '5.5 meters',
          weight: '300g',
          color: 'Golden Yellow',
          careInstructions: 'Dry clean only'
        },
        inventory: {
          quantity: 3,
          sku: 'TSS-SAR-001',
          trackInventory: true
        },
        ratings: {
          average: 4.7,
          count: 203
        },
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Organic Forest Honey',
        description: 'Pure forest honey collected by tribal communities from the pristine forests of Jharkhand. Natural, unprocessed, and rich in nutrients.',
        price: 450,
        originalPrice: null,
        category: 'food',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
            alt: 'Organic Forest Honey',
            isPrimary: true
          }
        ],
        seller: users[2]._id,
        location: 'Gumla',
        tags: ['Organic', 'Natural', 'Tribal'],
        specifications: {
          material: 'Pure Honey',
          dimensions: '500ml jar',
          weight: '600g',
          color: 'Golden',
          careInstructions: 'Store in cool, dry place'
        },
        inventory: {
          quantity: 20,
          sku: 'HNY-ORG-001',
          trackInventory: true
        },
        ratings: {
          average: 4.9,
          count: 92
        },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Bamboo Home Decor Set',
        description: 'Eco-friendly bamboo items for modern homes. Handcrafted by skilled artisans using sustainable bamboo materials.',
        price: 1800,
        originalPrice: 2100,
        category: 'home-decor',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
            alt: 'Bamboo Home Decor Set',
            isPrimary: true
          }
        ],
        seller: users[0]._id,
        location: 'Khunti',
        tags: ['Sustainable', 'Modern', 'Bamboo'],
        specifications: {
          material: 'Bamboo',
          dimensions: 'Various sizes',
          weight: '800g',
          color: 'Natural Bamboo',
          careInstructions: 'Clean with damp cloth'
        },
        inventory: {
          quantity: 8,
          sku: 'BAM-DEC-001',
          trackInventory: true
        },
        ratings: {
          average: 4.6,
          count: 156
        },
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Tribal Cooking Experience',
        description: 'Learn authentic Santhali recipes with local families. Experience traditional cooking methods and taste authentic tribal cuisine.',
        price: 800,
        originalPrice: null,
        category: 'experiences',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
            alt: 'Tribal Cooking Experience',
            isPrimary: true
          }
        ],
        seller: users[4]._id,
        location: 'Dumka',
        tags: ['Cultural', 'Food', 'Group Activity'],
        specifications: {
          material: 'Experience',
          dimensions: '2-3 hours',
          weight: 'N/A',
          color: 'N/A',
          careInstructions: 'N/A'
        },
        inventory: {
          quantity: 10,
          sku: 'EXP-COO-001',
          trackInventory: true
        },
        ratings: {
          average: 4.9,
          count: 87
        },
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Pottery Workshop Experience',
        description: '2-hour hands-on pottery making session. Learn traditional techniques from master craftsmen and create your own clay artifacts.',
        price: 600,
        originalPrice: null,
        category: 'experiences',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            alt: 'Pottery Workshop Experience',
            isPrimary: true
          }
        ],
        seller: users[5]._id,
        location: 'Jamshedpur',
        tags: ['Art', 'Hands-on', 'Creative'],
        specifications: {
          material: 'Clay',
          dimensions: '2 hours',
          weight: 'N/A',
          color: 'N/A',
          careInstructions: 'N/A'
        },
        inventory: {
          quantity: 15,
          sku: 'EXP-POT-001',
          trackInventory: true
        },
        ratings: {
          average: 4.8,
          count: 67
        },
        isActive: true,
        isFeatured: false
      }
    ]);

    console.log('🛍️ Created products');

    // Create services
    const services = await Service.create([
      {
        artisan: artisans[3]._id,
        name: 'Cultural Photography Session',
        description: 'Professional photography session capturing traditional tribal culture, festivals, and daily life. Perfect for documenting your Jharkhand experience.',
        category: 'photography',
        pricePerHour: 1500,
        duration: {
          min: 2,
          max: 4,
          unit: 'hours'
        },
        maxParticipants: 6,
        minParticipants: 1,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
            alt: 'Cultural Photography Session',
            isPrimary: true
          }
        ],
        location: {
          type: 'mobile',
          address: 'Various locations in Jharkhand',
          city: 'Ranchi',
          state: 'Jharkhand'
        },
        requirements: {
          materials: ['Camera equipment provided'],
          equipment: ['Professional camera', 'Lighting equipment'],
          skills: ['Basic photography knowledge helpful'],
          ageRestriction: {
            min: 12,
            max: 80
          }
        },
        inclusions: ['Professional photographer', 'Equipment', 'Photo editing', 'Digital copies'],
        exclusions: ['Transportation', 'Meals', 'Printing'],
        tags: ['Photography', 'Cultural', 'Professional'],
        ratings: {
          average: 4.7,
          count: 45
        },
        isActive: true,
        isFeatured: true
      },
      {
        artisan: artisans[4]._id,
        name: 'Traditional Folk Dance Performance',
        description: 'Experience authentic Santhali and Munda folk dances performed by local artists. Learn basic steps and understand the cultural significance.',
        category: 'folk-art',
        pricePerHour: 800,
        duration: {
          min: 1,
          max: 2,
          unit: 'hours'
        },
        maxParticipants: 15,
        minParticipants: 5,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
            alt: 'Traditional Folk Dance Performance',
            isPrimary: true
          }
        ],
        location: {
          type: 'fixed',
          address: 'Cultural Dance Center, Dumka',
          city: 'Dumka',
          state: 'Jharkhand'
        },
        requirements: {
          materials: ['Traditional costumes provided'],
          equipment: ['Sound system', 'Traditional instruments'],
          skills: ['No prior experience required'],
          ageRestriction: {
            min: 8,
            max: 70
          }
        },
        inclusions: ['Performance', 'Costume', 'Basic instruction', 'Cultural explanation'],
        exclusions: ['Transportation', 'Meals'],
        tags: ['Dance', 'Cultural', 'Performance'],
        ratings: {
          average: 4.8,
          count: 32
        },
        isActive: true,
        isFeatured: false
      },
      {
        artisan: artisans[5]._id,
        name: 'Pottery Making Workshop',
        description: 'Hands-on pottery workshop where you\'ll learn traditional techniques from master craftsmen. Create your own clay artifacts to take home.',
        category: 'craft-instruction',
        pricePerHour: 600,
        duration: {
          min: 2,
          max: 3,
          unit: 'hours'
        },
        maxParticipants: 8,
        minParticipants: 2,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            alt: 'Pottery Making Workshop',
            isPrimary: true
          }
        ],
        location: {
          type: 'fixed',
          address: 'Clay Art Studio, Jamshedpur',
          city: 'Jamshedpur',
          state: 'Jharkhand'
        },
        requirements: {
          materials: ['Clay', 'Tools', 'Aprons'],
          equipment: ['Pottery wheel', 'Kiln', 'Tools'],
          skills: ['No prior experience required'],
          ageRestriction: {
            min: 10,
            max: 80
          }
        },
        inclusions: ['Materials', 'Tools', 'Instruction', 'Firing', 'Take home artifacts'],
        exclusions: ['Transportation', 'Meals'],
        tags: ['Pottery', 'Hands-on', 'Creative'],
        ratings: {
          average: 4.6,
          count: 28
        },
        isActive: true,
        isFeatured: false
      },
      {
        artisan: artisans[6]._id,
        name: 'Local Heritage Tour Guide',
        description: 'Expert local guide for heritage sites, temples, and cultural landmarks. Learn about Jharkhand\'s rich history and traditions.',
        category: 'local-guide',
        pricePerHour: 500,
        duration: {
          min: 4,
          max: 6,
          unit: 'hours'
        },
        maxParticipants: 10,
        minParticipants: 1,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400&h=300&fit=crop',
            alt: 'Local Heritage Tour Guide',
            isPrimary: true
          }
        ],
        location: {
          type: 'mobile',
          address: 'Various heritage sites',
          city: 'Deoghar',
          state: 'Jharkhand'
        },
        requirements: {
          materials: ['Comfortable walking shoes'],
          equipment: ['Transportation arranged'],
          skills: ['No prior knowledge required'],
          ageRestriction: {
            min: 12,
            max: 80
          }
        },
        inclusions: ['Expert guide', 'Historical information', 'Cultural insights', 'Site visits'],
        exclusions: ['Transportation', 'Meals', 'Entry fees'],
        tags: ['Heritage', 'Tour', 'Cultural'],
        ratings: {
          average: 4.9,
          count: 67
        },
        isActive: true,
        isFeatured: true
      }
    ]);

    console.log('🎯 Created services');

    // Create sample bookings
    const bookings = await Booking.create([
      {
        user: users[7]._id,
        service: services[0]._id,
        artisan: artisans[3]._id,
        bookingDetails: {
          date: new Date('2024-02-15'),
          startTime: '10:00',
          endTime: '12:00',
          duration: 2,
          participants: 2,
          location: 'Ranchi Heritage Sites',
          specialRequests: 'Focus on cultural ceremonies'
        },
        contactInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543217'
        },
        pricing: {
          hourlyRate: 1500,
          duration: 2,
          subtotal: 3000,
          taxes: 540,
          fees: 150,
          total: 3690
        },
        payment: {
          status: 'paid',
          method: 'upi',
          transactionId: 'TXN123456789',
          paymentDate: new Date()
        },
        status: 'confirmed'
      },
      {
        user: users[8]._id,
        service: services[3]._id,
        artisan: artisans[6]._id,
        bookingDetails: {
          date: new Date('2024-02-20'),
          startTime: '09:00',
          endTime: '15:00',
          duration: 6,
          participants: 4,
          location: 'Deoghar Temple Complex',
          specialRequests: 'Include lunch break'
        },
        contactInfo: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '9876543218'
        },
        pricing: {
          hourlyRate: 500,
          duration: 6,
          subtotal: 3000,
          taxes: 540,
          fees: 150,
          total: 3690
        },
        payment: {
          status: 'paid',
          method: 'card',
          transactionId: 'TXN987654321',
          paymentDate: new Date()
        },
        status: 'confirmed'
      }
    ]);

    console.log('📅 Created bookings');

    // Add some reviews
    const productReviews = [
      {
        user: users[7]._id,
        rating: 5,
        comment: 'Amazing craftsmanship! The elephant is beautifully detailed.',
        images: []
      },
      {
        user: users[8]._id,
        rating: 4,
        comment: 'Great quality saree, love the traditional motifs.',
        images: []
      }
    ];

    const serviceReviews = [
      {
        user: users[7]._id,
        booking: bookings[0]._id,
        rating: 5,
        comment: 'Excellent photography session! Meera captured beautiful moments.',
        images: []
      },
      {
        user: users[8]._id,
        booking: bookings[1]._id,
        rating: 5,
        comment: 'Vikram is an amazing guide with deep knowledge of local heritage.',
        images: []
      }
    ];

    // Add reviews to products
    products[0].reviews.push(productReviews[0]);
    products[1].reviews.push(productReviews[1]);
    await products[0].save();
    await products[1].save();

    // Add reviews to services
    services[0].reviews.push(serviceReviews[0]);
    services[3].reviews.push(serviceReviews[1]);
    await services[0].save();
    await services[3].save();

    console.log('⭐ Added reviews');

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${artisans.length} artisans`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${services.length} services`);
    console.log(`   - ${bookings.length} bookings`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedData();
