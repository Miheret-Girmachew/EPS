package controllers

import (
	"encoding/json"
	"eps-server-go/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateBatch(c *gin.Context) {
	var input struct {
		BatchName string `json:"batchName" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	var existing models.Batch
	if err := models.DB.Where("batch_name = ?", input.BatchName).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "Batch already exists"})
		return
	}

	userData, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found in context"})
		return
	}

	user := userData.(models.User)
	
	newBatch := models.Batch{
		BatchName:  input.BatchName,
		UserID:     user.UserID,
		Visibility: true,
	}

	if err := models.DB.Create(&newBatch).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, newBatch)
}

func GetGroupsByBatchId(c *gin.Context) {
	id := c.Param("id")
	var batch models.Batch

	if err := models.DB.Where("batch_id = ? AND visibility = ?", id, true).First(&batch).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Batch not found"})
		return
	}

	var groups interface{}
	json.Unmarshal(batch.Groups, &groups)

	c.JSON(http.StatusOK, groups)
}