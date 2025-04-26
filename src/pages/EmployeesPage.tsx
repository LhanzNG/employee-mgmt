import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeStore } from "../store/employeeStore";
import { useDepartmentStore } from "../store/departmentStore";
import { useProjectStore } from "../store/projectStore";
import { useDocumentStore } from "../store/documentStore";
import { Pencil, Trash2, Plus, Loader2, View } from "lucide-react";
import Modal from "../components/Modal";
import DocumentUpload from "../components/DocumentUpload";
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
  department_id: 0,
  project_id: 0,
  base_pay: 0,
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
  const { fetchDocumentsByEmployee } = useDocumentStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyFormData);

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
      [name]:
        name === "department_id" || name === "project_id" || name === "base_pay"
          ? Number(value)
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_url: reader.result as string, // Ensure profile_url is updated
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployee) {
      await updateEmployee(Number(selectedEmployee), formData);
      setIsEditModalOpen(false);
    } else {
      await addEmployee(formData);
      setIsAddModalOpen(false);
    }
    setFormData(emptyFormData);
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee.id.toString());
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      position: employee.position,
      email: employee.email,
      phone: employee.phone || "",
      employment_type: employee.employment_type,
      department_id: employee.department_id || 0,
      project_id: employee.project_id || 0,
      base_pay: employee.base_pay || 0,
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

  const handleViewDocuments = (employeeId: number) => {
    fetchDocumentsByEmployee(employeeId);
    setSelectedEmployee(employeeId.toString());
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
            onChange={handleInputChange}
            required
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
            onChange={handleInputChange}
            required
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
          onChange={handleInputChange}
          required
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
            onChange={handleInputChange}
            required
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
            onChange={handleInputChange}
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
            value={formData.department_id.toString()} // Convert to string
            onChange={handleInputChange}
            options={departments.map((dept) => ({
              value: dept.id.toString(),
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
            value={formData.project_id.toString()} // Convert to string
            onChange={handleInputChange}
            options={projects.map((project) => ({
              value: project.id.toString(),
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
            onChange={handleInputChange}
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
            value={formData.base_pay.toString()} // Convert to string
            onChange={handleInputChange}
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
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
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
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Profile Picture
        </label>
        <Input
          type="file"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
        />
        {formData.profile_url && (
          <img
            src={formData.profile_url}
            alt="Profile Preview"
            className="mt-4 w-24 h-24 object-cover rounded-full border"
          />
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setFormData(emptyFormData);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
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
    <div className="p-6 mx-auto max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Button
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Employee
        </Button>
      </div>

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
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
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
        <DocumentUpload employeeId={selectedEmployee} />
      </Modal>
    </div>
  );
};

export default EmployeesPage;
