import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import HotelBookingModal from "@/components/marketplace/HotelBookingModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
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
  ChevronRight,
  Wifi,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  TreePine,
  Mountain,
  Home,
  Sparkles,
  PartyPopper,
  Baby,
  Briefcase,
  Heart as HeartIcon,
  Eye
} from "lucide-react";

const Hotels = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isHotelBookingModalOpen, setIsHotelBookingModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const hotels = [
    {
      id: 1,
      name: "Ranchi Heritage Hotel",
      description: "Luxury heritage hotel in the heart of Ranchi with traditional Jharkhand architecture and modern amenities",
      price: 4500,
      originalPrice: 5500,
      rating: 4.6,
      reviews: 234,
      location: "Ranchi",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Pool", "Restaurant", "Spa", "Parking"],
      category: "Heritage",
      airbnbCategory: "Peaceful",
      verified: true,
      distance: "2.5 km from city center",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 2,
      name: "Jamshedpur Business Hotel",
      description: "Modern business hotel with conference facilities and excellent connectivity to industrial areas",
      price: 3200,
      originalPrice: 3800,
      rating: 4.4,
      reviews: 189,
      location: "Jamshedpur",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Conference Room", "Restaurant", "Gym", "Parking"],
      category: "Business",
      airbnbCategory: "Business",
      verified: true,
      distance: "1.8 km from railway station",
      images: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 3,
      name: "Dumka Eco Resort",
      description: "Eco-friendly resort surrounded by nature, perfect for nature lovers and cultural enthusiasts",
      price: 2800,
      originalPrice: 3200,
      rating: 4.7,
      reviews: 156,
      location: "Dumka",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Nature View", "Restaurant", "Cultural Tours", "Parking"],
      category: "Eco Resort",
      airbnbCategory: "Peaceful",
      verified: true,
      distance: "5.2 km from city center",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 4,
      name: "Deoghar Temple Stay",
      description: "Traditional accommodation near Baidyanath Temple with authentic cultural experience",
      price: 1800,
      originalPrice: 2200,
      rating: 4.5,
      reviews: 298,
      location: "Deoghar",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Temple Access", "Vegetarian Meals", "Cultural Programs", "Parking"],
      category: "Temple Stay",
      airbnbCategory: "Spiritual",
      verified: true,
      distance: "0.5 km from Baidyanath Temple",
      images: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 5,
      name: "Chaibasa Silk Hotel",
      description: "Boutique hotel showcasing local silk culture with handwoven textiles and traditional decor",
      price: 3500,
      originalPrice: 4200,
      rating: 4.8,
      reviews: 167,
      location: "Chaibasa",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Silk Museum", "Restaurant", "Cultural Shows", "Parking"],
      category: "Boutique",
      airbnbCategory: "Unique",
      verified: true,
      distance: "3.1 km from city center",
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 6,
      name: "Hazaribagh Wildlife Lodge",
      description: "Wildlife lodge near Hazaribagh National Park with safari packages and nature activities",
      price: 4200,
      originalPrice: 4800,
      rating: 4.6,
      reviews: 145,
      location: "Hazaribagh",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Safari Tours", "Restaurant", "Nature Walks", "Parking"],
      category: "Wildlife",
      airbnbCategory: "Adventure",
      verified: true,
      distance: "8.5 km from national park",
      images: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 7,
      name: "Gumla Forest Retreat",
      description: "Secluded forest retreat offering authentic tribal experiences and organic forest products",
      price: 2500,
      originalPrice: 3000,
      rating: 4.7,
      reviews: 98,
      location: "Gumla",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Forest View", "Organic Meals", "Tribal Tours", "Parking"],
      category: "Forest Retreat",
      airbnbCategory: "Peaceful",
      verified: true,
      distance: "12 km from city center",
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 8,
      name: "Khunti Craft Hotel",
      description: "Unique hotel featuring local handicrafts and traditional tribal architecture",
      price: 2200,
      originalPrice: 2600,
      rating: 4.5,
      reviews: 123,
      location: "Khunti",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Craft Workshop", "Restaurant", "Cultural Tours", "Parking"],
      category: "Cultural",
      airbnbCategory: "Unique",
      verified: true,
      distance: "4.2 km from city center",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 9,
      name: "Ranchi Party Palace",
      description: "Vibrant hotel with rooftop bar, live music, and party atmosphere perfect for young travelers",
      price: 3800,
      originalPrice: 4500,
      rating: 4.3,
      reviews: 89,
      location: "Ranchi",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Rooftop Bar", "Live Music", "Pool", "Parking"],
      category: "Party",
      airbnbCategory: "Party",
      verified: true,
      distance: "1.2 km from city center",
      images: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
      ]
    },
    {
      id: 10,
      name: "Jamshedpur Family Resort",
      description: "Family-friendly resort with kids' activities, playground, and spacious rooms",
      price: 2900,
      originalPrice: 3400,
      rating: 4.5,
      reviews: 178,
      location: "Jamshedpur",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
      amenities: ["WiFi", "Kids Playground", "Family Restaurant", "Swimming Pool", "Parking"],
      category: "Family",
      airbnbCategory: "Family",
      verified: true,
      distance: "3.5 km from city center",
      images: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      ]
    }
  ];

  // Airbnb-style categories
  const airbnbCategories = [
    { 
      id: "all", 
      name: "All", 
      icon: Home, 
      count: hotels.length,
      description: "Explore all accommodations"
    },
    { 
      id: "Peaceful", 
      name: "Peaceful", 
      icon: TreePine, 
      count: hotels.filter(h => h.airbnbCategory === "Peaceful").length,
      description: "Tranquil retreats for relaxation"
    },
    { 
      id: "Party", 
      name: "Party", 
      icon: PartyPopper, 
      count: hotels.filter(h => h.airbnbCategory === "Party").length,
      description: "Vibrant places with nightlife"
    },
    { 
      id: "Unique", 
      name: "Unique", 
      icon: Sparkles, 
      count: hotels.filter(h => h.airbnbCategory === "Unique").length,
      description: "One-of-a-kind experiences"
    },
    { 
      id: "Family", 
      name: "Family", 
      icon: Baby, 
      count: hotels.filter(h => h.airbnbCategory === "Family").length,
      description: "Perfect for families with kids"
    },
    { 
      id: "Business", 
      name: "Business", 
      icon: Briefcase, 
      count: hotels.filter(h => h.airbnbCategory === "Business").length,
      description: "Professional accommodations"
    },
    { 
      id: "Adventure", 
      name: "Adventure", 
      icon: Mountain, 
      count: hotels.filter(h => h.airbnbCategory === "Adventure").length,
      description: "Thrilling outdoor experiences"
    },
    { 
      id: "Spiritual", 
      name: "Spiritual", 
      icon: HeartIcon, 
      count: hotels.filter(h => h.airbnbCategory === "Spiritual").length,
      description: "Sacred and mindful stays"
    }
  ];

  // Filtering logic
  const filteredHotels = selectedCategory === "all" 
    ? hotels 
    : hotels.filter(hotel => hotel.airbnbCategory === selectedCategory);

  const searchFilteredHotels = filteredHotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting logic
  const sortedHotels = [...searchFilteredHotels].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const handleBookHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    setIsHotelBookingModalOpen(true);
  };

  const handleConfirmBooking = (bookingData: any) => {
    console.log("Booking confirmed:", bookingData);
    setIsHotelBookingModalOpen(false);
    setSelectedHotel(null);
  };

  const toggleFavorite = (hotelId: number) => {
    setFavorites(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "restaurant":
        return <Utensils className="h-4 w-4" />;
      case "pool":
        return <Waves className="h-4 w-4" />;
      case "gym":
        return <Dumbbell className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Find Your Perfect Stay</h1>
              <p className="text-xl text-blue-100 mb-8">
                Discover unique accommodations across Jharkhand
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search destinations, hotels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-gray-900"
                    />
                  </div>
                  <Button size="lg" className="px-8">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Explore by category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {airbnbCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 hover:scale-105 ${
                      selectedCategory === category.id
                        ? "bg-black text-white shadow-lg"
                        : "bg-white hover:shadow-md border border-gray-200"
                    }`}
                  >
                    <IconComponent className="h-6 w-6 mb-2" />
                    <div className="text-sm font-medium">{category.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{category.count} places</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location-based sections like Airbnb */}
          <div className="space-y-8">
            {/* Peaceful Section */}
            {selectedCategory === "all" || selectedCategory === "Peaceful" ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Peaceful retreats in Jharkhand</h3>
                  <Button variant="ghost" className="text-sm">
                    Show all <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {hotels.filter(hotel => hotel.airbnbCategory === "Peaceful").slice(0, 4).map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <div className="relative">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-48 object-cover"
                        />
                        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
                          <Heart 
                            className={`h-5 w-5 ${
                              favorites.includes(hotel.id) 
                                ? "fill-red-500 text-red-500" 
                                : "text-gray-600"
                            }`} 
                          />
                        </button>
                        {hotel.verified && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white text-black">
                              <Verified className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1">{hotel.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{hotel.location}</span>
                              <span>•</span>
                              <span>{hotel.distance}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{hotel.rating}</span>
                            </div>
                            <div className="text-xs text-gray-500">({hotel.reviews} reviews)</div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {hotel.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {hotel.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                              {getAmenityIcon(amenity)}
                              {amenity}
                            </Badge>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{hotel.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-lg font-bold">₹{hotel.price.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">per night</div>
                          </div>
                          <Button 
                            onClick={() => handleBookHotel(hotel)}
                            className="bg-black hover:bg-gray-800"
                          >
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Party Section */}
            {selectedCategory === "all" || selectedCategory === "Party" ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Party destinations in Jharkhand</h3>
                  <Button variant="ghost" className="text-sm">
                    Show all <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {hotels.filter(hotel => hotel.airbnbCategory === "Party").slice(0, 4).map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <div className="relative">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-48 object-cover"
                        />
                        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
                          <Heart 
                            className={`h-5 w-5 ${
                              favorites.includes(hotel.id) 
                                ? "fill-red-500 text-red-500" 
                                : "text-gray-600"
                            }`} 
                          />
                        </button>
                        {hotel.verified && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white text-black">
                              <Verified className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1">{hotel.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{hotel.location}</span>
                              <span>•</span>
                              <span>{hotel.distance}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{hotel.rating}</span>
                            </div>
                            <div className="text-xs text-gray-500">({hotel.reviews} reviews)</div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {hotel.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {hotel.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                              {getAmenityIcon(amenity)}
                              {amenity}
                            </Badge>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{hotel.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-lg font-bold">₹{hotel.price.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">per night</div>
                          </div>
                          <Button 
                            onClick={() => handleBookHotel(hotel)}
                            className="bg-black hover:bg-gray-800"
                          >
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Unique Section */}
            {selectedCategory === "all" || selectedCategory === "Unique" ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Unique stays in Jharkhand</h3>
                  <Button variant="ghost" className="text-sm">
                    Show all <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {hotels.filter(hotel => hotel.airbnbCategory === "Unique").slice(0, 4).map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <div className="relative">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-48 object-cover"
                        />
                        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
                          <Heart 
                            className={`h-5 w-5 ${
                              favorites.includes(hotel.id) 
                                ? "fill-red-500 text-red-500" 
                                : "text-gray-600"
                            }`} 
                          />
                        </button>
                        {hotel.verified && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white text-black">
                              <Verified className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1">{hotel.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{hotel.location}</span>
                              <span>•</span>
                              <span>{hotel.distance}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{hotel.rating}</span>
                            </div>
                            <div className="text-xs text-gray-500">({hotel.reviews} reviews)</div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {hotel.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {hotel.amenities.slice(0, 3).map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                              {getAmenityIcon(amenity)}
                              {amenity}
                            </Badge>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{hotel.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-lg font-bold">₹{hotel.price.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">per night</div>
                          </div>
                          <Button 
                            onClick={() => handleBookHotel(hotel)}
                            className="bg-black hover:bg-gray-800"
                          >
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

        </div>

        {/* Hotel Booking Modal */}
        <HotelBookingModal
          isOpen={isHotelBookingModalOpen}
          onClose={() => setIsHotelBookingModalOpen(false)}
          hotel={selectedHotel}
          onConfirmBooking={handleConfirmBooking}
        />
      </div>
    </Layout>
  );
};

export default Hotels;
