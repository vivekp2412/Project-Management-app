import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { PuffLoader } from "react-spinners";
import { Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./helpers/db";
import {
  fetchUserDetails,
  selectAuthenticate,
  selectLoading,
} from "./components/redux/feature/userSlice";
import { useAppDispatch, useAppSelector } from "./components/redux/hooks";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import Auth from "./components/Auth/Auth";
import Home from "./components/Home/Home";
import Account from "./components/Account/Account";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const dispatch = useAppDispatch();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isAuthenticated = useAppSelector(selectAuthenticate);
  const isLoading = useAppSelector(selectLoading);

  useEffect(() => {
    const listener = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsDataLoaded(true);
      } else {
        dispatch(fetchUserDetails(user.uid));

        setIsDataLoaded(true);
      }
    });

    return () => listener();
  }, [dispatch]);

  return (
    <div className="App">
      <ErrorBoundary>
        {isDataLoaded ? (
          <Routes>
            {!isAuthenticated && !isLoading && (
              <>
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth signup />} />
              </>
            )}
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <div className="spinner">
            <PuffLoader color="#63b2ff" />
          </div>
        )}
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ErrorBoundary>
    </div>
  );
}

export default App;
