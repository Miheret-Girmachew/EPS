package middleware

import (
	"eps-server-go/models"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthenticateToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "No token, authorization denied"})
			c.Abort()
			return
		}

		tokenString := strings.Split(authHeader, " ")
		if len(tokenString) != 2 {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token format"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString[1], func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("SECRET_KEY")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusForbidden, gin.H{"message": "Token is not valid", "error": err.Error()})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"message": "Invalid token claims"})
			c.Abort()
			return
		}

		var user models.User
		userId := claims["userId"].(string) 
		
		if err := models.DB.Where("user_id = ?", userId).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Next()
	}
}