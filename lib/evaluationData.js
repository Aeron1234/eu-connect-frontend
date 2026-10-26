// Legacy static rubric retained as reference; no current source imports this array.
// Active evaluation forms load persisted criteria through their backend query/actions.
export const evaluationData = [
  {
    category: "Personality",
    items: [
      { id: "grooming", name: "1. Grooming" },
      { id: "physical_manners", name: "2. Physical Manners" },
      { id: "voice_diction", name: "3. Voice and Diction" },
      { id: "hygiene", name: "4. Hygiene" },
    ],
  },
  {
    category: "Work Attitude",
    items: [
      { id: "attendance", name: "1. Attendance" },
      { id: "punctuality", name: "2. Punctuality" },
      {
        id: "willingness_to_accept_work",
        name: "3. Willingness to Accept Work",
      },
      {
        id: "concentration",
        name: "4. Can Work Hard and Concentrate on the Work on Hand",
      },
      {
        id: "extended_hours",
        name: "5. Willingness to Work on Extended Hours",
      },
      { id: "cooperative", name: "6. Cooperative to Officemates" },
      { id: "discipline", name: "7. Has Self-Discipline" },
      { id: "honesty", name: "8. Honest and Trustworthy" },
    ],
  },
  {
    category: "Work Organization",
    items: [
      { id: "thoroughness", name: "1. Accurate and Thorough in His/Her Work" },
      {
        id: "prioritization",
        name: "2. Checks and Prioritizes Materials to Work on Before Starting",
      },
      {
        id: "materials_arrangement",
        name: "3. Keeps Materials to Work on Properly Arranged",
      },
      {
        id: "reliability",
        name: "4. Can Be Depended Upon to Finish Assigned Tasks on Time",
      },
      { id: "creativity", name: "5. Shows Creativity in His/Her Work" },
      { id: "error_detection", name: "6. Can Detect Errors and Correct Them" },
      { id: "presentation", name: "7. Work Is Presentable and Acceptable" },
      { id: "rate_of_work", name: "8. Consistent and Maintains Rate of Work" },
      {
        id: "judgment_under_stress",
        name: "9. Judgment Can Be Depended Upon Even Under Stress",
      },
    ],
  },
];
