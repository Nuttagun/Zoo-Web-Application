package veterianController

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func GetTreamentPlanByID(c *gin.Context) {
	db := config.DB()

	// รับ TreatmentID จาก URL parameter
	TreatmentID := c.Param("id")

	var treatment entity.Treatment

	// ค้นหาข้อมูล Treatment ด้วย ID ที่ได้รับ
	if err := db.Where("id = ?", TreatmentID).First(&treatment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งค่าผลลัพธ์ที่ได้จาก Treatment ทั้งหมด
	c.JSON(http.StatusOK, gin.H{
		"TreatmentID":   treatment.ID,
		"TreatmentPlan": treatment.TreatmentPlan, // แสดง TreatmentPlan
	})
}

func CreateTreatmenPlan(c *gin.Context) {
	db := config.DB()

	// รับข้อมูล JSON และแปลงเป็นโครงสร้าง Animal
	var newTreatment entity.Treatment
	if err := c.ShouldBindJSON(&newTreatment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกข้อมูล Animal ลงในฐานข้อมูล
	if err := db.Create(&newTreatment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลที่สร้างใหม่กลับไปในรูปแบบ JSON
	c.JSON(http.StatusCreated, newTreatment)
}

func UpdateTreatmentPlan(c *gin.Context) {
	db := config.DB()

	// Get the animal ID from the URL parameter
	treatmentID := c.Param("id")

	var treatment entity.Treatment
	// Find the animal by its ID
	if err := db.First(&treatment, treatmentID).Error; err != nil {
		// If the animal is not found, return a 404 error
		c.JSON(http.StatusNotFound, gin.H{"error": "treatment not found"})
		return
	}

	// Bind the incoming JSON to the existing animal struct
	if err := c.ShouldBindJSON(&treatment); err != nil {
		// If there is an error binding the JSON, return a 400 error
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save the updated animal data in the database
	if err := db.Save(&treatment).Error; err != nil {
		// If there is an error saving the data, return a 500 error
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the updated animal data
	c.JSON(http.StatusOK, treatment)
}

func DeleteTreatmentByID(c *gin.Context) {
	db := config.DB()

	// ดึง ID ของ Medicine จาก request
	treatmentID := c.Param("id")

	var treatment entity.Treatment

	// ค้นหายาที่มี MedicineID ตรงกับที่ส่งมา
	if err := db.First(&treatment, treatmentID).Error; err != nil {
		// ถ้าไม่พบยา ให้ส่งกลับ 404
		c.JSON(http.StatusNotFound, gin.H{"error": "treatment not found"})
		return
	}

	// ลบยาจากฐานข้อมูล
	if err := db.Delete(&treatment).Error; err != nil {
		// ถ้าเกิดข้อผิดพลาดในการลบ ให้ส่งกลับ 500
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete treatment"})
		return
	}

	// ถ้าลบสำเร็จ ให้ส่งข้อความตอบกลับ
	c.JSON(http.StatusOK, gin.H{"message": "treatment deleted successfully"})
}
