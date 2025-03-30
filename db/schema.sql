-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (students and teachers)
CREATE TABLE IF NOT EXISTS users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id VARCHAR(255) NOT NULL UNIQUE,
name VARCHAR(255),
email VARCHAR(255),
role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher')),
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
teacher_id VARCHAR(255) REFERENCES users(user_id),
description TEXT,
invite_code VARCHAR(50) NOT NULL UNIQUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Class students (relationship between students and classes)
CREATE TABLE IF NOT EXISTS class_students (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
student_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
UNIQUE(class_id, student_id)
);

-- Learning styles for students
CREATE TABLE IF NOT EXISTS learning_styles (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
student_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
style VARCHAR(50) NOT NULL CHECK (style IN ('visual', 'auditory', 'reading', 'kinesthetic')),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task options for different learning styles
CREATE TABLE IF NOT EXISTS task_options (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
learning_style VARCHAR(50) NOT NULL CHECK (learning_style IN ('visual', 'auditory', 'reading', 'kinesthetic')),
title VARCHAR(255) NOT NULL,
description TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
student_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
content TEXT,
file_url TEXT,
status VARCHAR(50) DEFAULT 'completed',
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

