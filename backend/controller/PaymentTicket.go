package controller

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"gorm.io/gorm"
)


func GetDataPromotionCanUse(c *gin.Context) {
    db := config.DB()

    var request struct {
        BookingDate   time.Time `json:"bookingdate"`
        VisitDate     time.Time `json:"visitdate"`
        QuantityChild uint      `json:"quantitychild"`
        QuantityAdult uint      `json:"quantityadult"`
        QuantityOther uint      `json:"quantityother"`
    }

    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
        return
    }

    // แปลง VisitDate ของ request ให้อยู่ใน TimeZone +07:00
    location, err := time.LoadLocation("Asia/Bangkok")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถโหลด TimeZone ได้"})
        return
    }
    request.VisitDate = request.VisitDate.In(location)

    var promotions []entity.Promotion
    var validPromotions []map[string]interface{}

    if err := db.Preload("Condition").Find(&promotions).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลโปรโมชันได้"})
        return
    }

    for _, promo := range promotions {
        if request.BookingDate.Before(promo.StartDate) || request.BookingDate.After(promo.EndDate) || promo.NumberPromotionUse <= 0 {
            continue
        }

        isValid := false
        if promo.VisitDate == nil && promo.EndVisitDate == nil && promo.ConditionID == nil && *promo.PromotionStatusID == 1 {
            isValid = true
        }

        if promo.VisitDate != nil && promo.EndVisitDate != nil && promo.ConditionID == nil && *promo.PromotionStatusID == 1 {
            // เปรียบเทียบ VisitDate ที่อยู่ใน TimeZone เดียวกัน
            if (request.VisitDate.Equal(*promo.VisitDate) || !request.VisitDate.Before(*promo.VisitDate)) &&
               (request.VisitDate.Equal(*promo.EndVisitDate) || !request.VisitDate.After(*promo.EndVisitDate)) {
                isValid = true
            }
        }

        if promo.VisitDate == nil && promo.EndVisitDate == nil && promo.ConditionID != nil && *promo.PromotionStatusID == 1 {
            if (promo.Condition.MinChild <= request.QuantityChild) &&
                (promo.Condition.MaxChild == nil || request.QuantityChild <= *promo.Condition.MaxChild) &&
                (promo.Condition.MinAdult <= request.QuantityAdult) &&
                (promo.Condition.MaxAdult == nil || request.QuantityAdult <= *promo.Condition.MaxAdult) &&
                (promo.Condition.MinOther <= request.QuantityOther) &&
                (promo.Condition.MaxOther == nil || request.QuantityOther <= *promo.Condition.MaxOther) {
                isValid = true
            }
        }

        if isValid {
            validPromotions = append(validPromotions, map[string]interface{}{
                "ID":                 promo.ID,
                "PromotionName":      promo.PromotionName,
                "StartDate":          promo.StartDate,
                "EndDate":            promo.EndDate,
                "Discount":           promo.Discount,
                "Description":        promo.Description,
                "NumberPromotionUse": promo.NumberPromotionUse,
                "VisitDate":          promo.VisitDate,
                "EndVisitDate":       promo.EndVisitDate,
                "PromotionStatusID":  promo.PromotionStatusID,
            })
        }
    }

    c.JSON(http.StatusOK, gin.H{"promotions": validPromotions})
}









func GetBookingDataByID(c *gin.Context) {
	// ดึง database connection
	db := config.DB()

	// รับ ID จากพารามิเตอร์
	idParam := c.Param("id")
	bookingID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	var totalAllPrice float64
	var bookingDate time.Time

	// ตัวแปรสำหรับเก็บจำนวนของแต่ละ Generation
	var quantityChild, quantityAdult, quantityOther uint
	var ticketBooked entity.TicketBooked

	// ตัวแปรสำหรับเก็บชื่อผู้ใช้
	var userFirstName string
	var userLastName string

	// ใช้ Transaction สำหรับการดำเนินการ
	if err := db.Transaction(func(tx *gorm.DB) error {
		// ขั้นตอนที่ 1: หา Booking พร้อมข้อมูล User
		var booking entity.Booking
		if err := tx.Preload("User"). // Preload User
			Where("id = ?", uint(bookingID)).First(&booking).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// ถ้าไม่พบ Booking
				c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
				return err // จะหยุดการทำงานของ Transaction
			}
			// ถ้าพบข้อผิดพลาดอื่นๆ
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error when finding Booking"})
			return err
		}

		// ดึงค่าชื่อผู้ใช้จาก Booking.User
		userFirstName = booking.User.FirstName
		userLastName = booking.User.LastName

		// ดึงค่า total_all_price จาก Booking
		totalAllPrice = booking.AllPrice

		bookingDate = booking.BookingDate

		// ขั้นตอนที่ 2: หา TicketBooked ID ที่เกี่ยวข้อง
		if err := tx.Where("booking_id = ?", booking.ID).First(&ticketBooked).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// ถ้าไม่พบ TicketBooked
				c.JSON(http.StatusNotFound, gin.H{"error": "TicketBooked not found"})
				return err
			}
			// ถ้าพบข้อผิดพลาดอื่นๆ
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error when finding TicketBooked"})
			return err
		}

		// ขั้นตอนที่ 3: หา BookingZoo ทั้งหมดที่เกี่ยวข้องกับ TicketBooked ID
		var bookingZoos []entity.BookingZoo
		if err := tx.Where("ticket_booked_id = ?", ticketBooked.ID).Find(&bookingZoos).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error when finding BookingZoos"})
			return err
		}
		if len(bookingZoos) == 0 {
			// ถ้าไม่พบ BookingZoo
			c.JSON(http.StatusNotFound, gin.H{"error": "No BookingZoos found for this TicketBooked"})
			return nil
		}

		// ขั้นตอนที่ 4: หา Ticket และ Generation และคำนวณจำนวนตามประเภท
		for _, bookingZoo := range bookingZoos {
			var ticket entity.Ticket
			if err := tx.Preload("Generation").Where("id = ?", bookingZoo.TicketID).First(&ticket).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					// ถ้าไม่พบ Ticket
					c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
					return err
				}
				// ถ้าพบข้อผิดพลาดอื่นๆ
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error when finding Ticket"})
				return err
			}

			// เพิ่มข้อมูล Quantity ตามประเภทที่ระบุใน Ticket
			switch ticket.Generation.Generation {
			case "Child":
				quantityChild += bookingZoo.Quantity
			case "Adult":
				quantityAdult += bookingZoo.Quantity
			case "Other":
				quantityOther += bookingZoo.Quantity
			}
		}

		return nil
	}); err != nil {
		// Error Handling ในกรณีที่เกิดข้อผิดพลาด
		return
	}

	// ส่งข้อมูล JSON Response
	c.JSON(http.StatusOK, gin.H{
		"BookingDate":      bookingDate,
		"visitdate":        ticketBooked.VisitDate,  // เพิ่ม VisitDate ที่นี่
		"QuantityChild":    quantityChild,
		"GenerationChild":  "Child",
		"QuantityAdult":    quantityAdult,
		"GenerationAdult":  "Adult",
		"QuantityOther":    quantityOther,
		"GenerationOther":  "Other",
		// "totalQuantity":    quantityChild + quantityAdult + quantityOther,
		"quantity_customer": ticketBooked.QuantityCustomer,
		"total_all_price":  totalAllPrice,
		"UserFirstName":    userFirstName,
		"UserLastName":     userLastName,
	})
}


// func GetDataVehicleByBookingID(c *gin.Context) {
// 	db := config.DB()
// 	bookingID := c.Param("id")

// 	// ดึงข้อมูล TicketBooked ที่เกี่ยวข้องกับ BookingID
// 	var ticketBookeds []entity.TicketBooked
// 	if err := db.Where("booking_id = ?", bookingID).Find(&ticketBookeds).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "TicketBooked not found"})
// 		return
// 	}

// 	// ตรวจสอบว่ามี TicketBooked หรือไม่
// 	if len(ticketBookeds) == 0 {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "No TicketBooked records found"})
// 		return
// 	}

// 	// เก็บ RentID จาก TicketBooked
// 	var rents []entity.Rent
// 	for _, ticketBooked := range ticketBookeds {
// 		var rentList []entity.Rent
// 		if err := db.Where("ticket_booked_id = ?", ticketBooked.ID).Find(&rentList).Error; err == nil {
// 			rents = append(rents, rentList...)
// 		}
// 	}

// 	// ตรวจสอบว่ามี Rent หรือไม่
// 	if len(rents) == 0 {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Rents not found"})
// 		return
// 	}

// 	// เตรียมข้อมูล VehicleRent
// 	var vehicleRents []entity.VehicleRent
// 	for _, rent := range rents {
// 		var vrList []entity.VehicleRent
// 		if err := db.Where("rent_id = ?", rent.ID).Find(&vrList).Error; err == nil {
// 			vehicleRents = append(vehicleRents, vrList...)
// 		}
// 	}

// 	// ตรวจสอบว่ามี VehicleRent หรือไม่
// 	if len(vehicleRents) == 0 {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "VehicleRent not found"})
// 		return
// 	}

// 	// เตรียมข้อมูล Vehicle
// 	var vehicles []gin.H
// 	for _, vehicleRent := range vehicleRents {
// 		var vehicle entity.Vehicle
// 		if err := db.Where("id = ?", vehicleRent.VehicleID).First(&vehicle).Error; err == nil {
// 			// อ่านไฟล์ภาพและแปลงเป็น Base64
// 			base64Picture := ""
// 			if vehicle.Picture != "" {
// 				imageBytes, err := os.ReadFile(vehicle.Picture)
// 				if err == nil {
// 					base64Picture = base64.StdEncoding.EncodeToString(imageBytes)
// 				}
// 			}

// 			vehicles = append(vehicles, gin.H{
// 				"name":     vehicle.Name,
// 				"picture":  base64Picture,
// 				"quantity": vehicleRent.Quantity,
// 				"price":    vehicle.Price,
// 			})
// 		}
// 	}

// 	// ส่ง JSON กลับไป
// 	c.JSON(http.StatusOK, gin.H{
// 		"vehicles": vehicles,
// 	})
// }


func GetDataVehicleByBookingID(c *gin.Context) {
	db := config.DB()
	bookingID := c.Param("id")

	// ดึงข้อมูล TicketBooked ที่เกี่ยวข้องกับ BookingID และเลือกตัวล่าสุด
	var latestTicketBooked entity.TicketBooked
	if err := db.Where("booking_id = ?", bookingID).Order("created_at DESC").First(&latestTicketBooked).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Latest TicketBooked not found"})
		return
	}

	// เก็บ RentID จาก TicketBooked ล่าสุด
	var rents []entity.Rent
	if err := db.Where("ticket_booked_id = ?", latestTicketBooked.ID).Find(&rents).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rents not found"})
		return
	}

	// เตรียมข้อมูล VehicleRent
	var vehicleRents []entity.VehicleRent
	for _, rent := range rents {
		var vrList []entity.VehicleRent
		if err := db.Where("rent_id = ?", rent.ID).Find(&vrList).Error; err == nil {
			vehicleRents = append(vehicleRents, vrList...)
		}
	}

	// ตรวจสอบว่ามี VehicleRent หรือไม่
	if len(vehicleRents) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "VehicleRent not found"})
		return
	}

	// เตรียมข้อมูล Vehicle
	var vehicles []gin.H
	for _, vehicleRent := range vehicleRents {
		var vehicle entity.Vehicle
		if err := db.Where("id = ?", vehicleRent.VehicleID).First(&vehicle).Error; err == nil {
			// อ่านไฟล์ภาพและแปลงเป็น Base64
			base64Picture := ""
			if vehicle.Picture != "" {
				imageBytes, err := os.ReadFile(vehicle.Picture)
				if err == nil {
					base64Picture = base64.StdEncoding.EncodeToString(imageBytes)
				}
			}

			vehicles = append(vehicles, gin.H{
				"name":     vehicle.Name,
				"picture":  base64Picture,
				"quantity": vehicleRent.Quantity,
				"price":    vehicle.Price,
			})
		}
	}

	// ส่ง JSON กลับไป
	c.JSON(http.StatusOK, gin.H{
		"vehicles": vehicles,
	})
}






func AddPaymentTicket(c *gin.Context) {
	// อ่านค่าที่ส่งมา
	bookingIDStr := c.PostForm("BookingID")
	amountStr := c.PostForm("amount")
	promotionIDStr := c.PostForm("PromotionID")
	fileBase64 := c.PostForm("[file]")

	// ตรวจสอบค่าว่าง
	if bookingIDStr == "" || amountStr == "" || fileBase64 == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	// แปลงค่าจาก string เป็นชนิดข้อมูลที่ต้องการ
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid BookingID"})
		return
	}

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	var promotionID *uint
	if promotionIDStr != "" {
		promotionIDUint, err := strconv.ParseUint(promotionIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid PromotionID"})
			return
		}
		promotionIDVal := uint(promotionIDUint)
		promotionID = &promotionIDVal
	}

	// ตัด prefix ออก (ถ้ามี)
	base64StartIndex := strings.Index(fileBase64, ",")
	if base64StartIndex != -1 {
		fileBase64 = fileBase64[base64StartIndex+1:]
	}

	// แปลง Base64 เป็นข้อมูลไบต์
	imageData, err := base64.StdEncoding.DecodeString(fileBase64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Base64 image data"})
		return
	}

	// สร้างโฟลเดอร์สำหรับเก็บภาพ
	folderPath := "./Image/ImageSlipTicket/"
	if err := os.MkdirAll(folderPath, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
		return
	}

	// ตั้งชื่อไฟล์
	currentTime := time.Now().Format("20060102-150405")
	fileName := fmt.Sprintf("slip_%d_%s.jpg", bookingID, currentTime)
	filePath := filepath.Join(folderPath, fileName)

	// บันทึกไฟล์
	if err := os.WriteFile(filePath, imageData, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}

	// เริ่มต้นทรานแซกชัน
	db := config.DB()
	tx := db.Begin()

	// ลดค่า NumberPromotionUse ในตาราง Promotion (ถ้ามี PromotionID)
	if promotionID != nil {
		var promotion entity.Promotion
		if err := tx.Where("id = ?", promotionID).First(&promotion).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Promotion not found"})
			return
		}

		// ตรวจสอบว่า NumberPromotionUse > 0 หรือไม่
		if promotion.NumberPromotionUse > 0 {
			promotion.NumberPromotionUse -= 1
			if err := tx.Save(&promotion).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update promotion usage"})
				return
			}
		} else {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "No promotion usage left"})
			return
		}
	}

	// บันทึกข้อมูล PaymentTicket
	payment := entity.PaymentTicket{
		Amount:        amount,
		PaymentDate:   time.Now(),
		Path:          filePath,
		PaymentStatus: /*"No"*/ false,
		BookingID:     uint(bookingID),
		PromotionID:   promotionID,
	}

	if err := tx.Create(&payment).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save payment ticket"})
		return
	}

	// คอมมิททรานแซกชัน
	tx.Commit()

	// ส่งผลลัพธ์กลับไป
	c.JSON(http.StatusOK, gin.H{
		"message": "Payment ticket added successfully",
		"data":    payment,
	})
}

func GetPayments(c *gin.Context) {
	var payments []entity.PaymentTicket
	db := config.DB()
	if err := db.Find(&payments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching payments"})
		return
	}
	c.JSON(http.StatusOK, payments)
}

func UpdatePaymentStatus(c *gin.Context) {
	// รับ PaymentID จาก URL parameter
	paymentIDStr := c.Param("id")

	// ตรวจสอบว่า ID ไม่เป็นค่าว่าง
	if paymentIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PaymentID is required"})
		return
	}

	// แปลง PaymentID เป็น uint
	paymentID, err := strconv.ParseUint(paymentIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid PaymentID"})
		return
	}

	// เริ่มต้นการค้นหาข้อมูลในฐานข้อมูล
	db := config.DB()
	var payment entity.PaymentTicket
	if err := db.Where("id = ?", paymentID).First(&payment).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment ticket not found"})
		return
	}

	// สลับค่า PaymentStatus
	payment.PaymentStatus = !payment.PaymentStatus

	// บันทึกการเปลี่ยนแปลงลงฐานข้อมูล
	if err := db.Save(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment status"})
		return
	}

	// ส่งผลลัพธ์กลับไป
	c.JSON(http.StatusOK, gin.H{
		"message": "Payment status updated successfully",
		"data":    payment,
	})
}

  





