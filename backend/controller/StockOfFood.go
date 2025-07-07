package controller

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

func GetAllStockOfFood(c *gin.Context) {
	db := config.DB()

	var stockOfFood []entity.StockOfFood
	if err := db.
		Preload("ContainerOfFood").
		Preload("CatagoryOfFood").
		Preload("Employee").
		Find(&stockOfFood).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stockOfFood)
}

func isValidFoodName(name string) bool {
	re := regexp.MustCompile(`^[a-zA-Z ]+$`)
	return re.MatchString(name)
}

func CreateFoodOfStock(c *gin.Context) {
	var food entity.StockOfFood
	db := config.DB()

	image, err := c.FormFile("PictureOfFood")
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
		food.PictureOfFood = filePath
	}

	// Validate Name
	food.Foodname = c.PostForm("Foodname")
	if food.Foodname == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "FoodName is required"})
		return
	}

	if len(food.Foodname) < 1 || len(food.Foodname) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "FoodName must be between 1 and 100 characters"})
		return
	}

	if !isValidFoodName(food.Foodname) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "FoodName must not contain special characters"})
		return
	}

	// Validate Weight
	quantityStr := c.PostForm("Quantity")
	if quantityStr != "" {
		Quantity, err := strconv.Atoi(quantityStr)
		if err != nil || Quantity <= 0 || Quantity > 10000 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity must be a valid integer up to 9999"})
			return
		}
		food.Quantity = Quantity
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ปริมาณอาหารไม่สามารถว่างได้"})
		return
	}

	expiryDateStr := c.PostForm("ExpiryDate")
	if expiryDateStr != "" {
		ExpiryDate, err := time.Parse("2006-01-02", expiryDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รูปแบบวันหมดอายุไม่ถูกต้อง: %v", err)})
			return
		}
		food.ExpiryDate = ExpiryDate
	}

	containerIDStr := c.PostForm("ContainerOfFoodID")
	if containerIDStr != "" {
		ContainerOfFoodID, err := strconv.ParseUint(containerIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Container ID ไม่ถูกต้อง: %v", err)})
			return
		}
		food.ContainerOfFoodID = uint(ContainerOfFoodID)
	}

	catagoryIDStr := c.PostForm("CatagoryOfFoodID")
	if catagoryIDStr != "" {
		CatagoryOfFoodID, err := strconv.ParseUint(catagoryIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Catagory ID ไม่ถูกต้อง: %v", err)})
			return
		}
		food.CatagoryOfFoodID = uint(CatagoryOfFoodID)
	}

	employeeIDStr := c.PostForm("EmployeeID")
	if employeeIDStr != "" {
		employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รหัสพนักงานไม่ถูกต้อง: %v", err)})
			return
		}
		food.EmployeeID = uint(employeeID)
	}

	if err := db.Create(&food).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("ไม่สามารถสร้างข้อมูลอาหารสัตว์: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างข้อมูลอาหารสัตว์สำเร็จ",
		"data":    food,
	})
}

func UpdateFoodOfStock(c *gin.Context) {
	var food entity.StockOfFood
	db := config.DB()

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing Food ID"})
		return
	}

	if err := db.Where("id = ?", id).First(&food).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "food not found"})
		return
	}

	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	if Foodname := c.PostForm("Foodname"); Foodname != "" {
		food.Foodname = Foodname
	}

	if Quantity := c.PostForm("Quantity"); Quantity != "" {
		if quantity, err := strconv.Atoi(Quantity); err == nil {
			food.Quantity = quantity
		}
	}

	if ExpiryDate := c.PostForm("ExpiryDate"); ExpiryDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", ExpiryDate); err == nil {
			food.ExpiryDate = parsedDate
		}
	}

	if ContainerOfFoodID := c.PostForm("ContainerOfFoodID"); ContainerOfFoodID != "" {
		if conID, err := strconv.ParseUint(ContainerOfFoodID, 10, 32); err == nil {
			food.ContainerOfFoodID = uint(conID)
		}
	}

	if CatagoryOfFoodID := c.PostForm("CatagoryOfFoodID"); CatagoryOfFoodID != "" {
		if cataID, err := strconv.ParseUint(CatagoryOfFoodID, 10, 32); err == nil {
			food.CatagoryOfFoodID = uint(cataID)
		}
	}

	if EmployeeID := c.PostForm("EmployeeID"); EmployeeID != "" {
		if eID, err := strconv.ParseUint(EmployeeID, 10, 32); err == nil {
			food.EmployeeID = uint(eID)
		}
	}

	file, err := c.FormFile("PictureOfFood")
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

		food.PictureOfFood = filePath
	}

	if err := db.Save(&food).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update food: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Food updated successfully", "data": food})
}

func DeleteFoodOfStockByID(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var food entity.StockOfFood

	if err := db.Where("id = ?", id).First(&food).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
		return
	}

	if err := db.Delete(&food).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete food"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Food deleted successfully"})
}

func GetFoodOfStockByID(c *gin.Context) {
	db := config.DB()

	FoodID := c.Param("id")

	var Food entity.StockOfFood

	if err := db.Preload("Employee").Preload("CatagoryOfFood").Preload("ContainerOfFood").First(&Food, FoodID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, Food)
}
