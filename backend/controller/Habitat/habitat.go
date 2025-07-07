package habitat

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListHabitat(c *gin.Context) {
	var habitats []entity.Habitat

	db := config.DB()
	results := db.Preload("Zone").Preload("Animals").Find(&habitats)
	if results.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	if results.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No habitats found"})
		return
	}

	c.JSON(http.StatusOK, habitats)
}

func GetHabitatAvailable(c *gin.Context) {
	var habitats []entity.Habitat


	db := config.DB()


	subQuery := db.Table("animals").Select("habitat_id, COUNT(*) as animal_count").
		Group("habitat_id")

	if err := db.Preload("Zone").Preload("Employee").Preload("Animals").
		Joins("LEFT JOIN (?) AS animal_counts ON animal_counts.habitat_id = habitats.id", subQuery).
		Where("COALESCE(animal_counts.animal_count, 0) < habitats.capacity").
		Find(&habitats).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}


	c.JSON(http.StatusOK, habitats)
}

func CreateHabitat(c *gin.Context) {
	var habitat entity.Habitat
	db := config.DB()


	image, err := c.FormFile("picture")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error receiving image: %v", err)})
		return
	}

	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create upload directory: %v", err)})
		return
	}

	filePath := filepath.Join(uploadDir, image.Filename)
	if err := c.SaveUploadedFile(image, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save image: %v", err)})
		return
	}

	habitat.Name = c.PostForm("name")

	if habitat.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	if len(habitat.Name) < 1 || len(habitat.Name) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be between 1 and 100 characters"})
		return
	}

	match, _ := regexp.MatchString("^[a-zA-Z0-9 ]+$", habitat.Name)
	if !match {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must not contain special characters"})
		return
	}

	sizeStr := c.PostForm("size")
	size, err := strconv.ParseFloat(sizeStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid size format: %v", err)})
		return
	}
	if size <= 0 || size >= 9999.99 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Size must be between 0 to 9999.99"})
		return
	}
	habitat.Size = size

	capacityStr := c.PostForm("capacity")
	capacity, err := strconv.ParseUint(capacityStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid capacity format: %v", err)})
		return
	}
	if capacity < 1 || capacity > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Capacity must be between 0 to 10"})
		return
	}
	habitat.Capacity = uint(capacity)

	zoneIDStr := c.PostForm("zoneID")
	zoneID, err := strconv.ParseUint(zoneIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid zone ID format: %v", err)})
		return
	}
	habitat.ZoneID = uint(zoneID)

	employeeIDStr := c.PostForm("employeeID")
	employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid zone ID format: %v", err)})
		return
	}
	habitat.EmployeeID = uint(employeeID)

	habitat.Picture = filePath

	if err := db.Create(&habitat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create habitat: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Habitat created successfully",
		"data":    habitat,
	})
}


func DeleteHabitat(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var habitat entity.Habitat

	if err := db.Where("id = ?", id).First(&habitat).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	if err := db.Delete(&habitat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete animal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Habitat deleted successfully"})
}

func UpdateHabitat(c *gin.Context) {
	var habitat entity.Habitat
	db := config.DB()

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing habitat ID"})
		return
	}

	if err := db.Where("id = ?", id).First(&habitat).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Habitat not found"})
		return
	}

	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	if name := c.PostForm("Name"); name != "" {
		habitat.Name = name
	}

	if size := c.PostForm("Size"); size != "" {
		if s, err := strconv.ParseFloat(size, 64); err == nil {
			habitat.Size = s
		}
	}

	if capacity := c.PostForm("Capacity"); capacity != "" {
		if c, err := strconv.ParseUint(capacity, 10, 32); err == nil {
			habitat.Capacity = uint(c)
		}
	}

	if zoneID := c.PostForm("ZoneID"); zoneID != "" {
		if zID, err := strconv.ParseUint(zoneID, 10, 32); err == nil {
			habitat.ZoneID = uint(zID)
		}
	}

	if employeeID := c.PostForm("EmployeeID"); employeeID != "" {
		if zID, err := strconv.ParseUint(employeeID, 10, 32); err == nil {
			habitat.EmployeeID = uint(zID)
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

		habitat.Picture = filePath
	}

	if err := db.Save(&habitat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update habitat: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Habitat updated successfully", "data": habitat})
}

func GetHabitatById(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var habitat entity.Habitat

	if err := db.Preload("Zone").Preload("Animals").Preload("Work").Where("id = ?", id).First(&habitat).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Habitat not found"})
		return
	}

	c.JSON(http.StatusOK, habitat)
}
