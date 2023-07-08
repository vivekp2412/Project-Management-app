import styles from "./Modal.module.css";

interface ModalProps {
  onClose?: () => void;
  children: React.ReactNode;
}

function Modal(props: ModalProps) {
  const { onClose, children } = props;
  return (
    <div
      className={styles.container}
      onClick={() => (onClose ? onClose() : "")}
    >
      <div
        className={styles.inner}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
