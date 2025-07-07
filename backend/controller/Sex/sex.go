package sex

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListSex(c *gin.Context) {
	var sexs []entity.Sex

	db := config.DB()

	db.Find(&sexs)

	c.JSON(http.StatusOK, &sexs)
}
