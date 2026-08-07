"""
Imputation Dashboard - FastAPI Backend
Main application entry point
"""

import os
import uuid
import json
import io
import base64
import traceback
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from app.models.imputations import (
    run_knn_imputation,
    run_mice_imputation,
    run_xgboost_imputation,
    run_missforest_imputation,
    run_hybridforest_imputation,
)
from app.utils.analytics import generate_analytics, generate_comparison, clean_json
from app.utils.report import generate_pdf_report

app = FastAPI(
    title="Imputation Dashboard API",
    description="Smart Missing Value Analysis & Data Imputation Platform",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for uploaded datasets and results
datasets: dict = {}
imputed_results: dict = {}


@app.get("/")
def root():
    return {"message": "Imputation Dashboard API is running"}


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a CSV or Excel file and return dataset analysis."""
    try:
        filename = file.filename.lower()
        contents = await file.read()

        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or Excel files.")

        dataset_id = str(uuid.uuid4())[:8]

        # Store the dataset
        datasets[dataset_id] = {
            "filename": file.filename,
            "original": df.copy(),
            "current": df.copy(),
        }

        # Generate analytics
        analytics = generate_analytics(df)

        return clean_json({
            "dataset_id": dataset_id,
            "filename": file.filename,
            "analytics": analytics,
        })

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.get("/api/analytics/{dataset_id}")
def get_analytics(dataset_id: str):
    """Get analytics for a dataset."""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = datasets[dataset_id]["current"]
    filename = datasets[dataset_id]["filename"]
    analytics = generate_analytics(df)
    return clean_json({
        "dataset_id": dataset_id, 
        "filename": filename,
        "analytics": analytics
    })


@app.post("/api/impute/{dataset_id}/{method}")
def impute_dataset(dataset_id: str, method: str):
    """Run imputation on the dataset using the specified method."""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df_original = datasets[dataset_id]["original"].copy()

    if df_original.isnull().sum().sum() == 0:
        raise HTTPException(status_code=400, detail="No missing values found in the dataset.")

    methods = {
        "knn": run_knn_imputation,
        "mice": run_mice_imputation,
        "xgboost": run_xgboost_imputation,
        "missforest": run_missforest_imputation,
        "hybridforest": run_hybridforest_imputation,
    }

    if method not in methods:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown method '{method}'. Available: {list(methods.keys())}",
        )

    try:
        result = methods[method](df_original)
        imputed_df = result["imputed_df"]

        # Store the imputed result
        result_key = f"{dataset_id}_{method}"
        imputed_results[result_key] = {
            "imputed_df": imputed_df,
            "metrics": result["metrics"],
            "method": method,
        }

        # Update current dataset
        datasets[dataset_id]["current"] = imputed_df.copy()

        # Generate comparison
        comparison = generate_comparison(df_original, imputed_df)

        return clean_json({
            "dataset_id": dataset_id,
            "method": method,
            "metrics": result["metrics"],
            "comparison": comparison,
            "analytics_after": generate_analytics(imputed_df),
        })

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Imputation error: {str(e)}")


@app.post("/api/impute-all/{dataset_id}")
def impute_all(dataset_id: str):
    """Run all imputation methods and compare results."""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df_original = datasets[dataset_id]["original"].copy()

    if df_original.isnull().sum().sum() == 0:
        raise HTTPException(status_code=400, detail="No missing values found.")

    methods = {
        "knn": run_knn_imputation,
        "mice": run_mice_imputation,
        "xgboost": run_xgboost_imputation,
        "missforest": run_missforest_imputation,
        "hybridforest": run_hybridforest_imputation,
    }

    results = {}
    for name, func in methods.items():
        try:
            result = func(df_original.copy())
            result_key = f"{dataset_id}_{name}"
            imputed_results[result_key] = {
                "imputed_df": result["imputed_df"],
                "metrics": result["metrics"],
                "method": name,
            }
            results[name] = {
                "metrics": result["metrics"],
                "comparison": generate_comparison(df_original, result["imputed_df"]),
            }
        except Exception as e:
            results[name] = {"error": str(e)}

    # Find best method
    best_method = None
    best_rmse = float("inf")
    for name, res in results.items():
        if "metrics" in res and "rmse" in res["metrics"]:
            if res["metrics"]["rmse"] < best_rmse:
                best_rmse = res["metrics"]["rmse"]
                best_method = name

    return clean_json({
        "dataset_id": dataset_id,
        "results": results,
        "recommended": best_method,
        "insight": f"{best_method} performed best with RMSE of {best_rmse:.4f}"
        if best_method
        else "Unable to determine best method.",
    })


@app.get("/api/comparison/{dataset_id}")
def get_comparison(dataset_id: str):
    """Get comparison data for all imputed results."""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df_original = datasets[dataset_id]["original"]
    comparisons = {}

    for key, val in imputed_results.items():
        if key.startswith(dataset_id):
            method = val["method"]
            comparisons[method] = {
                "metrics": val["metrics"],
                "comparison": generate_comparison(df_original, val["imputed_df"]),
            }

    return {"dataset_id": dataset_id, "comparisons": comparisons}


@app.get("/api/download/{dataset_id}/{format}")
def download_dataset(dataset_id: str, format: str, method: Optional[str] = None):
    """Download the imputed dataset in various formats."""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Get the appropriate dataframe
    if method:
        result_key = f"{dataset_id}_{method}"
        if result_key not in imputed_results:
            raise HTTPException(status_code=404, detail=f"No imputed result for method '{method}'")
        df = imputed_results[result_key]["imputed_df"]
    else:
        df = datasets[dataset_id]["current"]

    if format == "csv":
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        stream.seek(0)
        return StreamingResponse(
            io.BytesIO(stream.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=imputed_data.csv"},
        )
    elif format == "excel":
        stream = io.BytesIO()
        df.to_excel(stream, index=False, engine="openpyxl")
        stream.seek(0)
        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=imputed_data.xlsx"},
        )
    elif format == "pdf":
        df_original = datasets[dataset_id]["original"]

        # Gather metrics for all methods
        all_metrics = {}
        for key, val in imputed_results.items():
            if key.startswith(dataset_id):
                all_metrics[val["method"]] = val["metrics"]

        pdf_bytes = generate_pdf_report(df_original, df, all_metrics)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=analytics_report.pdf"},
        )
    else:
        raise HTTPException(status_code=400, detail="Format must be 'csv', 'excel', or 'pdf'")


@app.get("/api/preview/{dataset_id}")
def preview_dataset(dataset_id: str, rows: int = 20):
    """Get a preview of the dataset."""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = datasets[dataset_id]["current"]
    preview = df.head(rows)

    return clean_json({
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "data": preview.where(pd.notnull(preview), None).values.tolist(),
        "shape": list(df.shape),
    })


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
