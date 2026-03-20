export default (sequelize, DataTypes) => {
  const NotificationRule = sequelize.define(
    "NotificationRule",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_email: { type: DataTypes.STRING, allowNull: false },
      // Alert type: "due_date" | "status_change" | "task_due"
      type: { type: DataTypes.STRING, defaultValue: "due_date" },
      // For due_date / task_due: how many days before the date to fire
      threshold_days: { type: DataTypes.INTEGER, defaultValue: 3 },
      // For due_date: which tender date fields to watch (JSONB array of strings)
      date_fields: { type: DataTypes.JSONB, defaultValue: [] },
      // For status_change: which statuses to watch (JSONB array of strings)
      watch_statuses: { type: DataTypes.JSONB, defaultValue: [] },
      // Whether to also send an email for this rule
      send_email: { type: DataTypes.BOOLEAN, defaultValue: false },
      // Whether this rule is currently active
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "notification_rules",
      timestamps: true,
      underscored: true,
    }
  );

  return NotificationRule;
};
