import { BookingType } from "./BookingType";
import { TicketType } from "./TicketType";
import { UserType } from "./UserType";


export type ProfileContextType = {
    trigger: number;
    user: UserType | null;
    loading: boolean;
    error: string | null;
    isScrolled: boolean;
    fetchUser: () => Promise<void>;
    handleScroll: () => void;
    handleEdit: () => void;
    bookings: BookingType[];
    tickets: {[bookingId: number]: TicketType[]};
    fetchBookings: () => Promise<void>;
    handleBooking: (id: number) => void;
    handleCanselBooking: (id: number) => void;
    handleCanselTicket: (data: TicketType) => void;
    fetchPendingBookings: () => Promise<void>;
    formatDate: (stringData: string) => string;
    handleTicketTypeChange: (ticketId: number, bookingId: number, isChild: boolean) => Promise<void>;
}