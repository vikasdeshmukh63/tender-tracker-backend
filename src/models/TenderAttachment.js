export default (sequelize, DataTypes) => {
  const TenderAttachment = sequelize.define(
    "TenderAttachment",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenderId: { type: DataTypes.INTEGER, allowNull: false },
      file_url: DataTypes.TEXT,
      file_name: DataTypes.STRING,
      file_size: DataTypes.INTEGER,
      uploaded_by: DataTypes.STRING,
      document_type: DataTypes.STRING,    // rfp | proposal | quote | technical | commercial | contract | other
      file_object_name: DataTypes.STRING, // MinIO object key — used for deletion
    },
    {
      tableName: "tender_attachments",
      timestamps: true,
      underscored: true,
    }
  );

  return TenderAttachment;
};

