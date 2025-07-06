import { Response } from "express";
import { AttendanceService } from "../services/attendance.js";
import { SubmitAttendanceRequest, GetAttendanceRequest, GenerateReportRequest } from "../types/requests.js";

export class AttendanceController {
    private attendanceService: AttendanceService;

    constructor() {
        this.attendanceService = new AttendanceService();
    }

    async submitAttendance(req: SubmitAttendanceRequest, res: Response) {
        if (!req.body) {
            return res.status(400).json({ msg: "Invalid request" });
        }

        const { date, check_in_time, check_out_time, work_location, status, notes } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ msg: "User not authenticated" });
        }

        if (!date || !work_location || !status) {
            return res.status(400).json({ msg: "Date, work location, and status are required" });
        }

        try {
            const result = await this.attendanceService.submitAttendance(user.sub, {
                date,
                check_in_time,
                check_out_time,
                work_location,
                status,
                notes
            });

            if (result.success && result.data) {
                res.status(201).json({
                    msg: "Attendance submitted successfully",
                    data: result.data
                });
            } else {
                res.status(400).json({ msg: result.error || "Failed to submit attendance" });
            }
        } catch (error) {
            console.error("Error in submitAttendance controller:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    async getAttendanceRecords(req: GetAttendanceRequest, res: Response) {
        const user = req.user;
        const { user_key, date, start_date, end_date, department_id } = req.query;

        if (!user) {
            return res.status(401).json({ msg: "User not authenticated" });
        }

        try {
            const filters: any = {};

            // If no specific user_key provided, use the authenticated user's key
            if (user_key) {
                filters.user_key = user_key;
            } else {
                filters.user_key = user.sub;
            }

            if (date) filters.date = date;
            if (start_date) filters.start_date = start_date;
            if (end_date) filters.end_date = end_date;
            if (department_id) filters.department_id = parseInt(department_id);

            const result = await this.attendanceService.getAttendanceRecords(filters);

            if (result.success && result.data) {
                res.status(200).json({
                    msg: "Attendance records retrieved successfully",
                    data: result.data
                });
            } else {
                res.status(400).json({ msg: result.error || "Failed to retrieve attendance records" });
            }
        } catch (error) {
            console.error("Error in getAttendanceRecords controller:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    async getAttendanceStats(req: GetAttendanceRequest, res: Response) {
        const user = req.user;
        const { user_key, start_date, end_date, department_id } = req.query;

        if (!user) {
            return res.status(401).json({ msg: "User not authenticated" });
        }

        if (!start_date || !end_date) {
            return res.status(400).json({ msg: "Start date and end date are required" });
        }

        try {
            const filters: any = {
                start_date,
                end_date
            };

            if (user_key) {
                filters.user_key = user_key;
            } else {
                filters.user_key = user.sub;
            }

            if (department_id) {
                filters.department_id = parseInt(department_id);
            }

            const result = await this.attendanceService.getAttendanceStats(filters);

            if (result.success && result.data) {
                res.status(200).json({
                    msg: "Attendance stats retrieved successfully",
                    data: result.data
                });
            } else {
                res.status(400).json({ msg: result.error || "Failed to retrieve attendance stats" });
            }
        } catch (error) {
            console.error("Error in getAttendanceStats controller:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    async generateReport(req: GenerateReportRequest, res: Response) {
        if (!req.body) {
            return res.status(400).json({ msg: "Invalid request" });
        }

        const { report_name, report_type, date_from, date_to, department_id } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ msg: "User not authenticated" });
        }

        if (!report_name || !report_type || !date_from || !date_to) {
            return res.status(400).json({ msg: "Report name, type, date from, and date to are required" });
        }

        try {
            const result = await this.attendanceService.generateReport({
                report_name,
                report_type,
                generated_by_user_key: user.sub,
                date_from,
                date_to,
                department_id
            });

            if (result.success && result.data) {
                res.status(201).json({
                    msg: "Report generation initiated successfully",
                    data: result.data
                });
            } else {
                res.status(400).json({ msg: result.error || "Failed to generate report" });
            }
        } catch (error) {
            console.error("Error in generateReport controller:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }
} 