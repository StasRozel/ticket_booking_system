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
  bookings: BookingType[];
  tickets: { [bookingId: number]: TicketType[] };
  fetchBookings: () => Promise<void>;
  handleBooking: (bookingId: number, tickets?: Map<number, boolean>) => void;
  handleCanselBooking: (id: number) => void;
  handleCanselTicket: (data: TicketType) => void;
  fetchPendingBookings: () => Promise<void>;
  formatDate: (stringData: string) => string;
  handleTicketTypeChange: (ticketId: number, routeId: number, bookingId: number, isChild: boolean) => Promise<void>;
  fetchUserProfile: (userId: number) => Promise<void>; // Новый метод для загрузки данных профиля
  updateUserProfile: (userId: number, data: Partial<UserType>) => Promise<void>; // Новый метод для обновления профиля
};