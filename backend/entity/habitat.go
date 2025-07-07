package entity

import "gorm.io/gorm"

type Habitat struct {
	gorm.Model
	Name     string  `valid:"required~Name is required,length(1|100)~Name must be between 1 and 100 characters,matches(^[a-zA-Z0-9 ]+$)~Name must not contain special characters"`
	Size     float64 `valid:"required~Size is required"` 
	Capacity uint    `valid:"required~Capacity is required"`
	Picture  string  `valid:"required~Picture is required"`

	ZoneID uint `valid:"required~ZoneID is required"`
	Zone   Zone `gorm:"foreignKey:ZoneID" valid:"-"`

	EmployeeID uint `valid:"required~EmployeeID is required"`
	Employee   Employee `gorm:"foreignKey:EmployeeID" valid:"-"`

	Animals []Animal `gorm:"foreignKey:HabitatID"`
	Work    []Work   `gorm:"foreignKey:HabitatID"`
}
 
