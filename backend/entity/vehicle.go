package entity

import (
	"time"
	"gorm.io/gorm"
)

type Vehicle struct {
	gorm.Model
	Name               string    `valid:"matches(^[BG][0-9]+$), required~Name is required"`
	ReceivedDate       time.Time `valid:"required~ReceivedDate is required"`
	Price              float64   `valid:"required~Price is required"`
	Picture            string    `valid:"required~Picture is required"`
	Description        string    `valid:"required~Description is required,length(1|100)~Description must be between 1 and 100 characters"`

	VehicleColorID    	uint			`valid:"required~VehicleColorID is required"`
	VehicleColor      	VehicleColor 	`gorm:"foreignKey:VehicleColorID" valid:"-"`

	VehicleStatusID		uint       		`valid:"required~VehicleStatusID is required"`
	VehicleStatus      	VehicleStatus 	`gorm:"foreignKey:VehicleStatusID" valid:"-"`

	VehicleTypeID      	uint       		`valid:"required~VehicleTypeID is required"`
	VehicleType        	VehicleType 	`gorm:"foreignKey:VehicleTypeID" valid:"-"`

	EmployeeID         	uint       		`valid:"required~EmployeeID is required"`
	Employee           	Employee   		`gorm:"foreignKey:EmployeeID" valid:"-"`

	VehicleRent []VehicleRent `gorm:"foreignKey:RentID"`
}