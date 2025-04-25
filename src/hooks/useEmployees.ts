import { useEmployeeStore } from "../store/employeeStore";
import type { Employee } from "../types/employee";

export const useEmployees = () => {
  const employees = useEmployeeStore((state) => state.employees);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);

  const getEmployeesByDepartment = (department: string) => {
    return employees.filter((employee) => employee.department === department);
  };

  const getActiveEmployees = () => {
    return employees.filter((employee) => employee.status === "active");
  };

  const calculateAverageSalary = () => {
    if (employees.length === 0) return 0;
    return (
      employees.reduce((acc, emp) => acc + emp.salary, 0) / employees.length
    );
  };

  return {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByDepartment,
    getActiveEmployees,
    calculateAverageSalary,
  };
};
