package unit

import (
	"fmt"
	"testing"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestAllPassListProductSale(t *testing.T) {
    
    g := NewGomegaWithT(t)

    t.Run(`TestPassListProductSale`, func(t *testing.T) {
        ListProductSale := entity.ListProductSale{
            Price: 1.23,
            Piece: 124,
            ProductID: 12,
            PaymentProductID: 20,
        }

        ok, err := govalidator.ValidateStruct(ListProductSale)
        fmt.Print("err: ", err)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}


func TestPassListProductSaleNull(t *testing.T) {
    
    g := NewGomegaWithT(t)

    t.Run(`PriceNull`, func(t *testing.T) {
        ListProductSale := entity.ListProductSale{
            Price: 0,    //ผิดตรงนนี้
            Piece: 124,
            ProductID: 12,
            PaymentProductID: 20,
        }

        ok, err := govalidator.ValidateStruct(ListProductSale)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("PriceListProductSale is required"))
    })

    t.Run(`PieceNull`, func(t *testing.T) {
        ListProductSale := entity.ListProductSale{
            Price: 24545.25,
            Piece: 0,   //ผิดตรงนนี้
            ProductID: 12,
            PaymentProductID: 20,
        }

        ok, err := govalidator.ValidateStruct(ListProductSale)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("PieceListProductSale is required"))
    })

    t.Run(`ProductIDNull`, func(t *testing.T) {
        ListProductSale := entity.ListProductSale{
            Price: 24545.25,
            Piece: 124,
            ProductID: 0,   //ผิดตรงนนี้  //
            PaymentProductID: 20,
        }

        ok, err := govalidator.ValidateStruct(ListProductSale)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("ProductID is required"))
    })

    t.Run(`PaymentProductIDNull`, func(t *testing.T) {
        ListProductSale := entity.ListProductSale{
            Price: 24545.25,
            Piece: 124,
            ProductID: 52,
            PaymentProductID: 0,   //ผิดตรงนนี้  //
        }

        ok, err := govalidator.ValidateStruct(ListProductSale)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("PaymentProductID is required"))
    })


}



func TestPriceListProductSaleLestThan1(t *testing.T) {
    
    g := NewGomegaWithT(t)

    t.Run(`lestthan1`, func(t *testing.T) {
        ListProductSale := entity.ListProductSale{
            Price: 0.99,   //ผิดตรงนนี้
            Piece: 124,
            ProductID: 12,
            PaymentProductID: 20,
        }

        ok, err := govalidator.ValidateStruct(ListProductSale)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("PriceListProductSale must be at least 1"))
    })
}