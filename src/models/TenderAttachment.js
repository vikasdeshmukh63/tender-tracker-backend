export default (sequelize, DataTypes) => {
  const TenderAttachment = sequelize.define(
    "TenderAttachment",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenderId: { type: DataTypes.INTEGER, allowNull: false },
      file_url: DataTypes.STRING,
      file_name: DataTypes.STRING,
      file_size: DataTypes.INTEGER,
      uploaded_by: DataTypes.STRING,
    },
    {
      tableName: "tender_attachments",
      timestamps: true,
      underscored: true,
    }
  );

  return TenderAttachment;
};

