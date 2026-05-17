drop database if exists myclasses;
create database myclasses;
use myclasses;

CREATE TABLE user (
    user_id INT UNSIGNED AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    middle_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    phone_num VARCHAR(50),
    birth_date DATE,
    pronouns VARCHAR(50),
    nickname VARCHAR(50),
    hometown VARCHAR(50),
    homepage_link VARCHAR(255),
    profile_picture_link VARCHAR(255),
    student_or_staff ENUM('student','teacher') NOT NULL,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT user_pk PRIMARY KEY (user_id)
);
CREATE TABLE course (
    course_section INT UNSIGNED,
    course_year YEAR,
    course_name VARCHAR(50),
    course_description VARCHAR(255),

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT course_pk PRIMARY KEY (course_section, course_year)
);
CREATE TABLE student (

    # ----[ FOREIGN KEYS ]----,
    user_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT student_pk PRIMARY KEY (user_id),
    CONSTRAINT student_user_fk FOREIGN KEY (user_id) REFERENCES user (user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE staff (
    teacher_or_teacher_assistant ENUM('teacher','teacher_assistant') NOT NULL,

    # ----[ FOREIGN KEYS ]----,
    user_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT staff_pk PRIMARY KEY (user_id),
    CONSTRAINT staff_user_fk FOREIGN KEY (user_id) REFERENCES user (user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE teacher (

    # ----[ FOREIGN KEYS ]----,
    user_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT teacher_pk PRIMARY KEY (user_id),
    CONSTRAINT teacher_staff_fk FOREIGN KEY (user_id) REFERENCES staff (user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE teacher_assistant (

    # ----[ FOREIGN KEYS ]----,
    user_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT teacher_assistant_pk PRIMARY KEY (user_id),
    CONSTRAINT teacher_assistant_staff_fk FOREIGN KEY (user_id) REFERENCES staff (user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE login_info (
    hashed_password VARCHAR(255),

    # ----[ FOREIGN KEYS ]----,
    user_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT login_info_pk PRIMARY KEY (user_id),
    CONSTRAINT login_info_user_fk FOREIGN KEY (user_id) REFERENCES user (user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE announcements (
    datetime_posted DATETIME,
    announcement VARCHAR(2000),

    # ----[ FOREIGN KEYS ]----,
    course_section INT UNSIGNED,
    course_year YEAR,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT announcements_pk PRIMARY KEY (course_section, course_year),
    CONSTRAINT announcements_course_fk FOREIGN KEY (course_section, course_year) REFERENCES course (course_section, course_year)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE gradable (
    gradable_id INT UNSIGNED AUTO_INCREMENT,
    points INT,
    weight DECIMAL(5,2),
    start_date DATETIME,
    due_date DATETIME,
    gradable_type ENUM('quiz','discussion_forum','assignment'),

    # ----[ FOREIGN KEYS ]----,
    course_section INT UNSIGNED NOT NULL,
    course_year YEAR NOT NULL,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT gradable_pk PRIMARY KEY (gradable_id),
    CONSTRAINT gradable_course_fk FOREIGN KEY (course_section, course_year) REFERENCES course (course_section, course_year)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE assignment (
    assignment_details VARCHAR(500),

    # ----[ FOREIGN KEYS ]----,
    gradable_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT assignment_pk PRIMARY KEY (gradable_id),
    CONSTRAINT assignment_gradable_fk FOREIGN KEY (gradable_id) REFERENCES gradable (gradable_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE discussion_forum (
    discussion_details VARCHAR(500),

    # ----[ FOREIGN KEYS ]----,
    gradable_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT discussion_forum_pk PRIMARY KEY (gradable_id),
    CONSTRAINT discussion_forum_gradable_fk FOREIGN KEY (gradable_id) REFERENCES gradable (gradable_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE discussion_post (
    post_id INT UNSIGNED AUTO_INCREMENT,
    message VARCHAR(2000),

    # ----[ FOREIGN KEYS ]----,
    discussion_forum_gradable_id INT UNSIGNED NOT NULL,
    reply_id INT UNSIGNED NOT NULL,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT discussion_post_pk PRIMARY KEY (post_id),
    CONSTRAINT discussion_post_discussion_forum_fk FOREIGN KEY (discussion_forum_gradable_id) REFERENCES discussion_forum (gradable_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT discussion_post_discussion_post_fk FOREIGN KEY (reply_id) REFERENCES discussion_post (post_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE quiz (

    # ----[ FOREIGN KEYS ]----,
    gradable_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT quiz_pk PRIMARY KEY (gradable_id),
    CONSTRAINT quiz_gradable_fk FOREIGN KEY (gradable_id) REFERENCES gradable (gradable_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE quiz_question (
    question_number INT UNSIGNED AUTO_INCREMENT,
    question VARCHAR(500),

    # ----[ FOREIGN KEYS ]----,
    quiz_gradable_id INT UNSIGNED NOT NULL,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT quiz_question_pk PRIMARY KEY (question_number),
    CONSTRAINT quiz_question_quiz_fk FOREIGN KEY (quiz_gradable_id) REFERENCES quiz (gradable_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE question_answer (
    answer VARCHAR(500),
    answer_type ENUM ('free_response','multiple_choice'),

    # ----[ FOREIGN KEYS ]----,
    question_number INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT question_answer_pk PRIMARY KEY (question_number),
    CONSTRAINT question_answer_quiz_question_fk FOREIGN KEY (question_number) REFERENCES quiz_question (question_number)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE free_response (

    # ----[ FOREIGN KEYS ]----,
    question_number INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT free_response_pk PRIMARY KEY (question_number),
    CONSTRAINT free_response_question_answer_fk FOREIGN KEY (question_number) REFERENCES question_answer (question_number)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE multiple_choice (
    is_answer TINYINT(1),

    # ----[ FOREIGN KEYS ]----,
    question_number INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT multiple_choice_pk PRIMARY KEY (question_number),
    CONSTRAINT multiple_choice_question_answer_fk FOREIGN KEY (question_number) REFERENCES question_answer (question_number)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE student_gradable (
    grade_received INT,
    comment VARCHAR(2000),

    # ----[ FOREIGN KEYS ]----,
    student_user_id INT UNSIGNED,
    gradable_id INT UNSIGNED,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT student_gradable_pk PRIMARY KEY (student_user_id, gradable_id),
    CONSTRAINT student_gradable_student_fk FOREIGN KEY (student_user_id) REFERENCES student (user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT student_gradable_gradable_fk FOREIGN KEY (gradable_id) REFERENCES gradable (gradable_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
CREATE TABLE user_course (

    # ----[ FOREIGN KEYS ]----,
    user_id INT UNSIGNED,
    course_section INT UNSIGNED,
    course_year YEAR,

    # ----[ CONSTRAINTS ]----,
    CONSTRAINT user_course_pk PRIMARY KEY (user_id, course_section, course_year),
    CONSTRAINT user_course_user_fk FOREIGN KEY (user_id) REFERENCES user (user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT user_course_course_fk FOREIGN KEY (course_section, course_year) REFERENCES course (course_section, course_year)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);




DELIMITER //
create procedure user_insert(
	in username varchar(50),
	in email varchar(255),
	in first_name varchar(50),
	in middle_name varchar(50),
	in last_name varchar(50),
	in student_or_staff ENUM('student','teacher')
	)
begin
	insert into user (username, email, first_name, middle_name, last_name, student_or_staff)
	values (username, email, first_name, middle_name, last_name, student_or_staff);
end
DELIMITER ;


DELIMITER //
create procedure student_insert(
	in username varchar(50),
	in email varchar(255),
	in first_name varchar(50),
	in middle_name varchar(50),
	in last_name varchar(50)
	)
begin
	call user_insert(username, email, first_name, middle_name, last_name, 'student');
end
DELIMITER ;




DELIMITER //
create procedure create_user_password(
    in username varchar(50)
    in hashed_password varchar(255)
    )
begin
    DECLARE user_exists TINYINT(1);
    select exists(select 1 from user where username = 'luke_gaming') into user_exists;
    if user_exists > 0 then
        


end



CALL student_insert('luke_gaming','luke@gmail.com','luke','harbinger','draco');
CALL student_insert('bobby_bones','bob@gmail.com','bob','jones','kosh');