/*
File: data.js

Purpose:
Maintains the initial seed data and global constants (like available roles, skills, and experience levels). 
It also handles populating the application state when the user first visits the platform.

Dependencies:
- storage.js

Used By:
- app.js (Initializes data on startup)
- pages.js (Populates form options like dropdowns)
- ui.js

====================================================
*/

import Storage from "./storage.js";

// Global constant array defining all selectable skills across the platform
const skills = ["JavaScript", "React", "Python", "Django", "Flutter", "Figma", "Node.js", "TensorFlow", "Swift", "Product Strategy", "UX Research", "TypeScript"];

// Seed data: Represents mock users to pre-populate the platform for demo purposes
const seedUsers = [
  {
    id: "user_ava",
    fullName: "Ava Chen",
    username: "avacodes",
    email: "ava@example.com",
    password: "password123",
    role: "Frontend Developer",
    experience: "Advanced",
    skills: ["React", "TypeScript", "Design Systems", "JavaScript"],
    github: "https://github.com/avacodes",
    linkedin: "https://linkedin.com/in/avacodes",
    portfolio: "https://ava.dev",
    projects: ["Realtime dashboard", "Component library"],
    resume: { name: "ava-chen-resume.pdf", uploadedAt: new Date().toISOString() },
    availability: "Looking For Team",
    onboardingComplete: true,
    verified: true,
    savedBuilders: [],
    savedTeams: []
  },
  {
    id: "user_malik",
    fullName: "Malik Johnson",
    username: "malikml",
    email: "malik@example.com",
    password: "password123",
    role: "AI/ML Engineer",
    experience: "Advanced",
    skills: ["Python", "TensorFlow", "LangChain", "Node.js"],
    github: "https://github.com/malikml",
    linkedin: "https://linkedin.com/in/malikml",
    portfolio: "",
    projects: ["Document AI", "Hackathon recommender"],
    resume: { name: "malik-johnson-resume.pdf", uploadedAt: new Date().toISOString() },
    availability: "Available",
    onboardingComplete: true,
    verified: true,
    savedBuilders: [],
    savedTeams: []
  },
  {
    id: "user_sofia",
    fullName: "Sofia Rivera",
    username: "sofiaux",
    email: "sofia@example.com",
    password: "password123",
    role: "UI/UX Designer",
    experience: "Intermediate",
    skills: ["Figma", "UX Research", "Prototyping", "Product Strategy"],
    github: "https://github.com/sofiaux",
    linkedin: "https://linkedin.com/in/sofiaux",
    portfolio: "https://sofiarivera.design",
    projects: ["Mentor matching app", "Fintech onboarding"],
    resume: { name: "sofia-rivera-resume.pdf", uploadedAt: new Date().toISOString() },
    availability: "Looking For Team",
    onboardingComplete: true,
    verified: true,
    savedBuilders: [],
    savedTeams: []
  },
  {
    id: "user_ryan",
    fullName: "Ryan Patel",
    username: "ryanbuilds",
    email: "ryan@example.com",
    password: "password123",
    role: "Product Manager",
    experience: "Intermediate",
    skills: ["Product Strategy", "Analytics", "User Interviews", "Figma"],
    github: "https://github.com/ryanbuilds",
    linkedin: "https://linkedin.com/in/ryanbuilds",
    portfolio: "",
    projects: ["Campus marketplace", "AI sprint planner"],
    resume: { name: "ryan-patel-resume.pdf", uploadedAt: new Date().toISOString() },
    availability: "Available",
    onboardingComplete: true,
    verified: true,
    savedBuilders: [],
    savedTeams: []
  }
];

// Seed data: Represents mock teams to pre-populate the platform for demo purposes
const seedTeams = [
  {
    id: "team_orbit",
    name: "Orbit Labs",
    goal: "AI assistant for student grant discovery",
    ownerId: "user_malik",
    memberIds: ["user_malik", "user_sofia"],
    missingRoles: ["Frontend Developer", "Backend Developer"],
    techStack: ["Python", "React", "LangChain"],
    readiness: 72,
    requests: []
  },
  {
    id: "team_signal",
    name: "Signal Sprint",
    goal: "Trust layer for open-source hackathon teams",
    ownerId: "user_ava",
    memberIds: ["user_ava", "user_ryan"],
    missingRoles: ["AI/ML Engineer", "Mobile Developer"],
    techStack: ["TypeScript", "Figma", "Node.js"],
    readiness: 66,
    requests: []
  }
];

const Data = {
  // Global options for profile forms
  roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "AI/ML Engineer", "Mobile Developer", "Product Manager"],
  experience: ["Beginner", "Intermediate", "Advanced"],
  availability: ["Looking For Team", "Available", "Team Already Formed", "Not Available"],
  skills,
  
  /*
  Purpose: Initializes the application with mock data if it hasn't been set up yet.
  Parameters: None
  Returns: undefined
  Side Effects: Writes users, teams, requests, and activity logs to localStorage on first visit.
  */
  initialize() {
    // Check if the application is already initialized to avoid overwriting data on reload.
    if (!Storage.get("initialized")) {
      Storage.set("users", seedUsers);
      Storage.set("teams", seedTeams);
      Storage.set("requests", []);
      Storage.set("notifications", []);
      Storage.set("activities", [
        { id: Storage.id("act"), type: "Team Created", text: "Orbit Labs started forming a team.", createdAt: new Date().toISOString() },
        { id: Storage.id("act"), type: "Team Created", text: "Signal Sprint opened two roles.", createdAt: new Date().toISOString() }
      ]);
      Storage.set("initialized", true);
    }
  }
};

export default Data;
