package unit

import (
	"testing"
	"fmt"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidateQuantityBookingZoo(quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("Quantity must be greater than 0")
	}
	return nil
}

func TestBookingZooValidInput(t *testing.T) {
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

func TestBookingZooInvalidQuantity(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Quantity", func(t *testing.T) {
		bookingZoo := entity.BookingZoo{
			Quantity:		0, 
			TicketID:		1, 
			TicketBookedID:	1,
		}


		ok, err := govalidator.ValidateStruct(bookingZoo)
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

func TestBookingZooInvalidForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing TicketID", func(t *testing.T) {
		bookingZoo := entity.BookingZoo{
			Quantity:		1, 
			TicketID:		0, 
			TicketBookedID:	1,
		}

		ok, err := govalidator.ValidateStruct(bookingZoo)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TicketID is required"))
	})

	t.Run("Fail validation for missing TicketBookedID", func(t *testing.T) {
		bookingZoo := entity.BookingZoo{
			Quantity:		1, 
			TicketID:		1, 
			TicketBookedID:	0,
		}

		ok, err := govalidator.ValidateStruct(bookingZoo)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TicketBookedID is required"))
	})
}