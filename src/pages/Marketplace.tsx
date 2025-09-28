import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/marketplace/ProductCard";
import ArtisanCard from "@/components/marketplace/ArtisanCard";
import ServiceCard from "@/components/marketplace/ServiceCard";
import BookingModal from "@/components/marketplace/BookingModal";
import ProductDetailModal from "@/components/marketplace/ProductDetailModal";
import Cart from "@/components/marketplace/Cart";
import { CartProvider } from "@/contexts/CartContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart, 
  MapPin,
  Verified,
  Grid3X3,
  List,
  SortAsc,
  Users,
  Camera,
  Music,
  Palette,
  Compass,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import marketplaceHero from "@/assets/marketplace-hero.jpg";

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"products" | "artisans" | "services">("products");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Hero carousel state
  const [heroApi, setHeroApi] = useState<CarouselApi | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroCarouselData = [
    {
      id: 1,
      title: "Discover Authentic",
      subtitle: "Jharkhand Crafts",
      description: "Explore handcrafted treasures from local artisans",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop",
      buttonText: "Shop Now",
      buttonLink: "#products"
    },
    {
      id: 2,
      title: "Meet Master",
      subtitle: "Artisans",
      description: "Connect with skilled craftspeople preserving traditions",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop",
      buttonText: "View Profiles",
      buttonLink: "#artisans"
    },
    {
      id: 3,
      title: "Hire Local",
      subtitle: "Experts",
      description: "Book photography, workshops, and cultural experiences",
      image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1200&h=600&fit=crop",
      buttonText: "Book Services",
      buttonLink: "#services"
    },
    {
      id: 4,
      title: "Stay in",
      subtitle: "Authentic Hotels",
      description: "Experience Jharkhand's hospitality with unique accommodations",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop",
      buttonText: "Book Hotels",
      buttonLink: "/hotels"
    }
  ];

  const products = [
    {
      id: 1,
      title: "Traditional Dhokra Elephant",
      description: "Handcrafted bronze metal casting by tribal artisans using ancient lost-wax technique",
      price: "₹1,200",
      originalPrice: "₹1,500",
      rating: 4.8,
      reviews: 124,
      vendor: "Munda Craft Collective",
      location: "Khunti",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      verified: true,
      category: "handicrafts",
      tags: ["Eco-friendly", "Fair Trade", "Handmade"]
    },
    {
      id: 2,
      title: "Handwoven Tussar Silk Saree",
      description: "Premium quality silk saree with traditional tribal motifs and golden threads",
      price: "₹3,500",
      originalPrice: "₹4,200",
      rating: 4.7,
      reviews: 203,
      vendor: "Jharkhand Silk Weavers",
      location: "Chaibasa",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop",
      verified: true,
      category: "textiles",
      tags: ["Handwoven", "Premium", "Traditional"]
    },
    {
      id: 3,
      title: "Bamboo Home Decor Set",
      description: "Eco-friendly bamboo items including baskets, lamps, and wall hangings",
      price: "₹1,800",
      originalPrice: "₹2,100",
      rating: 4.6,
      reviews: 156,
      vendor: "Green Bamboo Crafts",
      location: "Ranchi",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      verified: true,
      category: "home-decor",
      tags: ["Sustainable", "Modern", "Bamboo"]
    },
    {
      id: 4,
      title: "Organic Forest Honey",
      description: "Pure forest honey collected by tribal communities from pristine forests",
      price: "₹450/jar",
      originalPrice: null,
      rating: 4.9,
      reviews: 92,
      vendor: "Forest Honey Collective",
      location: "Gumla",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop",
      verified: true,
      category: "food",
      tags: ["Organic", "Natural", "Tribal"]
    },
    {
      id: 5,
      title: "Tribal Wooden Masks",
      description: "Traditional wooden masks used in tribal festivals and ceremonies",
      price: "₹800",
      originalPrice: "₹1,000",
      rating: 4.5,
      reviews: 78,
      vendor: "Tribal Art Collective",
      location: "Hazaribagh",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      verified: true,
      category: "handicrafts",
      tags: ["Cultural", "Festival", "Wooden"]
    },
    {
      id: 6,
      title: "Handmade Terracotta Pottery",
      description: "Traditional terracotta pots and decorative items made by skilled potters",
      price: "₹600",
      originalPrice: "₹750",
      rating: 4.7,
      reviews: 134,
      vendor: "Clay Art Studio",
      location: "Jamshedpur",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      verified: true,
      category: "handicrafts",
      tags: ["Terracotta", "Traditional", "Functional"]
    },
    {
      id: 7,
      title: "Tribal Jewelry Set",
      description: "Authentic tribal jewelry made with silver and traditional beads",
      price: "₹2,200",
      originalPrice: "₹2,800",
      rating: 4.8,
      reviews: 89,
      vendor: "Tribal Jewelry Co.",
      location: "Ranchi",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      verified: true,
      category: "jewelry",
      tags: ["Silver", "Tribal", "Authentic"]
    },
    {
      id: 8,
      title: "Handwoven Cotton Dupatta",
      description: "Lightweight cotton dupatta with traditional block prints and natural dyes",
      price: "₹1,100",
      originalPrice: "₹1,400",
      rating: 4.6,
      reviews: 167,
      vendor: "Cotton Weavers Guild",
      location: "Dhanbad",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop",
      verified: true,
      category: "textiles",
      tags: ["Cotton", "Block Print", "Natural Dye"]
    },
    {
      id: 9,
      title: "Tribal Cooking Experience",
      description: "Learn authentic Santhali recipes with local families in their homes",
      price: "₹800/person",
      originalPrice: null,
      rating: 4.9,
      reviews: 87,
      vendor: "Santhali Cultural Center",
      location: "Dumka",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      verified: true,
      category: "experiences",
      tags: ["Cultural", "Food", "Group Activity"]
    },
    {
      id: 10,
      title: "Pottery Workshop Experience",
      description: "2-hour hands-on pottery making session with master craftsmen",
      price: "₹600/person",
      originalPrice: null,
      rating: 4.8,
      reviews: 67,
      vendor: "Clay Art Studio",
      location: "Jamshedpur",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      verified: true,
      category: "experiences",
      tags: ["Art", "Hands-on", "Creative"]
    },
    {
      id: 11,
      title: "Bamboo Wind Chimes",
      description: "Musical wind chimes made from bamboo with traditional tribal designs",
      price: "₹950",
      originalPrice: "₹1,200",
      rating: 4.4,
      reviews: 45,
      vendor: "Bamboo Crafts Co.",
      location: "Chaibasa",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      verified: true,
      category: "home-decor",
      tags: ["Musical", "Bamboo", "Decorative"]
    },
    {
      id: 12,
      title: "Organic Spice Collection",
      description: "Fresh spices grown organically by tribal farmers in Jharkhand",
      price: "₹350/set",
      originalPrice: "₹450/set",
      rating: 4.7,
      reviews: 112,
      vendor: "Organic Spice Co.",
      location: "Gumla",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop",
      verified: true,
      category: "food",
      tags: ["Organic", "Fresh", "Tribal"]
    }
  ];

  const categories = [
    { id: "all", name: "All Items", count: products.length },
    { id: "handicrafts", name: "Handicrafts", count: products.filter(p => p.category === "handicrafts").length },
    { id: "textiles", name: "Textiles", count: products.filter(p => p.category === "textiles").length },
    { id: "experiences", name: "Experiences", count: products.filter(p => p.category === "experiences").length },
    { id: "food", name: "Food & Spices", count: products.filter(p => p.category === "food").length },
    { id: "home-decor", name: "Home Decor", count: products.filter(p => p.category === "home-decor").length },
    { id: "jewelry", name: "Jewelry", count: products.filter(p => p.category === "jewelry").length }
  ];

  const artisans = [
    {
      id: 1,
      name: "Rajesh Munda",
      bio: "Master craftsman specializing in traditional Dhokra metal casting. With over 20 years of experience, Rajesh creates stunning bronze artifacts using ancient lost-wax technique passed down through generations.",
      specialty: "Traditional Metal Crafts",
      location: "Khunti",
      rating: 4.9,
      reviews: 124,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      isFeatured: true,
      productsCount: 25,
      servicesCount: 3,
      joinedDate: "2020-01-15",
      verified: true
    },
    {
      id: 2,
      name: "Priya Devi",
      bio: "Expert weaver creating beautiful Tussar silk sarees with traditional tribal motifs. Her work has been featured in several fashion shows across India and she has trained over 50 young weavers.",
      specialty: "Handwoven Textiles",
      location: "Chaibasa",
      rating: 4.8,
      reviews: 203,
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop",
      isFeatured: true,
      productsCount: 18,
      servicesCount: 2,
      joinedDate: "2019-08-22",
      verified: true
    },
    {
      id: 3,
      name: "Suresh Oraon",
      bio: "Forest honey collector and organic products specialist. Suresh works with tribal communities to sustainably harvest forest products while preserving traditional knowledge and supporting local livelihoods.",
      specialty: "Organic Forest Products",
      location: "Gumla",
      rating: 4.9,
      reviews: 92,
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      isFeatured: false,
      productsCount: 12,
      servicesCount: 1,
      joinedDate: "2021-03-10",
      verified: true
    },
    {
      id: 4,
      name: "Meera Singh",
      bio: "Professional photographer specializing in cultural and wildlife photography. Meera captures the essence of Jharkhand's natural beauty and tribal culture, with her work published in National Geographic.",
      specialty: "Cultural Photography",
      location: "Ranchi",
      rating: 4.7,
      reviews: 156,
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      isFeatured: true,
      productsCount: 0,
      servicesCount: 4,
      joinedDate: "2020-11-05",
      verified: true
    },
    {
      id: 5,
      name: "Lakshmi Devi",
      bio: "Traditional folk dance performer and instructor specializing in Santhali and Munda folk dances. She has performed at international cultural festivals and teaches authentic cultural expressions.",
      specialty: "Folk Dance Performance",
      location: "Dumka",
      rating: 4.8,
      reviews: 67,
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      isFeatured: false,
      productsCount: 0,
      servicesCount: 2,
      joinedDate: "2021-06-15",
      verified: true
    },
    {
      id: 6,
      name: "Ram Kumar",
      bio: "Master potter creating traditional clay artifacts and conducting pottery workshops. Ram teaches ancient pottery techniques to preserve cultural heritage and has been featured in pottery exhibitions.",
      specialty: "Traditional Pottery",
      location: "Jamshedpur",
      rating: 4.6,
      reviews: 89,
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      isFeatured: false,
      productsCount: 15,
      servicesCount: 3,
      joinedDate: "2020-09-12",
      verified: true
    },
    {
      id: 7,
      name: "Vikram Singh",
      bio: "Local heritage guide with deep knowledge of Jharkhand's historical sites, temples, and cultural landmarks. Vikram provides authentic cultural experiences and has guided over 1000 tourists.",
      specialty: "Heritage Tourism",
      location: "Deoghar",
      rating: 4.9,
      reviews: 234,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      isFeatured: true,
      productsCount: 0,
      servicesCount: 5,
      joinedDate: "2019-12-01",
      verified: true
    },
    {
      id: 8,
      name: "Sunita Oraon",
      bio: "Expert in tribal jewelry making using traditional techniques with silver and natural materials. Her jewelry has been showcased in fashion weeks and she supports women's empowerment through craft training.",
      specialty: "Tribal Jewelry",
      location: "Hazaribagh",
      rating: 4.7,
      reviews: 145,
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      isFeatured: false,
      productsCount: 22,
      servicesCount: 2,
      joinedDate: "2020-05-20",
      verified: true
    },
    {
      id: 9,
      name: "Anil Mahato",
      bio: "Bamboo craftsman creating eco-friendly home decor and functional items. Anil specializes in sustainable bamboo products and has trained communities in bamboo craft techniques.",
      specialty: "Bamboo Crafts",
      location: "Chaibasa",
      rating: 4.5,
      reviews: 78,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      isFeatured: false,
      productsCount: 18,
      servicesCount: 1,
      joinedDate: "2021-02-14",
      verified: true
    },
    {
      id: 10,
      name: "Rekha Devi",
      bio: "Master of traditional wooden mask making used in tribal festivals. Rekha creates authentic ceremonial masks and teaches the cultural significance of these traditional art forms.",
      specialty: "Wooden Mask Making",
      location: "Hazaribagh",
      rating: 4.6,
      reviews: 56,
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      isFeatured: false,
      productsCount: 12,
      servicesCount: 2,
      joinedDate: "2021-08-10",
      verified: true
    }
  ];

  const services = [
    {
      id: 1,
      serviceName: "Cultural Photography Session",
      description: "Professional photography session capturing traditional tribal culture, festivals, and daily life. Perfect for documenting your Jharkhand experience with stunning visuals.",
      pricePerHour: 1500,
      artisanId: 4,
      artisanName: "Meera Singh",
      artisanImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      artisanRating: 4.7,
      artisanLocation: "Ranchi",
      category: "Photography",
      duration: "2-4 hours",
      maxParticipants: 6,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
      tags: ["Photography", "Cultural", "Professional"]
    },
    {
      id: 2,
      serviceName: "Traditional Folk Dance Performance",
      description: "Experience authentic Santhali and Munda folk dances performed by local artists. Learn basic steps and understand the cultural significance of these traditional art forms.",
      pricePerHour: 800,
      artisanId: 5,
      artisanName: "Lakshmi Devi",
      artisanImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      artisanRating: 4.8,
      artisanLocation: "Dumka",
      category: "Folk Art",
      duration: "1-2 hours",
      maxParticipants: 15,
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop",
      tags: ["Dance", "Cultural", "Performance"]
    },
    {
      id: 3,
      serviceName: "Pottery Making Workshop",
      description: "Hands-on pottery workshop where you'll learn traditional techniques from master craftsmen. Create your own clay artifacts to take home and learn about the cultural heritage.",
      pricePerHour: 600,
      artisanId: 6,
      artisanName: "Ram Kumar",
      artisanImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      artisanRating: 4.6,
      artisanLocation: "Jamshedpur",
      category: "Craft Instruction",
      duration: "2-3 hours",
      maxParticipants: 8,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      tags: ["Pottery", "Hands-on", "Creative"]
    },
    {
      id: 4,
      serviceName: "Local Heritage Tour Guide",
      description: "Expert local guide for heritage sites, temples, and cultural landmarks. Learn about Jharkhand's rich history and traditions with personalized storytelling.",
      pricePerHour: 500,
      artisanId: 7,
      artisanName: "Vikram Singh",
      artisanImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      artisanRating: 4.9,
      artisanLocation: "Deoghar",
      category: "Local Guide",
      duration: "4-6 hours",
      maxParticipants: 10,
      image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400&h=300&fit=crop",
      tags: ["Heritage", "Tour", "Cultural"]
    },
    {
      id: 5,
      serviceName: "Tribal Cooking Class",
      description: "Learn authentic tribal recipes with local families in their traditional kitchens. Experience the warmth of tribal hospitality while mastering traditional cooking techniques.",
      pricePerHour: 400,
      artisanId: 3,
      artisanName: "Suresh Oraon",
      artisanImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      artisanRating: 4.9,
      artisanLocation: "Gumla",
      category: "Cultural Experience",
      duration: "3-4 hours",
      maxParticipants: 8,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      tags: ["Cooking", "Cultural", "Traditional"]
    },
    {
      id: 6,
      serviceName: "Bamboo Craft Workshop",
      description: "Learn traditional bamboo crafting techniques from master craftsmen. Create beautiful eco-friendly items while understanding sustainable practices.",
      pricePerHour: 450,
      artisanId: 9,
      artisanName: "Anil Mahato",
      artisanImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      artisanRating: 4.5,
      artisanLocation: "Chaibasa",
      category: "Craft Instruction",
      duration: "2-3 hours",
      maxParticipants: 6,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      tags: ["Bamboo", "Eco-friendly", "Hands-on"]
    },
    {
      id: 7,
      serviceName: "Tribal Jewelry Making",
      description: "Create authentic tribal jewelry using traditional techniques with silver and natural materials. Learn the cultural significance of each piece.",
      pricePerHour: 700,
      artisanId: 8,
      artisanName: "Sunita Oraon",
      artisanImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      artisanRating: 4.7,
      artisanLocation: "Hazaribagh",
      category: "Craft Instruction",
      duration: "3-4 hours",
      maxParticipants: 5,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      tags: ["Jewelry", "Silver", "Traditional"]
    },
    {
      id: 8,
      serviceName: "Wildlife Photography Tour",
      description: "Capture Jharkhand's diverse wildlife with expert guidance. Visit national parks and wildlife sanctuaries with professional photography tips.",
      pricePerHour: 1200,
      artisanId: 4,
      artisanName: "Meera Singh",
      artisanImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      artisanRating: 4.7,
      artisanLocation: "Ranchi",
      category: "Photography",
      duration: "6-8 hours",
      maxParticipants: 4,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
      tags: ["Wildlife", "Photography", "Nature"]
    },
    {
      id: 9,
      serviceName: "Traditional Mask Making",
      description: "Learn the art of traditional wooden mask making used in tribal festivals. Understand the cultural significance and create your own ceremonial mask.",
      pricePerHour: 550,
      artisanId: 10,
      artisanName: "Rekha Devi",
      artisanImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      artisanRating: 4.6,
      artisanLocation: "Hazaribagh",
      category: "Craft Instruction",
      duration: "4-5 hours",
      maxParticipants: 6,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      tags: ["Mask Making", "Wooden", "Cultural"]
    },
    {
      id: 10,
      serviceName: "Dhokra Metal Casting Workshop",
      description: "Master the ancient art of Dhokra metal casting with traditional lost-wax technique. Create beautiful bronze artifacts under expert guidance.",
      pricePerHour: 800,
      artisanId: 1,
      artisanName: "Rajesh Munda",
      artisanImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      artisanRating: 4.9,
      artisanLocation: "Khunti",
      category: "Craft Instruction",
      duration: "5-6 hours",
      maxParticipants: 4,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      tags: ["Metal Casting", "Bronze", "Traditional"]
    },
    {
      id: 11,
      serviceName: "Textile Weaving Experience",
      description: "Experience traditional handloom weaving techniques with master weavers. Learn about different fabrics and create your own textile piece.",
      pricePerHour: 500,
      artisanId: 2,
      artisanName: "Priya Devi",
      artisanImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop",
      artisanRating: 4.8,
      artisanLocation: "Chaibasa",
      category: "Craft Instruction",
      duration: "3-4 hours",
      maxParticipants: 6,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop",
      tags: ["Weaving", "Textile", "Handloom"]
    },
    {
      id: 12,
      serviceName: "Forest Honey Collection Tour",
      description: "Join tribal communities in sustainable honey collection from pristine forests. Learn about traditional beekeeping and forest conservation.",
      pricePerHour: 300,
      artisanId: 3,
      artisanName: "Suresh Oraon",
      artisanImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      artisanRating: 4.9,
      artisanLocation: "Gumla",
      category: "Cultural Experience",
      duration: "4-5 hours",
      maxParticipants: 8,
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop",
      tags: ["Honey", "Forest", "Sustainable"]
    }
  ];


  // Filtering logic
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const filteredArtisans = artisans.filter(artisan => 
    artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artisan.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artisan.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.artisanName.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // Handler functions
  const handleAddToCart = (productId: number) => {
    setCart(prev => [...prev, productId]);
    // In a real app, you'd make an API call here
    console.log(`Added product ${productId} to cart`);
  };

  const handleToggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleViewDetails = (productId: number) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setIsProductDetailModalOpen(true);
  };

  const handleViewArtisanProfile = (artisanId: number) => {
    // In a real app, you'd navigate to artisan profile page
    console.log(`View profile for artisan ${artisanId}`);
  };

  const handleHireArtisan = (artisanId: number) => {
    // In a real app, you'd navigate to artisan services or booking page
    console.log(`Hire artisan ${artisanId}`);
  };

  const handleBookService = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (bookingData: any) => {
    // In a real app, you'd make an API call to create the booking
    console.log('Booking confirmed:', bookingData);
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };


  // Hero carousel useEffect
  useEffect(() => {
    if (!heroApi) return;
    const onSelect = () => setHeroIndex(heroApi.selectedScrollSnap());
    onSelect();
    heroApi.on("select", onSelect);
    return () => {
      heroApi.off("select", onSelect);
    };
  }, [heroApi]);

  return (
    <CartProvider>
      <Layout>
      {/* Hero Section - Carousel */}
      <div className="h-96 relative">
        <Carousel 
          opts={{ loop: true }} 
          className="w-full h-full" 
          setApi={(api) => setHeroApi(api)}
        >
          <CarouselContent>
            {heroCarouselData.map((slide) => (
              <CarouselItem key={slide.id}>
                <div 
                  className="h-96 flex items-center justify-center text-white relative"
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                      {slide.subtitle}
                    </h2>
                    <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
                      {slide.description}
                    </p>
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="px-8 py-3"
                      onClick={() => {
                        if (slide.buttonLink === "#products") setActiveTab("products");
                        else if (slide.buttonLink === "#artisans") setActiveTab("artisans");
                        else if (slide.buttonLink === "#services") setActiveTab("services");
                        else if (slide.buttonLink === "#hotels") setActiveTab("hotels");
                      }}
                    >
                      {slide.buttonText}
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Arrows */}
          <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/30 h-12 w-12" />
          <CarouselNext className="right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/30 h-12 w-12" />
        </Carousel>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroCarouselData.map((_, i) => (
            <button
              key={i}
              onClick={() => heroApi?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-3 rounded-full transition-all ${
                heroIndex === i ? "bg-white w-8" : "bg-white/50 w-3"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Cart */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === "products" ? "default" : "ghost"}
              onClick={() => setActiveTab("products")}
              className="px-6"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Products ({products.length})
            </Button>
            <Button
              variant={activeTab === "artisans" ? "default" : "ghost"}
              onClick={() => setActiveTab("artisans")}
              className="px-6"
            >
              <Users className="h-4 w-4 mr-2" />
              Artisans ({artisans.length})
            </Button>
            <Button
              variant={activeTab === "services" ? "default" : "ghost"}
              onClick={() => setActiveTab("services")}
              className="px-6"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Hire Services ({services.length})
            </Button>
          </div>
          
          {/* Cart Button */}
          <Button
            variant="outline"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder={`Search for ${activeTab}...`}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              
              {activeTab === "products" && (
              <div className="flex rounded-lg border border-input">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              )}
            </div>
          </div>

          {/* Category Filter - Only for Products */}
          {activeTab === "products" && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="h-9"
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "products" && (
        <div className={`grid gap-6 ${viewMode === "grid" 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "grid-cols-1"
        }`}>
          {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(product.id)}
              />
            ))}
                  </div>
                )}

        {activeTab === "artisans" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtisans.map((artisan) => (
              <ArtisanCard
                key={artisan.id}
                artisan={artisan}
                onViewProfile={handleViewArtisanProfile}
                onHire={handleHireArtisan}
              />
            ))}
                        </div>
                      )}

        {activeTab === "services" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={handleBookService}
                onViewArtisan={handleViewArtisanProfile}
              />
          ))}
        </div>
        )}


        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More {activeTab === "products" ? "Products" : activeTab === "artisans" ? "Artisans" : "Services"}
          </Button>
        </div>

        {/* Featured Artisans Section - Only show on products tab */}
        {activeTab === "products" && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Featured Artisans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artisans.filter(artisan => artisan.isFeatured).map((artisan) => (
                <Card key={artisan.id} className="travel-card">
                <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <img 
                        src={artisan.profileImage}
                        alt={artisan.name}
                        className="w-20 h-20 rounded-full mx-auto object-cover"
                      />
                      {artisan.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                          <Verified className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-yellow-500 text-white text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{artisan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{artisan.specialty}</p>
                  <div className="flex items-center justify-center text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                      <span>{artisan.location}</span>
                    <span className="mx-2">•</span>
                      <span>{artisan.productsCount} products</span>
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{artisan.rating}</span>
                  </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewArtisanProfile(artisan.id)}
                    >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={selectedService}
        onConfirmBooking={handleConfirmBooking}
      />


      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isProductDetailModalOpen}
        onClose={() => setIsProductDetailModalOpen(false)}
        product={selectedProduct}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
      />

      {/* Cart Modal */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      </Layout>
    </CartProvider>
  );
};

export default Marketplace;