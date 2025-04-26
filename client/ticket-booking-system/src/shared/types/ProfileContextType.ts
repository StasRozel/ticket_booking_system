import { BookingType } from "./BookingType";
import { TicketType } from "./TicketType";
import { UserType } from "./UserType";


export type ProfileContextType = {
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
}