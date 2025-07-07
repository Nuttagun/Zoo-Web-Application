package controller

import (
	"encoding/base64"
	"fmt"
	"strings"

	// "github.com/asaskevich/govalidator"
	"github.com/asaskevich/govalidator"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"

	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	//"encoding/json"
	//"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	// "gorm.io/gorm"
)

// func GetAllProductStock(c *gin.Context) {
// 	db := config.DB()

// 	var products []entity.Product
// 	if err := db.Find(&products).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// ส่งข้อมูลทั้งหมดในรูปแบบ JSON โดยตรง
// 	c.JSON(http.StatusOK, products)
// }

func GetAllProductStock(c *gin.Context) {
	db := config.DB()

	// สร้างตัวแปรเก็บข้อมูลของ Product
	var products []entity.Product

	// ใช้ Preload เพื่อดึงข้อมูลที่เกี่ยวข้อง (เช่น ShelfZone)
	if err := db.Preload("ShelfZone").Find(&products).Error; err != nil {
		// ถ้ามีข้อผิดพลาดในการดึงข้อมูล
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ส่งข้อมูลทั้งหมดในรูปแบบ JSON
	c.JSON(http.StatusOK, products)
}


func GetAllBarcodeProduct(c *gin.Context) {
	db := config.DB()
	var barcodes []string
	if err := db.Model(&entity.Product{}).Pluck("Barcode", &barcodes).Error; err != nil {
		c.JSON(500, gin.H{ "error": "Failed to fetch barcodes",})
		return
	}
	c.JSON(200, gin.H{"barcode": barcodes,})
}

// func GetDataEmployeeByID(c *gin.Context) {
// 	userid := c.Param("id")
// 	db := config.DB()

// 	var employee entity.Employee
// 	if err := db.Where("user_id = ?", userid).First(&employee).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "EmployeeID not found"})
// 		return
// 	}
// 	// ส่งข้อมูลทั้งหมดในรูปแบบ JSON โดยตรง
// 	c.JSON(http.StatusOK, employee)
// }

func GetDataEmployeeByID(c *gin.Context) {
	userid := c.Param("id")
	db := config.DB()

	// Query Employee และ User ที่เกี่ยวข้อง
	var employee entity.Employee
	if err := db.Preload("User").Where("user_id = ?", userid).First(&employee).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EmployeeID not found"})
		return
	}

	// ตรวจสอบว่ามี Profile Path หรือไม่
	var profileBase64 string
	if employee.User != nil && employee.User.Profile != "" {
		profilePath := employee.User.Profile
		// อ่านไฟล์จาก path และแปลงเป็น Base64
		fileData, err := os.ReadFile(profilePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to read profile image"})
			return
		}
		profileBase64 = base64.StdEncoding.EncodeToString(fileData)
	}

	// สร้าง response ที่รวมข้อมูล Employee และรูปภาพ Base64
	response := gin.H{
		"employee":       employee.ID,
		"profile_base64": profileBase64,
	}

	// ส่ง response กลับไป
	c.JSON(http.StatusOK, response)
}


func DeleteProductByID(c *gin.Context) {
	// รับ Product ID จากพารามิเตอร์ URL
	productID := c.Param("id")

	// เชื่อมต่อกับฐานข้อมูล
	db := config.DB()

	// ลบสินค้าโดยใช้ ID
	if err := db.Delete(&entity.Product{}, productID).Error; err != nil {
		// กรณีลบไม่สำเร็จ
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	// ส่งคำตอบสำเร็จ
	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}




func SearchProductReceive(c *gin.Context) {
	barcodeProduct := c.Query("barcodeproduct")

	db := config.DB()

	var product entity.Product
	if err := db.Where("barcode = ?", barcodeProduct).First(&product).Error; err != nil {
		// หากไม่พบข้อมูล ให้ส่งสถานะ 404 Not Found
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// อ่านไฟล์ภาพจาก path ที่เก็บในฐานข้อมูล
	imagePath := product.Path
	imageFile, err := os.Open(imagePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open image"})
		return
	}
	defer imageFile.Close()

	// อ่านไฟล์ภาพและแปลงเป็น base64
	imageBytes, err := ioutil.ReadAll(imageFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read image"})
		return
	}

	encodedImage := "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(imageBytes)

	// รวมข้อมูล product และ imageBase64 ลงใน map เดียว
	response := map[string]interface{}{
		"ID":        product.ID,
		"CreatedAt": product.CreatedAt,
		"UpdatedAt": product.UpdatedAt,
		"DeletedAt": product.DeletedAt,
		"Name":      product.Name,
		"Price":     product.Price,
		"Piece":     product.Piece,
		"Barcode":   product.Barcode,
		"Path":      encodedImage, // เพิ่ม prefix ก่อน Base64
		"message": "Product found and retrieved successfully",
	}

	// ส่งข้อมูล JSON กลับไปที่ frontend
	c.JSON(http.StatusOK, response)
}

func AddReceiveProduct(c *gin.Context) { // ปิด aut7
    // ดึงค่า totalPrice จาก form ซึ่งจะเป็น string
    totalPriceStr := c.PostForm("totalPrice")
    employeeidStr := c.PostForm("employeeid")

    // แปลง totalPrice จาก string เป็น float64
    totalPrice, err := strconv.ParseFloat(totalPriceStr, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid totalPrice format"})
        return
    }

    employeeidInt, err := strconv.Atoi(employeeidStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employeeid format"})
        return
    }
    employeeid := uint(employeeidInt)

    db := config.DB()

    // เริ่ม Transaction
    tx := db.Begin()
    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
        return
    }

    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction rollback due to panic"})
        }
    }()

    // สร้าง orderReceiving ก่อน
    orderReceiving := entity.OrderReceiving{
        Receiving_date: time.Now(),
        Total_price:    totalPrice, // ใช้ totalPrice ที่แปลงเป็น float64 แล้ว
        EmployeeID:     employeeid,
    }

    // ตรวจสอบ struc ข้อมูลด้วย govalidator
    if _, err := govalidator.ValidateStruct(orderReceiving); err != nil {
        tx.Rollback() // ย้อนกลับ Transaction
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }


    // บันทึกข้อมูล OrderReceiving
    if err := tx.Create(&orderReceiving).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order receiving"})
        return
    }

    // วนลูปผ่านข้อมูลที่ส่งมา
    for i := 0; ; i++ {
        prefix := fmt.Sprintf("products[%d]", i)

        // ตรวจสอบว่ามีข้อมูลผลิตภัณฑ์หรือไม่
        productID := c.PostForm(prefix + "[ID]")
        if productID == "" {
            // หยุดลูปเมื่อไม่มีข้อมูล ID
            break
        }

        // ตรวจสอบว่า ProductID นี้มีอยู่ในฐานข้อมูลหรือไม่
        var existingProduct entity.Product
        result := tx.Where("id = ? AND deleted_at IS NULL", productID).First(&existingProduct)

        if result.Error != nil {
            // ถ้าไม่พบข้อมูลในฐานข้อมูล ให้สร้าง Product ใหม่
            barcode := c.PostForm(prefix + "[Barcode]")
            if barcode == "" {
                tx.Rollback()
                c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Product %d missing Barcode", i)})
                return
            }

            // เช็ค Barcode ซ้ำ
            var existingBarcode entity.Product
            if err := tx.Where("barcode = ? AND deleted_at IS NULL", barcode).First(&existingBarcode).Error; err == nil {
                tx.Rollback()
                c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Barcode %s already exists", barcode)})
                return
            }

            pathBase64 := c.PostForm(prefix + "[Path]")
            if pathBase64 == "" {
                tx.Rollback()
                c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Product %d missing Path", i)})
                return
            }

            base64StartIndex := strings.Index(pathBase64, ",")
            if base64StartIndex != -1 {
                pathBase64 = pathBase64[base64StartIndex+1:]
            }

            imageData, err := base64.StdEncoding.DecodeString(pathBase64)
            if err != nil {
                tx.Rollback()
                c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Product %d has invalid Path", i)})
                return
            }

            folderPath := "./Image/imageproduct/"
            if err := os.MkdirAll(folderPath, os.ModePerm); err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
                return
            }

            currentTime := time.Now().Format("02-01-2006-15-04-05-000")
            fileName := fmt.Sprintf("%s-%s.jpg", productID, currentTime)
            filePath := folderPath + fileName

            if err := os.WriteFile(filePath, imageData, 0644); err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save image for product %d", i)})
                return
            }

            quantityReceiveStr := c.PostForm(prefix + "[quantityReceive]")
            piece := uint(0)
            if quantityReceiveStr != "" {
                pieceInt, err := strconv.Atoi(quantityReceiveStr)
                if err != nil {
                    tx.Rollback()
                    c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid quantityReceive format for product %d", i)})
                    return
                }
                piece = uint(pieceInt)
            }

            newProduct := entity.Product{
                Barcode: barcode,
                Price:   1.0,
                Piece:   piece,
                Path:    filePath,
                Name:    c.PostForm(prefix + "[Name]"),
            }

            // ตรวจสอบ struc ข้อมูลด้วย govalidator
            if _, err := govalidator.ValidateStruct(newProduct); err != nil {
                tx.Rollback() // ย้อนกลับ Transaction
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
            }

            if err := tx.Create(&newProduct).Error; err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create new product"})
                return
            }

            listReceiving := entity.ListReceiving{
                Quantity:         piece,
                ProductID:        newProduct.ID,
                OrderReceivingID: orderReceiving.ID,
            }

            // ตรวจสอบ struc ข้อมูลด้วย govalidator
            if _, err := govalidator.ValidateStruct(listReceiving); err != nil {
                tx.Rollback() // ย้อนกลับ Transaction
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
            }

            if err := tx.Create(&listReceiving).Error; err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create list receiving"})
                return
            }
        } else {
            // อัปเดตจำนวนสินค้า
            quantityReceiveStr := c.PostForm(prefix + "[quantityReceive]")
            piece := uint(0)
            if quantityReceiveStr != "" {
                pieceInt, err := strconv.Atoi(quantityReceiveStr)
                if err != nil {
                    tx.Rollback()
                    c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid quantityReceive format for product %d", i)})
                    return
                }
                piece = uint(pieceInt)
            }

            existingProduct.Piece += piece
            if err := tx.Save(&existingProduct).Error; err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update product %d", i)})
                return
            }

            listReceiving := entity.ListReceiving{
                Quantity:         piece,
                ProductID:        existingProduct.ID,
                OrderReceivingID: orderReceiving.ID,
            }

            // ตรวจสอบ struc ข้อมูลด้วย govalidator
            if _, err := govalidator.ValidateStruct(listReceiving); err != nil {
                tx.Rollback() // ย้อนกลับ Transaction
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
            }

            if err := tx.Create(&listReceiving).Error; err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create list receiving"})
                return
            }
        }
    }

    // Commit Transaction
    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
        return
    }

    // ส่ง response กลับ
    c.JSON(http.StatusOK, gin.H{
        "message":    "Products added successfully",
        "totalPrice": totalPrice,
    })
}








func GetProductForOrganize(c *gin.Context) {
	db := config.DB()

	var products []entity.Product
	// ใช้ Preload เพื่อดึงข้อมูล ShelfZone ที่เกี่ยวข้องกับ Product
	if err := db.Preload("ShelfZone").Find(&products).Error; err != nil {
		// ตรวจสอบ error และส่งข้อความกลับ
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// ส่งข้อมูลทั้งหมดในรูปแบบ JSON โดยตรง
	c.JSON(http.StatusOK, products)
}


func SearchProductSale(c *gin.Context) {
	barcodeProduct := c.Query("barcodeproduct")

	db := config.DB()

	var product entity.Product
	if err := db.Where("barcode = ? AND quantity_shelf > 0", barcodeProduct).First(&product).Error; err != nil {
		// หากไม่พบข้อมูล ให้ส่งสถานะ 404 Not Found
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// อ่านไฟล์ภาพจาก path ที่เก็บในฐานข้อมูล
	imagePath := product.Path
	imageFile, err := os.Open(imagePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open image"})
		return
	}
	defer imageFile.Close()

	// อ่านไฟล์ภาพและแปลงเป็น base64
	imageBytes, err := ioutil.ReadAll(imageFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read image"})
		return
	}

	encodedImage := "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(imageBytes)

	// รวมข้อมูล product และ imageBase64 ลงใน map เดียว
	response := map[string]interface{}{
		"ID":            product.ID,
		"CreatedAt":     product.CreatedAt,
		"UpdatedAt":     product.UpdatedAt,
		"DeletedAt":     product.DeletedAt,
		"Name":          product.Name,
		"Price":         product.Price,
		"QuantityShelf": product.QuantityShelf,
		"Piece":         product.Piece,
		"Barcode":       product.Barcode,
		"Path":          encodedImage, // เพิ่ม prefix ก่อน Base64
	}

	// ส่งข้อมูล JSON กลับไปที่ frontend
	c.JSON(http.StatusOK, response)
}


func AddEditProduct(c *gin.Context) {
    var product entity.Product

    // รับค่าจาก FormData
    idProduct := c.PostForm("idproduct")
    nameProduct := c.PostForm("nameproduct")
    priceProduct := c.PostForm("priceproduct")
    // pieceProduct := c.PostForm("pieceproduct")
    // quantityShelfProduct := c.PostForm("quantityshelfproduct")
    barcodeProduct := c.PostForm("barcodeproduct")
    // shelfZone := c.PostForm("shelfzone")

    // รับไฟล์ภาพจาก FormData (ถ้ามี)
    file, header, _ := c.Request.FormFile("image")

    // ตรวจสอบว่า ID สินค้าเป็นค่าว่างหรือไม่
    if idProduct == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "idproduct is required"})
        return
    }

    // เริ่มทรานแซกชัน
    db := config.DB()
    tx := db.Begin()

    // ค้นหาสินค้าจากฐานข้อมูลตาม id ที่ส่งมา
    if err := tx.First(&product, "id = ?", idProduct).Error; err != nil {
        tx.Rollback() // ยกเลิกทรานแซกชันหากไม่พบสินค้า
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    // เก็บชื่อ path ของรูปภาพเดิม
    oldPath := product.Path

    // อัปเดตข้อมูลสินค้า
    product.Name = nameProduct
    if price, err := strconv.ParseFloat(priceProduct, 64); err == nil {
        product.Price = price
    }
    
	// if piece, err := strconv.Atoi(pieceProduct); err == nil {
    //     product.Piece = uint(piece)
    // }
    
	//ตรวจสอบการซ้ำกันของบาร์โค้ด  ถ้าเป็นบาร์โค้ดตัวเดิมก็ใช้ตัวเดิม  ถ้าบาร์โค้ดถูกเปลี่ยนแปลง  ก็ต้องตรวจสอบบาณ์โค้ดว่าซ้ำกับฐานข้อมูลไหม
	if product.Barcode != barcodeProduct {
		var existingProduct entity.Product
		if err := tx.First(&existingProduct, "barcode = ?", barcodeProduct).Error; err == nil {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "Barcode already exists"})
			return
		}
		// หากไม่ซ้ำ อัปเดต Barcode ใหม่
		product.Barcode = barcodeProduct
	}




    // ตรวจสอบค่าของ shelfZone
    // if shelfZone != "" {
    //     // ตรวจสอบและอัปเดตเฉพาะ QuantityShelf
    //     if quantityShelf, err := strconv.Atoi(quantityShelfProduct); err == nil {
    //         product.QuantityShelf = uint(quantityShelf)
    //     }
    // }

    // หากมีไฟล์ภาพอัปโหลด
    if file != nil {
        folderPath := "./Image/imageproduct/"

        // สร้างชื่อไฟล์ใหม่ในรูปแบบ edit-<id>-<timestamp>
        now := time.Now()
        timestamp := now.Format("2006-01-02-15-04-05-000")
        newFileName := fmt.Sprintf("edit-%s-%s%s", idProduct, timestamp, filepath.Ext(header.Filename))
        newFilePath := folderPath + newFileName

        // ลบภาพเก่า (ถ้ามี)
        if oldPath != "" {
            if err := os.Remove(oldPath); err != nil {
                fmt.Printf("Failed to delete old image: %v\n", err)
            }
        }

        // สร้างโฟลเดอร์สำหรับเก็บภาพใหม่ (หากยังไม่มี)
        if err := os.MkdirAll(folderPath, os.ModePerm); err != nil {
            tx.Rollback() // ยกเลิกทรานแซกชันหากเกิดข้อผิดพลาด
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
            return
        }

        // สร้างไฟล์ใหม่และบันทึกข้อมูลภาพ
        out, err := os.Create(newFilePath)
        if err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
            return
        }
        defer out.Close()

        if _, err := io.Copy(out, file); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
            return
        }

        // อัปเดต path ของภาพในข้อมูลสินค้า
        product.Path = newFilePath
    }

    // บันทึกข้อมูลสินค้าในฐานข้อมูล
    if err := tx.Save(&product).Error; err != nil {
        tx.Rollback() // ยกเลิกทรานแซกชันหากเกิดข้อผิดพลาด
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
        return
    }

    // ยืนยันทรานแซกชัน
    tx.Commit()
    c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully"})
}



func GetProductForDisposal(c *gin.Context) {
    var products []entity.Product
    db := config.DB()
    if err := db.Where("quantity_shelf >= ?", 1).Find(&products).Error; err != nil {
        c.JSON(500, gin.H{"error": "ไม่มีสินค้าในชั้นวาง"})
        return
    }
    c.JSON(200, gin.H{"products": products})
}


func AddDisposal(c *gin.Context) {
    db := config.DB() // เชื่อมต่อฐานข้อมูล

    // โครงสร้างสำหรับรับข้อมูล JSON
    var input struct {
        ProductID  uint   `json:"product_id"`
        Quantity   uint   `json:"quantity"`
        Reason     string `json:"reason"`
        EmployeeID uint   `json:"employee_id"`
    }

    // อ่านข้อมูล JSON
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": "Invalid input data"})
        return
    }

    // ตรวจสอบข้อมูลด้วยมือ
    if input.ProductID == 0 || input.Quantity == 0 || input.Reason == "" || input.EmployeeID == 0 {
        c.JSON(400, gin.H{"error": "All fields are required"})
        return
    }

    // เริ่ม Transaction
    tx := db.Begin()

    defer func() {
        if r := recover(); r != nil {
            tx.Rollback() // ยกเลิก Transaction หากมี Panic
        }
    }()

    var product entity.Product

    // ค้นหาสินค้า
    if err := tx.First(&product, input.ProductID).Error; err != nil {
        tx.Rollback()
        c.JSON(400, gin.H{"error": "Product not found"})
        return
    }

    // ตรวจสอบ QuantityShelf
    if product.QuantityShelf < input.Quantity {
        tx.Rollback()
        c.JSON(400, gin.H{"error": "Insufficient QuantityShelf"})
        return
    }

    // ลด QuantityShelf
    product.QuantityShelf -= input.Quantity
    if err := tx.Save(&product).Error; err != nil {
        tx.Rollback()
        c.JSON(500, gin.H{"error": "Failed to update product"})
        return
    }

    // บันทึกข้อมูลลงตาราง ProductDisposal
    productDisposal := entity.ProductDisposal{
        Disposaldate: time.Now(),
        Reason:       input.Reason,
        ProductID:    input.ProductID,
        EmployeeID:   input.EmployeeID,
        Quantity:     input.Quantity,
    }

    if err := tx.Create(&productDisposal).Error; err != nil {
        tx.Rollback()
        c.JSON(500, gin.H{"error": "Failed to record disposal"})
        return
    }

    // Commit Transaction
    if err := tx.Commit().Error; err != nil {
        c.JSON(500, gin.H{"error": "Failed to commit transaction"})
        return
    }

    // ส่งผลลัพธ์สำเร็จ
    c.JSON(200, gin.H{"message": "Product disposal recorded successfully"})
}

