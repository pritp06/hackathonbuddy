

/**
 * 1. Purpose
 *    - Data configuration service hosting seed databases, schema options, and initial database setup logic.
 * 2. Responsibilities
 *    - Maintains array collections of supported user skills, builder roles, experience tags, and availability settings.
 *    - Seeds standard mock records (`seedUsers`, `seedTeams`, basic activity items) into localStorage.
 *    - Blocks double-initialization checks via a dedicated status flag (`initialized` key) in storage.
 * 3. Dependencies
 *    - js/storage.js (Wrapper verifying and writing records in localStorage)
 * 4. Important Functions
 *    - `initialize()`: Checks initialization status, writing mock user/team tables and setting `initialized` to true if empty.
 * 5. Data Flow
 *    - App load -> invokes `Data.initialize()` -> check `hb_initialized` in Storage -> write seed models if missing.
 */

import UserRepository from "./userRepository.js";
import TeamRepository from "./teamRepository.js";
import RequestRepository from "./requestRepository.js";
import NotificationRepository from "./notificationRepository.js";
const skills = ["JavaScript", "React", "Python", "Django", "Flutter", "Figma", "Node.js", "TensorFlow", "Swift", "Product Strategy", "UX Research", "TypeScript"];
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
  roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "AI/ML Engineer", "Mobile Developer", "Product Manager"],
  experience: ["Beginner", "Intermediate", "Advanced"],
  availability: ["Looking For Team", "Available", "Team Already Formed", "Not Available"],
  skills,
  
  
  initialize() {
    if (!UserRepository.isInitialized()) {
      UserRepository.saveAll(seedUsers);
      TeamRepository.saveAll(seedTeams);
      RequestRepository.saveAll([]);
      NotificationRepository.saveNotifications([]);
      NotificationRepository.saveActivities([
        { id: NotificationRepository.generateId("act"), type: "Team Created", text: "Orbit Labs started forming a team.", createdAt: new Date().toISOString() },
        { id: NotificationRepository.generateId("act"), type: "Team Created", text: "Signal Sprint opened two roles.", createdAt: new Date().toISOString() }
      ]);
      UserRepository.setInitialized(true);
    }
  }
};

export default Data;
