import { ResultSetHeader, RowDataPacket } from "mysql2";
import { attendanceDB } from "../db/index.js";
import axios from "axios";

export interface AttendanceRecord {
    id: number;
    user_key: string;
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    work_location: 'office' | 'home' | 'client_site';
    status: 'present' | 'absent' | 'late' | 'half_day';
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface AttendanceReport {
    id: number;
    report_name: string;
    report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
    generated_by_user_key: string;
    date_from: string;
    date_to: string;
    department_id: number | null;
    status: 'pending' | 'completed' | 'failed';
    file_path: string | null;
    created_at: string;
    updated_at: string;
}

export class AttendanceService {
    async submitAttendance(userKey: string, attendanceData: {
        date: string;
        check_in_time?: string;
        check_out_time?: string;
        work_location: 'office' | 'home' | 'client_site';
        status: 'present' | 'absent' | 'late' | 'half_day';
        notes?: string;
    }): Promise<{ success: boolean; data?: AttendanceRecord; error?: string }> {
        try {
            // Validate user exists in user-management service
            const userManagementUrl = process.env.USER_MANAGEMENT_SERVICE_URL || "http://localhost:3001";
            const userResponse = await axios.get(`${userManagementUrl}/users/department/${userKey}`);
            
            if (userResponse.status !== 200) {
                return { success: false, error: "User not found" };
            }

            // Check if attendance record already exists for this date
            const [existingRecords] = await attendanceDB.execute<RowDataPacket[]>(
                "SELECT id FROM attendance_records WHERE user_key = ? AND date = ?",
                [userKey, attendanceData.date]
            );

            if (existingRecords.length > 0) {
                // Update existing record
                const [result] = await attendanceDB.execute<ResultSetHeader>(
                    `UPDATE attendance_records 
                     SET check_in_time = ?, check_out_time = ?, work_location = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE user_key = ? AND date = ?`,
                    [
                        attendanceData.check_in_time || null,
                        attendanceData.check_out_time || null,
                        attendanceData.work_location,
                        attendanceData.status,
                        attendanceData.notes || null,
                        userKey,
                        attendanceData.date
                    ]
                );

                if (result.affectedRows > 0) {
                    const [updatedRecord] = await attendanceDB.execute<RowDataPacket[]>(
                        "SELECT * FROM attendance_records WHERE user_key = ? AND date = ?",
                        [userKey, attendanceData.date]
                    );
                    return { success: true, data: updatedRecord[0] as AttendanceRecord };
                }
            } else {
                // Create new record
                const [result] = await attendanceDB.execute<ResultSetHeader>(
                    `INSERT INTO attendance_records 
                     (user_key, date, check_in_time, check_out_time, work_location, status, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userKey,
                        attendanceData.date,
                        attendanceData.check_in_time || null,
                        attendanceData.check_out_time || null,
                        attendanceData.work_location,
                        attendanceData.status,
                        attendanceData.notes || null
                    ]
                );

                if (result.affectedRows > 0) {
                    const [newRecord] = await attendanceDB.execute<RowDataPacket[]>(
                        "SELECT * FROM attendance_records WHERE id = ?",
                        [result.insertId]
                    );
                    return { success: true, data: newRecord[0] as AttendanceRecord };
                }
            }

            return { success: false, error: "Failed to submit attendance" };
        } catch (error) {
            console.error("Error submitting attendance:", error);
            return { success: false, error: "Internal server error" };
        }
    }

    async getAttendanceRecords(filters: {
        user_key?: string;
        date?: string;
        start_date?: string;
        end_date?: string;
        department_id?: number;
    }): Promise<{ success: boolean; data?: AttendanceRecord[]; error?: string }> {
        try {
            let query = "SELECT ar.* FROM attendance_records ar";
            const params: any[] = [];
            const conditions: string[] = [];

            if (filters.user_key) {
                conditions.push("ar.user_key = ?");
                params.push(filters.user_key);
            }

            if (filters.date) {
                conditions.push("ar.date = ?");
                params.push(filters.date);
            }

            if (filters.start_date) {
                conditions.push("ar.date >= ?");
                params.push(filters.start_date);
            }

            if (filters.end_date) {
                conditions.push("ar.date <= ?");
                params.push(filters.end_date);
            }

            if (filters.department_id) {
                // Join with user-management service to filter by department
                query += " JOIN (SELECT user_key FROM employees WHERE department_id = ?) e ON ar.user_key = e.user_key";
                params.unshift(filters.department_id);
            }

            if (conditions.length > 0) {
                query += " WHERE " + conditions.join(" AND ");
            }

            query += " ORDER BY ar.date DESC, ar.created_at DESC";

            const [records] = await attendanceDB.execute<RowDataPacket[]>(query, params);
            return { success: true, data: records as AttendanceRecord[] };
        } catch (error) {
            console.error("Error fetching attendance records:", error);
            return { success: false, error: "Internal server error" };
        }
    }

    async generateReport(reportData: {
        report_name: string;
        report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
        generated_by_user_key: string;
        date_from: string;
        date_to: string;
        department_id?: number;
    }): Promise<{ success: boolean; data?: AttendanceReport; error?: string }> {
        try {
            const [result] = await attendanceDB.execute<ResultSetHeader>(
                `INSERT INTO attendance_reports 
                 (report_name, report_type, generated_by_user_key, date_from, date_to, department_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    reportData.report_name,
                    reportData.report_type,
                    reportData.generated_by_user_key,
                    reportData.date_from,
                    reportData.date_to,
                    reportData.department_id || null
                ]
            );

            if (result.affectedRows > 0) {
                const [report] = await attendanceDB.execute<RowDataPacket[]>(
                    "SELECT * FROM attendance_reports WHERE id = ?",
                    [result.insertId]
                );
                return { success: true, data: report[0] as AttendanceReport };
            }

            return { success: false, error: "Failed to create report" };
        } catch (error) {
            console.error("Error generating report:", error);
            return { success: false, error: "Internal server error" };
        }
    }

    async getAttendanceStats(filters: {
        user_key?: string;
        start_date: string;
        end_date: string;
        department_id?: number;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_days,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                    SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
                    SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days,
                    SUM(CASE WHEN work_location = 'home' THEN 1 ELSE 0 END) as wfh_days,
                    SUM(CASE WHEN work_location = 'office' THEN 1 ELSE 0 END) as office_days
                FROM attendance_records ar
            `;
            const params: any[] = [];
            const conditions: string[] = [];

            if (filters.user_key) {
                conditions.push("ar.user_key = ?");
                params.push(filters.user_key);
            }

            conditions.push("ar.date >= ?");
            params.push(filters.start_date);

            conditions.push("ar.date <= ?");
            params.push(filters.end_date);

            if (filters.department_id) {
                query += " JOIN (SELECT user_key FROM employees WHERE department_id = ?) e ON ar.user_key = e.user_key";
                params.unshift(filters.department_id);
            }

            if (conditions.length > 0) {
                query += " WHERE " + conditions.join(" AND ");
            }

            const [stats] = await attendanceDB.execute<RowDataPacket[]>(query, params);
            return { success: true, data: stats[0] };
        } catch (error) {
            console.error("Error fetching attendance stats:", error);
            return { success: false, error: "Internal server error" };
        }
    }
} 