-- schema.sql

CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE AcademicRecords (
  record_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id) ON DELETE CASCADE,
  subject_name VARCHAR(50) NOT NULL,
  ss_class VARCHAR(10) NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100)
);

CREATE TABLE NonAcademicProfile (
  profile_id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES Users(user_id) ON DELETE CASCADE,
  preferred_field VARCHAR(100),
  aptitude_category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE AptitudeAnswers (
  answer_id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES NonAcademicProfile(profile_id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  selected_answer TEXT NOT NULL
);

CREATE TABLE Courses (
  course_id SERIAL PRIMARY KEY,
  course_name VARCHAR(150) NOT NULL,
  university VARCHAR(150),
  faculty VARCHAR(100),
  related_aptitude_category VARCHAR(50)
);

CREATE TABLE SubjectRequirements (
  requirement_id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES Courses(course_id) ON DELETE CASCADE,
  required_subjects TEXT NOT NULL,
  min_grade VARCHAR(5)
);

CREATE TABLE Recommendations (
  rec_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES Courses(course_id) ON DELETE CASCADE,
  academic_match_score NUMERIC(5,2),
  aspiration_match_score NUMERIC(5,2),
  aptitude_match_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  ai_explanation TEXT,
  date_generated TIMESTAMP DEFAULT NOW()
);