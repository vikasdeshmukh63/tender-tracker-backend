export default (sequelize, DataTypes) => {
  const NotificationRule = sequelize.define(
    "NotificationRule",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_email: { type: DataTypes.STRING, allowNull: false },
      rule_type: DataTypes.STRING,
      event_type: DataTypes.STRING,
      threshold_hours: DataTypes.INTEGER,
      is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
      metadata: DataTypes.JSONB,
    },
    {
      tableName: "notification_rules",
      timestamps: true,
      underscored: true,
    }
  );

  return NotificationRule;
};

