
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from dotenv import load_dotenv
from google import genai
import os
from pydantic import BaseModel

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
df = pd.read_excel('road_data.xlsx', engine='openpyxl')


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

def get_dataset_info():
    """Get basic information about the dataset"""
    info = f"""
Dataset Information:
- Total Records: {len(df)}
- Columns: {', '.join(df.columns.tolist())}

Sample Statistics:
- Urban accidents: {len(df[df['Urban_or_Rural_Area'] == 'Urban'])}
- Rural accidents: {len(df[df['Urban_or_Rural_Area'] == 'Rural'])} (if any)
- Weather conditions: {df['Weather_Conditions'].value_counts().to_dict()}
- Vehicle types: {df['Vehicle_Type'].value_counts().to_dict()}
- Road types: {df['Road_Type'].value_counts().to_dict()}
"""
    return info

def analyze_data(query: str):
    """Analyze the dataset based on user query"""
    query_lower = query.lower()
    
    try:
        if 'urban' in query_lower and 'accident' in query_lower:
            count = len(df[df['Urban_or_Rural_Area'] == 'Urban'])
            return f"There are {count} accidents in urban areas."
        
        elif 'weather' in query_lower:
            weather_stats = df['Weather_Conditions'].value_counts().to_dict()
            return f"Weather conditions distribution:\n{weather_stats}"
        
        elif 'vehicle' in query_lower or 'car' in query_lower:
            vehicle_stats = df['Vehicle_Type'].value_counts().to_dict()
            return f"Vehicle types involved:\n{vehicle_stats}"
        
        elif 'road' in query_lower and 'surface' in query_lower:
            road_stats = df['Road_Surface_Conditions'].value_counts().to_dict()
            return f"Road surface conditions:\n{road_stats}"
        
        elif 'speed' in query_lower:
            avg_speed = df['Speed_limit'].mean()
            return f"Average speed limit: {avg_speed:.2f} km/h"
        
        elif 'time' in query_lower:
            time_stats = df['Time'].value_counts().head(5).to_dict()
            return f"Most common accident times:\n{time_stats}"
        
        else:
            return None  
            
    except Exception as e:
        return f"Error analyzing data: {str(e)}"

@app.get("/")
def read_root():
    return {"message": "Traffic Data Chatbot API", "status": "running"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        user_message = request.message
        
        data_analysis = analyze_data(user_message)
        
        dataset_info = get_dataset_info()
        
        prompt = f"""You are a helpful traffic data analyst assistant. 
        {dataset_info}
        User Question: {user_message}
        {f"Data Analysis Result: {data_analysis}" if data_analysis else ""}
        Please provide a clear, concise answer about the traffic data. If specific data analysis was provided, explain it in a user-friendly way. If not, provide insights based on the dataset information."""

        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        
        return ChatResponse(response=response.text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.get('/stats')
def get_stats():
    return {
        "total_records": len(df),
        "columns": df.columns.tolist(),
        "urban_accidents": len(df[df['Urban_or_Rural_Area'] == 'Urban']),
        "weather_distribution": df['Weather_Conditions'].value_counts().to_dict(),
        "vehicle_types": df['Vehicle_Type'].value_counts().to_dict()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

