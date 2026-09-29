// controllers/recommendationController.js
const { getRecordsByUser } = require('../models/academicModel');
const { getProfileByUser, getAnswersByProfile } = require('../models/profileModel');
const { getCoursesWithRequirements } = require('../models/courseModel');
const { createBatch, saveRecommendation, getBatchesByUser } = require('../models/recommendationModel');
const { generateRecommendations } = require('../config/recommendationEngine');
const { generateExplanation } = require('../services/geminiService');

async function generate(req, res) {
  try {
    const userId = req.user.userId;

    const academicRecords = await getRecordsByUser(userId);
    const profile = await getProfileByUser(userId);

    if (academicRecords.length === 0) {
      return res.status(400).json({ error: 'Submit your academic records first' });
    }
    if (!profile) {
      return res.status(400).json({ error: 'Submit your career aspiration and aptitude quiz first' });
    }

    const courses = await getCoursesWithRequirements();
    const results = generateRecommendations(
      academicRecords,
      profile.preferred_field,
      profile.aptitude_category,
      courses
    );

    const quizAnswers = await getAnswersByProfile(profile.profile_id);

    const academicSnapshot = academicRecords.map(r => ({
      subject: r.subject_name,
      score: r.score,
    }));
    const quizSnapshot = {
      preferredField: profile.preferred_field,
      aptitudeCategory: profile.aptitude_category,
      answers: quizAnswers,
    };

    const batch = await createBatch(userId, profile.preferred_field, profile.aptitude_category, academicSnapshot, quizSnapshot);

    if (results.length === 0) {
      return res.status(200).json({ message: 'No matching courses found for your current subjects', batch, recommendations: [] });
    }

    const studentName = req.user.fullName || 'there';

    const saved = [];
    for (const rec of results) {
      const explanation = await generateExplanation(
        studentName,
        rec.course_name,
        rec.academic_match_score,
        rec.aspiration_match_score,
        rec.aptitude_match_score,
        profile.preferred_field,
        profile.aptitude_category
      );

      const savedRec = await saveRecommendation(batch.batch_id, userId, { ...rec, ai_explanation: explanation });
      saved.push({ ...savedRec, course_name: rec.course_name, faculty: rec.faculty });
    }

    res.status(201).json({ message: 'Recommendations generated', batch, recommendations: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getMine(req, res) {
  try {
    const userId = req.user.userId;
    const batches = await getBatchesByUser(userId);
    res.status(200).json({ batches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function remove(req, res) {
  try {
    const userId = req.user.userId;
    const { batchId } = req.params;

    const deleted = await deleteBatch(batchId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Recommendation set not found' });
    }

    res.status(200).json({ message: 'Recommendation set deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
module.exports = { generate, getMine };
module.exports = { generate, getMine, remove };