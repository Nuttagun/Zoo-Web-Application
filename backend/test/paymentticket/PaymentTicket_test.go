package unit

import (
	"fmt"
	"testing"
	"time"
	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestAllTruePaymentTicket(t *testing.T){

	g := NewGomegaWithT(t)
	paydate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC)
	t.Run(`Alltrue`, func(t *testing.T){
		payment := entity.PaymentTicket{
			Amount: 21545.23,
			PaymentDate: paydate,
			Path: "/upload/Image/aaa.png",
			PaymentStatus: /*"Complete"*/false,
			BookingID: 333,
			PromotionID: nil, //
		}
		ok ,err := govalidator.ValidateStruct(payment)
		fmt.Print("err: ", err)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
		// g.Expect(err.Error()).To(Equal(""))
	})
}

func TestPaymentTicketNull(t *testing.T){
	
	promoid1 := uint(12)
	g := NewGomegaWithT(t)
	paydate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC)
	t.Run(`AmountNull`, func(t *testing.T){
		payment := entity.PaymentTicket{
			Amount: 0,    //ผิดตรงนนี้
			PaymentDate: paydate,
			Path: "/upload/Image/aaa.png",
			PaymentStatus: true,
			BookingID: 333,
			PromotionID: &promoid1,
		}
		ok ,err := govalidator.ValidateStruct(payment)
		fmt.Print("err: ", err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Amount is required"))
	})

	t.Run(`PathNull`, func(t *testing.T){
		payment := entity.PaymentTicket{
			Amount: 2554.87,    
			PaymentDate: paydate,
			Path: "",     //ผิดตรงนนี้ //
			PaymentStatus: /*"Complete"*/true,
			BookingID: 333,
			PromotionID: &promoid1,
		}
		ok ,err := govalidator.ValidateStruct(payment)
		fmt.Print("err: ", err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Path is required"))
	})

	// t.Run(`PaymentStatusNull`, func(t *testing.T){
	// 	payment := entity.PaymentTicket{
	// 		Amount: 2554.87,    
	// 		PaymentDate: paydate,
	// 		Path: "/upload/Image/aaa.png",    
	// 		PaymentStatus: false,    //ผิดตรงนนี้ ////
	// 		BookingID: 333,
	// 		PromotionID: &promoid1,
	// 	}
	// 	ok ,err := govalidator.ValidateStruct(payment)
	// 	fmt.Print("err: ", err)
	// 	g.Expect(ok).NotTo(BeTrue())
	// 	g.Expect(err).NotTo(BeNil())
	// 	g.Expect(err.Error()).To(Equal("PaymentStatus is required"))
	// })

	t.Run(`BookingIDNull`, func(t *testing.T){
		payment := entity.PaymentTicket{
			Amount: 2554.87,    
			PaymentDate: paydate,
			Path: "/upload/Image/aaa.png",    
			PaymentStatus: /*"No"*/false,   
			BookingID: 0,    //ผิดตรงนนี้ //
			PromotionID: &promoid1,
		}
		ok ,err := govalidator.ValidateStruct(payment)
		fmt.Print("err: ", err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("BookingID is required"))
	})
}


func TestAmountLessThan1(t *testing.T){
	
	promoid1 := uint(12)
	g := NewGomegaWithT(t)
	paydate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC)
	t.Run(`TestAmountLessThan1`, func(t *testing.T){
		payment := entity.PaymentTicket{
			Amount: 0.23,    //ผิดตรงนี้
			PaymentDate: paydate,
			Path: "/upload/Image/aaa.png",
			PaymentStatus: /*"Complete"*/true,
			BookingID: 333,
			PromotionID: &promoid1,
		}
		ok ,err := govalidator.ValidateStruct(payment)
		fmt.Print("err: ", err)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Amount must be at least 1"))
	})
}
