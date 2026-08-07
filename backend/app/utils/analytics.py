"""
Analytics Utilities - Generate dataset analytics and comparisons
"""

import numpy as np
import pandas as pd


# Helper function to clean NaN/Inf values for JSON serialization
def clean_json(obj):
    if isinstance(obj, dict):
        return {k: clean_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [clean_json(x) for x in obj]
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (float, np.float64, np.float32)) and (np.isinf(obj) or np.isnan(obj)):
        return None
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.float64, np.float32, float)):
        # Ensure it's not nan or inf after cast
        val = float(obj)
        if np.isnan(val) or np.isinf(val):
            return None
        return val
    return obj


def generate_analytics(df: pd.DataFrame) -> dict:
    """Generate comprehensive analytics for a dataframe."""
    total_rows, total_cols = df.shape
    missing_cells = int(df.isnull().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    # Missing values per column
    missing_per_col = df.isnull().sum().to_dict()
    missing_per_col = {k: int(v) for k, v in missing_per_col.items()}

    # Missing percentage per column
    missing_pct = {k: round(v / total_rows * 100, 2) for k, v in missing_per_col.items()}

    # Data types
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}

    # Memory usage
    memory_usage = round(df.memory_usage(deep=True).sum() / 1024, 2)  # KB

    # Statistical summary for numeric columns
    stats = {}
    for col in numeric_cols:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            stats[col] = {
                "mean": round(float(col_data.mean()), 2),
                "median": round(float(col_data.median()), 2),
                "mode": round(float(col_data.mode().iloc[0]), 2) if len(col_data.mode()) > 0 else None,
                "std": round(float(col_data.std()), 2),
                "min": round(float(col_data.min()), 2),
                "max": round(float(col_data.max()), 2),
                "q25": round(float(col_data.quantile(0.25)), 2),
                "q75": round(float(col_data.quantile(0.75)), 2),
                "missing_pct": round(float(df[col].isnull().sum() / total_rows * 100), 2),
            }

    # Correlation matrix for numeric columns
    correlation = {}
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr()
        correlation = {
            "columns": numeric_cols,
            "values": corr_matrix.round(2).values.tolist(),
        }

    # Missing value heatmap data
    missing_heatmap = {}
    cols_with_missing = [c for c in df.columns if df[c].isnull().any()]
    if cols_with_missing:
        sample_size = min(50, total_rows)
        sample_indices = np.linspace(0, total_rows - 1, sample_size, dtype=int)
        heatmap_data = df.iloc[sample_indices][cols_with_missing].isnull().astype(int)
        missing_heatmap = {
            "columns": cols_with_missing,
            "data": heatmap_data.values.tolist(),
            "row_indices": sample_indices.tolist(),
        }

    # Histogram data for numeric columns
    histograms = {}
    for col in numeric_cols[:10]:  # Limit to first 10
        col_data = df[col].dropna()
        if len(col_data) > 0:
            counts, bin_edges = np.histogram(col_data, bins=20)
            histograms[col] = {
                "counts": counts.tolist(),
                "bins": [round(float(b), 2) for b in bin_edges.tolist()],
            }

    # Boxplot data for numeric columns
    boxplots = {}
    for col in numeric_cols[:10]:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            q1 = float(col_data.quantile(0.25))
            q3 = float(col_data.quantile(0.75))
            iqr = q3 - q1
            whisker_low = float(col_data[col_data >= q1 - 1.5 * iqr].min())
            whisker_high = float(col_data[col_data <= q3 + 1.5 * iqr].max())
            outliers = col_data[(col_data < q1 - 1.5 * iqr) | (col_data > q3 + 1.5 * iqr)].tolist()

            boxplots[col] = {
                "min": whisker_low,
                "q1": round(q1, 2),
                "median": round(float(col_data.median()), 2),
                "q3": round(q3, 2),
                "max": whisker_high,
                "outliers": [round(float(o), 2) for o in outliers[:50]],
            }

    # Data type distribution for pie chart
    dtype_distribution = {
        "Numeric": len(numeric_cols),
        "Categorical": len(categorical_cols),
    }

    # Dataset preview (first 20 rows)
    preview_data = df.head(20).where(pd.notnull(df.head(20)), None).values.tolist()

    result = {
        "total_rows": total_rows,
        "total_cols": total_cols,
        "missing_cells": missing_cells,
        "missing_percentage": round(missing_cells / (total_rows * total_cols) * 100, 2) if total_rows * total_cols > 0 else 0,
        "duplicate_rows": duplicate_rows,
        "numeric_cols": numeric_cols,
        "categorical_cols": categorical_cols,
        "num_numeric": len(numeric_cols),
        "num_categorical": len(categorical_cols),
        "missing_per_col": missing_per_col,
        "missing_pct_per_col": missing_pct,
        "dtypes": dtypes,
        "memory_usage_kb": memory_usage,
        "stats": stats,
        "correlation": correlation,
        "missing_heatmap": missing_heatmap,
        "histograms": histograms,
        "boxplots": boxplots,
        "dtype_distribution": dtype_distribution,
        "preview": {
            "columns": list(df.columns),
            "data": preview_data,
        },
    }

    return clean_json(result)


def generate_comparison(df_before: pd.DataFrame, df_after: pd.DataFrame) -> dict:
    """Generate a comparison between original and imputed datasets."""
    numeric_cols = df_before.select_dtypes(include=[np.number]).columns.tolist()

    comparison = {
        "missing_before": int(df_before.isnull().sum().sum()),
        "missing_after": int(df_after.isnull().sum().sum()),
        "columns": {},
    }

    for col in numeric_cols:
        before_data = df_before[col].dropna()
        after_data = df_after[col].dropna()

        if len(before_data) > 0 and len(after_data) > 0:
            comparison["columns"][col] = {
                "mean_before": round(float(before_data.mean()), 4),
                "mean_after": round(float(after_data.mean()), 4),
                "median_before": round(float(before_data.median()), 4),
                "median_after": round(float(after_data.median()), 4),
                "std_before": round(float(before_data.std()), 4),
                "std_after": round(float(after_data.std()), 4),
                "missing_before": int(df_before[col].isnull().sum()),
                "missing_after": int(df_after[col].isnull().sum()),
            }

    # Per-column missing value comparison
    missing_comparison = {}
    for col in df_before.columns:
        missing_comparison[col] = {
            "before": int(df_before[col].isnull().sum()),
            "after": int(df_after[col].isnull().sum()),
        }
    comparison["missing_comparison"] = missing_comparison

    return clean_json(comparison)
