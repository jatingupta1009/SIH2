import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  MapPin, 
  Verified, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RotateCcw,
  Share2,
  MessageCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import ImageCarousel from './ImageCarousel';
import RatingStars from './RatingStars';

const ProductDetail = ({ 
  product, 
  onToggleFavorite, 
  isFavorite,
  onClose 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showQA, setShowQA] = useState(false);
  
  const { addToCart } = useCart();

  const discountPercentage = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const stockStatus = product.stock === 0 ? 'out_of_stock' : 
                     product.stock <= 5 ? 'low_stock' : 'in_stock';

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      // Show success feedback
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      // Add to cart first
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      // TODO: Navigate to checkout
      console.log('Proceed to checkout');
      setTimeout(() => setIsBuyingNow(false), 1000);
    } catch (error) {
      console.error('Error buying now:', error);
      setIsBuyingNow(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.shortDescription || product.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-4">
          <ImageCarousel 
            images={product.images || [{ url: product.image, alt: product.title }]}
            selectedIndex={selectedImageIndex}
            onImageSelect={setSelectedImageIndex}
          />
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-6">
          {/* Product Title & Rating */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
            <div className="flex items-center gap-4 mb-3">
              <RatingStars rating={product.ratingAvg || product.rating} />
              <span className="text-sm text-muted-foreground">
                ({product.ratingCount || product.reviews} reviews)
              </span>
              {product.verified && (
                <Badge className="bg-green-100 text-green-800">
                  <Verified className="h-3 w-3 mr-1" />
                  Verified Seller
                </Badge>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.mrp.toLocaleString()}
                  </span>
                  {discountPercentage > 0 && (
                    <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={stockStatus === 'out_of_stock' ? 'destructive' : 
                      stockStatus === 'low_stock' ? 'secondary' : 'default'}
            >
              {stockStatus === 'out_of_stock' ? 'Out of Stock' :
               stockStatus === 'low_stock' ? `Only ${product.stock} left` :
               'In Stock'}
            </Badge>
            {product.stock > 0 && (
              <span className="text-sm text-muted-foreground">
                {product.stock} units available
              </span>
            )}
          </div>

          {/* Seller Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Sold by:</span>
                <span className="text-primary font-semibold">
                  {product.seller?.name || product.vendor}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{product.seller?.location || product.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <RatingStars rating={product.seller?.rating || 4.5} size="sm" />
                <span className="text-sm text-muted-foreground">
                  Seller Rating: {product.seller?.rating || 4.5}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Product Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.attributes.map((attr, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{attr.name}:</span>
                    <span className="font-medium">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Quantity Selector */}
          <div>
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min="1"
                max={product.stock}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onToggleFavorite(product.id)}
                className={isFavorite ? "text-red-500" : ""}
              >
                <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 
                 isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleBuyNow}
              disabled={product.stock === 0 || isBuyingNow}
            >
              {product.stock === 0 ? 'Out of Stock' :
               isBuyingNow ? 'Processing...' : 'Buy Now'}
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-green-600" />
              <span>Free delivery on orders above ₹500</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Secure payment with Razorpay</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-orange-600" />
              <span>7-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
          <Button
            variant="outline"
            onClick={() => setShowReviews(!showReviews)}
          >
            {showReviews ? 'Hide Reviews' : 'Show Reviews'}
          </Button>
        </div>

        {showReviews && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">
                  {product.ratingAvg || product.rating}
                </div>
                <RatingStars rating={product.ratingAvg || product.rating} size="lg" />
                <p className="text-muted-foreground mt-2">
                  Based on {product.ratingCount || product.reviews} reviews
                </p>
              </div>

              {/* Review breakdown */}
              <div className="space-y-2 mb-6">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {Math.floor(Math.random() * 50)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sample reviews */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full" />
                      <div>
                        <div className="font-medium">Customer {i}</div>
                        <RatingStars rating={4 + Math.random()} size="sm" />
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Great product! Quality is excellent and delivery was fast.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>2 days ago</span>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>Helpful (5)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Q&A Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Questions & Answers</h2>
          <Button
            variant="outline"
            onClick={() => setShowQA(!showQA)}
          >
            {showQA ? 'Hide Q&A' : 'Show Q&A'}
          </Button>
        </div>

        {showQA && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">What is the return policy?</h4>
                  <p className="text-muted-foreground">
                    We offer a 7-day return policy for unused items in original packaging.
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Asked by Customer A</span>
                    <span>•</span>
                    <span>Answered by Seller</span>
                  </div>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">How long does delivery take?</h4>
                  <p className="text-muted-foreground">
                    Standard delivery takes 3-7 business days. Express delivery available for metro cities.
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Asked by Customer B</span>
                    <span>•</span>
                    <span>Answered by Seller</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask a Question
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
