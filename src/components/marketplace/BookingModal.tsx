import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  X,
  CheckCircle
} from "lucide-react";
import { initiatePayment, loadRazorpayScript } from "@/utils/razorpay";
import { format } from "date-fns";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: number;
    serviceName: string;
    pricePerHour: number;
    artisanName: string;
    artisanLocation: string;
    duration: string;
    maxParticipants: number;
  } | null;
  onConfirmBooking: (bookingData: BookingData) => void;
}

interface BookingData {
  serviceId: number;
  date: Date;
  time: string;
  duration: number;
  participants: number;
  specialRequests: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

const BookingModal = ({ isOpen, onClose, service, onConfirmBooking }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: service?.id || 0,
    date: new Date(),
    time: "",
    duration: 2,
    participants: 1,
    specialRequests: "",
    contactInfo: {
      name: "",
      email: "",
      phone: ""
    }
  });

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM"
  ];

  const durationOptions = [
    { value: 1, label: "1 hour" },
    { value: 2, label: "2 hours" },
    { value: 3, label: "3 hours" },
    { value: 4, label: "4 hours" },
    { value: 6, label: "6 hours (Full day)" }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirm = async () => {
    if (service && selectedDate) {
      const totalAmount = calculateTotal();
      
      try {
        await loadRazorpayScript();
        
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
          amount: totalAmount * 100, // Amount in paise
          currency: 'INR',
          name: 'Jharkhand Marketplace',
          description: `Booking for ${service.serviceName}`,
          handler: function (response: any) {
            console.log('Payment successful:', response);
            onConfirmBooking({
              ...bookingData,
              date: selectedDate,
              paymentId: response.razorpay_payment_id
            });
            onClose();
            setStep(1);
          },
          prefill: {
            name: bookingData.name || 'Customer Name',
            email: bookingData.email || 'customer@example.com',
            contact: bookingData.phone || '9999999999'
          },
          notes: {
            service: service.serviceName,
            artisan: service.artisanName,
            date: selectedDate?.toISOString()
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
        onConfirmBooking({
          ...bookingData,
          date: selectedDate
        });
        onClose();
        setStep(1);
      }
    }
  };

  const calculateTotal = () => {
    return bookingData.duration * service?.pricePerHour || 0;
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Book Service</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Service Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">{service.serviceName}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{service.artisanName}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{service.artisanLocation}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{service.duration}</span>
              </div>
            </div>
            <div className="mt-2 text-lg font-bold text-foreground">
              ₹{service.pricePerHour}/hour
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Date & Time Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Date & Time</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="time">Select Time</Label>
                  <Select value={bookingData.time} onValueChange={(value) => setBookingData({...bookingData, time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select 
                    value={bookingData.duration.toString()} 
                    onValueChange={(value) => setBookingData({...bookingData, duration: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="participants">Number of Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="1"
                    max={service.maxParticipants}
                    value={bookingData.participants}
                    onChange={(e) => setBookingData({...bookingData, participants: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={bookingData.contactInfo.name}
                    onChange={(e) => setBookingData({
                      ...bookingData, 
                      contactInfo: {...bookingData.contactInfo, name: e.target.value}
                    })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingData.contactInfo.email}
                    onChange={(e) => setBookingData({
                      ...bookingData, 
                      contactInfo: {...bookingData.contactInfo, email: e.target.value}
                    })}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={bookingData.contactInfo.phone}
                  onChange={(e) => setBookingData({
                    ...bookingData, 
                    contactInfo: {...bookingData.contactInfo, phone: e.target.value}
                  })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                  placeholder="Any special requirements or requests..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Booking Summary</h3>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{service.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{selectedDate ? format(selectedDate, "PPP") : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{bookingData.duration} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span className="font-medium">{bookingData.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span className="font-medium">₹{service.pricePerHour}/hour</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>

              {bookingData.specialRequests && (
                <div>
                  <Label>Special Requests:</Label>
                  <p className="text-sm text-muted-foreground mt-1">{bookingData.specialRequests}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={step === 1 ? onClose : handlePrevious}
            >
              {step === 1 ? "Cancel" : "Previous"}
            </Button>
            
            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleConfirm}>
                Confirm Booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingModal;
