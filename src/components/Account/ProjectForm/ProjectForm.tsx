import { useRef, useState, ChangeEvent, memo, useCallback } from "react";
import { LinearProgress, TextField } from "@mui/material";
import { X } from "react-feather";
import Modal from "../../Modal/Modal";
import { uploadImage } from "../../../helpers/db";
import { addOrUpdateProject } from "../../redux/feature/projectSlice";
import { useAppDispatch } from "../../redux/hooks";
import { useAppSelector } from "../../redux/hooks";
import { selectUserDetails } from "../../redux/feature/userSlice";
import { toast } from "react-toastify";
import { ProjectFormProps } from "../../../Types/types";
import styles from "./ProjectForm.module.css";

function ProjectForm(props: ProjectFormProps) {
  const { uid } = useAppSelector(selectUserDetails);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = props.isEdit ? true : false;
  const defaults = props.default;

  // State for form values, errors, and progress indicators
  const [values, setValues] = useState({
    thumbnail: defaults?.thumbnail || "",
    title: defaults?.title || "",
    overview: defaults?.overview || "",
    github: defaults?.github || "",
    link: defaults?.link || "",
    points: defaults?.points || ["", ""],
    likes: defaults?.likes || [],
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [imageUploadStarted, setImageUploadStarted] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [submitButtonDisabled, setSetSubmitButtonDisabled] = useState(false);

  // Update a point in the description
  const handlePointUpdate = (value: string, index: number) => {
    const tempPoints = [...values.points];
    tempPoints[index] = value;
    setValues((prev) => ({ ...prev, points: tempPoints }));
  };

  // Add a new point to the description
  const handleAddPoint = useCallback(() => {
    if (values.points.length > 4) return;
    setValues((prev) => ({ ...prev, points: [...values.points, ""] }));
  }, [values.points]);

  // Delete a point from the description
  const handlePointDelete = (index: number) => {
    const tempPoints = [...values.points];
    tempPoints.splice(index, 1);
    setValues((prev) => ({ ...prev, points: tempPoints }));
  };

  // Handle file input change for thumbnail upload
  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setImageUploadStarted(true);
      setErrorMessage("");
      uploadImage(
        file,
        (progress: number) => {
          setImageUploadProgress(progress);
        },
        (url: string) => {
          setImageUploadStarted(false);
          setImageUploadProgress(0);
          setValues((prev) => ({ ...prev, thumbnail: url }));
        },
        (error: string) => {
          setImageUploadStarted(false);
          setErrorMessage(error);
        }
      );
    },
    []
  );

  // Handle input change for text fields
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, property: string) => {
      setValues((prev) => ({
        ...prev,
        [property]: event.target.value,
      }));
      setErrorMessage("");
    },
    []
  );

  // Check if a URL is valid
  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Validate the form before submission
  const validateForm = (): boolean => {
    const actualPoints = values.points.filter((item) => item.trim());

    let isValid = true;
    let errorMessage = "";

    switch (true) {
      case !values.thumbnail:
        isValid = false;
        errorMessage = "photo for project is required";
        break;
      case !values.github:
        isValid = false;
        errorMessage = "Project's repository link required";
        break;
      case !isValidUrl(values.github):
        isValid = false;
        errorMessage = "Invalid URL";
        break;
      case values.link !== "" && !isValidUrl(values.link):
        isValid = false;
        errorMessage = "Invalid URL";
        break;
      case !values.title:
        isValid = false;
        errorMessage = "Project's Title required";
        break;
      case !values.overview:
        isValid = false;
        errorMessage = "Project's Overview required";
        break;
      case !actualPoints.length:
        isValid = false;
        errorMessage = "Description of Project is required";
        break;
      case actualPoints.length < 2:
        isValid = false;
        errorMessage = "Minimum 2 description points required";
        break;
      case values.points.length > 2 &&
        values.points.some((point) => point === ""):
        isValid = false;
        errorMessage = "Description points cannot be empty";
        break;
      default:
        errorMessage = "";
        break;
    }

    setErrorMessage(errorMessage);

    return isValid;
  };

  // Handle form submission
  const handleSubmission = async () => {
    if (!validateForm()) return;

    setSetSubmitButtonDisabled(true);

    try {
      if (isEdit) {
        await dispatch(
          addOrUpdateProject({ ...values, refUser: uid, pid: defaults.pid })
        );
      } else {
        await dispatch(addOrUpdateProject({ ...values, refUser: uid }));
      }

      setSetSubmitButtonDisabled(false);

      if (props.onSubmission) props.onSubmission();

      if (props.onClose) props.onClose();

      // Reset form values
      setValues({
        thumbnail: "",
        title: "",
        overview: "",
        github: "",
        link: "",
        points: ["", ""],
        likes: [],
      });
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  // Handle form cancellation
  const handleCancel = () => {
    // Reset form values
    setValues({
      thumbnail: "",
      title: "",
      overview: "",
      github: "",
      link: "",
      points: ["", ""],
      likes: [],
    });

    if (props.onClose) props.onClose();
  };

  return (
    <Modal onClose={() => props.onClose}>
      <div className={styles.container}>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileInputChange}
        />
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.image}>
              <img
                src={
                  values.thumbnail
                    ? values.thumbnail
                    : "https://www.agora-gallery.com/advice/wp-content/uploads/2015/10/image-placeholder-300x200.png"
                }
                alt="project thumbnail"
                onClick={() => fileInputRef.current?.click()}
              />
              {imageUploadStarted && (
                <p>
                  <LinearProgress
                    variant="determinate"
                    value={imageUploadProgress}
                  />
                </p>
              )}
            </div>

            <TextField
              label="Github*"
              variant="outlined"
              type="text"
              size="small"
              placeholder="Project repository link"
              value={values.github}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(event, "github")
              }
            />
            <TextField
              label="Deployed link"
              variant="outlined"
              type="text"
              size="small"
              placeholder="Project Deployed link"
              value={values.link}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(event, "link")
              }
            />
          </div>
          <div className={styles.right}>
            <TextField
              label="Project Title*"
              variant="outlined"
              type="text"
              size="small"
              placeholder="Enter project title"
              value={values.title}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(event, "title")
              }
            />
            <TextField
              label="Project Overview*"
              variant="outlined"
              type="text"
              size="small"
              placeholder="Project's brief overview"
              value={values.overview}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(event, "overview")
              }
            />

            <div className={styles.description}>
              <div className={styles.top}>
                <p className={styles.title}>Project Description</p>
                <p className={styles.link} onClick={handleAddPoint}>
                  + Add point
                </p>
              </div>
              <div className={styles.inputs}>
                {values.points.map((item, index) => (
                  <div className={styles.input} key={index}>
                    <TextField
                      variant="outlined"
                      type="text"
                      key={index}
                      size="small"
                      placeholder={`keyword ${index + 1}`}
                      value={item}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handlePointUpdate(event.target.value, index)
                      }
                    />
                    {index > 1 && (
                      <X onClick={() => handlePointDelete(index)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className={styles.error}>{errorMessage}</p>
        <div className={styles.footer}>
          <p className={styles.cancel} onClick={handleCancel}>
            Cancel
          </p>
          <button
            className={styles.savebutton}
            onClick={handleSubmission}
            disabled={submitButtonDisabled}
          >
            Submit
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default memo(ProjectForm);
