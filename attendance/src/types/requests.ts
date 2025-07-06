import { Request } from "express";

export interface AuthRequest extends Request {
    user?: {
        sub: string;
        email: string;
        username: string;
    };
}

export interface SubmitAttendanceRequest extends AuthRequest {
    body: {
        date: string;
        check_in_time?: string;
        check_out_time?: string;
        work_location: 'office' | 'home' | 'client_site';
        status: 'present' | 'absent' | 'late' | 'half_day';
        notes?: string;
    };
}

export interface GetAttendanceRequest extends AuthRequest {
    params: {
        user_key?: string;
        date?: string;
        start_date?: string;
        end_date?: string;
    };
    query: {
        user_key?: string;
        date?: string;
        start_date?: string;
        end_date?: string;
        department_id?: string;
    };
}

export interface GenerateReportRequest extends AuthRequest {
    body: {
        report_name: string;
        report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
        date_from: string;
        date_to: string;
        department_id?: number;
    };
} 