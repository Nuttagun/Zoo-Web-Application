package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
	"github.com/stretchr/testify/assert"
)


func generateLongStringEvent(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func TestValidEventInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Event", func(t *testing.T) {
		event := entity.Event{
			Title:       "Zoo Anniversary Celebration",
			Description: "A grand celebration for the zoo's 10th anniversary.",
			StartDate:   time.Now(),
			EndDate:     time.Now().Add(1 * time.Hour), 
			Picture:     "anniversary.jpg",
			ZoneID:      1,
			AnimalID:    2,
			EmployeeID:  3,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidEventTitle(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Title", func(t *testing.T) {
		event := entity.Event{
			Title:       "",
			Description: "A valid description",
			StartDate:   time.Now(),
			EndDate:     time.Now().Add(1 * time.Hour),
			ZoneID:      1,
			AnimalID:    2,
			EmployeeID:  3,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Title is required"))
	})

	t.Run("should fail validation for Title exceeding 100 characters", func(t *testing.T) {
		event := entity.Event{
			Title:       generateLongStringEvent(101), 
			Description: "A valid description",
			StartDate:   time.Now(),
			EndDate:     time.Now().Add(1 * time.Hour),
			ZoneID:      1,
			AnimalID:    2,
			EmployeeID:  3,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Title must be between 1 and 100 characters"))
	})
}

func TestInvalidEventDescription(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Description", func(t *testing.T) {
		event := entity.Event{
			Title:       "A valid title",
			Description: "",
			StartDate:   time.Now(),
			EndDate:     time.Now().Add(1 * time.Hour),
			ZoneID:      1,
			AnimalID:    2,
			EmployeeID:  3,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Description is required"))
	})
}

func TestInvalidEventDates(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing StartDate", func(t *testing.T) {
		event := entity.Event{
			Title:       "A valid title",
			Description: "A valid description",
			EndDate:     time.Now().Add(1 * time.Hour),
			ZoneID:      1,
			AnimalID:    2,
			EmployeeID:  3,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Start Date is required"))
	})

	t.Run("End Date must be after Start Date", func(t *testing.T) {
		event := entity.Event{
			Title:       "A valid title",
			Description: "A valid description",
			StartDate:   time.Now(),
			ZoneID:      1,
			AnimalID:    2,
			EmployeeID:  3,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("End Date is required"))
	})

	t.Run("should fail validation for missing EndDate", func(t *testing.T) {
		startDate := time.Now()
		endDate := startDate.Add(1 * time.Hour) 
		event := entity.Event{
			StartDate:   startDate,
			EndDate:     endDate,
		}

		assert.True(t, endDate.After(startDate), "EndDate should be after StartDate")

		event.EndDate = startDate
		assert.False(t, event.EndDate.After(event.StartDate), "EndDate should not be the same as StartDate")

		event.EndDate = startDate.Add(-1 * time.Hour) 
		assert.False(t, event.EndDate.After(event.StartDate), "EndDate should not be before StartDate")
	})
}

func TestInvalidEventRelationships(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing ZoneID", func(t *testing.T) {
		event := entity.Event{
			Title:       "A valid title",
			Description: "A valid description",
			StartDate:   time.Now(),
			EndDate:     time.Now().Add(1 * time.Hour),
			AnimalID:    2,
			EmployeeID:  3,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ZoneID is required"))
	})

	t.Run("should fail validation for missing AnimalID", func(t *testing.T) {
		event := entity.Event{
			Title:       "A valid title",
			Description: "A valid description",
			StartDate:   time.Now(),
			EndDate:     time.Now().Add(1 * time.Hour),
			ZoneID:      1,
			EmployeeID:  3,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("AnimalID is required"))
	})

	t.Run("should fail validation for missing EmployeeID", func(t *testing.T) {
		event := entity.Event{
			Title:       "A valid title",
			Description: "A valid description",
			StartDate:   time.Now(),
			EndDate:     time.Now().Add(1 * time.Hour),
			ZoneID:      1,
			AnimalID:    2,
		}

		ok, err := govalidator.ValidateStruct(event)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})
}
