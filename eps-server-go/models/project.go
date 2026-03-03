package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Project struct {
	ProjectID       uuid.UUID `gorm:"type:uuid;primaryKey" json:"projectId"`
	ProjectName     string    `gorm:"not null" json:"projectName"`
	ProjectDeadline time.Time `json:"projectDeadline"`
	BatchID         uuid.UUID `gorm:"type:uuid" json:"batchId"`
	Visibility      bool      `gorm:"default:true" json:"visibility"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`

	Batch Batch `gorm:"foreignKey:BatchID;constraint:OnDelete:CASCADE" json:"batch,omitempty"`
}

func (p *Project) BeforeCreate(tx *gorm.DB) (err error) {
	p.ProjectID = uuid.New()
	return
}