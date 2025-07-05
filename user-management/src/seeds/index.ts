import { userManagementDB } from "../db/index.js";
import { mockUsers } from "./users.js";

const table = "employees"

async function seedDatabase() {
    for (const {user_key, username, email, department_id, first_name, last_name, hire_date} of mockUsers) {
        const stmt = `INSERT INTO ${table} (user_key, username, email, department_id, first_name, last_name, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [user_key, username, email, department_id, first_name, last_name, hire_date];

        const conn = await userManagementDB.getConnection();
        
        await conn.execute(stmt, values)

        userManagementDB.releaseConnection(conn);
    }
}


await seedDatabase();
process.exit(0)