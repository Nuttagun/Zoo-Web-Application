package veterianController

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

// GetAllMedicalRecord ดึงข้อมูลทั้งหมดของ MedicalRecord
func GetAllMedicalRecord(c *gin.Context) {
	var medicalRecords []entity.Medicalrecord

	// เรียกใช้ DB เพื่อดึงข้อมูลทั้งหมดของ Medicalrecord
	db := config.DB()

	if err := db.Preload("Treatment").Preload("Prescription").Preload("Employee").Find(&medicalRecords).Error; err != nil {
		// หากเกิดข้อผิดพลาดในการดึงข้อมูล
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve medical records"})
		return
	}

	// ส่งข้อมูลกลับไปให้ผู้ใช้งาน
	c.JSON(http.StatusOK, gin.H{"data": medicalRecords})
}

func CreateMedicalRecordfromreport(c *gin.Context) {
	var input struct {
		ReportID       uint
		MedicalRecord  entity.Medicalrecord
		Treatment      entity.Treatment
		Prescription   entity.Prescription
		MedicineIDs    []uint
		HealthAnimalID uint
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if the report exists
	var report entity.Report
	if err := config.DB().First(&report, input.ReportID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	fmt.Printf("Starting transaction for report ID: %d\n", input.ReportID)

	// Start a transaction
	tx := config.DB().Begin()

	// Save Treatment
	if err := tx.Create(&input.Treatment).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create treatment"})
		return
	}
	fmt.Printf("Created treatment with ID: %d\n", input.Treatment.ID)

	// Save the medical record and set TreatmentID
	input.MedicalRecord.TreatmentID = input.Treatment.ID
	if err := tx.Create(&input.MedicalRecord).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create medical record"})
		return
	}
	fmt.Printf("Created medical record with ID: %d\n", input.MedicalRecord.ID)

	// Save Prescription if it exists
	if input.Prescription.Frequency != "" {
		input.Prescription.EmployeeID = input.MedicalRecord.EmployeeID
		if err := tx.Create(&input.Prescription).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription"})
			return
		}
		fmt.Printf("Created prescription with ID: %d\n", input.Prescription.ID)

		if err := tx.Model(&input.MedicalRecord).Update("prescription_id", input.Prescription.ID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update medical record with prescription ID"})
			return
		}

		// Link medicines to Prescription
		var medicines []entity.Medicine
		if err := tx.Where("id IN ?", input.MedicineIDs).Find(&medicines).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find medicines"})
			return
		}

		for _, medicine := range medicines {
			prescriptionMedicine := entity.PrescriptionMedicine{
				PrescriptionID: input.Prescription.ID,
				MedicineID:     medicine.ID,
			}
			if err := tx.Create(&prescriptionMedicine).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription medicine"})
				return
			}
			fmt.Printf("Linked medicine ID %d to prescription\n", medicine.ID)
		}
	}

	// Update the Report status
	if err := tx.Model(&entity.Report{}).
		Where("id = ?", input.ReportID).
		Update("StatusVet", "Success").Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update report status"})
		return
	}
	fmt.Printf("Updated report status to Success\n")

	// Update the Animal Health Status
	var animal entity.Animal
	if err := tx.First(&animal, report.AnimalID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find animal"})
		return
	}

	fmt.Printf("Before update: Animal ID: %d, Current Health Status: %d\n", animal.ID, animal.HealthAnimalID)

	// Try direct SQL update
	if err := tx.Exec("UPDATE animals SET health_animal_id = ? WHERE id = ?", 1, animal.ID).Error; err != nil {
		fmt.Printf("Error updating animal health: %v\n", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update animal health"})
		return
	}

	// Verify the update
	var updatedAnimal entity.Animal
	if err := tx.First(&updatedAnimal, animal.ID).Error; err != nil {
		fmt.Printf("Error verifying update: %v\n", err)
	} else {
		fmt.Printf("After update: Animal ID: %d, New Health Status: %d\n", updatedAnimal.ID, updatedAnimal.HealthAnimalID)
	}

	// Commit with error checking
	if err := tx.Commit().Error; err != nil {
		fmt.Printf("Transaction commit error: %v\n", err)
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}
	fmt.Printf("Transaction committed successfully\n")

	// Respond with success
	c.JSON(http.StatusOK, gin.H{
		"message":        "Medical record saved successfully",
		"medicalRecord":  input.MedicalRecord,
		"prescriptionID": input.Prescription.ID,
		"status":         "Report status updated to Success",
	})
}

func UpdateMedicalRecordAndTreatment(c *gin.Context) {
	db := config.DB()

	// Get the MedicalRecord ID from the URL parameter
	MedicalRecordID := c.Param("id")

	var medicalRecord entity.Medicalrecord
	// Find the MedicalRecord by its ID
	if err := db.First(&medicalRecord, MedicalRecordID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "MedicalRecord not found"})
		return
	}

	// Bind the incoming JSON to the existing MedicalRecord struct
	var input struct {
		Medicalrecord entity.Medicalrecord
		Treatment     entity.Treatment
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update MedicalRecord
	medicalRecord.DiagnosisDate = input.Medicalrecord.DiagnosisDate
	medicalRecord.Diagnosis = input.Medicalrecord.Diagnosis
	medicalRecord.Symptoms = input.Medicalrecord.Symptoms
	medicalRecord.TotalCost = input.Medicalrecord.TotalCost

	if err := db.Save(&medicalRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Find and Update Treatment
	var treatment entity.Treatment
	if err := db.First(&treatment, medicalRecord.TreatmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Treatment not found"})
		return
	}

	treatment.TreatmentPlan = input.Treatment.TreatmentPlan
	if err := db.Save(&treatment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"medicalRecord": medicalRecord,
		"treatment":     treatment,
	})
}

func GetMedicalRecordByID(c *gin.Context) {
	db := config.DB()

	// Get the MedicalRecord ID from the URL parameter
	MedicalRecordID := c.Param("id")

	var medicalRecord entity.Medicalrecord
	// Find the MedicalRecord by its ID and preload the associated Treatment
	if err := db.Preload("Treatment").First(&medicalRecord, MedicalRecordID).Error; err != nil {
		// If the MedicalRecord is not found, return a 404 error
		c.JSON(http.StatusNotFound, gin.H{"error": "MedicalRecord not found"})
		return
	}

	// Return the MedicalRecord data
	c.JSON(http.StatusOK, medicalRecord)
}

func DeleteMedicalRecordById(c *gin.Context) {
	db := config.DB()

	// Get the MedicalRecord ID from the URL parameter
	MedicalRecordID := c.Param("id")

	var medicalRecord entity.Medicalrecord
	// Find the MedicalRecord by its ID
	if err := db.First(&medicalRecord, MedicalRecordID).Error; err != nil {
		// If the MedicalRecord is not found, return a 404 error
		c.JSON(http.StatusNotFound, gin.H{"error": "MedicalRecord not found"})
		return
	}

	// Delete the MedicalRecord from the database
	if err := db.Delete(&medicalRecord).Error; err != nil {
		// If there is an error deleting the data, return a 500 error
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return a success message after deletion
	c.JSON(http.StatusOK, gin.H{"message": "MedicalRecord deleted successfully"})
}

func GetReportsByAnimalID(c *gin.Context) {
	db := config.DB()

	animalID := c.Param("id")
	var reports []entity.Report

	if err := db.Preload("Employee").
		Preload("Medicalrecord.Employee").
		Preload("Medicalrecord.Report").
		Preload("Medicalrecord.Treatment").
		Preload("Medicalrecord.Prescription").
		Preload("Medicalrecord.Prescription.Medicines").
		Preload("Medicalrecord.Prescription.Medicines.MedicineType").
		// Preload("Medicalrecord.Prescription.PrescriptionMedicines").
		Where("animal_id = ?", animalID).
		Find(&reports).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "reports not found"})
		return
	}

	c.JSON(http.StatusOK, reports)
}

func GetMedicalByReportID(c *gin.Context) {
	db := config.DB()

	reportID := c.Param("id")
	var medicalRecords []entity.Medicalrecord

	if err := db.Preload("Employee.User").
		Preload("Report").
		Preload("Treatment").
		Preload("Prescription.Medicines").
		Preload("Prescription.Medicines.MedicineType").
		Where("report_id = ?", reportID).
		Find(&medicalRecords).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "medical records not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": medicalRecords})
}
