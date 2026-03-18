export default (sequelize, DataTypes) => {
  const TaskComment = sequelize.define(
    "TaskComment",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      taskId: { type: DataTypes.INTEGER, allowNull: false },
      author_email: DataTypes.STRING,
      author_name: DataTypes.STRING,
      content: DataTypes.TEXT,
      file_url: DataTypes.TEXT,
      file_name: DataTypes.STRING,
      file_object_name: DataTypes.STRING,  // MinIO object key — used for deletion
    },
    {
      tableName: "task_comments",
      timestamps: true,
      underscored: true,
    }
  );

  return TaskComment;
};

