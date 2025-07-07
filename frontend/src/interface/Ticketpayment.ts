export interface PaymentTicket {
    ID: number;
    Amount: number;
    PaymentDate: string;
    PaymentStatus: boolean;
    Path: string;
    BookingID: number;
    PromotionID?: number;
  }