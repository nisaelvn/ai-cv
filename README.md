AI CV Parser & Analyzer

AI CV Parser & Analyzer is a full-stack web application designed to automate the recruitment process by parsing PDF resumes and performing semantic analysis using Artificial Intelligence. The system evaluates candidate suitability against specific job descriptions and streamlines human resources workflows.

Key Features
Automated PDF Parsing: Extracts and converts structured and unstructured data from PDF resumes into machine-readable text.
AI-Driven Evaluation: Utilizes the Google Gemini 1.5 Flash model to analyze candidate resumes based on job-specific requirements.
Compatibility Scoring: Generates a weighted suitability score (0-100) and provides a detailed breakdown of candidate strengths and weaknesses.
Recruiter Communication Automation: Automatically generates professional email drafts for candidates based on analysis results, integrated via the mailto protocol.
Role-Based Access Control (RBAC): Implements a secure multi-user architecture with separate Admin and User interfaces, including a manual account activation system.

Technical Stack
Frontend: React.js, Axios, Modern Component-Based UI
Backend: Node.js, Express.js
Database: PostgreSQL (Relational Data Modeling and JOIN optimizations)
Artificial Intelligence: Google Generative AI (Gemini API)
File Processing: Multer (File Upload Management), PDF-Parse (Text Extraction)
Security: JWT (JSON Web Tokens) for session management, Bcrypt for password hashing

System Workflow
Data Ingestion: The user uploads an unstructured PDF resume to the system.
Preprocessing: The backend extracts the raw text and persists the candidate profile in the PostgreSQL database.
Semantic Analysis: The Admin initiates the AI analysis. The system transmits the resume text and job description to the Gemini API.
Reporting: The AI returns a structured JSON response containing the suitability score, a brief summary, and a personalized email draft.
Engagement: The Admin reviews the generated metrics and contacts the candidate using the integrated communication tool.

Future Roadmap
To further enhance the system's scalability and intelligence, the following features are planned for future development:
Batch Processing: Implementation of asynchronous workers to analyze and score multiple resumes simultaneously for high-volume recruitment.
Advanced Filtering Engine: Multi-criteria search functionality for filtering candidate pools by experience years, technical stacks, or specific certifications.
Analytics Dashboard: Integration of data visualization tools to monitor recruitment KPIs, candidate distribution, and hiring success rates.
Voice and Video Analysis: Integration of Speech-to-Text (STT) technologies to evaluate candidate soft skills from recorded video interviews.
Dynamic Job Description Optimization: An AI-powered tool to analyze current market trends and assist recruiters in creating optimized job descriptions.

Project Structure
Bash
├── backend/        # Server-side logic, AI controllers, and Database configurations
├── frontend/       # React application, Admin dashboard, and API integration services
├── uploads/        # Local storage for resume files (Excluded from version control)
└── .env.example    # Configuration template for environment variables

Installation and Deployment
Clone the Repository: git clone https://github.com/your-username/ai-cv-parser.git
Install Dependencies: Run npm install in both the frontend and backend directories.
Database Configuration: Execute the SQL scripts provided in the database folder to initialize the PostgreSQL schema.
Environment Variables: Create a .env file in the backend directory with the necessary keys (GEMINI_API_KEY, DB_CONFIG, JWT_SECRET).
Execution: Start the development servers using npm start.

Purpose and Scope
This project was developed during an internship to demonstrate the practical application of Full-Stack Development, Relational Database Management, and Artificial Intelligence integration. It aims to solve real-world operational challenges in Human Resources through automation and data-driven insights.