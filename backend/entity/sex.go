package entity

import "gorm.io/gorm"

type Sex struct {
	gorm.Model
	Sex     string `valid:"required~Sex is required,matches(^[a-zA-Z0-9 ]+$)~Sex must not contain special characters"` 
	Animals []Animal `gorm:"foreignKey:SexID"`
}
