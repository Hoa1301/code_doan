
erDiagram
  reports {
    string id PK
    date created_at
    date updated_at
    string intern_id
    string type
    string period
    string title
    string content
    string challenges
    string next_plan
    date submitted_at
    number score
    string feedback
    string reviewed_by
    date reviewed_at
  }
  evaluations {
    string id PK
    date created_at
    date updated_at
    string intern_id
    string mentor_id
    string type
    date evaluation_date
    number technical_score
    number attitude_score
    number teamwork_score
    number progress_score
    number overall_score
    string strengths
    string weaknesses
    string feedback
    string decision
    string decision_reason
    string status
  }
  job_positions {
    string id PK
    date created_at
    date updated_at
    string code
    string title
    string recruitment_plan_id
    string department
    number required_quantity
    number filled_quantity
    string description
    string requirements
    string benefits
    string location
    string salary_range
    date posted_date
    date deadline
    string created_by
  }
  interviews {
    string id PK
    date created_at
    date updated_at
    string candidate_id
    string job_id
    date interview_date
    string interview_time
    number duration_minutes
    string format
    string location
    string interviewer_id
    string result
    string notes
    string feedback
  }
  candidates {
    string id PK
    date created_at
    date updated_at
    string user_id
    string full_name
    string email
    string phone
    string location
    string avatar_url
    string education
    string experience
    array skills
    string resume_url
    string cover_letter
    string applied_for_job_id
    date applied_date
    number match_score
    string rejection_reason
  }
  recruitment_plans {
    string id PK
    date created_at
    date updated_at
    string name
    string batch
    string department
    string description
    date start_date
    date end_date
    string created_by
    string approved_by
    date approved_at
    string rejection_reason
  }
  roles {
    string id PK
    date created_at
    date updated_at
    string name
    string display_name
    string description
  }
  permissions {
    string id PK
    date created_at
    date updated_at
    string name
    string display_name
    string module
    string description
  }
  users {
    string id PK
    date created_at
    date updated_at
    string full_name
    string email
    string password_hash
    string phone
    string avatar_url
    boolean email_verified
    date email_verified_at
    date last_login_at
  }
  interns {
    string id PK
    date created_at
    date updated_at
    string user_id
    string code
    string candidate_id
    string track
    string mentor_id
    string department
    date start_date
    date end_date
    number overall_progress
  }
  quiz_attempts {
    string id PK
    date created_at
    date updated_at
    string quiz_id
    string intern_id
    date submitted_at
    number score
    number total_points
    string status
    json answers
  }
  task_comments {
    string id PK
    date created_at
    date updated_at
    string task_id
    string user_id
    string comment
    array attachments
  }
  tasks {
    string id PK
    date created_at
    date updated_at
    string code
    string title
    string description
    string intern_id
    string mentor_id
    string priority
    date due_date
    array attachments
    date completed_at
  }
  quiz_questions {
    string id PK
    date created_at
    date updated_at
    string quiz_id
    string question_text
    string question_type
    json options
    string correct_answer
    number points
    number order_index
  }
  modules {
    string id PK
    date created_at
    date updated_at
    string learning_path_id
    string title
    string description
    number order_index
    string status
    number passing_score
    boolean is_required
  }
  quizzes {
    string id PK
    date created_at
    date updated_at
    string module_id
    string learning_path_id
    string title
    string description
    string type
    number passing_score
    number time_limit_minutes
    number total_questions
    string created_by
  }
  learning_paths {
    string id PK
    date created_at
    date updated_at
    string track
    string title
    string description
    string created_by
    boolean is_active
  }
  module_contents {
    string id PK
    date created_at
    date updated_at
    string module_id
    string type
    string title
    string content_url
    json metadata
    number order_index
  }
  intern_progress {
    string id PK
    date created_at
    date updated_at
    string intern_id
    string learning_path_id
    string current_module_id
    array modules_completed
    number overall_progress
  }
  system_settings {
    string id PK
    date created_at
    date updated_at
    string key
    string value
    string data_type
    string description
    string updated_by
  }
  notifications {
    string id PK
    date created_at
    date updated_at
    string user_id
    string type
    string title
    string message
    json data
    boolean is_read
    date read_at
  }
  email_logs {
    string id PK
    date created_at
    date updated_at
    string template_id
    string recipient_email
    string subject
    string body
    string status
    string error_message
  }
  file_uploads {
    string id PK
    date created_at
    date updated_at
    string uploaded_by
    string file_name
    string file_path
    number file_size
    string mime_type
    string entity_type
    string entity_id
  }
  audit_logs {
    string id PK
    date created_at
    date updated_at
    string user_id
    string action
    string entity_type
    string entity_id
    json old_values
    json new_values
    string ip_address
    string user_agent
  }
  approvals {
    string id PK
    date created_at
    date updated_at
    enum type
    string entityId
    string name
    string title
    string currentRole
    string proposedRole
    string mentor
    number score
    number salary
    number budget
    string department
    string hr
    enum priority
    enum status
    string notes
    json details
  }
  email_templates {
    string id PK
    date created_at
    date updated_at
    string code
    string name
    string subject
    string body
    array variables
  }
  reports }o--|| interns : "intern"
  reports }o--|| users : "reviewer"
  evaluations }o--|| interns : "intern"
  evaluations }o--|| users : "mentor"
  job_positions }o--|| recruitment_plans : "recruitmentPlan"
  job_positions }o--|| users : "creator"
  job_positions ||--o{ candidates : "candidates"
  interviews }o--|| candidates : "candidate"
  interviews }o--|| job_positions : "job"
  interviews }o--|| users : "interviewer"
  candidates }o--|| users : "user"
  candidates }o--|| job_positions : "job"
  candidates ||--o{ interviews : "interviews"
  recruitment_plans }o--|| users : "creator"
  recruitment_plans }o--|| users : "approver"
  recruitment_plans ||--o{ job_positions : "jobPositions"
  interns ||--|| users : "user"
  interns ||--|| candidates : "candidate"
  interns }o--|| users : "mentor"
  interns ||--o{ intern_progress : "progress"
  interns ||--o{ tasks : "tasks"
  interns ||--o{ evaluations : "evaluations"
  interns ||--o{ reports : "reports"
  quiz_attempts }o--|| quizzes : "quiz"
  quiz_attempts }o--|| interns : "intern"
  task_comments }o--|| tasks : "task"
  task_comments }o--|| users : "user"
  tasks }o--|| interns : "intern"
  tasks }o--|| users : "mentor"
  tasks ||--o{ task_comments : "comments"
  quiz_questions }o--|| quizzes : "quiz"
  modules }o--|| learning_paths : "learningPath"
  modules ||--o{ module_contents : "contents"
  modules ||--o{ quizzes : "quizzes"
  quizzes }o--|| modules : "module"
  quizzes }o--|| learning_paths : "learningPath"
  quizzes }o--|| users : "creator"
  quizzes ||--o{ quiz_questions : "questions"
  quizzes ||--o{ quiz_attempts : "attempts"
  learning_paths }o--|| users : "creator"
  learning_paths ||--o{ modules : "modules"
  module_contents }o--|| modules : "module"
  intern_progress }o--|| interns : "intern"
  intern_progress }o--|| learning_paths : "learningPath"
  intern_progress }o--|| modules : "currentModule"
  system_settings }o--|| users : "updater"
  notifications }o--|| users : "user"
  email_logs }o--|| email_templates : "template"
  file_uploads }o--|| users : "uploader"
  audit_logs }o--|| users : "user"
