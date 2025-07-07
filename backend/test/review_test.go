package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func generateLongString(length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result += "A"
	}
	return result
}

func TestValidReviewInput(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	t.Run("should pass validation for valid input", func(t *testing.T) {
		review := entity.Review{
			Rating:     5,
			Comment:    "This is a valid review.",
			ReviewDate: time.Now(),
			Picture:    "example.jpg",
			UserID:     &userID,
		}

		ok, err := govalidator.ValidateStruct(review)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestValidRatingReview(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	t.Run("should fail validation for invalid Rating", func(t *testing.T) {
		review := entity.Review{
			Rating:     6,
			Comment:    "This is a valid review.",
			ReviewDate: time.Now(),
			Picture:    "example.jpg",
			UserID:     &userID,
		}

		ok, err := govalidator.ValidateStruct(review)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Rating must be between 1 and 5"))
	})

	t.Run("should fail validation for missing Rating", func(t *testing.T) {
		review := entity.Review{
			Rating:     0,
			Comment:    "This is a valid review.",
			ReviewDate: time.Now(),
			Picture:    "example.jpg",
			UserID:     &userID,
		}

		ok, err := govalidator.ValidateStruct(review)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Rating is required"))
	})
}

func TestValidCommentReview(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	t.Run("should fail validation for missing Comment", func(t *testing.T) {
		review := entity.Review{
			Rating:     5,
			Comment:    "",
			ReviewDate: time.Now(),
			Picture:    "example.jpg",
			UserID:     &userID,
		}

		ok, err := govalidator.ValidateStruct(review)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Comment is required"))
	})

	t.Run("should fail validation for Comment exceeding 500 characters", func(t *testing.T) {
		review := entity.Review{
			Rating:     5,
			Comment:    generateLongString(501),
			ReviewDate: time.Now(),
			Picture:    "example.jpg",
			UserID:     &userID,
		}

		ok, err := govalidator.ValidateStruct(review)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Comment must be between 1 and 500 characters"))
	})
}

func TestValidUserIDReview(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run("should fail validation for missing UserID", func(t *testing.T) {
		review := entity.Review{
			Rating:     5,
			Comment:    "This is a valid review.",
			ReviewDate: time.Now(),
			Picture:    "example.jpg",
			UserID:     nil,
		}

		ok, err := govalidator.ValidateStruct(review)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("UserID is required"))
	})
}

func TestValidPictureReview(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)

	t.Run("should fail validation for unsupported Picture file type", func(t *testing.T) {
		review := entity.Review{
			Rating:     5,
			Comment:    "A wonderful experience.",
			ReviewDate: time.Now(),
			Picture:    "example.txt", 
			UserID:     &userID,
		}

		err := review.ValidatePicture()

		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("picture must be a file of type .png, .jpg, or .jpeg"))
	})

	t.Run("should pass validation for valid Picture file type (.jpg)", func(t *testing.T) {
		review := entity.Review{
			Rating:     5,
			Comment:    "A wonderful experience.",
			ReviewDate: time.Now(),
			Picture:    "example.jpg", 
			UserID:     &userID,
		}

		err := review.ValidatePicture()

		g.Expect(err).To(BeNil()) 
	})

	t.Run("should pass validation for valid Picture file type (.png)", func(t *testing.T) {
		review := entity.Review{
			Rating:     5,
			Comment:    "A wonderful experience.",
			ReviewDate: time.Now(),
			Picture:    "example.png", 
			UserID:     &userID,
		}

		err := review.ValidatePicture()

		g.Expect(err).To(BeNil()) 
	})

	t.Run("should pass validation when Picture is empty", func(t *testing.T) {
		review := entity.Review{
			Rating:     5,
			Comment:    "A wonderful experience.",
			ReviewDate: time.Now(),
			Picture:    "", 
			UserID:     &userID,
		}

		err := review.ValidatePicture()

		g.Expect(err).To(BeNil()) 
	})
}
