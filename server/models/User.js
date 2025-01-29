module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Email already exists",
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("1", "2", "3"), // 'admin' =1, 'instructor' =2, 'student'=3
      allowNull: false,
    },
    visibility: {
      type: DataTypes.ENUM("1","2","0"), // 'active' =1, 'completed' =2, 'struckoff'=0
      allowNull: false,
      defaultValue: "1",
    },
    secretQuestion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secretAnswer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    batch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    timestamps: true,
  });

  User.associate = (models) => {
    // Associations if needed
  };

  return User;
};
