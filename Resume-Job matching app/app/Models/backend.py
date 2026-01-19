from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Resume Job Matching API")

class MatchRequest(BaseModel):
    job_description: str

@app.get("/")
def root():
    return {"status": "Backend running"}

@app.post("/match")
def match_resumes(request: MatchRequest):
    return {
        "message": "API working",
        "job_description": request.job_description
    }
