import uvicorn
import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from database import engine, Base, SessionLocal
from routers import auth as auth_routes, seo as seo_routes, admin as admin_routes, payment as payment_routes
from core.config import settings
from models.user import User
from core.security import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Seed default admin user automatically
def init_db():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            new_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                role="admin",
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print("Default admin user created successfully with password 'admin'.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        db.close()

init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix=settings.API_PREFIX)
app.include_router(seo_routes.router, prefix=settings.API_PREFIX)
app.include_router(admin_routes.router, prefix=settings.API_PREFIX)
app.include_router(payment_routes.router, prefix=settings.API_PREFIX)

@app.get("/health")
def health():
    return {"status": "healthy"}

# Determine base path (works for dev and PyInstaller .exe)
if getattr(sys, 'frozen', False):
    base_path = os.path.dirname(sys.executable)
else:
    base_path = os.path.dirname(os.path.abspath(__file__))

dist_path = os.path.join(base_path, "dist")

if os.path.exists(dist_path):
    print(f"Serving frontend from {dist_path}")
    
    # Serve assets at "/opencode/seo-assistant/frontend" to match Vite's base path
    app.mount("/opencode/seo-assistant/frontend", StaticFiles(directory=dist_path, html=True), name="frontend")
    
    # Catch-all route to serve index.html for React Router
    @app.get("/opencode/seo-assistant/frontend/{path:path}")
    def serve_frontend(path: str):
        return FileResponse(os.path.join(dist_path, "index.html"))
        
    # Redirect root to the frontend
    @app.get("/")
    def root():
        return RedirectResponse(url="/opencode/seo-assistant/frontend/")
else:
    print("Static dist folder not found. Serving default API root.")
    @app.get("/")
    def root():
        return {"message": "Welcome to SEO Assistant API", "status": "online"}

if __name__ == "__main__":
    if getattr(sys, 'frozen', False):
        uvicorn.run(app, host="0.0.0.0", port=8000)
    else:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
