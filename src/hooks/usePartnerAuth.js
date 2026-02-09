import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const LOGIN_TIMESTAMP_KEY = "partnerLoginTimestamp";

export const usePartnerAuth = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let checkInterval = null;

    const logoutAndRedirect = () => {
      localStorage.removeItem("partnerUser");
      localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
      setUserData(null);
      setIsLoading(false);
      navigate("/partner/login");
    };

    const storedUser = localStorage.getItem("partnerUser");
    const loginTimestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY);

    if (!storedUser || !loginTimestamp) {
      logoutAndRedirect();
      return;
    }

    try {
      const now = Date.now();
      const loginTime = parseInt(loginTimestamp, 10);

      if (now - loginTime >= SESSION_DURATION) {
        logoutAndRedirect();
        return;
      }

      const user = JSON.parse(storedUser);
      setUserData(user);
      setIsLoading(false);

      // Check every 1 minute
      checkInterval = setInterval(() => {
        const currentTimestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY);

        if (!currentTimestamp) {
          logoutAndRedirect();
          return;
        }

        const currentLoginTime = parseInt(currentTimestamp, 10);

        if (Date.now() - currentLoginTime >= SESSION_DURATION) {
          logoutAndRedirect();
        }
      }, 60 * 1000);

    } catch (error) {
      console.error("Error parsing user data:", error);
      logoutAndRedirect();
    }

    // ✅ Proper cleanup
    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [navigate]);

  return { userData, isLoading };
};

export const setLoginTimestamp = () => {
  localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
};

export const clearLoginTimestamp = () => {
  localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
};
