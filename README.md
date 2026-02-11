# AI CV Parser

This project is a web application where users can upload their CVs in PDF format.  
Uploaded CV files are converted into text and saved in the database.

The project is designed as a base for future CV filtering and AI-supported analysis.

## What Does This Project Do?
- Users can register and log in
- Users can upload CV files (PDF)
- PDF files are converted to text on the backend
- Parsed CV text and file information are saved in the database
- User access is controlled with an admin approval system

## Technologies Used
- Node.js
- Express.js
- PostgreSQL
- React
- pdf-parse
- Multer

## CV Upload Process
1. User uploads a CV in PDF format
2. Backend reads the PDF file
3. PDF content is converted into text
4. Parsed text is saved in the database

## User and Admin Logic
- New users are created with a pending status
- Admin approves or rejects users
- User permissions are managed with `role` and `status` fields

## Project Structure
- `backend/` → Server-side logic
- `frontend/` → User interface
- `uploads/` → Uploaded CV files (ignored in Git)

## Notes
- `.env` file is not included for security reasons
- `node_modules` folder is ignored by Git

## Purpose
This project was developed during an internship to gain experience in backend, frontend, database usage, and AI integration.