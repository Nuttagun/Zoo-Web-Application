package entity

import (
	"gorm.io/gorm"
)

type VehicleRent struct {
	gorm.Model
	Quantity 	uint 	`valid:"required~Quantity is required"`

	RentID		uint	`valid:"required~RentID is required"`
	Rent   		Rent 	`gorm:"foreignKey:RentID" valid:"-"`

	VehicleID 	uint	`valid:"required~VehicleID is required"`
	Vehicle   	Vehicle `gorm:"foreignKey:VehicleID" valid:"-"`
} 