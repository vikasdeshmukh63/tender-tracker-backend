export default (sequelize, DataTypes) => {
  const UserProfile = sequelize.define(
    "UserProfile",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      full_name: DataTypes.STRING,
      employee_number: DataTypes.STRING,
      role: DataTypes.STRING,
      designation: DataTypes.STRING,
      team: DataTypes.ENUM("sales", "presales"),
    },
    {
      tableName: "user_profiles",
      timestamps: true,
      underscored: true,
    }
  );

  return UserProfile;
};

