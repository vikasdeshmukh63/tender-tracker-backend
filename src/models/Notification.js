export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_email: { type: DataTypes.STRING, allowNull: false },
      // Human-readable notification text shown in the bell
      message: { type: DataTypes.TEXT },
      // Type: "due_date" | "status_change" | "task_due" | "task_assigned"
      type: { type: DataTypes.STRING, defaultValue: "due_date" },
      // Deduplication key — prevents the same alert from being stored twice
      dedup_key: { type: DataTypes.STRING },
      // Optional link to the related tender
      tender_id: { type: DataTypes.INTEGER },
      tender_name: { type: DataTypes.STRING },
      // Legacy / extra fields
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
