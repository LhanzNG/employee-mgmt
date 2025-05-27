export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  address: string;
  profile_url: string;
  employment_type: string;
  department_id: number | null;
  project_id: number | null;
  created_at: string;
  updated_at: string;
  base_pay: number;
}
