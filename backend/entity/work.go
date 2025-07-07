package entity

import (
	"time"

	"gorm.io/gorm"
)

type Work struct {
	gorm.Model
	Feed       bool      
	Cleaning   bool      
	FinishDate time.Time `valid:"required~Finish Date is required"`

	EmployeeID uint     `valid:"required~EmployeeID is required"`
	Employee   Employee `gorm:"foreignKey:EmployeeID" valid:"-"` 

	HabitatID uint     `valid:"required~HabitatID is required"`
	Habitat   Habitat  `gorm:"foreignKey:HabitatID" valid:"-"` 
}
