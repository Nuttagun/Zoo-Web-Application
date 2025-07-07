package unit

import (
	"github.com/sut67/team18/entity"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestValidMedicineInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Should pass validation for valid Medicine", func(t *testing.T) {
		medicine := entity.Medicine{
			MedicineName: "Paracetamol",
			Dosage:       "500mg",
			Stock:        100,
			ExpiryDate:   time.Now().Add(time.Hour * 24 * 30), // Future date
			Price:        20.50,
			MedicineTypeID: 1, // Assume valid MedicineTypeID
		}

		ok, err := govalidator.ValidateStruct(medicine)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestRequiredMedicineFields(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Should fail validation if MedicineName is missing", func(t *testing.T) {
		medicine := entity.Medicine{
			MedicineName: "",
			Dosage:       "500mg",
			Stock:        100,
			ExpiryDate:   time.Now().Add(time.Hour * 24 * 30),
			Price:        20.50,
			MedicineTypeID: 1,
		}

		ok, err := govalidator.ValidateStruct(medicine)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("MedicineName is required"))
	})

	t.Run("Should fail validation if MedicineName is long", func(t *testing.T) {
		medicine := entity.Medicine{
			MedicineName: "ParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamolParacetamol",
			Dosage:       "500mg",
			Stock:        100,
			ExpiryDate:   time.Now().Add(time.Hour * 24 * 30),
			Price:        20.50,
			MedicineTypeID: 1,
		}

		ok, err := govalidator.ValidateStruct(medicine)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("MedicineName must be between 1 and 100 characters"))
	})

	t.Run("Should fail validation if Dosage is missing", func(t *testing.T) {
		medicine := entity.Medicine{
			MedicineName: "Paracetamol",
			Dosage:       "",
			Stock:        100,
			ExpiryDate:   time.Now().Add(time.Hour * 24 * 30),
			Price:        20.50,
			MedicineTypeID: 1,
		}

		ok, err := govalidator.ValidateStruct(medicine)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Dosage is required"))
	})

	t.Run("Should fail validation if Stock is missing", func(t *testing.T) {
		medicine := entity.Medicine{
			MedicineName: "Paracetamol",
			Dosage:       "500mg",
			Stock:        0, // Stock is 0, should be valid but we want to validate missing stock input
			ExpiryDate:   time.Now().Add(time.Hour * 24 * 30),
			Price:        20.50,
			MedicineTypeID: 1,
		}

		ok, err := govalidator.ValidateStruct(medicine)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Stock is required"))
	})

	t.Run("Should fail validation if ExpiryDate is missing", func(t *testing.T) {
		medicine := entity.Medicine{
			MedicineName: "Paracetamol",
			Dosage:       "500mg",
			Stock:        100,
			ExpiryDate:   time.Time{}, // Empty time value to simulate missing expiry date
			Price:        20.50,
			MedicineTypeID: 1,
		}

		ok, err := govalidator.ValidateStruct(medicine)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("ExpiryDate is required"))
	})

	t.Run("Should fail validation if Price is missing", func(t *testing.T) {
		medicine := entity.Medicine{
			MedicineName: "Paracetamol",
			Dosage:       "500mg",
			Stock:        100,
			ExpiryDate:   time.Now().Add(time.Hour * 24 * 30),
			MedicineTypeID: 1,
		}

		ok, err := govalidator.ValidateStruct(medicine)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Price is required"))
	})
}



