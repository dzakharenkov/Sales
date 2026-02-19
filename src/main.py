"""Sale & Distribution System (SDS) application entrypoint."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy.exc import IntegrityError, OperationalError

from src.core.env import validate_runtime_secrets
from src.core.config import settings
from src.core.logging_setup import setup_logging
from src.core.middleware import request_logging_middleware
from src.core.middleware import SecurityHeadersMiddleware
from src.core.rate_limit import InMemoryRateLimiter, RateLimitMiddleware
from src.core.sentry_setup import init_sentry
from src.core.exception_handlers import (
    database_error_handler,
    generic_error_handler,
    http_exception_handler,
    integrity_error_handler,
    validation_exception_handler,
)
from src.database.connection import (
    check_data_integrity,
    cleanup,
    get_schema_info,
    log_pool_status,
    test_connection,
    verify_postgres_max_connections,
)

init_sentry("sales-api")
setup_logging(
    service_name="sales-api",
    log_level=settings.log_level,
    log_file=settings.log_file,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App lifecycle: validate env, check DB, cleanup on shutdown."""
    validate_runtime_secrets()
    logger.info(
        "Starting SDS Application host={} port={} env={}",
        settings.api_host,
        settings.api_port,
        settings.sentry_environment,
    )
    ok = await test_connection()
    if not ok:
        logger.critical("Cannot start without database connection")
        raise RuntimeError("Database connection failed")
    log_pool_status()
    await verify_postgres_max_connections()
    await get_schema_info()
    await check_data_integrity()
    logger.info("Application startup complete")
    yield
    logger.info("Shutting down SDS Application...")
    await cleanup()
    logger.info("Application shutdown complete")


app = FastAPI(
    title="Sale & Distribution System (SDS)",
    description="API for sales and distribution management",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(FastAPIHTTPException, http_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(OperationalError, database_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

app.add_middleware(
    RateLimitMiddleware,
    auth_login_limiter=InMemoryRateLimiter(requests=10, window_seconds=10 * 60),
    authenticated_api_limiter=InMemoryRateLimiter(requests=200, window_seconds=60),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.middleware("http")(request_logging_middleware)

STATIC_DIR = Path(__file__).resolve().parent / "static"


@app.get("/")
async def root():
    return RedirectResponse(url="/login", status_code=302)


@app.get("/login", include_in_schema=False)
async def login_page():
    return FileResponse(STATIC_DIR / "login.html")


@app.get("/app", include_in_schema=False)
async def app_page():
    return FileResponse(STATIC_DIR / "app.html")


app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

from src.api.v1.routers.customer_photos import UPLOAD_DIR

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/photo", StaticFiles(directory=str(UPLOAD_DIR)), name="photo")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse(STATIC_DIR / "favicon.png", media_type="image/png")


@app.get("/health")
async def health():
    return {"status": "ok"}


from src.api.v1.routers import (
    auth,
    customer_photos,
    customers,
    dictionary,
    finances,
    menu,
    operations,
    operations_flow,
    orders,
    reports,
    stock,
    users,
    visits,
    warehouse,
)

app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(menu.router, prefix="/api/v1", tags=["menu"])
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
