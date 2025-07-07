package veterianController

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListMedicineType(c *gin.Context) {
	var MedicalTypes []entity.MedicineType

	db := config.DB()

	db.Find(&MedicalTypes)

	c.JSON(http.StatusOK, &MedicalTypes)
}

func CreateMedicineType(c *gin.Context) {
	db := config.DB()

	// รับข้อมูล JSON และแปลงเป็นโครงสร้าง Animal
	var newMedicineType entity.MedicineType
	if err := c.ShouldBindJSON(&newMedicineType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกข้อมูล Animal ลงในฐานข้อมูล
	if err := db.Create(&newMedicineType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลที่สร้างใหม่กลับไปในรูปแบบ JSON
	c.JSON(http.StatusCreated, newMedicineType)
}

func UpdateMedicineTypeByID(c *gin.Context) {
	db := config.DB()
	var medicineType entity.MedicineType

	// รับค่า ID จาก URL parameter
	id := c.Param("id")

	// ค้นหายาโดยใช้ ID
	if err := db.Where("id = ?", id).First(&medicineType).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "MedicineType not found",
		})
		return
	}

	// Bind JSON ที่ส่งมาจาก request body เข้ากับ medicine
	if err := c.ShouldBindJSON(&medicineType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid input",
		})
		return
	}

	// อัพเดตข้อมูล
	if err := db.Save(&medicineType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update medicineType",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Medicine updated successfully",
		"data":    medicineType,
	})
}

func DeleteMedicineTypeByID(c *gin.Context) {
	db := config.DB()

	// ดึง ID ของ Medicine จาก request
	MedicineTypeID := c.Param("id")

	var MedicineType entity.MedicineType

	// ค้นหายาที่มี MedicineID ตรงกับที่ส่งมา
	if err := db.First(&MedicineType, MedicineTypeID).Error; err != nil {
		// ถ้าไม่พบยา ให้ส่งกลับ 404
		c.JSON(http.StatusNotFound, gin.H{"error": "MedicineType not found"})
		return
	}

	// ลบยาจากฐานข้อมูล
	if err := db.Delete(&MedicineType).Error; err != nil {
		// ถ้าเกิดข้อผิดพลาดในการลบ ให้ส่งกลับ 500
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete MedicineType"})
		return
	}

	// ถ้าลบสำเร็จ ให้ส่งข้อความตอบกลับ
	c.JSON(http.StatusOK, gin.H{"message": "MedicineType deleted successfully"})
}

func GetMedicineTypeByID(c *gin.Context) {
	db := config.DB()

	medicineTypeID := c.Param("id")

	var medicineType entity.MedicineType

	// ใช้ Preload เพื่อโหลดข้อมูลของ MedicineType ด้วย
	if err := db.First(&medicineType, medicineTypeID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, medicineType)
}
