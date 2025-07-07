package entity

import (
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	Name  string `valid:"required~Name is required"`
	Path  string `valid:"required~Path is required"`
	Price  float64 `valid:"required~Price is required, range(1|100000000000)~PriceProduct must be at least 1"`
					// customPriceValidator ชื่อต้องตรงกับฟังก์ชั้นที่ตั้งไว้
	Piece	uint `valid:"required~Piece is required, range(1|100000000000)~Piece must be at least 1"`									
	QuantityShelf uint   //ไม่มีก็ได้ คือบางครั้งสินค้าใน Shelf หมด
	Barcode string `gorm:"unique" valid:"required~Barcode is required, matches(^[a-zA-Z0-9]{13}$)~Barcode must be 13 alphanumeric characters"`

	ShelfZoneID  *uint           // ทำให้สามารถเป็น NULL ได้
	ShelfZone  ShelfZone `gorm:"foreignKey:ShelfZoneID" valid:"-"`

	ListReceiving []ListReceiving `gorm:"foreignKey:ProductID"`   //ส่ง ProductID ไปเป็นฟอเรนคีย์ที่ตาราง ListProductSale

	ListProductSale []ListProductSale `gorm:"foreignKey:ProductID"`

	ProductDisposal []ProductDisposal `gorm:"foreignKey:ProductID"`

}//ปิด task //