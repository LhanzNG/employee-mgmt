import React, { useEffect, useState } from "react";
import { useProjectStore } from "../store/projectStore";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Input from "../components/Input";
import TextArea from "../components/TextArea";

const emptyFormData = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "planning",
  progress: "",
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

    setFormData((prev) => {
      if (name === "status" && value !== "in_progress") {
        return {
          ...prev,
          status: value,
          progress: "",
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      progress:
        formData.status === "in_progress"
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
        return "On Hold (20%)";
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
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <TextArea
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          label="Cancel"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setFormData(emptyFormData);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        />
        <Button
          label={selectedProject ? "Update Project" : "Add Project"}
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        />
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
        <Button
          label="Add Project"
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary/90"
        />
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
              label="Cancel"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            />
            <Button
              label="Delete"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
