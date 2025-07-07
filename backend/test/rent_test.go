package unit

import (
	"fmt"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
	"github.com/stretchr/testify/assert"
)

func ValidateTotalPriceRent(price float64) error {
	if price <= 0 {
		return fmt.Errorf("Total Price must be greater than 0")
	}
	return nil
}

func ValidateTotalQuantity(quantity int) error {
	if quantity <= 0 {
		return fmt.Errorf("Total Quantity must be greater than 0")
	}
	return nil
}

func ValidateEndTime(startTime, endTime time.Time) error {
	duration := endTime.Sub(startTime)

	if duration != 2*time.Hour {
		return fmt.Errorf("End Time must be exactly 2 hours after Start Time")
	}

	return nil
}


func TestRentValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid Rent", func(t *testing.T) {
		ticketBookedID1 := uint(1)
		rent := entity.Rent{
			TotalQuantity:	5,
			RentDate:  		time.Now(),	 	
			StartTime:  	time.Now(),		
			EndTime: 		time.Now().Add(2 * time.Hour),	
			TotalPrice:		100.0,	
			TicketBookedID:	&ticketBookedID1,	
		}

		ok, err := govalidator.ValidateStruct(rent)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestRentInvalidRentDate(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Rent Date", func(t *testing.T) {
		ticketBookedID1 := uint(1)
		rent := entity.Rent{
			TotalQuantity:	5,
			RentDate:  		time.Time{},		
			StartTime:  	time.Now(),
			EndTime: 		time.Now().Add(2 * time.Hour),
			TotalPrice:		100.0,
			TicketBookedID:	&ticketBookedID1,
		}

		ok, err := govalidator.ValidateStruct(rent)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Rent Date is required"))
	})
}

func TestRentInvalidTotalPrice(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Total Price", func(t *testing.T) {
		ticketBookedID1 := uint(1)
		rent := entity.Rent{
			TotalQuantity:	5,
			RentDate:  		time.Now(),
			StartTime:  	time.Now(),
			EndTime: 		time.Now().Add(2 * time.Hour),
			TotalPrice:		0,	
			TicketBookedID:	&ticketBookedID1,
		}

		ok, err := govalidator.ValidateStruct(rent)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Total Price is required"))
	})

	t.Run("Total Price must be greater than 0", func(t *testing.T) {
		price := -100.0
		err := ValidateTotalPriceRent(price)
		g.Expect(err).ToNot(BeNil()) 
	})
}

func TestRentInvalidTotalQuantity(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Total Quantity", func(t *testing.T) {
		ticketBookedID1 := uint(1)
		rent := entity.Rent{
			TotalQuantity:	0,		
			RentDate:  		time.Now(),
			StartTime:  	time.Now(),
			EndTime: 		time.Now().Add(2 * time.Hour),
			TotalPrice:		100.0,
			TicketBookedID:	&ticketBookedID1,
		}

		ok, err := govalidator.ValidateStruct(rent)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Total Quantity is required"))
	})

	t.Run("Total Quantity must be greater than 0", func(t *testing.T) {
		quantity := -5
		err := ValidateTotalQuantity(quantity)
		g.Expect(err).ToNot(BeNil()) 
		g.Expect(err.Error()).To(Equal("Total Quantity must be greater than 0"))
	})
}

func TestInvalidRentTimes(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Start Time", func(t *testing.T) {
		ticketBookedID1 := uint(1)
		rent := entity.Rent{
			TotalQuantity:	5,
			RentDate:  		time.Now(),
			EndTime: 		time.Now().Add(2 * time.Hour),
			TotalPrice:		100.0,
			TicketBookedID:	&ticketBookedID1,
		}

		ok, err := govalidator.ValidateStruct(rent)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Start Time is required"))
	})

	t.Run("Fail validation for missing End Time", func(t *testing.T) {
		ticketBookedID1 := uint(1)
		rent := entity.Rent{
			TotalQuantity:	5,
			RentDate:  		time.Now(),
			StartTime:  	time.Now(),
			TotalPrice:		100.0,
			TicketBookedID:	&ticketBookedID1,
		}

		ok, err := govalidator.ValidateStruct(rent)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("End Time is required"))
	})

	t.Run("End Time must be after Start Date", func(t *testing.T) {
		startTime := time.Now()
		endTime := startTime.Add(2 * time.Hour) 
		rent := entity.Rent{
			StartTime:  	startTime,
			EndTime: 		endTime,

		}

		assert.True(t, endTime.After(startTime), "End Time should be after Start Time")

		rent.EndTime = startTime
		assert.False(t, rent.EndTime.After(rent.StartTime), "End Time should not be the same as Start Time")

		rent.EndTime = startTime.Add(-2 * time.Hour) 
		assert.False(t, rent.EndTime.After(rent.StartTime), "End Time should not be before Start Time")
	})

	t.Run("Fail validation when End Time is less than 2 hours after Start Time", func(t *testing.T) {
		startTime := time.Now()
		rent := entity.Rent{
			StartTime:       startTime,
			EndTime:         startTime.Add(1 * time.Hour), 
		}

		err := ValidateEndTime(rent.StartTime, rent.EndTime)
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("End Time must be exactly 2 hours after Start Time"))
	})

	t.Run("Fail validation when End Time is more than 2 hours after Start Time", func(t *testing.T) {
		startTime := time.Now()
		rent := entity.Rent{
			StartTime:       startTime,
			EndTime:         startTime.Add(3 * time.Hour), 
		}

		err := ValidateEndTime(rent.StartTime, rent.EndTime)
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("End Time must be exactly 2 hours after Start Time"))
	})

	t.Run("Pass validation when End Time is exactly 2 hours after Start Time", func(t *testing.T) {
		startTime := time.Now()
		rent := entity.Rent{
			StartTime:       startTime,
			EndTime:         startTime.Add(2 * time.Hour), 
		}

		err := ValidateEndTime(rent.StartTime, rent.EndTime)
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidRentForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing TicketBookedID", func(t *testing.T) {
		rent := entity.Rent{
			TotalQuantity:	5,
			RentDate:  		time.Now(),
			StartTime:  	time.Now(),
			EndTime: 		time.Now().Add(2 * time.Hour),
			TotalPrice:		100.0,
		}

		ok, err := govalidator.ValidateStruct(rent)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TicketBookedID is required"))
	})
}
