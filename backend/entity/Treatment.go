package entity

import "gorm.io/gorm"

type Treatment struct {
	gorm.Model
	TreatmentPlan string `valid:"required~TreatmentPlan is required,stringlength(1|500)~TreatmentPlan must be between 1 and 500 characters"`
}