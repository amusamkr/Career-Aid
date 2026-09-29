// controllers/academicController.js
const { deleteRecordsByUser, addRecord, getRecordsByUser } = require('../models/academicModel');

async function submitRecords(req, res) {
  try {
    const userId = req.user.userId;
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records must be a non-empty array' });
    }

    for (const r of records) {
      const { subjectName, ssClass, score } = r;
      if (!subjectName || !ssClass || score === undefined) {
        return res.status(400).json({ error: 'Each record needs subjectName, ssClass, and score' });
      }
      if (score < 0 || score > 100) {
        return res.status(400).json({ error: `Invalid score for ${subjectName}: must be 0-100` });
      }
    }

    // Replace: wipe old records, then insert the fresh set
    await deleteRecordsByUser(userId);

    const saved = [];
    for (const r of records) {
      const saved_record = await addRecord(userId, r.subjectName, r.ssClass, r.score);
      saved.push(saved_record);
    }

    res.status(201).json({ message: 'Academic records saved', records: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getMyRecords(req, res) {
  try {
    const userId = req.user.userId;
    const records = await getRecordsByUser(userId);
    res.status(200).json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { submitRecords, getMyRecords };