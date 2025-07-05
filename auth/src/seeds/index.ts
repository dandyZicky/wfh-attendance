import { authDB } from "../db/index.js";
import { mockUsers } from "./users.js";
import * as bcrypt from "bcrypt";

const saltRounds = 11;
const table = "users";

async function seedDatabase() {
    for (const {email, username, password, user_key} of mockUsers) {
        const hash = await bcrypt.hash(password, saltRounds);
        const stmt = `INSERT INTO ${table} (user_key, email, username, password_hash) VALUES (?, ?, ?, ?)`;
        const values = [user_key, email, username, hash];

        const conn = await authDB.getConnection();
        
        await conn.execute(stmt, values)

        authDB.releaseConnection(conn);
    }
}


await seedDatabase();
process.exit(0)