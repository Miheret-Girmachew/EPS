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
          key: 'userId', // Foreign key in the Users table
        },
      },
      groups: {
        type: DataTypes.JSON, // Use DataTypes.JSON instead of Sequelize.JSON
        allowNull: false,
        defaultValue: [],
      },
      groupCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      instructorNames: {
        type: DataTypes.JSON, // JSON for multiple instructor names
        allowNull: true, // Set to true if it's optional
        defaultValue: [], // Ensure it initializes as an empty array
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

  // Define Associations
  Batch.associate = (models) => {
    Batch.belongsTo(models.User, {
      foreignKey: 'user_id', // Matches the field in this table
      onDelete: 'CASCADE', // Deletes batches when the associated user is deleted
    });
  };

  return Batch;
};
