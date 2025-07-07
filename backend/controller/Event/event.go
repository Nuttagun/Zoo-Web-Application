package event

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListEvent(c *gin.Context) {
	var events []entity.Event

	db := config.DB()
	results := db.Preload("Zone").Preload("Animal").Preload("Employee").Find(&events)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, events)
}

func CreateEvent(c *gin.Context) {
	var event entity.Event
	db := config.DB()

	image, err := c.FormFile("picture")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	filePath := filepath.Join(uploadDir, image.Filename)
	if err := c.SaveUploadedFile(image, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	event.Title = c.PostForm("title")

	if len(event.Title) < 1 || len(event.Title) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title must be between 1 and 100 characters"})
		return
	}

	event.Description = c.PostForm("description")

	startDateStr := c.PostForm("startDate")
	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
		return
	}

	event.StartDate = startDate

	endDateStr := c.PostForm("endDate")
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
		return
	}

	event.EndDate = endDate

	if event.StartDate.After(event.EndDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EndDate should be after StartDate"})
		return
	}

	event.Picture = filePath

	zoneIDStr := c.PostForm("zoneID")
	if zoneIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ZoneID is required"})
		return
	}

	zoneID, err := strconv.ParseUint(zoneIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid zone ID"})
		return
	}

	event.ZoneID = uint(zoneID)

	animalIDStr := c.PostForm("animalID")
	animalID, err := strconv.ParseUint(animalIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid animal ID"})
		return
	}
	event.AnimalID = uint(animalID)

	employeeIDStr := c.PostForm("employeeID")
	employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}
	event.EmployeeID = uint(employeeID)

	if err := db.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Event created successfully", "data": event})
}

func DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var event entity.Event

	if err := db.Where("id = ?", id).First(&event).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	if err := db.Delete(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "event deleted successfully"})
}

func GetEventById(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var event entity.Event

	if err := db.Preload("Zone").Preload("Animal").Preload("Employee").Where("id = ?", id).First(&event).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}

func UpdateEvent(c *gin.Context) {
	var event entity.Event
	db := config.DB()

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing event ID"})
		return
	}

	if err := db.Where("id = ?", id).First(&event).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	event.Title = c.PostForm("title")
	event.Description = c.PostForm("description")

	if startDateStr := c.PostForm("startDate"); startDateStr != "" {
		parsedStartDate, err := time.Parse("2006-01-02", startDateStr)
		if err == nil {
			event.StartDate = parsedStartDate
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid start date format: %v", err)})
			return
		}
	}

	if endDateStr := c.PostForm("endDate"); endDateStr != "" {
		parsedEndDate, err := time.Parse("2006-01-02", endDateStr)
		if err == nil {
			event.EndDate = parsedEndDate
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid end date format: %v", err)})
			return
		}
	}

	file, err := c.FormFile("Picture")
	if err == nil && file != nil {
		uploadDir := "uploads"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		filePath := filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		event.Picture = filePath
	}

	if zoneIDStr := c.PostForm("zoneID"); zoneIDStr != "" {
		zoneID, err := strconv.ParseUint(zoneIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ZoneID"})
			return
		}
		event.ZoneID = uint(zoneID)
	}

	if animalIDStr := c.PostForm("animalID"); animalIDStr != "" {
		animalID, err := strconv.ParseUint(animalIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid AnimalID"})
			return
		}
		event.AnimalID = uint(animalID)
	}

	if employeeIDStr := c.PostForm("EmployeeID"); employeeIDStr != "" {
		employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid EmployeeID"})
			return
		}
		event.EmployeeID = uint(employeeID)
	}

	if err := db.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update event: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event updated successfully", "data": event})
}

func GetUpcomingEvents(c *gin.Context) {
	today := time.Now()

	var events []entity.Event
	db := config.DB()

	results := db.Preload("Zone").Preload("Animal").Preload("Employee").
		Where("end_date > ?", today).Find(&events)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, events)
}
