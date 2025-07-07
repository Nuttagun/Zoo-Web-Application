package ticket

import (
	"net/http"
	"strconv"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"github.com/gin-gonic/gin"
)

func ListTicket(c *gin.Context) {
	var ticket []entity.Ticket

	db := config.DB()

	db.Find(&ticket)

	c.JSON(http.StatusOK, &ticket)
}


func GetTicketByID(c *gin.Context) {
	id := c.Param("id")
	ticketID, err := strconv.Atoi(id)
	if err != nil || ticketID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Ticket ID"})
		return
	}

	db := config.DB()

	var ticket entity.Ticket
	if err := db.Preload("Generation").
		Preload("TicketType").
		Preload("BookingZoos").
		Preload("Zones").
		Where("id = ?", ticketID).
		First(&ticket).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ticket": ticket})
}

func GetTicketBookedByID(c *gin.Context) {

	id := c.Param("id")
	ticketID, err := strconv.Atoi(id)
	if err != nil || ticketID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid TicketBooked ID"})
		return
	}

	db := config.DB()

	var ticketBooked entity.TicketBooked
	if err := db.Preload("Booking").
		Preload("Rents").
		Preload("BookingZoos").
		Where("id = ?", ticketID).
		First(&ticketBooked).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "TicketBooked not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ticketBooked": ticketBooked})
}

func GetTicketBookedByBookingID(c *gin.Context) {
	// รับ BookingID จาก URL parameter
	bookingIDParam := c.Param("bookingID")
	bookingID, err := strconv.Atoi(bookingIDParam)
	if err != nil || bookingID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Booking ID"})
		return
	}

	db := config.DB()

	var ticketsBooked []entity.TicketBooked
	// ดึงข้อมูล TicketBooked พร้อม Preload ความสัมพันธ์ทั้งหมด
	if err := db.Preload("Booking").
		Preload("Rents").
		Preload("BookingZoos.Ticket"). // เพิ่ม Preload สำหรับ Ticket ใน BookingZoos
		Where("booking_id = ?", bookingID).
		Find(&ticketsBooked).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No TicketBooked found for this Booking ID"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ticketsBooked": ticketsBooked})
}