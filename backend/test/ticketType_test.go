package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestTicketTypeValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid Type", func(t *testing.T) {
		validType := []string{
			"Wild",    
			"Survival",    
			"OceanSea",    
		}

		for _, TicketType := range validType {
			ticketType := entity.TicketType{
				Ticket:			TicketType, 
				Description: 	"Savanah zone",
				Picture:		"savannah.jpg",
			}
	
			ok, err := govalidator.ValidateStruct(ticketType)
			if !ok {
				t.Logf("Validation failed: %v", err)
			}
			g.Expect(ok).To(BeTrue())
			g.Expect(err).To(BeNil())
		}
	})
}

func TestTicketTypeInvalidTicket(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Ticket", func(t *testing.T) {
		ticketType := entity.TicketType{
			Ticket:			"", 
			Description: 	"Savanah zone",
			Picture:		"savannah.jpg",
		}

		ok, err := govalidator.ValidateStruct(ticketType)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Ticket is required"))
	})

	t.Run("Fail validation for Generation exceeding 20 characters", func(t *testing.T) {
		ticketType := entity.TicketType{
			Ticket:		"OceanSeaInThewholeWorldAreGorgeous", 
			Description: 	"Savanah zone",
			Picture:		"savannah.jpg",
		}

		ok, err := govalidator.ValidateStruct(ticketType)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Ticket type must be between 1 and 20 characters"))
	})

}