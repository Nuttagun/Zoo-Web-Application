package entity

import "gorm.io/gorm"

type VehicleColor struct {
	gorm.Model
	Name 	string
	
	Vehicles []Vehicle `gorm:"foreignKey:VehicleTypeID"`
}