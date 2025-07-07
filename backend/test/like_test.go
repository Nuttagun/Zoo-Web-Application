package unit

import (
	"fmt"
	"testing"

	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func ValidateLike(like entity.Like) error {
	if like.UserID == 0 {
		return fmt.Errorf("UserID is required")
	}
	if like.ReviewID == nil {
		return fmt.Errorf("ReviewID is required")
	}
	return nil
}

func TestValidLikeInput(t *testing.T) {
	g := NewGomegaWithT(t)
	ReviewID := uint(2)

	t.Run("should pass validation for valid input", func(t *testing.T) {
		like := entity.Like{
			UserID:   1,
			ReviewID: &ReviewID,
		}

		err := ValidateLike(like)

		g.Expect(err).To(BeNil())
	})
}

func TestInvalidLikeInput(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("should fail validation for missing UserID", func(t *testing.T) {
		ReviewID := uint(2)
		like := entity.Like{
			UserID:   0,
			ReviewID: &ReviewID,
		}

		err := ValidateLike(like)

		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("UserID is required"))
	})

	t.Run("should fail validation for missing ReviewID", func(t *testing.T) {
		like := entity.Like{
			UserID:   1,
			ReviewID: nil,
		}

		err := ValidateLike(like)

		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(Equal("ReviewID is required"))
	})
}
