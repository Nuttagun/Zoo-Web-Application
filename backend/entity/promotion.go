package entity

import (
	"time"

	"gorm.io/gorm"
)

type Promotion struct {
	gorm.Model

	PromotionName    string `valid:"required~Promotion Name is required" gorm:"not null"`
	// PromotionPicture string
	StartDate        time.Time
	EndDate          time.Time
	Discount         float64 `valid:"range(0|100)~Discount must be between 0 and 100" gorm:"type:decimal(3,2);not null"`
	Description      string  `valid:"type(string),optional" gorm:"type:text"`

	NumberPromotionUse int `valid:"range(1|100000)~NumberPromotionUse must be at least 1 or More than limit(100000)" gorm:"not null"`
	//
	VisitDate    *time.Time
	EndVisitDate *time.Time

	PromotionStatusID *uint
	PromotionStatus   PromotionStatus `gorm:"foreignKey:PromotionStatusID"`

	ConditionID *uint
	Condition   Condition `gorm:"foreignKey:ConditionID"`

	PromotionCategoryID *uint
	PromotionCategory   PromotionCategory `gorm:"foreignKey:PromotionCategoryID"`

	EmployeeID *uint
	Employee   Employee `gorm:"foreignKey:EmployeeID"`
}

type PromotionStatus struct {
	gorm.Model
	SName    string
	ParentID *uint
	Parent   *PromotionStatus `gorm:"foreignKey:ParentID"`
}

type Condition struct {
	gorm.Model
	ConName string

	MinChild uint
	MaxChild *uint

	MinAdult uint
	MaxAdult *uint

	MinOther uint
	MaxOther *uint

	ParentID *uint
	Parent   *Condition `gorm:"foreignKey:ParentID"`
}

type PromotionCategory struct {
	gorm.Model
	CName    string
	ParentID *uint
	Parent   *PromotionCategory `gorm:"foreignKey:ParentID"`
}
