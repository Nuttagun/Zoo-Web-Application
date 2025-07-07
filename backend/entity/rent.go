package entity

import (
	"time"
	"gorm.io/gorm"
)

type Rent struct {
	gorm.Model
	TotalQuantity  	uint 		`valid:"required~Total Quantity is required"`
	RentDate  		time.Time 	`valid:"required~Rent Date is required"`
	StartTime   	time.Time  	`valid:"required~Start Time is required"`
	EndTime 		time.Time 	`valid:"required~End Time is required"`
	TotalPrice 		float64		`valid:"required~Total Price is required"`

	TicketBookedID 	*uint		`valid:"required~TicketBookedID is required"`
	TicketBooked   	*TicketBooked `gorm:"foreignKey:TicketBookedID" valid:"-"`

	VehicleRent []VehicleRent `gorm:"foreignKey:RentID"`
}