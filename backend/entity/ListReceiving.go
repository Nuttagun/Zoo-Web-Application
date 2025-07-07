package entity

import (
	"gorm.io/gorm"
)

type ListReceiving struct {
	gorm.Model
	Quantity 	uint `valid:"required~Quantity is required,range(1|999999)~Quantity must be greater than 0"`

	ProductID   uint  `valid:"required~ProductID is required"`
	Product 	Product `gorm:"foreignKey:ProductID" valid:"-"`    //ใช้ tag valid:"-" เพื่อบอกว่าไม่ต้องตรวจสอบ struct ที่สัมพันธ์กัน

	OrderReceivingID 	uint `valid:"required~OrderReceivingID is required"`
	OrderReceiving		OrderReceiving  `gorm:"foreignKey:OrderReceivingID" valid:"-"`

}
