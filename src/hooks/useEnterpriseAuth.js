import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SESSION_DURATION = 2 * 60 * 60 * 1000;
const TOKEN_KEY = "enterpriseToken";
const USER_KEY = "enterpriseUser";
const TIMESTAMP_KEY = "enterpriseLoginTimestamp";

export const setEnterpriseSession = (profile) => {
  if (profile?.token) {
    localStorage.setItem(TOKEN_KEY, profile.token);
  }
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  window.dispatchEvent(new Event("enterprise-auth-changed"));
};

export const clearEnterpriseSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
  window.dispatchEvent(new Event("enterprise-auth-changed"));
};

export const getEnterpriseToken = () => localStorage.getItem(TOKEN_KEY);

export const useEnterpriseAuth = (allowedRoles = []) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let checkInterval = null;

    const logoutAndRedirect = () => {
      clearEnterpriseSession();
      setUserData(null);
      setIsLoading(false);
      navigate(slug ? `/e/${slug}/login` : "/partner/login");
    };

    const storedUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    const loginTimestamp = localStorage.getItem(TIMESTAMP_KEY);

    if (!storedUser || !token || !loginTimestamp) {
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

      if (slug && user.companySlug && user.companySlug !== slug) {
        logoutAndRedirect();
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        setIsLoading(false);
        if (user.role === 'employee') {
          navigate(slug ? `/e/${slug}/my-games` : '/partner/login');
        } else {
          navigate(user.companySlug ? `/e/${user.companySlug}/admin` : '/partner/login');
        }
        return;
      }

      setUserData(user);
      setIsLoading(false);

      checkInterval = setInterval(() => {
        const currentTimestamp = localStorage.getItem(TIMESTAMP_KEY);
        if (!currentTimestamp) {
          logoutAndRedirect();
          return;
        }
        if (Date.now() - parseInt(currentTimestamp, 10) >= SESSION_DURATION) {
          logoutAndRedirect();
        }
      }, 60 * 1000);
    } catch (error) {
      console.error("Error parsing enterprise session:", error);
      logoutAndRedirect();
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [navigate, slug, allowedRoles.join('|')]);

  return { userData, isLoading };
};
