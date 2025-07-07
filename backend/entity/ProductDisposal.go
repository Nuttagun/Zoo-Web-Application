package entity

import (
	"gorm.io/gorm"
	"time"
)

type ProductDisposal struct {
	gorm.Model
	Disposaldate time.Time `valid:"required~Date is required"`
	Reason string `valid:"required~Reason is required"`
	Quantity uint `valid:"required~Quantity is required,range(1|1000000000000)~Quantity must be greater than 0"`

	ProductID   uint     `valid:"required~ProductID is required"`
    Product     Product `gorm:"foreignKey:ProductID" valid:"-"`

	EmployeeID   uint     `valid:"required~EmployeeID is required"`
    Employee     Employee `gorm:"foreignKey:EmployeeID" valid:"-"`
}