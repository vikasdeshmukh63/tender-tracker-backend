export default (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenderId: { type: DataTypes.INTEGER, allowNull: false },
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      status: DataTypes.STRING,
      priority: DataTypes.STRING,
      due_date: DataTypes.DATEONLY,
      assigned_to: DataTypes.STRING,
      assignees: DataTypes.JSONB,
      created_by: DataTypes.STRING,
    },
    {
      tableName: "tasks",
      timestamps: true,
      underscored: true,
    }
  );

  return Task;
};

