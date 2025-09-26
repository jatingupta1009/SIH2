import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  MapPin,
  Verified,
  Eye
} from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    description: string;
    price: string;
    originalPrice?: string;
    rating: number;
    reviews: number;
    vendor: string;
    location: string;
    image: string;
    verified: boolean;
    category: string;
    tags: string[];
  };
  onAddToCart: (productId: number) => void;
  onViewDetails: (productId: number) => void;
  onToggleFavorite: (productId: number) => void;
  isFavorite?: boolean;
}

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onToggleFavorite,
  isFavorite = false 
}: ProductCardProps) => {

  const discountPercentage = product.originalPrice 
    ? Math.round(((parseInt(product.originalPrice.replace(/[₹,]/g, '')) - parseInt(product.price.replace(/[₹,]/g, ''))) / parseInt(product.originalPrice.replace(/[₹,]/g, ''))) * 100)
    : 0;

  return (
    <Card 
      className="travel-card group overflow-hidden cursor-pointer"

      onClick={() => onViewDetails(product.id)}
    >
      <div className="relative">
        <img 
          src={product.image} 
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
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Discount Badge */}
        {product.originalPrice && (
          <div className="absolute top-3 left-3">
            <Badge variant="destructive">
              {discountPercentage}% OFF
            </Badge>
          </div>
        )}

        
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Vendor Info */}
          <div className="flex items-center text-xs text-muted-foreground">
            <span>{product.vendor}</span>
            <span className="mx-1">•</span>
            <MapPin className="h-3 w-3 mr-1" />
            <span>{product.location}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-1">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Rating and Price */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({product.reviews})
              </span>
            </div>
            <div className="text-right">
              {product.originalPrice && (
                <div className="text-xs text-muted-foreground line-through">
                  {product.originalPrice}
                </div>
              )}
              <div className="font-bold text-foreground">{product.price}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="marketplace" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product.id);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
