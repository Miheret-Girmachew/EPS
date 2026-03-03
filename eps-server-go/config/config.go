package config

import (
	"encoding/json"
	"os"
)

type DbConfig struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Database string `json:"database"`
	Host     string `json:"host"`
	Dialect  string `json:"dialect"`
}

func LoadConfig(env string) DbConfig {
	file, _ := os.ReadFile("config/config.json")
	var allConfigs map[string]DbConfig
	json.Unmarshal(file, &allConfigs)
	return allConfigs[env]
}