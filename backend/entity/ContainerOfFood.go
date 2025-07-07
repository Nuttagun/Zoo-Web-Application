package entity

import "gorm.io/gorm"

type ContainerOfFood struct {
	gorm.Model
	ContainerName string `valid:"required~ContainerName is required,stringlength(1|100)~ContainerName must be between 1 and 100 characters"`

	StockOfFood []StockOfFood `gorm:"foreignkey:ContainerOfFoodID"`
}
