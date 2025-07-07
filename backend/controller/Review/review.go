package review

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
)

func ListReview(c *gin.Context) {
	var reviews []entity.Review

	db := config.DB()
	results := db.Find(&reviews)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, reviews)
}

func ListReviewByUserID(c *gin.Context) {
	userID := c.Param("userID")
	var reviews []entity.Review
	db := config.DB()

	results := db.Where("user_id = ?", userID).Find(&reviews)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, reviews)
}

func GetUserByIdReviews(c *gin.Context) {
	ID := c.Param("id")
	var user entity.User

	db := config.DB()
	results := db.Preload("UserRole").First(&user, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if user.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}
	c.JSON(http.StatusOK, user)
}

func CreateReview(c *gin.Context) {
	var review entity.Review
	db := config.DB()

	imageproduct, err := c.FormFile("imageproduct")
	filePath := ""

	if err == nil && imageproduct != nil {
		validImageTypes := []string{"image/jpeg", "image/png", "image/gif"}
		isValidImage := false
		for _, imageType := range validImageTypes {
			if imageproduct.Header.Get("Content-Type") == imageType {
				isValidImage = true
				break
			}
		}

		if !isValidImage {
			c.JSON(http.StatusBadRequest, gin.H{"error": "picture must be a file of type .png, .jpg, or .jpeg"})
			return
		}

		uploadDir := "uploads"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		filePath = filepath.Join(uploadDir, imageproduct.Filename)
		if err := c.SaveUploadedFile(imageproduct, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	ratingStr := c.PostForm("rating")
	rating, err := strconv.ParseUint(ratingStr, 10, 32)
	if err != nil || rating < 1 || rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be between 1 and 5"})
		return
	}

	userIDStr := c.PostForm("userID")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID"})
		return
	}
	userIDPointer := uint(userID)

	comment := c.PostForm("comment")
	if len(comment) == 0 || len(comment) > 500 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Comment must be between 1 and 500 characters"})
		return
	}

	review.Rating = uint(rating)
	review.Comment = comment
	review.Picture = filePath
	review.UserID = &userIDPointer
	review.ReviewDate = time.Now()

	if err := db.Create(&review).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review created successfully",
		"id":      review.ID,
	})
}


func GetAllRatingsAvg(c *gin.Context) {
	var ratings []uint

	db := config.DB()

	if err := db.Model(&entity.Review{}).Pluck("rating", &ratings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching ratings"})
		return
	}

	if len(ratings) == 0 {
		c.JSON(http.StatusOK, gin.H{"ratings": []uint{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ratings": ratings})
}

func GetFilteredReviews(c *gin.Context) {
	starLevel := c.Query("starLevel")

	var rating uint
	switch starLevel {
	case "5Star":
		rating = 5
	case "4Star":
		rating = 4
	case "3Star":
		rating = 3
	case "2Star":
		rating = 2
	case "1Star":
		rating = 1
	case "All":
		rating = 0
	case "":
		rating = 0
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid star level"})
		return
	}

	db := config.DB()

	var reviews []entity.Review
	query := db.Preload("User")

	if rating != 0 {
		query = query.Where("rating = ?", rating)
	}

	results := query.Find(&reviews)
	if results.Error != nil {
		fmt.Println("Database Error:", results.Error) 
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	if len(reviews) == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}
	c.JSON(http.StatusOK, reviews)
}

func SearchReviewsByKeyword(c *gin.Context) {
	keyword := c.Query("keyword")

	var reviews []entity.Review
	db := config.DB()

	query := db.Preload("User").Where("comment LIKE ?", "%"+keyword+"%")

	results := query.Find(&reviews)

	if results.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	if len(reviews) == 0 {
		c.JSON(http.StatusNoContent, gin.H{"message": "No reviews found"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func ListBookingsByUserID(c *gin.Context) {
	userIDParam := c.Param("id")
	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var bookings []entity.Booking
	db := config.DB()

	if err := db.Where("user_id = ?", userID).Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var completedBookings []entity.Booking

	for _, booking := range bookings {
		var paymentTickets []entity.PaymentTicket
		if err := db.Where("booking_id = ?", booking.ID).Find(&paymentTickets).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		for _, paymentTicket := range paymentTickets {
			if paymentTicket.PaymentStatus == true {

				completedBookings = append(completedBookings, booking)
				break
			}
		}
	}

	c.JSON(http.StatusOK, completedBookings)
}

func GetReviewByID(c *gin.Context) {
	ID := c.Param("id")
	var review entity.Review

	db := config.DB()
	result := db.First(&review, ID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, review)
}

func UpdateReview(c *gin.Context) {
	var review entity.Review
	reviewID := c.Param("id")
	db := config.DB()

	if err := db.First(&review, reviewID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	if rating := c.PostForm("Rating"); rating != "" {
		r, err := strconv.ParseUint(rating, 10, 32)
		if err != nil || r < 1 || r > 5 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be an integer between 1 and 5"})
			return
		}
		review.Rating = uint(r)
	}

	if comment := c.PostForm("Comment"); comment != "" {
		if len(comment) == 0 || len(comment) > 500 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Comment must be between 1 and 500 characters"})
			return
		}
		review.Comment = comment
	}

	review.ReviewDate = time.Now()

	isRemovePicture := c.PostForm("isRemovePicture") == "true"
	if isRemovePicture {
		if review.Picture != "" {
			if err := os.Remove(review.Picture); err != nil && !os.IsNotExist(err) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete existing image"})
				return
			}
			review.Picture = ""
		}
	}


	file, err := c.FormFile("Picture")
	if err == nil && file != nil {

		validImageTypes := []string{"image/jpeg", "image/png", "image/gif"}
		isValidImage := false
		for _, imageType := range validImageTypes {
			if file.Header.Get("Content-Type") == imageType {
				isValidImage = true
				break
			}
		}

		if !isValidImage {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Uploaded file must be an image (JPEG, PNG, GIF)"})
			return
		}


		uploadDir := "uploads"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		filePath := filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		if review.Picture != "" {
			os.Remove(review.Picture)
		}

		review.Picture = filePath
	}


	if err := db.Save(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update review: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review updated successfully", "data": review})
}

