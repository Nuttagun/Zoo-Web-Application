package entity

import "gorm.io/gorm"

type Biological struct {
	gorm.Model
	Biological string `valid:"required~Biological is required,matches(^[a-zA-Z0-9 ]+$)~Biological must not contain special characters"` 
	Animals    []Animal `gorm:"foreignKey:BiologicalID"`
}
