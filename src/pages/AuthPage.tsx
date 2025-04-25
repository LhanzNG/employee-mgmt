import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import Popup from "../components/Popup";

const AuthPage = ({ onVisitAuth }) => {
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    // Call onVisitAuth to mark that the user has visited the Auth page
    if (onVisitAuth) {
      onVisitAuth();
    }

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setIsPopupVisible(true);
        navigate("/"); // Redirect to home after successful login
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsPopupVisible(true);
        navigate("/"); // Redirect to home after successful login
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onVisitAuth]); // Run effect when onVisitAuth or navigate changes

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Rocket className="w-8 h-8 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-primary">Propel</h1>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            style: {
              button: {
                backgroundColor: "#0bc5ea",
                borderColor: "#0bc5ea",
              },
              input: {
                borderRadius: "0.375rem",
                borderColor: "#e2e8f0",
                padding: "0.5rem 0.75rem",
                backgroundColor: "#f8fafc",
                "&:focus": {
                  borderColor: "#0bc5ea",
                  boxShadow: "0 0 0 1px #0bc5ea",
                },
                "&:hover": {
                  borderColor: "#0bc5ea",
                },
              },
              label: {
                color: "#4a5568",
                marginBottom: "0.25rem",
              },
            },
          }}
          providers={[]}
          theme="light"
        />
      </div>
      <Popup
        message="Successfully logged in!"
        isVisible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
      />
    </div>
  );
};

export default AuthPage;
