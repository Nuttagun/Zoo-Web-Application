package entity

type PrescriptionMedicine struct {
	PrescriptionID uint `valid:"required~PrescriptionID is required"`
	MedicineID     uint `valid:"required~MedicineID is required"`
}
