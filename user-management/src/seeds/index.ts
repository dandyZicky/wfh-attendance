import { userManagementDB } from "../db/index.js";
import { mockUsers } from "./users.js";

const table = "employees"

async function seedDatabase() {
    for (const {username, email, role_id, first_name, last_name} of mockUsers) {
        const stmt = `INSERT INTO ${table} (username, email, role_id, first_name, last_name) VALUES (?, ?, ?, ?, ?)`;
        const values = [username, email, role_id, first_name, last_name];

        const conn = await userManagementDB.getConnection();
        
        await conn.execute(stmt, values)

        userManagementDB.releaseConnection(conn);
    }
}


await seedDatabase();
process.exit(0)