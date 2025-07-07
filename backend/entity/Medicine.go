package entity

import (
	"time"

	"gorm.io/gorm"
)

type Medicine struct {
	gorm.Model
	MedicineName string  `valid:"required~MedicineName is required,stringlength(1|100)~MedicineName must be between 1 and 100 characters"`
	Dosage       string  `valid:"required~Dosage is required"`
	Stock        int     `valid:"required~Stock is required"`
	ExpiryDate   time.Time `valid:"required~ExpiryDate is required"`
	Price        float64 `valid:"required~Price is required"`

	MedicineTypeID uint
	MedicineType   MedicineType `gorm:"foreignKey:MedicineTypeID" valid:"-"`
}
