// controllers/profileController.js
const quizQuestions = require('../config/aptitudeQuiz');
const {
  createProfile,
  updateProfileField,
  updateAptitudeCategory,
  deleteAnswersForProfile,
  saveAnswer,
  getProfileByUser,
} = require('../models/profileModel');

// Student requests the quiz questions
function getQuiz(req, res) {
  // Don't send the category tags to the frontend - that would let students see the "correct" mapping
  const publicQuiz = quizQuestions.map(q => ({
    questionNumber: q.questionNumber,
    questionText: q.questionText,
    options: q.options.map(o => ({ key: o.key, text: o.text })),
  }));
  res.status(200).json({ quiz: publicQuiz });
}

// Student submits aspiration + quiz answers together (creates first time, updates after)
async function submitProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { preferredField, answers } = req.body;
    // answers expected as: [{ questionNumber: 1, selectedKey: "A" }, ...]

    if (!preferredField || !Array.isArray(answers) || answers.length !== quizQuestions.length) {
      return res.status(400).json({
        error: `preferredField is required, and answers must include all ${quizQuestions.length} questions`,
      });
    }

    let profile = await getProfileByUser(userId);

    if (profile) {
      // Resubmission: update existing profile instead of blocking
      profile = await updateProfileField(profile.profile_id, preferredField);
      await deleteAnswersForProfile(profile.profile_id);
    } else {
      profile = await createProfile(userId, preferredField);
    }

    const categoryCounts = {};

    for (const ans of answers) {
      const question = quizQuestions.find(q => q.questionNumber === ans.questionNumber);
      if (!question) {
        return res.status(400).json({ error: `Invalid questionNumber: ${ans.questionNumber}` });
      }
      const option = question.options.find(o => o.key === ans.selectedKey);
      if (!option) {
        return res.status(400).json({ error: `Invalid selectedKey for question ${ans.questionNumber}` });
      }

      await saveAnswer(profile.profile_id, question.questionNumber, question.questionText, option.text);

      categoryCounts[option.category] = (categoryCounts[option.category] || 0) + 1;
    }

    // Find whichever category was picked the most
    let topCategory = null;
    let topCount = 0;
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > topCount) {
        topCategory = category;
        topCount = count;
      }
    }

    const updatedProfile = await updateAptitudeCategory(profile.profile_id, topCategory);

    res.status(200).json({ message: 'Profile saved', profile: updatedProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getMyProfile(req, res) {
  try {
    const userId = req.user.userId;
    const profile = await getProfileByUser(userId);
    if (!profile) {
      return res.status(404).json({ error: 'No profile found' });
    }
    res.status(200).json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { getQuiz, submitProfile, getMyProfile };