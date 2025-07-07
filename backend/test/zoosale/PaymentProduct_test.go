package unit

import (
	"fmt"
	"testing"
	"time"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestAllPassPayProduct(t *testing.T) {
    g := NewGomegaWithT(t)

    paymentproductdate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC)

    t.Run(`TestAllPassPayProduct`, func(t *testing.T) {
        PayProduct := entity.PaymentProduct{
            Date:         paymentproductdate,
            TotalAmount: 473.85,
            TypePaymentProductID: 1,
            EmployeeID:  1,
        }

        ok, err := govalidator.ValidateStruct(PayProduct)
        fmt.Print("err: ", err)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}

func TestPayProductNull(t *testing.T) {
    g := NewGomegaWithT(t)
    
    payproductdate1 := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC)
	t.Run(`TotalAmountNull`, func(t *testing.T) {
        PayProduct := entity.PaymentProduct{
            Date:         payproductdate1,
            TotalAmount: 0, //ผิดตรงนี้  //
            TypePaymentProductID: 5,
            EmployeeID:  1,
        }

        ok, err := govalidator.ValidateStruct(PayProduct)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TotalAmount is required"))
    })

	t.Run(`TypePaymentNull`, func(t *testing.T) {
        PayProduct := entity.PaymentProduct{
            Date:    payproductdate1,
            TotalAmount: 473.85,
            TypePaymentProductID: 0,    //ผิดตรงนี้
            EmployeeID:  1,
        }

        ok, err := govalidator.ValidateStruct(PayProduct)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TypePaymentProductID is required"))
    })


	t.Run(`EmployeeIDNull`, func(t *testing.T) {
        PayProduct := entity.PaymentProduct{
            Date:         payproductdate1,
            TotalAmount: 602.94,
            TypePaymentProductID: 5,
            EmployeeID:  0,   //ผิดตรงนี้ //
        }

        ok, err := govalidator.ValidateStruct(PayProduct)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("EmployeeID is required"))
    })
}


func TestTotalAmountLessthan1(t *testing.T) {
    g := NewGomegaWithT(t)

    paymentproductdate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC)

    t.Run(`TestTotalAmountLessthan1`, func(t *testing.T) {
        PayProduct := entity.PaymentProduct{
            Date:         paymentproductdate,
            TotalAmount: -473.85,    //ผิดตรงนี้  //
            TypePaymentProductID: 5,
            EmployeeID:  1,
        }

        ok, err := govalidator.ValidateStruct(PayProduct)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TotalAmount must be at least 1"))
    })

    t.Run(`TestTotalAmountLessthan1v2`, func(t *testing.T) {
        PayProduct := entity.PaymentProduct{
            Date:         paymentproductdate,
            TotalAmount: 0.1,    //ผิดตรงนี้  //
            TypePaymentProductID: 5,
            EmployeeID:  1,
        }

        ok, err := govalidator.ValidateStruct(PayProduct)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TotalAmount must be at least 1"))
    })

    
}