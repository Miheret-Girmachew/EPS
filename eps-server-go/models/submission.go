package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProjectSubmission struct {
	PsiID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"psi_id"`
	UserID         uuid.UUID `gorm:"type:uuid;column:user_id" json:"user_id"`
	BatchID        uuid.UUID `gorm:"type:uuid;column:batch_id" json:"batch_id"`
	ProjectID      uuid.UUID `gorm:"type:uuid;column:project_id" json:"project_id"`
	Group          string    `json:"group"`
	GithubLink     string    `gorm:"unique;not null" json:"github_link"`
	DeploymentLink string    `gorm:"unique;not null" json:"deployment_link"`
	Status         string    `gorm:"type:varchar(20);default:'pending'" json:"status"` 
	Timestamp      time.Time `gorm:"default:now()" json:"timestamp"`
	Visibility     bool      `gorm:"default:true" json:"visibility"`
	EditCount      int       `gorm:"default:0" json:"edit_count"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`

	User    User    `gorm:"foreignKey:UserID"`
	Batch   Batch   `gorm:"foreignKey:BatchID"`
	Project Project `gorm:"foreignKey:ProjectID"`
}

func (ps *ProjectSubmission) BeforeCreate(tx *gorm.DB) (err error) {
	ps.PsiID = uuid.New()
	return
}