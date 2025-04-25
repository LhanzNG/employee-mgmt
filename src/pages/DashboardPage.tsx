import React, { useEffect } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import { useEmployeeStore } from "../store/employeeStore";
import { useDepartmentStore } from "../store/departmentStore";
import { useProjectStore } from "../store/projectStore";
import {
  Users,
  DollarSign,
  TrendingUp,
  Briefcase,
  Building2,
  BarChart as ChartBar,
  Loader2,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const {
    employees,
    isLoading: employeesLoading,
    fetchEmployees,
  } = useEmployeeStore();
  const {
    departments,
    isLoading: departmentsLoading,
    fetchDepartments,
  } = useDepartmentStore();
  const {
    projects,
    isLoading: projectsLoading,
    fetchProjects,
  } = useProjectStore();

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchProjects();
  }, [fetchEmployees, fetchDepartments, fetchProjects]);

  const isLoading = employeesLoading || departmentsLoading || projectsLoading;

  const calculateAverageSalary = () => {
    if (employees.length === 0) return 0;
    return (
      employees.reduce((acc, emp) => acc + (emp.base_pay || 0), 0) /
      employees.length
    );
  };

  const getEmployeesByDepartment = () => {
    const departmentCounts = {};
    employees.forEach((employee) => {
      const department = departments.find(
        (d) => d.id === employee.department_id
      );
      if (department) {
        departmentCounts[department.name] =
          (departmentCounts[department.name] || 0) + 1;
      }
    });
    return departmentCounts;
  };

  const getProjectStatus = () => {
    const statusCounts = {
      planning: 0,
      in_progress: 0,
      completed: 0,
      on_hold: 0,
    };
    projects.forEach((project) => {
      statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
    });
    return statusCounts;
  };

  const departmentData = {
    labels: Object.keys(getEmployeesByDepartment()),
    datasets: [
      {
        data: Object.values(getEmployeesByDepartment()),
        backgroundColor: [
          "#0bc5ea",
          "#4299e1",
          "#667eea",
          "#9f7aea",
          "#ed64a6",
        ],
      },
    ],
  };

  const projectStatusData = {
    labels: ["Planning", "In Progress", "Completed", "On Hold"],
    datasets: [
      {
        label: "Projects by Status",
        data: Object.values(getProjectStatus()),
        backgroundColor: ["#718096", "#4299e1", "#48bb78", "#ecc94b"],
      },
    ],
  };

  const monthlyHiresData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Hires",
        data: [4, 6, 8, 5, 7, 9],
        borderColor: "#0bc5ea",
        backgroundColor: "rgba(11, 197, 234, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="p-6 max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Total Employees</h3>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Departments</h3>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Active Projects</h3>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm">Avg. Salary</h3>
                <p className="text-2xl font-bold">
                  ${Math.round(calculateAverageSalary()).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Employee Distribution
            </h2>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut
                data={departmentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Project Status</h2>
            <div className="h-[300px] flex items-center justify-center">
              <Bar
                data={projectStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly New Hires</h2>
          <div className="h-[300px]">
            <Line
              data={monthlyHiresData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 2,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
