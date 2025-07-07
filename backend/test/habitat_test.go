package unit

import (
	"fmt"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func generateLongStringHabitat(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func ValidateCapacity(capacity int) error {
	if capacity <= 0 || capacity > 10 {
		return fmt.Errorf("Capacity must be between 0 to 10")
	}
	return nil
}

func ValidateSize(size float64) error {
	if size <= 1.00 || size > 9999.99 {
		return fmt.Errorf("Size must be between 0 to 9999.99")
	}
	return nil
}

func TestValidHabitatInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should pass validation for valid Habitat", func(t *testing.T) {
		habitat := entity.Habitat{
			Name:     "Savanna Habitat",
			Size:     1500.25,
			Capacity: 10,
			Picture:  "savanna.jpg",
			ZoneID:   1,
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(habitat)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidHabitatName(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Name", func(t *testing.T) {
		habitat := entity.Habitat{
			Name:     "",
			Size:     1500.25,
			Capacity: 10,
			Picture:  "savanna.jpg",
			ZoneID:   1,
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(habitat)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Name is required"))
	})

	t.Run("should fail validation for Name exceeding 100 characters", func(t *testing.T) {
		habitat := entity.Habitat{
			Name:     generateLongStringHabitat(101), // เกิน 100 ตัวอักษร
			Size:     1500.25,
			Capacity: 10,
			Picture:  "savanna.jpg",
			ZoneID:   1,
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(habitat)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Name must be between 1 and 100 characters"))
	})

	t.Run("should fail validation for Name with special characters", func(t *testing.T) {
		habitat := entity.Habitat{
			Name:     "Savanna@Zone!",
			Size:     1500.25,
			Capacity: 10,
			Picture:  "savanna.jpg",
			ZoneID:   1,
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(habitat)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Name must not contain special characters"))
	})
}

func TestInvalidHabitatSize(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Size", func(t *testing.T) {
		habitat := entity.Habitat{
			Name:     "Savanna Habitat",
			Size:     0, 
			Capacity: 10,
			Picture:  "savanna.jpg",
			ZoneID:   1,
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(habitat)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Size is required"))
	})

	t.Run("should fail validation for invalid Size", func(t *testing.T) {
		invalidSizes := []float64{
			-10.0,     
			10000.0,   
		}

		for _, size := range invalidSizes {
			t.Run(fmt.Sprintf("should fail for size: %.2f", size), func(t *testing.T) {
				habitat := entity.Habitat{
					Size:     size, 
				}

				err := ValidateSize(habitat.Size)
				g.Expect(err).ToNot(BeNil())
				g.Expect(err.Error()).To(Equal("Size must be between 0 to 9999.99"))
			})
		}
	})
}

func TestInvalidHabitatCapacity(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Capacity", func(t *testing.T) {
		habitat := entity.Habitat{
			Capacity: 0, 
		}

		err := ValidateCapacity(int(habitat.Capacity)) 
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Capacity must be between 0 to 10"))
	})

	t.Run("should fail validation for invalid Capacity", func(t *testing.T) {
		invalidCapacity := []int{
			-10,  
			20,   
		}

		for _, capacity := range invalidCapacity {
			t.Run(fmt.Sprintf("should fail for Capacity: %d", capacity), func(t *testing.T) {
				habitat := entity.Habitat{
					Capacity: uint(capacity), 
				}

				err := ValidateCapacity(int(habitat.Capacity)) 
				g.Expect(err).ToNot(BeNil())
				g.Expect(err.Error()).To(Equal("Capacity must be between 0 to 10"))
			})
		}
	})
}

func TestInvalidHabitatPicture(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing Picture", func(t *testing.T) {
		habitat := entity.Habitat{
			Name:     "Savanna Habitat",
			Size:     1500.25,
			Capacity: 10,
			Picture:  "", 
			ZoneID:   1,
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(habitat)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Picture is required"))
	})
}

func TestInvalidHabitatZoneID(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing ZoneID", func(t *testing.T) {
		habitat := entity.Habitat{
			Name:     "Savanna Habitat",
			Size:     1500.25,
			Capacity: 10,
			Picture:  "savanna.jpg",
			ZoneID:   0, 
			EmployeeID: 1,
		}

		ok, err := govalidator.ValidateStruct(habitat)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ZoneID is required"))
	})
}

func TestInvalidHabitatEmployeeID(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing EmployeeID", func(t *testing.T) {
		habitat := entity.Habitat{
			Name:     "Savanna Habitat",
			Size:     1500.25,
			Capacity: 10,
			Picture:  "savanna.jpg",
			ZoneID:   1, 
			EmployeeID: 0,
		}

		ok, err := govalidator.ValidateStruct(habitat)

		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})
}
