import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Search } from "react-feather";
import { PuffLoader } from "react-spinners";
import { InputBase } from "@mui/material";
import { getAllProjects } from "../../helpers/db";
import ProjectModal from "./ProjectModal/ProjectModal";
import { selectLoading } from "../redux/feature/userSlice";
import { useAppSelector } from "../redux/hooks";
import Nodata from "../../assets/nodata.svg";
import styles from "./Home.module.css";
import { Project } from "../../Types/types";
import Header from "./Header/Header";
import useCheckUserLogout from "../../Hooks/useCheckUserLogout";

function Home() {
  const isloading = useAppSelector(selectLoading);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projects, setProjects] = useState<Project[] | []>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectDetails, setProjectDetails] = useState<Project | {}>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCategory, setSortCategory] = useState("");
  useCheckUserLogout();

  const handleSearchQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortCategory(event.target.value);
  };

  const fetchAllProjects = async () => {
    const result = await getAllProjects();
    setProjectsLoaded(true);
    if (!result) {
      return;
    }

    const tempProjects: Project[] = [];
    result.forEach((doc) => tempProjects.push({ ...doc.data(), pid: doc.id }));

    setProjects(tempProjects);
  };

  const handleProjectCardClick = (project: Project) => {
    setShowProjectModal(true);
    setProjectDetails(project);
  };

  const sortedProjects = useMemo(() => {
    let sortedProjects = [...projects];

    switch (sortCategory) {
      case "a-z":
        sortedProjects.sort((a, b) => a.title!.localeCompare(b.title!));
        break;
      case "z-a":
        sortedProjects.sort((a, b) => b.title!.localeCompare(a.title!));
        break;
      case "most-votes":
        sortedProjects.sort(
          (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
        );
        break;
      default:
        break;
    }

    return sortedProjects;
  }, [projects, sortCategory]);

  const filteredProjects = useMemo(() => {
    return sortedProjects.filter(
      (project) =>
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.points?.some((point) =>
          point.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [sortedProjects, searchQuery]);

  useEffect(() => {
    fetchAllProjects();
  }, []);

  return isloading ? (
    <div className="spinner">
      <PuffLoader color="#63b2ff" />
    </div>
  ) : (
    <div className={styles.container}>
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          details={projectDetails}
          fetchAllProjects={fetchAllProjects}
        />
      )}
      <Header />

      <hr />

      <div className={styles.body}>
        <p className={styles.title}>All Projects</p>
        <div className={styles.filter}>
          <div className={styles.searchBar}>
            <div className={styles.searchIcon}>
              <Search />
            </div>
            <InputBase
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchQueryChange}
              classes={{
                root: styles.inputRoot,
                input: styles.inputInput,
              }}
            />
          </div>
          <div className={styles.select}>
            <select
              value={sortCategory}
              className={styles.sortBy}
              onChange={handleSortCategoryChange}
            >
              <option value="">Sort by..</option>
              <option value="a-z"> &darr; A to Z</option>
              <option value="z-a"> &uarr; Z to A</option>
              <option value="most-votes">Most Votes</option>
            </select>
          </div>
        </div>
        <div className={styles.projects}>
          {projectsLoaded ? (
            filteredProjects.length > 0 ? (
              filteredProjects.map((item) => (
                <div
                  className={styles.project}
                  key={item.pid}
                  onClick={() => handleProjectCardClick(item)}
                >
                  <div className={styles.image}>
                    <img
                      src={
                        item.thumbnail ||
                        "https://www.agora-gallery.com/advice/wp-content/uploads/2015/10/image-placeholder-300x200.png"
                      }
                      alt="Project thumbnail"
                    />
                  </div>
                  <p className={styles.title}>{item.title}</p>
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
      <div className={styles.background_clip}></div>
    </div>
  );
}

export default Home;
