package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidateReportDate() {

	govalidator.CustomTypeTagMap.Set("current_date", govalidator.CustomTypeValidator(func(i interface{}, context interface{}) bool {
		reportDate, ok := i.(time.Time)
		if !ok {
			return false
		}

		currentDate := time.Now().Format("2006-01-02")
		inputDate := reportDate.Format("2006-01-02")
		return currentDate == inputDate
	}))
}

func TestValidReportInput(t *testing.T) {
	g := NewGomegaWithT(t)
	ValidateReportDate()

	t.Run("should pass validation for valid Report", func(t *testing.T) {
		report := entity.Report{
			Title:       "Animal Health Check",
			Description: "Detailed report on animal's health condition.",
			ReportDate:  time.Now(),
			StatusVet:   "Not Assigned",
			Picture:     "healthcheck.jpg",
			AnimalID:    1,
			EmployeeID:  2,
		}

		ok, err := govalidator.ValidateStruct(report)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidReportTitle(t *testing.T) {
	g := NewGomegaWithT(t)
	ValidateReportDate()

	t.Run("should fail validation for missing Title", func(t *testing.T) {
		report := entity.Report{
			Title:       "",
			Description: "Detailed report on animal's health condition.",
			ReportDate:  time.Now(),
			StatusVet:   "Not Assigned",
			Picture:     "healthcheck.jpg",
			AnimalID:    1,
			EmployeeID:  2,
		}

		ok, err := govalidator.ValidateStruct(report)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Title is required"))
	})
}

func TestInvalidReportDescription(t *testing.T) {
	g := NewGomegaWithT(t)
	ValidateReportDate()

	t.Run("should fail validation for missing Description", func(t *testing.T) {
		report := entity.Report{
			Description: "",
			Title:       "Animal Health Check",
			ReportDate:  time.Now(),
			StatusVet:   "Not Assigned",
			Picture:     "healthcheck.jpg",
			AnimalID:    1,
			EmployeeID:  2,
		}

		ok, err := govalidator.ValidateStruct(report)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Description is required"))
	})
}

func TestInvalidReportDate(t *testing.T) {
	g := NewGomegaWithT(t)
	ValidateReportDate()

	t.Run("should fail validation for missing Report Date", func(t *testing.T) {
		report := entity.Report{
			ReportDate:  time.Time{},
			Title:       "Animal Health Check",
			Description: "Detailed report on animal's health condition.",
			StatusVet:   "Not Assigned",
			Picture:     "healthcheck.jpg",
			AnimalID:    1,
			EmployeeID:  2,
		}

		ok, err := govalidator.ValidateStruct(report)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Report Date is required"))
	})
	t.Run("should fail validation for invalid ReportDate", func(t *testing.T) {
		report := entity.Report{
			ReportDate:  time.Now().AddDate(0, 0, -1),
			Title:       "Animal Health Check",
			Description: "Detailed report on animal's health condition.",
			StatusVet:   "Not Assigned",
			Picture:     "healthcheck.jpg",
			AnimalID:    1,
			EmployeeID:  2,
		}

		ok, err := govalidator.ValidateStruct(report)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Report Date must be today")) 
	})
}

func TestInvalidReportPicture(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Picture", func(t *testing.T) {
		report := entity.Report{
			Picture:     "",
			Title:       "Animal Health Check",
			Description: "Detailed report on animal's health condition.",
			ReportDate:  time.Now(),
			StatusVet:   "Not Assigned",
			AnimalID:    1,
			EmployeeID:  2,
		}

		ok, err := govalidator.ValidateStruct(report)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Picture is required"))
	})
}

func TestInvalidReportForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing AnimalID", func(t *testing.T) {
		report := entity.Report{
			AnimalID:    0,
			Title:       "Animal Health Check",
			Description: "Detailed report on animal's health condition.",
			ReportDate:  time.Now(),
			StatusVet:   "Not Assigned",
			Picture:     "healthcheck.jpg",
			EmployeeID:  2,
		}

		ok, err := govalidator.ValidateStruct(report)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("AnimalID is required"))
	})
}
