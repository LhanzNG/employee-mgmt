import React, { useEffect, useState } from "react";
import { useRequestStore } from "../store/requestStore";
import { useEmployeeStore } from "../store/employeeStore";
import { format } from "date-fns";
import { Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import Modal from "../components/Modal";

const EmployeeRequestsPage = () => {
  const { requests, isLoading, fetchRequests, updateRequestStatus } =
    useRequestStore();
  const { employees } = useEmployeeStore();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : "Unknown Employee";
  };

  const handleStatusUpdate = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    // In a real application, you would get this from the authenticated user
    const mockReviewerId = "mock-reviewer-id";
    await updateRequestStatus(requestId, status, mockReviewerId);
    setIsViewModalOpen(false);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const selectedRequestData = requests.find(
    (req) => req.id === selectedRequest
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {getEmployeeName(request.employee_id)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 capitalize">
                  {request.type}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                    request.status
                  )}`}
                >
                  {request.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(request.created_at), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => {
                    setSelectedRequest(request.id);
                    setIsViewModalOpen(true);
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Request Details"
      >
        {selectedRequestData && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getEmployeeName(selectedRequestData.employee_id)}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {selectedRequestData.type} Request
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-4">
              <dl className="grid grid-cols-1 gap-4">
                {Object.entries(selectedRequestData.details).map(
                  ([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {key.includes("date")
                          ? format(new Date(value), "MMMM d, yyyy")
                          : value}
                      </dd>
                    </div>
                  )
                )}
              </dl>
            </div>

            {selectedRequestData.status === "pending" && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedRequestData.id, "declined")
                  }
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-gray-50"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Decline
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedRequestData.id, "accepted")
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Accept
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeRequestsPage;
