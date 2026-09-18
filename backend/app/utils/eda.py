"""
EDA Utilities - Comprehensive Dataset Analytics (General Purpose)
Covers: overview, types, descriptive stats, distributions, correlations,
outliers, cardinality, value counts, skewness/kurtosis.
Does NOT cover missing value analysis.
"""

import numpy as np
import pandas as pd
from app.utils.analytics import clean_json


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def _classify_col(series: pd.Series) -> str:
    """Return a friendly column role label."""
    if pd.api.types.is_bool_dtype(series):
        return "Boolean"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "DateTime"
    if pd.api.types.is_numeric_dtype(series):
        nu = series.nunique(dropna=True)
        if nu <= 2:
            return "Binary Numeric"
        if nu <= 20:
            return "Discrete Numeric"
        return "Continuous Numeric"
    nu = series.nunique(dropna=True)
    if nu <= 20:
        return "Low-Cardinality Categorical"
    if nu > series.dropna().shape[0] * 0.9:
        return "High-Cardinality / ID-like"
    return "Categorical"


def _iqr_outliers(series: pd.Series):
    """Return count of IQR-based outliers."""
    s = series.dropna()
    if len(s) < 4:
        return 0
    q1, q3 = float(s.quantile(0.25)), float(s.quantile(0.75))
    iqr = q3 - q1
    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return int(((s < lo) | (s > hi)).sum())


# ─────────────────────────────────────────────────────────────
# Main Generator
# ─────────────────────────────────────────────────────────────

def generate_eda(df: pd.DataFrame) -> dict:
    """
    Generate comprehensive Exploratory Data Analysis for ANY tabular dataset.
    Nothing here is specific to a dataset - all computed dynamically.
    """
    total_rows, total_cols = df.shape
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols     = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    dt_cols      = df.select_dtypes(include=["datetime64"]).columns.tolist()

    # 1. Overview
    duplicate_rows = int(df.duplicated().sum())
    overview = {
        "total_rows":             total_rows,
        "total_cols":             total_cols,
        "total_cells":            total_rows * total_cols,
        "numeric_features":       len(numeric_cols),
        "categorical_features":   len(cat_cols),
        "datetime_features":      len(dt_cols),
        "duplicate_rows":         duplicate_rows,
        "duplicate_pct":          round(duplicate_rows / total_rows * 100, 2) if total_rows > 0 else 0,
        "memory_bytes":           int(df.memory_usage(deep=True).sum()),
    }

    # 2. Column Profiles
    column_profiles = []
    for col in df.columns:
        s = df[col]
        obs = int(s.dropna().shape[0])
        role = _classify_col(s)
        profile: dict = {
            "feature":    col,
            "dtype":      str(s.dtype),
            "role":       role,
            "observed":   obs,
            "unique":     int(s.nunique(dropna=True)),
            "unique_pct": round(int(s.nunique(dropna=True)) / obs * 100, 1) if obs > 0 else 0,
        }

        if pd.api.types.is_numeric_dtype(s) and not pd.api.types.is_bool_dtype(s):
            sd = s.dropna()
            profile.update({
                "mean":     round(float(sd.mean()), 4)    if len(sd) > 0 else None,
                "median":   round(float(sd.median()), 4)  if len(sd) > 0 else None,
                "std":      round(float(sd.std()), 4)     if len(sd) > 1 else None,
                "min":      round(float(sd.min()), 4)     if len(sd) > 0 else None,
                "max":      round(float(sd.max()), 4)     if len(sd) > 0 else None,
                "q1":       round(float(sd.quantile(0.25)), 4) if len(sd) > 0 else None,
                "q3":       round(float(sd.quantile(0.75)), 4) if len(sd) > 0 else None,
                "skewness": round(float(sd.skew()), 4)    if len(sd) > 2 else None,
                "kurtosis": round(float(sd.kurtosis()), 4) if len(sd) > 3 else None,
                "outliers": _iqr_outliers(s),
            })
        elif not pd.api.types.is_datetime64_any_dtype(s):
            top_vals = s.dropna().value_counts().head(5)
            profile["top_values"] = [
                {"value": str(v), "count": int(c), "pct": round(c / obs * 100, 1) if obs > 0 else 0}
                for v, c in top_vals.items()
            ]

        column_profiles.append(profile)

    # 3. Descriptive Stats (numeric only)
    descriptive_stats = []
    for col in numeric_cols:
        s = df[col].dropna()
        if len(s) == 0:
            continue
        descriptive_stats.append({
            "feature":     col,
            "count":       int(len(s)),
            "mean":        round(float(s.mean()), 4),
            "std":         round(float(s.std()), 4) if len(s) > 1 else None,
            "min":         round(float(s.min()), 4),
            "p25":         round(float(s.quantile(0.25)), 4),
            "p50":         round(float(s.median()), 4),
            "p75":         round(float(s.quantile(0.75)), 4),
            "max":         round(float(s.max()), 4),
            "range":       round(float(s.max() - s.min()), 4),
            "iqr":         round(float(s.quantile(0.75) - s.quantile(0.25)), 4),
            "cv":          round(float(s.std() / s.mean() * 100), 2) if s.mean() != 0 and len(s) > 1 else None,
            "skewness":    round(float(s.skew()), 4) if len(s) > 2 else None,
            "kurtosis":    round(float(s.kurtosis()), 4) if len(s) > 3 else None,
            "outliers":    _iqr_outliers(df[col]),
            "outlier_pct": round(_iqr_outliers(df[col]) / len(s) * 100, 2) if len(s) > 0 else 0,
        })

    # 4. Distributions (histograms for numeric cols, capped at 15)
    distributions = []
    for col in numeric_cols[:15]:
        s = df[col].dropna()
        if len(s) < 2:
            continue
        counts, edges = np.histogram(s, bins=min(30, int(np.sqrt(len(s)))))
        distributions.append({
            "feature": col,
            "counts":  counts.tolist(),
            "edges":   [round(float(e), 4) for e in edges.tolist()],
        })

    # 5. Value Counts (categorical cols, capped at 15)
    value_counts = []
    for col in cat_cols[:15]:
        vc = df[col].value_counts(dropna=True).head(10)
        if len(vc) == 0:
            continue
        value_counts.append({
            "feature":      col,
            "values":       [str(v) for v in vc.index.tolist()],
            "counts":       vc.tolist(),
            "total_unique": int(df[col].nunique(dropna=True)),
        })

    # 6. Correlation Matrix (numeric cols)
    correlation = {}
    if len(numeric_cols) >= 2:
        corr_df = df[numeric_cols].dropna(how="all").corr(numeric_only=True)
        cols_for_corr = corr_df.columns.tolist()
        correlation = {
            "columns": cols_for_corr,
            "values":  corr_df.round(3).values.tolist(),
        }

    # 7. Outlier Summary
    outlier_summary = []
    for col in numeric_cols:
        cnt = _iqr_outliers(df[col])
        if cnt > 0:
            obs = int(df[col].dropna().shape[0])
            outlier_summary.append({
                "feature":     col,
                "outliers":    cnt,
                "outlier_pct": round(cnt / obs * 100, 2) if obs > 0 else 0,
            })
    outlier_summary.sort(key=lambda x: x["outlier_pct"], reverse=True)

    # 8. Cardinality Table
    cardinality = []
    for col in df.columns:
        cardinality.append({
            "feature":    col,
            "unique":     int(df[col].nunique(dropna=True)),
            "unique_pct": round(int(df[col].nunique(dropna=True)) / total_rows * 100, 1) if total_rows > 0 else 0,
            "role":       _classify_col(df[col]),
        })
    cardinality.sort(key=lambda x: x["unique_pct"], reverse=True)

    # 9. Skewness & Kurtosis Summary
    skew_kurt = []
    for col in numeric_cols:
        s = df[col].dropna()
        if len(s) < 4:
            continue
        sk = float(s.skew())
        ku = float(s.kurtosis())
        skew_label = (
            "Highly Right-Skewed"      if sk > 1   else
            "Moderately Right-Skewed"  if sk > 0.5 else
            "Highly Left-Skewed"       if sk < -1  else
            "Moderately Left-Skewed"   if sk < -0.5 else
            "Approximately Symmetric"
        )
        kurt_label = (
            "Leptokurtic (Heavy Tails)" if ku > 1 else
            "Platykurtic (Light Tails)" if ku < -1 else
            "Mesokurtic (Normal-like)"
        )
        skew_kurt.append({
            "feature":    col,
            "skewness":   round(sk, 4),
            "kurtosis":   round(ku, 4),
            "skew_label": skew_label,
            "kurt_label": kurt_label,
        })
    skew_kurt.sort(key=lambda x: abs(x["skewness"]), reverse=True)

    # 10. AI Insights
    insights = []
    insights.append(
        f"Dataset contains {total_rows:,} rows and {total_cols} features "
        f"({len(numeric_cols)} numeric, {len(cat_cols)} categorical"
        + (f", {len(dt_cols)} datetime" if dt_cols else "") + ")."
    )
    if duplicate_rows > 0:
        insights.append(
            f"{duplicate_rows:,} duplicate rows detected ({overview['duplicate_pct']}% of total). "
            "Consider deduplication before modeling."
        )
    if outlier_summary:
        top_out = outlier_summary[0]
        insights.append(
            f"Feature '{top_out['feature']}' has the highest outlier rate ({top_out['outlier_pct']}%, "
            f"{top_out['outliers']} rows) based on IQR analysis."
        )
    if skew_kurt:
        highly_skewed = [r for r in skew_kurt if abs(r["skewness"]) > 1]
        if highly_skewed:
            names = ", ".join(f"'{r['feature']}'" for r in highly_skewed[:3])
            insights.append(
                f"{len(highly_skewed)} feature(s) show high skewness: {names}. "
                "Log or power transforms may improve model performance."
            )
    high_cardinality = [r for r in cardinality if r["role"] == "High-Cardinality / ID-like"]
    if high_cardinality:
        names = ", ".join(f"'{r['feature']}'" for r in high_cardinality[:3])
        insights.append(
            f"Feature(s) {names} appear to be near-unique identifiers. "
            "These are usually unsuitable as predictors."
        )
    if correlation and len(numeric_cols) >= 2:
        cols_c = correlation["columns"]
        vals_c = np.array(correlation["values"])
        np.fill_diagonal(vals_c, np.nan)
        if not np.all(np.isnan(vals_c)):
            max_idx = np.unravel_index(np.nanargmax(np.abs(vals_c)), vals_c.shape)
            max_corr = vals_c[max_idx]
            if abs(max_corr) > 0.8:
                insights.append(
                    f"Strong correlation ({max_corr:.2f}) detected between "
                    f"'{cols_c[max_idx[0]]}' and '{cols_c[max_idx[1]]}'. "
                    "Consider checking for multicollinearity."
                )

    result = {
        "overview":          overview,
        "column_profiles":   column_profiles,
        "descriptive_stats": descriptive_stats,
        "distributions":     distributions,
        "value_counts":      value_counts,
        "correlation":       correlation,
        "outlier_summary":   outlier_summary,
        "cardinality":       cardinality,
        "skew_kurt":         skew_kurt,
        "insights":          insights,
    }

    return clean_json(result)
