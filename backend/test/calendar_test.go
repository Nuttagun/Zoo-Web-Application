package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidCalendarInput(t *testing.T) {
	g := NewGomegaWithT(t)
	employeeID := uint(1)
	t.Run("should pass validation for valid Calendar", func(t *testing.T) {
		calendar := entity.Calendar{
			Title:      "Team Meeting",
			CalendarDate:  time.Now(),
			AllDay:     false,
			EmployeeID: &employeeID,
		}

		ok, err := govalidator.ValidateStruct(calendar)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidCalendarTitle(t *testing.T) {
	g := NewGomegaWithT(t)
	employeeID := uint(1)
	t.Run("should fail validation for missing Title", func(t *testing.T) {
		calendar := entity.Calendar{
			Title:      "",
			CalendarDate:  time.Now(),
			AllDay:     true,
			EmployeeID: &employeeID,
		}

		ok, err := govalidator.ValidateStruct(calendar)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Title is required"))
	})

	t.Run("should fail validation for Title exceeding 100 characters", func(t *testing.T) {
		longTitle := "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
		calendar := entity.Calendar{
			Title:      longTitle,
			CalendarDate:  time.Now(),
			AllDay:     true,
			EmployeeID: &employeeID,
		}

		ok, err := govalidator.ValidateStruct(calendar)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Title must be between 1 and 100 characters"))
	})
}

func TestInvalidCalendarStartDate(t *testing.T) {
	g := NewGomegaWithT(t)
	employeeID := uint(1)
	t.Run("should fail validation for missing StartDate", func(t *testing.T) {
		calendar := entity.Calendar{
			Title:      "Team Meeting",
			AllDay:     false,
			EmployeeID: &employeeID,
		}

		ok, err := govalidator.ValidateStruct(calendar)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Start date is required"))
	})
}

func TestInvalidCalendarEmployeeID(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run("should fail validation for missing EmployeeID", func(t *testing.T) {
		calendar := entity.Calendar{
			Title:      "Team Meeting",
			CalendarDate:  time.Now(),
			AllDay:     true,
			EmployeeID: nil,
		}

		ok, err := govalidator.ValidateStruct(calendar)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})
}
