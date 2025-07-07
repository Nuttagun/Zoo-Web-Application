package work

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

type CreateWorkInput struct {
	Feed       bool   `json:"feed"`
	Cleaning   bool   `json:"cleaning"`
	FinishDate string `json:"finish_date" binding:"required"`
	EmployeeID string `json:"employee_id" binding:"required"`
	HabitatID  uint   `json:"habitat_id" binding:"required"`
}

func CreateWork(c *gin.Context) {
	var input CreateWorkInput
	db := config.DB()

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.FinishDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Finish Date is required"})
		return
	}

	if input.EmployeeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Employee ID is required"})
		return
	}

	if input.HabitatID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Habitat ID is required"})
		return
	}

	finishDate, err := time.Parse("2006-01-02", input.FinishDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid finish date format, expected YYYY-MM-DD"})
		return
	}

	employeeID, err := strconv.ParseUint(input.EmployeeID, 10, 32)
	if err != nil || employeeID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Employee ID is required"})
		return
	}

	if !input.Feed && !input.Cleaning {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one of Feed or Cleaning must be true"})
		return
	}

	work := entity.Work{
		Feed:       input.Feed,
		Cleaning:   input.Cleaning,
		FinishDate: finishDate,
		EmployeeID: uint(employeeID),
		HabitatID:  input.HabitatID,
	}

	if err := db.Create(&work).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create work: %v", err)})
		return
	}

	var createdWork entity.Work
	if err := db.Preload("Employee").Preload("Habitat").First(&createdWork, work.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch work with relations: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Work created successfully",
		"data":    createdWork,
	})
}

func GetWorkByEmployeeID(c *gin.Context) {
	employeeID := c.Param("employeeID")
	// Convert employeeID from string to uint
	empID, err := strconv.ParseUint(employeeID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid EmployeeID"})
		return
	}

	var works []entity.Work
	db := config.DB()

	// Query works by EmployeeID and feed = 1
	if err := db.Preload("Employee").Preload("Habitat").Where("employee_id = ? AND feed = ?", uint(empID), 1).Find(&works).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching works: " + err.Error()})
		return
	}

	if len(works) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No work records found for this EmployeeID with feed = 1"})
		return
	}

	c.JSON(http.StatusOK, works)
}