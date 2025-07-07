package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

// Utility function to generate long string for testing
func generateLongStringContainer(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func TestValidContainerOfFoodInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid ContainerOfFood", func(t *testing.T) {
		container := entity.ContainerOfFood{
			ContainerName: "Glass Container",
		}

		ok, err := govalidator.ValidateStruct(container)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidContainerName(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing ContainerName", func(t *testing.T) {
		container := entity.ContainerOfFood{
			ContainerName: "",
		}

		ok, err := govalidator.ValidateStruct(container)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ContainerName is required"))
	})

	t.Run("should fail validation for ContainerName exceeding 100 characters", func(t *testing.T) {
		container := entity.ContainerOfFood{
			ContainerName: generateLongStringContainer(101),
		}

		ok, err := govalidator.ValidateStruct(container)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ContainerName must be between 1 and 100 characters"))
	})
}

func TestContainerEdgeCases(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for ContainerName with exactly 100 characters", func(t *testing.T) {
		container := entity.ContainerOfFood{
			ContainerName: generateLongStringContainer(100),
		}

		ok, err := govalidator.ValidateStruct(container)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("should pass validation for ContainerName with single character", func(t *testing.T) {
		container := entity.ContainerOfFood{
			ContainerName: "A",
		}

		ok, err := govalidator.ValidateStruct(container)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}