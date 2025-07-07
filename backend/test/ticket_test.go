package unit

import (
	"testing"
	"fmt"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidatePriceTicket(price float64) error {
	if price <= 0 {
		return fmt.Errorf("Price must be greater than 0")
	}
	return nil
}

func TestTicketValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid Ticket", func(t *testing.T) {
		ticketGenerationID1 := uint(1)
		ticket := entity.Ticket{
			Description:		"The Zoo", 
			Price:				150.0, 
			TicketGenerationID:	&ticketGenerationID1,
			TicketTypeID:		1,
		}

		ok, err := govalidator.ValidateStruct(ticket)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestTicketInvalidDescription(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Description", func(t *testing.T) {
		ticketGenerationID1 := uint(1)
		ticket := entity.Ticket{
			Description:		"", 
			Price:				150.0, 
			TicketGenerationID:	&ticketGenerationID1,
			TicketTypeID:		1,
		}

		ok, err := govalidator.ValidateStruct(ticket)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Description is required"))
	})

	t.Run("Fail validation for Description exceeding 100 characters", func(t *testing.T) {
		ticketGenerationID1 := uint(1)
		ticket := entity.Ticket{
			Description:		"Zoos provide a unique opportunity to learn about wildlife, conservation, and biodiversity, offering a safe space for endangered species and educating the public.", 
			Price:				150.0, 
			TicketGenerationID:	&ticketGenerationID1,
			TicketTypeID:		1,
		}

		ok, err := govalidator.ValidateStruct(ticket)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Description must be between 1 and 100 characters"))
	})
}

func TestTicketInvalidPrice(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Price", func(t *testing.T) {
		ticketGenerationID1 := uint(1)
		ticket := entity.Ticket{
			Description:		"The Zoo", 
			Price:				0, 
			TicketGenerationID:	&ticketGenerationID1,
			TicketTypeID:		1,
		}

		ok, err := govalidator.ValidateStruct(ticket)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Price is required"))
	})

	t.Run("Price must be greater than 0", func(t *testing.T) {
		price := -150.0
		err := ValidateSize(price)
		g.Expect(err).ToNot(BeNil())
	})
}

func TestTicketInvalidForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing TicketGenerationID", func(t *testing.T) {
		ticket := entity.Ticket{
			Description:		"The Zoo", 
			Price:				150.0, 
			TicketTypeID:		1,
		}

		ok, err := govalidator.ValidateStruct(ticket)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TicketGenerationID is required"))
	})

	t.Run("Fail validation for missing TicketTypeID", func(t *testing.T) {
		ticketGenerationID1 := uint(1)
		ticket := entity.Ticket{
			Description:		"The Zoo", 
			Price:				150.0, 
			TicketGenerationID:	&ticketGenerationID1,
			TicketTypeID:		0,
		}

		ok, err := govalidator.ValidateStruct(ticket)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("TicketTypeID is required"))
	})
}

