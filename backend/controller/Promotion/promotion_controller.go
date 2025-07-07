package controller

import (
	// "fmt"
	// "github.com/google/uuid"
	// "os"
	// "path/filepath"

	"net/http"

	"github.com/asaskevich/govalidator"

	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// POST /Promotion
func CreatePromotion(c *gin.Context) {
	var promotion entity.Promotion
	var condition entity.Condition
	var promotion_category entity.PromotionCategory
	var promotion_status entity.PromotionStatus

	// bind เข้าตัวแปร promotion
	if err := c.ShouldBindJSON(&promotion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ตรวจสอบ struc ข้อมูลด้วย govalidator
	if _, err := govalidator.ValidateStruct(promotion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// ค้นหา PromotionStatus ด้วย id
	db.First(&promotion_status, promotion.PromotionStatusID)
	if promotion_status.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "PromotionStatus not found"})
		return
	}

	// // ค้นหา Condition ด้วย id
	// var condition entity.Condition
	// db.First(&condition, promotion.ConditionID)
	// if condition.ID == 0 {
	// 	c.JSON(http.StatusNotFound, gin.H{"error": "condition not found"})
	// 	return
	// }

	// // ค้นหา PromotionCategory ด้วย id
	// var promotion_category entity.PromotionCategory
	// db.First(&promotion_category, promotion.PromotionCategoryID)
	// if promotion_category.ID == 0 {
	// 	c.JSON(http.StatusNotFound, gin.H{"error": "promotion category not found"})
	// 	return
	// }

	// ค้นหา Employee ด้วย id
	var employee entity.Employee
	db.First(&employee, employee.Promotion)
	if employee.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	// // รับไฟล์ภาพโปรไฟล์
    // PromotionImage, err := c.FormFile("PromotionPicture")
    // if err != nil {
    //     c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error receiving Promotion image: %v", err)})
    //     return
    // }

    // // สร้างไดเรกทอรีสำหรับอัปโหลดไฟล์ภาพ
    // uploadDir := "uploads"
    // if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
    //     c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create upload directory: %v", err)})
    //     return
    // }

    // // ตั้งชื่อไฟล์ใหม่และบันทึกไฟล์ภาพ
    // fileName := fmt.Sprintf("%s-%s", uuid.New().String(), PromotionImage.Filename)
    // filePath := filepath.Join(uploadDir, fileName)

    // if err := c.SaveUploadedFile(PromotionImage, filePath); err != nil {
    //     c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save profile image: %v", err)})
    //     return
    // }

	// สร้าง Promotion
	u := entity.Promotion{
		PromotionName: promotion.PromotionName,
		StartDate: promotion.StartDate,
		EndDate: promotion.EndDate,
		Discount: promotion.Discount,
		Description: promotion.Description,

		NumberPromotionUse: promotion.NumberPromotionUse,

		VisitDate: promotion.VisitDate,
		EndVisitDate: promotion.EndVisitDate,

		PromotionStatusID: promotion.PromotionStatusID,
		PromotionStatus: promotion_status,

		ConditionID: promotion.ConditionID,
		Condition: condition,

		PromotionCategoryID: promotion.PromotionCategoryID,
		PromotionCategory: promotion_category,

		EmployeeID: promotion.EmployeeID,
		Employee: employee,
	}

	// บันทึก
	if err := db.Create(&u).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Created success", "data": u})
}

func GetPromotions(c *gin.Context) {
	var promotions []entity.Promotion
	db := config.DB()

	if err := db.Preload("PromotionStatus").Preload("Condition").Preload("PromotionCategory").Preload("Employee").Find(&promotions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, promotions)
}

func GetPromotionByID(c *gin.Context) {
	id := c.Param("id")
	var promotion entity.Promotion
	db := config.DB()

	if err := db.Preload("PromotionStatus").Preload("Condition").Preload("PromotionCategory").First(&promotion, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, promotion)
}

func UpdatePromotion(c *gin.Context) {
	var promotion entity.Promotion

	promotionID := c.Param("id")

	db := config.DB()

	result := db.First(&promotion, promotionID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}
	if err := c.ShouldBindJSON(&promotion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	// ตรวจสอบ struc ข้อมูลด้วย govalidator
	if _, err := govalidator.ValidateStruct(promotion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result = db.Save(&promotion)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}

func DeletePromotion(c *gin.Context) {
	id := c.Param("id")
	var promotion entity.Promotion
	db := config.DB()

	if err := db.First(&promotion, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Promotion not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	if err := db.Delete(&promotion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Promotion deleted successfully",
	})
}
