-- seed.sql

INSERT INTO Courses (course_name, university, faculty, related_aptitude_category) VALUES
('Computer Science', 'University of Lagos', 'Science', 'Analytical'),
('Software Engineering', 'Federal University Dutse', 'Science', 'Analytical'),
('Mechanical Engineering', 'University of Nigeria Nsukka', 'Engineering', 'Practical'),
('Electrical Engineering', 'Ahmadu Bello University', 'Engineering', 'Practical'),
('Medicine and Surgery', 'University of Ibadan', 'Medicine', 'Analytical'),
('Nursing Science', 'University of Benin', 'Medicine', 'Social'),
('Mass Communication', 'Bayero University Kano', 'Social Science', 'Creative'),
('Fine and Applied Arts', 'Obafemi Awolowo University', 'Arts', 'Creative'),
('Psychology', 'University of Jos', 'Social Science', 'Social'),
('Architecture', 'Federal University of Technology Minna', 'Environmental Sciences', 'Creative');

INSERT INTO SubjectRequirements (course_id, required_subjects, min_grade) VALUES
(1, 'Mathematics,English Language,Physics', 'C6'),
(2, 'Mathematics,English Language,Physics', 'C6'),
(3, 'Mathematics,English Language,Physics,Chemistry', 'C6'),
(4, 'Mathematics,English Language,Physics,Chemistry', 'C6'),
(5, 'Biology,Chemistry,Physics,English Language', 'B3'),
(6, 'Biology,Chemistry,English Language', 'C6'),
(7, 'English Language,Literature in English', 'C6'),
(8, 'English Language,Fine Art', 'C6'),
(9, 'English Language,Biology,Mathematics', 'C6'),
(10, 'Mathematics,Physics,Fine Art,English Language', 'C6');