// const Relations: {} = {
//     user: {
//         attributes: {
//             user_id: true,
//             username: false,
//             first_name: false,
//             middle_name: false,
//             last_name: false,
//             email: false,
//             phone_num: false,
//             birth_date: false,
//             pronouns: false,
//             nickname: false,
//             hometown: false,
//             homepage_link: false,
//             profile_picture_link: false,
//             student_or_staff: false,
//         },
//         datatypes: {
//             user_id: "INT UNSIGNED AUTO_INCREMENT",
//             username: "VARCHAR(50) UNIQUE NOT NULL",
//             first_name: "VARCHAR(50)",
//             middle_name: "VARCHAR(50)",
//             last_name: "VARCHAR(50)",
//             email: "VARCHAR(255) NOT NULL",
//             phone_num: "VARCHAR(50)",
//             birth_date: "DATE",
//             pronouns: "VARCHAR(50)",
//             nickname: "VARCHAR(50)",
//             hometown: "VARCHAR(50)",
//             homepage_link: "VARCHAR(255)",
//             profile_picture_link: "VARCHAR(255)",
//             student_or_staff: "ENUM('student','teacher') NOT NULL",
//         }
//     },

//     student: {
//         attributes: {

//         }
//     },

//     staff: {
//         attributes: {
//             teacher_or_teacher_assistant: false 
//         },
//         datatypes: {
//             teacher_or_teacher_assistant: "ENUM('teacher','teacher_assistant') NOT NULL"
//         }
//     },

//     teacher: {
//         attributes: {

//         }
//     },

//     teacher_assistant: { 
//         attributes: {

//         }
//     },

//     login_info: {
//         attributes: {
//             hashed_password:false
//         },
//         datatypes: {
//             hashed_password:"VARCHAR(255)"
//         },
//         weak:true
//     },

//     course: {
//         attributes: {
//             course_section: true,
//             course_year: true,
//             course_name: false,
//             course_description: false,
//         },
//         datatypes: {
//             course_section: "INT UNSIGNED",
//             course_year: "YEAR",
//             course_name: "VARCHAR(50)",
//             course_description: "VARCHAR(255)",
//         }
//     },
//     announcements: {
//         attributes: {
//             datetime_posted: false,
//             announcement: false
//         },
//         datatypes:{
//             datetime_posted: "DATETIME",
//             announcement: "VARCHAR(2000)"
//         },
//         weak: true,
//     },
//     gradable: {
//         attributes: {
//             gradable_id: true,
//             points: false,
//             weight: false,
//             start_date: false,
//             due_date: false,
//             gradable_type: false,
//         },
//         datatypes: {
//             gradable_id: "INT UNSIGNED AUTO_INCREMENT",
//             points: "INT",
//             weight: "DECIMAL(5,2)",
//             start_date: "DATETIME",
//             due_date: "DATETIME",
//             gradable_type: "ENUM('quiz','discussion_forum','assignment')",
//         }
//     },

//     student_gradable:{ 
//         attributes: {
//             grade_received:false,
//             comment:false,
//         },
//         weak:true,
//         datatypes: {
//             grade_received:"INT",
//             comment:"VARCHAR(2000)",
//         }
//     },


//     assignment: {
//         attributes: {
//             assignment_details: false
//         },
//         datatypes: {
//             assignment_details: "VARCHAR(500)"
//         }
//     },
//     discussion_forum: {
//         attributes: {
//             discussion_details: false,
//         },
//         datatypes: {
//             discussion_details: "VARCHAR(500)"
//         }
//         // weak: true,
//     },
//     discussion_post: {
//         attributes: {
//             post_id: true,
//             message: false
//             // reply_id
//         },
//         datatypes: {
//             post_id: "INT UNSIGNED AUTO_INCREMENT",
//             message: "VARCHAR(2000)"
//         },
//         recursive: {
//             post_id: "reply_id"
//         }
//     },
//     quiz: {
//         attributes: {

//         },
//         weak: true,
//     },
//     quiz_question: {
//         attributes: {
//             question_number: true,
//             question: false,
//         },
//         datatypes: {
//             question_number: "INT UNSIGNED AUTO_INCREMENT",
//             question: "VARCHAR(500)"
//         },
//         weak: true
//     },

//     question_answer: {
//         attributes: {
//             answer:false,
//             answer_type: false
//         },
//         datatypes:{
//             answer:"VARCHAR(500)",
//             answer_type:"ENUM ('free_response','multiple_choice')"
//         },
//         weak: true,
//     },


//     free_response: {
//         attributes: {
//             // answer: false
//         }
//     },
//     multiple_choice: {
//         attributes: {
//             is_answer: false
//         },
//         datatypes: {
//             is_answer: "TINYINT(1)"
//         }
//     }
// }

// const Connections = [
//     ["user", "course", Cardinality.MANY_TO_MANY],

//     ["user","login_info",Cardinality.ONE_TO_MANY_ONE],
//     ["course", "gradable", Cardinality.ONE_TO_MANY_ZERO],
//     ["course", "announcements", Cardinality.ONE_TO_MANY_ZERO],
//     ["gradable", "quiz", Cardinality.SUPER_TO_SUBTYPE],
//     ["gradable", "discussion_forum", Cardinality.SUPER_TO_SUBTYPE],
//     ["gradable", "assignment", Cardinality.SUPER_TO_SUBTYPE],
//     ["discussion_forum", "discussion_post", Cardinality.ONE_TO_MANY_ZERO],
//     ["discussion_post", "discussion_post", Cardinality.ONE_TO_MANY_ZERO],
//     ["quiz", "quiz_question", Cardinality.ONE_TO_MANY_ONE],
//     ["quiz_question", "question_answer", Cardinality.ONE_TO_MANY_ONE],
//     ["question_answer", "free_response", Cardinality.SUPER_TO_SUBTYPE],
//     ["question_answer", "multiple_choice", Cardinality.SUPER_TO_SUBTYPE],

//     ["user","student",Cardinality.SUPER_TO_SUBTYPE],
//     ["user","staff",Cardinality.SUPER_TO_SUBTYPE],
//     ["staff","teacher",Cardinality.SUPER_TO_SUBTYPE],
//     ["staff","teacher_assistant",Cardinality.SUPER_TO_SUBTYPE],

//     ["student","student_gradable",Cardinality.ONE_TO_MANY_ZERO],
//     ["gradable","student_gradable",Cardinality.ONE_TO_MANY_ZERO],

// ]




// const Relations: {} = {
//     EMPLOYEE: {
//         attributes: {
//             id: true,
//             // email: true,
//             fname: false,
//             lname: false,
//             p_num: false,
//         },
//         datatypes: {
//             id: "INT UNSIGNED AUTO_INCREMENT",
//             fname: "VARCHAR(50)",
//             lname: "VARCHAR(50)",
//             p_num: "CHAR(11)",
//         },
//         recursive: {
//             id: "mentor_id"
//         }
//     }
// }

// const Connections = [
//     ["EMPLOYEE","EMPLOYEE",Cardinality.ONE_TO_MANY_ONE]
// ]


// const Relations: {} = {
//     PERSON: {
//         attributes: {
//             person_id: true,
//             fname: false,
//             lname: false
//         }
//     },
//     STUDENT: {
//         attributes: {
//             student_nickname: false
//         }
//     },
//     COURSE: {
//         attributes: {
//             course_id: true,
//             course_name: false
//         }
//     }
// }

// const Connections = [
//     ["PERSON", "STUDENT", Cardinality.SUPER_TO_SUBTYPE],
//     ["STUDENT", "COURSE", Cardinality.MANY_TO_MANY]
// ]

// const Relations: {} = {
//     COMPANY: {
//         attributes: {
//             company_name: true,
//             company_url: false,
//             company_phone: false,
//         },
//         recursive: {
//             company_name: "parent_company_name"
//         }
//     },
//     PHONE: {
//         attributes: {
//             phone_number: true,
//             phone_type_desc: false,
//         }
//     },
//     CONTACT: {
//         attributes: {
//             contact_id: true,
//             fname: false,
//             mi: false,
//             lname: false,
//         }
//     },
//     EMAIL: {
//         attributes: {
//             email: true
//         }
//     },
//     CO_WORKER: {
//         attributes: {
//             office_number: false
//         }
//     },
//     VENDOR_TYPE: {
//         attributes: {
//             vendor_type_id: true,
//             description: false
//         }
//     },
//     VENDOR: {
//         attributes: {

//         }
//     },
//     PERSONAL: {
//         attributes: {
//             street: false,
//             city: false,
//             state: false,
//             zip_code: false,
//         }
//     },
//     RELATIVE: {
//         attributes: {
//             relationship: false,
//             friend: false,
//         }
//     },
//     FRIEND: {
//         attributes: {
//             know_from: false
//         }
//     },
// }

// const Connections = [
//     ["COMPANY", "CONTACT", Cardinality.ZERO_TO_MANY_ZERO],
//     ["COMPANY", "COMPANY", Cardinality.ZERO_TO_MANY_ZERO],
//     ["CONTACT", "PHONE", Cardinality.MANY_TO_MANY],
//     ["CONTACT", "EMAIL", Cardinality.ONE_TO_MANY_ZERO],
//     ["CONTACT", "CO_WORKER", Cardinality.SUPER_TO_SUBTYPE],
//     ["CONTACT", "VENDOR", Cardinality.SUPER_TO_SUBTYPE],
//     ["CONTACT", "PERSONAL", Cardinality.SUPER_TO_SUBTYPE],
//     ["VENDOR_TYPE", "VENDOR", Cardinality.MANY_TO_MANY],

//     ["PERSONAL", "RELATIVE", Cardinality.SUPER_TO_SUBTYPE],
//     ["PERSONAL", "FRIEND", Cardinality.SUPER_TO_SUBTYPE],



// ]

// const Relations: {} = {
//     MEMBER: {
//         attributes: {
//             member_id:true,
//         }
//     },
//     MUSICIAN: {
//         attributes: {

//         }
//     },
//     CONDUCTOR: {
//         attributes: {

//         }
//     },
//     SENIOR: {
//         attributes:{

//         }
//     },
//     JUNIOR: {
//         attributes:{

//         }
//     },
//     SOLOIST: {
//         attributes:{

//         }
//     },
//     CONCERT_SEASON: {
//         attributes: {
//             season_year:true
//         }
//     },
//     CONCERT: {
//         attributes: {
//             concert_number:true
//         },
//         weak:true
//     },
//     COMPOSITION: {
//         attributes: {
//             composer_name:true,
//             composition_name:true
//         }
//     },
//     COMPOSITION_SOLOIST: {
//         attributes: {

//         },
//         weak:true
//     }
// }

// const Connections = [
//     ["MEMBER","CONDUCTOR",Cardinality.SUPER_TO_SUBTYPE],
//     ["MEMBER","MUSICIAN",Cardinality.SUPER_TO_SUBTYPE],
//     ["CONDUCTOR","JUNIOR",Cardinality.SUPER_TO_SUBTYPE],
//     ["CONDUCTOR","SENIOR",Cardinality.SUPER_TO_SUBTYPE],
//     ["MUSICIAN","SOLOIST",Cardinality.SUPER_TO_SUBTYPE],
//     ["SENIOR","JUNIOR",Cardinality.ONE_TO_ZERO],
//     ["CONCERT_SEASON","CONCERT",Cardinality.ONE_TO_MANY_ONE],
//     ["CONDUCTOR","CONCERT",Cardinality.ONE_TO_MANY_ZERO],
//     ["CONCERT","COMPOSITION",Cardinality.MANY_TO_MANY],
//     ["COMPOSITION","COMPOSITION_SOLOIST",Cardinality.ONE_TO_MANY_ZERO],
//     ["SOLOIST","COMPOSITION_SOLOIST",Cardinality.ONE_TO_MANY_ZERO],

// ]


// const Relations: {} = {
//     EMPLOYEE:{
//         attributes:{
//             employee_id:true,
//             employee_name: false
//         }
//     },
//     SALES_OFFICE:{
//         attributes:{
//             office_number:true,
//             location:false
//         }
//     },
//     PROPERTY:{
//         attributes:{
//             property_id:true,
//             property_location:false
//         }
//     },
//     OWNER:{
//         attributes:{
//             owner_id:true,
//             owner_name:false
//         }
//     },
//     PROPERTY_OWNER: {
//         attributes: {
//             percent_owned: false,
//         },
//         weak:true
//     }
// }

// const Connections = [
//     ["EMPLOYEE","SALES_OFFICE",Cardinality.ONE_TO_MANY_ONE_NID],
//     ["SALES_OFFICE","EMPLOYEE",Cardinality.ONE_TO_ZERO_NID],
//     ["SALES_OFFICE","PROPERTY",Cardinality.ONE_TO_MANY_ZERO_NID],
//     ["PROPERTY","PROPERTY_OWNER",Cardinality.ONE_TO_MANY_ONE],
//     ["OWNER","PROPERTY_OWNER",Cardinality.ONE_TO_MANY_ONE],
// ]

// const Relations: {} = {

//     MEMBER: {
//         attributes: {
//             member_number: true,
//         },
//         recursive: {
//             member_number: "referrer_member_number"
//         }
//     },
//     MEMBER_LOAN: {
//         attributes: {
//             closing_rate: false,
//         },
//         weak:true
//     },
//     MEMBER_ACCOUNT: {
//         attributes: {
//             current_balance: false
//         },
//         weak: true
//     },
//     TRANSACTION: {
//         attributes: {
//             time_stamp: true,
//         },
//         weak: true
//     },
//     TRANS_TYPE: {
//         attributes: {
//             type_id: true
//         },
//     },
//     ACCOUNT_TYPE: {
//         attributes: {
//             account_type_id: true,
//         }
//     },
//     LOAN_TYPE: {
//         attributes: {
//             loan_code: true
//         }
//     },
//     VEHICLE: {
//         attributes: {

//         }
//     },
//     PERSONAL: {
//         attributes: {

//         }
//     },
//     MORTGAGE: {
//         attributes: {

//         }
//     },
//     FIXED_RATE: {
//         attributes: {

//         }
//     },
//     ADJUSTABLE: {
//         attributes: {

//         }
//     },

// }

// const Connections: any[] = [
//     ["MEMBER", "MEMBER", Cardinality.ZERO_TO_MANY_ZERO_NID],
//     ["MEMBER", "MEMBER_LOAN", Cardinality.ONE_TO_MANY_ZERO],
//     ["LOAN_TYPE", "MEMBER_LOAN", Cardinality.ONE_TO_MANY_ZERO],
//     ["LOAN_TYPE", "VEHICLE", Cardinality.SUPER_TO_SUBTYPE],
//     ["LOAN_TYPE", "PERSONAL", Cardinality.SUPER_TO_SUBTYPE],
//     ["LOAN_TYPE", "MORTGAGE", Cardinality.SUPER_TO_SUBTYPE],
//     ["MORTGAGE", "FIXED_RATE", Cardinality.SUPER_TO_SUBTYPE],
//     ["MORTGAGE", "ADJUSTABLE", Cardinality.SUPER_TO_SUBTYPE],
//     ["MEMBER", "MEMBER_ACCOUNT", Cardinality.ONE_TO_MANY_ONE],
//     ["ACCOUNT_TYPE", "MEMBER_ACCOUNT", Cardinality.ONE_TO_MANY_ZERO],
//     ["MEMBER_ACCOUNT", "TRANSACTION", Cardinality.ONE_TO_MANY_ZERO],
//     ["TRANS_TYPE", "TRANSACTION", Cardinality.ONE_TO_MANY_ZERO_NID],
// ]




// const Relations: {} = {
//     PERSON: {
//         attributes: {
//             ssn: true,
//             name: false
//         }
//     },
//     STAFF: {
//         attributes: {
//             // ssn: true
//         },
//         // recursive: {
//         //     ssn: "manager_ssn"
//         // }
//     },
//     PATIENT: {
//         attributes: {

//         }
//     },
//     SUPPORT_STAFF: {
//         attributes: {
//             wage: false,
//         }
//     },
//     NURSE: {
//         attributes: {
//             certification: false
//         }
//     },
//     DOCTOR: {
//         attributes: {

//         }
//     },
//     DEPARTMENT: {
//         attributes: {
//             dept_number: true,
//             name: false
//         }
//     },
//     INSURANCE_COMPANY: {
//         attributes: {
//             co_number: true,
//             name: false,
//         }
//     },
//     INSURANCE_POLICY: {
//         attributes: {
//             policy_num: false,
//         },
//         weak: true
//     }
// }

// const Connections = [
//     ["STAFF", "DOCTOR", Cardinality.SUPER_TO_SUBTYPE],

//     ["PERSON", "STAFF", Cardinality.SUPER_TO_SUBTYPE],
//     ["PERSON", "PATIENT", Cardinality.SUPER_TO_SUBTYPE],
//     ["STAFF", "STAFF", Cardinality.ONE_TO_MANY_ZERO],
//     ["STAFF", "DEPARTMENT", Cardinality.MANY_TO_MANY],
//     ["STAFF", "SUPPORT_STAFF", Cardinality.SUPER_TO_SUBTYPE],
//     ["STAFF", "NURSE", Cardinality.SUPER_TO_SUBTYPE],
//     ["DOCTOR", "DOCTOR", Cardinality.ONE_TO_MANY_ZERO],
//     ["DOCTOR", "PATIENT", Cardinality.ONE_TO_MANY_ZERO],
//     ["PATIENT", "INSURANCE_POLICY", Cardinality.ONE_TO_MANY_ZERO],
//     ["INSURANCE_COMPANY", "INSURANCE_POLICY", Cardinality.ONE_TO_MANY_ZERO],
// ]

// transpose(Relations, Connections)
// relation_to_sql()

// const Relations: {} = {
//     "&": {
//         attributes: {
//             id: true,
//         },
//     },
//     A: {
//         attributes: {
//             a: true,
//             b: false
//         },
//         datatypes: {
//             a: "INT UNSIGNED AUTO_INCREMENT",
//             b: "VARCHAR(50)"
//         }
//     },

//     miniA: {
//         attributes: {
//             m: false
//         }
//     },

//     B: {
//         attributes: {
//             // c: true,
//             d: false
//         },
//         datatypes: {
//             // c: "INT UNSIGNED AUTO_INCREMENT",
//             d: "ENUM ('type1','type2')",
//         },
//         weak: true,
//     },

//     D: {
//         attributes: {
//             f: true,
//             g: true
//         },
//         datatypes: {
//             f: "INT UNSIGNED AUTO_INCREMENT",
//             g: "VARCHAR(50)"
//         }
//     },
//     C: {
//         attributes: {
//             e: false
//             // d: false
//         },
//         weak: true
//     },

//     E: {
//         attributes: {

//         },
//         weak: true
//     },
//     F: {
//         attributes: {
//             bruh: false
//         }
//     },
//     G: {
//         attributes: {
//             zuh: false
//         },
//         weak: true
//     },
//     H: {
//         attributes: {
//             juh:true,
//             guh: false
//         }
//     }
// }

// const Connections: any[] = [
//     ["A", "B", Cardinality.ONE_TO_ZERO],
//     ["B", "C", Cardinality.ONE_TO_MANY_ONE],
//     ["D", "C", Cardinality.ONE_TO_MANY_ONE],
//     ["A", "miniA", Cardinality.SUPER_TO_SUBTYPE],
//     ["C", "E", Cardinality.ONE_TO_MANY_ONE],
//     ["E", "F", Cardinality.SUPER_TO_SUBTYPE],
//     ["&", "G", Cardinality.ONE_TO_MANY_ZERO],
//     ["&", "H", Cardinality.ONE_TO_MANY_ZERO],
//     ["F", "G", Cardinality.ONE_TO_MANY_ZERO],
//     ["F", "H", Cardinality.ONE_TO_MANY_ZERO],
// ]

// const Relations: {} = {
//     salesperson: {
//         attributes: {
//             salesperson_id: true
//         },
//         recursive: {
//             salesperson_id: "manager_id"  
//         }
//     },
//     customer: {
//         attributes: {
//             customer_id: true
//         }
//     },
//     order: {
//         attributes: {
//             order_id: true
//         }
//     },
//     product: {
//         attributes: {
//             product_id: true
//         }
//     },
//     employee: {
//         attributes: {
//             employee_id: true
//         }
//     },
//     part: {
//         attributes: {
//             part_id: true
//         }
//     },
//     supplier: {
//         attributes: {
//             supplier_id: true
//         }
//     },
// }

// const Connections: any[] = [
//     ["salesperson","salesperson",Cardinality.ONE_TO_MANY_ONE],
//     ["salesperson","customer",Cardinality.ONE_TO_MANY_ONE],
//     ["customer","order",Cardinality.ONE_TO_MANY_ONE],
//     ["order","product",Cardinality.MANY_TO_MANY],
//     ["product","part",Cardinality.ONE_TO_MANY_ONE],
//     ["product","employee",Cardinality.MANY_TO_MANY],
//     ["part","supplier",Cardinality.MANY_TO_MANY],
    
// ]

// const Relations: {} = {
//     A: {
//         attributes: {
//             a: true
//         },
//         weak: true
//     },
//     B: {
//         attributes: {
//             b: true
//         },
//         recursive: {
//             b: "member_b"
//         },
//         // weak: true
//     },
//     C: {
//         attributes: {
//             c: true,
//         }
//     },
//     D: {
//         attributes: {
//             d: true,
//         }
//     },
// }
// const Connections: any[] = [
//     ["C","A",Cardinality.ONE_TO_MANY_ONE],
//     ["D","A",Cardinality.ONE_TO_MANY_ONE],

//     ["A","B",Cardinality.ONE_TO_MANY_ONE],
//     ["B","B",Cardinality.ONE_TO_MANY_ONE],

// ]