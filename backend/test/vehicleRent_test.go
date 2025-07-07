package unit

import (
	"testing"
	"fmt"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidateQuantityVehicleRent(quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("Quantity must be greater than 0")
	}
	return nil
}

func TestVehicleRentZooValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid Booking Zoo", func(t *testing.T) {
		bookingZoo := entity.BookingZoo{
			Quantity:		1, 
			TicketID:		1, 
			TicketBookedID:	1,
		}

		ok, err := govalidator.ValidateStruct(bookingZoo)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestVehicleRentInvalidQuantity(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Quantity", func(t *testing.T) {
		vehicleRent := entity.VehicleRent{
			Quantity:	0, 
			RentID:		1, 
			VehicleID:	1,
		}


		ok, err := govalidator.ValidateStruct(vehicleRent)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Quantity is required"))
	})

	t.Run("Quantity must be greater than 0", func(t *testing.T) {
		quantity := -2
		err := ValidateQuantityBookingZoo(quantity)
		g.Expect(err).ToNot(BeNil()) 
		g.Expect(err.Error()).To(Equal("Quantity must be greater than 0"))
	})
}

func TestVehicleRentInvalidForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing RentID", func(t *testing.T) {
		vehicleRent := entity.VehicleRent{
			Quantity:	1, 
			RentID:		0, 
			VehicleID:	1,
		}

		ok, err := govalidator.ValidateStruct(vehicleRent)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("RentID is required"))
	})

	t.Run("Fail validation for missing VehicleID", func(t *testing.T) {
		vehicleRent := entity.VehicleRent{
			Quantity:	1, 
			RentID:		1, 
			VehicleID:	0,
		}

		ok, err := govalidator.ValidateStruct(vehicleRent)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("VehicleID is required"))
	})
}