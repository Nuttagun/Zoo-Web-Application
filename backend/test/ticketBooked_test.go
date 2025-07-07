package unit

import (
	"testing"
	"time"
	"fmt"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidateVisitDate() {

	govalidator.CustomTypeTagMap.Set("not_past_date", govalidator.CustomTypeValidator(func(i interface{}, context interface{}) bool {
		visitDate, ok := i.(time.Time)
		if !ok {
			return false
		}

		today := time.Now().Truncate(24 * time.Hour)
		visitDay := visitDate.Truncate(24 * time.Hour)
		return !visitDay.Before(today)
	}))
}

func ValidateQuantityCustomer(quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("Quantity Customer must be greater than 0")
	}
	return nil
}

func ValidateTotalPriceTicketBooked(price float64) error {
	if price <= 0 {
		return fmt.Errorf("Total Price must be greater than 0")
	}
	return nil
}

func TestTicketBookedValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	ValidateVisitDate()
	t.Run("Pass validation for valid Ticket Booked", func(t *testing.T) {
		bookingID1 := uint(1)
		ticketBooked := entity.TicketBooked{
			VisitDate:       	time.Now(),
			QuantityCustomer: 	5,
			TotalPrice:       	500.0,
			BookingID:			&bookingID1,
		}

		ok, err := govalidator.ValidateStruct(ticketBooked)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestTicketBookedVisitDate(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Visit Date", func(t *testing.T) {
		bookingID1 := uint(1)
		ticketBooked := entity.TicketBooked{
			VisitDate:			time.Time{},
			QuantityCustomer:  	2,		
			TotalPrice:  		300,
			BookingID:			&bookingID1,
		}

		ok, err := govalidator.ValidateStruct(ticketBooked)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Visit Date is required"))
	})

	
	ValidateVisitDate()
	t.Run("Fail validation for Visit Date in the past", func(t *testing.T) {
		bookingID1 := uint(1)
		ticketBooked := entity.TicketBooked{
			VisitDate:         time.Now().AddDate(0, 0, -1), 
			QuantityCustomer:  2,
			TotalPrice:        300,
			BookingID:         &bookingID1,
		}

		ok, err := govalidator.ValidateStruct(ticketBooked)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Visit Date cannot be in the past"))
	})

	t.Run("Pass validation for Visit Date in the future", func(t *testing.T) {
		bookingID1 := uint(1)
		ticketBooked := entity.TicketBooked{
			VisitDate:         time.Now().AddDate(0, 0, 1), 
			QuantityCustomer:  2,
			TotalPrice:        300,
			BookingID:         &bookingID1,
		}

		ok, err := govalidator.ValidateStruct(ticketBooked)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestTicketBookedInvalidQuantityCustomer(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Quantity Customer", func(t *testing.T) {
		bookingID1 := uint(1)
		ticketBooked := entity.TicketBooked{
			VisitDate:			time.Now(),
			QuantityCustomer:  	0,		
			TotalPrice:  		300,
			BookingID:			&bookingID1,
		}

		ok, err := govalidator.ValidateStruct(ticketBooked)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Quantity Customer is required"))
	})

	t.Run("Quantity Customer must be greater than 0", func(t *testing.T) {
		quantity := -2
		err := ValidateQuantityCustomer(quantity)
		g.Expect(err).ToNot(BeNil()) 
		g.Expect(err.Error()).To(Equal("Quantity Customer must be greater than 0"))
	})
}

func TestTicketBookedInvalidTotalPrice(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Total Price", func(t *testing.T) {
		bookingID1 := uint(1)
		ticketBooked := entity.TicketBooked{
			VisitDate:			time.Now(),
			QuantityCustomer:  	2,		
			TotalPrice:  		0,
			BookingID:			&bookingID1,
		}

		ok, err := govalidator.ValidateStruct(ticketBooked)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Total Price is required"))
	})

	t.Run("Total Price must be greater than 0", func(t *testing.T) {
		price := -300.0
		err := ValidateTotalPriceTicketBooked(price)
		g.Expect(err).ToNot(BeNil()) 
	})
}

func TestInvalidTicketBookedForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing BookingID", func(t *testing.T) {
		ticketBooked := entity.TicketBooked{
			VisitDate:			time.Now(),
			QuantityCustomer:  	2,		
			TotalPrice:  		300.0,
		}

		ok, err := govalidator.ValidateStruct(ticketBooked)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("BookingID is required"))
	})
}
