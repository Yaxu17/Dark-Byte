from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# -------------------------------
# CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# RESUME MATCHING LOGIC (OLD)
# -------------------------------
def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

@app.post("/match")
async def match_resumes(
    job_description: str = Form(...),
    resumes: list[UploadFile] = File(...)
):
    resume_texts = []
    resume_names = []

    for resume in resumes:
        text = extract_text_from_pdf(resume.file)
        resume_texts.append(text)
        resume_names.append(resume.filename)

    documents = [job_description] + resume_texts

    vectorizer = TfidfVectorizer(stop_words="english")
    vectors = vectorizer.fit_transform(documents)

    jd_vector = vectors[0]
    resume_vectors = vectors[1:]

    similarities = cosine_similarity(jd_vector, resume_vectors)[0]

    results = []
    for i, score in enumerate(similarities):
        percent = int(score * 100)
        status = "Selected" if percent >= 70 else "Rejected"

        results.append({
            "resume_id": resume_names[i],
            "score": percent,
            "status": status
        })

    return results

# -------------------------------
# AUTH (NEW)
# -------------------------------
FAKE_USERS = {
    "admin@talentlens.com": {"password": "admin123", "role": "admin"},
    "hr@talentlens.com": {"password": "hr123", "role": "hr"},
    "user@talentlens.com": {"password": "user123", "role": "user"},
    "employee@talentlens.com": {"password": "emp123", "role": "employee"},
}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(data: LoginRequest):
    user = FAKE_USERS.get(data.email)

    if not user or user["password"] != data.password:
        return {"success": False, "message": "Invalid credentials"}

    return {
        "success": True,
        "role": user["role"],
        "token": "fake-jwt-token"
    }

# -------------------------------
# DASHBOARD (NEW)
# -------------------------------
@app.get("/dashboard/{role}")
def dashboard(role: str):
    if role in ["admin", "hr"]:
        return {
            "total_resumes": 150,
            "shortlisted": 120,
            "rejected": 30
        }

    return {
        "uploaded": 1,
        "status": "Pending",
        "best_match": "—"
    }
