import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const user = localStorage.getItem("civiclink_user");

  if (!user) {
    // not logged in -> bounce to static landing page
    window.location.replace("/landing.html");
    return null;
  }

  return children;
}