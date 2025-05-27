import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeStore } from "../store/employeeStore";
import { useDepartmentStore } from "../store/departmentStore";
import { useProjectStore } from "../store/projectStore";
import { useDocumentStore } from "../store/documentStore";
import { Pencil, Trash2, Plus, Loader2, View } from "lucide-react";
import Modal from "../components/Modal";
import DocumentUpload from "../components/DocumentUpload";
import EmployeeRequestsPage from "./EmployeesRequestPage";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import TextArea from "../components/TextArea";

const emptyFormData = {
  first_name: "",
  last_name: "",
  position: "",
  email: "",
  phone: "",
  employment_type: "full-time",
  department_id: "0",
  project_id: "0",
  base_pay: "0",
  birthdate: "",
  gender: "male",
  address: "",
  profile_url: "",
};

const EmployeesPage = () => {
  const navigate = useNavigate();
  const {
    employees,
    isLoading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    fetchNotifications,
  } = useEmployeeStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { projects, fetchProjects } = useProjectStore();
  const {} = useDocumentStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchProjects();
    fetchNotifications();
  }, [fetchEmployees, fetchDepartments, fetchProjects, fetchNotifications]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_url: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      department_id: Number(formData.department_id),
      project_id: Number(formData.project_id),
      base_pay: Number(formData.base_pay),
    };
    if (selectedEmployee) {
      await updateEmployee(Number(selectedEmployee), submitData);
      setIsEditModalOpen(false);
    } else {
      await addEmployee(submitData);
      setIsAddModalOpen(false);
    }
    setFormData(emptyFormData);
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee.id.toString());
    setFormData({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      position: employee.position || "",
      email: employee.email || "",
      phone: employee.phone || "",
      employment_type: employee.employment_type || "full-time",
      department_id: employee.department_id
        ? String(employee.department_id)
        : "0",
      project_id: employee.project_id ? String(employee.project_id) : "0",
      base_pay: employee.base_pay ? String(employee.base_pay) : "0",
      birthdate: employee.birthdate || "",
      gender: employee.gender || "male",
      address: employee.address || "",
      profile_url: employee.profile_url || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedEmployee) {
      await deleteEmployee(Number(selectedEmployee));
      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  const openAddModal = () => {
    setFormData(emptyFormData);
    setIsAddModalOpen(true);
  };

  const employeeForm = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <Input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange as any}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <Input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange as any}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Position
        </label>
        <Input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleInputChange as any}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange as any}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange as any}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <Select
            name="department_id"
            value={String(formData.department_id)}
            onChange={handleInputChange as any}
            options={departments.map((dept) => ({
              value: String(dept.id),
              label: dept.name,
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <Select
            name="project_id"
            value={String(formData.project_id)}
            onChange={handleInputChange as any}
            options={projects.map((project) => ({
              value: String(project.id),
              label: project.name,
            }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employment Type
          </label>
          <Select
            name="employment_type"
            value={formData.employment_type}
            onChange={handleInputChange as any}
            options={[
              { value: "Full-time", label: "Full-time" },
              { value: "Part-time", label: "Part-time" },
              { value: "Contract", label: "Contract" },
              { value: "Intern", label: "Intern" },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Base Pay
          </label>
          <Input
            type="number"
            name="base_pay"
            value={String(formData.base_pay)}
            onChange={handleInputChange as any}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Birthdate
          </label>
          <Input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleInputChange as any}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange as any}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <TextArea
          name="address"
          value={formData.address}
          onChange={handleInputChange as any}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Profile Picture
        </label>
        <input
          type="file"
          name="profile_url"
          onChange={handleFileChange}
          className="border px-3 py-2 rounded-lg w-full"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setFormData(emptyFormData);
          }}
          variant="outline"
        >
          Cancel
        </Button>
        <Button type="submit">
          {selectedEmployee ? "Update" : "Add"} Employee
        </Button>
      </div>
    </form>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div className="border-b border-gray-200 w-full bg-transparent">
          <nav className="flex space-x-8 bg-transparent">
            <button
              onClick={() => setShowRequests(false)}
              className={`flex items-center py-4 px-1 border-b-2 font-semibold text-lg transition-all focus:outline-none bg-transparent shadow-none ${
                !showRequests
                  ? "border-primary text-primary border-b-2"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              style={{ boxShadow: "none" }}
              tabIndex={0}
            >
              Employees
            </button>
            <button
              onClick={() => setShowRequests(true)}
              className={`flex items-center py-4 px-1 border-b-2 font-semibold text-lg transition-all focus:outline-none bg-transparent shadow-none ${
                showRequests
                  ? "border-primary text-primary border-b-2"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              style={{ boxShadow: "none" }}
              tabIndex={0}
            >
              Requests
            </button>
          </nav>
        </div>
        {!showRequests && (
          <Button
            onClick={openAddModal}
            className="ml-6 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="whitespace-nowrap">Add Employee</span>
          </Button>
        )}
      </div>

      {showRequests ? (
        <EmployeeRequestsPage />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full bg-gray-200"
                            src={
                              employee.profile_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                employee.first_name + " " + employee.last_name
                              )}&background=random`
                            }
                            alt={`${employee.first_name} ${employee.last_name}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                employee.first_name + " " + employee.last_name
                              )}&background=random`;
                            }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.employment_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${employee.base_pay?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-middle space-x-3">
                        <button
                          onClick={() => navigate(`/employees/${employee.id}`)}
                          className="text-primary hover:underline"
                        >
                          <View className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-primary hover:underline"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee.id.toString());
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:underline"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData(emptyFormData);
        }}
        title="Add Employee"
      >
        {employeeForm}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
          setFormData(emptyFormData);
        }}
        title="Edit Employee"
      >
        {employeeForm}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEmployee(null);
        }}
        title="Delete Employee"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this employee?</p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="danger">
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedEmployee && isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedEmployee(null);
        }}
        title="Upload Documents"
      >
        {selectedEmployee && <DocumentUpload employeeId={selectedEmployee} />}
      </Modal>
    </div>
  );
};

export default EmployeesPage;
