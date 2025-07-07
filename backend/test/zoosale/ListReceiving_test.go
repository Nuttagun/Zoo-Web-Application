package unit

import (
	"fmt"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

func TestPassAllListRece(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`TestPassAllListRece`, func(t *testing.T) {
        ListReceiving := entity.ListReceiving{
            Quantity:  23,
            ProductID: 100,
            OrderReceivingID: 3,
        }
        ok, err := govalidator.ValidateStruct(ListReceiving)
        fmt.Print("err: ", err)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}



func TestListReceQuantityNull(t *testing.T) {
    
    g := NewGomegaWithT(t)

    t.Run(`TestListReceQuantityNull`, func(t *testing.T) {
        ListReceiving := entity.ListReceiving{
            Quantity:  0,   //ผิดตรงนี้
            ProductID: 100,
            OrderReceivingID: 3,
        }
        ok, err := govalidator.ValidateStruct(ListReceiving)
        fmt.Print("err: ", err)

        g.Expect(ok).NotTo(BeTrue())        
        g.Expect(err).NotTo(BeNil())   
        g.Expect(err.Error()).To(Equal("Quantity is required"))
    })
}


func TestListReceProductIDNull(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`TestListReceQuantityNull`, func(t *testing.T) {
        ListReceiving := entity.ListReceiving{
            Quantity:  20,   
            ProductID: 0,  //ผิดตรงนี้  ///
            OrderReceivingID: 3,
        }
        ok, err := govalidator.ValidateStruct(ListReceiving)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("ProductID is required"))
    })
}

func TestOrderReceivingIDNull(t *testing.T) {

    g := NewGomegaWithT(t)

    t.Run(`TestListReceQuantityNull`, func(t *testing.T) {
        ListReceiving := entity.ListReceiving{
            Quantity:  20,   
            ProductID: 20,  
            OrderReceivingID: 0,  //ผิดตรงนี้  ///
        }
        ok, err := govalidator.ValidateStruct(ListReceiving)
        fmt.Print("err: ", err)

        // Assertions
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("OrderReceivingID is required"))
    })
}