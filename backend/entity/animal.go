package entity

import (
	"time"

	"gorm.io/gorm"
)

type Animal struct {
	gorm.Model
	Name        string    `valid:"required~Name is required,stringlength(1|100)~Name must be between 1 and 100 characters,matches(^[a-zA-Z ]+$)~Name must not contain special characters"`
	Description string    `valid:"required~Description is required"`
	Weight      float64   `valid:"required~Weight is required"` 
	Height      float64   `valid:"required~Height is required"` 
	Birthplace  string    `valid:"required~Birthplace is required"`
	BirthDay    time.Time `valid:"required~BirthDay is required"`
	Picture     string    `valid:"required~Picture is required"`
	Note        string    

	SexID        uint        `valid:"required~SexID is required"`
	Sex          Sex         `gorm:"foreignKey:SexID" valid:"-"`
	BiologicalID uint        `valid:"required~BiologicalID is required"`
	Biological   Biological  `gorm:"foreignKey:BiologicalID" valid:"-"`
	BehavioralID uint        `valid:"required~BehavioralID is required"`
	Behavioral   Behavioral  `gorm:"foreignKey:BehavioralID" valid:"-"`
	EmployeeID   uint        `valid:"required~EmployeeID is required"`
	Employee     Employee    `gorm:"foreignKey:EmployeeID" valid:"-"`
	HabitatID    uint        `valid:"required~HabitatID is required"`
	Habitat      Habitat     `gorm:"foreignKey:HabitatID" valid:"-"`
	HealthAnimalID    uint        `valid:"required~HealthAnimalID is required"`
	HealthAnimal      HealthAnimal     `gorm:"foreignKey:HealthAnimalID" valid:"-"`

	Event  []Event  `gorm:"foreignKey:AnimalID"`
	Report []Report `gorm:"foreignKey:AnimalID"`
}
