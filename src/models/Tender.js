export default (sequelize, DataTypes) => {
  const Tender = sequelize.define(
    "Tender",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      team: { type: DataTypes.ENUM("sales", "presales"), allowNull: false },
      opp_type: DataTypes.STRING,
      status: DataTypes.STRING,
      pot_id: DataTypes.STRING,
      tender_name: DataTypes.STRING,
      date: DataTypes.DATEONLY,
      month: DataTypes.STRING,
      year: DataTypes.STRING,
      regional_sales_manager: DataTypes.STRING,
      sales_person: DataTypes.STRING,
      senior_solution_architect: DataTypes.STRING,
      solution_architect_assigned: DataTypes.STRING,
      solution_architect_employee_number: DataTypes.STRING,
      prebid_date: DataTypes.DATEONLY,
      presentation_date: DataTypes.DATEONLY,
      meeting_date: DataTypes.DATEONLY,
      submission_date: DataTypes.DATEONLY,
      work_status: DataTypes.STRING,
      priority: DataTypes.STRING,
      estimated_value: DataTypes.INTEGER,
      client_name: DataTypes.STRING,
      assigned_to: DataTypes.STRING,
      submission_deadline: DataTypes.DATEONLY,
      category: DataTypes.STRING,
      source: DataTypes.STRING,
      contact_email: DataTypes.STRING,
      contact_phone: DataTypes.STRING,
      description: DataTypes.TEXT,
      remarks: DataTypes.TEXT,
    },
    {
      tableName: "tenders",
      timestamps: true,
      underscored: true,
    }
  );

  return Tender;
};

