module.exports = (sequelize, DataTypes) => {
  const Batch = sequelize.define('Batch', {
    batchId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    batchName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
      },
    },
    groups: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    groupCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    instructorNames: {
      type: DataTypes.JSON, 
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    visibility: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    timestamps: true,
  });

  Batch.associate =models=>{ 
    Batch.belongsTo(models.User,{foreignKey:'userId',onDelete:'CASCADE'})
  }
  return Batch;
};
