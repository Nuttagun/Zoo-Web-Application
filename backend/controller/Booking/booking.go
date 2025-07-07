package booking

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"time"
	"github.com/gin-gonic/gin"
)

func CreateBooking(c *gin.Context) {
	var booking entity.Booking
	db := config.DB()

	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON input"})
		return
	}

	if booking.UserID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "UserID is required"})
		return
	}

	booking.BookingDate = time.Now()

	if err := db.Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create booking: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Booking created successfully",
		"data": gin.H{
			"id": booking.ID,
			"booking": booking,
		},
	})
}

func UpdateByBookingID(c *gin.Context) {
	var booking entity.Booking
	db := config.DB()

	bookingID, err := strconv.Atoi(c.Param("bookingID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid BookingID"})
		return
	}

	if err := db.First(&booking, bookingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	var updateData struct {
		BookingDate *time.Time `json:"booking_date"`
		AllPrice    *float64   `json:"AllPrice"`
		UserID      *uint      `json:"user_id"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON input"})
		return
	}

	if updateData.BookingDate != nil {
		booking.BookingDate = *updateData.BookingDate
	}
	if updateData.AllPrice != nil {
		booking.AllPrice = *updateData.AllPrice
	}
	if updateData.UserID != nil {
		booking.UserID = updateData.UserID
	}

	if err := db.Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update booking: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Booking updated successfully",
		"data":    booking,
	})
}
 

func DeleteBooking(c *gin.Context) {
    db := config.DB()

    userID := c.Query("user_id")
    if userID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "UserID is required"})
        return
    }

    var latestBooking entity.Booking
    if err := db.Where("user_id = ?", userID).Order("id DESC").First(&latestBooking).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "No booking found for this user"})
        return
    }

    if err := db.Unscoped().Delete(&latestBooking).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete booking"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Latest booking deleted successfully", "deleted_id": latestBooking.ID})
}