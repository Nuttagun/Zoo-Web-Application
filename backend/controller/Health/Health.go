package health

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListHealth(c *gin.Context) {
	var health []entity.HealthAnimal

	db := config.DB()

	db.Find(&health)

	c.JSON(http.StatusOK, &health)
}