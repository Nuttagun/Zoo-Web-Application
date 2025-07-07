package controller

import (
	"net/http"
	"time"

	"github.com/asaskevich/govalidator"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"

	"github.com/gin-gonic/gin"
)

//GET /GetChats
// func GetChats(c *gin.Context) {
// 	var chats []entity.Chat
// 	db := config.DB()

// 	// Preload Employee และ User ผ่าน Employee
// 	if err := db.Preload("Employee.User").Find(&chats).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, chats)
// }
func GetChats(c *gin.Context) {
	var chats []entity.Chat
	db := config.DB()

	// คำนวณวันที่ 3 เดือนก่อนหน้านี้
	threeMonthsAgo := time.Now().AddDate(0, -3, 0)

	// Preload Employee และ User ผ่าน Employee พร้อมกรองวันที่
	if err := db.Preload("Employee.User").
		Where("created_at >= ?", threeMonthsAgo).
		Find(&chats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, chats)
}


// POST /CreateChats
func CreateChats(c *gin.Context) {
	var chats entity.Chat
	var employee entity.Employee

	db := config.DB()

	// Bind JSON to Chat variable
	if err := c.ShouldBindJSON(&chats); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate structure with govalidator
	if _, err := govalidator.ValidateStruct(chats); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ค้นหา Employee ด้วย id
	db.First(&employee, employee.Promotion)
	if employee.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	// Create Chat
	chat := entity.Chat{
		SendMassage: chats.SendMassage,
		TimeSend:    time.Now(),
		EmployeeID:  chats.EmployeeID,
		Employee:    employee,
	}

	// Save Chat
	if err := db.Create(&chat).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Chat created successfully",
		"data":    chat,
	})
}

//POST /CreateZookeeperChats
func CreateZookeeperChats(c *gin.Context) {
    var chats entity.Chat
    var employee entity.Employee

    db := config.DB()

    // Bind JSON to Chat variable
    if err := c.ShouldBindJSON(&chats); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Validate structure with govalidator
    if _, err := govalidator.ValidateStruct(chats); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // ล็อคค่า EmployeeID เป็น 2
    chats.EmployeeID = 2

    // ค้นหา Employee ด้วย EmployeeID
    if err := db.First(&employee, chats.EmployeeID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
        return
    }

    // Create Chat
    chat := entity.Chat{
        SendMassage: chats.SendMassage,
        TimeSend:    time.Now(),
        EmployeeID:  chats.EmployeeID,
        Employee:    employee,
    }

    // Save Chat
    if err := db.Create(&chat).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "Chat created successfully",
        "data":    chat,
    })
}

