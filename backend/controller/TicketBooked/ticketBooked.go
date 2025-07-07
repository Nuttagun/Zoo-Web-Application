package ticketBooked

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func GetUserBookingDetailsTicket(c *gin.Context) {
	userID := c.Param("id") 
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	db := config.DB()

	var bookings []entity.Booking
	if err := db.Preload("User").Where("user_id = ?", userID).Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(bookings) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No bookings found for this user"})
		return
	}

	var paymentTickets []entity.PaymentTicket
	var finalDetails []gin.H

	for _, booking := range bookings {
		if err := db.Where("booking_id = ?", booking.ID).Find(&paymentTickets).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if len(paymentTickets) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"message": "No payments found for booking_id", "booking_id": booking.ID})
			return
		}

		for _, payment := range paymentTickets {
			if payment.PaymentStatus == /*"No"*/false {
				c.JSON(http.StatusOK, gin.H{
					"message":    "Payment not complete",
					"booking_id": booking.ID,
				})
				return
			} else if payment.PaymentStatus == /*"Complete"*/true {
				var tickets []entity.TicketBooked
				if err := db.Preload("Rents").
					Preload("BookingZoos.Ticket").
					Where("booking_id = ?", booking.ID).
					Find(&tickets).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}

				for _, ticket := range tickets {
					for _, bookingZoo := range ticket.BookingZoos {
						finalDetails = append(finalDetails, gin.H{
							"booking_id":      booking.ID,
							"visit_date":      ticket.VisitDate,
							"quantity":        ticket.QuantityCustomer,
							"total_price":     ticket.TotalPrice,
							"ticket_id":       bookingZoo.TicketID,
							"ticket_details":  bookingZoo.Ticket,
							"payment_status":  "Complete",
							"payment_details": payment,
						})
					}
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"details": finalDetails})
}


func GetUserBookingDetailsRent(c *gin.Context) {

	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	db := config.DB()

	var bookings []entity.Booking
	if err := db.Where("user_id = ?", userID).Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(bookings) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No bookings found for this user"})
		return
	}

	for _, booking := range bookings {
		var paymentTickets []entity.PaymentTicket
		if err := db.Where("booking_id = ?", booking.ID).Find(&paymentTickets).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		for _, payment := range paymentTickets {
			if payment.PaymentStatus == /*"No"*/false {
				c.JSON(http.StatusOK, gin.H{"message": "Payment not complete", "booking_id": booking.ID})
				return
			} else if payment.PaymentStatus == /*"Complete"*/true {

				var tickets []entity.TicketBooked
				if err := db.Where("booking_id = ?", booking.ID).Find(&tickets).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}

				for _, ticket := range tickets {

					var rents []entity.Rent
					if err := db.Where("ticket_booked_id = ?", ticket.ID).Find(&rents).Error; err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
						return
					}

					for _, rent := range rents {
						if rent.TotalPrice == 0 {
							c.JSON(http.StatusOK, gin.H{"message": "Total price is zero", "rent_id": rent.ID})
							return
						}

						var vehicleRents []entity.VehicleRent
						if err := db.Where("rent_id = ?", rent.ID).Find(&vehicleRents).Error; err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
							return
						}

						for _, vehicleRent := range vehicleRents {
							var vehicle entity.Vehicle
							if err := db.Where("id = ?", vehicleRent.VehicleID).First(&vehicle).Error; err != nil {
								c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
								return
							}

							c.JSON(http.StatusOK, gin.H{
								"rent":         rent,
								"vehicle_rent": vehicleRent,
								"vehicle":      vehicle,
							})
							return
						}
					}
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "No valid data found"})
}


func DeleteTicketBooked(c *gin.Context) {
	db := config.DB()

	var ticketBooked entity.TicketBooked

	if err := db.Order("id DESC").First(&ticketBooked).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No TicketBooked found"})
		return
	}

	if err := db.Delete(&ticketBooked).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete TicketBooked"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Latest TicketBooked deleted successfully", "deleted_id": ticketBooked.ID})
}