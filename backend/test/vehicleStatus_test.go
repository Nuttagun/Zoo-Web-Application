package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestVehicleStatusValidInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Pass validation for valid Status", func(t *testing.T) {
		validStatus := []string{
			"Available",    
			"Maintenance",    
			"Unavailable",    
		}

		for _, status := range validStatus {
			vehicleStatus := entity.VehicleStatus{
				VehicleStatus:		status, 
			}
	
			ok, err := govalidator.ValidateStruct(vehicleStatus)
			if !ok {
				t.Logf("Validation failed: %v", err)
			}
			g.Expect(ok).To(BeTrue())
			g.Expect(err).To(BeNil())
		}
	})
}

func TestVehicleStatusInvalid(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Fail validation for missing Status", func(t *testing.T) {
		vehicleStatus := entity.VehicleStatus{
			VehicleStatus:		"", 
		}

		ok, err := govalidator.ValidateStruct(vehicleStatus)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Status is required"))
	})

	t.Run("Fail validation for Status exceeding 20 characters", func(t *testing.T) {
		vehicleStatus := entity.VehicleStatus{
			VehicleStatus:		"AvailableAvailableAvailableAvailable", 
		}

		ok, err := govalidator.ValidateStruct(vehicleStatus)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("Status must be between 1 and 20 characters"))
	})
}