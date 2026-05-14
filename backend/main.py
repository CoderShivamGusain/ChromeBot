from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from llm_router import stream_response

app = FastAPI(title="ChromeBot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    page_content: str
    user_message: str
    provider: str
    api_key: str
    model: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not request.api_key:
        raise HTTPException(status_code=400, detail="API Key is required")
        
    system_context = f"You are an AI assistant for a web browser. The user is currently looking at a webpage with the following content:\n\n{request.page_content}\n\nAnswer the user's questions based on this context. If the question is unrelated to the page, just answer it normally but acknowledge you are reading the page."
    
    async def generate():
        async for chunk in stream_response(
            provider=request.provider,
            api_key=request.api_key,
            model=request.model,
            system_context=system_context,
            user_message=request.user_message
        ):
            yield chunk

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
