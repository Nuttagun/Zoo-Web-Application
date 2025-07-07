import { BookingInterface } from "../interface/IBooking"
export interface TicketBookedInterface {
    ID?:                number;
    VisitDate?:         string;
    QuantityCustomer?:  number;
	TotalPrice?:        number;
	Checking ?:         boolean;
    BookingID?:         number | BookingInterface; 
}