-- Insert demo users
INSERT INTO users (user_id, name, email, role) VALUES
('teacher_123', 'Profesor Demo', 'teacher@example.com', 'teacher'),
('student_123', 'Estudiante Demo', 'student@example.com', 'student')
ON CONFLICT (user_id) DO NOTHING;

-- Insert demo class
INSERT INTO classes (name, teacher_id, description, invite_code) VALUES
('Ciencias Naturales', 'teacher_123', 'Clase demo para ciencias naturales', 'DEMO123')
ON CONFLICT (invite_code) DO NOTHING;

-- Get the class ID and perform operations
DO $$
DECLARE
    v_class_id UUID;
    v_task_id UUID;
BEGIN
    -- Get the class ID
    SELECT id INTO v_class_id FROM classes WHERE invite_code = 'DEMO123';
    
    -- Enroll the demo student
    INSERT INTO class_students (class_id, student_id)
    VALUES (v_class_id, 'student_123')
    ON CONFLICT (class_id, student_id) DO NOTHING;
    
    -- Set the student's learning style
    INSERT INTO learning_styles (student_id, style)
    VALUES ('student_123', 'visual')
    ON CONFLICT (student_id) DO NOTHING;
    
    -- Create a demo task
    INSERT INTO tasks (class_id)
    VALUES (v_class_id)
    RETURNING id INTO v_task_id;
    
    -- Add task options for different learning styles
    INSERT INTO task_options (task_id, learning_style, title, description)
    VALUES
    (v_task_id, 'visual', 'Crear un mapa mental sobre el Sistema Solar', 
     'Diseña un mapa mental colorido que muestre los planetas y sus características.'),
    (v_task_id, 'auditory', 'Grabar una explicación sobre el Sistema Solar', 
     'Graba un audio explicando los planetas del Sistema Solar.'),
    (v_task_id, 'reading', 'Escribir un resumen sobre el Sistema Solar', 
     'Escribe un resumen detallado sobre los planetas del Sistema Solar.'),
    (v_task_id, 'kinesthetic', 'Construir un modelo del Sistema Solar', 
     'Construye un modelo 3D del Sistema Solar con materiales reciclados.');
END $$;

