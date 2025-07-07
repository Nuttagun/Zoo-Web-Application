package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestTicketGenerationValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid Generation", func(t *testing.T) {
		ticketGeneration := entity.TicketGeneration{
			Generation:		"Female", 
		}

		ok, err := govalidator.ValidateStruct(ticketGeneration)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestTicketGenerationInvalidGeneration(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Generation", func(t *testing.T) {
		ticketGeneration := entity.TicketGeneration{
			Generation:		"", 
		}

		ok, err := govalidator.ValidateStruct(ticketGeneration)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Generation is required"))
	})

	t.Run("Fail validation for Generation exceeding 20 characters", func(t *testing.T) {
		ticketGeneration := entity.TicketGeneration{
			Generation:		"Femalemalefemalemalefemalemale", 
		}

		ok, err := govalidator.ValidateStruct(ticketGeneration)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Generation must be between 1 and 20 characters"))
	})
}