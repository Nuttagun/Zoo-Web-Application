package entity

import (
	"gorm.io/gorm"
)

type ShelfZone struct {
    gorm.Model
    ShelfName string `gorm:"unique" json:"shelfname" valid:"required~ShelfName is required"`
    Color     string `json:"color" valid:"required~Color is required"`
    Height    int32  `json:"height" valid:"required~Height is required,range(1|99999)~Height must be greater than 0"`
    Width     int32  `json:"width" valid:"required~Width is required,range(1|99999)~Width must be greater than 0"`
    Positionx int32  `json:"positionx" valid:"range(0|99999)~Position X must not be negative"`  //required~Position X is required,
    Positiony int32  `json:"positiony" valid:"range(0|99999)~Position Y must not be negative"`  // required~Position Y is required,   มันอาจเป็นตำแหน่ง 0,0ก็ได้

    Product []Product `gorm:"foreignKey:ShelfZoneID"`
}
