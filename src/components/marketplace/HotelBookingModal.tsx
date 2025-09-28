import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Star, MapPin, Users, Calendar as CalendarIcon, X } from "lucide-react";
// Removed Razorpay dependency - using frontend-only flow

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
        paymentId: `PAY_${Date.now()}` // Mock payment ID
      };

      // Simulate booking confirmation
      alert(`Hotel booking confirmed for ${hotel.name}!\nCheck-in: ${format(checkInDate, "PPP")}\nCheck-out: ${format(checkOutDate, "PPP")}\nTotal: ₹${totalPrice}`);
      
      onConfirmBooking(bookingData);
      
        // Reset form
        setCheckInDate(undefined);
        setCheckOutDate(undefined);
        setGuests(1);
        setRooms(1);
        setContactInfo("");
        setSpecialRequests("");
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">{hotel.name}</DialogTitle>
              <DialogDescription className="text-base mt-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                <span>{hotel.location}</span>
                <span>•</span>
                <span>{hotel.distance}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{hotel.rating}</span>
                  <span className="text-sm text-gray-500">({hotel.reviews} reviews)</span>
              </div>
              </DialogDescription>
              </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Booking Form */}
            <div className="lg:col-span-2 space-y-6">
          {/* Booking Form */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Select dates and guests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                      <Label htmlFor="checkin" className="text-sm font-medium">Check-in</Label>
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                className="rounded-md border"
                initialFocus
              />
            </div>
            <div className="space-y-2">
                      <Label htmlFor="checkout" className="text-sm font-medium">Check-out</Label>
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                className="rounded-md border"
                disabled={(date) => date <= (checkInDate || new Date())}
              />
                    </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                    <Label htmlFor="guests" className="text-sm font-medium">Guests</Label>
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
                    <Label htmlFor="rooms" className="text-sm font-medium">Rooms</Label>
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
                  <Label htmlFor="contact" className="text-sm font-medium">Contact Information</Label>
            <Input
              id="contact"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Your email or phone number"
            />
          </div>

          <div className="space-y-2">
                  <Label htmlFor="requests" className="text-sm font-medium">Special Requests (Optional)</Label>
            <Input
              id="requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements or requests"
            />
                </div>
              </div>
          </div>

            {/* Right Column - Price Summary & Amenities */}
            <div className="lg:col-span-1 space-y-6">
          {/* Price Summary */}
              <div className="p-6 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-4 text-lg">Booking Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>₹{hotel.price} × {nights || 0} nights</span>
                    <span>₹{hotel.price * (nights || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>× {rooms} rooms</span>
                    <span></span>
                  </div>
                <div className="flex justify-between">
                    <span>Guests</span>
                    <span>{guests}</span>
                </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            </div>
              </div>

              {/* Amenities */}
              <div className="p-6 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-4 text-lg">What's included</h4>
                <div className="grid grid-cols-2 gap-2">
                  {hotel.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <Button 
                onClick={handleConfirm} 
                disabled={!checkInDate || !checkOutDate || !contactInfo}
                className="w-full h-12 text-lg font-semibold bg-black hover:bg-gray-800"
              >
                Reserve for ₹{totalPrice}
              </Button>
            </div>
        </div>

        <DialogFooter className="pt-6 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!checkInDate || !checkOutDate || !contactInfo}
            className="bg-black hover:bg-gray-800"
          >
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HotelBookingModal;


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

                  <Label htmlFor="rooms" className="text-sm">Rooms</Label>
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

                <Label htmlFor="contact" className="text-sm">Contact Information</Label>
            <Input

              id="contact"

              value={contactInfo}

              onChange={(e) => setContactInfo(e.target.value)}

              placeholder="Your email or phone number"

            />

          </div>



          <div className="space-y-2">

                <Label htmlFor="requests" className="text-sm">Special Requests (Optional)</Label>
            <Input

              id="requests"

              value={specialRequests}

              onChange={(e) => setSpecialRequests(e.target.value)}

              placeholder="Any special requirements or requests"

            />

              </div>
            </div>
          </div>



          {/* Right Column - Price Summary & Amenities */}
          <div className="space-y-4">
          {/* Price Summary */}

            <div className="p-4 bg-muted rounded-lg">

              <h4 className="font-semibold mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price per night</span>
                  <span>₹{hotel.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights</span>
                  <span>{nights || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rooms</span>
                  <span>{rooms}</span>
                </div>
                <div className="flex justify-between">

                  <span>Guests</span>
                  <span>{guests}</span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>

                  <span>₹{totalPrice}</span>

                </div>

              </div>

            </div>

            </div>

            {/* Amenities */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-1">
                {hotel.amenities.map((amenity: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
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

                  <Label htmlFor="rooms" className="text-sm">Rooms</Label>
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

                <Label htmlFor="contact" className="text-sm">Contact Information</Label>
            <Input

              id="contact"

              value={contactInfo}

              onChange={(e) => setContactInfo(e.target.value)}

              placeholder="Your email or phone number"

            />

          </div>



          <div className="space-y-2">

                <Label htmlFor="requests" className="text-sm">Special Requests (Optional)</Label>
            <Input

              id="requests"

              value={specialRequests}

              onChange={(e) => setSpecialRequests(e.target.value)}

              placeholder="Any special requirements or requests"

            />

              </div>
            </div>
          </div>



          {/* Right Column - Price Summary & Amenities */}
          <div className="space-y-4">
          {/* Price Summary */}

            <div className="p-4 bg-muted rounded-lg">

              <h4 className="font-semibold mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price per night</span>
                  <span>₹{hotel.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights</span>
                  <span>{nights || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rooms</span>
                  <span>{rooms}</span>
                </div>
                <div className="flex justify-between">

                  <span>Guests</span>
                  <span>{guests}</span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>

                  <span>₹{totalPrice}</span>

                </div>

              </div>

            </div>

            </div>

            {/* Amenities */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-3">Amenities</h4>
              <div className="flex flex-wrap gap-1">
                {hotel.amenities.map((amenity: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
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


