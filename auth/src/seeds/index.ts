import { authDB } from "../db/index.js";
import { mockUsers } from "./users.js";
import * as bcrypt from "bcrypt";

const saltRounds = 1;
const table = "users";

async function seedDatabase() {
    for (const {email, username, password, user_id} of mockUsers) {
        const hash = await bcrypt.hash(password, saltRounds);
        const stmt = `INSERT INTO ${table} (email, username, password_hash, user_id) VALUES (?, ?, ?, ?)`;
        const values = [email, username, hash, user_id];

        const conn = await authDB.getConnection();
        
        await conn.execute(stmt, values)

        authDB.releaseConnection(conn);
    }
}


await seedDatabase();
process.exit(0)