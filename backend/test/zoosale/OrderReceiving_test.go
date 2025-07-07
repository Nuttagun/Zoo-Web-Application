package unit

import (
	"fmt"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)


func TestAllPass(t *testing.T) {
    
    g := NewGomegaWithT(t)

    orderdate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC) // กำหนดเป็นเวลา UTC
    t.Run(`OrderReceiving All Pass`, func(t *testing.T) {
        order := entity.OrderReceiving{
            Receiving_date: orderdate, 
            Total_price:    87234.18,     
            EmployeeID:     1,          
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err TestAllPass: ", err)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })

}



func TestNull(t *testing.T) {

    g := NewGomegaWithT(t)

    orderdate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC)
    t.Run(`Total_price null`, func(t *testing.T) {
        order := entity.OrderReceiving{
            Receiving_date: orderdate, 
            Total_price:    0,     //ผิดตรงนนี้
            EmployeeID:     1,          
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err : ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Total price is required"))
    })

    t.Run(`EmployeeID null`, func(t *testing.T) {
        order := entity.OrderReceiving{
            Receiving_date: orderdate, 
            Total_price:    35623.56,     
            EmployeeID:     0,     //ผิดตรงนนี้ //  
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Employee ID is required"))
    })

}



func TestLessThanone(t *testing.T) {

    g := NewGomegaWithT(t)

    orderdate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.UTC) // กำหนดเป็นเวลา UTC
    t.Run(`Total_price less than 0`, func(t *testing.T) {
        order := entity.OrderReceiving{
            Receiving_date: orderdate, 
            Total_price:    -87234.18,     
            EmployeeID:     1,          
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Total price must be at least 1"))
    })

    t.Run(`Total_price less than 1`, func(t *testing.T) {
        order := entity.OrderReceiving{
            Receiving_date: orderdate, 
            Total_price:    -2,     
            EmployeeID:     1,          
        }

        ok, err := govalidator.ValidateStruct(order)
        fmt.Print("err: ", err)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Total price must be at least 1"))
    })

}
