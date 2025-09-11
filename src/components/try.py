from fastapi import HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from query_generation import generate_query, generate_answer_response
import crud
import torch
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import gc
import logging
import re
from llms_metrics import evaluate_agri_advisory
from mistralai_model import generate_advice_answer_response
from datetime import datetime, timedelta
from getting_stgae import extract_crop_stage
import pandas as pd
from datetime import datetime

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# === Clear GPU memory safely ===
gc.collect()
if torch.cuda.is_available():
    torch.cuda.empty_cache()

# === Load Encoder Model ===
encoder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# === Setup Qdrant Client ===
qdrant_client = QdrantClient("http://localhost:6333")                                     
# === Load Advisory DBs (once at startup) ===


def get_advice(data: dict, db: Session):
    crop = data.get("crop")
    # stage = data.get("stage")
    location = data.get("location")
    date = data.get("date")
    village_name = data.get("village")
    print("date ................................:",date)
    print("village_name ................................:",village_name)

    if not crop or not village_name or not date:
        raise HTTPException(status_code=400, detail="Missing required fields")

    # # --- Extract village code ---
    # try:
    #     location_codes = [int(code.strip()) for code in location.split(",") if code.strip().isdigit()]
    #     village_code = location_codes[-1]
    #     data["village_code"] = village_code
    # except Exception as e:
    #     raise HTTPException(status_code=400, detail=f"Invalid village ID(s): {str(e)}")

    # village_name = crud.get_village_name_by_code(db, village_code)
    print("asdfghjkloiuytrdfxcvbjhfx vbnmn       ...............................................................?")
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    stage = extract_crop_stage(village_name, date_obj.strftime("%Y-%m-%d"))
    # stage = get_adjusted_crop_stage(village_name_2, date._2)

    print("stage ................................:,", stage)


    # --- Generate Query ---
    print("22222222222222222222222222222222222,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,?")
    try:
        query_response = generate_query(data, db)
    except Exception as e:
        logger.error("Error in generate_query")
        raise HTTPException(status_code=500, detail=f"Query generation failed: {str(e)}")

    generated_questions = query_response.get("generated_questions", [])
    latitude = query_response.get("latitude")
    longitude = query_response.get("longitude")
    weather_data = query_response.get("weather_data")
    crop = query_response.get("crop")
    # stage = query_response.get("stage") or stage   # prefer ML pipeline stage, else extracted
    

    # --- Extract Weather Forecast ---
    forecast_list = weather_data.get("Forecast data") or []
    matched_day_data = next(
        (entry for entry in forecast_list if str(entry.get("Date_time", "")).startswith(str(date))),
        None
    )

    if not matched_day_data:
        raise HTTPException(status_code=404, detail=f"No forecast found for date {date}")

    weather_data_specific = matched_day_data
    logger.info(f"Weather data for {date}: {weather_data_specific}")
    
    # weather_data_specific = {
    # "Date_time": "2025-08-19T00:00:00",
    # "Rainfall": 6.0,
    # "Tmax": 37.0,
    # "Tmin": 28.0,
    # "RH": 83.0,
    # "Wind_Speed": 10.0,
    # "Wind_Direction": 242.0,
    # "SunSD": 5.0
    # }
    

    # --- Qdrant Search ---
    # def search_qdrant_all_collections(query_text, top_k=5, threshold=0.5):
    #     if torch.cuda.is_available():
    #         torch.cuda.empty_cache()
    #     vector = encoder.encode(query_text).tolist()
    #     matched_results = []

    #     try:
    #         collections = qdrant_client.get_collections().collections
    #     except Exception as e:
    #         logger.error(f"Failed to fetch Qdrant collections: {e}")
    #         return None

    #     for col in collections:
    #         try:
    #             results = qdrant_client.search(
    #                 collection_name=col.name,
    #                 query_vector=vector,
    #                 limit=top_k
    #             )
    #             if results and len(results) > 0 and results[0].score >= threshold:
    #                 matched_results.append({
    #                     "collection": col.name,
    #                     "score": results[0].score,
    #                     "text": results[0].payload.get("text", "No text found")
    #                 })
    #         except Exception as e:
    #             logger.warning(f"Skipping collection {col.name} due to error: {e}")
    #             continue

    #     if matched_results:
    #         best = sorted(matched_results, key=lambda x: x["score"], reverse=True)[0]
    #         return f"Answer: {best['text']}\n\n[Found in collection: {best['collection']} | Score: {best['score']:.3f}]"
    #     return None



    def search_qdrant_all_collections(query_text, crop=None, stage=None, top_k=5, threshold=0.5):
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        vector = encoder.encode(query_text).tolist()
        matched_results = []

        try:
            collections = qdrant_client.get_collections().collections
        except Exception as e:
            logger.error(f"Failed to fetch Qdrant collections: {e}")
            return None

        # Build filter dynamically
        filters = {"must": []}
        if crop:
            filters["must"].append({"key": "crop", "match": {"value": crop}})
        if stage:
            filters["must"].append({"key": "crop_stage", "match": {"value": stage}})
        
        for col in collections:
            try:
                results = qdrant_client.search(
                collection_name=col.name,
                query_vector=vector,
                limit=top_k,
                filter=filters if filters["must"] else None   # only apply if filter is set
            )
                if results and len(results) > 0 and results[0].score >= threshold:
                    matched_results.append({
                    "collection": col.name,
                    "score": results[0].score,
                    "text": results[0].payload.get("text", "No text found"),
                    "crop": results[0].payload.get("crop", "Unknown"),
                    "stage": results[0].payload.get("crop_stage", "Unknown")
                })
            except Exception as e:
                logger.warning(f"Skipping collection {col.name} due to error: {e}")
                continue

        if matched_results:
            best = sorted(matched_results, key=lambda x: x["score"], reverse=True)[0]
            return (
            f"Answer: {best['text']}\n\n"
            f"[Crop: {best['crop']} | Stage: {best['stage']} | "
            f"Collection: {best['collection']} | Score: {best['score']:.3f}]"
           )
        return None

    # ================== MAIN LOGIC ==================
    all_advice = []
    final_advice_2 = None
    query_text = " ".join(generated_questions) if isinstance(generated_questions, list) else str(generated_questions)

    if any(keyword in crop.lower() for keyword in ["Rice", "Paddy","rice","paddy"]):
        context_text = search_qdrant_all_collections(query_text,crop, stage)
        print("context_text : ", context_text)
        final_advice_2 = context_text or "Answer: No relevant advisories found in database."
    else:
        instruction_block = """
        You are an agriculture assistant. Your response must be in English only.

        ### Instructions:
        - Read the question carefully.
        - Use the crop details, crop stage, weather details, and any context provided to generate your answer.
        - Include specific recommendations (fertilizer, irrigation, pest control) based on crop condition & forecast.
        - Avoid technical jargon. Keep it farmer-friendly.
        - ONLY return the final answer, starting with **Answer:**.
        """

        prompt_2 = f"""{instruction_block}

        ### Input Data:
        Question: {query_text}
        Crop Details: {crop}
        Crop Stage: {stage}
        Weather Details: {weather_data_specific}

        Now provide the answer:
        """

        try:
            final_advice_2 = generate_advice_answer_response(prompt_2)
        except Exception as e:
            print(f"Error generating advice: {e}")
            final_advice_2 = "Answer: Unable to generate advisory at this time."

    # --- Extract clean answer ---
    reference_answer = '''As a farmer from Jabapadar, I am growing Rice which is currently in the Heading stage as of 2025-08-19. The latest weather report for my area shows: Date time: 2025-08-19T00:00:00. Rainfall: 3.15. Tmin: 20.89. Tmax: 24.09. RH: 94.93. Wind Speed: 3.69. Wind Direction: 207.43. SunSD: 4.14. Lowcloud: 0.98. Soilm10: 0.35. Soilm40: 0.36. Soilt10: 22.93. RH max: 97.83. RH min: 89.95. Wind max: 5.27. Based on these details, please provide me with a complete agricultural advisory in paragraph form. The advice should cover crop care, pest and disease management, irrigation, fertilizer usage'''
    extracted_advice = None
    match = re.search(r"(Answer:[\s\S]*)", final_advice_2)
    if match:
        extracted_advice = match.group(1).strip()
    else:
        extracted_advice = final_advice_2.strip() if final_advice_2 else "No advisory found."

    evaluation_scores = evaluate_agri_advisory(
        reference_answer,
        extracted_advice,
        crop=crop,
        stage=stage,
        weather=weather_data_specific
    )
    print("\nevaluation_scores : \n", evaluation_scores)

    advice_result = {
        "question": query_text,
        "advice": extracted_advice
    }
    all_advice.append(advice_result)

    # --- Final Response ---
    return JSONResponse(content={
        "generated_questions": generated_questions,
        "crop": crop,
        "stage": stage,
        "location": location,
        "date": date,
        "latitude": latitude,
        "longitude": longitude,
        "village_name": village_name,
        "weather_data": weather_data_specific,
        "advice_list": all_advice
    })
