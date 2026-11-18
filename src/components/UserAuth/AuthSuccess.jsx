import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyToken } = useUser();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("ranaji-user-token", token);
      // Hydrate UserContext authentication state in-place before navigating
      verifyToken()
        .then((res) => {
          if (res && res.success) {
            navigate("/profile", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        })
        .catch(() => {
          navigate("/", { replace: true });
        });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, searchParams, verifyToken]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#0D0905",
        color: "#DEA044",
        fontSize: "20px",
        fontFamily: "serif",
        gap: "12px"
      }}
    >
      <div className="w-8 h-8 border-2 border-[#DEA044] border-t-transparent rounded-full animate-spin" />
      <span>Welcoming you to Ranaji Royal Showroom...</span>
    </div>
  );
}