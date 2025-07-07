package entity

import (
	"time"

	"gorm.io/gorm"
)

type Medicalrecord struct {
	gorm.Model
	DiagnosisDate time.Time `valid:"required~DiagnosisDate is required"`
	Diagnosis     string    `valid:"required~Diagnosis is required,stringlength(1|500)~Diagnosis must be between 1 and 500 characters"`
	Symptoms      string    `valid:"required~Symptoms is required,stringlength(1|500)~Symptoms must be between 1 and 500 characters"`
	TotalCost     float64   `valid:"required~TotalCost is required,float~TotalCost must be a number"`

	EmployeeID uint     `valid:"required~EmployeeID is required"`
	Employee   Employee `gorm:"foreignKey:EmployeeID" valid:"-"`

	ReportID    uint   `valid:"required~ReportID is required"`
	Report      Report `gorm:"foreignKey:ReportID" valid:"-"`

	TreatmentID uint      `valid:"required~TreatmentID is required"`
	Treatment   Treatment `gorm:"foreignKey:TreatmentID" valid:"-"`

	PrescriptionID *uint        `valid:"-"`
	Prescription   *Prescription `gorm:"foreignKey:PrescriptionID" valid:"-"`
}
//validate success