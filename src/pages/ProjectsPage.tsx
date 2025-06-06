import React, { useEffect, useState } from "react";
import { useProjectStore } from "../store/projectStore";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import TextArea from "../components/TextArea";

const emptyFormData = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "planning",
  progress: "",
  department_id: 0, // Added missing property
};

const ProjectsPage = () => {
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "department_id" ? Number(value) : value, // Ensure correct type
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      progress: ["in_progress", "on_hold"].includes(formData.status)
        ? parseInt(formData.progress || "0", 10)
        : undefined,
    };

    if (selectedProject) {
      await updateProject(selectedProject, dataToSubmit);
      setIsEditModalOpen(false);
    } else {
      await addProject(dataToSubmit);
      setIsAddModalOpen(false);
    }

    setFormData(emptyFormData);
  };

  const handleEdit = (project: any) => {
    setSelectedProject(project.id);
    setFormData({
      name: project.name,
      description: project.description || "",
      start_date: project.start_date?.split("T")[0] || "",
      end_date: project.end_date?.split("T")[0] || "",
      status: project.status || "planning",
      progress: project.progress?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setFormData(emptyFormData);
    setIsAddModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedProject !== null) {
      await deleteProject(selectedProject);
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    }
  };

  const getStatusWithPercentage = (
    status: string,
    progress?: string | number
  ) => {
    switch (status) {
      case "completed":
        return "Completed (100%)";
      case "in_progress":
        const parsed = parseInt(progress?.toString() || "0", 10);
        return `In Progress (${parsed}%)`;
      case "on_hold":
        const parseOnHold = parseInt(progress?.toString() || "0", 10);
        return `On Hold (${parseOnHold}%)`;
      case "planning":
      default:
        return "Planning (0%)";
    }
  };

  const projectForm = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <TextArea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <Input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <Input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <Select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          options={[
            { value: "planning", label: "Planning (0%)" },
            { value: "on_hold", label: "On Hold (custom %)" },
            { value: "completed", label: "Completed (100%)" },
            { value: "in_progress", label: "In Progress (custom %)" },
          ]}
        />
      </div>

      {formData.status === "in_progress" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Custom Progress (%)
          </label>
          <Input
            type="number"
            name="progress"
            value={formData.progress}
            onChange={handleInputChange}
            min={0}
            max={100}
            required
          />
        </div>
      )}

      {formData.status === "on_hold" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Custom Progress (%)
          </label>
          <Input
            type="number"
            name="progress"
            value={formData.progress}
            onChange={handleInputChange}
            min={0}
            max={100}
            required
          />
        </div>
      )}

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
          {selectedProject ? "Update Project" : "Add Project"}
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={openAddModal}>
          <Plus className="w-5 h-5 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {project.description}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          project.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : project.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : project.status === "on_hold"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
                    >
                      {getStatusWithPercentage(
                        project.status,
                        project.progress
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {project.start_date?.split("T")[0]} -{" "}
                    {project.end_date?.split("T")[0]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-primary hover:underline"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project.id);
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
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Project"
      >
        {projectForm}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        {projectForm}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this project?</p>
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
    </div>
  );
};

export default ProjectsPage;
