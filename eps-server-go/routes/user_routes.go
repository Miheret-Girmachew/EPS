package routes

import (
	"eps-server-go/controllers"
	"eps-server-go/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(rg *gin.RouterGroup) {
	users := rg.Group("/users")
	{
		users.POST("/register", controllers.CreateUser)
		users.POST("/login", controllers.LoginUser)
		users.POST("/request-password-reset", controllers.RequestPasswordReset)
		users.POST("/reset-password/:token", controllers.ResetPassword)

		protected := users.Group("/")
		protected.Use(middleware.AuthenticateToken())
		{
			protected.GET("/:id", controllers.GetUserById)
			protected.PATCH("/:id", controllers.UpdateUserById)
			protected.PATCH("/vis/:id", controllers.UpdateUserVisibilityByAdmin)
			protected.GET("/students", controllers.GetAllStudents)
			protected.GET("/instructors", controllers.GetAllInstructors)
			protected.POST("/submission", controllers.UpdateStudentSubmissionStatus)
		}
	}
}