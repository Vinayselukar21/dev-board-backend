
export interface Organization {
  id: string;
  name: string;
  type: string; // personal, work
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: User;
  users?: User[];
  workspaces?: Workspace[];
  logs?: Log[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  role: string; // admin, member, viewer
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  lastLogin?: string;
  contactNo?: string;
  location?: string;
  jobTitle: string;
  designation: string;
  ownedWorkspaces?: Workspace[];
  memberships?: WorkspaceMember[];
  assignedTasks?: Task[];
  Project?: Project[];
  Task?: Task[];
  ownedOrganization?: Organization;
  organization?: Organization;
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

  departments: Department[];

  logs: Log[];

  calendarEvents: CalendarEvent[];

  relationships: MemberWorkspaceRelationship[];

  organizationId?: string;
  organization?: Organization;
}

export interface WorkspaceMember {
  id: string;
  role: string; //member, admin
  invitedAt: string;
  accepted: boolean;

  userId: string;
  workspaceId: string;
  departmentId: string;

  user: User;
  workspace: Workspace;
  department?: Department

  projects: ProjectMember[];
  calendarEvents: CalendarEventParticipant[]

  createdEvents: CalendarEvent[]

  relationships: MemberWorkspaceRelationship[]
}

export interface MemberWorkspaceRelationship {
  id: string;
  workspaceMemberId: string;
  workspaceId: string;

  // Optional nested objects if needed
  workspaceMember?: WorkspaceMember;
  workspace?: Workspace;
  
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
  taskStages?: TaskStage[];

  calendarEvents?: CalendarEvent[];
  
  members?:ProjectMember[];
}

export interface TaskStage {
  id: string;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;

  projectId: string;
  project?: Project;
  tasks?: Task[];
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

  stageId: string;
  stage: TaskStage;

  createdById: string;
  createdBy: User;

  assignees: User[];
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


export interface Log {
  id: string;
  type: "workspace" | "project" | "task"; // assuming these are the only valid types
  action: string;
  message: string;

  workspaceId: string;
  workspace?: Workspace;
  
  userId: string;
  user?: User;

  createdAt: Date | null;
  updatedAt: Date | null;
   
  organizationId: string;
  organization?: Organization;
}


export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime: string;
  occurence: 'single' | 'recurring-weekly' | 'recurring-monthly';
  type: 'event' | 'meeting' | 'task';
  location?: string;
  status: 'active' | 'cancelled';

  createdById: string;
  createdBy: WorkspaceMember;

  // Relations
  projectId?: string;
  project?: Project;

  workspaceId: string;
  workspace: Workspace;
  
  participants: CalendarEventParticipant[];

  createdAt: Date | null;
  updatedAt: Date | null;
}


export interface CalendarEventParticipant {
  id: string;
  calendarEventId: string;
  workspaceMemberId: string;

  // Optional nested objects
  calendarEvent?: CalendarEvent;
  workspaceMember?: WorkspaceMember;
}
