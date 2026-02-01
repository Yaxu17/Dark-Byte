from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")

def similarity(jd, resume):
    jd_vec = model.encode(jd)
    resume_vec = model.encode(resume)
    return cosine_similarity([jd_vec], [resume_vec])[0][0]

jd = "Looking for a Python backend developer with FastAPI experience"
resume = "Backend engineer skilled in Python and APIs"

score = similarity(jd, resume)
print("Match score:", score)