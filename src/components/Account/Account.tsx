import { useState, useEffect, useCallback, memo } from "react";
import {
  LogOut,
  Edit2,
  Trash,
  Paperclip,
  GitHub,
  ArrowLeftCircle,
} from "react-feather";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { signOut } from "firebase/auth";
import ProjectForm from "./ProjectForm/ProjectForm";
import { auth, getAllProjectsForUser, deleteProject } from "../../helpers/db";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  logout,
  selectAuthenticate,
  selectUserDetails,
  selectLoading,
} from "../redux/feature/userSlice";
import Nodata from "../../assets/nodata.svg";
import "react-confirm-alert/src/react-confirm-alert.css";
import styles from "./Account.module.css";
import { Project } from "../../Types/types";
import UserProfile from "./UserProfile/UserProfile";
import useCheckUserLogout from "../../Hooks/useCheckUserLogout";

function Account() {
  const userDetails = useAppSelector(selectUserDetails);
  const authenticate = useAppSelector(selectAuthenticate);
  const loading = useAppSelector(selectLoading);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditProjectModal, setIsEditProjectModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | {}>({});
  useCheckUserLogout();

  // Logout user
  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logout());
    localStorage.clear();
  };

  // Go back to previous page
  const handleBack = () => {
    navigate(-1);
  };

  // Open project form to add a new project
  const handleAddProject = () => {
    setEditProject({});
    setShowProjectForm(true);
  };

  // Fetch all projects for the user
  const fetchAllProjects = async () => {
    const result = await getAllProjectsForUser(userDetails.uid!);
    if (!result) {
      setProjectsLoaded(true);
      return;
    }
    setProjectsLoaded(true);

    let tempProjects: Project[] = [];
    result.forEach((doc) => tempProjects.push({ ...doc.data(), pid: doc.id }));
    setProjects(tempProjects);
  };

  // Handle click on Edit button for a project
  const handleEditClick = (project: Project) => {
    setIsEditProjectModal(true);
    setEditProject(project);
    setShowProjectForm(true);
  };

  // Handle project deletion
  const handleDeletion = useCallback((pid: string) => {
    confirmAlert({
      title: "Confirm to Delete",
      message: "Are you sure to delete this project?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            await deleteProject(pid);
            fetchAllProjects();
            toast.success('Deleted!", "Your Project has been deleted.');
          },
        },
        {
          label: "No",
        },
      ],
    });
  }, []);

  useEffect(() => {
    if (userDetails.uid) {
      fetchAllProjects();
    }
  }, [userDetails.uid]);

  if (loading) {
    return (
      <div className="spinner">
        <PuffLoader color="#63b2ff" />
      </div>
    );
  }

  return authenticate && userDetails.uid ? (
    <div className={styles.container}>
      {showProjectForm && (
        <ProjectForm
          onSubmission={fetchAllProjects}
          onClose={() => setShowProjectForm(false)}
          isEdit={isEditProjectModal}
          default={editProject}
        />
      )}
      <div className={styles.header}>
        <p className={styles.heading}>
          <span>Welcome {userDetails.name}</span>
        </p>
        <div className={styles.rightHeader}>
          <div className={styles.back} onClick={handleBack}>
            <ArrowLeftCircle /> Back
          </div>
          <div className={styles.logout} onClick={handleLogout}>
            <LogOut /> Logout
          </div>
        </div>
      </div>

      <UserProfile />

      <hr />
      <div className={styles.section}>
        <div className={styles.projectsHeader}>
          <div className={styles.title}>Your Projects</div>
          <button className={styles.savebutton} onClick={handleAddProject}>
            Add Project
          </button>
        </div>

        <div className={styles.projects}>
          {projectsLoaded ? (
            projects.length > 0 ? (
              projects.map((item, index) => (
                <div className={styles.project} key={item.title ?? +index}>
                  <p className={styles.title}>{item.title}</p>

                  <div className={styles.links}>
                    <Edit2 onClick={() => handleEditClick(item)} />
                    <Trash
                      className={styles.trash}
                      onClick={() => handleDeletion(item.pid!)}
                    />
                    <Link target="_blank" to={`${item.github}`}>
                      <GitHub />
                    </Link>
                    {item.link && (
                      <Link target="_blank" to={`${item.link}`}>
                        <Paperclip />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <img src={Nodata} alt="no data found" className={styles.nodata} />
            )
          ) : (
            <div className="spinner">
              <PuffLoader color="#63b2ff" />
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    // If user is not authenticated, redirect to home page
    <Navigate to="/" />
  );
}

export default memo(Account);
