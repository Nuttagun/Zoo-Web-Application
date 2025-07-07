package entity

import (
	"time"
	"gorm.io/gorm"
)

type Calendar struct {
	gorm.Model
	Title     		string    `valid:"required~Title is required,length(1|100)~Title must be between 1 and 100 characters"`
	CalendarDate 	time.Time `valid:"required~Start date is required"`
	AllDay    		bool      `valid:"-"` 

	EmployeeID 		*uint    `valid:"required~EmployeeID is required"`
	Employee   		Employee `gorm:"foreignKey:EmployeeID" valid:"-"` 
}
