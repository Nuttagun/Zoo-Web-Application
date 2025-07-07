package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)


func ListCondition(c *gin.Context) {
	var condition []entity.Condition

	db := config.DB()

	db.Find(&condition)

	c.JSON(http.StatusOK, &condition)
}
