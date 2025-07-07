package controller

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"gorm.io/gorm"
)

func AddSaleProduct(c *gin.Context) {
	db := config.DB()

	// รับข้อมูลจาก body
	var input struct {
		ProductSaleList []struct {
			ID           uint    `json:"ID"`
			Name         string  `json:"Name"`
			Price        float64 `json:"Price"`
			QuantitySale uint    `json:"quantitySale"`
		} `json:"ProductSaleList"`
		EmployeeID  uint    `json:"employeeId"`
		TotalPrice  float64 `json:"totalPrice"`
		TypePayment string  `json:"typepayment"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{
			"error": gin.H{
				"stage":   "Input Validation",
				"message": "Invalid input data. Please check your request.",
			},
		})
		return
	}
	
	// กำหนด TypePaymentProductID ตาม TypePayment
	var typePaymentProductID uint
	if input.TypePayment == "QRCode Payment" {
		typePaymentProductID = 1
	} else if input.TypePayment == "Cash Payment" {
		typePaymentProductID = 2
	} else {
		c.JSON(400, gin.H{
			"error": gin.H{
				"stage":   "Input Validation",
				"message": "Invalid type of payment provided.",
			},
		})
		return
	}


	// เริ่มต้น Transaction
	err := db.Transaction(func(tx *gorm.DB) error {
		// สร้าง PaymentProduct
		payment := entity.PaymentProduct{
			Date:        time.Now(),
			TotalAmount: float32(input.TotalPrice),
			TypePaymentProductID: typePaymentProductID,
			EmployeeID:  input.EmployeeID,
		}

		if err := tx.Create(&payment).Error; err != nil {
			return fmt.Errorf("Failed to create payment record.")
		}

		// เก็บ ID ของ PaymentProduct
		paymentProductID := payment.ID

		// Loop เพื่อเพิ่มรายการ ProductSaleList
		for _, product := range input.ProductSaleList {
			// ตรวจสอบว่า Product มีอยู่หรือไม่
			var dbProduct entity.Product
			if err := tx.First(&dbProduct, product.ID).Error; err != nil {
				return fmt.Errorf("Product with ID %d not found.", product.ID)
			}

			// ตรวจสอบว่า Piece เพียงพอหรือไม่
			// ตรวจสอบว่า Piece เพียงพอหรือไม่
			if dbProduct.QuantityShelf < product.QuantitySale { //ถ้าจำนวนสินค้าที่มีอยู่  น้อยกว่าจำนวนที่จะซื้อ จะเกิด Error
				return fmt.Errorf("Insufficient stock for Product ID %d. Available: %d, Requested: %d", product.ID, dbProduct.QuantityShelf, product.QuantitySale)
			}

			// ลด stock ใน Product
			dbProduct.QuantityShelf -= product.QuantitySale
			if err := tx.Save(&dbProduct).Error; err != nil {
				return fmt.Errorf("Failed to update stock for Product ID %d.", product.ID)
			}

			// เพิ่มข้อมูลใน ListProductSale
			listProductSale := entity.ListProductSale{
				Price:            product.Price,
				Piece:            uint(product.QuantitySale),
				ProductID:        product.ID,
				PaymentProductID: paymentProductID,
			}

			if err := tx.Create(&listProductSale).Error; err != nil {
				return fmt.Errorf("Failed to add sale record for Product ID %d.", product.ID)
			}
		}

		// ทุกขั้นตอนสำเร็จ
		return nil
	})

	// ตรวจสอบว่า Transaction สำเร็จหรือไม่
	if err != nil {
		c.JSON(500, gin.H{
			"error": gin.H{
				"stage":   "Transaction",
				"message": err.Error(),
			},
		})
		return
	}

	// สำเร็จ
	c.JSON(200, gin.H{"message": "Transaction completed successfully"})
}
//close aut102