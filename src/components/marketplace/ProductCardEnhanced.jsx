import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  MapPin,
  Verified,
  Eye,
  Truck,
  Shield
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const ProductCardEnhanced = ({ 
  product, 
  onViewDetails, 
  onToggleFavorite,
  isFavorite = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  const discountPercentage = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    
    try {
      addToCart(product);
      // Show success feedback
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAddingToCart(false);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onViewDetails(product.id);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite(product.id);
  };

  return (
    <Card 
      className="travel-card group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(product.id)}
    >
      <div className="relative">
        <img 
          src={product.images?.[0]?.url || product.image} 
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 space-y-1">
          {product.verified && (
            <Badge className="bg-background/90 text-foreground">
              <Verified className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`bg-background/80 hover:bg-background transition-colors ${
              isFavorite ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3">
            <Badge variant="destructive">
              {discountPercentage}% OFF
            </Badge>
          </div>
        )}

        {/* Stock Status */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Only {product.stock} left
            </Badge>
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Quick Actions Overlay */}
        {isHovered && product.stock > 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4 mr-1" />
              Quick View
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Seller Info */}
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="font-medium">{product.seller?.name || product.vendor}</span>
            <span className="mx-1">•</span>
            <MapPin className="h-3 w-3 mr-1" />
            <span>{product.seller?.location || product.location}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.shortDescription || product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {product.tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Rating and Price */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.ratingAvg || product.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({product.ratingCount || product.reviews})
              </span>
            </div>
            <div className="text-right">
              {product.mrp && product.mrp > product.price && (
                <div className="text-xs text-muted-foreground line-through">
                  ₹{product.mrp.toLocaleString()}
                </div>
              )}
              <div className="font-bold text-foreground">₹{product.price.toLocaleString()}</div>
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              <span>Free delivery</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure payment</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="marketplace" 
              size="sm" 
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {product.stock === 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardEnhanced;
