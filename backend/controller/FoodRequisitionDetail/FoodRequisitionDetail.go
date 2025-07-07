package foodrequisitiondetail

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)


type CreateFoodRequisitionDetailInput struct {
	Quantity          uint `json:"Quantity" binding:"required"` 
	FoodRequisitionID uint `json:"FoodRequisitionID" binding:"required"`
	StockOfFoodID     uint `json:"StockOfFoodID" binding:"required"`
}

func CreateFoodRequisitionDetail(c *gin.Context) {
	db := config.DB()


	var input CreateFoodRequisitionDetailInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}


	if input.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity must be greater than 0"})
		return
	}

	var foodRequisition entity.FoodRequisition
	if err := db.First(&foodRequisition, input.FoodRequisitionID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "FoodRequisitionID not found", "details": "FoodRequisition with the provided ID does not exist"})
		return
	}


	var stockOfFood entity.StockOfFood
	if err := db.First(&stockOfFood, input.StockOfFoodID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "StockOfFoodID not found", "details": "StockOfFood with the provided ID does not exist"})
		return
	}

	detail := entity.FoodRequisitionDetail{
		Quantity:          input.Quantity,
		FoodRequisitionID: input.FoodRequisitionID,
		StockOfFoodID:     input.StockOfFoodID,
	}


	if err := db.Create(&detail).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create FoodRequisitionDetail", "details": err.Error()})
		return
	}


	c.JSON(http.StatusCreated, gin.H{
		"message": "FoodRequisitionDetail created successfully",
		"data": gin.H{
			"quantity":            detail.Quantity,
			"food_requisition_id": detail.FoodRequisitionID,
			"stock_of_food_id":    detail.StockOfFoodID,
		},
	})
}


type ReduceStockFoodQuantityInput struct {
	ReduceAmount int `json:"reduce_amount" binding:"required,min=1"` 
}

func ReduceStockFoodQuantity(c *gin.Context) {
	db := config.DB()


	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	
	var stockFood entity.StockOfFood
	if err := db.First(&stockFood, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "StockOfFood not found"})
		return
	}


	var input ReduceStockFoodQuantityInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	
	if stockFood.Quantity < input.ReduceAmount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough stock to reduce"})
		return
	}


	stockFood.Quantity -= input.ReduceAmount


	if err := db.Save(&stockFood).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update Quantity", "details": err.Error()})
		return
	}


	c.JSON(http.StatusOK, gin.H{
		"message": "StockOfFood quantity reduced successfully",
		"data":    stockFood,
	})
}