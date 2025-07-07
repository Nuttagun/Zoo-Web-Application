package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sut67/team18/config"
	"github.com/sut67/team18/entity"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

func CreateUser(c *gin.Context) {
	var user entity.User
	db := config.DB()

	profileImage, err := c.FormFile("profile")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error receiving profile image: %v", err)})
		return
	}

	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create upload directory: %v", err)})
		return
	}

	fileName := fmt.Sprintf("%s-%s", uuid.New().String(), profileImage.Filename)
	filePath := filepath.Join(uploadDir, fileName)

	if err := c.SaveUploadedFile(profileImage, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save profile image: %v", err)})
		return
	}

	user.Username = c.PostForm("username")
	user.Email = c.PostForm("email")
	user.FirstName = c.PostForm("first_name")
	user.LastName = c.PostForm("last_name")

	birthDayStr := c.PostForm("birthDay")
	if birthDayStr != "" {
		birthDay, err := time.Parse("2006-01-02", birthDayStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รูปแบบวันเกิดไม่ถูกต้อง: %v", err)})
			return
		}
		user.Birthday = birthDay
	}

	user.Profile = filePath

	user.UserRoleID = 2

	genderIDStr := c.PostForm("genderID")
	genderID, err := strconv.ParseUint(genderIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid genderID format"})
		return
	}
	user.GenderID = uint(genderID)

	user.PhoneNumber = c.PostForm("phonenumber")

	user.Password = c.PostForm("password")

	var existingUser entity.User
	if err := db.Where("username = ?", user.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create user: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    user,
	})
}

func GetUserById(c *gin.Context) {
	ID := c.Param("id")
	var users entity.User

	db := config.DB()
	result := db.First(&users, ID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func GetEmployeeById(c *gin.Context) {
	ID := c.Param("id")
	var employee entity.Employee

	db := config.DB()
	result := db.First(&employee, ID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, employee)
}

func GetEmployee2ById(c *gin.Context) {
	userID := c.Param("id")
	var employee entity.Employee

	db := config.DB()
	result := db.Where("user_id = ?", userID).First(&employee)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, employee)
}


// func UpdateUserById(c *gin.Context) {
//     var user entity.User
//     db := config.DB()

//     id := c.Param("id")
//     if id == "" {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Missing user ID"})
//         return
//     }

//     if err := db.Where("id = ?", id).First(&user).Error; err != nil {
//         c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
//         return
//     }

//     if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
//         return
//     }

// 	if Username := c.PostForm("Username"); Username != "" {
// 		user.Username = Username
// 	}
//     if FirstName := c.PostForm("FirstName"); FirstName != "" {
// 		user.FirstName = FirstName
// 	}
//     if LastName := c.PostForm("LastName"); LastName != "" {
// 		user.LastName = LastName
// 	}
//     if Email := c.PostForm("Email"); Email != "" {
// 		user.Email = Email
// 	}
//     if PhoneNumber := c.PostForm("PhoneNumber"); PhoneNumber != "" {
// 		user.PhoneNumber = PhoneNumber
// 	}

//     Birthday := c.PostForm("Birthday")
//     if Birthday != "" {
//         if parsedDate, err := time.Parse("2006-01-02", Birthday); err == nil {
//             user.Birthday = parsedDate
//         }
//     }

//     if GenderID := c.PostForm("GenderID"); GenderID != "" {
// 		if genderID, err := strconv.ParseUint(GenderID, 10, 32); err == nil {
// 			user.GenderID = uint(genderID)
// 		}
// 	}

//     file, err := c.FormFile("Profile")
//     if err == nil && file != nil {
//         if user.Profile != "" {
//             oldFilePath := filepath.Join("uploads", user.Profile)
//             os.Remove(oldFilePath)
//         }

//         uploadDir := "uploads"
//         if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
//             return
//         }

//         newFileName := file.Filename
//         filePath := filepath.Join(uploadDir, newFileName)

//         if err := c.SaveUploadedFile(file, filePath); err != nil {
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile picture"})
//             return
//         }

//         user.Profile = "uploads/" + newFileName
//     }

//     newPassword := c.PostForm("Password")
//     if newPassword != "" {
//         if len(newPassword) < 6 {
//             c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters long"})
//             return
//         }

//         hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
//         if err != nil {
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
//             return
//         }

//         user.Password = string(hashedPassword)
//     }

//     if err := db.Save(&user).Error; err != nil {
//         c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update user: %v", err)})
//         return
//     }

//	    c.JSON(http.StatusOK, gin.H{
//	        "message": "User updated successfully",
//	        "data":    user,
//	    })
//	}
func UpdateUserbyId(c *gin.Context) {
	var user entity.User
	db := config.DB()

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing user ID"})
		return
	}

	// Load user by ID
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	fmt.Printf("User before update: %+v\n", user)

	// Update user fields
	user.Username = c.PostForm("Username")
	user.Email = c.PostForm("Email")
	user.FirstName = c.PostForm("FirstName")
	user.LastName = c.PostForm("LastName")
	user.PhoneNumber = c.PostForm("Phonenumber")

	Birthday := c.PostForm("BirthDay")
	if Birthday != "" {
		if parsedDate, err := time.Parse("2006-01-02", Birthday); err == nil {
			user.Birthday = parsedDate
		}
	}

	user.Password = c.PostForm("password")

	if genderID := c.PostForm("GenderID"); genderID != "" {
		if id, err := strconv.Atoi(genderID); err == nil {
			user.GenderID = uint(id)
		}
	}

	// Update Profile if file uploaded
	file, err := c.FormFile("Profile")
	if err == nil {
		profilePath := fmt.Sprintf("uploads/%s", file.Filename)
		if err := c.SaveUploadedFile(file, profilePath); err == nil {
			user.Profile = profilePath
		}
	}

	// Save updated user
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
		"data":    user,
	})
}

func UpdateEmployeeById(c *gin.Context) {
	var employee entity.Employee
	db := config.DB()

	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing employee ID"})
		return
	}

	// Load employee by ID
	if err := db.Where("id = ?", id).First(&employee).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	fmt.Printf("Employee before update: %+v\n", employee)

	// Update employee fields
	employee.Bio = c.PostForm("Bio")
	employee.Experience = c.PostForm("Experience")
	employee.Education = c.PostForm("Education")

	salary := c.PostForm("Salary")
	if salary != "" {
		if parsedSalary, err := strconv.ParseFloat(salary, 64); err == nil {
			employee.Salary = parsedSalary
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary value"})
			return
		}
	}

	fullTime := c.PostForm("FullTime")
	if fullTime != "" {
		if parsedFullTime, err := strconv.ParseBool(fullTime); err == nil {
			employee.FullTime = parsedFullTime
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid FullTime value"})
			return
		}
	}

	if userID := c.PostForm("UserID"); userID != "" {
        if parsedUserID, err := strconv.Atoi(userID); err == nil {
            userIDPointer := uint(parsedUserID)
            employee.UserID = &userIDPointer
        } else {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UserID value"})
            return
        }
    }
    

	// Save updated employee
	if err := db.Save(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update employee"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Employee updated successfully",
		"data":    employee,
	})
}


func ChangePassword(c *gin.Context) {
	var payload struct {
		OldPassword     string `json:"old_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required"`
		ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=NewPassword"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	UserID := c.Param("id")

	var users entity.User
	db := config.DB()

	result := db.First(&users, UserID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if !CheckPasswordHash(payload.OldPassword, []byte(users.Password)) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Old password is incorrect"})
		return
	}

	hashedPassword, err := HashPassword(payload.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing the password"})
		return
	}

	users.Password = hashedPassword
	result = db.Save(&users)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password string, hash []byte) bool {
	err := bcrypt.CompareHashAndPassword(hash, []byte(password))
	return err == nil
}

func GetAll(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
		return
	}

	var users []entity.User
	db := config.DB()
	results := db.Preload("Gender").Preload("UserRole").Find(&users)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

func DeleteUserById(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var users entity.User

	if err := db.Where("id = ?", id).First(&users).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := db.Delete(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}


func DeleteUserAndEmployeeByUserId(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	// เริ่ม Transaction
	tx := db.Begin()

	// ลบ Employee ที่เกี่ยวข้องกับ UserID
	if err := tx.Where("user_id = ?", id).Delete(&entity.Employee{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete employee"})
		return
	}

	// ลบ User
	if err := tx.Where("id = ?", id).Delete(&entity.User{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	// Commit Transaction
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "User and employee deleted successfully"})
}

func CreateUserByAdmin(c *gin.Context) {
	var user entity.User
	var employee entity.Employee
	db := config.DB()

	profileImage, err := c.FormFile("profile")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error receiving profile image: %v", err)})
		return
	}

	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create upload directory: %v", err)})
		return
	}

	fileName := fmt.Sprintf("%s-%s", uuid.New().String(), profileImage.Filename)
	filePath := filepath.Join(uploadDir, fileName)

	if err := c.SaveUploadedFile(profileImage, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save profile image: %v", err)})
		return
	}

	user.Username = c.PostForm("username")
	user.Email = c.PostForm("email")
	user.FirstName = c.PostForm("first_name")
	user.LastName = c.PostForm("last_name")

	birthDayStr := c.PostForm("birthDay")
	if birthDayStr != "" {
		birthDay, err := time.Parse("2006-01-02", birthDayStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รูปแบบวันเกิดไม่ถูกต้อง: %v", err)})
			return
		}
		user.Birthday = birthDay
	}

	user.Profile = filePath

	userRoleIDStr := c.PostForm("userRoleID")
	userRoleID, err := strconv.ParseUint(userRoleIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userRoleID format"})
		return
	}
	user.UserRoleID = uint(userRoleID)

	genderIDStr := c.PostForm("genderID")
	genderID, err := strconv.ParseUint(genderIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid genderID format"})
		return
	}
	user.GenderID = uint(genderID)

	user.PhoneNumber = c.PostForm("phonenumber")

	user.Password = c.PostForm("password")

	var existingUser entity.User
	if err := db.Where("username = ?", user.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	employee.Bio = c.PostForm("bio")
	employee.Experience = c.PostForm("experience")
	employee.Education = c.PostForm("education")

	salaryStr := c.PostForm("salary")
	salary, err := strconv.ParseFloat(salaryStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary format"})
		return
	}
	employee.Salary = salary

	fullTimeStr := c.PostForm("fullTime")
	employee.FullTime = fullTimeStr == "true"

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create user: %v", err)})
		return
	}

	employee.UserID = &user.ID

	if err := db.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create employee: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "User and Employee created successfully",
		"user":     user,
		"employee": employee,
	})
}

func UpdateUserByAdmin(c *gin.Context) {
	db := config.DB()

	// รับ ID ของ User จาก URL parameter
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var user entity.User
	// ค้นหา User จากฐานข้อมูล
	if err := db.Preload("Employee").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// อัปเดตข้อมูลผู้ใช้
	user.Username = c.PostForm("username")
	user.Email = c.PostForm("email")
	user.FirstName = c.PostForm("first_name")
	user.LastName = c.PostForm("last_name")

	// อัปเดตวันเกิด
	birthDayStr := c.PostForm("birthDay")
	if birthDayStr != "" {
		birthDay, err := time.Parse("2006-01-02", birthDayStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รูปแบบวันเกิดไม่ถูกต้อง: %v", err)})
			return
		}
		user.Birthday = birthDay
	}

	user.PhoneNumber = c.PostForm("phonenumber")
	userRoleIDStr := c.PostForm("userRoleID")
	if userRoleIDStr != "" {
		userRoleID, err := strconv.ParseUint(userRoleIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userRoleID format"})
			return
		}
		user.UserRoleID = uint(userRoleID)
	}

	genderIDStr := c.PostForm("genderID")
	if genderIDStr != "" {
		genderID, err := strconv.ParseUint(genderIDStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid genderID format"})
			return
		}
		user.GenderID = uint(genderID)
	}

	user.Password = c.PostForm("password")

	// อัปเดตรูปโปรไฟล์ (ถ้าระบุ)
	profileImage, err := c.FormFile("profile")
	if profileImage != nil {
		uploadDir := "uploads"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create upload directory: %v", err)})
			return;
		}
		fileName := fmt.Sprintf("%s-%s", uuid.New().String(), profileImage.Filename)
		filePath := filepath.Join(uploadDir, fileName)

		if err := c.SaveUploadedFile(profileImage, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save profile image: %v", err)})
			return
		}
		user.Profile = filePath
	}

	// อัปเดตข้อมูลพนักงาน
	if user.Employee != nil {
		user.Employee.Bio = c.PostForm("bio")
		user.Employee.Experience = c.PostForm("experience")
		user.Employee.Education = c.PostForm("education")

		salaryStr := c.PostForm("salary")
		if salaryStr != "" {
			salary, err := strconv.ParseFloat(salaryStr, 64)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary format"})
				return
			}
			user.Employee.Salary = salary
		}

		fullTimeStr := c.PostForm("fullTime")
		if fullTimeStr != "" {
			user.Employee.FullTime = fullTimeStr == "true"
		}
	}

	// บันทึกข้อมูลที่เปลี่ยนแปลงลงในฐานข้อมูล
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update user: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User and Employee updated successfully",
		"user":    user,
	})
}

//task

func ListGenders(c *gin.Context) {
	var genders []entity.Genders

	db := config.DB()

	db.Find(&genders)

	c.JSON(http.StatusOK, &genders)
}

func ListUserRole(c *gin.Context) {
	var userroles []entity.UserRoles

	db := config.DB()

	db.Find(&userroles)

	c.JSON(http.StatusOK, &userroles)
}

func GetEmployeeByUserID(c *gin.Context) {
	db := config.DB()
	id := c.Param("userID")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ UserID"})
		return
	}

	var employee entity.Employee
	err := db.Where("id = ?", id).First(&employee).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "ไม่พบ Employee ที่เกี่ยวข้องกับ UserID",
				"details": "record not found",
				"id":      id,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "เกิดข้อผิดพลาดในการ Query",
				"details": err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "พบข้อมูล Employee",
		"employeeID": employee.ID,
	})
}

func UpdateUserAndEmployee(c *gin.Context) {
	var user entity.User
	var employee entity.Employee
	db := config.DB() // Replace with your DB instance

	// Parse the user ID from the URL
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing user ID"})
		return
	}

	// Fetch the User entity
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Fetch the Employee entity
	if err := db.Where("user_id = ?", id).First(&employee).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	// Parse form data
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	// Update User fields
	if username := c.PostForm("Username"); username != "" {
		user.Username = username
	}

	if password := c.PostForm("Password"); password != "" {
		user.Password = password // Consider hashing the password
	}

	if email := c.PostForm("Email"); email != "" {
		user.Email = email
	}

	if firstName := c.PostForm("FirstName"); firstName != "" {
		user.FirstName = firstName
	}

	if lastName := c.PostForm("LastName"); lastName != "" {
		user.LastName = lastName
	}

	if birthday := c.PostForm("Birthday"); birthday != "" {
		if parsedDate, err := time.Parse("2006-01-02", birthday); err == nil {
			user.Birthday = parsedDate
		}
	}

	if phoneNumber := c.PostForm("PhoneNumber"); phoneNumber != "" {
		user.PhoneNumber = phoneNumber
	}

	if userRoleID := c.PostForm("UserRoleID"); userRoleID != "" {
		if roleID, err := strconv.ParseUint(userRoleID, 10, 32); err == nil {
			user.UserRoleID = uint(roleID)
		}
	}

	if genderID := c.PostForm("GenderID"); genderID != "" {
		if gID, err := strconv.ParseUint(genderID, 10, 32); err == nil {
			user.GenderID = uint(gID)
		}
	}

	// Update Employee fields
	if bio := c.PostForm("Bio"); bio != "" {
		employee.Bio = bio
	}

	if experience := c.PostForm("Experience"); experience != "" {
		employee.Experience = experience
	}

	if education := c.PostForm("Education"); education != "" {
		employee.Education = education
	}

	if salary := c.PostForm("Salary"); salary != "" {
		if s, err := strconv.ParseFloat(salary, 64); err == nil {
			employee.Salary = s
		}
	}

	if fullTime := c.PostForm("FullTime"); fullTime != "" {
		employee.FullTime = fullTime == "true"
	}

	// Handle Profile Picture Upload
	file, err := c.FormFile("Profile")
	if err == nil && file != nil {
		uploadDir := "uploads"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		filePath := filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		user.Profile = filePath
	}

	// Save the User entity
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// Save the Employee entity
	if err := db.Save(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update employee"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "User and Employee updated successfully",
		"user":     user,
		"employee": employee,
	})
}

//task again
