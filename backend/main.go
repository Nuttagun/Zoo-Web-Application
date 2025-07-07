package main

import (
	"github.com/gin-gonic/gin"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/controller"
	animal "github.com/sut67/team18/controller/Animal"
	behavioral "github.com/sut67/team18/controller/Behavioral"
	biological "github.com/sut67/team18/controller/Biological"
	booking "github.com/sut67/team18/controller/Booking"
	calendar "github.com/sut67/team18/controller/Calendar"
	event "github.com/sut67/team18/controller/Event"
	foodrequisition "github.com/sut67/team18/controller/FoodRequisition"
	foodrequisitiondetail "github.com/sut67/team18/controller/FoodRequisitionDetail"
	habitat "github.com/sut67/team18/controller/Habitat"
	like "github.com/sut67/team18/controller/Like"
	promotion "github.com/sut67/team18/controller/Promotion"
	rent "github.com/sut67/team18/controller/Rent"
	report "github.com/sut67/team18/controller/Report"
	review "github.com/sut67/team18/controller/Review"
	sex "github.com/sut67/team18/controller/Sex"
	health "github.com/sut67/team18/controller/Health"
	ticket "github.com/sut67/team18/controller/Ticket"
	ticketBooked "github.com/sut67/team18/controller/TicketBooked"
	tickettype "github.com/sut67/team18/controller/TicketType"
	user "github.com/sut67/team18/controller/User"
	vehicle "github.com/sut67/team18/controller/Vehicle"
	work "github.com/sut67/team18/controller/Work"
	zone "github.com/sut67/team18/controller/Zone"
	chats "github.com/sut67/team18/controller/Chat"
	"github.com/sut67/team18/controller/veterianController"
	"github.com/sut67/team18/middlewares"
	"net/http"
)

const PORT = "8000"

func main() {

	// open connection database
	config.ConnectionDB()

	// Generate databases
	config.SetupDatabase()

	r := gin.Default()

	r.Use(CORSMiddleware())

	r.POST("/login", controller.AddLogin)

	authorized := r.Group("")
	authorized.Use(middlewares.Authorizes())
	{
		// Animals Routes
		authorized.POST("/animals-create", animal.CreateAnimal)
		authorized.GET("/animals", animal.ListAnimals)
		authorized.DELETE("/animals/:id", animal.DeleteAnimal)
		authorized.GET("/animal/:id", animal.GetAnimalById)
		authorized.PATCH("/animals/:id", animal.UpdateAnimal)

		// Zone Routes
		authorized.GET("/zones", zone.ListZone)

		// Sex Routes
		authorized.GET("/sexs", sex.ListSex)

		// Health Routes
		authorized.GET("/healths", health.ListHealth)

		// Biological Routes
		authorized.GET("/behaviorals", behavioral.ListBehaviorals)

		// Biological Routes
		authorized.GET("/biologicals", biological.ListBiological)

		// Status Animal Routes
		authorized.GET("/status-animals", animal.ListStatusAnimal)

		// Report Routes
		authorized.POST("/reports-create", report.CreateReport)
		authorized.GET("/reports", report.ListReport)
		authorized.DELETE("/reports/:id", report.DeleteReport)
		authorized.GET("/report/:id", report.GetReportById)
		authorized.PATCH("/reports/:id", report.UpdateReport)
		authorized.GET("/animals-sick", animal.ListAnimalsByHealth)

		//Calendar Routes
		authorized.GET("/calendar", calendar.ListCalendar)
		authorized.POST("/create-calendar", calendar.CreateCalendar)
		authorized.DELETE("/delete-calendar/:id", calendar.DeleteCalendar)

		//Review Routes
		authorized.GET("/user-review/:id", review.GetUserByIdReviews)
		authorized.GET("/reviews", review.ListReview)
		authorized.GET("/reviews/:userID", review.ListReviewByUserID)
		authorized.POST("/reviews-create", review.CreateReview)
		authorized.GET("/ratings", review.GetAllRatingsAvg)
		authorized.GET("/reviews/filter", review.GetFilteredReviews)
		authorized.GET("/reviews/search", review.SearchReviewsByKeyword)
		authorized.GET("/bookings/user/:id", review.ListBookingsByUserID)
		authorized.PATCH("/reviews/:id", review.UpdateReview)
		authorized.GET("/review/:id", review.GetReviewByID)

		//Like Routes
		authorized.POST("/reviews/like", like.LikeReview)
		authorized.DELETE("/reviews/unlike", like.UnlikeReview)
		authorized.GET("/reviews/:userID/:reviewID/like", like.CheckUserLikeStatus)

		//Event Routes
		authorized.POST("/events-create", event.CreateEvent)
		authorized.GET("/events", event.ListEvent)
		authorized.DELETE("/events/:id", event.DeleteEvent)
		authorized.GET("/event/:id", event.GetEventById)
		authorized.PATCH("/events/:id", event.UpdateEvent)
		authorized.GET("/events/upcoming", event.GetUpcomingEvents)

		//Habitat Routes
		authorized.POST("/habitats-create", habitat.CreateHabitat)
		authorized.GET("/habitats", habitat.ListHabitat)
		authorized.DELETE("/habitats/:id", habitat.DeleteHabitat)
		authorized.GET("/habitat/:id", habitat.GetHabitatById)
		authorized.PATCH("/habitats/:id", habitat.UpdateHabitat)
		authorized.GET("/habitats/available", habitat.GetHabitatAvailable)

		//Work
		authorized.POST("/works", work.CreateWork)
		authorized.POST("/foodrequisition", foodrequisition.CreateFoodRequisition)
		authorized.GET("/stocks-food", foodrequisition.GetAllStockFood)
		authorized.POST("/food-requisition-detail", foodrequisitiondetail.CreateFoodRequisitionDetail)
		authorized.PUT("/stock-food/:id/reduce", foodrequisitiondetail.ReduceStockFoodQuantity)
		authorized.GET("/work/employee/:employeeID", work.GetWorkByEmployeeID)
		authorized.GET("/foodrequisitions/work/:workID", foodrequisition.GetFoodRequisitionByWorkID)

		// Vehicle Routes
		authorized.GET("/vehicles", vehicle.ListVehicle)
		authorized.DELETE("/vehicles/:id", vehicle.DeleteVehicle)
		authorized.GET("/vehicles/:id", vehicle.GetVehicleById)
		authorized.PATCH("/vehicles/:id", vehicle.UpdateVehicle)
		authorized.GET("/vehicles/available", vehicle.GetAvailableVehicles)
		authorized.POST("/vehicles-create", vehicle.CreateVehicle)
		authorized.GET("/vehicle-status", vehicle.GetAllVehicleStatus)
		authorized.GET("/vehicle-types", vehicle.GetAllVehicleType)
		authorized.GET("/vehicle-colors", vehicle.GetAllVehicleColor)
		// Booking Routes
		authorized.POST("/booking", booking.CreateBooking)
		authorized.PATCH("/bookings/:bookingID", booking.UpdateByBookingID)
		authorized.DELETE("/deletebooking", booking.DeleteBooking)
		authorized.GET("/tickets/booked/:bookingID", ticket.GetTicketBookedByBookingID)
		//ticket type
		authorized.GET("/ticket-types", tickettype.ListTicketType)
		authorized.GET("/tickets/:ticketTypeID", tickettype.GetTicketByTicketTypeID)
		authorized.POST("/ticket-booked", tickettype.CreateTicketBooked)
		authorized.POST("/booking-zoo", tickettype.CreateBookingZoo)
		authorized.GET("tickettypes/:ticketTypeID", tickettype.GetTicketTypeByID)
		authorized.GET("/rents/ticketbooked/:ticketBookedID", rent.GetRentByTicketBookedID)
		// rent
		authorized.POST("/rent", rent.CreateTicketRented)
		authorized.POST("/vehicle-rent", rent.CreateVehicleRent) 
		authorized.GET("/rent/:id", rent.GetRentByID)
		// ticket booked
		authorized.GET("/booking-detail-tickets/user/:id", ticketBooked.GetUserBookingDetailsTicket)
		authorized.GET("/booking-detail-rent/user/:id", ticketBooked.GetUserBookingDetailsRent)
		authorized.DELETE("/deleteTicketBooked/:ID", ticketBooked.DeleteTicketBooked)
		// ticket
		authorized.GET("/ticket-booked/:id", ticket.GetTicketBookedByID)
		authorized.GET("/ticket/:id", ticket.GetTicketByID)

		// ZooSale Aut
		r.Static("Image/imageproduct", "./Image/imageproduct/")

		authorized.GET("/getallproductstock", controller.GetAllProductStock)
		authorized.GET("/getdataemployeebyid/:id", controller.GetDataEmployeeByID)

		authorized.POST("/deleteproductbyid/:id", controller.DeleteProductByID)
		authorized.POST("/addeditproduct", controller.AddEditProduct)

		authorized.POST("/moveproductshelfzone", controller.MoveProductShelfZone)

		authorized.GET("/searchproductreceive", controller.SearchProductReceive)
		authorized.POST("/addreceiveproduct", controller.AddReceiveProduct)
		authorized.GET("/getproductfororganize", controller.GetProductForOrganize)
		authorized.GET("/getalldatashelf", controller.GetAllDataShelf)
		authorized.POST("/addproducttoshelfzone", controller.AddProductToShelfZone)
		authorized.GET("/searchproductsale", controller.SearchProductSale)
		authorized.POST("/addsaleproduct", controller.AddSaleProduct)
		authorized.POST("/adddatashelfzone", controller.AddShelfZoneData)
		authorized.POST("/deleteupdateshelf", controller.DeleteUpdateShelf)
		authorized.GET("/getallbarcodeproduct", controller.GetAllBarcodeProduct)

		authorized.GET("/getproductfordisposal", controller.GetProductForDisposal)
		authorized.POST("/adddisposal", controller.AddDisposal)

		// --- Zoosale   -----
		// PaymentTicket
		authorized.GET("/getdatabookingbyid/:id", controller.GetBookingDataByID)
		authorized.GET("/getdatavehiclebybookingid/:id", controller.GetDataVehicleByBookingID)
		authorized.POST("/getdatapromotioncanuse", controller.GetDataPromotionCanUse)
		authorized.POST("/addpaymenticket", controller.AddPaymentTicket)
		
		authorized.PATCH("/updatepayment/:id", controller.UpdatePaymentStatus)



		//  --- PaymentTicket ----
		authorized.GET("/getallanimal", controller.GetAllAnimals)
		authorized.GET("/getreportbyanimalid/:id",veterianController.GetReportsByAnimalID)
		authorized.POST("/createanimal", controller.CreateAnimal)
		authorized.GET("/getanimalbyid/:id", controller.GetAnimalByID)
		authorized.PUT("/updateanimalbyid/:id", controller.UpdateAnimal)
		authorized.DELETE("/deleteanimalbyid/:id", controller.DeleteAnimal)
		authorized.GET("/getallreport", controller.GetAllReport)
		authorized.POST("/addreport", controller.CreateReport)
		authorized.PUT("/updatereportbyid/:id", controller.GetAllReport)

		// authorized.GET("/getanimaldetail/:id",veterianController.GetAnimalDetails)
		authorized.GET("/getallprescription", veterianController.GetAllPresciption)
		authorized.POST("/addprescription", veterianController.CreatePrescription)
		// authorized.POST("/updateprescriptionbyid/:id", veterianController.UpdatePrescription)
		authorized.DELETE("/deleteprescriptionbyid/:id", veterianController.DeletePrescriptionByID)
		authorized.GET("/getprescriptionbyid/:id", veterianController.GetPrescriptionByID)
		//reportforvet
		authorized.GET("/reportsforvet", veterianController.ListReportForVet)
		authorized.GET("getmedicalbyreportid/:id",veterianController.GetMedicalByReportID)

		authorized.GET("/getallmedicine", veterianController.GetAllMedicine)
		authorized.GET("/getmedicinebyid/:id", veterianController.GetMedicineByID)
		authorized.POST("/addmedicine", veterianController.CreateMedicine)
		authorized.PUT("/updatemedicinebyid/:id", veterianController.UpdateMedicineByID)
		authorized.DELETE("/deletemedicinebyid/:id", veterianController.DeleteMedicineByID)
		//medicinetype
		authorized.GET("/listmedicinetype", veterianController.ListMedicineType)
		authorized.GET("/listmedicinetypebyid/:id", veterianController.GetMedicineTypeByID)
		authorized.POST("/addmedicinetype", veterianController.CreateMedicineType)
		authorized.PUT("/updatemedicinetypebyid/:id", veterianController.UpdateMedicineTypeByID)
		authorized.DELETE("/deletemedicinetypebyid/:id", veterianController.DeleteMedicineTypeByID)

		//PrescriptionMedicine
		authorized.GET("/getallPrescriptionMedicine/:id", veterianController.ShowPrescriptionMedicinesFromLink)
		authorized.GET("/getallmedicalrecord", veterianController.GetAllMedicalRecord)
		// authorized.GET("/animals/:animalID/medical-history", veterianController.GetMedicalHistoryByAnimalID)
		//medicalrecord
		authorized.GET("/getmedicinerecordbyid/:id", veterianController.GetMedicalRecordByID)
		// authorized.POST("/addmedicalrecord", veterianController.CreateMedicalRecord)
		// authorized.POST("/addmedicalrecordbyreport", veterianController.CreateMedicalRecordFromReport)
		authorized.PUT("/updatemedicalrecordandtreatment/:id", veterianController.UpdateMedicalRecordAndTreatment)
		authorized.DELETE("/deletemedicalrecordbyid/:id", veterianController.DeleteMedicalRecordById)



		authorized.GET("/gettreatmentbyid/:id", veterianController.GetTreamentPlanByID)
		authorized.POST("/addmtreatment", veterianController.CreateTreatmenPlan)
		authorized.PUT("/updatetreatmentbyid/:id", veterianController.UpdateTreatmentPlan)
		authorized.POST("/reports/:id/medicalrecords", veterianController.CreateMedicalRecordfromreport)
		// authorized.POST("/addtreatment_and_medicalrecord", controller.CreateTreatmentandMedicalRecord)
		// authorized.PUT("/updatetreatment_and_medicalrecordbyid/:id", controller.UpdateTreatmentAndMedicalRecord)
		// authorized.DELETE("/deletereatment_and_medicalrecordbyid/:id", controller.DeleteTreatmentAndMedicalRecord)
		// authorized.GET("/animalsick", veterianController.GetSickAnimals)

		//Create Promotion
		authorized.POST("/promotion_create", promotion.CreatePromotion)
		authorized.GET("/promotions_list", promotion.GetPromotions)
		authorized.DELETE("/promotions_delete/:id", promotion.DeletePromotion)
		authorized.GET("/promotions_by_id/:id", promotion.GetPromotionByID)
		authorized.PATCH("/promotions_update/:id", promotion.UpdatePromotion)

		authorized.GET("/promotions_status_list", promotion.ListPromotionStatus)
		authorized.GET("/promotions_condition_list", promotion.ListCondition)
		authorized.GET("/promotions_category_list", promotion.ListPromotionCategory)

		//Chat
		authorized.POST("/chat_create", chats.CreateChats)
		authorized.POST("/chat_zookeeper_create", chats.CreateZookeeperChats)
		authorized.GET("/get_chat",chats.GetChats)

		//User Routes
		//r.Static("uploads/profile", "./uploads/profile/")
		// authorized.POST("/signup", user.CreateUser)
		authorized.PATCH("/users-update/:id", user.UpdateUserbyId)
		authorized.GET("/users", user.GetAll)
		authorized.GET("/users/:id", user.GetUserById)
		authorized.POST("/users-createbyadmin", user.CreateUserByAdmin)
		authorized.PATCH("/users-updatebyadmin", user.UpdateUserByAdmin)
		authorized.GET("/getpayments", controller.GetPayments)
		r.Static("Image/ImageSlipTicket", "./Image/ImageSlipTicket/")
		// authorized.DELETE("/users-delete/:id", user.Delete)
		authorized.DELETE("/userandemployee-delete/:id", user.DeleteUserAndEmployeeByUserId)
		authorized.PUT("/users/password/:id", user.ChangePassword)
		//authorized.GET("/genders", user.ListGenders)
		authorized.GET("/userrole", user.ListUserRole)
		authorized.GET("/employee/:userID", user.GetEmployeeByUserID) /*ห้ามยุ่ง*/
		authorized.GET("/employeebyid/:id", user.GetEmployee2ById) 
		authorized.GET("/employees/user/:userID", user.GetEmployeeByUserID)
		authorized.PATCH("/userandemployee-update/:id", user.UpdateUserAndEmployee)

		//about ContainerOfFood
		authorized.GET("/getallcontainer", controller.GetAllContainer)
		authorized.POST("/addcontainer", controller.CreateContainer)
		authorized.PUT("/updatecontainer/:id", controller.UpdateContainer)
		authorized.DELETE("/deletecontainer/:id", controller.DeleteContainer)

		//about Catagory OF Food
		authorized.GET("/getcatagoryfood", controller.GetAllCatagoryOfFood)
		authorized.POST("/addcatagoryfood", controller.CreateCatagoryOfFood)
		authorized.PUT("/updatecatagoryfood/:id", controller.UpdateCatagoryOfFood)
		authorized.DELETE("/deletecatagoryfood/:id", controller.DeleteCatagoryOfFood)

		//foodanimal
		authorized.GET("/getfood", controller.GetAllStockOfFood)
		authorized.GET("/getfoodid/:id", controller.GetFoodOfStockByID)
		authorized.POST("/addfood", controller.CreateFoodOfStock)
		authorized.PATCH("/updatefood/:id", controller.UpdateFoodOfStock)
		authorized.DELETE("/deletefood/:id", controller.DeleteFoodOfStockByID)
	}

	public := r.Group("")
	{
		public.GET("/uploads/*filename", animal.ServeImage)
		public.GET("/genders", user.ListGenders)
		public.POST("/signup", user.CreateUser)

	}

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	r.Run("localhost:" + PORT)

}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
