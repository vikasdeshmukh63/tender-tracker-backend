import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

import UserModel from "./User.js";
import UserProfileModel from "./UserProfile.js";
import TenderModel from "./Tender.js";
import TaskModel from "./Task.js";
import AuditLogModel from "./AuditLog.js";
import TenderAttachmentModel from "./TenderAttachment.js";
import TaskCommentModel from "./TaskComment.js";
import NotificationRuleModel from "./NotificationRule.js";
import NotificationModel from "./Notification.js";

const models = {};

models.User = UserModel(sequelize, DataTypes);
models.UserProfile = UserProfileModel(sequelize, DataTypes);
models.Tender = TenderModel(sequelize, DataTypes);
models.Task = TaskModel(sequelize, DataTypes);
models.AuditLog = AuditLogModel(sequelize, DataTypes);
models.TenderAttachment = TenderAttachmentModel(sequelize, DataTypes);
models.TaskComment = TaskCommentModel(sequelize, DataTypes);
models.NotificationRule = NotificationRuleModel(sequelize, DataTypes);
models.Notification = NotificationModel(sequelize, DataTypes);

// Associations
models.User.hasOne(models.UserProfile, { foreignKey: "userId", as: "profile" });
models.UserProfile.belongsTo(models.User, { foreignKey: "userId", as: "user" });

models.Tender.hasMany(models.Task, { foreignKey: "tenderId", as: "tasks" });
models.Task.belongsTo(models.Tender, { foreignKey: "tenderId", as: "tender" });

models.Tender.hasMany(models.AuditLog, { foreignKey: "tenderId", as: "auditLogs" });
models.AuditLog.belongsTo(models.Tender, { foreignKey: "tenderId", as: "tender" });

models.Tender.hasMany(models.TenderAttachment, { foreignKey: "tenderId", as: "attachments" });
models.TenderAttachment.belongsTo(models.Tender, { foreignKey: "tenderId", as: "tender" });

models.Task.hasMany(models.TaskComment, { foreignKey: "taskId", as: "comments" });
models.TaskComment.belongsTo(models.Task, { foreignKey: "taskId", as: "task" });

export { sequelize };
export default models;

