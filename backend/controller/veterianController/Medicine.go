package veterianController

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func GetAllMedicine(c *gin.Context) {
	db := config.DB()

	var Medicine []entity.Medicine
	if err := db.
		Preload("MedicineType").
		Find(&Medicine).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, Medicine)
}

func CreateMedicine(c *gin.Context) {
	db := config.DB()

	// รับข้อมูล JSON และแปลงเป็นโครงสร้าง Animal
	var newMedicine entity.Medicine
	if err := c.ShouldBindJSON(&newMedicine); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกข้อมูล Animal ลงในฐานข้อมูล
	if err := db.Create(&newMedicine).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลที่สร้างใหม่กลับไปในรูปแบบ JSON
	c.JSON(http.StatusCreated, newMedicine)
}

func UpdateMedicineByID(c *gin.Context) {
	db := config.DB()
	var medicine entity.Medicine

	// รับค่า ID จาก URL parameter
	id := c.Param("id")

	// ค้นหายาโดยใช้ ID
	if err := db.Where("id = ?", id).First(&medicine).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Medicine not found",
		})
		return
	}

	// Bind JSON ที่ส่งมาจาก request body เข้ากับ medicine
	if err := c.ShouldBindJSON(&medicine); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid input",
		})
		return
	}

	if medicine.Price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Price must be a positive number",
		})
		return
	}

	// อัพเดตข้อมูล
	if err := db.Save(&medicine).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update medicine",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Medicine updated successfully",
		"data":    medicine,
	})
}

func DeleteMedicineByID(c *gin.Context) {
	db := config.DB()

	// ดึง ID ของ Medicine จาก request
	MedicineID := c.Param("id")

	var Medicine entity.Medicine

	// ค้นหายาที่มี MedicineID ตรงกับที่ส่งมา
	if err := db.First(&Medicine, MedicineID).Error; err != nil {
		// ถ้าไม่พบยา ให้ส่งกลับ 404
		c.JSON(http.StatusNotFound, gin.H{"error": "Medicine not found"})
		return
	}

	// ลบยาจากฐานข้อมูล
	if err := db.Delete(&Medicine).Error; err != nil {
		// ถ้าเกิดข้อผิดพลาดในการลบ ให้ส่งกลับ 500
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Medicine"})
		return
	}

	// ถ้าลบสำเร็จ ให้ส่งข้อความตอบกลับ
	c.JSON(http.StatusOK, gin.H{"message": "Medicine deleted successfully"})
}

func GetMedicineByID(c *gin.Context) {
	db := config.DB()

	medicineID := c.Param("id")

	var medicine entity.Medicine

	// ใช้ Preload เพื่อโหลดข้อมูลของ MedicineType ด้วย
	if err := db.Preload("MedicineType").First(&medicine, medicineID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, medicine)
}
