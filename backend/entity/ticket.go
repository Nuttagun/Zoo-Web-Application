package entity

import "gorm.io/gorm"

type Ticket struct {
	gorm.Model
	Description 		string		`valid:"required~Description is required,stringlength(1|100)~Description must be between 1 and 100 characters"`
	Price 				float64		`valid:"required~Price is required"`

	TicketGenerationID 	*uint		`valid:"required~TicketGenerationID is required"`
	Generation   		*TicketGeneration `gorm:"foreignKey:TicketGenerationID" valid:"-"`

	TicketTypeID 		uint		`valid:"required~TicketTypeID is required"`
	TicketType   		*TicketType `gorm:"foreignKey:TicketTypeID" valid:"-"`

	BookingZoos []BookingZoo 	`gorm:"foreignKey:TicketID"`
	Zones 		[]Zone 			`gorm:"many2many:zone_ticket;"`
}