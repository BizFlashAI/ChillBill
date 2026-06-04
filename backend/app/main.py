from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import bills, insights, reminders

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ChillBill API",
    description="Personal finance bill management API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bills.router)
app.include_router(reminders.router)
app.include_router(insights.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": "ChillBill"}
