package unit

import (
	"fmt"
	"testing"
	"time"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidateAllPrice(price float64) error {
	if price <= 0 {
		return fmt.Errorf("All Price must be greater than 0")
	}
	return nil
}

func TestBookingValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid Vehicle", func(t *testing.T) {
		userID11 := uint(11)
		booking := entity.Booking{
			BookingDate:	time.Now(), 
			AllPrice:		1200.0, 
			UserID:			&userID11,
		}

		ok, err := govalidator.ValidateStruct(booking)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestBookingInvalidBookingDate(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Booking Date", func(t *testing.T) {
		userID11 := uint(11)
		booking := entity.Booking{
			BookingDate:	time.Time{}, 
			AllPrice:		1200.0, 
			UserID:			&userID11,
		}

		ok, err := govalidator.ValidateStruct(booking)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Booking Date is required"))
	})

}

func TestBookingInvalidAllPrice(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing All Price", func(t *testing.T) {
		userID11 := uint(11)
		booking := entity.Booking{
			BookingDate:	time.Now(), 
			AllPrice:		0, 
			UserID:			&userID11,
		}

		ok, err := govalidator.ValidateStruct(booking)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("All Price is required"))
	})

	t.Run("All Price must be greater than 0", func(t *testing.T) {
		price := -10.0
		err := ValidateSize(price)
		g.Expect(err).ToNot(BeNil())
	})
}

func TestBookingInvalidForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing UserID", func(t *testing.T) {
		booking := entity.Booking{
			BookingDate:	time.Now(), 
			AllPrice:		1200.0, 
		}


		ok, err := govalidator.ValidateStruct(booking)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("UserID is required"))
	})
}
