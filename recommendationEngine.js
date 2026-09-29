// config/recommendationEngine.js
const { minScoreForGrade } = require('./gradeScale');

// Checks if a student's academic records satisfy one course's subject requirements
function checkAcademicMatch(academicRecords, requirement) {
  const requiredSubjects = requirement.required_subjects.split(',').map(s => s.trim().toLowerCase());
  const minScore = minScoreForGrade(requirement.min_grade);

  let subjectsMet = 0;
  let totalScoreOfMetSubjects = 0;

  for (const subj of requiredSubjects) {
    const record = academicRecords.find(r => r.subject_name.toLowerCase() === subj);
    if (record && record.score >= minScore) {
      subjectsMet++;
      totalScoreOfMetSubjects += record.score;
    }
  }

  const isEligible = subjectsMet === requiredSubjects.length; // STRICT: must have ALL of them
  const academicMatchScore = isEligible
    ? Math.round(totalScoreOfMetSubjects / requiredSubjects.length)
    : 0;

  return { isEligible, academicMatchScore };
}

function checkAspirationMatch(preferredField, course) {
  const field = preferredField.toLowerCase();
  const courseName = course.course_name.toLowerCase();
  const faculty = (course.faculty || '').toLowerCase();

  if (courseName.includes(field) || field.includes(courseName)) return 100;
  if (faculty.includes(field) || field.includes(faculty)) return 60;
  return 0;
}

function checkAptitudeMatch(studentAptitudeCategory, course) {
  if (!studentAptitudeCategory) return 0;
  return studentAptitudeCategory === course.related_aptitude_category ? 100 : 0;
}

// Main function: takes everything about a student and every course, returns ranked recommendations
function generateRecommendations(academicRecords, aspirationField, aptitudeCategory, coursesWithRequirements) {
  const results = [];

  for (const course of coursesWithRequirements) {
    const { isEligible, academicMatchScore } = checkAcademicMatch(academicRecords, course.requirement);

    if (!isEligible) continue; // strict mode: skip courses the student doesn't qualify for at all

    const aspirationMatchScore = checkAspirationMatch(aspirationField, course);
    const aptitudeMatchScore = checkAptitudeMatch(aptitudeCategory, course);

    // Weighted overall score: academic matters most, aspiration and aptitude refine the ranking
    const overallScore = Math.round(
      academicMatchScore * 0.6 + aspirationMatchScore * 0.2 + aptitudeMatchScore * 0.2
    );

    results.push({
      course_id: course.course_id,
      course_name: course.course_name,
      university: course.university,
      faculty: course.faculty,
      academic_match_score: academicMatchScore,
      aspiration_match_score: aspirationMatchScore,
      aptitude_match_score: aptitudeMatchScore,
      overall_score: overallScore,
    });
  }

  results.sort((a, b) => b.overall_score - a.overall_score);
  return results;
}

module.exports = { generateRecommendations };