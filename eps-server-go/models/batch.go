package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/datatypes"
)

type Batch struct {
	BatchID         uuid.UUID      `gorm:"type:uuid;primaryKey" json:"batchId"`
	BatchName       string         `gorm:"not null" json:"batchName"`
	UserID          uuid.UUID      `gorm:"type:uuid;column:user_id" json:"userId"` 
	Groups          datatypes.JSON `json:"groups"`          
	GroupCount      int            `gorm:"default:0" json:"groupCount"`
	Instructors     datatypes.JSON `json:"instructors"`     
	InstructorNames datatypes.JSON `json:"instructorNames"` 
	InstructorIds   datatypes.JSON `json:"instructorIds"`   
	Visibility      bool           `gorm:"default:true" json:"visibility"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}

func (b *Batch) BeforeCreate(tx *gorm.DB) (err error) {
	b.BatchID = uuid.New()
	return
}