package entity

import (
	"time"
	"gorm.io/gorm"
)

type Prescription struct {
	gorm.Model
	Frequency            string    `valid:"required~Frequency is required,stringlength(1|100)~Frequency must be between 1 and 100 characters"`
	Duration            string    `valid:"required~Duration is required,stringlength(1|100)~Duration must be between 1 and 100 characters"`
	StartDate           time.Time `valid:"required~StartDate is required"`
	EndDate             time.Time `valid:"required~EndDate is required"`
	Note                string    `valid:"required~Note is required,stringlength(1|500)~Note must be between 1 and 500 characters"`

	Medicalrecord *Medicalrecord `gorm:"foreignKey:PrescriptionID" valid:"-"`
	
	Medicines     []Medicine `gorm:"many2many:prescription_medicines;" valid:"-"`
	
	EmployeeID    uint      `valid:"required~EmployeeID is required"`
	Employee      Employee  `gorm:"foreignKey:EmployeeID" valid:"-"`
}