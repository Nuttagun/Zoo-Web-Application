package vehicle

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"github.com/gin-gonic/gin"
    "github.com/google/uuid"

)

func CreateVehicle(c *gin.Context) {
	var vehicle entity.Vehicle
	var vehicleType entity.VehicleType
	db := config.DB()

	image, err := c.FormFile("picture")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error receiving image: %v", err)})
		return
	}

	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create upload directory: %v", err)})
		return
	}

	fileName := fmt.Sprintf("%s-%s", uuid.New().String(), image.Filename)
	filePath := filepath.Join(uploadDir, fileName)

	if err := c.SaveUploadedFile(image, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save image: %v", err)})
		return
	}

	vehicle.Name = c.PostForm("name")
	vehicle.Description = c.PostForm("description")

	priceStr := c.PostForm("price")
	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid price format: %v", err)})
		return
	}
	vehicle.Price = price


	receivedDateStr := c.PostForm("receivedDate")
	receivedDate, err := time.Parse("2006-01-02", receivedDateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid receivedDate format: %v", err)})
		return
	}
	vehicle.ReceivedDate = receivedDate

	vehicleTypeIDStr := c.PostForm("vehicleTypeID")
	if vehicleTypeIDStr == "" {
		vehicleTypeIDStr = "1" 
	}

	vehicleTypeID, err := strconv.ParseUint(vehicleTypeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vehicleTypeID format"})
		return
	}
	vehicle.VehicleTypeID = uint(vehicleTypeID)

	ColorID, err := strconv.ParseUint(c.PostForm("vehicleColorID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid ColorID format: %v", err)})
		return
	}
	vehicle.VehicleColorID = uint(ColorID)

	StatusID, err := strconv.ParseUint(c.PostForm("Status"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid StatusID format: %v", err)})
		return
	}
	vehicle.VehicleStatusID = uint(StatusID)

	employeeID, err := strconv.ParseUint(c.PostForm("employeeID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid employeeID format: %v", err)})
		return
	}
	vehicle.EmployeeID = uint(employeeID)

	vehicle.Picture = filePath

	if err := db.First(&vehicleType, vehicle.VehicleTypeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "VehicleType not found"})
		return
	}

	vehicleType.QuantityVehicle += 1
	if err := db.Save(&vehicleType).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update QuantityVehicle: %v", err)})
		return
	}

	if err := db.Create(&vehicle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create vehicle: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Vehicle created successfully",
		"data":    vehicle,
	})
}


func DeleteVehicle(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var vehicle entity.Vehicle
	var vehicleType entity.VehicleType

	if err := db.Where("id = ?", id).First(&vehicle).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	if err := db.First(&vehicleType, vehicle.VehicleTypeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "VehicleType not found"})
		return
	}

	if err := db.Delete(&vehicle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vehicle"})
		return
	}

	if vehicleType.QuantityVehicle > 0 {
		vehicleType.QuantityVehicle -= 1
		if err := db.Save(&vehicleType).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update QuantityVehicle"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vehicle deleted successfully"})
}


func ListVehicle(c *gin.Context) {
	var vehicle []entity.Vehicle

	db := config.DB() 
	results := db.Preload("VehicleType").Preload("VehicleStatus").Preload("VehicleColor").Preload("Employee.User").Find(&vehicle)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, vehicle)
}


func GetVehicleById(c *gin.Context) {
	id := c.Param("id") 
	db := config.DB()

	var vehicle entity.Vehicle

	if err := db.Preload("VehicleType").Preload("Employee").Preload("VehicleStatus").Where("id = ?", id).First(&vehicle).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}

	c.JSON(http.StatusOK, vehicle)
}


func UpdateVehicle(c *gin.Context) {
    var vehicle entity.Vehicle
    db := config.DB()

    id := c.Param("id")
    if id == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Missing vehicle ID"})
        return
    }

    if err := db.Where("id = ?", id).First(&vehicle).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
        return
    }

    if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
        return
    }

    vehicle.Name = c.PostForm("Name")
    vehicle.Description = c.PostForm("Description")
    
    receivedDateStr := c.PostForm("ReceivedDate")
    if receivedDateStr != "" {
        receivedDate, err := time.Parse("2006-01-02", receivedDateStr) 
        if err == nil {
            vehicle.ReceivedDate = receivedDate
        }
    }
    
    priceStr := c.PostForm("Price")
    if priceStr != "" {
        price, err := strconv.ParseFloat(priceStr, 64)
        if err == nil {
            vehicle.Price = price
        }
    }

    file, err := c.FormFile("Picture") 
    if err == nil && file != nil {
        if vehicle.Picture != "" {
            oldFilePath := filepath.Join("uploads", vehicle.Picture)
            os.Remove(oldFilePath) 
        }

        uploadDir := "uploads"
        if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
            return
        }

        newFileName := file.Filename 
        filePath := filepath.Join(uploadDir, newFileName)

        if err := c.SaveUploadedFile(file, filePath); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
            return
        }

        vehicle.Picture = "uploads/" + newFileName 
    }

	vehicleColorIDStr := c.PostForm("Color")
    if vehicleColorIDStr != "" {
        vehicleColorID, err := strconv.Atoi(vehicleColorIDStr)
        if err == nil {
            vehicle.VehicleColorID = uint(vehicleColorID)
        }
    }

	vehicleStatusIDStr := c.PostForm("Status")
    if vehicleStatusIDStr != "" {
        vehicleStatusID, err := strconv.Atoi(vehicleStatusIDStr)
        if err == nil {
            vehicle.VehicleStatusID = uint(vehicleStatusID)
        }
    }

    vehicleTypeIDStr := c.PostForm("Type")
    if vehicleTypeIDStr != "" {
        vehicleTypeID, err := strconv.Atoi(vehicleTypeIDStr)
        if err == nil {
            vehicle.VehicleTypeID = uint(vehicleTypeID)
        }
    }

    employeeIDStr := c.PostForm("EmployeeID")
    if employeeIDStr != "" {
        employeeID, err := strconv.Atoi(employeeIDStr)
        if err == nil {
            vehicle.EmployeeID = uint(employeeID)
        }
    }

    if err := db.Save(&vehicle).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update vehicle: %v", err)})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Vehicle updated successfully",
        "data":    vehicle,
    })
}

func GetAllVehicleType(c *gin.Context) {
	db := config.DB() 

	var vehicleTypes []entity.VehicleType 

	if err := db.Find(&vehicleTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve vehicle types",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vehicle types retrieved successfully",
		"data":    vehicleTypes,
	})
}

func GetAllVehicleColor(c *gin.Context) {
	db := config.DB() 

	var vehicleColors []entity.VehicleColor

	if err := db.Find(&vehicleColors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve vehicle colors",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vehicle colors retrieved successfully",
		"data":    vehicleColors,
	})
}

func GetAllVehicleStatus(c *gin.Context) {
	db := config.DB() 

	var vehicleStatus []entity.VehicleStatus

	if err := db.Find(&vehicleStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve vehicle types",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vehicle status retrieved successfully",
		"data":    vehicleStatus,
	})
}

func GetAvailableVehicles(c *gin.Context) {
	db := config.DB()

	rentDateParam := c.Query("rentDate")
	startDateParam := c.Query("startTime")
	endDateParam := c.Query("endTime")

	rentDate, err := time.Parse("2006-01-02", rentDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rentDate format. Use YYYY-MM-DD format."})
		return
	}

	if startDateParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาเลือกเวลา"})
		return
	}
	startTime, err := time.Parse(time.RFC3339, startDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid startTime format. Use RFC3339 format."})
		return
	}

	endTime, err := time.Parse(time.RFC3339, endDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid endTime format. Use RFC3339 format."})
		return
	}

	startTime = time.Date(rentDate.Year(), rentDate.Month(), rentDate.Day(), startTime.Hour(), startTime.Minute(), startTime.Second(), 0, time.UTC)
	endTime = time.Date(rentDate.Year(), rentDate.Month(), rentDate.Day(), endTime.Hour(), endTime.Minute(), endTime.Second(), 0, time.UTC)

	var bookedVehicles []uint
	err = db.Table("vehicle_rents").
		Select("vehicle_id").
		Joins("JOIN rents ON vehicle_rents.rent_id = rents.id").
		Where("rents.rent_date = ? AND rents.start_time < ? AND rents.end_time > ?", rentDate, endTime, startTime).
		Scan(&bookedVehicles).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch booked vehicles", "details": err.Error()})
		return
	}

	var availableVehicles []entity.Vehicle
	query := db.Preload("VehicleColor").Where("vehicle_status_id = ?", 1).Where("id NOT IN ?", bookedVehicles)

	if len(bookedVehicles) == 0 {
		query = db.Preload("VehicleColor").Where("vehicle_status_id = ?", 1)
	}

	err = query.Find(&availableVehicles).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch available vehicles", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, availableVehicles)
}