import { useRef, useState, ChangeEvent, useCallback, useEffect } from "react";
import { Camera } from "react-feather";
import { LinearProgress, TextField } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { uploadImage } from "../../../helpers/db";
import {
  selectUserDetails,
  updateUserDetails,
} from "../../redux/feature/userSlice";
import ImagePlaceholder from "../../../assets/image-placeholder.jpg";
import { toast } from "react-toastify";
import styles from "./UserProfile.module.css";

function UserProfile() {
  const userDetails = useAppSelector(selectUserDetails);
  const imagePicker = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const [progress, setProgress] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState(
    userDetails.profileImage || ImagePlaceholder
  );
  const [profileImageUploadStarted, setProfileImageUploadStarted] =
    useState(false);

  const [userProfileValues, setUserProfileValues] = useState({
    name: userDetails.name || "",
    designation: userDetails.designation || "",
    github: userDetails.github || "",
    linkedin: userDetails.linkedin || "",
  });
  const [showSaveDetailsButton, setShowSaveDetailsButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);

  // Handle click on camera icon to select profile image
  const handleCameraClick = () => {
    if (imagePicker.current) {
      (imagePicker.current as HTMLInputElement).click();
    }
  };

  // Update profile image in the database
  const updateProfileImageToDatabase = useCallback(
    (url: string) => {
      const updatedUserProfile = {
        ...userProfileValues,
        email: userDetails.email,
        uid: userDetails.uid,
        profileImage: url,
      };

      dispatch(
        updateUserDetails({ user: updatedUserProfile, uid: userDetails.uid! })
      );
      setUserProfileValues((prev) => ({
        ...prev,
        profileImage: url,
      }));
    },
    [dispatch, userProfileValues]
  );

  // Handle image change when selecting a new profile image
  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setProfileImageUploadStarted(true);
      uploadImage(
        file,
        (progress: number) => {
          setProgress(progress);
        },
        (url: string) => {
          setProfileImageUrl(url);
          updateProfileImageToDatabase(url);
          setProfileImageUploadStarted(false);
          setProgress(0);
        },
        (err: string) => {
          console.error("Error->", err);
          setProfileImageUploadStarted(false);
        }
      );
    },
    [updateProfileImageToDatabase]
  );

  // Handle input change in the user profile details
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, property: string) => {
      setShowSaveDetailsButton(true);

      setUserProfileValues((prev) => ({
        ...prev,
        [property]: event.target.value,
      }));
    },
    []
  );

  // Save user profile details to the database
  const saveDetailsToDatabase = useCallback(async () => {
    if (!userProfileValues.name) {
      setErrorMessage("Name required");
      return;
    }

    setSaveButtonDisabled(true);
    setErrorMessage("");

    try {
      const updatedUserProfile = {
        ...userProfileValues,
        email: userDetails.email,
        profileImage: userDetails.profileImage || ImagePlaceholder,
        uid: userDetails.uid,
      };

      await dispatch(
        updateUserDetails({
          user: updatedUserProfile,
          uid: userDetails.uid!,
        })
      );
      setSaveButtonDisabled(false);
      setShowSaveDetailsButton(false);
      toast.success("Profile details updated successfully.");
    } catch (error) {
      console.error(error);
      setSaveButtonDisabled(false);
      toast.error("Failed to update profile details.");
    }
  }, [dispatch, userProfileValues]);

  useEffect(() => {
    if (userDetails.uid) {
      setUserProfileValues((prev) => ({
        ...prev,
        name: userDetails.name || "",
        designation: userDetails.designation || "",
        github: userDetails.github || "",
        linkedin: userDetails.linkedin || "",
      }));
      setProfileImageUrl(userDetails.profileImage! || ImagePlaceholder);
    }
  }, []);

  return (
    <>
      <input
        type="file"
        ref={imagePicker}
        style={{ display: "none" }}
        onChange={handleImageChange}
      />
      <div className={styles.section}>
        <div className={styles.title}>Your profile</div>
        <div className={styles.profile}>
          <div className={styles.left}>
            <div className={styles.image}>
              <img src={profileImageUrl} alt="Profile image" />
              <div className={styles.camera} onClick={handleCameraClick}>
                <Camera />
              </div>
            </div>
            {profileImageUploadStarted && (
              <p className={styles.progress}>
                <LinearProgress
                  color="success"
                  variant="determinate"
                  value={progress}
                />
              </p>
            )}
          </div>
          <div className={styles.right}>
            <div className={styles.row}>
              <TextField
                id="outlined-basic-name"
                label="Name"
                type="text"
                variant="outlined"
                size="small"
                value={userProfileValues.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, "name")
                }
              />
              <TextField
                id="outlined-basic-role"
                label="Role"
                type="text"
                variant="outlined"
                size="small"
                placeholder="eg. Full stack developer"
                value={userProfileValues.designation}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, "designation")
                }
              />
            </div>
            <div className={styles.row}>
              <TextField
                id="outlined-basic-github"
                label="Github"
                type="text"
                variant="outlined"
                size="small"
                placeholder="Enter your github link"
                value={userProfileValues.github}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, "github")
                }
              />
              <TextField
                id="outlined-basic-Linkedin"
                label="Linkedin"
                type="text"
                variant="outlined"
                size="small"
                placeholder="Enter your linkedin link"
                value={userProfileValues.linkedin}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, "linkedin")
                }
              />
            </div>
            <div className={styles.footer}>
              <p className={styles.error}>{errorMessage}</p>
              {showSaveDetailsButton && (
                <button
                  disabled={saveButtonDisabled}
                  className={styles.savebutton}
                  onClick={saveDetailsToDatabase}
                >
                  Save Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
