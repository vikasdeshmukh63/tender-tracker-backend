import bcrypt from "bcryptjs";
import models, { sequelize } from "../models/index.js";

async function main() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();

    // Optional: ensure tables exist (no destructive sync)
    await sequelize.sync();

    console.log("Seeding sample data...");

    // --- USERS & PROFILES ---
    const password = "Password@123";
    const passwordHash = await bcrypt.hash(password, 10);

    // Helper to upsert user + profile
    const ensureUserWithProfile = async ({
      email,
      full_name,
      employee_number,
      designation,
      role = "user",
      team,
    }) => {
      let user = await models.User.findOne({ where: { email } });
      if (!user) {
        user = await models.User.create(
          {
            email,
            passwordHash,
            role,
            isActive: true,
            profile: {
              email,
              full_name,
              employee_number,
              designation,
              role,
              team,
            },
          },
          { include: [{ model: models.UserProfile, as: "profile" }] }
        );
      } else {
        // ensure profile for this team exists
        const existingProfile = await models.UserProfile.findOne({
          where: { userId: user.id, team },
        });
        if (!existingProfile) {
          await models.UserProfile.create({
            userId: user.id,
            email,
            full_name,
            employee_number,
            designation,
            role,
            team,
          });
        }
      }
      return user;
    };

    // Sample sales users
    await ensureUserWithProfile({
      email: "sales1@esds.co.in",
      full_name: "Sales User One",
      employee_number: "S1001",
      designation: "Sales Executive",
      role: "user",
      team: "sales",
    });

    await ensureUserWithProfile({
      email: "saleslead@esds.co.in",
      full_name: "Sales Team Lead",
      employee_number: "S1002",
      designation: "Sales Manager",
      role: "team_lead",
      team: "sales",
    });

    // Sample presales users
    await ensureUserWithProfile({
      email: "presales1@esds.co.in",
      full_name: "Presales User One",
      employee_number: "P2001",
      designation: "Solution Architect",
      role: "user",
      team: "presales",
    });

    await ensureUserWithProfile({
      email: "presaleslead@esds.co.in",
      full_name: "Presales Team Lead",
      employee_number: "P2002",
      designation: "Senior Solution Architect",
      role: "team_lead",
      team: "presales",
    });

    // Extra mixed-role users
    await ensureUserWithProfile({
      email: "account.manager@esds.co.in",
      full_name: "Key Account Manager",
      employee_number: "S1003",
      designation: "Key Account Manager",
      role: "user",
      team: "sales",
    });

    await ensureUserWithProfile({
      email: "security.sa@esds.co.in",
      full_name: "Security Solution Architect",
      employee_number: "P2003",
      designation: "Security Architect",
      role: "user",
      team: "presales",
    });

    console.log("Sample users created.");
    console.log("Sample login password for all above users:", password);

    // --- TENDERS ---
    const existing = await models.Tender.findOne({ where: { pot_id: "POT-TEST-001" } });
    if (!existing) {
      await models.Tender.create({
        team: "sales",
        opp_type: "new_business",
        status: "in_progress",
        pot_id: "POT-TEST-001",
        tender_name: "Sample Government Cloud Tender",
        date: "2026-03-10",
        regional_sales_manager: "Sales Team Lead",
        sales_person: "Sales User One",
        senior_solution_architect: "Presales Team Lead",
        solution_architect_assigned: "Presales User One",
        solution_architect_employee_number: "P2001",
        prebid_date: "2026-03-18",
        presentation_date: "2026-03-20",
        meeting_date: "2026-03-22",
        submission_date: "2026-03-25",
        priority: "high",
        estimated_value: 50000000,
        client_name: "Sample State Govt Dept",
        category: "cloud",
        source: "gem",
        contact_email: "it-head@example.gov.in",
        contact_phone: "+91-9876543210",
        description: "End-to-end cloud hosting, DR and managed services for critical government workloads.",
        remarks: "High visibility opportunity. Coordinate closely with presales for solution design.",
      });
    }

    const existing2 = await models.Tender.findOne({ where: { pot_id: "POT-TEST-002" } });
    if (!existing2) {
      await models.Tender.create({
        team: "presales",
        opp_type: "renewal",
        status: "submitted",
        pot_id: "POT-TEST-002",
        tender_name: "DC & DR Renewal for Enterprise",
        date: "2026-02-15",
        regional_sales_manager: "Sales Team Lead",
        sales_person: "Sales User One",
        senior_solution_architect: "Presales Team Lead",
        solution_architect_assigned: "Presales User One",
        solution_architect_employee_number: "P2001",
        prebid_date: "2026-02-20",
        presentation_date: "2026-02-22",
        meeting_date: "2026-02-25",
        submission_date: "2026-02-28",
        priority: "medium",
        estimated_value: 15000000,
        client_name: "Enterprise Corp Ltd",
        category: "data_center",
        source: "direct",
        contact_email: "cio@enterprisecorp.com",
        contact_phone: "+91-9123456780",
        description: "Renewal of existing data center and DR services with performance enhancements.",
        remarks: "Existing happy customer, good chance to win renewal.",
      });
    }

    const existing3 = await models.Tender.findOne({ where: { pot_id: "POT-TEST-003" } });
    if (!existing3) {
      await models.Tender.create({
        team: "sales",
        opp_type: "upsell",
        status: "won",
        pot_id: "POT-TEST-003",
        tender_name: "Managed Security Services Upsell",
        date: "2025-11-05",
        regional_sales_manager: "Sales Team Lead",
        sales_person: "Sales User One",
        senior_solution_architect: "Security Solution Architect",
        solution_architect_assigned: "Presales User One",
        solution_architect_employee_number: "P2003",
        prebid_date: "2025-11-10",
        presentation_date: "2025-11-12",
        meeting_date: "2025-11-15",
        submission_date: "2025-11-18",
        priority: "critical",
        estimated_value: 7500000,
        client_name: "FinServe Bank Ltd",
        category: "security",
        source: "referral",
        contact_email: "ciso@finservebank.com",
        contact_phone: "+91-9810011223",
        description: "Upsell of managed SOC, SIEM and endpoint protection for existing banking customer.",
        remarks: "Won against strong competition due to better service SLAs.",
      });
    }

    const existing4 = await models.Tender.findOne({ where: { pot_id: "POT-TEST-004" } });
    if (!existing4) {
      await models.Tender.create({
        team: "presales",
        opp_type: "new_business",
        status: "lost",
        pot_id: "POT-TEST-004",
        tender_name: "National Data Center Build",
        date: "2025-09-01",
        regional_sales_manager: "Sales Team Lead",
        sales_person: "Sales User One",
        senior_solution_architect: "Presales Team Lead",
        solution_architect_assigned: "Security Solution Architect",
        solution_architect_employee_number: "P2003",
        prebid_date: "2025-09-10",
        presentation_date: "2025-09-15",
        meeting_date: "2025-09-18",
        submission_date: "2025-09-25",
        priority: "high",
        estimated_value: 100000000,
        client_name: "National IT Authority",
        category: "data_center",
        source: "gem",
        contact_email: "tenders@nita.gov.in",
        contact_phone: "+91-9933445566",
        description: "Greenfield national data center with active-active DR and managed services.",
        remarks: "Lost on commercials; useful for analytics and pipeline history.",
      });
    }

    console.log("Sample tenders created.");
    console.log("Seeding complete.");
    await sequelize.close();
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();

