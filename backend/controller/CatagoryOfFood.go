package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func GetAllCatagoryOfFood(c *gin.Context) {
	db := config.DB()

	var catagory []entity.CatagoryOfFood

	// ดึงข้อมูลทั้งหมดจาก ContainerOfFood
	if err := db.Find(&catagory).Error; err != nil {
		// หากเกิดข้อผิดพลาดในการดึงข้อมูล
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถดึงข้อมูลได้",
		})
		return
	}

	// ส่งข้อมูลทั้งหมดในรูปแบบ JSON
	c.JSON(http.StatusOK, catagory)
}

// CreateCatagoryOfFood - ฟังก์ชันสำหรับการสร้าง CatagoryOfFood ใหม่
func CreateCatagoryOfFood(c *gin.Context) {
	db := config.DB()

	var catagory entity.CatagoryOfFood

	// Binding ข้อมูลจาก request body
	if err := c.ShouldBindJSON(&catagory); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ข้อมูลไม่ถูกต้อง",
		})
		return
	}

	// เพิ่ม CatagoryOfFood ใหม่ลงในฐานข้อมูล
	if err := db.Create(&catagory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถสร้างข้อมูลได้",
		})
		return
	}

	// ส่งข้อมูลที่สร้างใหม่กลับในรูปแบบ JSON
	c.JSON(http.StatusOK, catagory)
}

// DeleteCatagoryOfFood - ฟังก์ชันสำหรับการลบ CatagoryOfFood ตาม ID
func DeleteCatagoryOfFood(c *gin.Context) {
	db := config.DB()

	id := c.Param("id") // รับค่า ID จาก URL

	// ค้นหา CatagoryOfFood ตาม ID
	var catagory entity.CatagoryOfFood
	if err := db.First(&catagory, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "ไม่พบข้อมูล CatagoryOfFood ที่ต้องการลบ",
		})
		return
	}

	// ลบข้อมูล CatagoryOfFood
	if err := db.Delete(&catagory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถลบข้อมูลได้",
		})
		return
	}

	// ส่งข้อความยืนยันการลบข้อมูล
	c.JSON(http.StatusOK, gin.H{
		"message": "ลบข้อมูลสำเร็จ",
	})
}

// UpdateCatagoryOfFood - ฟังก์ชันสำหรับการอัปเดตข้อมูล CatagoryOfFood ตาม ID
func UpdateCatagoryOfFood(c *gin.Context) {
	db := config.DB()

	id := c.Param("id") // รับค่า ID จาก URL

	// ค้นหา CatagoryOfFood ตาม ID
	var catagory entity.CatagoryOfFood
	if err := db.First(&catagory, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "ไม่พบข้อมูล CatagoryOfFood ที่ต้องการอัปเดต",
		})
		return
	}

	// Binding ข้อมูลจาก request body
	if err := c.ShouldBindJSON(&catagory); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ข้อมูลไม่ถูกต้อง",
		})
		return
	}

	// อัปเดตข้อมูล CatagoryOfFood
	if err := db.Save(&catagory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถอัปเดตข้อมูลได้",
		})
		return
	}

	// ส่งข้อมูลที่อัปเดตกลับในรูปแบบ JSON
	c.JSON(http.StatusOK, catagory)
}
