package entity

import (

	"gorm.io/gorm"
)

type FoodRequisitionDetail struct {
	gorm.Model
	Quantity 			uint 				`valid:"required~Quantity is required"` 

	FoodRequisitionID 	uint             	`valid:"required~FoodRequisitionID is required"`
	FoodRequisition   	FoodRequisition 	`gorm:"foreignKey:FoodRequisitionID" valid:"-"`

	StockOfFoodID 		uint         		`valid:"required~StockOfFoodID is required"`
	StockOfFood   		StockOfFood 		`gorm:"foreignKey:StockOfFoodID" valid:"-"`
}
