export interface ProjectFormProps {
  isEdit: boolean;
  default: {
    thumbnail?: string;
    title?: string;
    overview?: string;
    github?: string;
    link?: string;
    points?: string[];
    pid?: string;
    likes?: string[];
  };
  onSubmission?: () => void;
  onClose?: () => void;
}

export interface Project {
  thumbnail?: string;
  title?: string;
  overview?: string;
  github?: string;
  link?: string;
  points?: string[];
  pid?: string;
  likes?: string[];
  refUser?: string;
}

export interface ProjectState {
  project: Project;
  loading: boolean;
  error: string | null;
}

export interface ProjectModalProps {
  details: Project;
  onClose?: () => void;
  fetchAllProjects: () => Promise<void>;
}

export interface AccountProps {
  timeoutId: NodeJS.Timeout | null;
}

export interface AuthProps {
  signup?: boolean;
}

export interface EndAdornmentProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UserValues {
  name?: string;
  email?: string;
  password?: string;
  profileImage?: string;
  designation?: string;
  github?: string;
  linkedin?: string;
  uid?: string;
}
