package entity

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `valid:"required~Username is required" gorm:"not null"`
    Password   string `valid:"required~Password is required"`
    Email 	string `valid:"required~Email is required,email~Email format is invalid"`
    FirstName  string `valid:"required~FirstName is required"`
    LastName   string `valid:"required~LastName is required"`    
	Birthday  time.Time 
	Profile   string    `gorm:"type:longtext"` 
	PhoneNumber string `valid:"required~PhoneNumber is required,stringlength(10|10)~Phone must be 10 digits"`
		

	UserRoleID uint
	UserRole   *UserRoles `gorm:"foreignKey: UserRoleID" `

	GenderID uint
	Gender   *Genders `gorm:"foreignKey: GenderID"`

	Employee *Employee `gorm:"foreignKey:UserID"`

	Booking *Booking `gorm:"foreignKey:UserID"`

	Review []Review `gorm:"foreignKey:UserID"`

	Like []Like `gorm:"foreignKey:UserID"`

}
//เลื่อนtask#2