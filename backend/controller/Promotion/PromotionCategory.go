package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)


func ListPromotionCategory(c *gin.Context) {
	var promotion_Category []entity.PromotionCategory

	db := config.DB()

	db.Find(&promotion_Category)

	c.JSON(http.StatusOK, &promotion_Category)
}
