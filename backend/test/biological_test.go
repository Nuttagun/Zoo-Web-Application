package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidBiologicalInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Biological", func(t *testing.T) {
		biological := entity.Biological{
			Biological: "Mammal",
		}

		ok, err := govalidator.ValidateStruct(biological)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidBiologicalInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for Biological with special characters", func(t *testing.T) {
		biological := entity.Biological{
			Biological: "Amphibian@123",
		}

		ok, err := govalidator.ValidateStruct(biological)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Biological must not contain special characters"))
	})
}
