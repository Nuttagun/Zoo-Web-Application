package entity

import "gorm.io/gorm"

type CatagoryOfFood struct {
	gorm.Model
	StockfoodType string `valid:"required~StockfoodType is required,stringlength(1|100)~StockfoodType must be between 1 and 100 characters"`
	Description   string `valid:"stringlength(0|255)~Description can be up to 255 characters"`

	StockOfFood []StockOfFood `gorm:"foreignkey:CatagoryOfFoodID"`
}
