package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidPrescriptionMedicineInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid PrescriptionMedicine", func(t *testing.T) {
		prescriptionMedicine := entity.PrescriptionMedicine{
			PrescriptionID: 1,
			MedicineID:     1,
		}

		ok, err := govalidator.ValidateStruct(prescriptionMedicine)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("should fail validation for missing PrescriptionID", func(t *testing.T) {
		prescriptionMedicine := entity.PrescriptionMedicine{
			PrescriptionID: 0,
			MedicineID:     1,
		}

		ok, err := govalidator.ValidateStruct(prescriptionMedicine)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("PrescriptionID is required"))
	})

	t.Run("should fail validation for missing MedicineID", func(t *testing.T) {
		prescriptionMedicine := entity.PrescriptionMedicine{
			PrescriptionID: 1,
			MedicineID:     0,
		}

		ok, err := govalidator.ValidateStruct(prescriptionMedicine)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("MedicineID is required"))
	})
}
