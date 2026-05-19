import asyncio
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def test_faiss():
    try:
        print("Initializing embeddings...")
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        print("Initializing FAISS...")
        
        session_id = "test_session_123"
        interaction = "User: Hello\nBot: Hi there!"
        
        print("Adding text...")
        store = FAISS.from_texts(
            texts=[interaction],
            embedding=embeddings,
            metadatas=[{"session_id": session_id}]
        )
        
        print("Retrieving text...")
        results = store.similarity_search("Hello", k=1)
        for r in results:
            print("Found:", r.page_content)
        
        print("Test passed successfully!")
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_faiss()
