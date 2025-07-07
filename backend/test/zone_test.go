package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidZoneInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Zone", func(t *testing.T) {
		zone := entity.Zone{
			Zone:        "Adventure Zone",
			Description: "A fun and thrilling zone for adventurers.",
			Picture:     "adventure.jpg",
		}

		ok, err := govalidator.ValidateStruct(zone)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidZoneInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Zone", func(t *testing.T) {
		zone := entity.Zone{
			Zone:        "",
			Description: "A fun and thrilling zone for adventurers.",
			Picture:     "adventure.jpg",
		}

		ok, err := govalidator.ValidateStruct(zone)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Zone is required"))
	})

	t.Run("should fail validation for Zone exceeding 100 characters", func(t *testing.T) {
		longZone := ""
		for i := 0; i < 101; i++ {
			longZone += "A"
		}
		zone := entity.Zone{
			Zone:        longZone,
			Description: "A fun and thrilling zone for adventurers.",
			Picture:     "adventure.jpg",
		}

		ok, err := govalidator.ValidateStruct(zone)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Zone must be between 1 and 100 characters"))
	})

	t.Run("should fail validation for Zone with special characters", func(t *testing.T) {
		zone := entity.Zone{
			Zone:        "Safari@Zone!",
			Description: "A fun and thrilling zone for adventurers.",
			Picture:     "adventure.jpg",
		}

		ok, err := govalidator.ValidateStruct(zone)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Zone must not contain special characters"))
	})

	t.Run("should fail validation for missing Description", func(t *testing.T) {
		zone := entity.Zone{
			Zone:        "Adventure Zone",
			Description: "",
			Picture:     "adventure.jpg",
		}

		ok, err := govalidator.ValidateStruct(zone)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Description is required"))
	})

	t.Run("should fail validation for missing Picture", func(t *testing.T) {
		zone := entity.Zone{
			Zone:        "Adventure Zone",
			Description: "A fun and thrilling zone for adventurers.",
			Picture:     "",
		}

		ok, err := govalidator.ValidateStruct(zone)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Picture is required"))
	})
}
