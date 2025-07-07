package entity

import (

	"gorm.io/gorm"
)

type TicketType struct {
	gorm.Model
	Ticket 			string	`valid:"required~Ticket is required,stringlength(1|20)~Ticket type must be between 1 and 20 characters"`
	Description 	string	`valid:"required~Description is required,stringlength(1|100)~Description must be between 1 and 100 characters"`	
	Picture         string  `valid:"required~Picture is required"`		
	
	Tickets []Ticket `gorm:"foreignKey:TicketTypeID"`
}