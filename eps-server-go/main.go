package main

import (
	"eps-server-go/config"
	"eps-server-go/models"
	"eps-server-go/routes"
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	godotenv.Load()

	env := os.Getenv("NODE_ENV")
	if env == "" { env = "development" }
	dbConf := config.LoadConfig(env)

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=5432 sslmode=disable",
		dbConf.Host, dbConf.Username, dbConf.Password, dbConf.Database)
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	db.AutoMigrate(&models.User{}, &models.Batch{}, &models.Project{})
	models.DB = db 

	r := gin.Default()

	r.Use(cors.Default())

	r.GET("/api-docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	routes.RegisterRoutes(r)

	port := os.Getenv("PORT")
	if port == "" { port = "3000" }
	fmt.Printf("Server is listening on port %s\n", port)
	r.Run(":" + port)
}