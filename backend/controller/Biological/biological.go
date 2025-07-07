package biological

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListBiological(c *gin.Context) {
	var biologicals []entity.Biological

	db := config.DB()

	db.Find(&biologicals)

	c.JSON(http.StatusOK, &biologicals)
}
