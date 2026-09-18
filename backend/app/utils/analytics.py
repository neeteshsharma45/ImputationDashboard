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
    """Generate comprehensive missing value analytics for a dataframe."""
    total_rows, total_cols = df.shape
    missing_mask = df.isnull()
    missing_cells = int(missing_mask.sum().sum())
    missing_percentage = round(missing_cells / (total_rows * total_cols) * 100, 2) if total_rows * total_cols > 0 else 0

    # Affected features
    missing_per_col = missing_mask.sum()
    affected_features = int((missing_per_col > 0).sum())
    
    missing_per_col_dict = {k: int(v) for k, v in missing_per_col.items()}
    missing_pct_per_col = {k: round(v / total_rows * 100, 2) for k, v in missing_per_col_dict.items()}

    # Severity
    if missing_cells == 0:
        severity = "None"
    elif missing_percentage < 5:
        severity = "Low"
    elif missing_percentage < 15:
        severity = "Moderate"
    elif missing_percentage < 30:
        severity = "High"
    else:
        severity = "Critical"

    # Row-wise missingness
    row_missing_counts = missing_mask.sum(axis=1)
    complete_rows = int((row_missing_counts == 0).sum())
    incomplete_rows = total_rows - complete_rows
    
    # Get top 5 most incomplete rows
    most_incomplete = []
    if incomplete_rows > 0:
        top_indices = row_missing_counts.nlargest(5)
        for idx, count in top_indices.items():
            if count > 0:
                most_incomplete.append({
                    "row_index": int(idx),
                    "missing_count": int(count),
                    "missing_pct": round(int(count) / total_cols * 100, 2)
                })

    # Missingness Matrix (Subsampled for Plotly Heatmap)
    sample_size = min(500, total_rows)
    if incomplete_rows > 0 and total_rows > sample_size:
        incomplete_idx = row_missing_counts[row_missing_counts > 0].index
        complete_idx = row_missing_counts[row_missing_counts == 0].index
        
        n_inc = min(250, len(incomplete_idx))
        n_comp = sample_size - n_inc
        
        if n_comp > len(complete_idx):
            n_comp = len(complete_idx)
            n_inc = sample_size - n_comp
            
        sampled_idx = list(np.random.choice(incomplete_idx, n_inc, replace=False)) + \
                      list(np.random.choice(complete_idx, n_comp, replace=False))
        sampled_idx.sort()
    else:
        sampled_idx = np.linspace(0, total_rows - 1, sample_size, dtype=int).tolist()
        
    heatmap_data = missing_mask.iloc[sampled_idx].astype(int)
    missing_matrix = {
        "columns": list(df.columns),
        "data": heatmap_data.values.tolist(),
        "row_indices": [int(x) for x in sampled_idx]
    }

    # Missingness Patterns (Combinations of missing features)
    missing_patterns = []
    if missing_cells > 0:
        cols_with_missing = [c for c in df.columns if missing_per_col[c] > 0]
        if len(cols_with_missing) > 1:
            pattern_counts = missing_mask[cols_with_missing].apply(lambda x: tuple(x), axis=1).value_counts()
            for pattern, count in pattern_counts.head(10).items():
                if any(pattern): # If at least one feature is missing
                    missing_feats = [cols_with_missing[i] for i, is_missing in enumerate(pattern) if is_missing]
                    missing_patterns.append({
                        "features": missing_feats,
                        "count": int(count),
                        "percentage": round(int(count) / total_rows * 100, 2)
                    })

    # Missingness Correlation
    missing_correlation = {}
    cols_with_missing = [c for c in df.columns if missing_per_col[c] > 0]
    if len(cols_with_missing) > 1:
        corr = missing_mask[cols_with_missing].corr().fillna(0)
        missing_correlation = {
            "columns": cols_with_missing,
            "values": corr.round(2).values.tolist()
        }

    # Potential Missing Indicators
    suspicious_values = ["", " ", "NULL", "null", "Null", "NA", "na", "N/A", "n/a", "-1", "0", "?", "none", "None"]
    potential_indicators = []
    for col in df.columns:
        if df[col].dtype == object or df[col].dtype.name == 'category':
            matches = df[col].isin(suspicious_values).sum()
            if matches > 0:
                potential_indicators.append({
                    "feature": col,
                    "value": "string placeholders (NULL, NA, etc.)",
                    "count": int(matches),
                    "percentage": round(int(matches) / total_rows * 100, 2)
                })
        elif np.issubdtype(df[col].dtype, np.number):
            zero_count = (df[col] == 0).sum()
            neg1_count = (df[col] == -1).sum()
            if neg1_count > 0 and neg1_count < total_rows * 0.1:
                 potential_indicators.append({
                    "feature": col,
                    "value": "-1",
                    "count": int(neg1_count),
                    "percentage": round(int(neg1_count) / total_rows * 100, 2)
                })

    potential_indicators = sorted(potential_indicators, key=lambda x: x["count"], reverse=True)

    # Missingness Summary Table
    summary_table = []
    for col in df.columns:
        missing_cnt = missing_per_col_dict[col]
        missing_pct = missing_pct_per_col[col]
        
        status = "Clean"
        if missing_pct > 50:
            status = "Critical"
        elif missing_pct > 20:
            status = "High"
        elif missing_pct > 5:
            status = "Moderate"
        elif missing_pct > 0:
            status = "Low"

        summary_table.append({
            "feature": col,
            "data_type": str(df[col].dtype),
            "missing_count": missing_cnt,
            "missing_percentage": missing_pct,
            "observed_count": total_rows - missing_cnt,
            "status": status
        })

    summary_table = sorted(summary_table, key=lambda x: x["missing_percentage"], reverse=True)

    # AI Missingness Insights
    insights = []
    if missing_cells == 0:
        insights.append("Your dataset is completely clean with no missing values detected.")
        insights.append("No imputation is required. The dataset is ready for downstream machine learning tasks.")
    else:
        insights.append(f"Missingness is present in {affected_features} out of {total_cols} features ({round(affected_features/total_cols*100, 1)}%).")
        
        top_missing_feat = summary_table[0]
        if top_missing_feat["missing_percentage"] > 20:
            insights.append(f"Feature '{top_missing_feat['feature']}' has a significantly high missing rate of {top_missing_feat['missing_percentage']}%. Consider whether imputation or removal is more appropriate.")
        else:
            insights.append(f"The most affected feature is '{top_missing_feat['feature']}' with {top_missing_feat['missing_percentage']}% missing values.")

        if incomplete_rows > total_rows * 0.5:
            insights.append(f"More than half ({round(incomplete_rows/total_rows*100, 1)}%) of the observations contain at least one missing value. Row-wise deletion would result in severe data loss.")
        elif incomplete_rows > 0:
            insights.append(f"Only {round(incomplete_rows/total_rows*100, 1)}% of rows are incomplete. Imputation will help salvage these observations without major distortions.")

        if len(missing_patterns) > 0 and missing_patterns[0]["percentage"] > 5:
            feats_str = ", ".join(missing_patterns[0]["features"])
            insights.append(f"A strong pattern exists where [{feats_str}] are missing simultaneously in {missing_patterns[0]['percentage']}% of rows.")

        if len(potential_indicators) > 0:
            insights.append(f"Detected {len(potential_indicators)} potential placeholder values (like NULL, NA, or -1) which might represent hidden missing data. Please review the Potential Indicators section.")

    result = {
        "overview": {
            "total_rows": total_rows,
            "total_cols": total_cols,
            "total_cells": total_rows * total_cols,
            "missing_cells": missing_cells,
            "missing_percentage": missing_percentage,
            "affected_features": affected_features,
            "severity": severity
        },
        "row_missingness": {
            "complete_rows": complete_rows,
            "incomplete_rows": incomplete_rows,
            "most_incomplete": most_incomplete
        },
        "missing_matrix": missing_matrix,
        "missing_patterns": missing_patterns,
        "missing_correlation": missing_correlation,
        "potential_indicators": potential_indicators,
        "summary_table": summary_table,
        "insights": insights
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
