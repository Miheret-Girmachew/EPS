module.exports = (sequelize, DataTypes) => {
    try {
      const CertificateGroups = sequelize.define('CertificateGroups', {
        c_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'Users', // Assuming you have a Users model
            key: 'userId',    // Assuming the primary key in Users model is userId
          },
        },
      }, {
        tableName: 'CertificateGroups',
        timestamps: true,
      });
    
      CertificateGroups.associate = function(models) {
        CertificateGroups.belongsTo(models.User, {
          foreignKey: 'user_id',
          as: 'user'
        });
      };
    
      return CertificateGroups;
  
    } catch (error){
      console.error("Error in certificategroups.js")
    }
     
    };