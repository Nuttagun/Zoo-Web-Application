package unit

import (
	"testing"
	"fmt"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidateQuantityFoodRequisition(quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("Quantity must be greater than 0")
	}
	return nil
}

func TestValidFoodRequisitionDetailInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Food Requisition Detail", func(t *testing.T) {
		foodRequisitionDetail := entity.FoodRequisitionDetail{
			Quantity:				50, 
			FoodRequisitionID:		1, 
			StockOfFoodID:			1,
		}

		ok, err := govalidator.ValidateStruct(foodRequisitionDetail)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidFoodRequisitionDetailQuantity(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Quantity", func(t *testing.T) {
		foodRequisitionDetail := entity.FoodRequisitionDetail{
			Quantity:				0, 
			FoodRequisitionID:		1, 
			StockOfFoodID:			1,
		}

		ok, err := govalidator.ValidateStruct(foodRequisitionDetail)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Quantity is required"))
	})

	t.Run("Quantity must be greater than 0", func(t *testing.T) {
		quantity := -50
		err := ValidateQuantityFoodRequisition(quantity)
		g.Expect(err).ToNot(BeNil()) 
		g.Expect(err.Error()).To(Equal("Quantity must be greater than 0"))
	})
}

func TestInvalidFoodRequisitionForeignKey(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing FoodRequisitionID", func(t *testing.T) {
		foodRequisitionDetail := entity.FoodRequisitionDetail{
			Quantity:				50, 
			FoodRequisitionID:		0, 
			StockOfFoodID:			1,
		}

		ok, err := govalidator.ValidateStruct(foodRequisitionDetail)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("FoodRequisitionID is required"))
	})

	t.Run("Fail validation for missing StockOfFoodID", func(t *testing.T) {
		foodRequisitionDetail := entity.FoodRequisitionDetail{
			Quantity:				50, 
			FoodRequisitionID:		1, 
			StockOfFoodID:			0,
		}

		ok, err := govalidator.ValidateStruct(foodRequisitionDetail)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("StockOfFoodID is required"))
	})
}