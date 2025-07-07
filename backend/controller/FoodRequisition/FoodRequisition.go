package foodrequisition

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)


func GetAllStockFood(c *gin.Context) {

	db := config.DB()


	var stocks []entity.StockOfFood


	if err := db.Preload("ContainerOfFood").
		Preload("CatagoryOfFood").
		Preload("Employee").
		Find(&stocks).Error; err != nil {
	
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}


	c.JSON(http.StatusOK, gin.H{"data": stocks})
}

type CreateFoodRequisitionInput struct {
	Note            string `json:"Note" binding:"required"`
	RequisitionDate string `json:"RequisitionDate" binding:"required"`
	WorkID          uint   `json:"WorkID" binding:"required"`
}

func CreateFoodRequisition(c *gin.Context) {
	db := config.DB()


	var input CreateFoodRequisitionInput


	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	requisitionDate, err := time.Parse("2006-01-02", input.RequisitionDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid requisition date format, expected YYYY-MM-DD"})
		return
	}

	var work entity.Work
	if err := db.First(&work, input.WorkID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Work with ID %d not found", input.WorkID)})
		return
	}

	foodRequisition := entity.FoodRequisition{
		Note:            input.Note,
		RequisitionDate: requisitionDate,
		WorkID:          &input.WorkID,
	}


	if err := db.Create(&foodRequisition).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create food requisition: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Food requisition created successfully",
		"data":    foodRequisition,
	})
}

func GetFoodRequisitionByWorkID(c *gin.Context) {
	workID := c.Param("workID")
	// Convert workID from string to uint
	workIDUint, err := strconv.ParseUint(workID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid WorkID"})
		return
	}

	var foodRequisitions []entity.FoodRequisition
	db := config.DB()

	// Query food requisitions by WorkID with preloading of related fields
	if err := db.Preload("Work.Employee.User").
		Preload("Work.Habitat").
		Preload("Details.StockOfFood.CatagoryOfFood").
		Where("work_id = ?", uint(workIDUint)).
		Find(&foodRequisitions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching food requisitions: " + err.Error()})
		return
	}

	if len(foodRequisitions) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No food requisitions found for this WorkID"})
		return
	}

	c.JSON(http.StatusOK, foodRequisitions)
}




