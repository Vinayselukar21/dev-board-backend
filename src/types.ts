
export interface Organization {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  users?: User[];
  workspaces?: Workspace[];
  logs?: Log[];
}

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
  contactNo?: string;
  location?: string;
  ownedWorkspaces?: Workspace[];
  memberships?: WorkspaceMember[];
  assignedTasks?: Task[];
  Project?: Project[];
  Task?: Task[];
}

export interface Workspace {
  id: string;
  icon: string;
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
  icon: string;
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
  role: string; //member, admin
  invitedAt: string;
  accepted: boolean;
  userId: string;
  workspaceId: string;
  user: User;
  workspace: Workspace;
  createdEvents: CalendarEvent[]
  department?: Department
}

export interface Department {
  id: string;
  workspaceId: string;
  workspace: Workspace;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  members: WorkspaceMember[];
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
  createdAt: Date | null;
  updatedAt: Date | null;
  projectId: string;
  project: Project;
  createdById: string;
  createdBy: User;
  assignees: User[];
}


export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime: string;
  occurence: 'single' | 'recurring-weekly' | 'recurring-monthly';
  status: 'active' | 'cancelled';

  // Relations
  projectId?: string;
  project?: Project;

  workspaceId: string;
  workspace: Workspace;

  type: 'event' | 'meeting' | 'task';
  location?: string;

  createdAt: Date | null;
  updatedAt: Date | null;

  createdById: string;
  createdBy: WorkspaceMember;
}

export interface Log {
  id: string;
  type: "workspace" | "project" | "task"; // assuming these are the only valid types
  action: string;
  message: string;

  workspaceId: string;
  userId: string;
  organizationId: string;

  createdAt: Date | null;
  updatedAt: Date | null;

  // Optional nested objects if you choose to include relations
  workspace?: Workspace;
  user?: User;
  organization?: Organization;
}

