
# Hackathon Buddy

Hackathon Buddy is a trust-first hackathon team formation platform designed to help developers, designers, AI engineers, and builders discover compatible teammates, evaluate collaboration potential, and build stronger hackathon teams through structured workflows.

The platform focuses on solving one of the most common problems in hackathons:

**finding reliable teammates quickly.**

Instead of relying on random networking, scattered communities, or last-minute team formation, Hackathon Buddy provides a structured system built around trust, discovery, compatibility, collaboration requests, and team management.

---

# Product Overview

Hackathon Buddy enables users to:

* Create professional builder profiles
* Showcase skills and experience
* Upload resumes and proof of work
* Discover compatible teammates
* Explore active hackathon teams
* Send collaboration requests
* Manage team formation workflows
* Track onboarding and profile completion
* Organize team-building activities

The platform is designed as a modern SaaS-style frontend application that simulates a complete product experience while remaining fully extensible for future backend integration.

---

# Core Features

## Trust-Based Profiles

Profiles are designed to help users evaluate potential teammates before collaborating.

Each profile includes:

* Full Name
* Role
* Experience Level
* Skills
* Availability Status
* GitHub Profile
* LinkedIn Profile
* Portfolio Links
* Resume Upload
* Project Links
* Profile Completion Status

---

## Structured Onboarding

Every new user completes a guided onboarding process before accessing the platform.

### Onboarding Flow

1. Basic Information
2. Professional Information
3. Skills Selection
4. Professional Links
5. Project Showcase
6. Resume Upload
7. Availability Preferences
8. Final Review & Confirmation

### Required Fields

* Full Name
* Username
* Email
* Role
* Experience Level
* Skills
* GitHub URL
* LinkedIn URL
* Resume (PDF)

### Optional Fields

* Portfolio Website
* Live Project 1
* Live Project 2
* Bio
* Location

---

## Builder Discovery

Users can discover potential teammates using:

* Skill Filters
* Role Filters
* Experience Filters
* Availability Filters
* Search Functionality
* Compatibility Indicators

Each builder card displays:

* Name
* Role
* Skills
* Experience Level
* Availability Status
* GitHub
* LinkedIn
* Compatibility Score

---

## Team Discovery

Users can browse active hackathon teams and review:

* Team Goals
* Technology Stack
* Team Members
* Missing Roles
* Team Readiness
* Recruitment Status

---

## Team Management

The platform includes team management workflows such as:

* Team Creation
* Team Dashboard
* Member Management
* Role Assignment
* Team Readiness Tracking
* Team Requests

---

## Collaboration Requests

Users can:

* Send Join Requests
* Send Collaboration Requests
* Review Compatibility
* Manage Incoming Requests
* Track Request Status

Each request includes:

* Compatibility Score
* Skills Match
* Role Match
* User Information
* Request Status

---

## Saved Content

Users can save:

* Builders
* Teams

for future review and collaboration.

---

## Notification Center

The platform includes a centralized notification system for:

* New Requests
* Accepted Requests
* Team Invitations
* Profile Activity
* Team Updates

---

## Activity Feed

Track important actions such as:

* Team Creation
* Profile Updates
* Request Activity
* Team Invitations
* Saved Content

---

# User Flow

```text
Landing Page
      │
      ▼
Signup / Login
      │
      ▼
Mandatory Onboarding
      │
      ▼
Dashboard
      │
 ┌────┼────┐
 ▼    ▼    ▼
Builders Teams Requests
 │      │      │
 ▼      ▼      ▼
Profile Team Request
Review  Review Details
 │
 ▼
Collaboration
 │
 ▼
Team Formation
```

---

# Technology Stack

| Technology        | Purpose              |
| ----------------- | -------------------- |
| HTML5             | Structure            |
| CSS3              | Styling & Layout     |
| JavaScript (ES6+) | Application Logic    |
| LocalStorage      | Frontend Persistence |
| SessionStorage    | Session Management   |

---

# Design System

The platform includes:

* Light Theme
* Dark Theme
* Responsive Design System
* Reusable Components
* Mobile-First Layouts
* Accessibility Enhancements
* Consistent Typography
* Structured Spacing System

---

# Responsive Support

Optimized for:

* Mobile Devices
* Tablets
* Laptops
* Desktop Screens
* Large Displays

---

# Project Structure

```text
HackathonBuddy/
│
├── assets/
│
├── css/
│   ├── variables.css
│   ├── components.css
│   ├── layout.css
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── router.js
│   ├── auth.js
│   ├── storage.js
│   ├── userService.js
│   ├── teamService.js
│   ├── requestService.js
│   ├── notificationService.js
│   ├── validation.js
│   ├── pages.js
│   ├── ui.js
│   └── data.js
│
├── pages/
│
├── index.html
│
└── README.md
```

---

# Running the Project

## Requirements

* Visual Studio Code
* Live Server Extension

---

## Step 1: Open Project

Open the project folder inside Visual Studio Code.

---

## Step 2: Install Live Server

Install the Live Server extension from the VS Code Marketplace.

---

## Step 3: Start Application

Right-click:

```text
index.html
```

Select:

```text
Open with Live Server
```

The application will open automatically in your browser.

---

# Current Version

Current implementation includes:

* Frontend Authentication Simulation
* Multi-Step Onboarding
* Builder Discovery
* Team Discovery
* Team Management
* Collaboration Requests
* Notification Center
* Activity Feed
* Light/Dark Theme
* LocalStorage Persistence
* Responsive Design

---

# Future Roadmap

Planned future improvements include:

* Django Backend Integration
* PostgreSQL Database
* Real Authentication
* API Layer
* Cloud Storage
* Real-Time Notifications
* Real-Time Messaging
* Advanced Compatibility Engine
* Team Analytics
* Admin Dashboard

---

# Project Goal

Hackathon Buddy is designed to improve how builders discover teammates, evaluate compatibility, and form successful hackathon teams.

The platform combines trust-driven profiles, structured onboarding, compatibility-focused discovery, and team collaboration workflows into a modern SaaS-style product experience.

