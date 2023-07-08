import { useNavigate } from "react-router-dom";
import { ArrowRight } from "react-feather";
import HomeImage from "../../../assets/home-image.gif";
import { selectAuthenticate } from "../../redux/feature/userSlice";
import { useAppSelector } from "../../redux/hooks";
import styles from "./Header.module.css";

function Header() {
  const navigate = useNavigate();
  const isauthenticated = useAppSelector(selectAuthenticate);

  const handleNextButtonClick = () => {
    if (isauthenticated) {
      navigate("/account");
    } else {
      navigate("/login");
    }
  };
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <p className={styles.heading}>Projects Expo</p>
        <p className={styles.subHeading}>
          A centralized platform for{" "}
          <span className={styles.subText}>software development projects</span>.
        </p>
        <p className={styles.subDescription}>
          All-in-one platform for software development projects, providing a
          streamlined approach to project management and collaboration.
        </p>
        <button onClick={handleNextButtonClick}>
          {isauthenticated ? "Manage your Projects" : "Get Started"}
          <ArrowRight />
        </button>
      </div>
      <div className={styles.right}>
        <img src={HomeImage} alt="home image" />
      </div>
    </div>
  );
}

export default Header;
