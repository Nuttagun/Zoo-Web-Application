package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidSexInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Sex", func(t *testing.T) {
		sex := entity.Sex{
			Sex: "Male",
		}

		ok, err := govalidator.ValidateStruct(sex)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidSexInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for Sex with special characters", func(t *testing.T) {
		sex := entity.Sex{
			Sex: "Female#123",
		}

		ok, err := govalidator.ValidateStruct(sex)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Sex must not contain special characters"))
	})
}
