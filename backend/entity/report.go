package entity

import (
	"time"

	"gorm.io/gorm"
)

type Report struct {
	gorm.Model
	Title         string          `valid:"required~Title is required"`
	Description   string          `valid:"required~Description is required"`
	ReportDate    time.Time       `valid:"required~Report Date is required,current_date~Report Date must be today"`        
	StatusVet     string          
	Picture       string          `valid:"required~Picture is required"`

	AnimalID      uint            `valid:"required~AnimalID is required"`
	Animal        Animal          `gorm:"foreignKey:AnimalID" valid:"-"`

	EmployeeID    uint            `valid:"required~EmployeeID is required"`
	Employee      Employee        `gorm:"foreignKey:EmployeeID" valid:"-"`

	Medicalrecord *Medicalrecord  `gorm:"foreignKey:ReportID" valid:"-"`
}
