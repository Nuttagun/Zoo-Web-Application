package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"gorm.io/gorm"
)

// AddShelfZoneData ฟังก์ชันสำหรับเพิ่มหรืออัพเดตข้อมูล Shelf Zone
func AddShelfZoneData(c *gin.Context) {
	// กำหนดโครงสร้างข้อมูลชั่วคราวสำหรับรับข้อมูลจาก request
	type TemporaryShelfZone struct {
		ID        string `json:"id"` // ใช้ string สำหรับ id
		ShelfName string `json:"shelfname"`
		Color     string `json:"color"`
		Height    int    `json:"height"`
		Width     int    `json:"width"`
		PositionX int    `json:"positionx"`
		PositionY int    `json:"positiony"`
	}

	var shelves []TemporaryShelfZone

	// รับข้อมูลจาก request JSON
	if err := c.ShouldBindJSON(&shelves); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// เริ่ม transaction
	tx := db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// วนลูปเพื่อประมวลผลข้อมูลที่รับเข้ามา
	for _, tempShelf := range shelves {
		var existingShelf entity.ShelfZone

		// ตรวจสอบการมีอยู่ของข้อมูลด้วย id
		err := tx.Where("id = ?", tempShelf.ID).First(&existingShelf).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// ตรวจสอบว่าชื่อชั้นวางซ้ำหรือไม่
				var existingShelf entity.ShelfZone
				if err := tx.Where("shelf_name = ?", tempShelf.ShelfName).First(&existingShelf).Error; err == nil {
					tx.Rollback()
					c.JSON(http.StatusBadRequest, gin.H{"error": "Shelf name already exists"})
					return
				}

				// สร้างข้อมูลใหม่หากไม่มีชื่อซ้ำ
				shelf := entity.ShelfZone{
					ShelfName: tempShelf.ShelfName,
					Color:     tempShelf.Color,
					Height:    int32(tempShelf.Height),
					Width:     int32(tempShelf.Width),
					Positionx: int32(tempShelf.PositionX),
					Positiony: int32(tempShelf.PositionY),
				}

				 // ตรวจสอบ struc ข้อมูลด้วย govalidator
				 if _, err := govalidator.ValidateStruct(shelf); err != nil {
					tx.Rollback() // ย้อนกลับ Transaction
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}

				if err := tx.Create(&shelf).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create shelf zone"})
					return
				}
			} else {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query failed"})
				return
			}
		} else {
			// ตรวจสอบว่าชื่อที่ส่งมาใหม่กับชื่อเดิมตรงกันหรือไม่
			if existingShelf.ShelfName == tempShelf.ShelfName {
				// ถ้าชื่อไม่เปลี่ยนแปลง ให้ทำการอัพเดตข้อมูล
				updates := map[string]interface{}{
					"shelf_name": tempShelf.ShelfName,
					"color":      tempShelf.Color,
					"height":     int32(tempShelf.Height),
					"width":      int32(tempShelf.Width),
					"positionx":  int32(tempShelf.PositionX),
					"positiony":  int32(tempShelf.PositionY),
				}

				if err := tx.Model(&existingShelf).Updates(updates).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update shelf zone"})
					return
				}
			} else {
				// ถ้าชื่อเปลี่ยนแปลง ให้ตรวจสอบว่าในฐานข้อมูลมีชื่อใหม่นี้อยู่แล้วหรือไม่
				var nameExists entity.ShelfZone
				nameCheckErr := tx.Where("shelf_name = ?", tempShelf.ShelfName).First(&nameExists).Error

				if nameCheckErr == nil {
					// ถ้าชื่อซ้ำในฐานข้อมูล แจ้งข้อผิดพลาด
					tx.Rollback()
					c.JSON(http.StatusBadRequest, gin.H{"error": "Shelf name already exists"})
					return
				}

				// ถ้าชื่อไม่ซ้ำในฐานข้อมูล ให้ทำการอัพเดตข้อมูล
				updates := map[string]interface{}{
					"shelf_name": tempShelf.ShelfName,
					"color":      tempShelf.Color,
					"height":     int32(tempShelf.Height),
					"width":      int32(tempShelf.Width),
					"positionx":  int32(tempShelf.PositionX),
					"positiony":  int32(tempShelf.PositionY),
				}

				if err := tx.Model(&existingShelf).Updates(updates).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update shelf zone"})
					return
				}
			}
		}
	}

	// Commit transaction หากทุกอย่างเสร็จสมบูรณ์
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Shelf zone data processed successfully"})
}

func GetAllDataShelf(c *gin.Context) {
	db := config.DB()

	var shelfZones []entity.ShelfZone

	// ดึงข้อมูลทั้งหมดจากตาราง ShelfZone
	if err := db.Find(&shelfZones).Error; err != nil {
		// หากเกิดข้อผิดพลาดในการดึงข้อมูล ให้ส่งข้อความ error กลับ
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลทั้งหมดที่ดึงมาในรูปแบบ JSON
	c.JSON(http.StatusOK, shelfZones)
}

// ไม่แปลง ShelfID: ใช้ค่า ShelfID ตรงๆ โดยไม่ต้องแปลงเป็นเลข
// ตรวจสอบ ProductID มี ShelfID ตรงกับที่ส่งมาหรือไม่:
// ถ้าไม่มี ShelfID ให้ทำการอัปเดตเป็น ShelfID ที่ส่งมา
// ถ้ามี แต่ ShelfID ไม่ตรง ให้แจ้ง Error
// ถ้า ShelfID ตรง ไม่ต้องอัปเดต ShelfID
//

func AddProductToShelfZone(c *gin.Context) {
	// รับข้อมูลจาก JSON
	var requestData struct {
		ProductID     uint    `json:"productID"`
		ShelfID       uint    `json:"shelfid"`
		PriceProduct  float64 `json:"priceproduct"`
		QuantityShelf uint    `json:"quantityShelf"`
	}

	if err := c.ShouldBindJSON(&requestData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format", "details": err.Error()})
		return
	}

	// เริ่มต้น Transaction
	db := config.DB()
	tx := db.Begin()

	// ค้นหา Product จาก ProductID
	var product entity.Product
	if err := tx.Where("id = ?", requestData.ProductID).First(&product).Error; err != nil {
		tx.Rollback() // ทำการ rollback หากเกิดข้อผิดพลาด
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found", "details": "No product found with the given ID"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product", "details": err.Error()})
		}
		return
	}

	// ตรวจสอบ ShelfID
	if product.ShelfZoneID != nil {
		if *product.ShelfZoneID != requestData.ShelfID {
			tx.Rollback() // Rollback ถ้า ShelfID ไม่ตรง
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "ShelfID mismatch",
				"details": "The ShelfID does not match the existing ShelfID for this product",
			})
			return
		}
		// ShelfID ตรงกัน ไม่ต้องอัปเดต
	} else {
		// ไม่มี ShelfID อัปเดตเป็น ShelfID ที่ส่งมา
		product.ShelfZoneID = new(uint)
		*product.ShelfZoneID = requestData.ShelfID
	}

	// ตรวจสอบว่า QuantityShelf ต้องไม่เกินจำนวน Piece ของ Product
	if requestData.QuantityShelf > product.Piece {
		tx.Rollback() // Rollback หากไม่ผ่านการตรวจสอบ
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Quantity exceeds available pieces",
			"details": "QuantityShelf cannot be greater than Piece",
		})
		return
	}

	// ทำการตัดยอดจำนวน Piece ของ Product
	product.Piece -= requestData.QuantityShelf

	// อัปเดตราคาสินค้าและจำนวนสินค้าใน Shelf
	product.Price = requestData.PriceProduct
	product.QuantityShelf += requestData.QuantityShelf

	// บันทึกข้อมูล
	if err := tx.Save(&product).Error; err != nil {
		tx.Rollback() // Rollback หากเกิดข้อผิดพลาด
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update product",
			"details": err.Error(),
		})
		return
	}

	// Commit Transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to commit transaction",
			"details": err.Error(),
		})
		return
	}

	// ส่งข้อมูลกลับ
	c.JSON(http.StatusOK, gin.H{
		"message": "Product updated successfully",
		"product": product,
	})
}

func MoveProductShelfZone(c *gin.Context) {
	// รับค่าจาก request body
	var input struct {
		ShelfID   uint `json:"shelfid"`
		ProductID uint `json:"productID"`
	}

	// bind ข้อมูลจาก request
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
		return
	}

	db := config.DB()

	// หาข้อมูล ShelfZone จาก ShelfID
	var shelfZone entity.ShelfZone
	if err := db.First(&shelfZone, input.ShelfID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ShelfZone not found"})
		return
	}

	// อัปเดต Product ด้วย ShelfZoneID ที่หาได้จาก ShelfID
	if err := db.Model(&entity.Product{}).Where("id = ?", input.ProductID).
		Update("ShelfZoneID", shelfZone.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	// ส่งผลลัพธ์กลับ
	c.JSON(http.StatusOK, gin.H{"message": "Product shelf zone updated successfully"})
}

// Temporary structure for receiving data from the client
type TempShelfZone struct {
	ID        string `json:"id"` // Accepting ID as a string from the client
	ShelfName string `json:"shelfname"`
	Color     string `json:"color"`
	Height    int32  `json:"height"`
	Width     int32  `json:"width"`
	Positionx int32  `json:"positionx"`
	Positiony int32  `json:"positiony"`
}

func DeleteUpdateShelf(c *gin.Context) {
	var inputShelves []TempShelfZone
	if err := c.ShouldBindJSON(&inputShelves); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
		return
	}

	tx := config.DB().Begin()

	// ดึง Shelf ทั้งหมดที่มีอยู่ในฐานข้อมูล
	var existingShelves []entity.ShelfZone
	if err := tx.Find(&existingShelves).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve shelves"})
		return
	}

	inputIDs := make(map[string]bool) // เก็บ ID ทั้งหมดที่ส่งมา
	newShelves := []TempShelfZone{}   // เก็บข้อมูลใหม่ที่ยังไม่มีในฐานข้อมูล

	for _, shelf := range inputShelves {
		if shelf.ShelfName == "" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Shelf name cannot be empty"})
			return
		}

		if _, err := strconv.ParseUint(shelf.ID, 10, 64); err != nil {
			newShelves = append(newShelves, shelf) // เป็นข้อมูลใหม่ เอาเก็บใน newShelves  //แปลง shelf.ID เลขไม่ได้แสดงว่าเป็น ข้อมูลใหม่  id "2025-01-01-14-32-43-160"
		} else {
			inputIDs[shelf.ID] = true // ID ที่มีอยู่ในฐานข้อมูล  เป็นข้อมูลเก่า เก็บใน inputIDs
		}
	}

	// ลบ Shelf ที่ไม่ได้อยู่ใน input IDs
	for _, shelf := range existingShelves {
		if !inputIDs[fmt.Sprint(shelf.ID)] {
			// ย้ายจำนวน QuantityShelf ไปเป็น Piece
			if err := tx.Model(&entity.Product{}).
				Where("shelf_zone_id = ?", shelf.ID).
				Updates(map[string]interface{}{
					"piece":          gorm.Expr("piece + quantity_shelf"),
					"quantity_shelf": 0,
					"shelf_zone_id":  nil,
				}).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update products for deleted shelf"})
				return
			}

			// ลบ Shelf
			if err := tx.Delete(&shelf).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete shelf"})
				return
			}
		}
	}

	// อัปเดตข้อมูลเก่า
	for _, shelf := range inputShelves {
		if idUint, err := strconv.ParseUint(shelf.ID, 10, 64); err == nil {
			var existingShelf entity.ShelfZone
			if err := tx.First(&existingShelf, uint(idUint)).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query existing shelf"})
				return
			}

			// ตรวจสอบชื่อ Shelf ซ้ำ
			if existingShelf.ShelfName != shelf.ShelfName {
				var duplicate entity.ShelfZone
				if err := tx.Where("shelf_name = ?", shelf.ShelfName).
					First(&duplicate).Error; err == nil {
					tx.Rollback()
					c.JSON(http.StatusConflict, gin.H{"error": "Old Duplicate shelf name: " + shelf.ShelfName})
					return
				}
			}

			// อัปเดต Shelf
			if err := tx.Model(&existingShelf).Updates(entity.ShelfZone{
				ShelfName: shelf.ShelfName,
				Color:     shelf.Color,
				Height:    shelf.Height,
				Width:     shelf.Width,
				Positionx: shelf.Positionx,
				Positiony: shelf.Positiony,
			}).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update shelf"})
				return
			}
		}
	}

	// สร้างข้อมูลใหม่
	for _, shelf := range newShelves {
		if shelf.ShelfName == "" {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Shelf name cannot be empty"})
			return
		}

		var duplicate entity.ShelfZone
		if err := tx.Where("shelf_name = ?", shelf.ShelfName).
			First(&duplicate).Error; err == nil {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "New Duplicate shelf name: " + shelf.ShelfName})
			return
		}

		newShelf := entity.ShelfZone{
			ShelfName: shelf.ShelfName,
			Color:     shelf.Color,
			Height:    shelf.Height,
			Width:     shelf.Width,
			Positionx: shelf.Positionx,
			Positiony: shelf.Positiony,
		}

		if err := tx.Create(&newShelf).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create shelf"})
			return
		}
	}

	// Commit Transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Shelves updated successfully"})
}
