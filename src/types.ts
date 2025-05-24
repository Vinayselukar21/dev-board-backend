
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


// Roles and permissions

export enum PermissionType {
  VIEW_PROJECT = 'VIEW_PROJECT',
  ALL_PROJECT = 'ALL_PROJECT',
  CREATE_PROJECT = 'CREATE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',

  VIEW_TASK = 'VIEW_TASK',
  ALL_TASK = 'ALL_TASK',
  CREATE_TASK = 'CREATE_TASK',
  EDIT_ANY_TASK = 'EDIT_ANY_TASK',
  DELETE_TASK = 'DELETE_TASK',

  ADD_MEMBER = 'ADD_MEMBER',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  CHANGE_MEMBER_ROLE = 'CHANGE_MEMBER_ROLE',

  CREATE_EVENT = 'CREATE_EVENT',
  EDIT_EVENT = 'EDIT_EVENT',
  EDIT_ANY_EVENT = 'EDIT_ANY_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
}

export enum OrgPermissionType {
  OWNER = 'OWNER',

  VIEW_ORG = 'VIEW_ORG',
  EDIT_ORG = 'EDIT_ORG',
  DELETE_ORG = 'DELETE_ORG',
  ONBOARD_USER = 'ONBOARD_USER',
  REMOVE_USER = 'REMOVE_USER',
  CHANGE_USER_ROLE = 'CHANGE_USER_ROLE',

  VIEW_WORKSPACE = 'VIEW_WORKSPACE',
  CREATE_WORKSPACE = 'CREATE_WORKSPACE',
  EDIT_WORKSPACE = 'EDIT_WORKSPACE',
  DELETE_WORKSPACE = 'DELETE_WORKSPACE',
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
