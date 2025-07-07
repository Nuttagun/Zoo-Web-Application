package entity

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Title       string    `valid:"required~Title is required, stringlength(1|100)~Title must be between 1 and 100 characters"`
	Description string    `valid:"required~Description is required"`
	StartDate   time.Time `valid:"required~Start Date is required"`
	EndDate     time.Time `valid:"required~End Date is required"`
	Picture     string    `valid:"optional"`

	ZoneID     uint  `valid:"required~ZoneID is required"`
	Zone       Zone  `gorm:"foreignKey:ZoneID" valid:"-"` 
	AnimalID   uint  `valid:"required~AnimalID is required"`
	Animal     Animal `gorm:"foreignKey:AnimalID" valid:"-"` 
	EmployeeID uint  `valid:"required~EmployeeID is required"`
	Employee   Employee `gorm:"foreignKey:EmployeeID" valid:"-"` 
}


