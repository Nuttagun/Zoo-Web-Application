package config

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/sut67/team18/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var db *gorm.DB

type CustomLogger struct{}

func (l *CustomLogger) LogMode(level logger.LogLevel) logger.Interface {
	return l
}

func (l *CustomLogger) Info(ctx context.Context, msg string, args ...interface{}) {}

func (l *CustomLogger) Warn(ctx context.Context, msg string, args ...interface{}) {}

func (l *CustomLogger) Error(ctx context.Context, msg string, args ...interface{}) {
	if !strings.Contains(msg, "record not found") {
		log.Printf(msg, args...)
	}
}

func (l *CustomLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
}

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("Zootopia.db?cache=shared"), &gorm.Config{
		Logger: &CustomLogger{},
	})

	if err != nil {
		panic("failed to connect database")
	}

	fmt.Println("connected database")
	db = database
}

func SetupDatabase() {

	db.AutoMigrate(
		&entity.Animal{},
		&entity.Sex{},
		&entity.Behavioral{},
		&entity.Biological{},
		&entity.HealthAnimal{},
		&entity.Employee{},
		&entity.Habitat{},
		&entity.Event{},
		&entity.Work{},
		&entity.FoodRequisition{},
		&entity.FoodRequisitionDetail{},
		&entity.Report{},
		&entity.Zone{},
		&entity.Like{},
		&entity.Review{},
		&entity.Calendar{},
		&entity.User{},
		&entity.Genders{},
		&entity.UserRoles{},
		&entity.Booking{},
		&entity.Rent{},
		&entity.TicketBooked{},
		&entity.TicketGeneration{},
		&entity.Ticket{},
		&entity.TicketType{},
		&entity.BookingZoo{},
		&entity.VehicleType{},
		&entity.Vehicle{},
		&entity.VehicleRent{},
		&entity.VehicleStatus{},

		&entity.TypePaymentProduct{},
		&entity.ShelfZone{},
		&entity.Product{},
		&entity.PaymentProduct{},
		&entity.ListProductSale{},
		&entity.OrderReceiving{},
		&entity.ListReceiving{},
		&entity.ProductDisposal{},
		&entity.PaymentTicket{},

		&entity.Medicalrecord{},
		&entity.Treatment{},
		&entity.Prescription{},
		&entity.Medicine{},
		&entity.MedicineType{},
		&entity.PrescriptionMedicine{},
		&entity.StockOfFood{},
		&entity.ContainerOfFood{},
		&entity.CatagoryOfFood{},

		&entity.Promotion{},
		&entity.PromotionStatus{},
		&entity.PromotionCategory{},
		&entity.Condition{},
		&entity.Chat{},
	)

	var count int64
	db.Model(&entity.User{}).Count(&count)
	if count == 0 {

		db.Create(&entity.TypePaymentProduct{TypePayment: "QRCode Payment"})
		db.Create(&entity.TypePaymentProduct{TypePayment: "Cash Payment"})

		/******************************************/

		db.Create(&entity.PromotionStatus{SName: "พร้อมใช้งาน"})
		db.Create(&entity.PromotionStatus{SName: "ไม่พร้อมใช้งาน"})
		db.Create(&entity.PromotionStatus{SName: "กำลังปรับปรุง"})

		MaxValue1 := uint(1)
		MaxValue2 := uint(2)
		ZeroValue0 := uint(0)
		db.Create(&entity.Condition{ConName: "มาคนเดียวเป็นชายโสด/หญิงโสด", MinChild: 0, MaxChild: &ZeroValue0, MinAdult: 1, MaxAdult: &MaxValue1, MinOther: 0, MaxOther: &ZeroValue0})
		db.Create(&entity.Condition{ConName: "มาเป็นคู่", MinChild: 0, MaxChild: &ZeroValue0, MinAdult: 2, MaxAdult: &MaxValue2, MinOther: 0, MaxOther: &ZeroValue0})
		db.Create(&entity.Condition{ConName: "มาเป็นครอบครัว", MinChild: 1, MaxChild: nil, MinAdult: 2, MaxAdult: nil, MinOther: 0, MaxOther: nil})

		db.Create(&entity.PromotionCategory{CName: "ตั๋วลดราคา"})
		db.Create(&entity.PromotionCategory{CName: "ตั๋วฟรี"})

		valentineDate := time.Date(2025, 2, 14, 0, 0, 0, 0, time.Local)
		valentineEndDate := time.Date(2025, 2, 14, 23, 59, 59, 0, time.Local)

		StartNewYearDate := time.Date(2024, 12, 31, 0, 0, 0, 0, time.Local)
		EndNewYearDate := time.Date(2025, 1, 5, 23, 59, 59, 0, time.Local)

		//คิดว่าจะทำโปรวัน valentine วันพ่อ วันแม่ วันเด็ก
		//ถ้าเวลาพอคิดว่าจะทำพวกโปรเกี่ยวกับคน
		//ถ้าเหลือมากกว่านี้ก็จะทำตรง พาหนะ ด้วย
		promotionValueID1 := uint(1) //
		promotionValueID2 := uint(2)
		promotionValueID3 := uint(3)
		db.Create(&entity.Promotion{PromotionName: "โปรคนโสด", StartDate: time.Now(), EndDate: time.Now().Add(24 * time.Hour), Discount: 10.00, Description: "ใช้กับคนที่มาคนเดียว(โสด)", NumberPromotionUse: 150, VisitDate: nil, EndVisitDate: nil, PromotionStatusID: &promotionValueID1, ConditionID: &promotionValueID1, PromotionCategoryID: &promotionValueID1, EmployeeID: &promotionValueID1})
		// db.Create(&entity.Promotion{PromotionName: "ครอบครัว", PromotionPicture: "uploads/PromotionPic.png", StartDate: time.Now(), EndDate: time.Now().Add(24 * time.Hour), Discount: 30.00, Description: "ใช้กับกลุ่มคนที่มาเป็นครอบครัว", NumberPromotionUse: 400, PromotionStatusID: &promotionValueID2, ConditionID: &promotionValueID2, PromotionCategoryID: &promotionValueID1, UserID: &promotionValueID1})
		db.Create(&entity.Promotion{PromotionName: "คู่รัก",  StartDate: time.Now(), EndDate: time.Now().Add(24 * time.Hour), Discount: 80.00, Description: "ใช้กับคู่รักที่มา 2 คนเป็นคู่", NumberPromotionUse: 1000, VisitDate: nil, EndVisitDate: nil, PromotionStatusID: &promotionValueID1, ConditionID: &promotionValueID2, PromotionCategoryID: &promotionValueID2, EmployeeID: &promotionValueID1})

		db.Create(&entity.Promotion{PromotionName: "ครอบครัว", StartDate: time.Now(), EndDate: time.Now().Add(24 * time.Hour), Discount: 20.00, Description: "ใช้กับครอบครัวที่มีเด็ก 1 คนและผู้ใหญ่ 2 คน", NumberPromotionUse: 1000, VisitDate: nil, EndVisitDate: nil, PromotionStatusID: &promotionValueID1, ConditionID: &promotionValueID3, PromotionCategoryID: &promotionValueID1, EmployeeID: &promotionValueID1})
		db.Create(&entity.Promotion{PromotionName: "โปรส่งท้ายปี",  StartDate: time.Now(), EndDate: time.Now().Add(24 * time.Hour), Discount: 50.00, Description: "โปรใช้ได้แค่กับวันปีใหม่ตั้งแต่วันที่ 25 ธ.ค. 2567- 5 ม.ค. 2568", NumberPromotionUse: 1000, VisitDate: &StartNewYearDate, EndVisitDate: &EndNewYearDate, PromotionStatusID: &promotionValueID1, ConditionID: nil, PromotionCategoryID: &promotionValueID1, EmployeeID: &promotionValueID1})
		db.Create(&entity.Promotion{PromotionName: "โปรวัน valentine", StartDate: time.Now(), EndDate: time.Now().Add(24 * time.Hour), Discount: 50.00, Description: "ใช้ได้กับวัน valentine ที่ตรงกับวันที่ 14 ก.พ. 2568 - 15 ก.พ. 2568 ", NumberPromotionUse: 1000, VisitDate: &valentineDate, EndVisitDate: &valentineEndDate, PromotionStatusID: &promotionValueID1, ConditionID: nil, PromotionCategoryID: &promotionValueID1, EmployeeID: &promotionValueID1})
	}

	GenderMale := entity.Genders{Gender: "Male"}
	GenderFemale := entity.Genders{Gender: "Female"}

	db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})

	AdminRole := entity.UserRoles{RoleName: "Admin"}
	UserRole := entity.UserRoles{RoleName: "User"}
	ZookeeperRole := entity.UserRoles{RoleName: "Zookeeper"}
	VeterinarianRole := entity.UserRoles{RoleName: "Veterinarian"}
	ZooSaleRole := entity.UserRoles{RoleName: "ZooSale"}
	VehicleManagerRole := entity.UserRoles{RoleName: "VehicleManager"}

	db.FirstOrCreate(&AdminRole, &entity.UserRoles{RoleName: "Admin"})
	db.FirstOrCreate(&UserRole, &entity.UserRoles{RoleName: "User"})
	db.FirstOrCreate(&ZookeeperRole, &entity.UserRoles{RoleName: "Zookeeper"})
	db.FirstOrCreate(&VeterinarianRole, &entity.UserRoles{RoleName: "Veterinarian"})
	db.FirstOrCreate(&ZooSaleRole, &entity.UserRoles{RoleName: "ZooSale"})
	db.FirstOrCreate(&VehicleManagerRole, &entity.UserRoles{RoleName: "VehicleManager"})

	SexMale := entity.Sex{Sex: "Male"}
	SexFemale := entity.Sex{Sex: "Female"}

	db.FirstOrCreate(&SexMale, &entity.Sex{Sex: "Male"})
	db.FirstOrCreate(&SexFemale, &entity.Sex{Sex: "Female"})

	StatusNormal := entity.HealthAnimal{Status: "Normal"}
	StatusSick := entity.HealthAnimal{Status: "Sick"}
	StatusDeceased := entity.HealthAnimal{Status: "Deceased"}

	db.FirstOrCreate(&StatusNormal, &entity.HealthAnimal{Status: "Normal"})
	db.FirstOrCreate(&StatusSick, &entity.HealthAnimal{Status: "Sick"})
	db.FirstOrCreate(&StatusDeceased, &entity.HealthAnimal{Status: "Deceased"})

	Behavioral1 := entity.Behavioral{Behavioral: "Carnivores"}
	Behavioral2 := entity.Behavioral{Behavioral: "Herbivores"}
	Behavioral3 := entity.Behavioral{Behavioral: "Omnivores"}
	db.FirstOrCreate(&Behavioral1, &entity.Behavioral{Behavioral: "Carnivores"})
	db.FirstOrCreate(&Behavioral2, &entity.Behavioral{Behavioral: "Herbivores"})
	db.FirstOrCreate(&Behavioral3, &entity.Behavioral{Behavioral: "Omnivores"})

	Biological1 := entity.Biological{Biological: "Mammalian"}
	Biological2 := entity.Biological{Biological: "Aves"}
	Biological3 := entity.Biological{Biological: "Reptilia"}
	Biological4 := entity.Biological{Biological: "Amphibia"}
	Biological5 := entity.Biological{Biological: "Fish"}
	db.FirstOrCreate(&Biological1, &entity.Biological{Biological: "Mammalian"})
	db.FirstOrCreate(&Biological2, &entity.Biological{Biological: "Aves"})
	db.FirstOrCreate(&Biological3, &entity.Biological{Biological: "Reptilia"})
	db.FirstOrCreate(&Biological4, &entity.Biological{Biological: "Amphibia"})
	db.FirstOrCreate(&Biological5, &entity.Biological{Biological: "Fish"})

	zone1 := entity.Zone{
		Zone:        "Rainforest",
		Description: "Tropical rainforest with a variety of wildlife.",
		Picture:     "uploads/rainForest.png",
	}
	zone2 := entity.Zone{
		Zone:        "Savannah",
		Description: "Expansive savannah with African wildlife.",
		Picture:     "uploads/savannah.jpg",
	}
	zone3 := entity.Zone{
		Zone:        "Oceanarium",
		Description: "Aquatic animals and marine life exhibits.",
		Picture:     "uploads/underSea.jpg",
	}

	db.FirstOrCreate(&zone1, entity.Zone{Zone: "Rainforest"})
	db.FirstOrCreate(&zone2, entity.Zone{Zone: "Savannah"})
	db.FirstOrCreate(&zone3, entity.Zone{Zone: "Oceanarium"})

	habitat1 := entity.Habitat{
		Name:       "Lion's Den",
		Size:       400.00,
		Capacity:   8,
		Picture:    "uploads/lionHabitat.jpg",
		ZoneID:     zone1.ID,
		EmployeeID: 2,
	}

	habitat2 := entity.Habitat{
		Name:       "Bird Aviary",
		Size:       100.00,
		Capacity:   8,
		Picture:    "uploads/parrotHabitat.jpg",
		ZoneID:     zone1.ID,
		EmployeeID: 2,
	}

	habitat3 := entity.Habitat{
		Name:       "Tortoise",
		Size:       50.00,
		Capacity:   8,
		Picture:    "uploads/turtleHabitat.jpg",
		ZoneID:     zone3.ID,
		EmployeeID: 2,
	}

	habitat4 := entity.Habitat{
		Name:       "River Otter Oasis",
		Size:       200.00,
		Capacity:   8,
		Picture:    "uploads/otterHabitat.jpeg",
		ZoneID:     zone3.ID,
		EmployeeID: 2,
	}

	habitat5 := entity.Habitat{
		Name:       "Aquatic Enclosure",
		Size:       20.00,
		Capacity:   10,
		Picture:    "uploads/clowfishHabitat.jpg",
		ZoneID:     zone3.ID,
		EmployeeID: 2,
	}

	db.FirstOrCreate(&habitat1, entity.Habitat{Name: "Lion's Den"})
	db.FirstOrCreate(&habitat2, entity.Habitat{Name: "Bird Aviary"})
	db.FirstOrCreate(&habitat3, entity.Habitat{Name: "Tortoise"})
	db.FirstOrCreate(&habitat4, entity.Habitat{Name: "River Otter Oasis"})
	db.FirstOrCreate(&habitat5, entity.Habitat{Name: "Aquatic Enclosure"})

	Employee := uint(2)

	Animal1 := entity.Animal{
		Name:        "Lion",
		Description: "The lion, often referred to as the king of the jungle,is a large feline species native to Africa and parts of Asia, known for its majestic mane and powerful presence",
		Weight:      190.5,
		Height:      200.0,
		Birthplace:  "Africa",
		BirthDay:    time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Picture:     "uploads/lion.jpg",
		Note:        "Active and healthy",

		SexID:          SexMale.ID,
		BiologicalID:   Biological1.ID,
		BehavioralID:   Behavioral1.ID,
		HabitatID:      habitat2.ID,
		HealthAnimalID: 2,
		EmployeeID:     2,
	}

	Animal2 := entity.Animal{
		Name:        "Anaconda",
		Description: "The anaconda, one of the largest snake species in the world, is a powerful predator found in the rainforests of South America, thriving in rivers and swamps where it hunts a variety of prey",
		Weight:      0.6,
		Height:      30.0,
		Birthplace:  "South America",
		BirthDay:    time.Date(2020, 3, 10, 0, 0, 0, 0, time.UTC),
		Picture:     "uploads/parrot.jpg",
		Note:        "Lively and playful",

		SexID:          SexFemale.ID,
		BiologicalID:   Biological2.ID,
		BehavioralID:   Behavioral2.ID,
		HabitatID:      habitat1.ID,
		HealthAnimalID: 1,
		EmployeeID:     2,
	}

	Animal3 := entity.Animal{
		Name:        "Penguin ",
		Description: "Penguins are flightless seabirds primarily found in the Southern Hemisphere, known for their distinctive black-and-white plumage, waddling gait, and remarkable swimming abilities",
		Weight:      195.0,
		Height:      70.0,
		Birthplace:  "Galapagos Islands",
		BirthDay:    time.Date(1978, 9, 16, 0, 0, 0, 0, time.UTC),
		Picture:     "uploads/turtle.jpeg",
		Note:        "Kind and healthy",

		SexID:          SexMale.ID,
		BiologicalID:   Biological3.ID,
		BehavioralID:   Behavioral2.ID,
		HabitatID:      habitat3.ID,
		HealthAnimalID: 2,
		EmployeeID:     2,
	}

	Animal4 := entity.Animal{
		Name:        "Shark",
		Description: "Sharks are apex predators found in oceans worldwide, renowned for their streamlined bodies, sharp teeth, and unparalleled hunting skills, playing a vital role in maintaining marine ecosystems",
		Weight:      19.5,
		Height:      100.0,
		Birthplace:  "Freshwater",
		BirthDay:    time.Date(2021, 8, 31, 0, 0, 0, 0, time.UTC),
		Picture:     "uploads/otter.jpg",
		Note:        "Lively and playful",

		SexID:          SexFemale.ID,
		BiologicalID:   Biological4.ID,
		BehavioralID:   Behavioral1.ID,
		HabitatID:      habitat3.ID,
		HealthAnimalID: 1,
		EmployeeID:     2,
	}

	Animal5 := entity.Animal{
		Name:        "Cheetah",
		Description: "The cheetah, the fastest land animal, is a sleek and agile predator found in Africa and parts of Asia, renowned for its spotted coat and ability to reach incredible speeds during a hunt.",
		Weight:      0.2,
		Height:      10.0,
		Birthplace:  "Ocean",
		BirthDay:    time.Date(2024, 10, 28, 0, 0, 0, 0, time.UTC),
		Picture:     "uploads/Clowfish.jpg",
		Note:        "Colorful and Healthy",

		SexID:          SexFemale.ID,
		BiologicalID:   Biological5.ID,
		BehavioralID:   Behavioral3.ID,
		HabitatID:      habitat3.ID,
		HealthAnimalID: 3,
		EmployeeID:     2,
	}

	Animal6 := entity.Animal{
		Name:        "Red panda",
		Description: "The red panda, a small and adorable mammal native to the Himalayas and southwestern China, is known for its reddish-brown fur, bushy tail, and love for bamboo, spending much of its time climbing trees and foraging.",
		Weight:      30.23,
		Height:      20.0,
		Birthplace:  "China",
		BirthDay:    time.Date(2024, 10, 28, 0, 0, 0, 0, time.UTC),
		Picture:     "uploads/RedPanda.jpg",
		Note:        "Red panda and Healthy",

		SexID:          SexFemale.ID,
		BiologicalID:   Biological5.ID,
		BehavioralID:   Behavioral3.ID,
		HabitatID:      habitat3.ID,
		HealthAnimalID: 1,
		EmployeeID:     3,
	}

	Animal7 := entity.Animal{
		Name:        "Crocodile ",
		Description: "The crocodile, a powerful reptile found in tropical regions worldwide, is known for its armored body, sharp teeth, and strong jaws, spending its time in rivers and wetlands as both a stealthy predator and an apex hunter.",
		Weight:      200.5,
		Height:      50.25,
		Birthplace:  "Sea in Amazon",
		BirthDay:    time.Date(2024, 10, 28, 0, 0, 0, 0, time.UTC),
		Picture:     "uploads/crocodiel.jpg",
		Note:        "Crocodile and Healthy",

		SexID:          SexFemale.ID,
		BiologicalID:   Biological5.ID,
		BehavioralID:   Behavioral3.ID,
		HabitatID:      habitat3.ID,
		HealthAnimalID: 1,
		EmployeeID:     2,
	}

	Animal8 := entity.Animal{
		Name:        "Dear",
		Description: "The deer, a graceful herbivore found in forests and grasslands around the world, is known for its slender build, elegant antlers, and gentle demeanor, often seen grazing peacefully or moving quietly through its natural habitat.",
		Weight:      80.65,
		Height:      160.74,
		Birthplace:  "Forest in Forida",
		BirthDay:    time.Date(2024, 10, 28, 0, 0, 0, 0, time.UTC),
		Picture:     "uploads/dear.jpg",
		Note:        "Dear and Healthy",

		SexID:          SexFemale.ID,
		BiologicalID:   Biological5.ID,
		BehavioralID:   Behavioral3.ID,
		HabitatID:      habitat3.ID,
		HealthAnimalID: 1,
		EmployeeID:     2,
	}

	db.FirstOrCreate(&Animal1, entity.Animal{Name: "Lion"})
	db.FirstOrCreate(&Animal2, entity.Animal{Name: "Anaconda"})
	db.FirstOrCreate(&Animal3, entity.Animal{Name: "Penguin"})
	db.FirstOrCreate(&Animal4, entity.Animal{Name: "Shark"})
	db.FirstOrCreate(&Animal5, entity.Animal{Name: "Cheetah"})
	db.FirstOrCreate(&Animal6, entity.Animal{Name: "Red panda"})
	db.FirstOrCreate(&Animal7, entity.Animal{Name: "Crocodile"})
	db.FirstOrCreate(&Animal8, entity.Animal{Name: "Dear"})

	report1 := entity.Report{
		Title:       "Lion's illess",
		Description: "The lion is sick.",
		ReportDate:  time.Date(2024, 12, 20, 8, 0, 0, 0, time.UTC),
		StatusVet:   "pending",
		Picture:     "uploads/lion_illess.jpeg",

		AnimalID:   Animal1.ID,
		EmployeeID: 2,
	}

	report2 := entity.Report{
		Title:       "Turtle's illess",
		Description: "Turtle's shell is broken",
		ReportDate:  time.Date(2024, 12, 20, 8, 0, 0, 0, time.UTC),
		StatusVet:   "pending",
		Picture:     "uploads/turtle_illes.png",

		AnimalID:   Animal3.ID,
		EmployeeID: 2,
	}

	db.FirstOrCreate(&report1, entity.Report{AnimalID: Animal1.ID})
	db.FirstOrCreate(&report2, entity.Report{AnimalID: Animal2.ID})

	initialCalendars := []entity.Calendar{
		{
			Title:      "Animal Feeding",
			CalendarDate:  time.Date(2024, 12, 20, 8, 0, 0, 0, time.UTC),
			AllDay:     true,
			EmployeeID: &Employee,
		},
		{
			Title:      "Health Checkup",
			CalendarDate:  time.Date(2024, 12, 22, 10, 0, 0, 0, time.UTC),
			AllDay:     true,
			EmployeeID: &Employee,
		},
	}

	for _, calendar := range initialCalendars {
		db.FirstOrCreate(&calendar, entity.Calendar{Title: calendar.Title, CalendarDate: calendar.CalendarDate})
	}

	birthDayStr, _ := time.Parse("2006-01-02", "1999-01-01")

	Admin := entity.User{
		Username:   "admin",
		FirstName:  "Kanyapron",
		LastName:   "KD",
		Email:      "Kanyapron@gmail.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile1.jpg",
		GenderID:   1,
		UserRoleID: 1,
	}
	db.FirstOrCreate(&Admin, entity.User{Username: "admin"})

	Zookeeper := entity.User{
		Username:   "zookeeper",
		FirstName:  "Tawunchai",
		LastName:   "Burakhon",
		Email:      "tawunchaien@gmail.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile8.jpeg",
		GenderID:   1,
		UserRoleID: 3,
	}
	db.FirstOrCreate(&Zookeeper, entity.User{Username: "zookeeper"})

	Veterinarian := entity.User{
		Username:   "vet",
		FirstName:  "Nuttagun",
		LastName:   "Samanjai",
		Email:      "Nuttagun@gmail.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile9.jpeg",
		GenderID:   1,
		UserRoleID: 4,
	}
	db.FirstOrCreate(&Veterinarian, entity.User{Username: "vet"})

	ZooSale := entity.User{
		Username:   "zoosale",
		FirstName:  "Rattaphon",
		LastName:   "Phonthaisong",
		Email:      "Rattaphon@gmail.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile7.jpeg",
		GenderID:   1,
		UserRoleID: 5,
	}
	db.FirstOrCreate(&ZooSale, entity.User{Username: "zoosale"})

	VehicleManager := entity.User{
		Username:   "vehiclemanager",
		FirstName:  "Isabella",
		LastName:   "Taylor",
		Email:      "bella@gmail.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile2.jpeg",
		GenderID:   1,
		UserRoleID: 6,
	}
	db.FirstOrCreate(&VehicleManager, entity.User{Username: "vehiclemanager"})

	User1 := entity.User{
		Username:   "user1",
		FirstName:  "Janis",
		LastName:   "Green",
		Email:      "janis.green@example.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile6.jpg",
		GenderID:   1,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User1, entity.User{Username: "user1"})

	User2 := entity.User{
		Username:   "user2",
		FirstName:  "Chris",
		LastName:   "Taylor",
		Email:      "chris.taylor@example.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile5.jpeg",
		GenderID:   2,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User2, entity.User{Username: "user2"})

	User3 := entity.User{
		Username:   "user3",
		FirstName:  "Alex",
		LastName:   "Smith",
		Email:      "alex.smith@example.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile4.jpeg",
		GenderID:   1,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User3, entity.User{Username: "user3"})

	User4 := entity.User{
		Username:   "user4",
		FirstName:  "Emily",
		LastName:   "Johnson",
		Email:      "emily.johnson@example.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile3.jpg",
		GenderID:   2,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User4, entity.User{Username: "user4"})

	User5 := entity.User{
		Username:   "user5",
		FirstName:  "Michael",
		LastName:   "Brown",
		Email:      "michael.brown@example.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile2.jpeg",
		GenderID:   1,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User5, entity.User{Username: "user5"})

	User6 := entity.User{
		Username:   "user6",
		FirstName:  "Sophia",
		LastName:   "Davis",
		Email:      "sophia.davis@example.com",
		Password:   "123",
		Birthday:   birthDayStr,
		Profile:    "uploads/profile/profile1.jpg",
		GenderID:   2,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User6, entity.User{Username: "user6"})

	eid1 := uint(1)
	Employee1 := entity.Employee{
		Bio:        "Admid ",
		Experience: "5 years of experience as a admin with Tesla company",
		Education:  "Master degree of marketting at Harvard university",
		Salary:     25000,
		FullTime:   true,
		UserID:     &eid1,
	}
	db.FirstOrCreate(&Employee1, entity.Employee{UserID: &eid1})

	eid2 := uint(2)
	Employee2 := entity.Employee{
		Bio:        "Zookeeper professional specialized in exotic animals.",
		Experience: "5 years of experience as a Zookeeper for zoo animals.",
		Education:  "Zookeeper SUT.",
		Salary:     25000,
		FullTime:   false,
		UserID:     &eid2,
	}
	db.FirstOrCreate(&Employee2, entity.Employee{UserID: &eid2})

	eid3 := uint(3)
	Employee3 := entity.Employee{
		Bio:        "Veterinary professional specialized in exotic animals.",
		Experience: "3 years of experience as a veterinarian for zoo animals.",
		Education:  "Doctor of Veterinary Medicine.",
		Salary:     50000,
		FullTime:   true,
		UserID:     &eid3,
	}
	db.FirstOrCreate(&Employee3, entity.Employee{UserID: &eid3})

	usreidzoosale := uint(4)
	EmployeeZoosale := entity.Employee{
		Bio:        "-----------",
		Experience: "-----------",
		Education:  "-----------",
		Salary:     24512,
		FullTime:   true,
		UserID:     &usreidzoosale,
	}
	db.FirstOrCreate(&EmployeeZoosale, entity.Employee{UserID: &usreidzoosale})

	eid5 := uint(5)
	Employee5 := entity.Employee{
		Bio:        "Experienced gennerral manager 3 company",
		Experience: "5 years of experience working in maneger with SCG.",
		Education:  "Master's degree in Management at Yeal University.",
		Salary:     30000,
		FullTime:   true,
		UserID:     &eid5,
	}
	db.FirstOrCreate(&Employee5, entity.Employee{UserID: &eid5})

	uid1 := uint(1)
	uid2 := uint(2)
	uid3 := uint(3)
	uid4 := uint(4)

	Review1 := &entity.Review{
		Rating:     5,
		Comment:    "The zoo was incredibly well-maintained, and the animals looked happy and healthy. The staff were friendly and knowledgeable, always ready to share interesting facts about the animals. I loved the interactive exhibits, especially the feeding sessions with the giraffes! Its a great place for families, and theres something for everyone to enjoy. I can't wait to visit again!",
		ReviewDate: time.Now(),
		Picture:    "uploads/zooEvent1.jpg",
		UserID:     &uid1,
	}

	Review2 := &entity.Review{
		Rating:     4,
		Comment:    "The zoo had a wide variety of animals, and the staff were helpful. However, some areas felt overcrowded, and a few enclosures looked outdated. The food options were decent, but a bit overpriced. Its a nice place to visit, but it could be even better with a few updates",
		ReviewDate: time.Now(),
		Picture:    "uploads/zooEvent1.jpg",
		UserID:     &uid2,
	}

	Review3 := &entity.Review{
		Rating:     3,
		Comment:    "The animals were interesting, and the staff seemed to care about them. However, some enclosures felt too small, and the facilities could have been cleaner. The ticket price was a bit high for the experience provided. It was okay, but I wouldnt rush back.",
		ReviewDate: time.Now(),
		Picture:    "uploads/zooEvent1.jpg",
		UserID:     &uid3,
	}

	Review4 := &entity.Review{
		Rating:     2,
		Comment:    "The zoo was not well-maintained, and several exhibits were closed. Many enclosures seemed small and lacked enrichment for the animals. The staff were not very attentive, and the overall atmosphere felt uninviting. Unfortunately, I wouldnt recommend visiting.",
		ReviewDate: time.Now(),
		Picture:    "uploads/zooEvent1.jpg",
		UserID:     &uid4,
	}

	db.FirstOrCreate(Review1, &entity.Review{UserID: &uid1})
	db.FirstOrCreate(Review2, &entity.Review{UserID: &uid2})
	db.FirstOrCreate(Review3, &entity.Review{UserID: &uid3})
	db.FirstOrCreate(Review4, &entity.Review{UserID: &uid4})

	VehicleType1 := entity.VehicleType{VehicleType: "Bicycle", QuantityVehicle: 6}
	VehicleType2 := entity.VehicleType{VehicleType: "Golf Cart", QuantityVehicle: 6}

	db.FirstOrCreate(&VehicleType1, &entity.VehicleType{VehicleType: "Bicycle"})
	db.FirstOrCreate(&VehicleType2, &entity.VehicleType{VehicleType: "Golf Cart"})

	VehicleStatus1 := entity.VehicleStatus{VehicleStatus: "Available"}
	VehicleStatus2 := entity.VehicleStatus{VehicleStatus: "Unavailable"}
	VehicleStatus3 := entity.VehicleStatus{VehicleStatus: "Maintenance"}

	db.FirstOrCreate(&VehicleStatus1, &entity.VehicleStatus{VehicleStatus: "Available"})
	db.FirstOrCreate(&VehicleStatus2, &entity.VehicleStatus{VehicleStatus: "Unavailable"})
	db.FirstOrCreate(&VehicleStatus3, &entity.VehicleStatus{VehicleStatus: "Maintenance"})

	VehicleColor1 := entity.VehicleColor{Name: "White"}
	VehicleColor2 := entity.VehicleColor{Name: "Black"}
	VehicleColor3 := entity.VehicleColor{Name: "Gray"}
	VehicleColor4 := entity.VehicleColor{Name: "Blue"}
	VehicleColor5 := entity.VehicleColor{Name: "Red"}
	VehicleColor6 := entity.VehicleColor{Name: "Brown"}
	VehicleColor7 := entity.VehicleColor{Name: "Purple"}
	VehicleColor8 := entity.VehicleColor{Name: "Green"}
	VehicleColor9 := entity.VehicleColor{Name: "Yellow"}
	VehicleColor10 := entity.VehicleColor{Name: "Orange"}
	VehicleColor11 := entity.VehicleColor{Name: "Pink"}
	VehicleColor12 := entity.VehicleColor{Name: "Silver"}

	db.FirstOrCreate(&VehicleColor1, &entity.VehicleColor{Name: "White"})
	db.FirstOrCreate(&VehicleColor2, &entity.VehicleColor{Name: "Black"})
	db.FirstOrCreate(&VehicleColor3, &entity.VehicleColor{Name: "Gray"})
	db.FirstOrCreate(&VehicleColor4, &entity.VehicleColor{Name: "Blue"})
	db.FirstOrCreate(&VehicleColor5, &entity.VehicleColor{Name: "Red"})
	db.FirstOrCreate(&VehicleColor6, &entity.VehicleColor{Name: "Brown"})
	db.FirstOrCreate(&VehicleColor7, &entity.VehicleColor{Name: "Purple"})
	db.FirstOrCreate(&VehicleColor8, &entity.VehicleColor{Name: "Green"})
	db.FirstOrCreate(&VehicleColor9, &entity.VehicleColor{Name: "Yellow"})
	db.FirstOrCreate(&VehicleColor10, &entity.VehicleColor{Name: "Orange"})
	db.FirstOrCreate(&VehicleColor11, &entity.VehicleColor{Name: "Pink"})
	db.FirstOrCreate(&VehicleColor12, &entity.VehicleColor{Name: "Silver"})

	Vehicle1 := entity.Vehicle{
		Name:         "B01",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        20,
		Description:  "for Children",
		Picture:      "uploads/vehicle/b01.png",

		VehicleColorID:  VehicleColor4.ID,
		VehicleStatusID: VehicleStatus2.ID,
		VehicleTypeID:   VehicleType1.ID,
		EmployeeID:      5,
	}

	Vehicle2 := entity.Vehicle{
		Name:         "G01",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        100,
		Description:  "for 2 people",
		Picture:      "uploads/vehicle/g01.png",

		VehicleColorID:  VehicleColor4.ID,
		VehicleStatusID: VehicleStatus3.ID,
		VehicleTypeID:   VehicleType2.ID,
		EmployeeID:      5,
	}

	Vehicle3 := entity.Vehicle{
		Name:         "B02",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        20,
		Description:  "for Children.",
		Picture:      "uploads/vehicle/b02.png",

		VehicleColorID:  VehicleColor5.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType1.ID,
		EmployeeID:      5,
	}

	Vehicle4 := entity.Vehicle{
		Name:         "B03",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        30,
		Description:  "for Adult",
		Picture:      "uploads/vehicle/b03.png",

		VehicleColorID:  VehicleColor2.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType1.ID,
		EmployeeID:      5,
	}

	Vehicle5 := entity.Vehicle{
		Name:         "G02",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        100,
		Description:  "for 2 people",
		Picture:      "uploads/vehicle/g02.png",

		VehicleColorID:  VehicleColor1.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType2.ID,
		EmployeeID:      5,
	}

	Vehicle6 := entity.Vehicle{
		Name:         "B04",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        20,
		Description:  "for Children",
		Picture:      "uploads/vehicle/b04.png",

		VehicleColorID:  VehicleColor12.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType1.ID,
		EmployeeID:      5,
	}

	Vehicle7 := entity.Vehicle{
		Name:         "B05",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        30,
		Description:  "for Adult",
		Picture:      "uploads/vehicle/b05.jpeg",

		VehicleColorID:  VehicleColor4.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType1.ID,
		EmployeeID:      5,
	}

	Vehicle8 := entity.Vehicle{
		Name:         "G03",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        120,
		Description:  "for 4 people",
		Picture:      "uploads/vehicle/g03.png",

		VehicleColorID:  VehicleColor5.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType2.ID,
		EmployeeID:      5,
	}

	Vehicle9 := entity.Vehicle{
		Name:         "B06",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        30,
		Description:  "for Adult",
		Picture:      "uploads/vehicle/b06.png",

		VehicleColorID:  VehicleColor5.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType1.ID,
		EmployeeID:      5,
	}

	Vehicle10 := entity.Vehicle{
		Name:         "G04",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        100,
		Description:  "for 2 people",
		Picture:      "uploads/vehicle/g04.jpg",

		VehicleColorID:  VehicleColor1.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType2.ID,
		EmployeeID:      5,
	}

	Vehicle11 := entity.Vehicle{
		Name:         "G05",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        120,
		Description:  "for 4 people",
		Picture:      "uploads/vehicle/g05.png",

		VehicleColorID:  VehicleColor3.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType2.ID,
		EmployeeID:      5,
	}

	Vehicle12 := entity.Vehicle{
		Name:         "G06",
		ReceivedDate: time.Date(2018, 5, 15, 0, 0, 0, 0, time.UTC),
		Price:        100,
		Description:  "for 2 people",
		Picture:      "uploads/vehicle/g06.jpeg",

		VehicleColorID:  VehicleColor5.ID,
		VehicleStatusID: VehicleStatus1.ID,
		VehicleTypeID:   VehicleType2.ID,
		EmployeeID:      5,
	}

	db.FirstOrCreate(&Vehicle1, entity.Vehicle{Name: "B01"})
	db.FirstOrCreate(&Vehicle2, entity.Vehicle{Name: "G01"})
	db.FirstOrCreate(&Vehicle3, entity.Vehicle{Name: "B02"})
	db.FirstOrCreate(&Vehicle4, entity.Vehicle{Name: "B03"})
	db.FirstOrCreate(&Vehicle5, entity.Vehicle{Name: "G02"})
	db.FirstOrCreate(&Vehicle6, entity.Vehicle{Name: "B04"})
	db.FirstOrCreate(&Vehicle7, entity.Vehicle{Name: "B05"})
	db.FirstOrCreate(&Vehicle8, entity.Vehicle{Name: "G03"})
	db.FirstOrCreate(&Vehicle9, entity.Vehicle{Name: "B06"})
	db.FirstOrCreate(&Vehicle10, entity.Vehicle{Name: "G04"})
	db.FirstOrCreate(&Vehicle11, entity.Vehicle{Name: "G05"})
	db.FirstOrCreate(&Vehicle12, entity.Vehicle{Name: "G06"})

	TicketGeneration1 := entity.TicketGeneration{Generation: "Child", Age: "6-15"}
	TicketGeneration2 := entity.TicketGeneration{Generation: "Adult", Age: "16-60"}
	TicketGeneration3 := entity.TicketGeneration{Generation: "Other", Age: "0-5 and 61+"}

	db.FirstOrCreate(&TicketGeneration1, &entity.TicketGeneration{Generation: "Child"})
	db.FirstOrCreate(&TicketGeneration2, &entity.TicketGeneration{Generation: "Adult"})
	db.FirstOrCreate(&TicketGeneration3, &entity.TicketGeneration{Generation: "Other"})

	var countMedicineType int64
	db.Model(&entity.MedicineType{}).Count(&countMedicineType)
	if countMedicineType == 0 {
		// เพิ่ม MedicineType เฉพาะเมื่อยังไม่มีข้อมูลในตาราง
		medicineTypes := []entity.MedicineType{
			{MedicineType: "ยาปฏิชีวนะสำหรับสัตว์"},
			{MedicineType: "ยาป้องกันและกำจัดปรสิต"},
			{MedicineType: "วัคซีนสำหรับสัตว์"},
			{MedicineType: "ยาลดการอักเสบและบรรเทาปวด"},
			{MedicineType: "ยารักษาปัญหาในระบบย่อยอาหาร"},
			{MedicineType: "ยาสำหรับการรักษาโรคผิวหนัง"},
			{MedicineType: "ยาสำหรับระบบทางเดินหายใจ"},
			{MedicineType: "ยาสำหรับโรคทางระบบสืบพันธุ์"},
			{MedicineType: "วิตามินและอาหารเสริม"},
		}
		for _, mType := range medicineTypes {
			db.Create(&mType)
		}
	}

	// ตรวจสอบยาในตารางก่อนเพิ่ม
	var medicineCount int64
	db.Model(&entity.Medicine{}).Count(&medicineCount)
	if medicineCount == 0 {
		expiryDateStr, _ := time.Parse("2006-01-02", "2026-06-30")
		expiryDateStr2, _ := time.Parse("2006-01-02", "2025-11-15")

		medicines := []entity.Medicine{
			{
				MedicineName:   "Cefazolin",
				Dosage:         "1 g",
				Stock:          50,
				ExpiryDate:     expiryDateStr,
				Price:          180.00,
				MedicineTypeID: 1,
			},
			{
				MedicineName:   "Moxidectin",
				Dosage:         "2 mg/ml",
				Stock:          120,
				ExpiryDate:     expiryDateStr2,
				Price:          200.00,
				MedicineTypeID: 2,
			},
		}

		for _, med := range medicines {
			db.Create(&med)
		}
	}

	ContainerFreeze := entity.ContainerOfFood{ContainerName: "ห้องเก็บของเย็นและแช่เเข็ง"}
	ContainerVegetable := entity.ContainerOfFood{ContainerName: "ห้องเก็บผัก"}
	ContainerDryFood := entity.ContainerOfFood{ContainerName: "ห้องเก็บของแห้ง"}

	db.FirstOrCreate(&ContainerFreeze, &entity.ContainerOfFood{ContainerName: "ห้องเก็บของเย็น"})
	db.FirstOrCreate(&ContainerVegetable, &entity.ContainerOfFood{ContainerName: "ห้องเก็บผัก"})
	db.FirstOrCreate(&ContainerDryFood, &entity.ContainerOfFood{ContainerName: "ห้องเก็บของแห้ง"})

	CategoryMeat := entity.CatagoryOfFood{StockfoodType: "เนื้อ", Description: "เนื้อสดสำหรับสัตว์กินเนื้อ"}
	CategoryVegetable := entity.CatagoryOfFood{StockfoodType: "ผัก", Description: "ผักสดสำหรับสัตว์กินพืช"}
	CategoryGrain := entity.CatagoryOfFood{StockfoodType: "ธัญพืช", Description: "ธัญพืชแห้งสำหรับนกและสัตว์เลี้ยงลูกด้วยนมขนาดเล็ก"}
	CategoryFish := entity.CatagoryOfFood{StockfoodType: "ปลา", Description: "ปลาและอาหารทะเลสำหรับสัตว์กินปลา"}

	db.FirstOrCreate(&CategoryMeat, &entity.CatagoryOfFood{StockfoodType: "เนื้อ"})
	db.FirstOrCreate(&CategoryVegetable, &entity.CatagoryOfFood{StockfoodType: "ผัก"})
	db.FirstOrCreate(&CategoryGrain, &entity.CatagoryOfFood{StockfoodType: "ธัญพืช"})
	db.FirstOrCreate(&CategoryFish, &entity.CatagoryOfFood{StockfoodType: "ปลา"})

	food1 := entity.StockOfFood{
		Foodname:      "Chicken",
		Quantity:      50,
		ExpiryDate:    time.Now().AddDate(0, 0, 30),
		PictureOfFood: "uploads/food/chicken.png",

		ContainerOfFoodID: ContainerFreeze.ID,
		CatagoryOfFoodID:  CategoryMeat.ID,
		EmployeeID:        1,
	}

	db.FirstOrCreate(&food1, entity.StockOfFood{Foodname: "Chicken"})

	food2 := entity.StockOfFood{
		Foodname:      "Beef",
		Quantity:      50,
		ExpiryDate:    time.Now().AddDate(0, 0, 30),
		PictureOfFood: "uploads/food/beef.png",

		ContainerOfFoodID: ContainerFreeze.ID,
		CatagoryOfFoodID:  CategoryMeat.ID,
		EmployeeID:        1,
	}

	food3 := entity.StockOfFood{
		Foodname:      "Carrot",
		Quantity:      50,
		ExpiryDate:    time.Now().AddDate(0, 0, 30),
		PictureOfFood: "uploads/food/carrot.jpeg",

		ContainerOfFoodID: ContainerVegetable.ID,
		CatagoryOfFoodID:  CategoryVegetable.ID,
		EmployeeID:        1,
	}

	food4 := entity.StockOfFood{
		Foodname:      "Water spinach", //ผักบุ้ง
		Quantity:      50,
		ExpiryDate:    time.Now().AddDate(0, 0, 30),
		PictureOfFood: "uploads/food/waterSpinach.jpg",

		ContainerOfFoodID: ContainerVegetable.ID,
		CatagoryOfFoodID:  CategoryVegetable.ID,
		EmployeeID:        1,
	}

	food5 := entity.StockOfFood{
		Foodname:      "Corn kernels",
		Quantity:      50,
		ExpiryDate:    time.Now().AddDate(0, 3, 0),
		PictureOfFood: "uploads/food/cornKernel.jpg",

		ContainerOfFoodID: ContainerDryFood.ID,
		CatagoryOfFoodID:  CategoryGrain.ID,
		EmployeeID:        1,
	}

	food6 := entity.StockOfFood{
		Foodname:      "Soybeans",
		Quantity:      50,
		ExpiryDate:    time.Now().AddDate(0, 3, 0),
		PictureOfFood: "uploads/food/soybean.jpeg",

		ContainerOfFoodID: ContainerDryFood.ID,
		CatagoryOfFoodID:  CategoryGrain.ID,
		EmployeeID:        1,
	}

	food7 := entity.StockOfFood{
		Foodname:      "Sardines",
		Quantity:      40,
		ExpiryDate:    time.Now().AddDate(0, 0, 15),
		PictureOfFood: "uploads/food/sardine.jpeg",

		ContainerOfFoodID: ContainerFreeze.ID,
		CatagoryOfFoodID:  CategoryFish.ID,
		EmployeeID:        1,
	}

	food8 := entity.StockOfFood{
		Foodname:      "Mackerel",
		Quantity:      40,
		ExpiryDate:    time.Now().AddDate(0, 0, 15),
		PictureOfFood: "uploads/food/mackerel.jpg",

		ContainerOfFoodID: ContainerFreeze.ID,
		CatagoryOfFoodID:  CategoryFish.ID,
		EmployeeID:        1,
	}

	food9 := entity.StockOfFood{
		Foodname:      "Banana",
		Quantity:      50,
		ExpiryDate:    time.Now().AddDate(0, 0, 30),
		PictureOfFood: "uploads/food/banana.jpg",

		ContainerOfFoodID: ContainerVegetable.ID,
		CatagoryOfFoodID:  CategoryVegetable.ID,
		EmployeeID:        1,
	}

	food10 := entity.StockOfFood{
		Foodname:      "Sugarcane",
		Quantity:      50,
		ExpiryDate:    time.Now().AddDate(0, 0, 30),
		PictureOfFood: "uploads/food/sugarcane.jpeg",

		ContainerOfFoodID: ContainerVegetable.ID,
		CatagoryOfFoodID:  CategoryVegetable.ID,
		EmployeeID:        1,
	}

	db.FirstOrCreate(&food1, entity.StockOfFood{Foodname: "Chicken"})
	db.FirstOrCreate(&food2, entity.StockOfFood{Foodname: "Beef"})
	db.FirstOrCreate(&food3, entity.StockOfFood{Foodname: "Carrot"})
	db.FirstOrCreate(&food4, entity.StockOfFood{Foodname: "Water spinach"})
	db.FirstOrCreate(&food5, entity.StockOfFood{Foodname: "Corn kernels"})
	db.FirstOrCreate(&food6, entity.StockOfFood{Foodname: "Soybeans"})
	db.FirstOrCreate(&food7, entity.StockOfFood{Foodname: "Sardines"})
	db.FirstOrCreate(&food8, entity.StockOfFood{Foodname: "Mackerel"})
	db.FirstOrCreate(&food9, entity.StockOfFood{Foodname: "Banana"})
	db.FirstOrCreate(&food10, entity.StockOfFood{Foodname: "Sugarcane"})

	// Define a specific timestamp
	finishDate := time.Date(2025, 1, 14, 12, 0, 0, 0, time.UTC)

	// Work
	work1 := entity.Work{}
	work2 := entity.Work{}
	work3 := entity.Work{}
	db.FirstOrCreate(&work1, &entity.Work{Feed: true, Cleaning: true, FinishDate: finishDate, EmployeeID: Employee2.ID, HabitatID: habitat1.ID})
	db.FirstOrCreate(&work2, &entity.Work{Feed: true, Cleaning: false, FinishDate: finishDate, EmployeeID: Employee2.ID, HabitatID: habitat2.ID})
	db.FirstOrCreate(&work3, &entity.Work{Feed: false, Cleaning: true, FinishDate: finishDate, EmployeeID: Employee2.ID, HabitatID: habitat3.ID})

	specificTime := time.Date(2025, time.January, 22, 10, 30, 0, 0, time.UTC)

	foodRequisition1 := entity.FoodRequisition{}
	foodRequisition2 := entity.FoodRequisition{}
	db.FirstOrCreate(&foodRequisition1, &entity.FoodRequisition{Note: "Out of animal food", RequisitionDate: specificTime, WorkID: &work1.ID})
	db.FirstOrCreate(&foodRequisition2, &entity.FoodRequisition{Note: "Need some food for animal", RequisitionDate: specificTime, WorkID: &work2.ID})

	foodRequisitionDetail1 := entity.FoodRequisitionDetail{}
	foodRequisitionDetail2 := entity.FoodRequisitionDetail{}
	db.FirstOrCreate(&foodRequisitionDetail1, &entity.FoodRequisitionDetail{Quantity: 50, FoodRequisitionID: foodRequisition1.ID, StockOfFoodID: food1.ID})
	db.FirstOrCreate(&foodRequisitionDetail2, &entity.FoodRequisitionDetail{Quantity: 100, FoodRequisitionID: foodRequisition2.ID, StockOfFoodID: food2.ID})

	event1 := entity.Event{
		Title:       "PLANET ZOO EVENT",
		Description: "Planet Zoo Event is an exciting and immersive experience for zoo",
		StartDate:   time.Date(2025, 12, 15, 8, 0, 0, 0, time.UTC),
		EndDate:     time.Date(2025, 12, 31, 19, 0, 0, 0, time.UTC),
		Picture:     "uploads/img-9.jpg",

		ZoneID:     zone2.ID,
		AnimalID:   Animal1.ID,
		EmployeeID: 2,
	}

	event2 := entity.Event{
		Title:       "Zoo Lights",
		Description: "Zoo Lights is a captivating and magical event",
		StartDate:   time.Date(2025, 12, 15, 8, 0, 0, 0, time.UTC),
		EndDate:     time.Date(2025, 12, 31, 19, 0, 0, 0, time.UTC),
		Picture:     "uploads/img-2.jpg",

		ZoneID:     zone1.ID,
		AnimalID:   Animal2.ID,
		EmployeeID: 2,
	}

	event3 := entity.Event{
		Title:       "Zoomagination",
		Description: "Zoomagination is a creative and engaging event, often held in zoo",
		StartDate:   time.Date(2025, 3, 11, 8, 0, 0, 0, time.UTC),
		EndDate:     time.Date(2025, 3, 12, 19, 0, 0, 0, time.UTC),
		Picture:     "uploads/img-3.jpg",

		ZoneID:     zone3.ID,
		AnimalID:   Animal3.ID,
		EmployeeID: 2,
	}

	event4 := entity.Event{
		Title:       "LATENIGHT ZOO",
		Description: "LATENIGHT ZOO is a unique after-hours event that allows visitors to experience the zoo",
		StartDate:   time.Date(2025, 12, 15, 8, 0, 0, 0, time.UTC),
		EndDate:     time.Date(2025, 12, 31, 19, 0, 0, 0, time.UTC),
		Picture:     "uploads/img-8.jpg",

		ZoneID:     zone3.ID,
		AnimalID:   Animal4.ID,
		EmployeeID: 2,
	}

	event5 := entity.Event{
		Title:       "Christmas Zoo",
		Description: "Christmas Zoo is a festive and heartwarming holiday event where zoos",
		StartDate:   time.Date(2025, 12, 15, 8, 0, 0, 0, time.UTC),
		EndDate:     time.Date(2025, 12, 31, 19, 0, 0, 0, time.UTC),
		Picture:     "uploads/img-4.jpg",

		ZoneID:     zone3.ID,
		AnimalID:   Animal5.ID,
		EmployeeID: 2,
	}

	event6 := entity.Event{
		Title:       "Survival Hunter",
		Description: "Survival Hunter could refer to an immersive event or themed activity designed",
		StartDate:   time.Date(2025, 12, 15, 8, 0, 0, 0, time.UTC),
		EndDate:     time.Date(2025, 12, 31, 19, 0, 0, 0, time.UTC),
		Picture:     "uploads/img-home.jpg",

		ZoneID:     zone3.ID,
		AnimalID:   Animal5.ID,
		EmployeeID: 2,
	}

	db.FirstOrCreate(&event1, entity.Event{Title: "PLANET ZOO EVENT"})
	db.FirstOrCreate(&event2, entity.Event{Title: "Zoo Lights"})
	db.FirstOrCreate(&event3, entity.Event{Title: "Zoomagination"})
	db.FirstOrCreate(&event4, entity.Event{Title: "LATENIGHT ZOO"})
	db.FirstOrCreate(&event5, entity.Event{Title: "Christmas Zoo"})
	db.FirstOrCreate(&event6, entity.Event{Title: "Survival Hunter"})

	userID7 := uint(7)
	userID8 := uint(8)
	userID9 := uint(9)
	userID10 := uint(10)
	userID11 := uint(11)

	Booking1 := &entity.Booking{
		BookingDate: time.Now(),
		AllPrice:    620.0,
		UserID:      &userID7,
	}

	Booking2 := &entity.Booking{
		BookingDate: time.Now(),
		AllPrice:    890.0,
		UserID:      &userID8,
	}

	Booking3 := &entity.Booking{
		BookingDate: time.Now(),
		AllPrice:    460.0,
		UserID:      &userID9,
	}

	Booking4 := &entity.Booking{
		BookingDate: time.Now(),
		AllPrice:    190.0,
		UserID:      &userID10,
	}

	Booking5 := &entity.Booking{
		BookingDate: time.Now(),
		AllPrice:    560.0,
		UserID:      &userID11,
	}

	db.FirstOrCreate(Booking1, &entity.Booking{UserID: &userID7})
	db.FirstOrCreate(Booking2, &entity.Booking{UserID: &userID8})
	db.FirstOrCreate(Booking3, &entity.Booking{UserID: &userID9})
	db.FirstOrCreate(Booking4, &entity.Booking{UserID: &userID10})
	db.FirstOrCreate(Booking5, &entity.Booking{UserID: &userID11})

	//Ticket type
	ticketType1 := entity.TicketType{Ticket: "Wild", Description: "This ticket grants access to the Rainforest Zone, home to fascinating creatures like jaguars, macaws, orangutans, hornbills, and more from lush rainforest habitats.", Picture: "uploads/zone/wild.jpg"}
	ticketType2 := entity.TicketType{Ticket: "Survival", Description: "This ticket grants access to Rainforest and Savannah Zones, featuring wildlife like lions, giraffes, zebras, antelopes, and hippos from grasslands alongside rainforest creatures.", Picture: "uploads/zone/survival.jpg"}
	ticketType3 := entity.TicketType{Ticket: "OceanSea", Description: "This ticket grants access to Rainforest, Savannah, and Oceanarium Zones, featuring land and marine life like dolphins, sea turtles, coral reefs, and more for a complete zoo experience.", Picture: "uploads/zone/oseansea.jpg"}
	db.FirstOrCreate(&ticketType1, &entity.TicketType{Ticket: "Wild"})
	db.FirstOrCreate(&ticketType2, &entity.TicketType{Ticket: "Survival"})
	db.FirstOrCreate(&ticketType3, &entity.TicketType{Ticket: "OceanSea"})

	ticket1 := entity.Ticket{}
	ticket2 := entity.Ticket{}
	ticket3 := entity.Ticket{}
	ticket4 := entity.Ticket{}
	ticket5 := entity.Ticket{}
	ticket6 := entity.Ticket{}
	ticket7 := entity.Ticket{}
	ticket8 := entity.Ticket{}
	ticket9 := entity.Ticket{}
	db.FirstOrCreate(&ticket1, &entity.Ticket{Description: "Rainforest zone For Child", Price: 50, TicketGenerationID: &TicketGeneration1.ID, TicketTypeID: ticketType1.ID})
	db.FirstOrCreate(&ticket2, &entity.Ticket{Description: "Rainforest and Savannah For Child", Price: 110, TicketGenerationID: &TicketGeneration1.ID, TicketTypeID: ticketType2.ID})
	db.FirstOrCreate(&ticket3, &entity.Ticket{Description: "Rainforest, Savannah and Oceanarium For Child", Price: 170, TicketGenerationID: &TicketGeneration1.ID, TicketTypeID: ticketType3.ID})
	db.FirstOrCreate(&ticket4, &entity.Ticket{Description: "Rainforest zone For Adult", Price: 100, TicketGenerationID: &TicketGeneration2.ID, TicketTypeID: ticketType1.ID})
	db.FirstOrCreate(&ticket5, &entity.Ticket{Description: "Rainforest and Savannah For Adult", Price: 160, TicketGenerationID: &TicketGeneration2.ID, TicketTypeID: ticketType2.ID})
	db.FirstOrCreate(&ticket6, &entity.Ticket{Description: "Rainforest, Savannah and Oceanarium For Adult", Price: 250, TicketGenerationID: &TicketGeneration2.ID, TicketTypeID: ticketType3.ID})
	db.FirstOrCreate(&ticket7, &entity.Ticket{Description: "Rainforest zone For Baby and Elderly people", Price: 0, TicketGenerationID: &TicketGeneration3.ID, TicketTypeID: ticketType1.ID})
	db.FirstOrCreate(&ticket8, &entity.Ticket{Description: "Rainforest and Savannah For Baby and Elderly people", Price: 0, TicketGenerationID: &TicketGeneration3.ID, TicketTypeID: ticketType2.ID})
	db.FirstOrCreate(&ticket9, &entity.Ticket{Description: "Rainforest, Savannah and Oceanarium For Baby and Elderly people", Price: 0, TicketGenerationID: &TicketGeneration3.ID, TicketTypeID: ticketType3.ID})

	db.Model(&ticket1).Association("Zones").Append(&zone1)
	db.Model(&ticket2).Association("Zones").Append(&zone1, &zone2)
	db.Model(&ticket3).Association("Zones").Append(&zone1, &zone2, &zone3)
	db.Model(&ticket4).Association("Zones").Append(&zone1)
	db.Model(&ticket5).Association("Zones").Append(&zone1, &zone2)
	db.Model(&ticket6).Association("Zones").Append(&zone1, &zone2, &zone3)
	db.Model(&ticket7).Association("Zones").Append(&zone1)
	db.Model(&ticket8).Association("Zones").Append(&zone1, &zone2)
	db.Model(&ticket9).Association("Zones").Append(&zone1, &zone2, &zone3)

	BookingID1 := uint(1)
	BookingID2 := uint(2)
	BookingID3 := uint(3)
	BookingID4 := uint(4)
	BookingID5 := uint(5)

	PaymentTicket1 := &entity.PaymentTicket{
		Amount:        540.0,
		PaymentDate:   time.Now(),
		Path:          "uploads/ticket.jpg",
		PaymentStatus: true,
		BookingID:     BookingID1,
	}
	PaymentTicket2 := &entity.PaymentTicket{
		Amount:        540.0,
		PaymentDate:   time.Now(),
		Path:          "uploads/ticket.jpg",
		PaymentStatus: true,
		BookingID:     BookingID2,
	}
	PaymentTicket3 := &entity.PaymentTicket{
		Amount:        500.0,
		PaymentDate:   time.Now(),
		Path:          "uploads/ticket.jpg",
		PaymentStatus: true,
		BookingID:     BookingID3,
	}
	PaymentTicket4 := &entity.PaymentTicket{
		Amount:        170.0,
		PaymentDate:   time.Now(),
		Path:          "uploads/ticket.jpg",
		PaymentStatus: false,
		BookingID:     BookingID4,
	}
	PaymentTicket5 := &entity.PaymentTicket{
		Amount:        480.0,
		PaymentDate:   time.Now(),
		Path:          "uploads/ticket.jpg",
		PaymentStatus: true,
		BookingID:     BookingID5,
	}

	db.FirstOrCreate(PaymentTicket1, &entity.PaymentTicket{BookingID: BookingID1})
	db.FirstOrCreate(PaymentTicket2, &entity.PaymentTicket{BookingID: BookingID2})
	db.FirstOrCreate(PaymentTicket3, &entity.PaymentTicket{BookingID: BookingID3})
	db.FirstOrCreate(PaymentTicket4, &entity.PaymentTicket{BookingID: BookingID4})
	db.FirstOrCreate(PaymentTicket5, &entity.PaymentTicket{BookingID: BookingID5})

	TicketBooked1 := entity.TicketBooked{
		VisitDate:        time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		QuantityCustomer: 2,
		TotalPrice:       500.0,

		BookingID: &Booking1.ID,
	}

	TicketBooked2 := entity.TicketBooked{
		VisitDate:        time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		QuantityCustomer: 6,
		TotalPrice:       650.0,

		BookingID: &Booking2.ID,
	}

	TicketBooked3 := entity.TicketBooked{
		VisitDate:        time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		QuantityCustomer: 2,
		TotalPrice:       420.0,

		BookingID: &Booking3.ID,
	}

	TicketBooked4 := entity.TicketBooked{
		VisitDate:        time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		QuantityCustomer: 1,
		TotalPrice:       170.0,

		BookingID: &Booking4.ID,
	}

	TicketBooked5 := entity.TicketBooked{
		VisitDate:        time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		QuantityCustomer: 7,
		TotalPrice:       500.0,

		BookingID: &Booking5.ID,
	}

	db.FirstOrCreate(&TicketBooked1, entity.TicketBooked{BookingID: &Booking1.ID})
	db.FirstOrCreate(&TicketBooked2, entity.TicketBooked{BookingID: &Booking2.ID})
	db.FirstOrCreate(&TicketBooked3, entity.TicketBooked{BookingID: &Booking3.ID})
	db.FirstOrCreate(&TicketBooked4, entity.TicketBooked{BookingID: &Booking4.ID})
	db.FirstOrCreate(&TicketBooked5, entity.TicketBooked{BookingID: &Booking5.ID})

	//rent
	Rent1 := entity.Rent{
		TotalQuantity: 1,
		RentDate:      time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		StartTime:     time.Date(2024, 12, 25, 9, 0, 0, 0, time.UTC),
		EndTime:       time.Date(2024, 12, 25, 11, 0, 0, 0, time.UTC),
		TotalPrice:    120,

		TicketBookedID: &TicketBooked1.ID,
	}

	Rent2 := entity.Rent{
		TotalQuantity: 1,
		RentDate:      time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		StartTime:     time.Date(2024, 12, 25, 9, 0, 0, 0, time.UTC),
		EndTime:       time.Date(2024, 12, 25, 11, 0, 0, 0, time.UTC),
		TotalPrice:    120,

		TicketBookedID: &TicketBooked2.ID,
	}

	Rent3 := entity.Rent{
		TotalQuantity: 1,
		RentDate:      time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		StartTime:     time.Date(2024, 12, 25, 9, 0, 0, 0, time.UTC),
		EndTime:       time.Date(2024, 12, 25, 11, 0, 0, 0, time.UTC),
		TotalPrice:    20,

		TicketBookedID: &TicketBooked3.ID,
	}

	Rent4 := entity.Rent{
		TotalQuantity: 1,
		RentDate:      time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		StartTime:     time.Date(2024, 12, 25, 9, 0, 0, 0, time.UTC),
		EndTime:       time.Date(2024, 12, 25, 11, 0, 0, 0, time.UTC),
		TotalPrice:    20,

		TicketBookedID: &TicketBooked4.ID,
	}

	Rent5 := entity.Rent{
		TotalQuantity: 1,
		RentDate:      time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
		StartTime:     time.Date(2024, 12, 25, 9, 0, 0, 0, time.UTC),
		EndTime:       time.Date(2024, 12, 25, 11, 0, 0, 0, time.UTC),
		TotalPrice:    20,

		TicketBookedID: &TicketBooked5.ID,
	}
	db.FirstOrCreate(&Rent1, entity.Rent{TicketBookedID: &TicketBooked1.ID})
	db.FirstOrCreate(&Rent2, entity.Rent{TicketBookedID: &TicketBooked2.ID})
	db.FirstOrCreate(&Rent3, entity.Rent{TicketBookedID: &TicketBooked3.ID})
	db.FirstOrCreate(&Rent4, entity.Rent{TicketBookedID: &TicketBooked4.ID})
	db.FirstOrCreate(&Rent5, entity.Rent{TicketBookedID: &TicketBooked5.ID})

	vehicleRent1 := entity.VehicleRent{}
	vehicleRent2 := entity.VehicleRent{}
	vehicleRent3 := entity.VehicleRent{}
	vehicleRent4 := entity.VehicleRent{}
	vehicleRent5 := entity.VehicleRent{}
	db.FirstOrCreate(&vehicleRent1, &entity.VehicleRent{Quantity: 1, RentID: Rent1.ID, VehicleID: Vehicle5.ID})
	db.FirstOrCreate(&vehicleRent2, &entity.VehicleRent{Quantity: 1, RentID: Rent2.ID, VehicleID: Vehicle8.ID})
	db.FirstOrCreate(&vehicleRent3, &entity.VehicleRent{Quantity: 1, RentID: Rent3.ID, VehicleID: Vehicle3.ID})
	db.FirstOrCreate(&vehicleRent4, &entity.VehicleRent{Quantity: 1, RentID: Rent4.ID, VehicleID: Vehicle4.ID})
	db.FirstOrCreate(&vehicleRent5, &entity.VehicleRent{Quantity: 1, RentID: Rent5.ID, VehicleID: Vehicle6.ID})

	bookingZoo1 := entity.BookingZoo{}
	bookingZoo2 := entity.BookingZoo{}
	bookingZoo3 := entity.BookingZoo{}
	bookingZoo4 := entity.BookingZoo{}
	bookingZoo5 := entity.BookingZoo{}
	bookingZoo6 := entity.BookingZoo{}
	bookingZoo7 := entity.BookingZoo{}
	bookingZoo8 := entity.BookingZoo{}
	bookingZoo9 := entity.BookingZoo{}
	db.FirstOrCreate(&bookingZoo1, &entity.BookingZoo{Quantity: 2, TicketID: ticket6.ID, TicketBookedID: TicketBooked1.ID})
	db.FirstOrCreate(&bookingZoo2, &entity.BookingZoo{Quantity: 3, TicketID: ticket2.ID, TicketBookedID: TicketBooked2.ID})
	db.FirstOrCreate(&bookingZoo3, &entity.BookingZoo{Quantity: 2, TicketID: ticket5.ID, TicketBookedID: TicketBooked2.ID})
	db.FirstOrCreate(&bookingZoo4, &entity.BookingZoo{Quantity: 1, TicketID: ticket8.ID, TicketBookedID: TicketBooked2.ID})
	db.FirstOrCreate(&bookingZoo5, &entity.BookingZoo{Quantity: 1, TicketID: ticket3.ID, TicketBookedID: TicketBooked3.ID})
	db.FirstOrCreate(&bookingZoo6, &entity.BookingZoo{Quantity: 1, TicketID: ticket6.ID, TicketBookedID: TicketBooked3.ID})
	db.FirstOrCreate(&bookingZoo7, &entity.BookingZoo{Quantity: 1, TicketID: ticket3.ID, TicketBookedID: TicketBooked4.ID})
	db.FirstOrCreate(&bookingZoo8, &entity.BookingZoo{Quantity: 5, TicketID: ticket4.ID, TicketBookedID: TicketBooked5.ID})
	db.FirstOrCreate(&bookingZoo9, &entity.BookingZoo{Quantity: 2, TicketID: ticket7.ID, TicketBookedID: TicketBooked5.ID})

}
