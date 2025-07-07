package entity

import (

	"gorm.io/gorm"
)

type Like struct {
	gorm.Model
	UserID   uint  `gorm:"uniqueIndex:user_review_unique" valid:"required~UserID is required"` 
	ReviewID *uint `gorm:"uniqueIndex:user_review_unique" valid:"required~ReviewID is required"` 

	Review Review `gorm:"foreignKey:ReviewID"` 
}

