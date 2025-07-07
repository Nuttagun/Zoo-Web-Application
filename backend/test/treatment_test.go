package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func generateLongStringTreatment(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func TestValidTreatmentInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Treatment", func(t *testing.T) {
		treatment := entity.Treatment{
			TreatmentPlan: "Provide antibiotics and monitor temperature every 4 hours",
		}

		ok, err := govalidator.ValidateStruct(treatment)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidTreatmentPlan(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing TreatmentPlan", func(t *testing.T) {
		treatment := entity.Treatment{
			TreatmentPlan: "",
		}

		ok, err := govalidator.ValidateStruct(treatment)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TreatmentPlan is required"))
	})

	t.Run("should fail validation for TreatmentPlan exceeding 500 characters", func(t *testing.T) {
		treatment := entity.Treatment{
			TreatmentPlan: generateLongStringTreatment(501),
		}

		ok, err := govalidator.ValidateStruct(treatment)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TreatmentPlan must be between 1 and 500 characters"))
	})
}