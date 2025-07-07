package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)


func ListPromotionStatus(c *gin.Context) {
	var promotion_Status []entity.PromotionStatus

	db := config.DB()

	db.Find(&promotion_Status)

	c.JSON(http.StatusOK, &promotion_Status)
}
