#!/usr/bin/env node
// Seed script for curated collections
// Usage: node server/scripts/seed_curated_collections.js [--dry-run]

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const adminApp = require("../configs/firebase-admin.js");
const { getFirestore } = require("firebase-admin/firestore");

const NOW = new Date().toISOString();

const COLLECTIONS = [
  {
    meta: {
      name: "Behavioural Essentials",
      description:
        "The must-know questions for any behavioural interview round. Covers the core topics every interviewer expects you to be ready for.",
      author: "Speachy",
      tags: [
        "teamwork",
        "leadership",
        "conflict resolution",
        "motivation",
        "self-awareness",
      ],
      questionCount: 15,
      lastUpdated: NOW,
      isPublished: true,
      createdAt: NOW,
    },
    questions: [
      {
        question: "Tell me about yourself.",
        difficulty: "easy",
        tags: ["introduction"],
      },
      {
        question: "What is your greatest professional strength?",
        difficulty: "easy",
        tags: ["self-awareness"],
      },
      {
        question:
          "What is your greatest weakness, and what are you doing to improve it?",
        difficulty: "easy",
        tags: ["self-awareness"],
      },
      {
        question: "Why do you want to work at this company?",
        difficulty: "easy",
        tags: ["motivation"],
      },
      {
        question: "Where do you see yourself in five years?",
        difficulty: "easy",
        tags: ["career goals"],
      },
      {
        question:
          "Tell me about a time you worked effectively as part of a team.",
        difficulty: "medium",
        tags: ["teamwork", "collaboration"],
      },
      {
        question:
          "Describe a time you had to deal with a difficult colleague or conflict at work.",
        difficulty: "medium",
        tags: ["conflict resolution", "communication"],
      },
      {
        question:
          "Tell me about a time you failed. What did you learn from it?",
        difficulty: "medium",
        tags: ["resilience", "growth mindset"],
      },
      {
        question: "Describe a time you took on a leadership role.",
        difficulty: "medium",
        tags: ["leadership"],
      },
      {
        question: "What is your greatest professional achievement so far?",
        difficulty: "medium",
        tags: ["achievement"],
      },
      {
        question:
          "Tell me about a time you showed initiative to solve a problem before being asked.",
        difficulty: "medium",
        tags: ["initiative", "problem-solving"],
      },
      {
        question:
          "Describe a time you had to adapt quickly to a major change at work.",
        difficulty: "hard",
        tags: ["adaptability", "resilience"],
      },
      {
        question:
          "Tell me about a time you disagreed with your manager. How did you handle it?",
        difficulty: "hard",
        tags: ["conflict resolution", "communication"],
      },
      {
        question:
          "Describe a situation where you had to manage multiple competing priorities under a tight deadline.",
        difficulty: "hard",
        tags: ["time management", "prioritization"],
      },
      {
        question:
          "Tell me about a time you influenced others to adopt your point of view without having direct authority over them.",
        difficulty: "hard",
        tags: ["influence", "leadership"],
      },
    ],
  },
  {
    meta: {
      name: "Software Engineering Behavioural",
      description:
        "Behavioural questions tailored for engineering roles. Focuses on technical judgment, collaboration, and engineering culture.",
      author: "Speachy",
      tags: [
        "technical skills",
        "code quality",
        "collaboration",
        "problem-solving",
        "engineering culture",
      ],
      questionCount: 15,
      lastUpdated: NOW,
      isPublished: true,
      createdAt: NOW,
    },
    questions: [
      {
        question:
          "How do you approach code reviews? Give a specific example of feedback you gave or received.",
        difficulty: "easy",
        tags: ["code review", "collaboration"],
      },
      {
        question:
          "Tell me about a technically challenging project you worked on. What made it hard, and how did you solve it?",
        difficulty: "medium",
        tags: ["technical skills", "problem-solving"],
      },
      {
        question:
          "Describe a time you disagreed with a technical decision made by your team. How did you handle it?",
        difficulty: "medium",
        tags: ["conflict resolution", "technical decision-making"],
      },
      {
        question:
          "Tell me about a time you had to learn a new technology or language quickly to deliver a project.",
        difficulty: "medium",
        tags: ["learning", "adaptability"],
      },
      {
        question:
          "How have you collaborated with non-technical stakeholders on a technical problem? Walk me through an example.",
        difficulty: "medium",
        tags: ["communication", "collaboration"],
      },
      {
        question:
          "Tell me about a time you mentored a junior engineer or helped a colleague grow technically.",
        difficulty: "medium",
        tags: ["mentoring", "leadership"],
      },
      {
        question:
          "How do you balance speed and code quality? Give a real example of a trade-off you made.",
        difficulty: "medium",
        tags: ["engineering judgment", "trade-offs"],
      },
      {
        question:
          "Describe a time you advocated for better engineering practices within your team.",
        difficulty: "medium",
        tags: ["engineering culture", "initiative"],
      },
      {
        question:
          "How have you approached debugging a complex production issue under pressure?",
        difficulty: "hard",
        tags: ["debugging", "problem-solving"],
      },
      {
        question:
          "Describe a time you had to refactor or redesign a system with significant technical debt.",
        difficulty: "hard",
        tags: ["code quality", "technical debt"],
      },
      {
        question:
          "Tell me about a time you shipped something that caused a production incident. What happened and how did you respond?",
        difficulty: "hard",
        tags: ["accountability", "problem-solving"],
      },
      {
        question:
          "Describe a time you had to make a significant technical trade-off with limited time or resources.",
        difficulty: "hard",
        tags: ["trade-offs", "decision-making"],
      },
      {
        question:
          "Tell me about a time you had to estimate a project timeline under high uncertainty. How did you communicate and manage expectations?",
        difficulty: "hard",
        tags: ["estimation", "communication"],
      },
      {
        question:
          "How have you handled a situation where your team was moving in a direction you believed was technically wrong?",
        difficulty: "hard",
        tags: ["technical decision-making", "influence"],
      },
      {
        question:
          "Tell me about a time you went above and beyond to ensure a project was delivered successfully.",
        difficulty: "hard",
        tags: ["ownership", "initiative"],
      },
    ],
  },
  {
    meta: {
      name: "Sales Behavioural",
      description:
        "Behavioural questions targeted at sales and revenue-facing roles. Covers pipeline management, objection handling, and customer relationships.",
      author: "Speachy",
      tags: [
        "objection handling",
        "pipeline management",
        "negotiation",
        "customer success",
        "resilience",
      ],
      questionCount: 15,
      lastUpdated: NOW,
      isPublished: true,
      createdAt: NOW,
    },
    questions: [
      {
        question:
          "How do you typically prioritise your pipeline when you have multiple deals at different stages?",
        difficulty: "easy",
        tags: ["time management", "prioritization"],
      },
      {
        question:
          "Tell me about your biggest sales win. What made it successful?",
        difficulty: "medium",
        tags: ["achievement", "sales process"],
      },
      {
        question:
          "Describe a time you lost a deal you expected to close. What did you learn?",
        difficulty: "medium",
        tags: ["resilience", "self-reflection"],
      },
      {
        question:
          "How do you handle objections from a prospect? Walk me through a specific example.",
        difficulty: "medium",
        tags: ["objection handling", "communication"],
      },
      {
        question:
          "Describe how you have approached prospecting in a new or unfamiliar market.",
        difficulty: "medium",
        tags: ["prospecting", "adaptability"],
      },
      {
        question:
          "Tell me about a time you collaborated with marketing, product, or another team to close a deal.",
        difficulty: "medium",
        tags: ["cross-functional collaboration", "teamwork"],
      },
      {
        question:
          "Tell me about a time you received harsh feedback from a manager or a client. How did you respond?",
        difficulty: "medium",
        tags: ["feedback", "resilience"],
      },
      {
        question:
          "How have you used data or analytics to improve your own sales performance?",
        difficulty: "medium",
        tags: ["data-driven", "self-improvement"],
      },
      {
        question:
          "Tell me about a time you had to walk away from a deal. Why did you decide to, and was it the right call?",
        difficulty: "medium",
        tags: ["judgment", "sales strategy"],
      },
      {
        question:
          "Describe a time you rebuilt a relationship with a dissatisfied or at-risk customer.",
        difficulty: "hard",
        tags: ["customer success", "relationship building"],
      },
      {
        question:
          "Tell me about a time you exceeded your sales quota. What was your strategy and what drove the result?",
        difficulty: "hard",
        tags: ["goal achievement", "strategy"],
      },
      {
        question:
          "How have you managed a long, complex sales cycle? Walk me through a specific deal from first contact to close.",
        difficulty: "hard",
        tags: ["pipeline management", "persistence"],
      },
      {
        question:
          "Describe a time you had to sell something you were not fully confident in. How did you handle it?",
        difficulty: "hard",
        tags: ["resilience", "communication"],
      },
      {
        question:
          "Tell me about a time you identified and acted on an upsell or expansion opportunity with an existing customer.",
        difficulty: "hard",
        tags: ["revenue growth", "customer success"],
      },
      {
        question:
          "Describe a challenging negotiation you led. What was your approach and how did it turn out?",
        difficulty: "hard",
        tags: ["negotiation", "communication"],
      },
    ],
  },
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`seed_curated_collections: dryRun=${dryRun}`);

  if (!process.env.FB_DEV_BASE64_ENCODED_SERVICE_ACCOUNT) {
    throw new Error(
      "FB_DEV_BASE64_ENCODED_SERVICE_ACCOUNT is not set. Ensure server/.env contains this variable.",
    );
  }

  const db = getFirestore(adminApp);
  const rootRef = db.collection("curated_collections");

  for (const col of COLLECTIONS) {
    // Idempotency: skip if a collection with this name already exists
    const existing = await rootRef
      .where("name", "==", col.meta.name)
      .limit(1)
      .get();
    if (!existing.empty) {
      console.log(
        `  [skip] "${col.meta.name}" already exists (id: ${existing.docs[0].id})`,
      );
      continue;
    }

    if (dryRun) {
      console.log(
        `[dry-run] Would create collection: "${col.meta.name}" with ${col.questions.length} questions`,
      );
      continue;
    }

    const colRef = await rootRef.add(col.meta);
    console.log(`Created collection "${col.meta.name}" (id: ${colRef.id})`);

    for (const q of col.questions) {
      await colRef.collection("questions").add(q);
    }
    console.log(`  seeded ${col.questions.length} questions`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
