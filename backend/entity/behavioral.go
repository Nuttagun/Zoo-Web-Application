package entity

import "gorm.io/gorm"

type Behavioral struct {
	gorm.Model
	Behavioral string `valid:"required~Behavioral is required,matches(^[a-zA-Z0-9 ]+$)~Behavioral must not contain special characters"` 
	Animals    []Animal `gorm:"foreignKey:BehavioralID"`
}
