import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEmployeeStore } from "../store/employeeStore";
import { useDepartmentStore } from "../store/departmentStore";
import { useDocumentStore } from "../store/documentStore";
import Breadcrumbs from "../components/Breadcrumbs";
import DocumentList from "../components/DocumentList";
import Modal from "../components/Modal";
import DocumentUpload from "../components/DocumentUpload";
import Button from "../components/Button";
import {
  Briefcase,
  User,
  Settings,
  FileText,
  Phone,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  X,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

const EmployeeDetails = () => {
  const { id } = useParams();
  const { employees, isLoading: employeeLoading } = useEmployeeStore();
  const {
    departments,
    fetchDepartments,
    isLoading: departmentLoading,
  } = useDepartmentStore();
  const { documents, fetchDocumentsByEmployee, deleteDocument } =
    useDocumentStore();
  const [activeTab, setActiveTab] = useState("work");
  const [showImageModal, setShowImageModal] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (departments.length === 0) {
      fetchDepartments();
    }
  }, [departments, fetchDepartments]);

  const handleDocumentUpload = async () => {
    if (id) {
      await fetchDocumentsByEmployee(Number(id));
    }
  };

  const handleDeleteDocument = async () => {
    if (selectedDocument !== null) {
      await deleteDocument(selectedDocument);
      setIsDeleteModalOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleRefreshDocuments = async () => {
    if (id) {
      setIsRefreshing(true);
      await fetchDocumentsByEmployee(Number(id));
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleDocumentUpload();
  }, [id]);

  const employee = employees.find((emp) => emp.id === Number(id));

  if (employeeLoading || departmentLoading) {
    return <div>Loading...</div>;
  }

  if (!employee) {
    return <div>Employee not found</div>;
  }

  const department = departments.find(
    (dept) => dept.id === employee.department_id
  );

  const tabs = [
    { id: "work", label: "Work Information", icon: Briefcase },
    { id: "private", label: "Private Information", icon: User },
    { id: "hr", label: "HR Settings", icon: Settings },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  const profileImage =
    employee.profile_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      employee.first_name + " " + employee.last_name
    )}&background=random`;

  const renderTabContent = () => {
    switch (activeTab) {
      case "work":
        return (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-primary" />
                  Position Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Position</label>
                    <p className="font-medium">{employee.position}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Department</label>
                    <p className="font-medium">{department?.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Employment Type
                    </label>
                    <p className="font-medium">{employee.employment_type}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-primary" />
                  Compensation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Base Pay</label>
                    <p className="font-medium">
                      ${employee.base_pay.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "private":
        return (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="font-medium">{employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Birthdate</label>
                    <p className="font-medium">
                      {new Date(employee.birthdate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                  <div>
                    <label className="text-sm text-gray-500">Address</label>
                    <p className="font-medium">{employee.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "hr":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">HR Settings</h3>
            <p>HR settings and configurations will be displayed here.</p>
          </div>
        );
      case "documents":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Documents</h3>
              <Button
                label={isRefreshing ? "Refreshing..." : "Refresh"}
                onClick={handleRefreshDocuments}
                className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"
                disabled={isRefreshing}
              />
            </div>
            <div
              className={`overflow-x-auto scrollbar-hide ${
                documents.length > 4 ? "max-h-[300px] overflow-y-auto" : ""
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>
                {`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              <DocumentList
                documents={documents}
                onDelete={(id) => {
                  setSelectedDocument(id);
                  setIsDeleteModalOpen(true);
                }}
              />
            </div>
            {activeTab === "documents" && (
              <div className="mt-6">
                <Button
                  label="Upload Documents"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary/90"
                />
              </div>
            )}

            <Modal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              title="Upload Documents"
            >
              <DocumentUpload employeeId={id || ""} />
            </Modal>

            <Modal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              title="Delete Document"
            >
              <div className="space-y-4">
                <p>Are you sure you want to delete this document?</p>
                <div className="flex justify-end space-x-3">
                  <Button
                    label="Cancel"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  />
                  <Button
                    label="Delete"
                    onClick={handleDeleteDocument}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  />
                </div>
              </div>
            </Modal>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleEscPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      window.addEventListener("keydown", handleEscPress);
    }

    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, [showImageModal]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <Breadcrumbs />

      <div className="flex items-center mb-6">
        <img
          src={profileImage}
          alt={`${employee.first_name} ${employee.last_name}`}
          className="w-16 h-16 object-cover rounded-full mr-4 cursor-pointer hover:ring-2 hover:ring-primary transition"
          onClick={() => setShowImageModal(true)}
        />
        <div>
          <h1 className="text-3xl font-bold">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-gray-500">{employee.position}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-6">{renderTabContent()}</div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-red-400 z-50"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-full">
            <div className="flex items-center justify-center">
              <img
                src={profileImage}
                alt="Zoomed Profile"
                className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                style={{ touchAction: "pinch-zoom" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
