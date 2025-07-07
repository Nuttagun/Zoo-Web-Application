package veterianController

import (
	"net/http"

	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"

	"github.com/gin-gonic/gin"
)

func GetAllPresciption(c *gin.Context) {
	db := config.DB()

	var prescriptions []entity.Prescription
	if err := db.
		Preload("Employee").               // โหลดข้อมูล Employee ที่เกี่ยวข้อง
		Preload("Medicines").              // โหลดข้อมูล Medicines (ยา) ที่เกี่ยวข้อง
		Preload("Medicines.MedicineType"). // โหลดข้อมูล MedicineType ของแต่ละยา
		Find(&prescriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(prescriptions) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "ไม่มีข้อมูลในฐานข้อมูล"})
		return
	}

	c.JSON(http.StatusOK, prescriptions)
}

func CreatePrescription(c *gin.Context) {
	db := config.DB()

	// รับข้อมูล JSON และแปลงเป็นโครงสร้าง Animal
	var newPrescription entity.Prescription
	if err := c.ShouldBindJSON(&newPrescription); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกข้อมูล Animal ลงในฐานข้อมูล
	if err := db.Create(&newPrescription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลที่สร้างใหม่กลับไปในรูปแบบ JSON
	c.JSON(http.StatusCreated, newPrescription)
}

// func UpdatePrescription(c *gin.Context) {
//     db := config.DB()

//     // Get the prescription ID from the URL parameter
//     prescriptionID := c.Param("id")

//     var prescription entity.Prescription

//     // Find the prescription by its ID
//     if err := db.Preload("Medicines").First(&prescription, prescriptionID).Error; err != nil {
//         c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
//         return
//     }

//     // Bind the incoming JSON to a temporary struct
//     var input struct {
// 		Frequency  string    `json:"frequency"`
// 		Duration   string    `json:"duration"`
// 		StartDate  time.Time `json:"start_date"`
// 		EndDate    time.Time `json:"end_date"`
// 		Note       string    `json:"note"`
// 		EmployeeID uint      `json:"employee_id"`
// 		Medicines  []uint    `json:"medicines"`
// 	}

//     if err := c.ShouldBindJSON(&input); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//         return
//     }

//     // Update the fields of the prescription
//     prescription.Frequency = input.Frequency
//     prescription.Duration = input.Duration
//     prescription.StartDate = input.StartDate
//     prescription.EndDate = input.EndDate
//     prescription.Note = input.Note
//     prescription.EmployeeID = input.EmployeeID

//     // Update Medicines (many-to-many relationship)
//     if len(input.Medicines) > 0 {
//         var medicines []entity.Medicine
//         if err := db.Where("id IN ?", input.Medicines).Find(&medicines).Error; err != nil {
//             c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid medicine IDs"})
//             return
//         }
//         // Replace the existing relations with new ones
//         if err := db.Model(&prescription).Association("Medicines").Replace(&medicines); err != nil {
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update medicines"})
//             return
//         }
//     }

//     // Save the updated prescription
//     if err := db.Save(&prescription).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
//         return
//     }

//     // Return the updated prescription as JSON
//     var updatedPrescription entity.Prescription
//     if err := db.Preload("Medicines").First(&updatedPrescription, prescriptionID).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated prescription"})
//         return
//     }

//     c.JSON(http.StatusOK, updatedPrescription)
// }

func DeletePrescriptionByID(c *gin.Context) {
	db := config.DB()

	// ดึง ID ของ Medicine จาก request
	PrescriptionID := c.Param("id")

	var Prescription entity.Prescription

	// ค้นหายาที่มี MedicineID ตรงกับที่ส่งมา
	if err := db.First(&Prescription, PrescriptionID).Error; err != nil {
		// ถ้าไม่พบยา ให้ส่งกลับ 404
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	// ลบยาจากฐานข้อมูล
	if err := db.Delete(&Prescription).Error; err != nil {
		// ถ้าเกิดข้อผิดพลาดในการลบ ให้ส่งกลับ 500
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Prescription"})
		return
	}

	// ถ้าลบสำเร็จ ให้ส่งข้อความตอบกลับ
	c.JSON(http.StatusOK, gin.H{"message": "Prescription deleted successfully"})
}

func GetPrescriptionByID(c *gin.Context) {
	db := config.DB()

	prescriptionID := c.Param("id")

	var prescription entity.Prescription

	// Load Prescription along with Medicines and their types
	if err := db.Preload("Medicines.MedicineType").First(&prescription, prescriptionID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Prescription not found"})
		return
	}

	c.JSON(http.StatusOK, prescription)
}
