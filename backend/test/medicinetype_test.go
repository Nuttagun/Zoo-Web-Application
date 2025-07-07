package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidMedicineTypeInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid MedicineType", func(t *testing.T) {
		medicineType := entity.MedicineType{
			MedicineType: "Antibiotic",
		}

		ok, err := govalidator.ValidateStruct(medicineType)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("should fail validation for missing MedicineType", func(t *testing.T) {
		medicineType := entity.MedicineType{
			MedicineType: "",
		}

		ok, err := govalidator.ValidateStruct(medicineType)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("MedicineType is required"))
	})

	t.Run("should fail validation for longtext MedicineType", func(t *testing.T) {
		medicineType := entity.MedicineType{
			MedicineType: "ParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamol",
		}

		ok, err := govalidator.ValidateStruct(medicineType)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("MedicineType must be between 1 and 100 characters"))
	})
}
