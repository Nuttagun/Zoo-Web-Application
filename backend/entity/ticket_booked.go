package entity

import (
	"time"
	"gorm.io/gorm"
)

type TicketBooked struct {
	gorm.Model
	VisitDate        time.Time	`valid:"required~Visit Date is required,not_past_date~Visit Date cannot be in the past"`
	QuantityCustomer uint		`valid:"required~Quantity Customer is required"`
	TotalPrice       float64	`valid:"required~Total Price is required"`

	BookingID 		*uint		`valid:"required~BookingID is required"`
	Booking   		Booking 	`gorm:"foreignKey:BookingID" valid:"-"`

	Rents []Rent `gorm:"foreignKey:TicketBookedID"`
	BookingZoos []BookingZoo `gorm:"foreignKey:TicketBookedID"`
}