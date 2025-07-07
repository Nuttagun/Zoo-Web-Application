package entity

import (
	"time"

	"gorm.io/gorm"
)
//task validate ห้ามติดลบ
//validate วันหมดอายุ
type StockOfFood struct {
	gorm.Model
	Foodname      string    `valid:"required~Foodname is required,stringlength(1|100)~Foodname must be between 1 and 100 characters,matches(^[a-zA-Zก-๙ ]+$)~Foodname must not contain special characters"`
	Quantity int `valid:"required~Quantity is required,range(1|99999)~Quantity must be between 1 and 99999"`

	ExpiryDate    time.Time `valid:"required~ExpiryDate is required"`
	PictureOfFood string    `valid:"required~PictureOfFood is required"`
	
	ContainerOfFoodID uint           `valid:"required~ContainerOfFoodID is required"`
	ContainerOfFood   ContainerOfFood `gorm:"foreignKey:ContainerOfFoodID" valid:"-"`

	CatagoryOfFoodID uint           `valid:"required~CatagoryOfFoodID is required"`
	CatagoryOfFood   CatagoryOfFood `gorm:"foreignKey:CatagoryOfFoodID" valid:"-"`

	EmployeeID uint     `valid:"required~EmployeeID is required"`
	Employee   Employee `gorm:"foreignKey:EmployeeID" valid:"-"`

	Details []FoodRequisitionDetail `gorm:"foreignKey:StockOfFoodID"`
}