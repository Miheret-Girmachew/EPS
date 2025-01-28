module.exports = (sequelize, DataTypes) => {
  const ProjectSubmission = sequelize.define('ProjectSubmission', {
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
        model: 'Users',
        key: 'userId',
      },
    },
    batch_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Batches',
        key: 'batchId',
      },
    },
    group: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'projectId',
      },
    },
    github_link: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,  // Ensures the GitHub link is unique
      validate: {
        isUrl: true,  // Ensures the field contains a valid URL
      },
    },
    deployment_link: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,  // Ensures the deployment link is unique
      validate: {
        isUrl: true,  // Ensures the field contains a valid URL
      },
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
  }, {
    timestamps: true,
  });

  // Define the associations, using correct foreign key references
  ProjectSubmission.associate = models => {
    ProjectSubmission.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    ProjectSubmission.belongsTo(models.Batch, { foreignKey: 'batch_id', onDelete: 'CASCADE' });
    ProjectSubmission.belongsTo(models.Project, { foreignKey: 'project_id', onDelete: 'CASCADE' });
  };

  return ProjectSubmission;
};
