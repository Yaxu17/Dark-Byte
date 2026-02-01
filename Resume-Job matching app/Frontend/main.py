from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
