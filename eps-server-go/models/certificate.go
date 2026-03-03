package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CertificateGroup struct {
	CID       uuid.UUID `gorm:"type:uuid;primaryKey" json:"c_id"`
	UserID    uuid.UUID `gorm:"type:uuid;column:user_id" json:"user_id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	User User `gorm:"foreignKey:UserID"`
}

func (cg *CertificateGroup) BeforeCreate(tx *gorm.DB) (err error) {
	cg.CID = uuid.New()
	return
}