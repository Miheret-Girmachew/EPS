package routes

import (
	"eps-server-go/middleware"
	"github.com/gin-gonic/gin"
	"github.com/swaggo/files"
	"github.com/swaggo/gin-swagger"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/api-docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")
	{
		RegisterUserRoutes(api)
		RegisterBatchRoutes(api)
		RegisterProjectRoutes(api)
		RegisterSubmissionRoutes(api)
		RegisterCertificateRoutes(api)
	}

	return r
}