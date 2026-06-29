import {
  PrismaClient,
  UserRole,
  UserStatus,
  UserScope,
  EventStatus,
  EventType,
  EventVisibility,
  ApprovalLevel
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORY_SEED = [
  { name: "Seminar", slug: "seminar" },
  { name: "Lecture", slug: "lecture" },
  { name: "Workshop", slug: "workshop" },
  { name: "Conference", slug: "conference" },
  { name: "Faculty Meeting", slug: "faculty-meeting" },
  { name: "Department Meeting", slug: "department-meeting" },
  { name: "Examination", slug: "examination" },
  { name: "Project Defence", slug: "project-defence" },
  { name: "Orientation", slug: "orientation" },
  { name: "Student Activity", slug: "student-activity" },
  { name: "Public Holiday", slug: "public-holiday" },
  { name: "Other", slug: "other" }
];

async function main(): Promise<void> {
  const org = await prisma.organization.upsert({
    where: { slug: "global-university" },
    update: {
      name: "Ibrahim Badamasi Babangida University, Lapai",
      tagline: "Unity and Faith, Peace and Progress",
      address: "Lapai, Niger State, Nigeria",
      website: "https://www.ibbul.edu.ng"
    },
    create: {
      name: "Ibrahim Badamasi Babangida University, Lapai",
      slug: "global-university",
      tagline: "Unity and Faith, Peace and Progress",
      address: "Lapai, Niger State, Nigeria",
      website: "https://www.ibbul.edu.ng",
      plan: "ENTERPRISE",
      settings: { timezone: "Africa/Lagos", language: "en" }
    }
  });

  for (const category of CATEGORY_SEED) {
    await prisma.eventCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: category.slug } },
      update: { name: category.name, isActive: true },
      create: { ...category, organizationId: org.id }
    });
  }

  const facultyScience = await prisma.department.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "faculty-of-science" } },
    update: { name: "Faculty of Science" },
    create: {
      name: "Faculty of Science",
      slug: "faculty-of-science",
      organizationId: org.id
    }
  });

  const facultyArts = await prisma.department.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "faculty-of-arts" } },
    update: { name: "Faculty of Arts and Social Sciences" },
    create: {
      name: "Faculty of Arts and Social Sciences",
      slug: "faculty-of-arts",
      organizationId: org.id
    }
  });

  const csDept = await prisma.department.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "computer-science" } },
    update: { name: "Computer Science", parentId: facultyScience.id },
    create: {
      name: "Computer Science",
      slug: "computer-science",
      organizationId: org.id,
      parentId: facultyScience.id
    }
  });

  const mathDept = await prisma.department.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "mathematics" } },
    update: { name: "Mathematics", parentId: facultyScience.id },
    create: {
      name: "Mathematics",
      slug: "mathematics",
      organizationId: org.id,
      parentId: facultyScience.id
    }
  });

  const massComm = await prisma.department.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "mass-communication" } },
    update: { name: "Mass Communication", parentId: facultyArts.id },
    create: {
      name: "Mass Communication",
      slug: "mass-communication",
      organizationId: org.id,
      parentId: facultyArts.id
    }
  });

  // Legacy slugs kept for backward compatibility
  const engDept = await prisma.department.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "engineering" } },
    update: { name: "Engineering (Legacy)", parentId: facultyScience.id },
    create: {
      name: "Engineering (Legacy)",
      slug: "engineering",
      organizationId: org.id,
      parentId: facultyScience.id
    }
  });

  await prisma.department.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "business" } },
    update: { name: "Business (Legacy)", parentId: facultyArts.id },
    create: {
      name: "Business (Legacy)",
      slug: "business",
      organizationId: org.id,
      parentId: facultyArts.id
    }
  });

  const senateBuilding = await prisma.building.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "SEN" } },
    update: { name: "Senate Building" },
    create: {
      name: "Senate Building",
      code: "SEN",
      description: "Main administrative block",
      organizationId: org.id
    }
  });

  const libraryBuilding = await prisma.building.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "LIB" } },
    update: { name: "University Library" },
    create: {
      name: "University Library",
      code: "LIB",
      description: "Central library and ICT hub",
      organizationId: org.id,
      departmentId: csDept.id
    }
  });

  const mainHall = await prisma.venue.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "MAIN" } },
    update: {
      name: "Senate Chamber Hall",
      building: "Senate Building",
      buildingId: senateBuilding.id,
      capacity: 800
    },
    create: {
      name: "Senate Chamber Hall",
      code: "MAIN",
      building: "Senate Building",
      buildingId: senateBuilding.id,
      capacity: 800,
      organizationId: org.id,
      images: []
    }
  });

  const innovationHub = await prisma.venue.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "HUB" } },
    update: {
      name: "ICT Lecture Theatre",
      building: "University Library",
      buildingId: libraryBuilding.id,
      capacity: 250
    },
    create: {
      name: "ICT Lecture Theatre",
      code: "HUB",
      building: "University Library",
      buildingId: libraryBuilding.id,
      capacity: 250,
      organizationId: org.id,
      images: []
    }
  });

  const password = await hash("ChangeMe123!", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "super@nexus.dev" },
    update: {
      password,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      scope: UserScope.UNIVERSITY,
      departmentId: csDept.id,
      facultyId: facultyScience.id,
      name: "System Administrator"
    },
    create: {
      email: "super@nexus.dev",
      password,
      name: "System Administrator",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      scope: UserScope.UNIVERSITY,
      organizationId: org.id,
      departmentId: csDept.id,
      facultyId: facultyScience.id
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexus.dev" },
    update: {
      password,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      scope: UserScope.UNIVERSITY,
      departmentId: csDept.id,
      facultyId: facultyScience.id,
      name: "University Administrator"
    },
    create: {
      email: "admin@nexus.dev",
      password,
      name: "University Administrator",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      scope: UserScope.UNIVERSITY,
      organizationId: org.id,
      departmentId: csDept.id,
      facultyId: facultyScience.id
    }
  });

  const approver = await prisma.user.upsert({
    where: { email: "approver@nexus.dev" },
    update: {
      password,
      role: UserRole.APPROVER,
      status: UserStatus.ACTIVE,
      scope: UserScope.FACULTY,
      departmentId: csDept.id,
      facultyId: facultyScience.id,
      name: "Dr. Musa (Event Officer)"
    },
    create: {
      email: "approver@nexus.dev",
      password,
      name: "Dr. Musa (Event Officer)",
      role: UserRole.APPROVER,
      status: UserStatus.ACTIVE,
      scope: UserScope.FACULTY,
      organizationId: org.id,
      departmentId: csDept.id,
      facultyId: facultyScience.id
    }
  });

  await prisma.department.update({
    where: { id: csDept.id },
    data: { headId: approver.id }
  });

  const standardUser = await prisma.user.upsert({
    where: { email: "user@nexus.dev" },
    update: {
      password,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      scope: UserScope.DEPARTMENT,
      departmentId: csDept.id,
      facultyId: facultyScience.id,
      name: "Dr. Casey Lecturer"
    },
    create: {
      email: "user@nexus.dev",
      password,
      name: "Dr. Casey Lecturer",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      scope: UserScope.DEPARTMENT,
      organizationId: org.id,
      departmentId: csDept.id,
      facultyId: facultyScience.id
    }
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@nexus.dev" },
    update: {
      password,
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
      scope: UserScope.PUBLIC,
      departmentId: csDept.id,
      facultyId: facultyScience.id,
      name: "Student Riley"
    },
    create: {
      email: "viewer@nexus.dev",
      password,
      name: "Student Riley",
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
      scope: UserScope.PUBLIC,
      organizationId: org.id,
      departmentId: csDept.id,
      facultyId: facultyScience.id
    }
  });

  const orientationCategory = await prisma.eventCategory.findFirst({
    where: { organizationId: org.id, slug: "orientation" }
  });

  const approvedEvent = await prisma.event.upsert({
    where: { id: "seed_event_approved" },
    update: {},
    create: {
      id: "seed_event_approved",
      title: "IBBUL Orientation Week",
      slug: "ibbul-orientation-week-seed",
      description: "University-wide orientation activities for newly admitted students.",
      coverImage: null,
      status: EventStatus.APPROVED,
      type: EventType.CULTURAL,
      categoryId: orientationCategory?.id ?? null,
      approvalLevel: ApprovalLevel.UNIVERSITY,
      visibility: EventVisibility.PUBLIC,
      timezone: "Africa/Lagos",
      startTime: new Date("2026-05-20T10:00:00.000Z"),
      endTime: new Date("2026-05-20T12:00:00.000Z"),
      isRecurring: false,
      venueId: mainHall.id,
      organizerId: standardUser.id,
      departmentId: csDept.id,
      organizationId: org.id,
      maxAttendees: 500,
      tags: ["orientation"],
      approvedBy: approver.id,
      approvedAt: new Date("2026-04-20T10:00:00.000Z")
    }
  });

  const pendingEvent = await prisma.event.upsert({
    where: { id: "seed_event_pending" },
    update: {},
    create: {
      id: "seed_event_pending",
      title: "Computer Science Research Seminar (pending)",
      slug: "cs-research-seminar-pending",
      description: "Department research presentations awaiting faculty approval.",
      status: EventStatus.PENDING,
      type: EventType.SEMINAR,
      approvalLevel: ApprovalLevel.DEPARTMENT,
      visibility: EventVisibility.INTERNAL,
      timezone: "Africa/Lagos",
      startTime: new Date("2026-05-10T14:00:00.000Z"),
      endTime: new Date("2026-05-10T17:00:00.000Z"),
      isRecurring: false,
      venueId: innovationHub.id,
      organizerId: standardUser.id,
      departmentId: csDept.id,
      organizationId: org.id,
      tags: ["research"]
    }
  });

  console.log("Seed complete:", {
    org: org.name,
    superAdmin: superAdmin.email,
    admin: admin.email,
    approver: approver.email,
    standardUser: standardUser.email,
    viewer: viewer.email,
    approvedEvent: approvedEvent.title,
    pendingEvent: pendingEvent.title,
    faculties: [facultyScience.name, facultyArts.name],
    departments: [csDept.name, mathDept.name, massComm.name, engDept.name]
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
