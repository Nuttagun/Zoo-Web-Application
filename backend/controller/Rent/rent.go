package rent

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func CreateTicketRented(c *gin.Context) {
	db := config.DB()

	var rent entity.Rent
	if err := c.ShouldBindJSON(&rent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	if rent.TicketBookedID == nil || rent.RentDate.IsZero() || rent.StartTime.IsZero() || rent.EndTime.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Required fields are missing"})
		return
	}

	var ticketBooked entity.TicketBooked
	if err := db.First(&ticketBooked, rent.TicketBookedID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "TicketBooked not found"})
		return
	}

	if rent.RentDate.Format("2006-01-02") != ticketBooked.VisitDate.Format("2006-01-02") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "RentDate must match TicketBooked.VisitDate"})
		return
	}

	if rent.StartTime.After(rent.EndTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "StartTime must be before EndTime"})
		return
	}

	if rent.RentDate.Format("2006-01-02") != rent.StartTime.Format("2006-01-02") ||
		rent.RentDate.Format("2006-01-02") != rent.EndTime.Format("2006-01-02") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "StartTime and EndTime must fall on the same RentDate"})
		return
	}

	openingTime := time.Date(rent.StartTime.Year(), rent.StartTime.Month(), rent.StartTime.Day(), 8, 0, 0, 0, rent.StartTime.Location())
	closingTime := time.Date(rent.StartTime.Year(), rent.StartTime.Month(), rent.StartTime.Day(), 17, 0, 0, 0, rent.StartTime.Location())
	if rent.StartTime.Before(openingTime) || rent.EndTime.After(closingTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Time must be within operating hours (08:00 - 17:00)"})
		return
	}

	if rent.TotalQuantity < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Total quantity must be greater than 0."})
		return
	}

	if err := db.Create(&rent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Rent", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Rent created successfully",
		"id":      rent.ID,
		"data":    rent,
	})
}

func CreateVehicleRent(c *gin.Context) {
	db := config.DB()

	var vehicleRents []entity.VehicleRent
	if err := c.ShouldBindJSON(&vehicleRents); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	for _, vehicleRent := range vehicleRents {
		if vehicleRent.RentID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "RentID is required"})
			return
		}

		var rent entity.Rent
		if err := db.First(&rent, vehicleRent.RentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Rent not found", "details": err.Error()})
			return
		}
		
		if vehicleRent.VehicleID != 0 {
			var vehicle entity.Vehicle
			if err := db.First(&vehicle, vehicleRent.VehicleID).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found", "details": err.Error()})
				return
			}
		}
	}

	if err := db.Create(&vehicleRents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create VehicleRent", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "VehicleRent created successfully", "data": vehicleRents})
}

func GetRentByID(c *gin.Context) {
	id := c.Param("id")
	rentID, err := strconv.Atoi(id)
	if err != nil || rentID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Rent ID"})
		return
	}

	db := config.DB()

	var rent entity.Rent
	if err := db.Preload("TicketBooked").              
		Preload("VehicleRent.Vehicle.VehicleType"). 
		Where("id = ?", rentID).
		First(&rent).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rent not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rent": rent})
}

func GetRentByTicketBookedID(c *gin.Context) {
	ticketBookedIDStr := c.Param("ticketBookedID")
	ticketBookedID, err := strconv.Atoi(ticketBookedIDStr)
	if err != nil || ticketBookedID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid TicketBooked ID"})
		return
	}

	db := config.DB()

	var rents []entity.Rent
	if err := db.Preload("TicketBooked").
		Preload("VehicleRent.Vehicle.VehicleType").
		Where("ticket_booked_id = ?", ticketBookedID).
		Find(&rents).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No rents found for the given TicketBooked ID"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rents": rents})
}