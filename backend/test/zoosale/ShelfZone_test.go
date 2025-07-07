package unit

import (
	"fmt"
	"testing"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)


func TestAllPassShelfZone(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`TestAllPassShelfZone`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "ผัก", 
            Color:    "#A52F21",     
            Height:     73,   
			Width: 		53,
			Positionx: 193,
			Positiony: 723,       
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}

func TestShelfZoneNull(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`ShelfNameNull`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "",        //ผิดตรงนี้
            Color:    "#A52F21",     
            Height:     73,   
			Width: 		53,
			Positionx: 193,
			Positiony: 723,       
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("ShelfName is required"))
    })

	t.Run(`ColorNull`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "เครื่องดื่ม", 
            Color:    "",    //ผิดตรงนี้
            Height:     73,   
			Width: 		53,
			Positionx: 193,
			Positiony: 723,       
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Color is required"))
    })

	t.Run(`HeightNull`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "เครื่องดื่ม", 
            Color:    "#FAA934",     
            Height:     0,     //ผิดตรงนี้  //
			Width: 		53,
			Positionx: 193,
			Positiony: 723,       
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Height is required"))
    })

	t.Run(`WidthNull`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "เครื่องดื่ม", 
            Color:    "#FAA934",     
            Height:     64,   
			Width: 		0,   //ผิดตรงนี้  //
			Positionx: 193,
			Positiony: 723,       
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Width is required"))
    })

}


func TestHeightMoreZero(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`TestHeightMoreZero`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "slkdjksd", 
            Color:    "#A52F21",     
            Height:     -73,      //ผิดตรงนี้
			Width: 		53,
			Positionx: 193,
			Positiony: 723,       
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Height must be greater than 0"))
    })
}

func TestWidthMoreZero(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`TestWidthMoreZero`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "slkdjksd", 
            Color:    "#A52F21",     
            Height:     73,   
			Width: 		-53,   //ผิดตรงนี้
			Positionx: 193,
			Positiony: 723,       
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Width must be greater than 0"))
    })
}

func TestPositionxNotNegative(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`XNegative`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "slkdjksd", 
            Color:    "#A52F21",     
            Height:     73,   
			Width: 		53,
			Positionx: -193,   //ผิดตรงนี้  //
			Positiony: 723,       
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Position X must not be negative"))
    })
}


func TestPositionyNotNegative(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`YNegative`, func(t *testing.T) {
        order := entity.ShelfZone{
            ShelfName: "slkdjksd", 
            Color:    "#A52F21",     
            Height:     73,   
			Width: 		53,
			Positionx: 193,
			Positiony: -723,      //ผิดตรงนี้    //
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Position Y must not be negative"))
    })
}
