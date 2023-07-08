import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { logout } from "../components/redux/feature/userSlice";
import { auth } from "../helpers/db";
import { useAppDispatch } from "../components/redux/hooks";
import { useNavigate } from "react-router-dom";

function useCheckUserLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const currentDate = new Date().getTime();
    const expires = JSON.parse(localStorage.getItem("expirationTime")!);

    if (expires) {
      if (currentDate >= expires) {
        // Perform actions for user logout
        signOut(auth);
        dispatch(logout());
        navigate("/");
        localStorage.clear();
      }
    }
  }, []);
}

export default useCheckUserLogout;
