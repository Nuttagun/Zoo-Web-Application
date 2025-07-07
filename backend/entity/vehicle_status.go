package entity

import "gorm.io/gorm"

type VehicleStatus struct {
	gorm.Model
	VehicleStatus 		string	`valid:"required~Status is required,stringlength(1|20)~Status must be between 1 and 20 characters"`
	
	Vehicles []Vehicle `gorm:"foreignKey:VehicleTypeID"`
}