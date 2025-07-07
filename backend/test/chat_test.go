package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)

// func TestChatAllPass(t *testing.T)  {
// 	g := NewGomegaWithT(t)

// 	EmployeeID := uint(1)

// 	t.Run("Pass All", func(t *testing.T) {

// 		chat := entity.Chat{
// 			SendMassage: "เทสส่งข้อความ",
// 			TimeSend: time.Now(),
// 			EmployeeID: EmployeeID,
// 		}

// 		ok, err := govalidator.ValidateStruct(chat)
// 		if !ok {
// 			t.Logf("Validation failed: %v", err)
// 		}

// 		g.Expect(ok).To(BeTrue())
// 		g.Expect(err).To(BeNil())
// 	})

func TestChatAllPass(t *testing.T) {
    g := NewGomegaWithT(t)

    EmployeeID := uint(1)

    t.Run("Pass All", func(t *testing.T) {
        chat := entity.Chat{
            SendMassage: "เทสส่งข้อความ", // ค่านี้ควรผ่าน
            TimeSend:    time.Now(),
            EmployeeID:  EmployeeID,
        }

        ok, err := govalidator.ValidateStruct(chat)
        if !ok {
            t.Logf("Validation failed: %v", err)
        }

        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}

func TestChatValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	EmployeeID := uint(1)

	t.Run("Fail when SendMassage is empty", func(t *testing.T) {
		chat := entity.Chat{
			SendMassage: "",
			TimeSend:    time.Now(),
			EmployeeID:  EmployeeID,
		}
	
		ok, err := govalidator.ValidateStruct(chat)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
	
		g.Expect(ok).To(BeFalse())
		g.Expect(err).ToNot(BeNil())
		g.Expect(err.Error()).To(ContainSubstring("Massage is required")) // เปลี่ยนข้อความที่คาดหวัง
	})	
}
