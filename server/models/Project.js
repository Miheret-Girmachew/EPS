module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    projectId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
      
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    projectDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    batchId: {
      type: DataTypes.UUID,
  
      allowNull: false,
      references: {
        model: 'Batches',
        key: 'batchId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    visibility: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    timestamps: true,
  });

  Project.associate =models=>{
    Project.belongsTo(models.Batch,{foreignKey:'batchId',onDelete:'CASCADE'})
  }
  return Project;
};
