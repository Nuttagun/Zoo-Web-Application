package controller

import (
	"net/http"

	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"

	"github.com/gin-gonic/gin"
)

func GetAllReport(c *gin.Context) {
	db := config.DB()

	var reports []entity.Report
	if err := db.
		Preload("Employee").
		Preload("Animal").
		Preload("Animal.Genderanimal").
		Preload("Animal.Biological").
		Preload("Animal.Behavior").
		Preload("Animal.Employee").
		Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reports)
}

func CreateReport(c *gin.Context) {
	db := config.DB()

	// รับข้อมูล JSON และแปลงเป็นโครงสร้าง Animal
	var newReport entity.Report
	if err := c.ShouldBindJSON(&newReport); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกข้อมูล Animal ลงในฐานข้อมูล
	if err := db.Create(&newReport).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลที่สร้างใหม่กลับไปในรูปแบบ JSON
	c.JSON(http.StatusCreated, newReport)
}

func UpdateReport(c *gin.Context) {
	db := config.DB()

	// Get the animal ID from the URL parameter
	reportID := c.Param("id")

	var report entity.Report
	// Find the animal by its ID
	if err := db.First(&report, reportID).Error; err != nil {
		// If the animal is not found, return a 404 error
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	// Bind the incoming JSON to the existing animal struct
	if err := c.ShouldBindJSON(&report); err != nil {
		// If there is an error binding the JSON, return a 400 error
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save the updated animal data in the database
	if err := db.Save(&report).Error; err != nil {
		// If there is an error saving the data, return a 500 error
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the updated animal data
	c.JSON(http.StatusOK, report)
}
