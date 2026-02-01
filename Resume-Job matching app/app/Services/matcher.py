import numpy as np

def cosine_similarity(vec1, vec2):
    """
    Calculate cosine similarity between two vectors
    """
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)

    if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
        return 0.0

    return np.dot(vec1, vec2) / (
        np.linalg.norm(vec1) * np.linalg.norm(vec2)
    )


def rank_resumes(jd_vector, resume_data):
    """
    jd_vector: embedding of job description
    resume_data: list of dicts
    [
        {
            "id": "1",
            "embedding": [...],
            "text": "resume text"
        }
    ]
    """

    ranked_results = []

    for resume in resume_data:
        score = cosine_similarity(jd_vector, resume["embedding"])

        ranked_results.append({
            "resume_id": resume["id"],
            "score": round(score * 100, 2),
            "resume_text": resume["text"]
        })

    # sort by score (high → low)
    ranked_results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return ranked_results
