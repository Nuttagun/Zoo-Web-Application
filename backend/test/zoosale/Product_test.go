package unit

import (
	"fmt"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestProductAllPass(t *testing.T) {
    g := NewGomegaWithT(t)
	shelfZoneID := uint(19)
    t.Run(`TestProductAllPass`, func(t *testing.T) {
        product := entity.Product{
            Name: "โค้ก", 
            Path: "/images/test-product.jpg", 
            Price:     133.59, 
			Piece: 2,
			QuantityShelf: 34,
			Barcode:  "Asdkls6523652",
			ShelfZoneID: &shelfZoneID,
        }

        ok, err := govalidator.ValidateStruct(product)
        fmt.Print("err: ", err)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })

}

func TestFieldProductNull(t *testing.T) {
    g := NewGomegaWithT(t)
    shelfZoneID := uint(19)
    t.Run(`NameNull`, func(t *testing.T) {
        product := entity.Product{
            Name: "",   //ผิดตรงนี้
            Path: "/images/test-product.jpg", 
            Price:     133.59, 
			Piece: 2,
			QuantityShelf: 34,
			Barcode:  "Asdkls6523652",
			ShelfZoneID: &shelfZoneID,
        }

        ok, err := govalidator.ValidateStruct(product)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Name is required"))
    })

    t.Run(`PathNull`, func(t *testing.T) {
        product := entity.Product{
            Name: "Coke", 
            Path: "",  //ผิดตรงนี้ //
            Price:     133.59, 
			Piece: 2,
			QuantityShelf: 34,
			Barcode:  "Asdkls6523652",
			ShelfZoneID: &shelfZoneID,
        }

        ok, err := govalidator.ValidateStruct(product)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Path is required"))
    })

    t.Run(`PriceNull`, func(t *testing.T) {
        product := entity.Product{
            Name: "Coke", 
            Path: "/images/test-product.jpg",  
            Price:     0,  //ผิดตรงนี้ //
			Piece: 2,
			QuantityShelf: 34,
			Barcode:  "Asdkls6523652",
			ShelfZoneID: &shelfZoneID,
        }

        ok, err := govalidator.ValidateStruct(product)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Price is required"))
    })

    t.Run(`PieceNull`, func(t *testing.T) {
        product := entity.Product{
            Name: "Coke", 
            Path: "/images/test-product.jpg",  
            Price:     123.69, 
			Piece: 0,  //ผิดตรงนี้  //
			QuantityShelf: 34,
			Barcode:  "Asdkls6523652",
			ShelfZoneID: &shelfZoneID,
        }

        ok, err := govalidator.ValidateStruct(product)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Piece is required"))
    })

    t.Run(`BarcodeNull`, func(t *testing.T) {
        product := entity.Product{
            Name: "Coke", 
            Path: "/images/test-product.jpg",  
            Price:     123.69, 
			Piece: 24,
			QuantityShelf: 34,
			Barcode:  "",   //ผิดตรงนี้  //
			ShelfZoneID: &shelfZoneID,
        }

        ok, err := govalidator.ValidateStruct(product)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Barcode is required"))
    })

}



func TestPricelsetthan1(t *testing.T) {
    g := NewGomegaWithT(t)
	shelfZoneID := uint(19)
    t.Run(`TestProductAllPass`, func(t *testing.T) {
        product := entity.Product{
            Name: "โค้ก", 
            Path: "/images/test-product.jpg", 
            Price:     0.99,   //ผิดตรงนี้  //
			Piece: 2,
			QuantityShelf: 34,
			Barcode:  "Asdkls6523652",
			ShelfZoneID: &shelfZoneID,
        }

        ok, err := govalidator.ValidateStruct(product)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("PriceProduct must be at least 1"))
    })

}

func TestBarCodeNotTrue(t *testing.T) {
    g := NewGomegaWithT(t)
    t.Run(`TestProductAllPass`, func(t *testing.T) {
        product := entity.Product{
            Name: "โค้ก", 
            Path: "/images/test-product.jpg", 
            Price:     253.69, 
			Piece: 2,
			QuantityShelf: 34,
			Barcode:  "1234567890A",  //ผิดตรงนี้  //
			ShelfZoneID: nil,  //
        }

        ok, err := govalidator.ValidateStruct(product)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Barcode must be 13 alphanumeric characters"))
    })
}//
