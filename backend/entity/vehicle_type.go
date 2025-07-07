package entity

import "gorm.io/gorm"

type VehicleType struct {
	gorm.Model
	VehicleType 		string	`valid:"required~Type is required,stringlength(1|20)~Type must be between 1 and 20 characters"`
	QuantityVehicle 	uint 	`valid:"required~Quantity is required"`
	
	Vehicles []Vehicle `gorm:"foreignKey:VehicleTypeID"`
}