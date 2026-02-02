from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key="pcsk_P1GNo_LjeFqYazjJFMAjgncQxEsX46xEUyTcVEhbymVPCTnyo44sVAsPnqmzf548pQy7", environment="us-east1-aws")

# Create Index
index_name = "text-embedding-3-large"

if not pc.has_index(index_name):
    pc.create_index(
        name=index_name,
        dimension=3074,
        metric="cosine",
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1'
        )
    )

index = pc.Index(index_name)

# Embed data
data = [
    {"id": "vec1", "text": "Apple is a popular fruit known for its sweetness and crisp texture."},
    {"id": "vec2", "text": "The tech company Apple is known for its innovative products like the iPhone."},
    {"id": "vec3", "text": "Many people enjoy eating apples as a healthy snack."},
    {"id": "vec4", "text": "Apple Inc. has revolutionized the tech industry with its sleek designs and user-friendly interfaces."},
    {"id": "vec5", "text": "An apple a day keeps the doctor away, as the saying goes."},
]

import openai 
openai.api_key = "OPENAI_API_KEY" 


def embed(docs: list[str]) -> list[list[float]]:
    res = openai.embeddings.create(
        input=docs,
        model="text-embedding-3-large"
    )
    doc_embeds = [r.embedding for r in res.data] 
    return doc_embeds 


doc_embeds = embed([d["text"] for d in data])

vectors = []
for d, e in zip(data, doc_embeds):
    vectors.append({
        "id": d['id'],
        "values": e,
        "metadata": {'text': d['text']}
    })

index.upsert(
    vectors=vectors,
    namespace="ns1"
)


### Query
query = "Tell me about the tech company known as Apple"

x = embed([query])

results = index.query(
    namespace="ns1",
    vector=x[0],
    top_k=3,
    include_values=False,
    include_metadata=True
)

print(results)