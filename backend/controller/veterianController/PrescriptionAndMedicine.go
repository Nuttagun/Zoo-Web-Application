package veterianController

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"gorm.io/gorm"
)

func ShowPrescriptionMedicinesFromLink(c *gin.Context) {
	// รับ PrescriptionID จาก URL parameter
	prescriptionID := c.Param("id")
	if prescriptionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PrescriptionID is required"})
		return
	}

	// แสดงค่าของ prescriptionID สำหรับ debugging
	fmt.Println("Received PrescriptionID:", prescriptionID)

	var prescriptionMedicines []entity.PrescriptionMedicine

	// ค้นหาข้อมูลจากตาราง PrescriptionMedicine
	if err := config.DB().Where("prescription_id = ?", prescriptionID).Find(&prescriptionMedicines).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No medicines found for this prescription"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch medicines"})
		}
		return
	}

	// แสดงค่าของ prescriptionMedicines สำหรับ debugging
	fmt.Println("Found PrescriptionMedicines:", prescriptionMedicines)

	// ดึงข้อมูลยาโดยใช้ MedicineID จาก PrescriptionMedicine
	var medicines []entity.Medicine
	for _, prescriptionMedicine := range prescriptionMedicines {
		var medicine entity.Medicine
		if err := config.DB().First(&medicine, prescriptionMedicine.MedicineID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch medicine details"})
			return
		}
		medicines = append(medicines, medicine)
	}

	// ส่งข้อมูลยาออกไป
	c.JSON(http.StatusOK, gin.H{
		"prescriptionID": prescriptionID,
		"medicines":      medicines,
	})
}
