package entity

import (
	"time"

	"gorm.io/gorm"
)

type FoodRequisition struct {
	gorm.Model
	Note            string    	`valid:"required~Note is required"` 
	RequisitionDate time.Time 	`valid:"required~Requisition date is required"`                   

	WorkID 			*uint     	`valid:"required~WorkID is required"`
	Work   			Work 		`gorm:"foreignKey:WorkID" valid:"-"`

	Details []FoodRequisitionDetail `gorm:"foreignKey:FoodRequisitionID"`
}
