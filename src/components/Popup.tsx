import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface PopupProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Popup = ({ message, isVisible, onClose }: PopupProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 shadow-md rounded-lg p-4 flex items-center space-x-3 z-50 animate-fade-in-up max-w-sm"
      style={{
        maxWidth: "350px", // Keeps the popup size constrained
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <CheckCircle className="w-5 h-5 text-white" />
      <p className="text-white text-sm font-medium">{message}</p>
    </div>
  );
};

export default Popup;
