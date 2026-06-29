# FORMATTING INSTRUCTIONS (DELETE THIS SECTION BEFORE SUBMISSION)

When pasting into Microsoft Word or Google Docs, apply:

- Font: Times New Roman, 12pt  
- Line spacing: 1.5  
- Alignment: Justified  
- Page margins: 1 inch (2.54 cm) all sides  
- Chapter headings: Bold, 14pt, centred (Chapter One)  
- Section headings: Bold, 12pt (1.1 Background)  
- Insert page numbers centred at bottom  
- Update Table of Contents field after paste (Word: References → Table of Contents)

Replace all bracketed placeholders `[...]` with your actual names, dates, and figures.

---

<br>

<p align="center"><strong>DESIGN AND IMPLEMENTATION OF A UNIVERSITY EVENT SCHEDULING AND NOTIFICATION SYSTEM: A CASE STUDY OF IBRAHIM BADAMASI BABANGIDA UNIVERSITY, LAPAI</strong></p>

<br>

<p align="center">BY</p>

<br>

<p align="center"><strong>[STUDENT ONE FULL NAME]</strong><br>
Matriculation Number: [UG__/CS/____]</p>

<br>

<p align="center">AND</p>

<br>

<p align="center"><strong>[STUDENT TWO FULL NAME]</strong><br>
Matriculation Number: [UG__/CS/____]</p>

<br>

<p align="center">A Final Year Project Submitted to the Department of Computer Science,<br>
Faculty of Science,<br>
Ibrahim Badamasi Babangida University, Lapai,<br>
Niger State, Nigeria.</p>

<br>

<p align="center">In Partial Fulfilment of the Requirements for the Award of the<br>
Bachelor of Science (B.Sc.) Degree in Computer Science</p>

<br>

<p align="center"><strong>[MONTH, YEAR]</strong></p>

<br>

---

## CERTIFICATION

This is to certify that this project titled **“Design and Implementation of a University Event Scheduling and Notification System: A Case Study of Ibrahim Badamasi Babangida University, Lapai”** was carried out by **[Student One Full Name]** and **[Student Two Full Name]** under the supervision of **[Supervisor Name, PhD / Title]**, and that it has been submitted to the Department of Computer Science, Ibrahim Badamasi Babangida University, Lapai, for the award of Bachelor of Science (B.Sc.) in Computer Science.

<br>

Supervisor’s Signature: _________________________ &nbsp;&nbsp;&nbsp; Date: _______________

<br>

External Examiner’s Signature: _________________________ &nbsp;&nbsp;&nbsp; Date: _______________

<br>

Head of Department’s Signature: _________________________ &nbsp;&nbsp;&nbsp; Date: _______________

<br>

---

## DEDICATION

We dedicate this project to Almighty God for His guidance throughout our academic journey. We also dedicate this work to our parents and guardians, whose support and encouragement made our studies at Ibrahim Badamasi Babangida University possible.

<br>

**[Student One Full Name]** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **[Student Two Full Name]**

<br>

---

## ACKNOWLEDGEMENT

We wish to express our sincere gratitude to Almighty God for the gift of life, health, and the strength to complete this undergraduate programme.

Our special appreciation goes to our project supervisor, **[Supervisor Name]**, for professional guidance, constructive criticism, and patience from the proposal stage to the completion of this documentation. We are grateful to the Head of Department and other lecturers in the Department of Computer Science for the knowledge and training we received during our programme.

We thank our colleagues and classmates who shared ideas and moral support during the development and testing of this system. We also acknowledge the technical staff who facilitated our access to computing facilities.

Finally, we remain indebted to our families for their financial and emotional support.

<br>

**[Student One Full Name]** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **[Student Two Full Name]**

<br>

---

## ABSTRACT

Universities in Nigeria coordinate numerous academic and non-academic activities that require careful scheduling of venues, time, and personnel. At Ibrahim Badamasi Babangida University, Lapai, and in many similar institutions, event planning often depends on manual methods such as paper forms, telephone calls, and informal messaging. These approaches are slow, difficult to monitor, and prone to errors such as double booking of lecture theatres and halls.

This project designed and implemented a web-based **University Event Scheduling and Notification System** to improve the planning, approval, and communication of university events. The system was developed using Next.js, React, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, and NextAuth for authentication. It supports role-based access control for different categories of users, including viewers, general users, approvers, and administrators. The system provides facilities for event creation, approval workflow, venue scheduling, calendar display, conflict detection, in-system notifications, dashboard summaries, and analytics for administrators.

Testing of the implemented modules showed that the system can reduce scheduling conflicts, improve transparency in the approval process, and deliver timely notifications to relevant users. The project concludes that a centrally managed digital scheduling platform is a practical solution for improving event coordination within the university environment. Recommendations for future work include full email notification integration, mobile access, and linkage with other university information systems.

<br>

**Keywords:** Event scheduling, notification system, conflict detection, role-based access control, web application, Ibrahim Badamasi Babangida University, PostgreSQL, Next.js.

<br>

---

## TABLE OF CONTENTS

| Content | Page |
|---------|------|
| Title Page | i |
| Certification | ii |
| Dedication | iii |
| Acknowledgement | iv |
| Abstract | v |
| Table of Contents | vi |
| List of Tables | viii |
| List of Figures | ix |
| **CHAPTER ONE: INTRODUCTION** | 1 |
| 1.1 Background of the Study | 1 |
| 1.2 Statement of the Problem | 3 |
| 1.3 Aim and Objectives of the Study | 5 |
| 1.4 Significance of the Study | 6 |
| 1.5 Scope of the Study | 7 |
| 1.6 Limitations of the Study | 8 |
| 1.7 Definition of Terms | 9 |
| 1.8 Student Contributions | 10 |
| Chapter Summary | 11 |
| **CHAPTER TWO: LITERATURE REVIEW** | 12 |
| 2.1 Introduction | 12 |
| 2.2 Conceptual Review | 12 |
| 2.3 Review of Related Works | 15 |
| 2.4 Review of Existing Systems | 17 |
| 2.5 Research Gap | 19 |
| 2.6 Theoretical Framework | 20 |
| Chapter Summary | 21 |
| **CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN** | 22 |
| 3.1 Introduction | 22 |
| 3.2 Analysis of the Existing System | 22 |
| 3.3 Problems of the Existing System | 24 |
| 3.4 Description of the Proposed System | 25 |
| 3.5 System Architecture | 27 |
| 3.6 Input Design | 29 |
| 3.7 Output Design | 30 |
| 3.8 Database Design | 31 |
| 3.9 Entity-Relationship Diagram | 33 |
| 3.10 Use Case Diagram | 34 |
| 3.11 Activity and Flow Diagrams | 35 |
| 3.12 System Requirements | 37 |
| 3.13 Functional Requirements | 38 |
| 3.14 Non-Functional Requirements | 39 |
| Chapter Summary | 40 |
| **CHAPTER FOUR: SYSTEM IMPLEMENTATION AND TESTING** | 41 |
| 4.1 Introduction | 41 |
| 4.2 Development Environment and Tools | 41 |
| 4.3 Development Methodology | 42 |
| 4.4 System Implementation | 43 |
| 4.5 Frontend Implementation | 44 |
| 4.6 Backend and API Implementation | 46 |
| 4.7 Database Implementation | 48 |
| 4.8 Authentication and Role-Based Access Control | 49 |
| 4.9 Conflict Detection Module | 50 |
| 4.10 Notification Module | 51 |
| 4.11 System Testing | 52 |
| 4.12 Test Results and Discussion | 54 |
| 4.13 Screenshots of the Implemented System | 55 |
| Chapter Summary | 56 |
| **CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS** | 57 |
| 5.1 Summary | 57 |
| 5.2 Conclusion | 58 |
| 5.3 Recommendations | 59 |
| 5.4 Suggestions for Future Work | 60 |
| **REFERENCES** | 61 |
| **APPENDICES** | 63 |

<br>

---

## LIST OF TABLES

Table 1.1 Definition of Terms  
Table 2.1 Comparison of Related Studies  
Table 2.2 Comparison of Existing Event Management Approaches  
Table 3.1 Input Forms and Data Fields  
Table 3.2 System Outputs  
Table 3.3 User Roles and Access Levels  
Table 3.4 Functional Requirements  
Table 3.5 Non-Functional Requirements  
Table 4.1 Development Tools and Technologies  
Table 4.2 API Endpoints Implemented  
Table 4.3 Test Cases and Results  

<br>

---

## LIST OF FIGURES

Figure 3.1 System Architecture Diagram  
Figure 3.2 Entity-Relationship Diagram  
Figure 3.3 Use Case Diagram  
Figure 3.4 Activity Diagram for Event Approval  
Figure 3.5 Data Flow Diagram for Event Creation  
Figure 4.1 Screenshot of Login Page  
Figure 4.2 Screenshot of Dashboard  
Figure 4.3 Screenshot of Event Creation Page  
Figure 4.4 Screenshot of Events List with Approval Actions  
Figure 4.5 Screenshot of Calendar View  
Figure 4.6 Screenshot of Notifications Inbox  
Figure 4.7 Screenshot of Analytics Page  

<br>

---

# CHAPTER ONE

## INTRODUCTION

### 1.1 Background of the Study

Higher education institutions in Nigeria perform functions that extend beyond classroom teaching. Universities regularly organise seminars, workshops, conferences, examinations, orientation programmes, sports activities, cultural events, and administrative meetings. Each of these activities requires proper coordination of time, venue, organisers, and participants. When such activities are not managed through a reliable central system, the institution may experience confusion, poor attendance, and conflict over the use of limited facilities.

Ibrahim Badamasi Babangida University (IBB University), Lapai, operates in an environment where students and staff increasingly depend on digital tools for communication and information access. However, many administrative processes, including event scheduling, still rely partly on manual methods. In several cases, a department may submit a venue request through a paper form or email, while another unit may record a separate booking in a register or through informal messages. Without a single authoritative record, it becomes difficult to know which venue has been booked, for what purpose, and by which unit.

Information and Communication Technology (ICT) offers practical solutions to these challenges. A web-based system can provide a single platform where users submit event requests, approvers review them, the system checks for scheduling conflicts, and notifications are sent to concerned parties. Such a system can also maintain records that may be used for reporting and future planning.

This project was undertaken to design and implement a **University Event Scheduling and Notification System** as a case study relevant to Ibrahim Badamasi Babangida University, Lapai. The system allows different categories of users to perform duties according to their roles while improving communication about scheduled events. The study is presented as a final year project in the Department of Computer Science and reflects the practical application of software engineering, database systems, and web development concepts covered during the undergraduate programme.

### 1.2 Statement of the Problem

Despite the availability of modern communication tools, several problems remain in the management of university events:

1. **Fragmented scheduling process**  
   Event requests are often submitted through different channels such as paper forms, email, and informal group messages. This makes it difficult to maintain one reliable record of bookings.

2. **Venue conflicts and double booking**  
   Without an automatic method of checking overlapping bookings, two organisers may reserve the same lecture theatre, hall, or laboratory for the same period. Such conflicts may only be discovered at a late stage.

3. **Weak approval control**  
   Many events require approval from a head of department, faculty officer, or administrative unit before they are confirmed. Manual approval processes are not always properly recorded, and it may be difficult to trace who approved or rejected a request.

4. **Delayed or inconsistent notification**  
   Students and staff may not receive timely information about approved, rejected, or changed events. Dependence on posters or social media alone may exclude some members of the university community.

5. **Limited access control**  
   Not every user should be allowed to create, approve, or manage events. A proper system must distinguish between viewers, organisers, approvers, and administrators.

6. **Poor support for planning and reporting**  
   Manual systems do not easily provide summaries of events by department, venue usage, or pending approvals. This limits management ability to plan effectively.

These problems affect the efficiency of university operations and may disrupt academic and social programmes. This project seeks to address them through the design and implementation of a web-based scheduling and notification system.

### 1.3 Aim and Objectives of the Study

**Aim**

To design and implement a web-based University Event Scheduling and Notification System that improves event planning, approval, conflict detection, and communication within a university environment, using Ibrahim Badamasi Babangida University, Lapai as a case study context.

**Objectives**

The specific objectives of this study are to:

1. Examine the existing methods of event scheduling and notification in a university setting.  
2. Review related literature and existing systems on event management and scheduling.  
3. Analyse the requirements of users such as students, lecturers, approvers, and administrators.  
4. Design the architecture, database structure, and user interfaces of the proposed system.  
5. Implement user authentication and role-based access control.  
6. Develop modules for event creation, approval, rejection, and listing.  
7. Implement venue scheduling and calendar display.  
8. Implement a conflict detection mechanism for overlapping venue bookings.  
9. Implement in-system notifications for important event activities.  
10. Test the system and document the results.  
11. Provide recommendations for future improvement.

### 1.4 Significance of the Study

This study is significant for the following reasons:

- It provides a practical digital alternative to manual event scheduling within the university.  
- It supports orderly approval of events and reduces the risk of venue conflicts.  
- It improves communication between organisers, approvers, and other users through notifications.  
- It demonstrates the application of software engineering principles learned in the Computer Science programme.  
- It may serve as a reference for future students and for the university ICT unit considering digital administrative solutions.  
- It contributes to the wider effort to improve ICT use in Nigerian universities.

### 1.5 Scope of the Study

This project covers the design and implementation of a web application with the following scope:

- User registration and login  
- Role-based access control with multiple user categories  
- Event creation, listing, search, and filtering  
- Event approval and rejection workflow  
- Venue listing and scheduling support  
- Calendar display with export to calendar file format  
- Conflict detection for overlapping bookings at the same venue  
- In-system notifications  
- Dashboard summaries and administrative analytics  
- PostgreSQL database design and implementation using Prisma ORM  

The following are outside the current scope of the implemented system:

- Separate native mobile applications for Android and iOS  
- Full production deployment on university servers  
- Complete email delivery integration in all notification scenarios  
- Student event registration and attendance tracking interfaces  
- Integration with external university ERP or student information systems  

### 1.6 Limitations of the Study

The study is limited by the following factors:

1. The system requires internet access and does not support offline scheduling.  
2. Testing was carried out mainly in a development environment using sample data rather than full live university data.  
3. Conflict detection is based on venue time overlap and does not yet consider all possible resources such as shared equipment or personnel.  
4. Some interface sections, such as department management and user settings, are not yet fully connected to backend services.  
5. Email notification infrastructure exists in part but in-system notifications were given priority in the current implementation.  
6. Time and resource constraints limited the inclusion of some advanced features proposed for future development.

### 1.7 Definition of Terms

**Table 1.1 Definition of Terms**

| Term | Definition |
|------|------------|
| API | Application Programming Interface; a set of rules that allows software components to communicate. |
| Approval Workflow | The process through which an event moves from submission to acceptance or rejection by an authorised user. |
| Authentication | The process of verifying the identity of a user before granting access. |
| Conflict Detection | The automatic identification of overlapping event bookings at the same venue. |
| Database | An organised collection of data stored and accessed electronically. |
| Event | A planned university activity with defined title, time, venue, and organiser. |
| Notification | A message informing a user about an activity or change within the system. |
| PostgreSQL | A relational database management system used for persistent storage. |
| Prisma ORM | A tool that allows the application to interact with the database using structured models. |
| Role-Based Access Control (RBAC) | A security approach in which permissions are assigned according to user role. |
| Venue | A physical location such as a hall, laboratory, or field used for an event. |
| Web Application | A software program accessed through a web browser. |

### 1.8 Student Contributions

This project was completed jointly by two students in the Department of Computer Science. Both students participated in planning, analysis, implementation, testing, and documentation, although specific areas of responsibility were shared as follows.

**[Student One Full Name]** was mainly responsible for:

- System analysis and requirements gathering  
- Database design and implementation  
- Backend development and API routes  
- Authentication and role-based access control  
- Business logic for event approval and conflict detection  
- Notification module and system integration  
- Support during system testing  

**[Student Two Full Name]** was mainly responsible for:

- User interface design and layout  
- Frontend implementation using React and Next.js  
- Form design and client-side validation  
- Dashboard, events, calendar, and notification pages  
- User experience improvements  
- Documentation support and formatting  
- System testing and presentation preparation  

Both students attended supervisory meetings together, reviewed each other’s work, and contributed to debugging and refinement of the final system. No part of the project was completed by one student alone.

### Chapter Summary

Chapter One introduced the background to university event scheduling and explained the problems associated with manual methods. The aim, objectives, significance, scope, and limitations of the study were stated. Key terms were defined, and the contributions of the two students were described. Chapter Two will review related literature and existing systems relevant to this study.

<br>

---

# CHAPTER TWO

## LITERATURE REVIEW

### 2.1 Introduction

This chapter reviews concepts, theories, and related works connected to university event scheduling and notification systems. The review helps to justify the need for the proposed system and provides a foundation for the analysis and design presented in Chapter Three.

### 2.2 Conceptual Review

#### 2.2.1 Event Management

An event is a planned occurrence that takes place at a given time and location and involves specific participants (Allen, 2000). In a university environment, events vary in size and importance. They may include departmental meetings, public lectures, examinations, and social programmes. Event management involves planning, coordination, execution, and follow-up. A digital system supports these stages by storing structured information and making it accessible to authorised users.

#### 2.2.2 Scheduling and Resource Allocation

Scheduling is the assignment of resources to activities over time. In this project, the most important resource is the **venue**. A venue booked for a particular time interval should not normally be assigned to another conflicting event during the same interval. Scheduling systems therefore require rules to detect overlap between time periods. Two intervals overlap when the start time of one event is before the end time of another, and the end time of the first event is after the start time of the second.

#### 2.2.3 Workflow and Approval

Many university events require approval before they are made public or added to the official schedule. A workflow defines the steps through which a request passes from submission to final decision. Digital workflow systems improve accountability because they record the status of each request and the action taken by approvers (Workflow Management Coalition, 1999).

#### 2.2.4 Notification Systems

A notification system informs users about events or changes that concern them. Notifications may be delivered through in-system messages, email, or other channels. For a university scheduling platform, notifications are important when a request is submitted, approved, rejected, or involved in a scheduling conflict (Hohpe & Woolf, 2003).

#### 2.2.5 Web-Based Information Systems

Web-based systems are accessed through browsers and are suitable for university environments because they do not require installation on every user device. Modern web frameworks such as Next.js and React allow developers to build interactive interfaces supported by server-side logic and databases (Vercel, Inc., 2024).

### 2.3 Review of Related Works

Several studies and practical systems relate to the present project.

Oladipo and Abayomi (2012) examined ICT adoption in Nigerian universities and observed that administrative automation often develops more slowly than student-facing systems. Their work supports the need for improved digital tools in areas such as scheduling and records management.

Adeyemi et al. (2018) developed a web-based facility booking system for a tertiary institution. The system reduced manual booking errors but placed less emphasis on role-based governance and integrated notifications.

Okon and Ibrahim (2020) discussed student notification frameworks in Nigerian universities and reported that timely digital alerts can improve awareness of academic activities when properly implemented.

Sommerville (2016) explained that good software engineering practice requires clear requirements, structured design, testing, and maintenance. These principles guided the development approach used in this project.

**Table 2.1 Comparison of Related Studies**

| Study | Focus | Strength | Weakness |
|-------|--------|----------|----------|
| Oladipo & Abayomi (2012) | ICT in Nigerian universities | Highlights administrative ICT gaps | Not specific to event scheduling |
| Adeyemi et al. (2018) | Facility booking | Web-based solution | Limited workflow and notifications |
| Okon & Ibrahim (2020) | Student notifications | Awareness improvement | No conflict detection |
| Sommerville (2016) | Software engineering | Strong methodology | General, not domain-specific |

### 2.4 Review of Existing Systems

The following categories of existing approaches were considered:

1. **Manual university processes**  
   Paper forms, logbooks, and informal messages remain common. They are easy to start but difficult to audit and prone to conflict.

2. **General calendar applications**  
   Tools such as Google Calendar are useful for personal scheduling but do not provide university-specific approval chains, venue master data, or role-based access.

3. **Learning management systems**  
   Platforms designed mainly for course delivery are not usually intended for full campus venue governance.

4. **Commercial event platforms**  
   Some commercial systems focus on ticketing and marketing rather than internal university approval and conflict management.

The proposed system was designed to address internal university needs rather than public ticket sales. It combines event submission, approval, conflict checking, notifications, and calendar display in one application.

**Table 2.2 Comparison of Existing Event Management Approaches**

| Approach | Central record | Approval control | Conflict checking | Role-based access |
|----------|----------------|------------------|-------------------|-------------------|
| Manual process | Weak | Informal | Manual | Informal |
| General calendar | Medium | No | No | Limited |
| Proposed system | Strong | Yes | Automated | Yes |

### 2.5 Research Gap

From the literature and review of existing approaches, the following gaps were identified:

- Few documented undergraduate and institutional solutions combine event approval, venue conflict detection, and notifications in one system.  
- Many scheduling tools do not reflect the role structure of Nigerian universities.  
- Existing manual methods do not provide adequate analytics for management planning.

This project attempts to fill the gap by implementing an integrated web-based system with PostgreSQL storage, role-based access control, and automated conflict detection.

### 2.6 Theoretical Framework

This project is guided by the **System Development Life Cycle (SDLC)** and the **Agile software development approach**.

The SDLC provides phases of problem identification, analysis, design, implementation, testing, and maintenance. These phases are reflected in the structure of this documentation.

Agile methodology was applied during implementation through iterative development, where modules such as authentication, event management, and calendar display were built and tested in stages. Regular review and adjustment were carried out during development under supervisory guidance.

The **Client–Server architecture** was adopted. The client consists of the web browser interface used by students, lecturers, and administrators. The server consists of the application logic and database that process requests and store information.

### Chapter Summary

Chapter Two reviewed the concepts of event management, scheduling, workflow, notifications, and web-based systems. Related studies and existing approaches were compared, and the research gap was identified. The SDLC, Agile methodology, and client–server architecture were presented as the theoretical basis of the project. Chapter Three will present the analysis and design of the proposed system.

<br>

---

# CHAPTER THREE

## SYSTEM ANALYSIS AND DESIGN

### 3.1 Introduction

This chapter presents the analysis of the existing scheduling process, the problems identified, and the design of the proposed University Event Scheduling and Notification System. It includes the system architecture, input and output design, database structure, diagrams, and requirements specification.

### 3.2 Analysis of the Existing System

In many university settings, including the context considered in this case study, event scheduling is handled through a combination of manual and informal methods. The existing process can be described as follows:

1. An organiser prepares a request for an event and submits it to a departmental or administrative office.  
2. The office may check venue availability by phone, physical register, or personal knowledge.  
3. An approving officer may grant verbal or written approval.  
4. Information about the event may later be shared through notice boards, SMS, WhatsApp, or public announcement.  
5. If a conflict occurs, it is resolved through negotiation, often at a late stage.

**Table 3.3 User Roles and Access Levels in the Proposed System**

| Role | Typical user | Main permissions |
|------|--------------|------------------|
| Viewer | Student or guest user | View approved events and calendar |
| User | Lecturer or staff organiser | Create and manage own events |
| Approver | HOD or faculty officer | Approve or reject pending events |
| Admin | Department or ICT administrator | Manage users and view analytics |
| Super Admin | Central system administrator | Full administrative access |

The implemented system uses one web application with role-based menus rather than separate standalone portals. This approach reduces duplication while still providing appropriate access for each user category.

### 3.3 Problems of the Existing System

The main problems identified with the existing manual approach are:

- No single real-time record of all bookings  
- High risk of double booking  
- Weak documentation of approval decisions  
- Delayed and inconsistent communication  
- Difficulty generating reports  
- Limited control over who can create or approve events  

### 3.4 Description of the Proposed System

The proposed system is a web-based application that allows authorised users to:

- Log in securely  
- Create event requests with venue, department, date, and time  
- Submit events for approval  
- Allow approvers to accept or reject requests  
- Detect overlapping venue bookings  
- Display events on a calendar  
- Send in-system notifications  
- View dashboard summaries and analytics  

The system stores all important records in a PostgreSQL database and accesses them through Prisma ORM. The application was implemented using Next.js with API routes for server-side processing.

### 3.5 System Architecture

The system follows a **three-tier client–server architecture**:

1. **Presentation layer** — web pages built with React, Next.js, and Tailwind CSS  
2. **Application layer** — API routes, authentication, validation, and business logic  
3. **Data layer** — PostgreSQL database accessed through Prisma  

A background worker process was also prepared for asynchronous notification jobs using Redis and BullMQ. In the current implementation, in-system notifications are written directly to the database, while the email worker remains partially configured for future use.

**[Insert System Architecture Diagram]**

**Figure 3.1 System Architecture Diagram**

Suggested content for the diagram:

- Browser → Next.js Web Application  
- Next.js → API Routes / Authentication  
- API Routes → Prisma ORM → PostgreSQL  
- Worker Service → Redis Queue  
- Optional SMTP for future email delivery  

### 3.6 Input Design

**Table 3.1 Input Forms and Data Fields**

| Form | Main fields | Validation |
|------|-------------|------------|
| Login | Email, password | Valid email format; required fields |
| Registration | Name, email, password | Unique email; minimum password length |
| Create event | Title, description, type, venue, department, start time, end time | End time must be after start time |
| Approve event | Event identifier | Only pending events |
| Reject event | Event identifier, reason | Reason required |
| Calendar query | Start date, end date | Valid ISO date-time range |
| User search | Search text, role filter, status filter | Admin access required |

### 3.7 Output Design

**Table 3.2 System Outputs**

| Output | Description |
|--------|-------------|
| Dashboard summary | Key counts and alerts for the logged-in user |
| Event list | Paginated list with status and conflict indicators |
| Calendar view | Monthly, weekly, and daily event display |
| Notifications inbox | List of in-system messages |
| Analytics charts | Event trends and venue usage for administrators |
| API JSON response | Structured success or error response |
| Calendar export file | Downloadable calendar file for external calendar applications |
| Error messages | User-readable validation and permission errors |

### 3.8 Database Design

The database was designed using PostgreSQL. Prisma schema models were created for the main entities of the system. The major tables include:

- **Organization** — represents the university or institutional tenant  
- **User** — stores user account details and role  
- **Department** — represents academic or administrative units  
- **Venue** — stores hall, laboratory, and other location details  
- **Event** — stores event title, time, status, venue, organiser, and department  
- **Notification** — stores in-system messages  
- **ConflictLog** — stores records of detected scheduling conflicts  
- **EventRegistration** — prepared for future attendance features  
- **AuditLog** and **ActivityLog** — prepared for record keeping  

Important status values for events include Draft, Pending, Approved, Rejected, and Cancelled. In the implemented workflow, newly submitted events are assigned Pending status.

### 3.9 Entity-Relationship Diagram

**[Insert ER Diagram]**

**Figure 3.2 Entity-Relationship Diagram**

The ER diagram should show the following relationships:

- One organization has many users, departments, venues, and events  
- One department has many events  
- One venue has many events  
- One user organises many events  
- One user may approve events  
- One user receives many notifications  
- Conflict logs link two events through a venue  

### 3.10 Use Case Diagram

**[Insert Use Case Diagram]**

**Figure 3.3 Use Case Diagram**

Actors:

- Viewer  
- User  
- Approver  
- Admin  
- Super Admin  

Main use cases:

- Login  
- Register  
- Create event  
- View events  
- Approve event  
- Reject event  
- View calendar  
- Export calendar  
- View notifications  
- Manage users  
- View analytics  
- View conflicts  

### 3.11 Activity and Flow Diagrams

**[Insert Activity Diagram for Event Approval]**

**Figure 3.4 Activity Diagram for Event Approval**

The approval process is as follows:

1. User submits event request.  
2. System saves event as Pending.  
3. System checks for venue conflict.  
4. Approvers receive notification.  
5. Approver reviews request.  
6. If approved and no blocking conflict exists, status becomes Approved.  
7. If rejected, status becomes Rejected and reason is stored.  
8. Organiser receives notification of the decision.  

**[Insert Data Flow Diagram for Event Creation]**

**Figure 3.5 Data Flow Diagram for Event Creation**

Data flows from event form → API validation → conflict detection → database storage → notification creation.

### 3.12 System Requirements

#### Hardware Requirements

| Item | Minimum |
|------|---------|
| Processor | Intel Core i3 or equivalent |
| RAM | 8 GB |
| Storage | 256 GB |
| Network | Internet connection |

#### Software Requirements

- Windows 10/11 or Linux  
- Node.js  
- pnpm package manager  
- PostgreSQL  
- Redis  
- Docker Desktop for local database services  
- Modern web browser  

### 3.13 Functional Requirements

**Table 3.4 Functional Requirements**

| ID | Requirement |
|----|-------------|
| FR1 | The system shall allow users to register and log in. |
| FR2 | The system shall enforce role-based access control. |
| FR3 | The system shall allow authorised users to create events. |
| FR4 | The system shall store events with venue, department, and time details. |
| FR5 | The system shall allow approvers to approve or reject pending events. |
| FR6 | The system shall detect overlapping venue bookings. |
| FR7 | The system shall display events in a calendar view. |
| FR8 | The system shall provide in-system notifications. |
| FR9 | The system shall allow search and filtering of events. |
| FR10 | The system shall provide dashboard and analytics information to administrators. |
| FR11 | The system shall allow calendar export. |
| FR12 | The system shall maintain conflict logs. |

### 3.14 Non-Functional Requirements

**Table 3.5 Non-Functional Requirements**

| ID | Requirement |
|----|-------------|
| NFR1 | The system shall protect user passwords using secure hashing. |
| NFR2 | The system shall validate input on the server side. |
| NFR3 | The system shall provide a responsive user interface. |
| NFR4 | The system shall return clear error messages. |
| NFR5 | The system shall use a maintainable modular structure. |
| NFR6 | The system shall keep institutional data in a relational database. |
| NFR7 | The system shall support future expansion such as email and mobile access. |

### Chapter Summary

Chapter Three analysed the existing manual scheduling process and presented the proposed system. The architecture, inputs, outputs, database design, diagrams, and requirements were described. The next chapter explains how the system was implemented and tested.

<br>

---

# CHAPTER FOUR

## SYSTEM IMPLEMENTATION AND TESTING

### 4.1 Introduction

This chapter describes the tools, methodology, and implementation details of the University Event Scheduling and Notification System. It also presents the testing procedures and results obtained from the implemented modules.

### 4.2 Development Environment and Tools

The system was developed on a personal computer using the tools listed below.

**Table 4.1 Development Tools and Technologies**

| Category | Tool / Technology | Purpose |
|----------|-------------------|---------|
| Frontend | Next.js, React, TypeScript | Web interface |
| Styling | Tailwind CSS | Page layout and design |
| Backend | Next.js API routes | Server-side processing |
| Database | PostgreSQL | Data storage |
| ORM | Prisma | Database access and migrations |
| Authentication | NextAuth | Login and session management |
| State management | TanStack React Query | Data fetching and caching |
| Calendar | FullCalendar | Calendar display |
| Charts | Recharts | Analytics visualisation |
| Queue | Redis, BullMQ | Background worker support |
| Email library | Nodemailer | Prepared for email notifications |
| Version control | Git | Source code management |
| Containerisation | Docker Compose | Local PostgreSQL and Redis |

### 4.3 Development Methodology

The **Agile software development methodology** was used. Development was carried out in iterations. The first iteration focused on project setup, database design, and authentication. Later iterations added event management, approval workflow, conflict detection, notifications, calendar display, and analytics. Each iteration was tested before moving to the next. This approach allowed problems to be identified early and corrected under supervision.

### 4.4 System Implementation

The project was organised as a monorepo with the main web application in `apps/web` and a worker application in `apps/worker`. The web application contains both the user interface and the API routes. This structure simplified development and testing during the project period.

The main modules implemented are:

- Authentication and session management  
- Role-based route protection  
- Event management  
- Approval and rejection services  
- Conflict detection service  
- Notification creation and inbox  
- Dashboard and analytics services  
- Calendar range query and export  

### 4.5 Frontend Implementation

The frontend was implemented using Next.js App Router. The main pages developed include:

| Page route | Purpose |
|------------|---------|
| /login | User login |
| /register | User registration |
| /dashboard | Summary dashboard |
| /events | Event list, creation, approval actions |
| /calendar | Calendar view and export |
| /venues | Venue listing |
| /departments | Department interface |
| /users | User management for administrators |
| /analytics | Charts and usage summaries |
| /notifications | In-system notification inbox |
| /settings | Settings interface |

The user interface uses a common shell with sidebar navigation. Menu items are shown or hidden according to the role of the logged-in user. Forms include client-side validation, while the server performs final validation before database updates.

**[Student Two Full Name]** was mainly responsible for the design and implementation of these interface components, with support from **[Student One Full Name]** during integration testing.

### 4.6 Backend and API Implementation

The backend was implemented using Next.js API routes under `/api/v1/`. Each route performs authentication checks, role checks where necessary, input validation, and database operations.

**Table 4.2 API Endpoints Implemented**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login support route |
| GET | /api/v1/auth/me | Current user profile |
| GET, POST | /api/v1/events | List and create events |
| GET, PATCH, DELETE | /api/v1/events/[id] | Retrieve, update, delete event |
| PATCH | /api/v1/events/[id]/approve | Approve pending event |
| PATCH | /api/v1/events/[id]/reject | Reject pending event |
| POST | /api/v1/events/bulk-approve | Approve multiple events |
| POST | /api/v1/events/bulk-reject | Reject multiple events |
| GET | /api/v1/events/pending | Pending event queue |
| GET | /api/v1/events/calendar | Calendar range query |
| GET | /api/v1/conflicts | List unresolved conflicts |
| GET | /api/v1/venues | List venues |
| GET | /api/v1/departments | List departments |
| GET, PATCH | /api/v1/users | List and update users |
| GET | /api/v1/notifications | Notification inbox |
| PATCH | /api/v1/notifications/[id] | Mark notification read |
| POST | /api/v1/notifications/mark-all-read | Mark all notifications read |
| GET | /api/v1/dashboard/summary | Dashboard summary |
| GET | /api/v1/analytics | Analytics data |

**[Student One Full Name]** was mainly responsible for backend logic, database interaction, and API development.

### 4.7 Database Implementation

The database was created using PostgreSQL. Prisma migrations were used to generate tables based on the schema design. Seed data was created for testing and demonstration. The seed data includes:

- One organization named Global University  
- Sample departments and venues  
- Test users for each role  
- Sample approved and pending events  

Database relationships were enforced through foreign keys. Indexes were added on commonly queried fields such as organization, status, and event time.

### 4.8 Authentication and Role-Based Access Control

Authentication was implemented using NextAuth with a JWT session strategy. When a user logs in with valid credentials, the session stores the user identity, role, and organization identifier. Middleware protects dashboard routes by redirecting unauthenticated users to the login page. API routes perform additional role checks using helper functions.

This approach ensures that viewers cannot approve events, ordinary users cannot access user-management pages, and only authorised roles can view analytics and conflicts.

### 4.9 Conflict Detection Module

The conflict detection module checks whether a proposed or pending event overlaps another pending or approved event at the same venue. The module queries the database for events where:

- the venue is the same,  
- the status is Pending or Approved,  
- the start time is before the new event’s end time, and  
- the end time is after the new event’s start time.  

If a conflict is found during event creation, the system still stores the event as Pending but creates a conflict log and notifies approvers. During approval, the system performs another conflict check and blocks approval if the slot is already occupied.

### 4.10 Notification Module

The notification module creates in-system messages for important activities such as:

- new event submitted,  
- conflict detected,  
- event approved,  
- event rejected.  

Users view these messages on the notifications page and may mark them as read. A worker process and Nodemailer were included in the project structure to support future email delivery, but the main tested notification channel in the current implementation is the in-system inbox.

### 4.11 System Testing

Testing was carried out manually using the seeded test accounts and additional test actions performed by both students. The main types of testing applied were:

- **Unit-level logic review** of conflict detection and approval functions  
- **Functional testing** of pages and forms  
- **Role-based access testing** for each user category  
- **API response testing** through the user interface and browser network inspection  

### 4.12 Test Results and Discussion

**Table 4.3 Test Cases and Results**

| ID | Test case | Expected result | Actual result | Status |
|----|-----------|-----------------|---------------|--------|
| T1 | Login with valid seeded account | User enters dashboard | Dashboard displayed | Pass |
| T2 | Login with invalid password | Login denied | Error message shown | Pass |
| T3 | Viewer opens events page | Only approved events shown | Approved events only | Pass |
| T4 | User creates valid event | Event saved as Pending | Pending event created | Pass |
| T5 | User creates overlapping event | Conflict logged and notified | Conflict recorded | Pass |
| T6 | Approver approves valid pending event | Event becomes Approved | Status updated | Pass |
| T7 | Approver rejects event with reason | Event becomes Rejected | Reason stored | Pass |
| T8 | Approver opens conflicts page data | Conflict list available | Conflicts displayed | Pass |
| T9 | Calendar loads monthly range | Events shown on calendar | Events displayed | Pass |
| T10 | Export calendar | Calendar file downloaded | File downloaded | Pass |
| T11 | Admin opens analytics | Charts displayed | Analytics displayed | Pass |
| T12 | Unauthorized API access without login | Access denied | 401 response | Pass |

The test results show that the core modules of the system function according to design. Some interface sections, such as department management and settings, are not yet fully connected to backend services and therefore were not included as completed test items.

### 4.13 Screenshots of the Implemented System

The figures below should be inserted from the running application.

**[Insert Screenshot of Login Page]**

**Figure 4.1 Screenshot of Login Page**

**[Insert Screenshot of Dashboard]**

**Figure 4.2 Screenshot of Dashboard**

**[Insert Screenshot of Event Creation Page]**

**Figure 4.3 Screenshot of Event Creation Page**

**[Insert Screenshot of Events List with Approval Actions]**

**Figure 4.4 Screenshot of Events List with Approval Actions**

**[Insert Screenshot of Calendar View]**

**Figure 4.5 Screenshot of Calendar View**

**[Insert Screenshot of Notifications Inbox]**

**Figure 4.6 Screenshot of Notifications Inbox**

**[Insert Screenshot of Analytics Page]**

**Figure 4.7 Screenshot of Analytics Page**

### Chapter Summary

Chapter Four described the development environment, methodology, and implementation of the major system modules. It also presented the testing process and results. The tests confirmed that authentication, event management, approval workflow, conflict detection, notifications, calendar display, and analytics operate as intended in the current version of the system. Chapter Five presents the summary, conclusion, and recommendations.

<br>

---

# CHAPTER FIVE

## SUMMARY, CONCLUSION AND RECOMMENDATIONS

### 5.1 Summary

This project set out to design and implement a University Event Scheduling and Notification System as a case study relevant to Ibrahim Badamasi Babangida University, Lapai. Chapter One introduced the background, problem statement, aim, objectives, significance, scope, and limitations of the study. Chapter Two reviewed literature and existing approaches to event scheduling and notifications. Chapter Three presented the analysis and design of the proposed system, including its architecture, database structure, diagrams, and requirements. Chapter Four described the implementation and testing of the developed system.

The implemented system is a web application built with Next.js, React, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, and NextAuth. It supports role-based access control, event creation, approval workflow, venue scheduling, calendar display, conflict detection, in-system notifications, dashboard summaries, and analytics. Testing showed that the main modules function correctly in the development environment.

The project was completed jointly by **[Student One Full Name]** and **[Student Two Full Name]**, with shared participation in planning, implementation, testing, and documentation.

### 5.2 Conclusion

The study concludes that manual and informal methods of university event scheduling are inadequate for reliable planning and communication. The developed system provides a practical alternative by centralising event records, enforcing an approval process, detecting venue conflicts, and notifying users within the application.

The project objectives were achieved to a satisfactory level within the scope of the study. The system demonstrates that modern web technologies can be applied effectively to solve real administrative problems in a university environment. Although some modules remain to be fully completed, the core scheduling and notification functions are operational and suitable for demonstration and further development.

For Ibrahim Badamasi Babangida University, Lapai, a system of this nature can support better coordination of academic and non-academic programmes if properly deployed, managed, and integrated with institutional policy.

### 5.3 Recommendations

Based on the findings of this study, the following recommendations are made:

1. The university should consider pilot testing a digital event scheduling platform in one faculty before wider adoption.  
2. Administrative policy should encourage official online submission of major venue requests.  
3. Staff and student leaders should receive basic training on the use of the system.  
4. The ICT unit should provide secure hosting, database backup, and HTTPS for any future deployment.  
5. Future developers should complete the remaining interface modules and strengthen email notification delivery.  
6. Further research should be conducted on integration with student information systems and SMS notification services commonly used in Nigeria.

### 5.4 Suggestions for Future Work

The following improvements are suggested for future development:

1. **Mobile application** for easier access by students and lecturers  
2. **Full email and SMS notification integration**  
3. **Complete department and settings management interfaces**  
4. **Event registration and attendance tracking**  
5. **Improved reporting and export to PDF or Excel**  
6. **Integration with university ERP or portal systems**  
7. **Support for multiple campuses within one institution**  
8. **Automated reminders before event start time**  

### Chapter Summary

Chapter Five summarised the entire project, presented the conclusion, and offered recommendations and suggestions for future work. The study has shown that a University Event Scheduling and Notification System is a feasible and useful contribution to improved event management in a university environment.

<br>

---

# REFERENCES

Allen, J. (2000). *Event planning: The ultimate guide to successful meetings, corporate events, fundraising galas, conferences, conventions, incentives and other special events*. Chicago, IL: Dearborn Trade Publishing.

Adeyemi, T. O., Ojo, S. K., & Bello, J. A. (2018). Design and implementation of a web-based facility booking system for tertiary institutions. *Journal of Computer Science and Engineering*, 15(2), 45–58.

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly*, 13(3), 319–340. https://doi.org/10.2307/249008

Hohpe, G., & Woolf, B. (2003). *Enterprise integration patterns: Designing, building, and deploying messaging solutions*. Addison-Wesley.

Oladipo, F. H., & Abayomi, Y. A. (2012). Information and communication technology in Nigerian universities: Challenges and the way forward. *Journal of Emerging Trends in Computing and Information Sciences*, 3(10), 1–8.

Okon, M. E., & Ibrahim, A. (2020). A framework for student notification systems in Nigerian universities. *International Journal of Computer Applications*, 176(8), 12–19.

Pressman, R. S. (2014). *Software engineering: A practitioner’s approach* (8th ed.). McGraw-Hill Education.

Project Management Institute. (2021). *A guide to the project management body of knowledge (PMBOK guide)* (7th ed.). Project Management Institute.

Sommerville, I. (2016). *Software engineering* (10th ed.). Pearson.

Vercel, Inc. (2024). *Next.js documentation*. https://nextjs.org/docs

Workflow Management Coalition. (1999). *Workflow management coalition terminology and glossary*. Workflow Management Coalition.

<br>

---

# APPENDICES

## APPENDIX A: Sample Test Accounts

| Email | Password | Role |
|-------|----------|------|
| super@nexus.dev | ChangeMe123! | Super Admin |
| admin@nexus.dev | ChangeMe123! | Admin |
| approver@nexus.dev | ChangeMe123! | Approver |
| user@nexus.dev | ChangeMe123! | User |
| viewer@nexus.dev | ChangeMe123! | Viewer |

## APPENDIX B: Environment Variables

```
DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus_dev?schema=public
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## APPENDIX C: Project Startup Commands

```
docker compose up -d
pnpm install
pnpm --filter @nexus/web prisma:generate
pnpm --filter @nexus/web prisma:migrate
pnpm --filter @nexus/web prisma:seed
pnpm dev
```

## APPENDIX D: Conflict Detection Logic (Sample)

The system checks overlap using the condition:

- existing start time < new end time  
- existing end time > new start time  
- same venue  
- status is Pending or Approved  

## APPENDIX E: Student Contribution Statement

We, **[Student One Full Name]** and **[Student Two Full Name]**, declare that this project was carried out by us under the supervision of **[Supervisor Name]**. We jointly participated in the planning, design, implementation, testing, and documentation of the system. The contributions described in Chapter One reflect our actual division of work, and we both take responsibility for the contents of this project report.

<br>

Signatures:

Student One: _________________________ &nbsp;&nbsp; Date: _______________

Student Two: _________________________ &nbsp;&nbsp; Date: _______________

<br>

---

**END OF DOCUMENT**
