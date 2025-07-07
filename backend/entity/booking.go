package entity

import (
	"time"
	"gorm.io/gorm"
) 

type Booking struct {
	gorm.Model
	BookingDate	time.Time	`valid:"required~Booking Date is required"`
	AllPrice  	float64 	`valid:"required~All Price is required"`

	UserID 		*uint		`valid:"required~UserID is required"`
	User   		*User 		`gorm:"foreignKey:UserID" valid:"-"`

	TicketBookings []TicketBooked `gorm:"foreignKey:BookingID"`
	PaymentTickets []PaymentTicket `gorm:"foreignKey:BookingID"`
}