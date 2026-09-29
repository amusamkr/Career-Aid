// config/gradeScale.js
// Maps WAEC/NECO letter grades to the minimum numeric score (0-100) needed to achieve them
const gradeMinimums = {
  A1: 75,
  B2: 70,
  B3: 65,
  C4: 60,
  C5: 55,
  C6: 50,
  D7: 45,
  E8: 40,
  F9: 0,
};

function minScoreForGrade(grade) {
  return gradeMinimums[grade.toUpperCase()] ?? 50; // default to C6 threshold if unknown
}

module.exports = { minScoreForGrade };