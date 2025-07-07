package behavioral

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListBehaviorals(c *gin.Context) {
	var behaviorals []entity.Behavioral

	db := config.DB()

	db.Find(&behaviorals)

	c.JSON(http.StatusOK, &behaviorals)
}
