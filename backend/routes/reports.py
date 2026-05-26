import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import User, Report, AiSummary
from backend.routes.auth import get_current_user
from backend.services.supabase_service import upload_file
from backend.services.ocr import extract_text_from_bytes
from backend.services.gemini import generate_medical_summary

router = APIRouter(prefix="/reports", tags=["Reports & Timeline"])

@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    report_type: str = Form("Medical Report"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify accepted file formats
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "png", "jpg", "jpeg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Only PDF, PNG, JPG, and JPEG are accepted."
        )
        
    try:
        # Read file contents
        content_bytes = await file.read()
        
        # 1. Upload to storage (Supabase or Local Fallback)
        storage_url = upload_file(content_bytes, file.filename, bucket_name="reports")
        
        # 2. Extract text / OCR
        extracted_text = extract_text_from_bytes(content_bytes, file.filename)
        
        # 3. Generate AI summary using Google Gemini API
        summary_dict = generate_medical_summary(extracted_text, file_content=content_bytes, file_name=file.filename)
        
        # 4. Save report record in PostgreSQL database
        new_report = Report(
            user_id=current_user.id,
            file_name=file.filename,
            storage_url=storage_url,
            report_type=report_type
        )
        db.add(new_report)
        db.flush() # Binds new_report.id
        
        # 5. Save AI Summary record linked to the report
        new_summary = AiSummary(
            report_id=new_report.id,
            summary=json.dumps(summary_dict)
        )
        db.add(new_summary)
        db.commit()
        db.refresh(new_report)
        
        return {
            "status": "success",
            "message": "Report uploaded and summarized successfully",
            "report": {
                "id": new_report.id,
                "file_name": new_report.file_name,
                "storage_url": new_report.storage_url,
                "report_type": new_report.report_type,
                "upload_date": new_report.upload_date,
                "summary": summary_dict
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during upload processing: {str(e)}"
        )

@router.get("")
def list_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.upload_date.desc()).all()
    
    result = []
    for r in reports:
        summary_data = {}
        if r.ai_summary:
            try:
                summary_data = json.loads(r.ai_summary.summary)
            except Exception:
                summary_data = {"error": "Failed to parse summary payload"}
                
        result.append({
            "id": r.id,
            "file_name": r.file_name,
            "storage_url": r.storage_url,
            "report_type": r.report_type,
            "upload_date": r.upload_date,
            "summary": summary_data
        })
    return result

@router.get("/timeline")
def get_timeline(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Dynamically generates clean, sequential health timeline events directly from database records.
    """
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.upload_date.asc()).all()
    
    events = []
    for idx, r in enumerate(reports):
        # 1. Base Upload Event
        events.append({
            "id": f"upload_{r.id}",
            "title": f"{r.report_type} Uploaded",
            "description": f"Successfully parsed and ingested clinical file '{r.file_name}' into secure storage.",
            "timestamp": r.upload_date,
            "type": "upload",
            "icon": "upload"
        })
        
        # 2. AI Summary Generated Event
        if r.ai_summary:
            events.append({
                "id": f"summary_{r.id}",
                "title": "Clinical Summary Compiled",
                "description": "Aarog has finalized the simplified translation, core findings, and suggested follow-ups.",
                "timestamp": r.ai_summary.created_at,
                "type": "summary",
                "icon": "brain"
            })
            
        # 3. Subsequent follow up indicator
        if idx > 0:
            events.append({
                "id": f"followup_{r.id}",
                "title": "Sequential Records Linkage",
                "description": f"New metrics from '{r.file_name}' added to longitudinal health tracking graphs.",
                "timestamp": r.upload_date,
                "type": "linkage",
                "icon": "sparkles"
            })
            
    # Sort chronological descend (newest first)
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    return events

@router.get("/{report_id}")
def get_report_details(report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Medical report not found")
        
    summary_data = {}
    if report.ai_summary:
        try:
            summary_data = json.loads(report.ai_summary.summary)
        except Exception:
            summary_data = {"error": "Failed to parse summary payload"}
            
    return {
        "id": report.id,
        "file_name": report.file_name,
        "storage_url": report.storage_url,
        "report_type": report.report_type,
        "upload_date": report.upload_date,
        "summary": summary_data
    }

@router.post("/summarize")
def trigger_manual_summarization(report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Medical report not found")
        
    # Re-trigger Gemini
    summary_dict = generate_medical_summary(
        extracted_text="Manual request re-eval", 
        file_name=report.file_name
    )
    
    if report.ai_summary:
        report.ai_summary.summary = json.dumps(summary_dict)
    else:
        new_summary = AiSummary(report_id=report.id, summary=json.dumps(summary_dict))
        db.add(new_summary)
        
    db.commit()
    return {"status": "success", "summary": summary_dict}
