package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	UserID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"userId"`
	FirstName      string    `json:"firstName"`
	LastName       string    `json:"lastName"`
	Email          string    `gorm:"uniqueIndex;not null" json:"email"`
	Password       string    `gorm:"not null" json:"-"`
	Role           string    `gorm:"type:varchar(1);not null" json:"role"`      
	Visibility     string    `gorm:"type:varchar(1);default:'1'" json:"visibility"`
	SecretQuestion string    `json:"secretQuestion"`
	SecretAnswer   string    `json:"-"`
	Batch          string    `json:"batch"`
	Group          string    `json:"group"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.UserID = uuid.New()
	return
}