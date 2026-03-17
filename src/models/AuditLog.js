export default (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenderId: { type: DataTypes.INTEGER, allowNull: false },
      event_type: DataTypes.STRING,
      message: DataTypes.TEXT,
      changes: DataTypes.JSONB,
      performed_by_email: DataTypes.STRING,
      performed_by_name: DataTypes.STRING,
    },
    {
      tableName: "audit_logs",
      timestamps: true,
      underscored: true,
    }
  );

  return AuditLog;
};

