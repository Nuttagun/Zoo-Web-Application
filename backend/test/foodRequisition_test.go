package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidFoodRequisitionInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Food Requisition", func(t *testing.T) {
		WorkID := uint(1)
		foodRequisition := entity.FoodRequisition{
			Note:				"Out of animal food", 
			RequisitionDate:	time.Now(), 
			WorkID:				&WorkID,
		}

		ok, err := govalidator.ValidateStruct(foodRequisition)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidFoodRequisitionNote(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Note", func(t *testing.T) {
		WorkID := uint(1)
		foodRequisition := entity.FoodRequisition{
			Note:				"", 
			RequisitionDate:	time.Now(), 
			WorkID:				&WorkID,
		}

		ok, err := govalidator.ValidateStruct(foodRequisition)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Note is required"))
	})
}

func TestInvalidFoodRequisitionRequisitionDate(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Requisition date", func(t *testing.T) {
		WorkID := uint(1)
		foodRequisition := entity.FoodRequisition{
			Note:				"Out of animal food", 
			RequisitionDate:	time.Time{}, 
			WorkID:				&WorkID,
		}

		ok, err := govalidator.ValidateStruct(foodRequisition)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Requisition date is required"))
	})
}

func TestInvalidFoodRequisitionWorkID(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing WorkID", func(t *testing.T) {
		foodRequisition := entity.FoodRequisition{
			Note:				"Out of animal food", 
			RequisitionDate:	time.Now(), 
		}

		ok, err := govalidator.ValidateStruct(foodRequisition)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("WorkID is required"))
	})
}
