package entity

import (
	"gorm.io/gorm"
)

type ListProductSale struct {
	gorm.Model
	Price  	float64 `valid:"required~PriceListProductSale is required, range(1|100000000000)~PriceListProductSale must be at least 1"`
	Piece	uint  `valid:"required~PieceListProductSale is required, range(1|100000000000)~PieceListProductSale must be at least 1"`

	ProductID   uint   `valid:"required~ProductID is required"`
	Product  	Product `gorm:"foreignKey:ProductID" valid:"-"`  

	PaymentProductID   	uint   `valid:"required~PaymentProductID is required"`
	PaymentProduct  	PaymentProduct `gorm:"foreignKey:PaymentProductID" valid:"-"`  


}
