package zone

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListZone(c *gin.Context) {
	var zons []entity.Zone

	db := config.DB()

	db.Find(&zons)

	c.JSON(http.StatusOK, &zons)
}
