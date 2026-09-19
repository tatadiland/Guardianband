import { sequelize } from "./db.connect.js";

const columns = {
    Devices: [
        "ADD COLUMN IF NOT EXISTS apiKey VARCHAR(128) NULL UNIQUE",
        "ADD COLUMN IF NOT EXISTS activity VARCHAR(255) NULL",
        "ADD COLUMN IF NOT EXISTS connectivity VARCHAR(64) NULL",
        "ADD COLUMN IF NOT EXISTS `signal` VARCHAR(255) NULL",
        "ADD COLUMN IF NOT EXISTS lastSeen DATETIME NULL",
        "ADD COLUMN IF NOT EXISTS tampered TINYINT(1) NOT NULL DEFAULT 0",
        "ADD COLUMN IF NOT EXISTS sos TINYINT(1) NOT NULL DEFAULT 0",
    ],
    Alerts: [
        "ADD COLUMN IF NOT EXISTS deviceId INT NULL",
        "ADD COLUMN IF NOT EXISTS eventId VARCHAR(180) NULL UNIQUE",
        "ADD COLUMN IF NOT EXISTS latitude FLOAT NULL",
        "ADD COLUMN IF NOT EXISTS longitude FLOAT NULL",
    ],
};

export async function ensureSchemaColumns() {
    for (const [table, statements] of Object.entries(columns)) {
        for (const statement of statements) {
            try {
                await sequelize.query(`ALTER TABLE \`${table}\` ${statement}`);
            } catch (error) {
                if (!/duplicate column|duplicate key|already exists|doesn't exist|does not exist/i.test(error.message)) throw error;
            }
        }
    }
}