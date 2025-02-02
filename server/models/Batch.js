module.exports = (sequelize, DataTypes) => {
  const Batch = sequelize.define(
    'Batch',
    {
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
        defaultValue: [],
      },
      groupCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      instructors: {
        type: DataTypes.JSON, 
        allowNull: true, 
        defaultValue: [], 
      },
      instructorNames: {
        type: DataTypes.JSON, 
        allowNull: true,
        defaultValue: [], 
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
    },
    {
      timestamps: true,
    }
  );

 
  Batch.associate = (models) => {
    Batch.belongsTo(models.User, {
      foreignKey: 'user_id', 
      onDelete: 'CASCADE',
    });
  };

  return Batch;
};
