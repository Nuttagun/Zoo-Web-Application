package entity

import "gorm.io/gorm"

type TicketGeneration struct {
	gorm.Model
	Generation 	string	`valid:"required~Generation is required,stringlength(1|20)~Generation must be between 1 and 20 characters"`
	Age			string

	Tickets []Ticket `gorm:"foreignKey:TicketGenerationID"`
}
