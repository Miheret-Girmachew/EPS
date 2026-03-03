package routes

import (
	"eps-server-go/controllers"
	"eps-server-go/middleware"
	"github.com/gin-gonic/gin"
)

func RegisterBatchRoutes(rg *gin.RouterGroup) {
	batches := rg.Group("/batches")
	{
		// Public / Read-only
		batches.GET("/get/:id", controllers.GetBatchById)
		batches.GET("/all", controllers.GetAllBatches)
		batches.GET("/:id/groups", controllers.GetGroupsByBatchId)
		batches.GET("/:id/groups/:groupName", controllers.GetGroupByBatchIdAndGroupName)

		// Protected
		protected := batches.Group("/")
		protected.Use(middleware.AuthenticateToken())
		{
			protected.POST("/create", controllers.CreateBatch)
			protected.PATCH("/update/:id", controllers.UpdateBatchById)
			protected.DELETE("/delete/:id", controllers.DeleteBatchById)
			
			// Group Management
			protected.POST("/add/:batchId/groups", controllers.AddGroupToBatch)
			protected.DELETE("/:batchId/groups/:groupName", controllers.RemoveGroupFromBatch)
			protected.PATCH("/up/:id", controllers.UpdateGroupInBatch)

			// Instructor Assignments
			protected.POST("/assign-instructor/batch", controllers.AssignInstructorToBatch)
			protected.POST("/assign-instructor/group", controllers.AssignInstructorToGroup)
			protected.PATCH("/update-instructors/group", controllers.UpdateInstructorsInGroup)
			protected.GET("/instructor/:userId/batches", controllers.GetBatchesForInstructor)
		}
	}
}