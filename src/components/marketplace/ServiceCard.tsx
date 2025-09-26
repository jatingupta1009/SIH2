import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Clock,
  MapPin,
  Calendar,
  Users,
  Camera,
  Music,
  Palette,
  Compass
} from "lucide-react";

interface ServiceCardProps {
  service: {
    id: number;
    serviceName: string;
    description: string;
    pricePerHour: number;
    artisanId: number;
    artisanName: string;
    artisanImage: string;
    artisanRating: number;
    artisanLocation: string;
    category: string;
    duration: string;
    maxParticipants: number;
    image: string;
    tags: string[];
  };
  onBook: (serviceId: number) => void;
  onViewArtisan: (artisanId: number) => void;
}

const ServiceCard = ({ service, onBook, onViewArtisan }: ServiceCardProps) => {
  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'photography':
        return <Camera className="h-5 w-5" />;
      case 'folk art':
        return <Music className="h-5 w-5" />;
      case 'craft instruction':
        return <Palette className="h-5 w-5" />;
      case 'local guide':
        return <Compass className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  return (
    <Card className="travel-card group overflow-hidden">
      <div className="relative">
        <img 
          src={service.image} 
          alt={service.serviceName}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Service Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary/90 text-primary-foreground">
            {getServiceIcon(service.category)}
            <span className="ml-1">{service.category}</span>
          </Badge>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/90">
            <Clock className="h-3 w-3 mr-1" />
            {service.duration}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Service Title */}
          <h3 className="font-semibold text-foreground line-clamp-1">
            {service.serviceName}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>

          {/* Artisan Info */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
            onClick={() => onViewArtisan(service.artisanId)}
          >
            <img 
              src={service.artisanImage}
              alt={service.artisanName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {service.artisanName}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{service.artisanLocation}</span>
                <span className="mx-1">•</span>
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                <span>{service.artisanRating}</span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Max {service.maxParticipants} people</span>
            </div>
            <div className="font-bold text-foreground">
              ₹{service.pricePerHour}/hour
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Button */}
          <Button 
            variant="marketplace" 
            className="w-full"
            onClick={() => onBook(service.id)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
