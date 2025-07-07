package unit

import (
	"testing"
	"time"
	"fmt"
	"errors"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func ValidatePriceVehicle(price float64) error {
	if price <= 0 {
		return fmt.Errorf("Price must be greater than 0")
	}
	return nil
}

func ValidateUniqueVehicleName(db *gorm.DB, vehicle entity.Vehicle) error {
    var count int64
    db.Model(&entity.Vehicle{}).Where("name = ?", vehicle.Name).Count(&count)
    if count > 0 {
        return errors.New("vehicle name already exists")
    }
    return nil
}
 
func TestValidVehicleInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid Vehicle", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		20.0, 
			Description:      	"for Children",
			ReceivedDate:  		time.Now(),
			Picture:   			"bicycle.jpg",
			VehicleColorID:     1,
			VehicleStatusID: 	1,	
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestInvalidVehicleName(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Name", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"",
			Price:       		20.0,
			Description:      	"for Children",
			ReceivedDate:  		time.Now(),
			Picture:   			"bicycle.jpg",
			VehicleColorID:     1,
			VehicleStatusID: 	1,	
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Name is required"))
	})

	t.Run(`Name must start with "B" or "G" and be followed by digits`, func(t *testing.T) {

		invalidNames := []string{
			"A01",    
			"Bbb",    
			"b01",   
			"G01a",   
		}

		for _, name := range invalidNames {
			vehicle := entity.Vehicle{
				Name:         		name,
				Price:       		20.0,
				Description:      	"for Children",
				ReceivedDate:  		time.Now(),
				Picture:   			"bicycle.jpg",
				VehicleColorID:     1,
				VehicleStatusID: 	1,	
				VehicleTypeID:      1,
				EmployeeID:         1,
			}

			ok, err := govalidator.ValidateStruct(vehicle)
			g.Expect(ok).To(BeFalse()) 
			g.Expect(err).NotTo(BeNil())
		}


		validNames := []string{
			"B01", 
			"G01",
		}

		for _, name := range validNames {
			vehicle := entity.Vehicle{
				Name:         		name,
				Price:       		20.0,
				Description:      	"for Children",
				ReceivedDate:  		time.Now(),
				Picture:   			"bicycle.jpg",
				VehicleColorID:     1,
				VehicleStatusID: 	1,	
				VehicleTypeID:      1,
				EmployeeID:         1,
			}

			ok, err := govalidator.ValidateStruct(vehicle)
			g.Expect(ok).To(BeTrue())
			g.Expect(err).To(BeNil())
		}
	})
}

func TestDuplicateVehicleName(t *testing.T) {
	g := NewGomegaWithT(t)

	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&entity.Vehicle{})

	vehicle1 := entity.Vehicle{
		Name:          "B01",
		Price:         20.0,
		Description:   "for Children",
		ReceivedDate:  time.Now(),
		Picture:       "bicycle.jpg",
		VehicleColorID: 1,
		VehicleStatusID: 1,
		VehicleTypeID:  1,
		EmployeeID:     1,
	}
	db.Create(&vehicle1)

	vehicle2 := entity.Vehicle{
		Name:          "B01",
		Price:         25.0,
		Description:   "for Adults",
		ReceivedDate:  time.Now(),
		Picture:       "bike.jpg",
		VehicleColorID: 2,
		VehicleStatusID: 2,
		VehicleTypeID:  2,
		EmployeeID:     2,
	}

	err := ValidateUniqueVehicleName(db, vehicle2)
	g.Expect(err).ToNot(BeNil())
	g.Expect(err.Error()).To(Equal("vehicle name already exists"))
}

func TestInvalidVehiclePrice(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Price", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		0,
			Description:      	"for Children",
			ReceivedDate:  		time.Now(),
			Picture:   			"bicycle.jpg",
			VehicleColorID:     1,
			VehicleStatusID: 	1,	
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Price is required"))
	})

	t.Run("Fail validation for invalid Price", func(t *testing.T) {
		price := -10.0
		err := ValidatePriceVehicle(price)
		g.Expect(err).ToNot(BeNil())
	})
}

func TestInvalidVehicleDescription(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Description", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		20.0,
			Description:      	"",
			ReceivedDate:  		time.Now(),
			Picture:   			"bicycle.jpg",
			VehicleColorID:     1,
			VehicleStatusID: 	1,	
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Description is required"))
	})

	t.Run("Description exceeds valid length", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:               "B01",
			Price:              20.0,
			Description:        "This description is way too long and exceeds the allowed 100 character limit. It should fail validation.",
			ReceivedDate:       time.Now(),
			Picture:            "bicycle.jpg",
			VehicleColorID:     1,
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse()) 
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(ContainSubstring("Description must be between 1 and 100 characters"))
	})
}

func TestInvalidVehicleOtherFields(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing ReceivedDate", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		20.0,
			Description:      	"for Children",
			ReceivedDate:  		time.Time{},
			Picture:   			"bicycle.jpg",
			VehicleColorID:     1,
			VehicleStatusID: 	1,	
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ReceivedDate is required"))
	})


	t.Run("Fail validation for missing Picture", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		20.0,
			Description:      	"for Children",
			ReceivedDate:  		time.Now(),
			Picture:   			"",
			VehicleColorID:     1,
			VehicleStatusID: 	1,	
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Picture is required"))
	})

}

func TestInvalidVehicleForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing VehicleColorID", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		20.0,
			Description:      	"for Children",
			ReceivedDate:  		time.Now(),
			Picture:   			"bicycle.jpg",
			VehicleColorID:     0,
			VehicleStatusID: 	1,	
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("VehicleColorID is required"))
	})

	t.Run("Fail validation for missing VehicleStatusID", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		20.0,
			Description:      	"for Children",
			ReceivedDate:  		time.Now(),
			Picture:   			"bicycle.jpg",
			VehicleColorID:     1,
			VehicleStatusID: 	0,	
			VehicleTypeID:      1,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("VehicleStatusID is required"))
	})

	t.Run("Fail validation for missing VehicleTypeID", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		20.0,
			Description:      	"for Children",
			ReceivedDate:  		time.Now(),
			Picture:   			"bicycle.jpg",
			VehicleColorID:     1,
			VehicleStatusID: 	1,	
			VehicleTypeID:      0,
			EmployeeID:         1,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("VehicleTypeID is required"))
	})

	t.Run("Fail validation for missing EmployeeID", func(t *testing.T) {
		vehicle := entity.Vehicle{
			Name:         		"B01",
			Price:       		20.0,
			Description:      	"for Children",
			ReceivedDate:  		time.Now(),
			Picture:   			"bicycle.jpg",
			VehicleColorID:     1,
			VehicleStatusID: 	1,	
			VehicleTypeID:      1,
			EmployeeID:         0,
		}

		ok, err := govalidator.ValidateStruct(vehicle)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
	})
}
