import { useState, FormEvent, useRef, memo, useCallback } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Eye, EyeOff, Mail, User, Key } from "react-feather";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { loginUser, signUpUser, resetUser } from "../redux/feature/userSlice";
import { useAppDispatch } from "../redux/hooks";
import { auth } from "../../helpers/db";
import SignUp from "../../assets/signup-image.jpg";
import SignIn from "../../assets/signin-image.jpg";
import styles from "./Auth.module.css";
import { AuthProps, EndAdornmentProps } from "../../Types/types";

// EndAdornment component
const EndAdornment = ({ visible, setVisible }: EndAdornmentProps) => {
  return (
    <InputAdornment position="end">
      <IconButton onClick={() => setVisible(!visible)}>
        {visible ? (
          <Eye className={styles.eyeIcon} />
        ) : (
          <EyeOff className={styles.eyeOffIcon} />
        )}
      </IconButton>
    </InputAdornment>
  );
};

function Auth({ signup }: AuthProps) {
  // const signup = !!props.signup;
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitButtonDisabled, setSubmitButtonDisable] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Handle signup logic
  const handleSignup = useCallback(() => {
    // Get form field values
    if (!formRef.current) {
      return;
    }
    const name = (formRef.current.name as unknown as HTMLInputElement).value;
    const email = formRef.current.email.value;
    const password = formRef.current.password.value;
    const confirmPassword = formRef.current.confirmPassword.value;
    const values = {
      name: name,
      email: email,
      password: password,
    };

    // Validate form fields
    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    } else if (password !== confirmPassword) {
      toast.error("Password does not match");
      return;
    }

    // Dispatch signup action
    setSubmitButtonDisable(true);
    dispatch(signUpUser(values))
      .then(() => {
        setSubmitButtonDisable(false);
      })
      .catch(() => {
        setSubmitButtonDisable(false);
      });
  }, [dispatch]);

  // Handle form reset
  const handleFormReset = useCallback(() => {
    if (formRef.current) {
      formRef.current.reset();
    }
    dispatch(resetUser());
  }, [dispatch]);

  // Handle forgot password
  const handleForgotPassword = () => {
    if (!formRef.current) {
      return;
    }
    const email = formRef.current.email.value;
    if (email) {
      sendPasswordResetEmail(auth, email).then(() => {
        toast.info("Password reset link sent to your email");
      });
    } else {
      toast.info("Please enter an email");
    }
  };

  // Handle login logic
  const handleLogin = useCallback(() => {
    if (!formRef.current) {
      return;
    }
    const email = formRef.current.email.value;
    const password = formRef.current.password.value;
    const values = {
      email,
      password,
    };
    if (!email || !password) {
      toast.error("All fields are required!");
      return;
    }
    setSubmitButtonDisable(true);
    dispatch(loginUser(values))
      .then(() => {
        setSubmitButtonDisable(false);
      })
      .catch(() => {
        setSubmitButtonDisable(false);
      });
  }, [dispatch]);

  // Handle form submission
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (signup) {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        {!signup && (
          <div className={styles.commanImage}>
            <img src={SignIn} alt="signin-image" className={styles.formImage} />
          </div>
        )}
        <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.smallLink}>
            <Link to="/">{"< Back to Home"}</Link>
          </p>
          <div className={styles.heading}>
            {signup ? (
              <>
                <div> Create an account</div>
                <p className={styles.subHeading}>
                  Sign Up now and manage your Project.
                </p>
              </>
            ) : (
              <>
                <div> Welcome Back </div>
                <p className={styles.subHeading}>Please enter your details. </p>
              </>
            )}
          </div>

          {signup && (
            <TextField
              hiddenLabel
              id="outlined-basic-name"
              variant="outlined"
              placeholder="Enter Name"
              type="text"
              name="name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User fill="#000" className={styles.user} />
                  </InputAdornment>
                ),
              }}
            />
          )}
          <TextField
            hiddenLabel
            id="outlined-basic-email"
            variant="outlined"
            placeholder="Enter email"
            type="email"
            name="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail fill="#000" color="#fff" className={styles.mail} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            hiddenLabel
            id="outlined-basic-password"
            placeholder="Enter Password"
            variant="outlined"
            type={passwordVisible ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <EndAdornment
                  visible={passwordVisible}
                  setVisible={setPasswordVisible}
                />
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <Key fill="#000" color="#000" className={styles.key} />
                </InputAdornment>
              ),
            }}
            name="password"
          />
          {signup && (
            <TextField
              hiddenLabel
              id="outlined-basic-confirmPassword"
              placeholder="Confirm Password"
              variant="outlined"
              type={confirmPasswordVisible ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <EndAdornment
                    visible={confirmPasswordVisible}
                    setVisible={setConfirmPasswordVisible}
                  />
                ),
                startAdornment: (
                  <InputAdornment position="start">
                    <Key color="#000" className={styles.key} />
                  </InputAdornment>
                ),
              }}
              name="confirmPassword"
            />
          )}

          <button
            type="submit"
            disabled={submitButtonDisabled}
            className={styles.submitbutton}
          >
            {signup ? "Register" : "LogIn"}
          </button>
          {!signup && (
            <p onClick={handleForgotPassword} className={styles.resetPassword}>
              Forgot Password?
            </p>
          )}

          <div className={styles.bottom}>
            {signup ? (
              <p>
                Already have an account ?{" "}
                <Link to="/login" onClick={handleFormReset}>
                  Login
                </Link>
              </p>
            ) : (
              <p>
                Don't have an account ?{" "}
                <Link to="/signup" onClick={handleFormReset}>
                  SignUp
                </Link>
              </p>
            )}
          </div>
        </form>
        {signup && (
          <div className={styles.commanImage}>
            <img src={SignUp} alt="signup-image" className={styles.formImage} />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Auth);
