package unit

import (
	"fmt"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func generateLongStringMedical(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func ValidateTotalCost(value float64) error {
	if value <= 0 || value > 999999.99 {
		return fmt.Errorf("TotalCost must be a valid number between 0 and 999999.99")
	}
	return nil
}

func TestValidMedicalrecordInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Medicalrecord", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			DiagnosisDate: time.Now(),
			Diagnosis:     "Common cold with fever",
			Symptoms:      "High fever, runny nose, sore throat",
			TotalCost:     1500.50,
			EmployeeID:    1,
			ReportID:      1,
			TreatmentID:   1,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())

		err = ValidateTotalCost(medicalrecord.TotalCost)
		g.Expect(err).To(BeNil(), "Unexpected validation error for TotalCost: %v", err)
	})
}

func TestInvalidMedicalrecordDates(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing DiagnosisDate", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			Diagnosis:     "Common cold with fever",
			Symptoms:      "High fever, runny nose, sore throat",
			TotalCost:     1500.50,
			EmployeeID:    1,
			ReportID:      1,
			TreatmentID:   1,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("DiagnosisDate is required"))
	})

}

func TestInvalidMedicalrecordStrings(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Diagnosis", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			DiagnosisDate: time.Now(),
			Diagnosis:     "",
			Symptoms:      "High fever, runny nose, sore throat",
			TotalCost:     1500.50,
			EmployeeID:    1,
			ReportID:      1,
			TreatmentID:   1,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Diagnosis is required"))
	})

	t.Run("should fail validation for Diagnosis exceeding 500 characters", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			DiagnosisDate: time.Now(),
			Diagnosis:     generateLongStringMedical(501),
			Symptoms:      "High fever, runny nose, sore throat",
			TotalCost:     1500.50,
			EmployeeID:    1,
			ReportID:      1,
			TreatmentID:   1,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Diagnosis must be between 1 and 500 characters"))
	})

	t.Run("should fail validation for missing Symptoms", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			DiagnosisDate: time.Now(),
			Diagnosis:     "Common cold with fever",
			Symptoms:      "",
			TotalCost:     1500.50,
			EmployeeID:    1,
			ReportID:      1,
			TreatmentID:   1,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Symptoms is required"))
	})

	t.Run("should fail validation for Symptoms exceeding 500 characters", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			DiagnosisDate: time.Now(),
			Diagnosis:     "Common cold with fever",
			Symptoms:      generateLongStringMedical(501),
			TotalCost:     1500.50,
			EmployeeID:    1,
			ReportID:      1,
			TreatmentID:   1,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Symptoms must be between 1 and 500 characters"))
	})
}

func TestInvalidMedicalrecordTotalCost(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for invalid TotalCost (negative)", func(t *testing.T) {
		totalCost := -100.0
		err := ValidateTotalCost(totalCost)
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TotalCost must be a valid number between 0 and 999999.99"))
	})

	t.Run("should fail validation for invalid TotalCost (too large)", func(t *testing.T) {
		totalCost := 1000000.0
		err := ValidateTotalCost(totalCost)
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TotalCost must be a valid number between 0 and 999999.99"))
	})
}

func TestInvalidMedicalrecordForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing EmployeeID", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			DiagnosisDate: time.Now(),
			Diagnosis:     "Common cold with fever",
			Symptoms:      "High fever, runny nose, sore throat",
			TotalCost:     1500.50,
			EmployeeID:    0,
			ReportID:      1,
			TreatmentID:   1,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})

	t.Run("should fail validation for missing ReportID", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			DiagnosisDate: time.Now(),
			Diagnosis:     "Common cold with fever",
			Symptoms:      "High fever, runny nose, sore throat",
			TotalCost:     1500.50,
			EmployeeID:    1,
			ReportID:      0,
			TreatmentID:   1,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ReportID is required"))
	})

	t.Run("should fail validation for missing TreatmentID", func(t *testing.T) {
		medicalrecord := entity.Medicalrecord{
			DiagnosisDate: time.Now(),
			Diagnosis:     "Common cold with fever",
			Symptoms:      "High fever, runny nose, sore throat",
			TotalCost:     1500.50,
			EmployeeID:    1,
			ReportID:      1,
			TreatmentID:   0,
		}

		ok, err := govalidator.ValidateStruct(medicalrecord)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TreatmentID is required"))
	})
}