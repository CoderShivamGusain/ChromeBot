import os
import uuid
import asyncio
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
session_stores = {}

def clear_session_history(session_id: str) -> bool:
    if session_id in session_stores:
        del session_stores[session_id]
        return True
    return False

def get_llm(provider: str, api_key: str, model: str):
    if provider == "openai":
        return ChatOpenAI(api_key=api_key, model=model, streaming=True)
    elif provider == "anthropic":
        return ChatAnthropic(api_key=api_key, model=model, streaming=True)
    elif provider == "gemini":
        return ChatGoogleGenerativeAI(api_key=api_key, model=model, streaming=True)
    else:
        raise ValueError(f"Unknown provider: {provider}")

async def stream_response(provider: str, api_key: str, model: str, system_context: str, user_message: str, session_id: str):
    llm = get_llm(provider, api_key, model)
    
    # Retrieve past interactions for this session
    try:
        def fetch_docs():
            if session_id not in session_stores:
                return []
            retriever = session_stores[session_id].as_retriever(
                search_kwargs={"k": 3}
            )
            return retriever.invoke(user_message)
        
        docs = await asyncio.to_thread(fetch_docs)
        
        # Format the history into the system prompt
        if docs:
            history_str = "\n\nRelevant past conversation context:\n"
            for doc in reversed(docs):
                history_str += f"{doc.page_content}\n"
            system_context += history_str
    except Exception as e:
        print(f"Error retrieving history: {e}")
        
    messages = [
        SystemMessage(content=system_context),
        HumanMessage(content=user_message)
    ]
    
    full_response = ""
    async for chunk in llm.astream(messages):
        full_response += chunk.content
        yield chunk.content
        
    # Save the interaction to the vector store
    try:
        interaction = f"User: {user_message}\nBot: {full_response}"
        def add_docs():
            if session_id not in session_stores:
                session_stores[session_id] = FAISS.from_texts(
                    texts=[interaction],
                    embedding=embeddings,
                    metadatas=[{"session_id": session_id}]
                )
            else:
                session_stores[session_id].add_texts(
                    texts=[interaction],
                    metadatas=[{"session_id": session_id}]
                )
        await asyncio.to_thread(add_docs)
    except Exception as e:
        print(f"Error saving history: {e}")
