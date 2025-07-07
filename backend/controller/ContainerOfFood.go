package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func GetAllContainer(c *gin.Context) {
	db := config.DB()

	var containers []entity.ContainerOfFood

	// ดึงข้อมูลทั้งหมดจาก ContainerOfFood
	if err := db.Find(&containers).Error; err != nil {
		// หากเกิดข้อผิดพลาดในการดึงข้อมูล
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถดึงข้อมูลได้",
		})
		return
	}

	// ส่งข้อมูลทั้งหมดในรูปแบบ JSON
	c.JSON(http.StatusOK, containers)
}

func CreateContainer(c *gin.Context) {
	db := config.DB()

	var container entity.ContainerOfFood

	// Binding ข้อมูลจาก request body
	if err := c.ShouldBindJSON(&container); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ข้อมูลไม่ถูกต้อง",
		})
		return
	}

	// เพิ่ม Container ใหม่ลงในฐานข้อมูล
	if err := db.Create(&container).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถสร้างข้อมูลได้",
		})
		return
	}

	// ส่งข้อมูลที่สร้างใหม่กลับในรูปแบบ JSON
	c.JSON(http.StatusOK, container)
}

// DeleteContainer - ฟังก์ชันสำหรับการลบ Container ตาม ID
func DeleteContainer(c *gin.Context) {
	db := config.DB()

	Containerid := c.Param("id") // รับค่า ID จาก URL

	// ค้นหา Container ตาม ID
	var container entity.ContainerOfFood
	if err := db.First(&container, Containerid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "ไม่พบข้อมูล Container ที่ต้องการลบ",
		})
		return
	}

	// ลบข้อมูล Container
	if err := db.Delete(&container).Error; err != nil {
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

// UpdateContainer - ฟังก์ชันสำหรับการอัปเดตข้อมูล Container ตาม ID
func UpdateContainer(c *gin.Context) {
	db := config.DB()

	id := c.Param("id") // รับค่า ID จาก URL

	// ค้นหา Container ตาม ID
	var container entity.ContainerOfFood
	if err := db.First(&container, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "ไม่พบข้อมูล Container ที่ต้องการอัปเดต",
		})
		return
	}

	// Binding ข้อมูลจาก request body
	if err := c.ShouldBindJSON(&container); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ข้อมูลไม่ถูกต้อง",
		})
		return
	}

	// อัปเดตข้อมูล Container
	if err := db.Save(&container).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถอัปเดตข้อมูลได้",
		})
		return
	}

	// ส่งข้อมูลที่อัปเดตกลับในรูปแบบ JSON
	c.JSON(http.StatusOK, container)
}
