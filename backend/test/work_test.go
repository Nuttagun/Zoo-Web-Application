package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestValidWorkInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Work", func(t *testing.T) {
		work := entity.Work{
			Feed:       true,
			Cleaning:   true,
			FinishDate: time.Now(),
			EmployeeID: 1,
			HabitatID:  2,
		}

		ok, err := govalidator.ValidateStruct(work)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidWorkInputDate(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing FinishDate", func(t *testing.T) {
		work := entity.Work{
			Feed:       true,
			Cleaning:   true,
			EmployeeID: 1,
			HabitatID:  2,
		}

		ok, err := govalidator.ValidateStruct(work)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Finish Date is required"))
	})
}

func TestValidWorkFeedAndCleaning(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation when Feed is true and Cleaning is false", func(t *testing.T) {
		work := entity.Work{
			Feed:       true,  
			Cleaning:   false, 
			FinishDate: time.Now(),
			EmployeeID: 1,
			HabitatID:  1,
		}

		ok, err := govalidator.ValidateStruct(work)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("should pass validation when Feed is false and Cleaning is true", func(t *testing.T) {
		work := entity.Work{
			Feed:       false, 
			Cleaning:   true,  
			FinishDate: time.Now(),
			EmployeeID: 1,
			HabitatID:  1,
		}

		ok, err := govalidator.ValidateStruct(work)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidWorkHabitat(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation when HabitatID is missing", func(t *testing.T) {
		work := entity.Work{
			Feed:       true,
			Cleaning:   true,
			FinishDate: time.Now(),
			EmployeeID: 1, 
		}

		ok, err := govalidator.ValidateStruct(work)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("HabitatID is required"))
	})
}

func TestInvalidWorkEmployee(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation when EmployeeID is missing", func(t *testing.T) {
		work := entity.Work{
			Feed:       true,
			Cleaning:   true,
			FinishDate: time.Now(),
			HabitatID:  1, 
		}

		ok, err := govalidator.ValidateStruct(work)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})
}
