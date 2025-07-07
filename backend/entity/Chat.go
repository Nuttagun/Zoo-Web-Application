package entity

import (
	"time"

	"gorm.io/gorm"
)

type Chat struct {
	gorm.Model

	SendMassage string    `valid:"required~Massage is required,type(string)~Massage must be a string" json:"massage"`
	TimeSend    time.Time 

	EmployeeID uint
	Employee   Employee `gorm:"foreignKey:EmployeeID"`
}

//จะทำแต่ Skill ยังไม่ถึง คือกรองไม่ให้รับค่าที่เป็น Space  อย่างเดียวได้
//	SendMassage string    `valid:"required~Massage is required, matches(^\\S+$)~Massage must not be only spaces" json:"massage"`