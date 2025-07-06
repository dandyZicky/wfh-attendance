import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.js";
import { authenticateJWT, authorizeDepartment } from "../middleware/auth.js";

export const router = Router();

const attendanceController = new AttendanceController();

// Submit attendance record
router.post("/attendance/submit", authenticateJWT, (req, res) => {
    attendanceController.submitAttendance(req, res);
});

// Get attendance records (with filters)
router.get("/attendance/records", authenticateJWT, (req, res) => {
    attendanceController.getAttendanceRecords(req, res);
});

// Get attendance statistics
router.get("/attendance/stats", authenticateJWT, (req, res) => {
    attendanceController.getAttendanceStats(req, res);
});

// Generate attendance report (HR only)
router.post("/attendance/reports", authenticateJWT, authorizeDepartment, (req, res) => {
    attendanceController.generateReport(req, res);
});

// Health check endpoint
router.get("/health", (req, res) => {
    res.status(200).json({ msg: "Attendance service is running" });
}); 