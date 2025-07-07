package like

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"gorm.io/gorm"
)

func LikeReview(c *gin.Context) {
	var input struct {
		UserID   uint `json:"user_id"`
		ReviewID uint `json:"review_id"`
	}

	db := config.DB()

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingLike entity.Like
	err := db.Where("user_id = ? AND review_id = ?", input.UserID, input.ReviewID).First(&existingLike).Error

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "คุณได้กด Like รีวิวนี้แล้ว"})
		return
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		newLike := entity.Like{UserID: input.UserID, ReviewID: &input.ReviewID}
		if err := db.Create(&newLike).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var likeCount int64
		db.Model(&entity.Like{}).Where("review_id = ?", input.ReviewID).Count(&likeCount)

		c.JSON(http.StatusOK, gin.H{"message": "กด Like รีวิวเรียบร้อย", "likeCount": likeCount})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
}

func CheckUserLikeStatus(c *gin.Context) {
	userID := c.Param("userID")
	reviewID := c.Param("reviewID")

	db := config.DB()

	var like entity.Like
	err := db.Where("user_id = ? AND review_id = ?", userID, reviewID).First(&like).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			var likeCount int64
			db.Model(&entity.Like{}).Where("review_id = ?", reviewID).Count(&likeCount)

			c.JSON(http.StatusOK, gin.H{"hasLiked": false, "likeCount": likeCount})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	var likeCount int64
	db.Model(&entity.Like{}).Where("review_id = ?", reviewID).Count(&likeCount)

	c.JSON(http.StatusOK, gin.H{"hasLiked": true, "likeCount": likeCount})
}

func UnlikeReview(c *gin.Context) {
	var input struct {
		UserID   uint `json:"user_id"`
		ReviewID uint `json:"review_id"`
	}

	db := config.DB()

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Unscoped().Where("user_id = ? AND review_id = ?", input.UserID, input.ReviewID).Delete(&entity.Like{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var likeCount int64
	db.Model(&entity.Like{}).Where("review_id = ?", input.ReviewID).Count(&likeCount)

	c.JSON(http.StatusOK, gin.H{"message": "ยกเลิก Like รีวิวเรียบร้อย", "likeCount": likeCount})
}
