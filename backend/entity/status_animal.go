package entity

import "gorm.io/gorm"

type HealthAnimal struct {
	gorm.Model
	Status string
}
