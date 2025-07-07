package entity

import (
	"gorm.io/gorm"
	"time"
)

type PaymentProduct struct {
    gorm.Model
    Date        time.Time `valid:"required~Date is required"`
    // TypePayment string    `valid:"required~TypePayment is required, in(QRCode Payment|Cash Payment)~TypePayment must be either QRCode Payment or Cash Payment"`
    TotalAmount float32   `valid:"required~TotalAmount is required, range(1|100000000000)~TotalAmount must be at least 1"` // เปลี่ยนเป็น float64

    TypePaymentProductID  uint   `valid:"required~TypePaymentProductID is required"`          
	TypePaymentProduct    TypePaymentProduct `gorm:"foreignKey:TypePaymentProductID" valid:"-"`

    EmployeeID   uint     `valid:"required~EmployeeID is required"`
    Employee     Employee `gorm:"foreignKey:EmployeeID" valid:"-"`

    ListProductSale []ListProductSale `gorm:"foreignKey:PaymentProductID"`
}
//close aut101