package unit

import (
	"fmt"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func generateLongStringAnimal(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func ValidateWeight(value float64) error {
	if value <= 0.01 || value > 9999.99 {
		return fmt.Errorf("Weight must be a valid number up to 9999.99")
	}
	return nil
}

func ValidateHeight(value float64) error {
	if value <= 0.01 || value > 9999.99 {
		return fmt.Errorf("Height must be a valid number up to 9999.99")
	}
	return nil
}

func TestValidAnimalInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Animal", func(t *testing.T) {
		animal := entity.Animal{
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       100.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())

		err = ValidateWeight(animal.Weight)
		g.Expect(err).To(BeNil(), "Unexpected validation error for Weight: %v", err)

		err = ValidateHeight(animal.Height)
		g.Expect(err).To(BeNil(), "Unexpected validation error for Height: %v", err)
	})
}

func TestInvalidAnimalName(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Name", func(t *testing.T) {
		animal := entity.Animal{
			Name:         "",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Name is required"))
	})

	t.Run("should fail validation for Name exceeding 100 characters", func(t *testing.T) {
		animal := entity.Animal{
			Name:         generateLongStringAnimal(101),
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Name must be between 1 and 100 characters"))
	})

	t.Run("should fail validation for Name with special characters", func(t *testing.T) {
		animal := entity.Animal{
			Name:         "Lion@King!",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Name must not contain special characters"))
	})
}

func TestInvalidAnimalWeight(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for invalid Weight", func(t *testing.T) {
		weight := -10.0
		err := ValidateWeight(weight)
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Weight must be a valid number up to 9999.99"))
	})
}

func TestInvalidAnimalHeight(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for invalid Height", func(t *testing.T) {
		height := 10000.0
		err := ValidateHeight(height)
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Height must be a valid number up to 9999.99"))
	})
}

func TestInvalidAnimalOtherFields(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Description", func(t *testing.T) {
		animal := entity.Animal{
			Description:  "",
			Name:         "Lion King",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Description is required"))
	})

	t.Run("should fail validation for missing Birthplace", func(t *testing.T) {
		animal := entity.Animal{
			Birthplace:   "",
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Birthplace is required"))
	})

	t.Run("should fail validation for missing BirthDay", func(t *testing.T) {
		animal := entity.Animal{
			BirthDay:     time.Time{},
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("BirthDay is required"))
	})

	t.Run("should fail validation for missing Picture", func(t *testing.T) {
		animal := entity.Animal{
			Picture:      "",
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Picture is required"))
	})

}

func TestInvalidAnimalForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing SexID", func(t *testing.T) {
		animal := entity.Animal{
			SexID:        0,
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("SexID is required"))
	})

	t.Run("should fail validation for missing BiologicalID", func(t *testing.T) {
		animal := entity.Animal{
			BiologicalID: 0,
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("BiologicalID is required"))
	})

	t.Run("should fail validation for missing BehavioralID", func(t *testing.T) {
		animal := entity.Animal{
			BehavioralID: 0,
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0),
			Picture: 	  "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			EmployeeID:   4,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("BehavioralID is required"))
	})

	t.Run("should fail validation for missing EmployeeID", func(t *testing.T) {
		animal := entity.Animal{
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   0,
			HabitatID:    5,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})

	t.Run("should fail validation for missing HabitatID", func(t *testing.T) {
		animal := entity.Animal{
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    0,
			HealthAnimalID: 1,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("HabitatID is required"))
	})

	t.Run("should fail validation for missing HealthAnimalID", func(t *testing.T) {
		animal := entity.Animal{
			Name:         "Lion King",
			Description:  "A strong and majestic lion.",
			Weight:       190.5,
			Height:       1.2,
			Birthplace:   "Africa",
			BirthDay:     time.Now().AddDate(-5, 0, 0), 
			Picture:      "lion.jpg",
			Note:         "No special conditions",
			SexID:        1,
			BiologicalID: 2,
			BehavioralID: 3,
			EmployeeID:   4,
			HabitatID:    1,
			HealthAnimalID: 0,
		}

		ok, err := govalidator.ValidateStruct(animal)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("HealthAnimalID is required"))
	})
}