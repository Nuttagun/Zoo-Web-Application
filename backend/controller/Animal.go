package controller

import (
	"net/http"

	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"

	"github.com/gin-gonic/gin"
)

func GetAllAnimals(c *gin.Context) {
	db := config.DB()

	var Animals []entity.Animal
	// Preload the "Biological" relationship along with the animals
	if err := db.Preload("Biological").Preload("Behavior").Preload("Genderanimal").Preload("Employee").Find(&Animals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลทั้งหมดในรูปแบบ JSON โดยตรง
	c.JSON(http.StatusOK, Animals)
}

func GetAnimalByID(c *gin.Context) {
	db := config.DB()

	// Get the animal ID from the URL parameter
	animalID := c.Param("id")

	var animal entity.Animal
	// Find the animal by its ID
	if err := db.First(&animal, animalID).Error; err != nil {
		// If an error occurs (e.g., no record found), return an error response
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	// Return the animal data in JSON format
	c.JSON(http.StatusOK, animal)
}

func CreateAnimal(c *gin.Context) {
	db := config.DB()

	// รับข้อมูล JSON และแปลงเป็นโครงสร้าง Animal
	var newAnimal entity.Animal
	if err := c.ShouldBindJSON(&newAnimal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกข้อมูล Animal ลงในฐานข้อมูล
	if err := db.Create(&newAnimal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลที่สร้างใหม่กลับไปในรูปแบบ JSON
	c.JSON(http.StatusCreated, newAnimal)
}

// UpdateAnimal updates an existing animal by its ID
func UpdateAnimal(c *gin.Context) {
	db := config.DB()

	// Get the animal ID from the URL parameter
	animalID := c.Param("id")

	var animal entity.Animal
	// Find the animal by its ID
	if err := db.First(&animal, animalID).Error; err != nil {
		// If the animal is not found, return a 404 error
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	// Bind the incoming JSON to the existing animal struct
	if err := c.ShouldBindJSON(&animal); err != nil {
		// If there is an error binding the JSON, return a 400 error
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save the updated animal data in the database
	if err := db.Save(&animal).Error; err != nil {
		// If there is an error saving the data, return a 500 error
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the updated animal data
	c.JSON(http.StatusOK, animal)
}

// DeleteAnimal deletes an animal by its ID
func DeleteAnimal(c *gin.Context) {
	db := config.DB()

	// Get the animal ID from the URL parameter
	animalID := c.Param("id")

	// Find the animal by its ID
	var animal entity.Animal
	if err := db.First(&animal, animalID).Error; err != nil {
		// If the animal is not found, return a 404 error
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	// Delete the animal from the database
	if err := db.Delete(&animal).Error; err != nil {
		// If there is an error deleting the data, return a 500 error
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return a success message
	c.JSON(http.StatusOK, gin.H{"message": "Animal deleted successfully"})
}
