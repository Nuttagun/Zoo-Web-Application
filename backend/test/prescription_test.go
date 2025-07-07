package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func generateLongStringPrescription(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func TestValidPrescriptionInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Prescription", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "Once a day",
			Duration:            "7 days",
			StartDate:           time.Now(),
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                "Take after meals",
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidPrescriptionDates(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing StartDate", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "Once a day",
			Duration:            "7 days",
			StartDate:           time.Time{},
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                "Take after meals",
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("StartDate is required"))
	})

	t.Run("should fail validation for missing EndDate", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "Once a day",
			Duration:            "7 days",
			StartDate:           time.Now(),
			EndDate:             time.Time{},
			Note:                "Take after meals",
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EndDate is required"))
	})

	
}

func TestInvalidPrescriptionStrings(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Frequency", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "",
			Duration:            "7 days",
			StartDate:           time.Now(),
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                "Take after meals",
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Frequency is required"))
	})

	t.Run("should fail validation for Frequency exceeding 100 characters", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            generateLongStringPrescription(101),
			Duration:            "7 days",
			StartDate:           time.Now(),
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                "Take after meals",
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Frequency must be between 1 and 100 characters"))
	})

	t.Run("should fail validation for missing Duration", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "Once a day",
			Duration:            "",
			StartDate:           time.Now(),
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                "Take after meals",
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Duration is required"))
	})

	t.Run("should fail validation for Duration exceeding 100 characters", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "Once a day",
			Duration:            generateLongStringPrescription(101),
			StartDate:           time.Now(),
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                "Take after meals",
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Duration must be between 1 and 100 characters"))
	})

	t.Run("should fail validation for missing Note", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "Once a day",
			Duration:            "7 days",
			StartDate:           time.Now(),
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                "",
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Note is required"))
	})

	t.Run("should fail validation for Note exceeding 500 characters", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "Once a day",
			Duration:            "7 days",
			StartDate:           time.Now(),
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                generateLongStringPrescription(501),
			EmployeeID:          1,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Note must be between 1 and 500 characters"))
	})
}

func TestInvalidPrescriptionForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing EmployeeID", func(t *testing.T) {
		prescription := entity.Prescription{
			Frequency:            "Once a day",
			Duration:            "7 days",
			StartDate:           time.Now(),
			EndDate:             time.Now().AddDate(0, 0, 7),
			Note:                "Take after meals",
			EmployeeID:          0,
		}

		ok, err := govalidator.ValidateStruct(prescription)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})
}