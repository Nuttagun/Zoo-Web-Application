package entity

import (
	"time"
	"gorm.io/gorm"
)

type OrderReceiving struct {
	gorm.Model
	Receiving_date 	time.Time `valid:"required~Receiving date is required"`
	Total_price 	float64 	`valid:"required~Total price is required, float~Total price must be a number, range(1|100000000000)~Total price must be at least 1"`

	EmployeeID   	uint  `valid:"required~Employee ID is required"`
	Employee  		Employee `gorm:"foreignKey:EmployeeID" valid:"-"`

	ListReceiving []ListReceiving `gorm:"foreignKey:OrderReceivingID"`

}
