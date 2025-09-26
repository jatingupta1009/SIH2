import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Star, MapPin, Users, Calendar as CalendarIcon } from "lucide-react";
import { initiatePayment, loadRazorpayScript } from "@/utils/razorpay";

interface HotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: any; // Replace 'any' with a more specific Hotel type if available
  onConfirmBooking: (bookingData: any) => void;
}

const HotelBookingModal: React.FC<HotelBookingModalProps> = ({ isOpen, onClose, hotel, onConfirmBooking }) => {
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<number>(1);
  const [rooms, setRooms] = useState<number>(1);
  const [contactInfo, setContactInfo] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");

  const handleConfirm = async () => {
    if (hotel && checkInDate && checkOutDate && guests > 0 && rooms > 0 && contactInfo) {
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = hotel.price * nights * rooms;
      
      const bookingData = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        location: hotel.location,
        checkInDate: format(checkInDate, "yyyy-MM-dd"),
        checkOutDate: format(checkOutDate, "yyyy-MM-dd"),
        nights,
        guests,
        rooms,
        contactInfo,
        specialRequests,
        totalPrice,
        pricePerNight: hotel.price,
      };

      try {
        await loadRazorpayScript();
        
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
          amount: totalPrice * 100, // Amount in paise
          currency: 'INR',
          name: 'Jharkhand Marketplace',
          description: `Hotel booking for ${hotel.name}`,
          handler: function (response: any) {
            console.log('Payment successful:', response);
            onConfirmBooking({
              ...bookingData,
              paymentId: response.razorpay_payment_id
            });
            // Reset form
            setCheckInDate(undefined);
            setCheckOutDate(undefined);
            setGuests(1);
            setRooms(1);
            setContactInfo("");
            setSpecialRequests("");
          },
          prefill: {
            name: 'Customer Name',
            email: contactInfo.includes('@') ? contactInfo : 'customer@example.com',
            contact: contactInfo.includes('@') ? '9999999999' : contactInfo
          },
          notes: {
            hotel: hotel.name,
            checkIn: format(checkInDate, "yyyy-MM-dd"),
            checkOut: format(checkOutDate, "yyyy-MM-dd"),
            guests: guests.toString(),
            rooms: rooms.toString()
          },
          theme: {
            color: '#059669'
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error('Payment failed:', error);
        // Fallback to direct booking without payment
        onConfirmBooking(bookingData);
        // Reset form
        setCheckInDate(undefined);
        setCheckOutDate(undefined);
        setGuests(1);
        setRooms(1);
        setContactInfo("");
        setSpecialRequests("");
      }
    } else {
      alert("Please fill all required booking details.");
    }
  };

  if (!hotel) return null;

  const nights = checkInDate && checkOutDate 
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPrice = nights * rooms * hotel.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Book {hotel.name}</DialogTitle>
          <DialogDescription>
            {hotel.location} • {hotel.category}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Hotel Info */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{hotel.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{hotel.location}</span>
                <span>•</span>
                <span>{hotel.distance}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{hotel.rating}</span>
                <span className="text-sm text-muted-foreground">({hotel.reviews} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {hotel.amenities.slice(0, 3).map((amenity: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">₹{hotel.price}</div>
              <div className="text-sm text-muted-foreground">per night</div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in Date</Label>
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                className="rounded-md border"
                initialFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout">Check-out Date</Label>
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                className="rounded-md border"
                disabled={(date) => date <= (checkInDate || new Date())}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Select onValueChange={(value) => setGuests(parseInt(value))} value={guests.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Number of guests" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Rooms</Label>
              <Select onValueChange={(value) => setRooms(parseInt(value))} value={rooms.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Number of rooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Room' : 'Rooms'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information</Label>
            <Input
              id="contact"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Your email or phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requests">Special Requests (Optional)</Label>
            <Input
              id="requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements or requests"
            />
          </div>

          {/* Price Summary */}
          {nights > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>₹{hotel.price} × {nights} nights × {rooms} rooms</span>
                  <span>₹{hotel.price * nights * rooms}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!checkInDate || !checkOutDate || !contactInfo}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HotelBookingModal;
