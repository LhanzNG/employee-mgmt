export interface EmployeeRequest {
  id: string;
  employee_id: number;
  type: string;
  details: {
    start_date?: string;
    end_date?: string;
    reason?: string;
    [key: string]: any;
  };
  status: "pending" | "accepted" | "declined";
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}
