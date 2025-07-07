package tickettype

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func GetTicketTypeByID(c *gin.Context) {
	db := config.DB()

	ticketTypeIDStr := c.Param("ticketTypeID")
	ticketTypeID, err := strconv.ParseUint(ticketTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid TicketTypeID"})
		return
	}

	var ticketType entity.TicketType
	if err := db.First(&ticketType, uint(ticketTypeID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "TicketType not found", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ticketType)
}

func ListTicketType(c *gin.Context) {
	db := config.DB() 

	var ticketTypes []entity.TicketType

	if err := db.Find(&ticketTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve ticket types", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ticketTypes)
}

func GetTicketByTicketTypeID(c *gin.Context) {
	db := config.DB() 

	ticketTypeIDStr := c.Param("ticketTypeID")
	ticketTypeID, err := strconv.ParseUint(ticketTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid TicketTypeID"})
		return
	}

	var tickets []entity.Ticket

	if err := db.Preload("Generation").Preload("TicketType").Where("ticket_type_id = ?", uint(ticketTypeID)).Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve tickets", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tickets)
}

func GetZoneByTicketID(c *gin.Context) {
	db := config.DB() 

	ticketIDStr := c.Param("ticketID")
	ticketID, err := strconv.ParseUint(ticketIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid TicketID"})
		return
	}

	var ticket entity.Ticket

	if err := db.Preload("Zones").Where("id = ?", uint(ticketID)).First(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve zones", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ticket.Zones)
}

func CreateTicketBooked(c *gin.Context) {
	db := config.DB() 

	var ticketBooked entity.TicketBooked
	if err := c.ShouldBindJSON(&ticketBooked); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	if ticketBooked.VisitDate.IsZero() {
		ticketBooked.VisitDate = time.Now()
	}

	if err := db.Create(&ticketBooked).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create TicketBooked", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "TicketBooked created successfully",
		"data": gin.H{
			"id": ticketBooked.ID,
			"ticketBooked": ticketBooked,
		},
	})
}

func CreateBookingZoo(c *gin.Context) {
	db := config.DB() 

	var bookingZoo entity.BookingZoo
	if err := c.ShouldBindJSON(&bookingZoo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	if err := db.Create(&bookingZoo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create BookingZoo", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "BookingZoo created successfully", "data": bookingZoo})
}