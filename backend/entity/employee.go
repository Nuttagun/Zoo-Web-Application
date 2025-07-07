package entity

import (

	"gorm.io/gorm"
)

type Employee struct {
	gorm.Model
	Bio			string 
	Experience  string 
	Education   string 
	Salary 		float64
	FullTime 	bool

	UserID 		*uint
	User   		*User `gorm:"foreignKey:UserID"`

	Animals []Animal `gorm:"foreignKey:EmployeeID"`

	Event 	[]Event `gorm:"foreignKey:EmployeeID"`

	Work 	[]Work `gorm:"foreignKey:EmployeeID"`
	
	Report 	[]Report `gorm:"foreignKey:EmployeeID"`

	Calendar []Calendar `gorm:"foreignKey:EmployeeID"`

	Vehicles []Vehicle `gorm:"foreignKey:EmployeeID"`

	StockOfFood 	[]StockOfFood `gorm:"foreignKey:EmployeeID"`

	Medicalrecord  	*[]Medicalrecord  `gorm:"foreignKey:EmployeeID"`

	Promotion 		[]Promotion `gorm:"foreignKey:EmployeeID"`

	OrderReceiving 	[]OrderReceiving `gorm:"foreignKey:EmployeeID"`

	ProductDisposal []ProductDisposal `gorm:"foreignKey:EmployeeID"`

	Chat 			*[]Chat `gorm:"foreignKey:EmployeeID"`
}
//เลื่อนtask