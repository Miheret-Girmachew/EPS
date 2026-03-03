package controllers

import (
	"eps-server-go/models"
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
)

func CreateSubmission(c *gin.Context) {
	var input models.ProjectSubmission
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Validation failed"})
		return
	}

	var project models.Project
	models.DB.First(&project, input.ProjectID)

	if time.Now().After(project.ProjectDeadline) {
		c.JSON(http.StatusForbidden, gin.H{"message": "Deadline has passed"})
		return
	}

	var existing models.ProjectSubmission
	res := models.DB.Where("user_id = ? AND project_id = ?", input.UserID, input.ProjectID).First(&existing)
	if res.RowsAffected > 0 {
		c.JSON(http.StatusConflict, gin.H{"message": "Already submitted"})
		return
	}

	models.DB.Create(&input)
	c.JSON(http.StatusCreated, input)
}