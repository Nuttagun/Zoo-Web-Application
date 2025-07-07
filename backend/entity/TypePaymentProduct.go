package entity

import (
	"gorm.io/gorm"
)

type TypePaymentProduct struct {
	gorm.Model
	TypePayment  string `valid:"required~TypePayment is required"`

	PaymentProduct []PaymentProduct `gorm:"foreignKey:TypePaymentProductID"`
}