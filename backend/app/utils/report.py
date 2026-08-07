"""
PDF Report Generator
"""

import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.units import inch
import pandas as pd
import numpy as np


def generate_pdf_report(df_original: pd.DataFrame, df_imputed: pd.DataFrame, all_metrics: dict) -> bytes:
    """Generate a comprehensive PDF analytics report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=24,
        spaceAfter=20,
        textColor=colors.HexColor("#6366f1"),
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=16,
        spaceAfter=12,
        textColor=colors.HexColor("#1e1b4b"),
    )
    body_style = styles["Normal"]

    elements = []

    # Title
    elements.append(Paragraph("Imputation Dashboard - Analytics Report", title_style))
    elements.append(Spacer(1, 20))

    # Dataset Overview
    elements.append(Paragraph("Dataset Overview", heading_style))
    overview_data = [
        ["Metric", "Value"],
        ["Total Rows", str(df_original.shape[0])],
        ["Total Columns", str(df_original.shape[1])],
        ["Missing Cells (Before)", str(df_original.isnull().sum().sum())],
        ["Missing Cells (After)", str(df_imputed.isnull().sum().sum())],
        ["Duplicate Rows", str(df_original.duplicated().sum())],
        ["Numeric Columns", str(len(df_original.select_dtypes(include=[np.number]).columns))],
        ["Categorical Columns", str(len(df_original.select_dtypes(include=["object"]).columns))],
    ]

    table = Table(overview_data, colWidths=[3 * inch, 3 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6366f1")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f0f0ff")),
        ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f0ff")]),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 30))

    # Missing Values per Column
    elements.append(Paragraph("Missing Values Per Column", heading_style))
    missing_data = [["Column", "Missing (Before)", "Missing (After)", "Missing %"]]
    for col in df_original.columns:
        missing_before = df_original[col].isnull().sum()
        missing_after = df_imputed[col].isnull().sum()
        pct = round(missing_before / len(df_original) * 100, 2)
        if missing_before > 0:
            missing_data.append([col, str(missing_before), str(missing_after), f"{pct}%"])

    if len(missing_data) > 1:
        table = Table(missing_data, colWidths=[2 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6366f1")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f0ff")]),
        ]))
        elements.append(table)
    elements.append(Spacer(1, 30))

    # Imputation Results
    if all_metrics:
        elements.append(PageBreak())
        elements.append(Paragraph("Imputation Results Comparison", heading_style))
        results_data = [["Method", "RMSE", "MAE", "R² Score", "Time (s)"]]
        for method, metrics in all_metrics.items():
            results_data.append([
                metrics.get("method", method),
                f"{metrics.get('rmse', 'N/A'):.4f}" if isinstance(metrics.get('rmse'), (int, float)) else "N/A",
                f"{metrics.get('mae', 'N/A'):.4f}" if isinstance(metrics.get('mae'), (int, float)) else "N/A",
                f"{metrics.get('r2', 'N/A'):.4f}" if isinstance(metrics.get('r2'), (int, float)) else "N/A",
                f"{metrics.get('execution_time', 'N/A'):.3f}" if isinstance(metrics.get('execution_time'), (int, float)) else "N/A",
            ])

        table = Table(results_data, colWidths=[1.5 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch, 1.2 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6366f1")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f0ff")]),
        ]))
        elements.append(table)

    # Statistical Summary
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("Statistical Summary (After Imputation)", heading_style))

    numeric_cols = df_imputed.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        stat_data = [["Feature", "Mean", "Median", "Std Dev", "Min", "Max"]]
        for col in numeric_cols[:15]:
            col_data = df_imputed[col]
            stat_data.append([
                col[:20],
                f"{col_data.mean():.2f}",
                f"{col_data.median():.2f}",
                f"{col_data.std():.2f}",
                f"{col_data.min():.2f}",
                f"{col_data.max():.2f}",
            ])

        table = Table(stat_data, colWidths=[1.5 * inch, 1 * inch, 1 * inch, 1 * inch, 1 * inch, 1 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6366f1")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f0ff")]),
        ]))
        elements.append(table)

    # Footer
    elements.append(Spacer(1, 40))
    elements.append(Paragraph(
        "Generated by Imputation Dashboard — Smart Missing Value Analysis & Data Imputation Platform",
        ParagraphStyle("Footer", parent=body_style, fontSize=10, textColor=colors.gray),
    ))

    doc.build(elements)
    return buffer.getvalue()
