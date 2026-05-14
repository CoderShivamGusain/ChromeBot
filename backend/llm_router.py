import os
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

def get_llm(provider: str, api_key: str, model: str):
    if provider == "openai":
        return ChatOpenAI(api_key=api_key, model=model, streaming=True)
    elif provider == "anthropic":
        return ChatAnthropic(api_key=api_key, model=model, streaming=True)
    elif provider == "gemini":
        return ChatGoogleGenerativeAI(api_key=api_key, model=model, streaming=True)
    else:
        raise ValueError(f"Unknown provider: {provider}")

async def stream_response(provider: str, api_key: str, model: str, system_context: str, user_message: str):
    llm = get_llm(provider, api_key, model)
    messages = [
        SystemMessage(content=system_context),
        HumanMessage(content=user_message)
    ]
    async for chunk in llm.astream(messages):
        yield chunk.content
