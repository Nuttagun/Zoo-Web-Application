package entity

import "gorm.io/gorm"

type MedicineType struct {
	gorm.Model
	MedicineType string `valid:"required~MedicineType is required,stringlength(1|100)~MedicineType must be between 1 and 100 characters"`

	Medicine []Medicine `gorm:"foreignKey:MedicineTypeID"`
}
