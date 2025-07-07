package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

// Utility function to generate long string for testing
func generateLongCatagoryString(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func TestValidCatagoryOfFoodInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid CatagoryOfFood", func(t *testing.T) {
		category := entity.CatagoryOfFood{
			StockfoodType: "Beverages",
			Description:   "All types of drinks and beverages in stock",
		}

		ok, err := govalidator.ValidateStruct(category)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidStockfoodType(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing StockfoodType", func(t *testing.T) {
		category := entity.CatagoryOfFood{
			StockfoodType: "",
			Description:   "Test description",
		}

		ok, err := govalidator.ValidateStruct(category)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("StockfoodType is required"))
	})

	t.Run("should fail validation for StockfoodType exceeding 100 characters", func(t *testing.T) {
		category := entity.CatagoryOfFood{
			StockfoodType: generateLongString(101),
			Description:   "Test description",
		}

		ok, err := govalidator.ValidateStruct(category)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("StockfoodType must be between 1 and 100 characters"))
	})
}

func TestInvalidDescription(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for empty Description", func(t *testing.T) {
		category := entity.CatagoryOfFood{
			StockfoodType: "Beverages",
			Description:   "",
		}

		ok, err := govalidator.ValidateStruct(category)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("should fail validation for Description exceeding 255 characters", func(t *testing.T) {
		category := entity.CatagoryOfFood{
			StockfoodType: "Beverages",
			Description:   generateLongCatagoryString(256),
		}

		ok, err := govalidator.ValidateStruct(category)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Description can be up to 255 characters"))
	})
}

func TestEdgeCases(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for Description with exactly 255 characters", func(t *testing.T) {
		category := entity.CatagoryOfFood{
			StockfoodType: "Beverages",
			Description:   generateLongCatagoryString(255),
		}

		ok, err := govalidator.ValidateStruct(category)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("should pass validation for StockfoodType with exactly 100 characters", func(t *testing.T) {
		category := entity.CatagoryOfFood{
			StockfoodType: generateLongCatagoryString(100),
			Description:   "Test description",
		}

		ok, err := govalidator.ValidateStruct(category)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}