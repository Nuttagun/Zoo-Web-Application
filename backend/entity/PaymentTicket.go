package entity

import (
	"time"

	"gorm.io/gorm"
)

type PaymentTicket struct {
	gorm.Model
	Amount       float64    `valid:"required~Amount is required, range(1|100000000000)~Amount must be at least 1"` 
	PaymentDate  time.Time  `valid:"required~PaymentDate is required"`
	Path         string     `valid:"required~Path is required"`
	PaymentStatus bool    //`valid:"required~PaymentStatus is required"`  //required หมายถึงต้องกำหนดค่า (ไม่สามารถเป็นค่า zero value เช่น false ได้) 

	BookingID uint       `valid:"required~BookingID is required"`
	Booking   Booking    `gorm:"foreignKey:BookingID" valid:"-"`

	PromotionID *uint     // สามารถเป็น nil ได้
	Promotion   Promotion `gorm:"foreignKey:PromotionID" valid:"-"`
}//ปิด aut38