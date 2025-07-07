package veterianController

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListReportForVet(c *gin.Context) {
	var reports []entity.Report

	db := config.DB()
	results := db.Preload("Animal").Preload("Employee.User").Find(&reports)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}
