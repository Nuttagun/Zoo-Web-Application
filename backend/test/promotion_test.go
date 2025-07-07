package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestPromotionAllPass(t *testing.T) {
	g := NewGomegaWithT(t)
	promotionStatusID := uint(1)
	conditionID := uint(1)
	promotionCategoryID := uint(1)
	EmployeeID := uint(1)

	t.Run("Pass All", func(t *testing.T) {

		promotion := entity.Promotion{
			PromotionName:       "Promotion A",
			StartDate:           time.Now(),
			EndDate:             time.Now().Add(24 * time.Hour),
			Discount:            20.01,
			Description:         "Special Discount",
			NumberPromotionUse:  100,
			PromotionStatusID:   &promotionStatusID,
			ConditionID:         &conditionID,
			PromotionCategoryID: &promotionCategoryID,
			EmployeeID:              &EmployeeID,
		}

		ok, err := govalidator.ValidateStruct(promotion)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestPromotionName(t *testing.T) {
	g := NewGomegaWithT(t)
	promotionStatusID := uint(1)
	conditionID := uint(1)
	promotionCategoryID := uint(1)
	EmployeeID := uint(1)

	t.Run("Invalid PromotionName", func(t *testing.T) {

		promotion := entity.Promotion{
			PromotionName:       "", 
			StartDate:           time.Now(),
			EndDate:             time.Now().Add(24 * time.Hour),
			Discount:            20.01,
			Description:         "Special Discount",
			NumberPromotionUse:  100,
			PromotionStatusID:   &promotionStatusID,
			ConditionID:         &conditionID,
			PromotionCategoryID: &promotionCategoryID,
			EmployeeID:              &EmployeeID,
		}

		ok, err := govalidator.ValidateStruct(promotion)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(Equal("Promotion Name is required"))
	})
}

func TestDiscount(t *testing.T) {
	g := NewGomegaWithT(t)
	promotionStatusID := uint(1)
	conditionID := uint(1)
	promotionCategoryID := uint(1)
	EmployeeID := uint(1)

	t.Run("Incorrect Input Discount Case Negative", func(t *testing.T) {

		promotion := entity.Promotion{
			PromotionName:       "Promotion A",
			StartDate:           time.Now(),
			EndDate:             time.Now().Add(24 * time.Hour),
			Discount:            -2.00, 
			Description:         "Special Discount",
			NumberPromotionUse:  100,
			PromotionStatusID:   &promotionStatusID,
			ConditionID:         &conditionID,
			PromotionCategoryID: &promotionCategoryID,
			EmployeeID:              &EmployeeID,
		}

		ok, err := govalidator.ValidateStruct(promotion)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(Equal("Discount must be between 0 and 100"))
	})
	t.Run("Incorrect Input Discount Case More than 100", func(t *testing.T) {

		promotion := entity.Promotion{
			PromotionName:       "Promotion A",
			StartDate:           time.Now(),
			EndDate:             time.Now().Add(24 * time.Hour),
			Discount:            101.00, 
			Description:         "Special Discount",
			NumberPromotionUse:  100,
			PromotionStatusID:   &promotionStatusID,
			ConditionID:         &conditionID,
			PromotionCategoryID: &promotionCategoryID,
			EmployeeID:              &EmployeeID,
		}

		ok, err := govalidator.ValidateStruct(promotion)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(Equal("Discount must be between 0 and 100"))
	})
}

func TestNumberPromotionUse(t *testing.T) {
	g := NewGomegaWithT(t)
	promotionStatusID := uint(1)
	conditionID := uint(1)
	promotionCategoryID := uint(1)
	EmployeeID := uint(1)

	t.Run("Incorrect Input Number Promotion Use Case Negative", func(t *testing.T) {

		promotion := entity.Promotion{
			PromotionName:       "Promotion A",
			StartDate:           time.Now(),
			EndDate:             time.Now().Add(24 * time.Hour),
			Discount:            50.20,
			Description:         "Special Discount",
			NumberPromotionUse:  -100, 
			PromotionStatusID:   &promotionStatusID,
			ConditionID:         &conditionID,
			PromotionCategoryID: &promotionCategoryID,
			EmployeeID:              &EmployeeID,
		}

		ok, err := govalidator.ValidateStruct(promotion)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(Equal("NumberPromotionUse must be at least 1 or More than limit(100000)"))
	})

	t.Run("Incorrect Input Number Promotion Use Case More Than Limit", func(t *testing.T) {

		promotion := entity.Promotion{
			PromotionName:       "Promotion A",
			StartDate:           time.Now(),
			EndDate:             time.Now().Add(24 * time.Hour),
			Discount:            50.20,
			Description:         "Special Discount",
			NumberPromotionUse:  999999, 
			PromotionStatusID:   &promotionStatusID,
			ConditionID:         &conditionID,
			PromotionCategoryID: &promotionCategoryID,
			EmployeeID:              &EmployeeID,
		}

		ok, err := govalidator.ValidateStruct(promotion)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())

		g.Expect(err.Error()).To(Equal("NumberPromotionUse must be at least 1 or More than limit(100000)"))
	})
}

func TestPromotionDescription(t *testing.T) {
	g := NewGomegaWithT(t)
	promotionStatusID := uint(1)
	conditionID := uint(1)
	promotionCategoryID := uint(1)
	EmployeeID := uint(1)

	t.Run("Not Input Description", func(t *testing.T) {

		promotion := entity.Promotion{
			PromotionName:       "Promotion A",
			StartDate:           time.Now(),
			EndDate:             time.Now().Add(24 * time.Hour),
			Discount:            50.20,
			Description:         "",
			NumberPromotionUse:  100, 
			PromotionStatusID:   &promotionStatusID,
			ConditionID:         &conditionID,
			PromotionCategoryID: &promotionCategoryID,
			EmployeeID:              &EmployeeID,
		}

		ok, err := govalidator.ValidateStruct(promotion)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Input Description", func(t *testing.T) {

		promotion := entity.Promotion{
			PromotionName:       "Promotion A",
			StartDate:           time.Now(),
			EndDate:             time.Now().Add(24 * time.Hour),
			Discount:            50.20,
			Description:         "Test A",
			NumberPromotionUse:  100, 
			PromotionStatusID:   &promotionStatusID,
			ConditionID:         &conditionID,
			PromotionCategoryID: &promotionCategoryID,
			EmployeeID:              &EmployeeID,
		}

		ok, err := govalidator.ValidateStruct(promotion)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	
}