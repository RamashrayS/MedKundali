import io
import pdfplumber

def extract_text_from_bytes(file_content: bytes, file_name: str) -> str:
    """
    Extracts text from clinical PDFs using pdfplumber.
    For images, returns a marker so that Gemini's multimodal visual engine processes it.
    """
    ext = file_name.split(".")[-1].lower()
    
    if ext == "pdf":
        try:
            extracted_text = []
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text.append(text)
            return "\n".join(extracted_text).strip()
        except Exception as e:
            print(f"pdfplumber failed to parse PDF: {e}")
            return "[scanned_or_encrypted_pdf]"
            
    elif ext in ["png", "jpg", "jpeg"]:
        # Mark as scanned photo to trigger multimodal Gemini processing
        return "[scanned_image_binary_marker]"
        
    return ""
