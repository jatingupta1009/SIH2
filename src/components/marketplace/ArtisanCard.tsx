import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MapPin,
  Verified,
  Users,
  Award
} from "lucide-react";

interface ArtisanCardProps {
  artisan: {
    id: number;
    name: string;
    bio: string;
    specialty: string;
    location: string;
    rating: number;
    reviews: number;
    profileImage: string;
    isFeatured: boolean;
    productsCount: number;
    servicesCount: number;
    joinedDate: string;
    verified: boolean;
  };
  onViewProfile: (artisanId: number) => void;
  onHire: (artisanId: number) => void;
}

const ArtisanCard = ({ artisan, onViewProfile, onHire }: ArtisanCardProps) => {
  return (
    <Card className="travel-card group overflow-hidden">
      <CardContent className="p-6">
        <div className="text-center">
          {/* Profile Image */}
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
            {artisan.isFeatured && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-yellow-500 text-white text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
          </div>

          {/* Name and Specialty */}
          <h3 className="font-semibold text-foreground mb-1">{artisan.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{artisan.specialty}</p>

          {/* Location */}
          <div className="flex items-center justify-center text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{artisan.location}</span>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {artisan.bio}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>{artisan.productsCount} products</span>
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              <span>{artisan.rating} ({artisan.reviews})</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewProfile(artisan.id)}
            >
              View Profile
            </Button>
            <Button 
              variant="marketplace" 
              size="sm" 
              className="flex-1"
              onClick={() => onHire(artisan.id)}
            >
              Hire Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtisanCard;
