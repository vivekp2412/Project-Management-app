import { Component, ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <img
            src="https://t3.ftcdn.net/jpg/03/56/19/18/360_F_356191845_Uf1HSScTIHcxXeK1UXuEn0rdAzMvTfxo.jpg"
            alt="Error Boundary"
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
