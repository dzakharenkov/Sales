"""
Sale & Distribution System (SDS). Точка входа. Запуск: uvicorn src.main:app --reload
"""
import logging
import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles

from src.database.connection import (
    test_connection,
    get_schema_info,
    check_data_integrity,
    cleanup,
)

# Уровень логирования: задаётся через LOG_LEVEL (INFO, WARNING, ERROR).
# Для разработки: set LOG_LEVEL=WARNING — в консоль пойдут только предупреждения и ошибки.
_LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
_level = getattr(logging, _LOG_LEVEL, logging.INFO)
logging.basicConfig(
    level=_level,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Жизненный цикл приложения: старт — проверка БД, стоп — закрытие пула."""
    logger.info("Starting SDS Application...")
    ok = await test_connection()
    if not ok:
        logger.critical("Cannot start without database connection")
        raise RuntimeError("Database connection failed")
    await get_schema_info()
    await check_data_integrity()
    logger.info("Application startup complete")
    yield
    logger.info("Shutting down SDS Application...")
    await cleanup()
    logger.info("Application shutdown complete")


app = FastAPI(
    title="Sale & Distribution System (SDS)",
    description="API для управления продажами и дистрибуцией",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Папка с страницами входа и приложения
STATIC_DIR = Path(__file__).resolve().parent / "static"


@app.get("/")
async def root():
    """Главная — перенаправление на страницу входа."""
    return RedirectResponse(url="/login", status_code=302)


@app.get("/login", include_in_schema=False)
async def login_page():
    """Страница входа: логин и пароль."""
    return FileResponse(STATIC_DIR / "login.html")


@app.get("/app", include_in_schema=False)
async def app_page():
    """Страница после входа (проверка по токену в браузере)."""
    return FileResponse(STATIC_DIR / "app.html")

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Фото: /photo/33_11022026_143045.jpg (ТЗ: photo/ в корне проекта)
from src.api.v1.routers.customer_photos import UPLOAD_DIR
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/photo", StaticFiles(directory=str(UPLOAD_DIR)), name="photo")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Отдаёт иконку приложения (favicon)."""
    return FileResponse(STATIC_DIR / "favicon.png", media_type="image/png")


@app.get("/health")
async def health():
    """Проверка состояния сервиса."""
    return {"status": "ok"}


# Подключение роутеров API v1
from src.api.v1.routers import auth, dictionary, customers, users, orders, operations, operations_flow, stock, warehouse, finances, customer_photos, visits, reports

app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(dictionary.router, prefix="/api/v1/dictionary", tags=["dictionary"])
app.include_router(customers.router, prefix="/api/v1", tags=["customers"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(orders.router, prefix="/api/v1", tags=["orders"])
app.include_router(operations.router, prefix="/api/v1", tags=["operations"])
app.include_router(operations_flow.router, prefix="/api/v1", tags=["operations-flow"])
app.include_router(stock.router, prefix="/api/v1", tags=["stock"])
app.include_router(warehouse.router, prefix="/api/v1/warehouse", tags=["warehouse"])
app.include_router(finances.router, prefix="/api/v1/finances", tags=["finances"])
app.include_router(customer_photos.router, prefix="/api/v1", tags=["customer-photos"])
app.include_router(visits.router, prefix="/api/v1", tags=["visits"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
