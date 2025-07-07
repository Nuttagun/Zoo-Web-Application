package entity

import "gorm.io/gorm"

type Genders struct {
	gorm.Model
	Gender string

	Users []User `gorm:"foreignKey:GenderID"`
}
