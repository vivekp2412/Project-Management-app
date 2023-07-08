import { useState } from "react";
import { Link } from "react-router-dom";
import { GitHub, Paperclip, Star } from "react-feather";
import { toast } from "react-toastify";
import { updatelikes } from "../../../helpers/db";
import Modal from "../../Modal/Modal";
import { useAppSelector } from "../../redux/hooks";
import {
  selectAuthenticate,
  selectUserDetails,
} from "../../redux/feature/userSlice";
import { ProjectModalProps } from "../../../Types/types";
import styles from "./ProjectModal.module.css";

function ProjectModal(props: ProjectModalProps) {
  const { details } = props;
  const isauthenticated = useAppSelector(selectAuthenticate);
  const userDetails = useAppSelector(selectUserDetails);
  const [starFilled, setStarFilled] = useState(
    details.likes?.includes(userDetails.uid!)
  );
  const [starCount, setStarCount] = useState(details.likes!.length);

  const handleStar = () => {
    toast.info("you first have to login!");
  };

  const toggleStar = async () => {
    const isAddingLike = !starFilled;

    await updatelikes(details.pid!, isAddingLike, userDetails.uid!);

    if (isAddingLike) {
      setStarFilled(true);
      setStarCount(starCount + 1);
    } else {
      setStarFilled(false);
      setStarCount(starCount - 1);
    }

    await props.fetchAllProjects();
  };

  return (
    <Modal onClose={props.onClose}>
      <div className={styles.container}>
        <p className={styles.heading}>Project Details</p>
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.image}>
              <img
                src={
                  details?.thumbnail ||
                  "https://www.agora-gallery.com/advice/wp-content/uploads/2015/10/image-placeholder-300x200.png"
                }
                alt="Project thumbnail"
              />
            </div>
            <div className={styles.links}>
              <Link target="_blank" to={`${details.github}`}>
                <GitHub />
              </Link>
              {details.link && (
                <Link target="_blank" to={`${details.link}`}>
                  <Paperclip />
                </Link>
              )}

              <div className={styles.starDetails}>
                {isauthenticated ? (
                  <>
                    <p className={styles.star}>{starCount}</p>
                    <Star
                      onClick={toggleStar}
                      fill={starFilled ? "#FFCC00" : "none"}
                    />
                  </>
                ) : (
                  <>
                    <p className={styles.star}>{starCount}</p>
                    <Star onClick={handleStar} />
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <p className={styles.title}>{details.title}</p>
            <p className={styles.overview}>{details.overview}</p>
            <ul>
              {details.points!.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ProjectModal;
