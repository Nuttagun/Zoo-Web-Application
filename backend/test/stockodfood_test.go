package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func generateLongTextString(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func TestValidStockOfFoodInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid StockOfFood", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      "Rice",
			Quantity:      50,
			ExpiryDate:    time.Now().AddDate(1, 0, 0), 
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidStockOfFoodFoodname(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Foodname", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      "",
			Quantity:      50,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Foodname is required"))
	})

	t.Run("should fail validation for Foodname exceeding 100 characters", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      generateLongTextString(101),
			Quantity:      50,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Foodname must be between 1 and 100 characters"))
	})

	t.Run("should fail validation for Foodname with special characters", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      "Rice@123",
			Quantity:      50,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Foodname must not contain special characters"))
	})
}

func TestInvalidStockOfFoodQuantity(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for invalid Quantity", func(t *testing.T) {
		// Case with Quantity = 0 (should fail required validation)
		stockOfFoodZero := entity.StockOfFood{
			Foodname:      "Rice",
			Quantity:      0,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFoodZero)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Quantity is required"))

		// Case with Quantity = -1 (should fail range validation)
		stockOfFoodNegative := entity.StockOfFood{
			Foodname:      "Rice",
			Quantity:      -1,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err = govalidator.ValidateStruct(stockOfFoodNegative)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Quantity must be between 1 and 99999"))
	})
}



func TestInvalidStockOfFoodExpiryDate(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing ExpiryDate", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      "Rice",
			Quantity:      50,
			ExpiryDate:    time.Time{},
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ExpiryDate is required"))
	})
}

func TestInvalidStockOfFoodPictureOfFood(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing PictureOfFood", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      "Rice",
			Quantity:      50,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("PictureOfFood is required"))
	})
}

func TestInvalidStockOfFoodForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing ContainerOfFoodID", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      "Rice",
			Quantity:      50,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 0,
			CatagoryOfFoodID: 2,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ContainerOfFoodID is required"))
	})

	t.Run("should fail validation for missing CatagoryOfFoodID", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      "Rice",
			Quantity:      50,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 0,
			EmployeeID:    3,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("CatagoryOfFoodID is required"))
	})

	t.Run("should fail validation for missing EmployeeID", func(t *testing.T) {
		stockOfFood := entity.StockOfFood{
			Foodname:      "Rice",
			Quantity:      50,
			ExpiryDate:    time.Now().AddDate(1, 0, 0),
			PictureOfFood: "rice.jpg",
			ContainerOfFoodID: 1,
			CatagoryOfFoodID: 2,
			EmployeeID:    0,
		}

		ok, err := govalidator.ValidateStruct(stockOfFood)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})
}
