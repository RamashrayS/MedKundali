import os
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Check if valid credentials are provided
is_supabase_ready = False
supabase_client = None

if SUPABASE_URL and SUPABASE_KEY and "placeholder-project" not in SUPABASE_URL:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        is_supabase_ready = True
    except Exception as e:
        print(f"Failed to initialize real Supabase storage: {e}. Falling back to local storage.")

# Set up local storage backup directories
LOCAL_STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "uploads"))
os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)

def upload_file(file_content: bytes, file_name: str, bucket_name: str = "reports") -> str:
    """
    Uploads file content to Supabase Storage if configured.
    Otherwise, saves it locally in the backend/storage/uploads directory and returns a local URL.
    """
    # Create a unique filename to prevent collisions
    unique_id = uuid.uuid4().hex
    safe_name = f"{unique_id}_{file_name.replace(' ', '_')}"

    if is_supabase_ready and supabase_client:
        try:
            # Upload file content bytes
            response = supabase_client.storage.from_(bucket_name).upload(
                path=safe_name,
                file=file_content,
                file_options={"content-type": "application/octet-stream"}
            )
            # Retrieve public URL
            public_url = supabase_client.storage.from_(bucket_name).get_public_url(safe_name)
            return public_url
        except Exception as e:
            print(f"Supabase upload failed: {e}. Falling back to local storage.")

    # FALLBACK: Store locally
    local_path = os.path.join(LOCAL_STORAGE_DIR, safe_name)
    with open(local_path, "wb") as f:
        f.write(file_content)
    
    # Return local serving endpoint URL
    return f"/static/uploads/{safe_name}"
