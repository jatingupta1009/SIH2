import { Star } from 'lucide-react';

const RatingStars = ({ rating, size = 'md', showNumber = false }) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
      {showNumber && (
        <span className="ml-1 text-sm font-medium">{rating}</span>
      )}
    </div>
  );
};

export default RatingStars;
