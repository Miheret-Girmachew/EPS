package controllers

import (
	"eps-server-go/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CreateProject(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	currentUser := userVal.(models.User)

	if currentUser.Role != "1" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Only admins can create projects"})
		return
	}

	var input struct {
		ProjectName     string    `json:"projectName" binding:"required"`
		ProjectDeadline time.Time `json:"projectDeadline"`
		BatchID         uuid.UUID `json:"batchId" binding:"required"`
		Visibility      *bool     `json:"visibility"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var batch models.Batch
	if err := models.DB.Where("batch_id = ?", input.BatchID).First(&batch).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Batch not found"})
		return
	}

	var existingProject models.Project
	if err := models.DB.Where("project_name = ? AND batch_id = ?", input.ProjectName, input.BatchID).First(&existingProject).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "Project with the same name already exists in this batch"})
		return
	}

	visibility := true
	if input.Visibility != nil {
		visibility = *input.Visibility
	}

	newProject := models.Project{
		ProjectName:     input.ProjectName,
		ProjectDeadline: input.ProjectDeadline,
		BatchID:         input.BatchID,
		Visibility:      visibility,
	}

	if err := models.DB.Create(&newProject).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create project"})
		return
	}

	c.JSON(http.StatusOK, newProject)
}

func GetProjects(c *gin.Context) {
	batchID := c.Param("id")
	var projects []models.Project

	if err := models.DB.Where("batch_id = ? AND visibility = ?", batchID, true).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve projects"})
		return
	}

	c.JSON(http.StatusOK, projects)
}

func GetProjectById(c *gin.Context) {
	id := c.Param("id")
	var project models.Project

	if err := models.DB.Where("project_id = ? AND visibility = ?", id, true).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Project not found or not visible"})
		return
	}

	c.JSON(http.StatusOK, project)
}

func UpdateProjectById(c *gin.Context) {
	id := c.Param("id")
	var project models.Project

	if err := models.DB.Where("project_id = ?", id).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Project not found"})
		return
	}

	var input struct {
		ProjectName     string    `json:"projectName"`
		ProjectDeadline time.Time `json:"projectDeadline"`
		BatchID         uuid.UUID `json:"batchId"`
		Visibility      *bool     `json:"visibility"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.BatchID != uuid.Nil {
		var batch models.Batch
		if err := models.DB.Where("batch_id = ?", input.BatchID).First(&batch).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"message": "Batch not found"})
			return
		}
		project.BatchID = input.BatchID
	}

	if input.ProjectName != "" && input.ProjectName != project.ProjectName {
		var duplicate models.Project
		if err := models.DB.Where("project_name = ? AND batch_id = ? AND project_id != ?", input.ProjectName, project.BatchID, id).First(&duplicate).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "A project with this name already exists in the batch"})
			return
		}
		project.ProjectName = input.ProjectName
	}

	if !input.ProjectDeadline.IsZero() {
		project.ProjectDeadline = input.ProjectDeadline
	}
	if input.Visibility != nil {
		project.Visibility = *input.Visibility
	}

	if err := models.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update project"})
		return
	}

	c.JSON(http.StatusOK, project)
}

func DeleteProjectById(c *gin.Context) {
	id := c.Param("id")

	userVal, _ := c.Get("user")
	currentUser := userVal.(models.User)
	if currentUser.Role != "1" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Only admins can delete projects"})
		return
	}

	var project models.Project
	if err := models.DB.Where("project_id = ?", id).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Project not found"})
		return
	}

	models.DB.Delete(&project)
	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}