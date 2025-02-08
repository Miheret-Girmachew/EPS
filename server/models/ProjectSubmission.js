module.exports = (sequelize, DataTypes) => {
  const ProjectSubmission = sequelize.define(
    "ProjectSubmission",
    {
      psi_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId", // Ensure this matches the primary key in Users table
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      batch_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Batches",
          key: "batchId", // Ensure this matches the primary key in Batches table
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      group: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Projects",
          key: "projectId", // Ensure this matches the primary key in Projects table
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      github_link: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isUrl: true,
        },
      },
      deployment_link: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isUrl: true,
        },
      },
      // ADD THE STATUS FIELD HERE
      status: {
        type: DataTypes.ENUM("pending", "well done", "has problems"),
        allowNull: false,
        defaultValue: "pending",
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      visibility: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      edit_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      tableName: "ProjectSubmissions",
    }
  );

  ProjectSubmission.associate = (models) => {
    ProjectSubmission.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });

    ProjectSubmission.belongsTo(models.Batch, {
      foreignKey: "batch_id",
      as: "batch",
      onDelete: "CASCADE",
    });

    ProjectSubmission.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
      onDelete: "CASCADE",
    });
  };

  return ProjectSubmission;
};