package entity

import "gorm.io/gorm"

type Zone struct {
	gorm.Model
	Zone        string  `valid:"required~Zone is required,stringlength(1|100)~Zone must be between 1 and 100 characters,matches(^[a-zA-Z0-9 ]+$)~Zone must not contain special characters"`
	Description string  `valid:"required~Description is required, stringlength(1|255)~Description must be between 1 and 255 characters"`
	Picture     string  `valid:"required~Picture is required"`

	Tickets  []Ticket  `gorm:"many2many:zone_ticket;"`
	Habitats []Habitat `gorm:"foreignKey:ZoneID"`
	Event    []Event   `gorm:"foreignKey:ZoneID"`
}
