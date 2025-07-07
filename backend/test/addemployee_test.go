package unit

import (
	"fmt"
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut67/team18/entity"
)


func ValidatePhonNumber() {

	govalidator.CustomTypeTagMap.Set("stringlength", govalidator.CustomTypeValidator(func(i interface{}, context interface{}) bool {
        str, ok := i.(string)
        if !ok {
            return false
        }
    
        // context คาดว่าจะเป็น string ที่ระบุช่วง เช่น "10|20"
        params, ok := context.(string)
        if !ok {
            return false
        }
    
        // อ่านค่าขั้นต่ำ (min) และสูงสุด (max) จาก params
        var min, max int
        _, err := fmt.Sscanf(params, "%d|%d", &min, &max)
        if err != nil {
            return false
        }
    
        // ตรวจสอบความยาวของ string
        return len(str) >= min && len(str) <= max
    }))
    
}

func TestUsername(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("validation for missing Username", func(t *testing.T) {
		user := entity.User{
			Username:   "", // ผิดตรงนี้
			Password:   "123",    
			Email:      "joey@gmail.com",   
			FirstName:  "Joey",    
			LastName:   "Hamming",    
			Birthday:   time.Now().AddDate(-5, 0, 0),
			Profile:    "profile1.jpg",    
			PhoneNumber: "0587485698",    
			UserRoleID: 1,
			GenderID:   1,
		}
	
		// ok, err := govalidator.ValidateStruct(user)
        ok, err := govalidator.ValidateStruct(user)
		if !ok {
			t.Logf("Validation failed: %v", err)
		}
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Username is required"))
	})
	

	t.Run("Username is valid", func(t *testing.T) {
		user := entity.User{
			Username:   "Joey007", 
			Password:   "123",    
			Email:      "joey@gmail.com",   
			FirstName:  "Joey",    
			LastName:   "Hamming",    
			Birthday:   time.Now().AddDate(-5, 0, 0),
			Profile:    "profile1.jpg",    
			PhoneNumber: "0587485698",    
			UserRoleID: 1,
			GenderID:   1,
		}

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestPassword(t *testing.T) {
    // RegisterFailHandler(Fail) // ต้องเพิ่มบรรทัดนี้เพื่อเชื่อม Gomega กับ testing.T
    g := NewGomegaWithT(t)

    t.Run("validation for missing Password", func(t *testing.T) {
        user := entity.User{
            Username:   "Joey007",
            Password:   "", //ผิดตรงนี้
            Email:      "joey@gmail.com",
            FirstName:  "Joey",
            LastName:   "Hamming",
            Birthday:   time.Now().AddDate(-5, 0, 0),
            Profile:    "profile1.jpg",
            PhoneNumber: "0587485698",
            UserRoleID: 1,
            GenderID:   1,
        }

        ok, err := govalidator.ValidateStruct(user)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("Password is required"))
    })

    t.Run("Password is valid", func(t *testing.T) {
        user := entity.User{
            Username:   "Joey007",
            Password:   "123",
            Email:      "joey@gmail.com",
            FirstName:  "Joey",
            LastName:   "Hamming",
            Birthday:   time.Now().AddDate(-5, 0, 0),
            Profile:    "profile1.jpg",
            PhoneNumber: "0587485698",
            UserRoleID: 1,
            GenderID:   1,
        }

        ok, err := govalidator.ValidateStruct(user)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}



func TestEmail(t *testing.T) {
	// RegisterFailHandler(Fail)
	g := NewGomegaWithT(t)

	t.Run("validation for missing Email", func(t *testing.T) {
		user := entity.User{
			Username:   "Joey007",    
			Password:   "123",    
			Email:      "",   //ผิดตรงนี้
			FirstName:  "Joey",    
			LastName:   "Hamming",    
			Birthday:   time.Now().AddDate(-5, 0, 0),
			Profile:    "profile1.jpg",    
			PhoneNumber: "0587485698",    
			UserRoleID: 1,
			GenderID:   1,
		}

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Email is required"))
	})

	t.Run("validation Email for pattern is not true ", func(t *testing.T) {
		user := entity.User{
			Username:   "Joey007",    
			Password:   "123",    
			Email:      "joeygmailcom",   // ผิดตรงนี้
			FirstName:  "Joey",    
			LastName:   "Hamming",    
			Birthday:   time.Now().AddDate(-5, 0, 0),
			Profile:    "profile1.jpg",    
			PhoneNumber: "0587485698",    
			UserRoleID: 1,
			GenderID:   1,
		}
	
		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())  // ตรวจสอบว่า validation ล้มเหลว
		g.Expect(err).NotTo(BeNil())  // ตรวจสอบว่า error ไม่เป็น nil
		
		// ใช้ข้อความ error ที่เราคาดหวังตรงๆ
		g.Expect(err.Error()).To(Equal("Email format is invalid"))
	})
	
	t.Run("Email is valid", func(t *testing.T) {
		user := entity.User{
			Username:   "Joey007", 
			Password:   "123",    
			Email:      "joey@gmail.com",   
			FirstName:  "Joey",    
			LastName:   "Hamming",    
			Birthday:   time.Now().AddDate(-5, 0, 0),
			Profile:    "profile1.jpg",    
			PhoneNumber: "0587485698",    
			UserRoleID: 1,
			GenderID:   1,
		}

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestFirstName(t *testing.T) {
    g := NewGomegaWithT(t)

    t.Run("validation for missing FirstName", func(t *testing.T) {
        user := entity.User{
            Username:   "Joey007",
            Password:   "123",
            Email:      "joey@gmail.com",
            FirstName:  "",  // ผิดตรงนี้
            LastName:   "Hamming",
            Birthday:   time.Now().AddDate(-5, 0, 0),
            Profile:    "profile1.jpg",
            PhoneNumber: "0587485698",
            UserRoleID: 1,
            GenderID:   1,
        }

        ok, err := govalidator.ValidateStruct(user)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("FirstName is required"))
    })

    t.Run("FirstName is valid", func(t *testing.T) {
        user := entity.User{
            Username:   "Joey007",
            Password:   "123",
            Email:      "joey@gmail.com",
            FirstName:  "Joey",
            LastName:   "Hamming",
            Birthday:   time.Now().AddDate(-5, 0, 0),
            Profile:    "profile1.jpg",
            PhoneNumber: "0587485698",
            UserRoleID: 1,
            GenderID:   1,
        }

        ok, err := govalidator.ValidateStruct(user)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}

func TestLastName(t *testing.T) {
    g := NewGomegaWithT(t)

    t.Run("validation for missing LastName", func(t *testing.T) {
        user := entity.User{
            Username:   "Joey007",
            Password:   "123",
            Email:      "joey@gmail.com",
            FirstName:  "Joey",
            LastName:   "", // ผิดตรงนี้
            Birthday:   time.Now().AddDate(-5, 0, 0),
            Profile:    "profile1.jpg",
            PhoneNumber: "0587485698",
            UserRoleID: 1,
            GenderID:   1,
        }

        ok, err := govalidator.ValidateStruct(user)
        g.Expect(ok).To(BeFalse())
        g.Expect(err).ToNot(BeNil())
        g.Expect(err.Error()).To(Equal("LastName is required"))
    })

    t.Run("LastName is valid", func(t *testing.T) {
        user := entity.User{
            Username:   "Joey007",
            Password:   "123",
            Email:      "joey@gmail.com",
            FirstName:  "Joey",
            LastName:   "Hamming",
            Birthday:   time.Now().AddDate(-5, 0, 0),
            Profile:    "profile1.jpg",
            PhoneNumber: "0587485698",
            UserRoleID: 1,
            GenderID:   1,
        }

        ok, err := govalidator.ValidateStruct(user)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}


func TestPhoneNumber(t *testing.T) {
    g := NewGomegaWithT(t)

    t.Run("validation for missing PhoneNumber", func(t *testing.T) {
        user := entity.User{
            Username:   "Joey007",    
            Password:   "123",    
            Email:      "joey@gmail.com",   
            FirstName:  "Joey",    
            LastName:   "Hamming",    
            Birthday:   time.Now().AddDate(-5, 0, 0),
            Profile:    "profile1.jpg",    
            PhoneNumber: "",  // ผิดตรงนี้  
            UserRoleID: 1,
            GenderID:   1,
        }

        ok, err := govalidator.ValidateStruct(user)
        g.Expect(ok).NotTo(BeTrue())
        g.Expect(err).NotTo(BeNil())
        g.Expect(err.Error()).To(Equal("PhoneNumber is required"))
    })

    t.Run("PhoneNumber is valid", func(t *testing.T) {
        user := entity.User{
            Username:   "Joey007", 
            Password:   "123",    
            Email:      "joey@gmail.com",   
            FirstName:  "Joey",    
            LastName:   "Hamming",    
            Birthday:   time.Now().AddDate(-5, 0, 0),
            Profile:    "profile1.jpg",    
            PhoneNumber: "0587485698",    
            UserRoleID: 1,
            GenderID:   1,
        }

        ok, err := govalidator.ValidateStruct(user)
        g.Expect(ok).To(BeTrue())
        g.Expect(err).To(BeNil())
    })
}