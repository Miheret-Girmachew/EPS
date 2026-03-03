package controllers

import (
	"eps-server-go/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AddStudentToCertificateGroup(c *gin.Context) {
	var input struct {
		StudentId string `json:"studentId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "studentId is required"})
		return
	}

	val, _ := c.Get("user")
	currentUser := val.(models.User)
	if currentUser.Role != "2" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Only instructors can add students to certificate group"})
		return
	}

	var student models.User
	if err := models.DB.Where("user_id = ?", input.StudentId).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "student not found"})
		return
	}

	studentUUID, _ := uuid.Parse(input.StudentId)
	entry := models.CertificateGroup{
		UserID: studentUUID,
	}

	if err := models.DB.Create(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to add student", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "student is in the certificate group"})
}

func GetCertificatedStudents(c *gin.Context) {
	var entries []models.CertificateGroup
	
	if err := models.DB.Preload("User").Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error finding certificated users", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "all the certificate users",
		"entry":   entries,
	})
}

func DeleteCertificatedStudent(c *gin.Context) {
	id := c.Param("id")

	var entry models.CertificateGroup
	if err := models.DB.Where("c_id = ?", id).First(&entry).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		return
	}

	models.DB.Delete(&entry)

	c.JSON(http.StatusOK, gin.H{"message": "User was deleted"})
}