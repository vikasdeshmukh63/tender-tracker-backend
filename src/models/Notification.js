export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_email: { type: DataTypes.STRING, allowNull: false },
      title: DataTypes.STRING,
      body: DataTypes.TEXT,
      data: DataTypes.JSONB,
      is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "notifications",
      timestamps: true,
      underscored: true,
    }
  );

  return Notification;
};

