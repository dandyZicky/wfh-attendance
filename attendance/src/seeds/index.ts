import { attendanceDB } from "../db/index.js";
import { mockAttendanceRecords } from "./attendance.js";

const table = "attendance_records";

async function seedDatabase() {
    console.log("Starting attendance database seeding...");
    
    for (const record of mockAttendanceRecords) {
        const stmt = `INSERT INTO ${table} (user_key, date, check_in_time, check_out_time, work_location, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            record.user_key,
            record.date,
            record.check_in_time,
            record.check_out_time,
            record.work_location,
            record.status,
            record.notes
        ];

        try {
            const conn = await attendanceDB.getConnection();
            await conn.execute(stmt, values);
            attendanceDB.releaseConnection(conn);
            console.log(`✓ Inserted attendance record for user ${record.user_key} on ${record.date}`);
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log(`⚠ Skipped duplicate record for user ${record.user_key} on ${record.date}`);
            } else {
                console.error(`✗ Error inserting record for user ${record.user_key} on ${record.date}:`, error.message);
            }
        }
    }
    
    console.log("Attendance database seeding completed!");
}

await seedDatabase();
process.exit(0); 