package report

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func CreateReport(c *gin.Context) {
	var report entity.Report
	db := config.DB()

	image, err := c.FormFile("picture")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	filePath := filepath.Join(uploadDir, image.Filename)
	if err := c.SaveUploadedFile(image, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	report.Title = c.PostForm("title")
	if report.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
		return
	}

	report.Description = c.PostForm("description")
	if report.Description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Description is required"})
		return
	}

	reportDateStr := c.PostForm("reportDate")
	reportDate, err := time.Parse("2006-01-02", reportDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report date format"})
		return
	}

	report.ReportDate = reportDate

	report.StatusVet = c.PostForm("statusVet")

	report.Picture = filePath

	animalIDStr := c.PostForm("animalID")
	if animalIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "AnimalID is required"})
		return
	}

	animalID, err := strconv.ParseUint(animalIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid animal ID"})
		return
	}
	report.AnimalID = uint(animalID)

	employeeIDStr := c.PostForm("employeeID")
	employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}
	report.EmployeeID = uint(employeeID)

	if err := db.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Report created successfully", "data": report})
}

func ListReport(c *gin.Context) {
	var reports []entity.Report

	db := config.DB()
	results := db.Preload("Animal").Preload("Employee").Find(&reports)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

func DeleteReport(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var report entity.Report

	if err := db.Where("id = ?", id).First(&report).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	if err := db.Delete(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete Report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report deleted successfully"})
}

func GetReportById(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var report entity.Report

	if err := db.Preload("Animal").Preload("Employee").Where("id = ?", id).First(&report).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Animal not found"})
		return
	}

	c.JSON(http.StatusOK, report)
}

func UpdateReport(c *gin.Context) {
	var report entity.Report
	db := config.DB()

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing report ID"})
		return
	}

	if err := db.Where("id = ?", id).First(&report).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	if title := c.PostForm("Title"); title != "" {
		report.Title = title
	}

	if description := c.PostForm("Description"); description != "" {
		report.Description = description
	}

	if reportDate := c.PostForm("ReportDate"); reportDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", reportDate); err == nil {
			report.ReportDate = parsedDate
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid date format: %v", err)})
			return
		}
	}

	if statusVet := c.PostForm("StatusVet"); statusVet != "" {
		report.StatusVet = statusVet
	}

	if animalID := c.PostForm("AnimalID"); animalID != "" {
		if aID, err := strconv.ParseUint(animalID, 10, 32); err == nil {
			report.AnimalID = uint(aID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid animal ID: %v", err)})
			return
		}
	}

	if employeeID := c.PostForm("EmployeeID"); employeeID != "" {
		if eID, err := strconv.ParseUint(employeeID, 10, 32); err == nil {
			report.EmployeeID = uint(eID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid employee ID: %v", err)})
			return
		}
	}

	file, err := c.FormFile("picture")
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

		report.Picture = filePath
	}

	if err := db.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update report: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Report updated successfully",
		"data":    report,
	})
}
