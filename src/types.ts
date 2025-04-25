export interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  lastLogin?: string;
  ownedWorkspaces: Workspace[];
  memberships: WorkspaceMember[];
  assignedTasks: Task[];
  Project: Project[];
  Task: Task[];
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
  members: WorkspaceMember[];
  projects: Project[];
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
  members: WorkspaceMember[];
  projects: Project[];
}

export interface WorkspaceMember {
  id: string;
  role: string;
  invitedAt: string;
  accepted: boolean;
  userId: string;
  workspaceId: string;
  user: User;
  workspace: Workspace;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  memberId: string;
  project: Project;
  member: WorkspaceMember;
  assignedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  deadline?: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  workspaceId: string;
  workspace?: Workspace;
  createdById: string;
  createdBy?: User;
  tasks?: Task[];
  members?: Array<string>;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project: Project;
  createdById: string;
  createdBy: User;
  assignees: User[];
}
