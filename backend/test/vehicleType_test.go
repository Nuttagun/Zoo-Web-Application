package unit

import (
	"testing"
	"fmt"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidateQuantityVehicleType(quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("Quantity must be greater than 0")
	}
	return nil
}

func TestVehicleTypeValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid VehicleType", func(t *testing.T) {
		validType := []string{
			"Bicycle",    
			"Golf Cart",      
		}

		for _, VehicleType := range validType {
			vehicleType := entity.VehicleType{
				VehicleType:		VehicleType, 
				QuantityVehicle:	10, 
			}
	
			ok, err := govalidator.ValidateStruct(vehicleType)
			if !ok {
				t.Logf("Validation failed: %v", err)
			}
			g.Expect(ok).To(BeTrue())
			g.Expect(err).To(BeNil())
		}
	})
}

func TestTicketTypeInvalidType(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Type", func(t *testing.T) {
		vehicleType := entity.VehicleType{
			VehicleType:		"", 
			QuantityVehicle:	10, 
		}

		ok, err := govalidator.ValidateStruct(vehicleType)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Type is required"))
	})

	t.Run("Fail validation for Type exceeding 20 characters", func(t *testing.T) { 
		vehicleType := entity.VehicleType{
			VehicleType:		"Bicycleeeeeeeeeeeeeeeeeeeeeeeeeee", 
			QuantityVehicle:	10, 
		}

		ok, err := govalidator.ValidateStruct(vehicleType)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Type must be between 1 and 20 characters"))
	})
}

func TestVehicleTypeInvalidQuantity(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Quantity", func(t *testing.T) {
		vehicleType := entity.VehicleType{
			VehicleType:		"Bicycle", 
			QuantityVehicle:	0, 
		}


		ok, err := govalidator.ValidateStruct(vehicleType)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Quantity is required"))
	})

	t.Run("Quantity must be greater than 0", func(t *testing.T) {
		quantity := -10
		err := ValidateQuantityVehicleType(quantity)
		g.Expect(err).ToNot(BeNil()) 
		g.Expect(err.Error()).To(Equal("Quantity must be greater than 0"))
	})
}