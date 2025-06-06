
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

  organizationRole?: OrganizationRole;
  organizationRoleId?: string;
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

  roles: WorkspaceRole[];
}

export interface WorkspaceMember {
  id: string;
  invitedAt: string;
  accepted: boolean;
  
  roleId: string;
  role: WorkspaceRole;

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
  occurence: 'single' | 'recurring';
  type: 'event' | 'meeting';
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


// Roles and permissions

export enum PermissionType {
  PROJECT_VIEW = "PROJECT_VIEW",
  PROJECT_CREATE = "PROJECT_CREATE",
  PROJECT_EDIT = "PROJECT_EDIT",
  PROJECT_DELETE = "PROJECT_DELETE",

  TASK_VIEW = "TASK_VIEW",
  TASK_CREATE = "TASK_CREATE",
  TASK_EDIT = "TASK_EDIT",
  TASK_DELETE = "TASK_DELETE",

  MEMBER_ADD = "MEMBER_ADD",
  MEMBER_REMOVE = "MEMBER_REMOVE",
  MEMBER_CHANGE_ROLE = "MEMBER_CHANGE_ROLE",

  EVENT_VIEW = "EVENT_VIEW",
  EVENT_CREATE = "EVENT_CREATE",
  EVENT_EDIT = "EVENT_EDIT",
  EVENT_EDIT_ANY = "EVENT_EDIT_ANY",
  EVENT_CANCEL = "EVENT_CANCEL",
  EVENT_DELETE = "EVENT_DELETE",

  ROLE_WORKSPACE_CREATE = "ROLE_WORKSPACE_CREATE",
  ROLE_WORKSPACE_EDIT = "ROLE_WORKSPACE_EDIT",
  ROLE_WORKSPACE_DELETE = "ROLE_WORKSPACE_DELETE",

  DEPARTMENT_VIEW = "DEPARTMENT_VIEW",
  DEPARTMENT_CREATE = "DEPARTMENT_CREATE",
  DEPARTMENT_EDIT = "DEPARTMENT_EDIT",
  DEPARTMENT_DELETE = "DEPARTMENT_DELETE",
}


export enum OrgPermissionType {
  OWNER = "OWNER",

  ORG_VIEW = "ORG_VIEW",
  ORG_EDIT = "ORG_EDIT",
  ORG_DELETE = "ORG_DELETE",

  ORG_ONBOARD_USER = "ORG_ONBOARD_USER",
  ORG_REMOVE_USER = "ORG_REMOVE_USER",
  ORG_CHANGE_USER_ROLE = "ORG_CHANGE_USER_ROLE",

  ORG_WORKSPACE_VIEW = "ORG_WORKSPACE_VIEW",
  ORG_WORKSPACE_CREATE = "ORG_WORKSPACE_CREATE",
  ORG_WORKSPACE_EDIT = "ORG_WORKSPACE_EDIT",
  ORG_WORKSPACE_DELETE = "ORG_WORKSPACE_DELETE",

  ORG_CUSTOM_ROLE_CREATE = "ORG_CUSTOM_ROLE_CREATE",
  ORG_CUSTOM_ROLE_EDIT = "ORG_CUSTOM_ROLE_EDIT",
  ORG_CUSTOM_ROLE_DELETE = "ORG_CUSTOM_ROLE_DELETE",
}


export interface WorkspaceRole {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  workspaceId: string;
  workspace?: Workspace;
  permissions?: WorkspaceRolePermission[];
  members?: WorkspaceMember[];
}

export interface WorkspacePermission {
  id: string;
  name: string;
  workspaceId?: string;
  workspace?: Workspace;
  roles?: WorkspaceRolePermission[];
}

export interface WorkspaceRolePermission {
  id: string;
  workspaceRoleId: string;
  workspacePermissionId: string;
  role?: WorkspaceRole;
  permission?: WorkspacePermission;
}

export interface OrganizationRole {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  organizationId: string;
  organization?: Organization;
  permissions?: OrgRolePermission[];
  members?: User[];
}

export interface OrgPermission {
  id: string;
  name: string;
  organizationId?: string;
  organization?: Organization;
  roles?: OrgRolePermission[];
}

export interface OrgRolePermission {
  id: string;
  organizationRoleId: string;
  orgPermissionId: string;
  role?: OrganizationRole;
  permission?: OrgPermission;
}
