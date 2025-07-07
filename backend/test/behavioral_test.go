package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidBehavioralInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Behavioral", func(t *testing.T) {
		behavioral := entity.Behavioral{
			Behavioral: "Calm and Friendly",
		}

		ok, err := govalidator.ValidateStruct(behavioral)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidBehavioralInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for Behavioral with special characters", func(t *testing.T) {
		behavioral := entity.Behavioral{
			Behavioral: "Aggressive@#$",
		}

		ok, err := govalidator.ValidateStruct(behavioral)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Behavioral must not contain special characters"))
	})
}
