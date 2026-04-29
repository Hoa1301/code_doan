export const MOCK_DATA = {
    users: [
        { id: "USR-001", name: "Nguyễn Văn A", email: "nguyen.van.a@example.com", role: "Interviewer", department: "Engineering", avatar: "https://i.pravatar.cc/150?u=USR-001" },
        { id: "USR-002", name: "Trần Thị B", email: "tran.thi.b@example.com", role: "HR", department: "Human Resources", avatar: "https://i.pravatar.cc/150?u=USR-002" },
        { id: "USR-003", name: "Lê Văn C", email: "le.van.c@example.com", role: "Manager", department: "Product", avatar: "https://i.pravatar.cc/150?u=USR-003" },
        { id: "USR-004", name: "Phạm Thị D", email: "pham.thi.d@example.com", role: "Interviewer", department: "Design", avatar: "https://i.pravatar.cc/150?u=USR-004" }
    ],
    learningPaths: [
        {
            id: "LP-001",
            track: "Frontend Development",
            modules: [
                {
                    id: 1,
                    title: "HTML/CSS Fundamentals",
                    status: "Ready",
                    items: [
                        { id: "M1-I1", type: "video", title: "Introduction to HTML5", duration: "10:30", url: "#", meta: "10:30" },
                        { id: "M1-I2", type: "document", title: "CSS Box Model Guide", url: "#", meta: "PDF" },
                        { id: "M1-Q1", type: "quiz", title: "HTML/CSS Quiz 1", questionsCount: 10, meta: "10 Questions" }
                    ]
                },
                {
                    id: 2,
                    title: "JavaScript Basics",
                    status: "In Progress",
                    items: [
                        { id: "M2-I1", type: "video", title: "ES6 Features", duration: "15:00", url: "#", meta: "15:00" },
                        { id: "M2-Q1", type: "quiz", title: "JS Quiz 1", questionsCount: 15, meta: "15 Questions" }
                    ]
                },
                {
                    id: 3,
                    title: "React Fundamentals",
                    status: "Locked",
                    items: []
                }
            ]
        }
    ],
    quizzes: [
        {
            id: "QZ-001",
            moduleId: 1,
            title: "HTML/CSS Quiz 1",
            questions: [
                { id: "Q1", text: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Tool Markup Language"], correct: 0 },
                { id: "Q2", text: "Which tag is used for the largest heading?", options: ["<h1>", "<h6>", "<head>"], correct: 0 }
            ]
        }
    ],
    studentProgress: [
        {
            id: "SP-001",
            internId: "ITS-001",
            learningPathId: "LP-001",
            modulesCompleted: [],
            currentModuleId: 1,
            quizScores: {},
            createdAt: "2025-01-15T08:00:00",
            updatedAt: "2025-01-15T08:00:00"
        }
    ],
    recruitmentPlans: [
        {
            id: "PLAN-2025-01",
            name: "Tuyển dụng Thực tập sinh Hè 2025",
            campaignName: "Summer Internship 2025",
            description: "Chương trình tuyển dụng thực tập sinh quy mô lớn cho các phòng ban Engineering, Product và Design.",
            startDate: "2025-05-01",
            endDate: "2025-08-31",
            status: "Active",
            positions: [
                { title: "Frontend Developer Intern", quantity: 5, requirements: ["ReactJS", "TypeScript", "HTML/CSS"] },
                { title: "Backend Developer Intern", quantity: 5, requirements: ["NodeJS", "NestJS", "PostgreSQL"] }
            ],
            approver: "Giám đốc Nhân sự",
            createdAt: "2025-03-01T08:00:00",
            updatedAt: "2025-03-05T10:00:00"
        }
    ],
    interviews: [
        {
            id: "INT-001",
            candidateId: "CAN-001",
            candidateName: "Nguyễn Văn Nam",
            interviewerId: "USR-001",
            interviewerName: "Nguyễn Văn A",
            date: "2025-03-15",
            time: "09:00 - 10:00",
            duration: 60,
            type: "Online",
            location: "Google Meet",
            status: "Scheduled",
            round: "Technical Round 1"
        }
    ],
    accounts: [
        {
            _id: "1",
            fullName: "Admin Hệ Thống",
            email: "admin@tts-learning.com",
            phone: "0901234567",
            role_id: "admin",
            status: "active",
            createdAt: "2025-01-01T08:00:00",
            updatedAt: "2025-01-01T08:00:00"
        },
        {
            _id: "2",
            fullName: "Nguyễn Văn Mentor",
            email: "mentor1@tts-learning.com",
            phone: "0912345678",
            role_id: "mentor",
            status: "active",
            createdAt: "2025-02-01T10:30:00",
            updatedAt: "2025-02-01T10:30:00"
        }
    ],

    jobPositions: [
        {
            id: "JOB-001",
            title: "Frontend (ReactJS) Intern",
            campaign: "Kế hoạch Tuyển dụng Hè 2025",
            campaignId: "1",
            department: "Engineering",
            level: "Intern",
            required: 15,
            filled: 6,
            status: "Open",
            postedDate: "2025-02-15",
            description: "Làm việc với ReactJS, Next.js, TailwindCSS. Tham gia phát triển các dashboard quản trị.",
            requirements: "Ưu tiên sinh viên năm 3-4, biết HTML/CSS/JS cơ bản. Có tư duy logic tốt.",
            location: "Thành phố Hồ Chí Minh",
            salary: "3tr - 5tr VNĐ",
            createdAt: "2025-02-15T08:00:00",
            updatedAt: "2025-02-15T08:00:00"
        },
        {
            id: "JOB-002",
            title: "Backend (NodeJS) Intern",
            campaign: "Kế hoạch Tuyển dụng Hè 2025",
            campaignId: "1",
            department: "Engineering",
            level: "Intern",
            required: 10,
            filled: 4,
            status: "Open",
            postedDate: "2025-02-20",
            description: "Xây dựng hệ thống RESTful API bằng NodeJS/Express. Làm việc với MongoDB/PostgreSQL.",
            requirements: "Biết xử lý bất đồng bộ trong JS. Hiểu cơ bản về Database.",
            location: "Hà Nội / Remote",
            salary: "3tr - 5tr VNĐ",
            createdAt: "2025-02-20T09:00:00",
            updatedAt: "2025-02-20T09:00:00"
        },
        {
            id: "JOB-003",
            title: "Mobile App (Flutter) Intern",
            campaign: "Kế hoạch Tuyển dụng Hè 2025",
            campaignId: "1",
            department: "Engineering",
            level: "Intern",
            required: 5,
            filled: 2,
            status: "Open",
            postedDate: "2025-02-25",
            description: "Phát triển ứng dụng Mobile đa nền tảng bằng Flutter.",
            requirements: "Yêu thích lập trình di động. Có kiến thức về Dart là lợi thế.",
            location: "Thành phố Hồ Chí Minh",
            salary: "3tr - 5tr VNĐ",
            createdAt: "2025-02-25T10:00:00",
            updatedAt: "2025-02-25T10:00:00"
        }
    ],

    interns: [
        {
            id: "ITS-001",
            name: "Phạm Minh Đức",
            avatar: "https://i.pravatar.cc/150?u=ITS-001",
            email: "duc.pm@example.com",
            phone: "0900112233",
            track: "Frontend Development",
            mentor: "Nguyễn Văn Mentor",
            startDate: "2025-01-15",
            endDate: "2025-04-15",
            progress: 65,
            status: "Active",
            createdAt: "2025-01-15T08:00:00",
            updatedAt: "2025-03-01T10:00:00"
        },
        {
            id: "ITS-002",
            name: "Hoàng Thu Hà",
            avatar: "https://i.pravatar.cc/150?u=ITS-002",
            email: "ha.ht@example.com",
            phone: "0900112244",
            track: "Backend Development",
            mentor: "Lê Vũ Anh (Senior BE)",
            startDate: "2025-02-01",
            endDate: "2025-05-01",
            progress: 30,
            status: "Active",
            createdAt: "2025-02-01T09:00:00",
            updatedAt: "2025-03-01T10:00:00"
        }
    ],
    tasks: [
        {
            id: "TSK-201",
            title: "Xây dựng màn hình Dashboard Mockup",
            intern: "Phạm Minh Đức",
            internId: "ITS-001",
            internAvatar: "https://i.pravatar.cc/150?u=ITS-001",
            priority: "High",
            dueDate: "2025-03-20",
            status: "In Progress",
            description: "Sử dụng Ant Design để dựng layout dashboard chính.",
            createdAt: "2025-03-01T08:00:00",
            updatedAt: "2025-03-05T10:00:00"
        },
        {
            id: "TSK-202",
            title: "Viết Unit Test cho Auth Service",
            intern: "Hoàng Thu Hà",
            internId: "ITS-002",
            internAvatar: "https://i.pravatar.cc/150?u=ITS-002",
            priority: "Medium",
            dueDate: "2025-03-25",
            status: "To Do",
            description: "Đảm bảo coverage đạt trên 80% cho các hàm xử lý logic đăng nhập.",
            createdAt: "2025-03-05T09:00:00",
            updatedAt: "2025-03-05T09:00:00"
        }
    ],



    evaluations: [
        {
            id: "EVL-201",
            internId: "ITS-001",
            internName: "Phạm Minh Đức",
            mentorId: "MEN-001",
            mentorName: "Nguyễn Văn Mentor",
            type: "Knowledge-test",
            score: 85,
            feedback: "Kết quả bài test ReactJS tốt, cần chú ý thêm về tối ưu render.",
            status: "Completed",
            date: "2025-03-01",
            createdAt: "2025-03-01T15:00:00",
            updatedAt: "2025-03-01T15:00:00"
        }
    ],
    reports: [
        {
            id: "REP-201",
            internId: "ITS-001",
            title: "Báo cáo Tuần 3 - Tháng 2",
            type: "Weekly",
            period: "Tuần 3 - Feb 2025",
            submittedAt: "2025-02-21",
            status: "Approved",
            score: 90,
            feedback: "Báo cáo chi tiết, nắm vững quy trình làm việc của team.",
            content: "Đã hoàn thành module đăng nhập và tích hợp API xác thực.",
            challenges: "Gặp khó khăn khi xử lý Refresh Token, đã được mentor hỗ trợ.",
            nextPlan: "Tiếp tục làm module Dashboard.",
            createdAt: "2025-02-21T17:00:00",
            updatedAt: "2025-02-22T08:00:00"
        }
    ],

    approvals: [
        {
            id: "APR-001",
            type: "Recruitment",
            name: "Kế hoạch Tuyển dụng Hè 2025",
            title: "Đề xuất mở rộng slot thực tập sinh cho team AI",
            department: "Engineering",
            hr: "Nguyễn Thị HR",
            priority: "High",
            status: "Pending",
            budget: 50000,
            salary: 45000,
            currentRole: "Recruitment Plan",
            proposedRole: "AI/ML Intern Program",
            score: 4.5,
            createdAt: "2025-03-06T10:30:00",
            updatedAt: "2025-03-06T10:30:00"
        },
        {
            id: "APR-002",
            type: "Recruitment",
            name: "Tuyển Frontend Q2",
            title: "Cần thực tập sinh Frontend cho dự án mới",
            department: "Product",
            hr: "Trần Văn Manager",
            priority: "Medium",
            status: "Pending",
            budget: 30000,
            salary: 28000,
            currentRole: "Recruitment Plan",
            proposedRole: "Frontend Developer Intern",
            score: 4.2,
            createdAt: "2025-03-01T09:00:00",
            updatedAt: "2025-03-05T14:20:00"
        },
        {
            id: "APR-003",
            type: "Recruitment",
            name: "Backend Team Expansion",
            title: "Mở rộng đội Backend cho microservices",
            department: "Engineering",
            mentor: "Lê Văn Tech Lead",
            priority: "High",
            status: "Pending",
            budget: 40000,
            salary: 42000,
            currentRole: "Recruitment Plan",
            proposedRole: "Backend Developer Intern",
            score: 4.7,
            createdAt: "2025-02-28T11:15:00",
            updatedAt: "2025-03-04T16:45:00"
        },
        {
            id: "APR-004",
            type: "Conversion",
            name: "Nguyễn Văn A",
            title: "Chuyển đổi từ Intern sang Junior Developer",
            department: "Engineering",
            mentor: "Phạm Thị Mentor",
            priority: "Medium",
            status: "Approved",
            budget: 15000,
            salary: 14000,
            currentRole: "Frontend Intern",
            proposedRole: "Junior Frontend Developer",
            score: 4.8,
            createdAt: "2025-02-20T08:00:00",
            updatedAt: "2025-02-25T10:00:00"
        }
    ],
    candidates: [
        {
            id: "CAND-001",
            name: "Nguyễn Văn An",
            email: "nguyenvanan@gmail.com",
            phone: "0901234567",
            location: "Hà Nội",
            avatar: "",
            role: "Student",
            education: "ĐHBK Hà Nội - Khoa CNTT",
            experience: "6 tháng",
            skills: ["ReactJS", "JavaScript", "HTML/CSS", "Git"],
            appliedFor: "JOB-001",
            appliedForTitle: "Frontend (ReactJS) Intern",
            appliedDate: "2025-03-01",
            timeAgo: "6 days ago",
            status: "Pending Review",
            matchScore: 85,
            resumeUrl: "/resumes/nguyen-van-an.pdf",
            coverLetter: "Tôi rất hứng thú với vị trí Frontend Intern tại công ty...",
            createdAt: "2025-03-01T09:00:00",
            updatedAt: "2025-03-01T09:00:00"
        },
        {
            id: "CAND-002",
            name: "Trần Thị Bình",
            email: "tranthibinh@gmail.com",
            phone: "0912345678",
            location: "TP. Hồ Chí Minh",
            avatar: "",
            role: "Student",
            education: "ĐH Công Nghệ TP.HCM",
            experience: "1 năm",
            skills: ["ReactJS", "TypeScript", "Next.js", "TailwindCSS"],
            appliedFor: "JOB-001",
            appliedForTitle: "Frontend (ReactJS) Intern",
            appliedDate: "2025-03-02",
            timeAgo: "5 days ago",
            status: "Shortlisted",
            matchScore: 92,
            resumeUrl: "/resumes/tran-thi-binh.pdf",
            coverLetter: "Với kinh nghiệm 1 năm làm việc với ReactJS...",
            createdAt: "2025-03-02T10:30:00",
            updatedAt: "2025-03-03T14:20:00"
        },
        {
            id: "CAND-003",
            name: "Lê Minh Châu",
            email: "leminhchau@gmail.com",
            phone: "0923456789",
            location: "Đà Nẵng",
            avatar: "",
            role: "Fresh Graduate",
            education: "ĐH Bách Khoa Đà Nẵng",
            experience: "3 tháng",
            skills: ["NodeJS", "Express", "MongoDB", "RESTful API"],
            appliedFor: "JOB-002",
            appliedForTitle: "Backend (NodeJS) Intern",
            appliedDate: "2025-03-03",
            timeAgo: "4 days ago",
            status: "Pending Review",
            matchScore: 78,
            resumeUrl: "/resumes/le-minh-chau.pdf",
            coverLetter: "Tôi mới tốt nghiệp và muốn phát triển kỹ năng Backend...",
            createdAt: "2025-03-03T11:15:00",
            updatedAt: "2025-03-03T11:15:00"
        },
        {
            id: "CAND-004",
            name: "Phạm Quốc Dũng",
            email: "phamquocdung@gmail.com",
            phone: "0934567890",
            location: "Hà Nội",
            avatar: "",
            role: "Student",
            education: "ĐH FPT Hà Nội",
            experience: "8 tháng",
            skills: ["NodeJS", "NestJS", "PostgreSQL", "Docker"],
            appliedFor: "JOB-002",
            appliedForTitle: "Backend (NodeJS) Intern",
            appliedDate: "2025-03-04",
            timeAgo: "3 days ago",
            status: "Shortlisted",
            matchScore: 88,
            resumeUrl: "/resumes/pham-quoc-dung.pdf",
            coverLetter: "Tôi có kinh nghiệm làm việc với NestJS và microservices...",
            createdAt: "2025-03-04T08:45:00",
            updatedAt: "2025-03-05T16:00:00"
        },
        {
            id: "CAND-005",
            name: "Hoàng Thị Ế",
            email: "hoangthie@gmail.com",
            phone: "0945678901",
            location: "Cần Thơ",
            avatar: "",
            role: "Student",
            education: "ĐH Cần Thơ",
            experience: "2 tháng",
            skills: ["Flutter", "Dart"],
            appliedFor: "JOB-003",
            appliedForTitle: "Mobile App (Flutter) Intern",
            appliedDate: "2025-03-05",
            timeAgo: "2 days ago",
            status: "Rejected",
            matchScore: 45,
            resumeUrl: "/resumes/hoang-thi-e.pdf",
            coverLetter: "Tôi đang học Flutter và muốn có cơ hội thực tập...",
            createdAt: "2025-03-05T13:20:00",
            updatedAt: "2025-03-06T09:30:00"
        },
        {
            id: "CAND-006",
            name: "Vũ Đức Phúc",
            email: "vuducphuc@gmail.com",
            phone: "0956789012",
            location: "TP. Hồ Chí Minh",
            avatar: "",
            role: "Student",
            education: "ĐH Khoa học Tự nhiên TP.HCM",
            experience: "5 tháng",
            skills: ["ReactJS", "Redux", "Material-UI", "Jest"],
            appliedFor: "JOB-001",
            appliedForTitle: "Frontend (ReactJS) Intern",
            appliedDate: "2025-03-06",
            timeAgo: "1 day ago",
            status: "CV Screened",
            matchScore: 82,
            resumeUrl: "/resumes/vu-duc-phuc.pdf",
            coverLetter: "Tôi đã tham gia nhiều dự án cá nhân với ReactJS...",
            createdAt: "2025-03-06T15:10:00",
            updatedAt: "2025-03-06T17:45:00"
        }
    ],
    onboarding: [
        {
            id: "OB-001",
            name: "Trần Thị Bình",
            avatar: "",
            track: "Frontend Development",
            currentStep: 1,
            startDate: "2025-03-10",
            status: "In Progress",
            steps: [
                { title: "Documents", status: "finish" },
                { title: "Account Setup", status: "process" },
                { title: "Orientation", status: "wait" },
                { title: "First Assignment", status: "wait" }
            ],
            createdAt: "2025-03-08T10:00:00",
            updatedAt: "2025-03-08T10:00:00"
        },
        {
            id: "OB-002",
            name: "Phạm Quốc Dũng",
            avatar: "",
            track: "Backend Development",
            currentStep: 2,
            startDate: "2025-03-08",
            status: "In Progress",
            steps: [
                { title: "Documents", status: "finish" },
                { title: "Account Setup", status: "finish" },
                { title: "Orientation", status: "process" },
                { title: "First Assignment", status: "wait" }
            ],
            createdAt: "2025-03-06T09:00:00",
            updatedAt: "2025-03-07T14:30:00"
        },
        {
            id: "OB-003",
            name: "Nguyễn Văn Cường",
            avatar: "",
            track: "Full Stack Development",
            currentStep: 4,
            startDate: "2025-03-01",
            status: "Completed",
            steps: [
                { title: "Documents", status: "finish" },
                { title: "Account Setup", status: "finish" },
                { title: "Orientation", status: "finish" },
                { title: "First Assignment", status: "finish" }
            ],
            createdAt: "2025-02-28T08:00:00",
            updatedAt: "2025-03-05T16:00:00"
        }
    ],
    mentorRequests: [
        {
            id: "REQ-001",
            type: "Recruitment",
            name: "Kế hoạch Hè 2025",
            title: "Đề xuất mở rộng slot thực tập sinh cho team AI",
            department: "Engineering",
            requestedBy: "Nguyễn Văn Mentor",
            priority: "High",
            status: "Pending",
            positions: ["AI/ML Intern", "Data Science Intern"],
            quantity: 5,
            requiredSkills: ["Python", "TensorFlow", "PyTorch", "Machine Learning"],
            expectedStartDate: "2025-06-01",
            createdAt: "2025-03-06T10:30:00",
            updatedAt: "2025-03-06T10:30:00"
        },
        {
            id: "REQ-002",
            type: "Recruitment",
            name: "Tuyển Frontend Q2",
            title: "Cần thực tập sinh Frontend cho dự án mới",
            department: "Product",
            requestedBy: "Trần Thị Leader",
            priority: "Medium",
            status: "Approved",
            positions: ["Frontend Developer Intern"],
            quantity: 3,
            requiredSkills: ["ReactJS", "TypeScript", "CSS", "HTML"],
            expectedStartDate: "2025-04-15",
            createdAt: "2025-03-01T09:00:00",
            updatedAt: "2025-03-05T14:20:00"
        },
        {
            id: "REQ-003",
            type: "Recruitment",
            name: "Backend Team Expansion",
            title: "Mở rộng đội Backend cho microservices",
            department: "Engineering",
            requestedBy: "Lê Văn Tech Lead",
            priority: "High",
            status: "In Progress",
            positions: ["Backend Developer Intern"],
            quantity: 4,
            requiredSkills: ["NodeJS", "NestJS", "MongoDB", "PostgreSQL"],
            expectedStartDate: "2025-05-01",
            createdAt: "2025-02-28T11:15:00",
            updatedAt: "2025-03-04T16:45:00"
        },
        {
            id: "REQ-004",
            type: "Recruitment",
            name: "Mobile Team Q2",
            title: "Tuyển thực tập sinh Mobile cho app mới",
            department: "Product",
            requestedBy: "Phạm Văn Mobile Lead",
            priority: "Medium",
            status: "Pending",
            positions: ["Mobile Developer Intern"],
            quantity: 2,
            requiredSkills: ["React Native", "Flutter", "iOS", "Android"],
            expectedStartDate: "2025-05-15",
            createdAt: "2025-03-05T14:00:00",
            updatedAt: "2025-03-05T14:00:00"
        },
        {
            id: "REQ-005",
            type: "Recruitment",
            name: "UI/UX Design Intern",
            title: "Cần designer cho team Product",
            department: "Design",
            requestedBy: "Nguyễn Thị Design Lead",
            priority: "Low",
            status: "Rejected",
            positions: ["UI/UX Design Intern"],
            quantity: 1,
            requiredSkills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
            expectedStartDate: "2025-06-01",
            createdAt: "2025-02-25T10:00:00",
            updatedAt: "2025-03-01T16:00:00"
        }
    ],
    dashboardStats: {
        totalUsers: 50,
        activeUsers: 35,
        todayVisits: 120,
        openPositions: 8,
        pendingApplications: 25,
        upcomingInterviews: 5,
        activeInterns: 15,
        pendingReviews: 10,
        conversionRate: 22
    }
};
