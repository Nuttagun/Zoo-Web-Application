package entity

import "gorm.io/gorm"

type BookingZoo struct {
	gorm.Model
	Quantity 		uint 	`valid:"required~Quantity is required"`

	TicketID 		uint	`valid:"required~TicketID is required"`
	Ticket   		Ticket `gorm:"foreignKey:TicketID" valid:"-"`

	TicketBookedID  uint	`valid:"required~TicketBookedID is required"`
	TicketBooked  	TicketBooked `gorm:"foreignKey:TicketBookedID" valid:"-"`
}