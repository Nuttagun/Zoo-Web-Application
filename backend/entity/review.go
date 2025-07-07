package entity

import (
	"errors"
	"path/filepath"
	"strings"
	"time"

	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	Rating       uint   `valid:"required~Rating is required, range(1|5)~Rating must be between 1 and 5"` 
	Comment      string `valid:"required~Comment is required, stringlength(1|500)~Comment must be between 1 and 500 characters"` 
	ReviewDate   time.Time `valid:"-"` 
	Picture      string `valid:"-"` 

	UserID       *uint   `valid:"required~UserID is required"` 
	User         User    `gorm:"foreignKey:UserID"  valid:"-"` 

	Like         []Like  `gorm:"foreignKey:ReviewID"` 
}

func (r *Review) ValidatePicture() error {
	if r.Picture == "" {
		return nil
	}

	ext := strings.ToLower(filepath.Ext(r.Picture))
	validExtensions := map[string]bool{
		".png":  true,
		".jpg":  true,
		".jpeg": true,
	}

	if !validExtensions[ext] {
		return errors.New("picture must be a file of type .png, .jpg, or .jpeg")
	}
	
	return nil
}