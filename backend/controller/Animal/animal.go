package animal

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListAnimals(c *gin.Context) {
	var animals []entity.Animal

	db := config.DB()
	results := db.Preload("Sex").Preload("Biological").Preload("Behavioral").Preload("Employee").Preload("Habitat").Preload("HealthAnimal").Find(&animals)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, animals)
}

func ListStatusAnimal(c *gin.Context) {
	var StatusAnimal []entity.HealthAnimal

	db := config.DB()
	results := db.Find(&StatusAnimal)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, StatusAnimal)
}

func ListAnimalsByHealth(c *gin.Context) {
	var animals []entity.Animal

	db := config.DB()

	results := db.Preload("Sex").Preload("Biological").Preload("Behavioral").Preload("Employee").Preload("Habitat").Where("health_animal_id = ?", "1").Find(&animals)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, animals)
}

func isValidNameAnimal(name string) bool {
	re := regexp.MustCompile(`^[a-zA-Z ]+$`)
	return re.MatchString(name)
}

func CreateAnimal(c *gin.Context) {
	var animal entity.Animal
	db := config.DB()

	image, err := c.FormFile("picture")
	if err == nil {
		uploadDir := "uploads"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("ไม่สามารถสร้างโฟลเดอร์สำหรับอัปโหลด: %v", err)})
			return
		}

		filePath := filepath.Join(uploadDir, image.Filename)
		if err := c.SaveUploadedFile(image, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("ไม่สามารถบันทึกรูปภาพ: %v", err)})
			return
		}
		animal.Picture = filePath
	}

	// Validate Name
	animal.Name = c.PostForm("name")
	if animal.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	if len(animal.Name) < 1 || len(animal.Name) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be between 1 and 100 characters"})
		return
	}

	if !isValidNameAnimal(animal.Name) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must not contain special characters"})
		return
	}

	animal.Description = c.PostForm("description")

	// Validate Weight
	weightStr := c.PostForm("weight")
	if weightStr != "" {
		weight, err := strconv.ParseFloat(weightStr, 64)
		if err != nil || weight <= 0 || weight > 10000 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Weight must be a valid number up to 9999.99"})
			return
		}
		animal.Weight = weight
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "น้ำหนักไม่สามารถว่างได้"})
		return
	}

	// Validate Height
	heightStr := c.PostForm("height")
	if heightStr != "" {
		height, err := strconv.ParseFloat(heightStr, 64)
		if err != nil || height <= 0 || height > 1000 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Height must be a valid number up to 9999.99"})
			return
		}
		animal.Height = height
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ส่วนสูงไม่สามารถว่างได้"})
		return
	}

	animal.Birthplace = c.PostForm("birthplace")

	birthDayStr := c.PostForm("birthDay")
	if birthDayStr != "" {
		birthDay, err := time.Parse("2006-01-02", birthDayStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รูปแบบวันเกิดไม่ถูกต้อง: %v", err)})
			return
		}
		animal.BirthDay = birthDay
	}

	HealthIDStr := c.PostForm("health")
	if HealthIDStr != "" {
		HealthAnimalID, err := strconv.ParseUint(HealthIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("สุขภาพ ID ไม่ถูกต้อง: %v", err)})
			return
		}
		animal.HealthAnimalID = uint(HealthAnimalID)
	}

	animal.Note = c.PostForm("note")
	if animal.Note == "" || animal.Note == "undefined" {
		animal.Note = "" 
	}

	sexIDStr := c.PostForm("sexID")
	if sexIDStr != "" {
		sexID, err := strconv.ParseUint(sexIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("เพศ ID ไม่ถูกต้อง: %v", err)})
			return
		}
		animal.SexID = uint(sexID)
	}

	biologicalIDStr := c.PostForm("biologicalID")
	if biologicalIDStr != "" {
		biologicalID, err := strconv.ParseUint(biologicalIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รหัสชีวภาพไม่ถูกต้อง: %v", err)})
			return
		}
		animal.BiologicalID = uint(biologicalID)
	}

	behavioralIDStr := c.PostForm("behavioralID")
	if behavioralIDStr != "" {
		behavioralID, err := strconv.ParseUint(behavioralIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รหัสพฤติกรรมไม่ถูกต้อง: %v", err)})
			return
		}
		animal.BehavioralID = uint(behavioralID)
	}

	employeeIDStr := c.PostForm("employeeID")
	if employeeIDStr != "" {
		employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รหัสพนักงานไม่ถูกต้อง: %v", err)})
			return
		}
		animal.EmployeeID = uint(employeeID)
	}

	habitatIDStr := c.PostForm("habitatID")
	if habitatIDStr != "" {
		habitatID, err := strconv.ParseUint(habitatIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รหัสที่อยู่อาศัยไม่ถูกต้อง: %v", err)})
			return
		}
		animal.HabitatID = uint(habitatID)
	}

	if err := db.Create(&animal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("ไม่สามารถสร้างข้อมูลสัตว์: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างข้อมูลสัตว์สำเร็จ",
		"data":    animal,
	})
}

func DeleteAnimal(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var animal entity.Animal

	if err := db.Where("id = ?", id).First(&animal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	if err := db.Delete(&animal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete animal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Animal deleted successfully"})
}

func GetAnimalById(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var animal entity.Animal

	if err := db.Preload("Sex").Preload("Biological").Preload("Behavioral").Preload("Employee").Preload("Habitat").Preload("HealthAnimal").Where("id = ?", id).First(&animal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	c.JSON(http.StatusOK, animal)
}

func UpdateAnimal(c *gin.Context) {
	var animal entity.Animal
	db := config.DB()

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing animal ID"})
		return
	}

	if err := db.Where("id = ?", id).First(&animal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}


	if name := c.PostForm("Name"); name != "" {
		animal.Name = name
	}

	if description := c.PostForm("Description"); description != "" {
		animal.Description = description
	}

	if birthplace := c.PostForm("Birthplace"); birthplace != "" {
		animal.Birthplace = birthplace
	}

	if birthday := c.PostForm("BirthDay"); birthday != "" {
		if parsedDate, err := time.Parse("2006-01-02", birthday); err == nil {
			animal.BirthDay = parsedDate
		}
	}

	if health := c.PostForm("Health"); health != "" {
		if HealthAnimalID, err := strconv.ParseUint(health, 10, 32); err == nil {
			animal.HealthAnimalID = uint(HealthAnimalID)
		}
	}

	if note := c.PostForm("Note"); note != "" {
		animal.Note = note
	}

	if weight := c.PostForm("Weight"); weight != "" {
		if w, err := strconv.ParseFloat(weight, 64); err == nil {
			animal.Weight = w
		}
	}

	if height := c.PostForm("Height"); height != "" {
		if h, err := strconv.ParseFloat(height, 64); err == nil {
			animal.Height = h
		}
	}


	if sexID := c.PostForm("SexID"); sexID != "" {
		if sID, err := strconv.ParseUint(sexID, 10, 32); err == nil {
			animal.SexID = uint(sID)
		}
	}

	if biologicalID := c.PostForm("BiologicalID"); biologicalID != "" {
		if bID, err := strconv.ParseUint(biologicalID, 10, 32); err == nil {
			animal.BiologicalID = uint(bID)
		}
	}

	if behavioralID := c.PostForm("BehavioralID"); behavioralID != "" {
		if bID, err := strconv.ParseUint(behavioralID, 10, 32); err == nil {
			animal.BehavioralID = uint(bID)
		}
	}

	if employeeID := c.PostForm("EmployeeID"); employeeID != "" {
		if eID, err := strconv.ParseUint(employeeID, 10, 32); err == nil {
			animal.EmployeeID = uint(eID)
		}
	}

	if habitatID := c.PostForm("HabitatID"); habitatID != "" {
		if hID, err := strconv.ParseUint(habitatID, 10, 32); err == nil {
			animal.HabitatID = uint(hID)
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

		animal.Picture = filePath
	}


	if err := db.Save(&animal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update animal: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Animal updated successfully", "data": animal})
}

func ServeImage(c *gin.Context) {

	filePath := c.Param("filename")


	fullFilePath := filepath.Join("uploads", filePath)


	if _, err := os.Stat(fullFilePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบไฟล์"})
		return
	}


	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	c.File(fullFilePath)
}





