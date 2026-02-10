"""
Модели SQLAlchemy для схемы Sales. Соответствуют существующим таблицам БД.
"""
from datetime import datetime
from decimal import Decimal
import uuid
import enum

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Numeric,
    Text,
    ForeignKey,
    Date,
    Time,
    TIMESTAMP,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EXPEDITOR = "expeditor"
    AGENT = "agent"
    STOCKMAN = "stockman"
    PAYMASTER = "paymaster"


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "Sales"}

    login = Column(String, primary_key=True)
    fio = Column(String, nullable=False)
    telegram_username = Column(String, nullable=True)
    role = Column(String, nullable=False)  # ENUM в БД — маппим как String
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    password = Column(String, nullable=True)
    last_login_at = Column(TIMESTAMP(timezone=True), nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class ProductType(Base):
    __tablename__ = "product_type"
    __table_args__ = {"schema": "Sales"}

    name = Column(String, primary_key=True)
    description = Column(Text, nullable=False)


class Product(Base):
    __tablename__ = "product"
    __table_args__ = {"schema": "Sales"}

    code = Column(String(50), primary_key=True)
    name = Column(String, nullable=False)
    type_id = Column(String, ForeignKey("Sales.product_type.name"), nullable=True)
    weight_g = Column(Integer, nullable=True)
    unit = Column(String, nullable=True)
    price = Column(Numeric(18, 2), nullable=True)
    expiry_days = Column(Integer, nullable=True)
    active = Column(Boolean, default=True)
    last_updated_by_login = Column(String, ForeignKey("Sales.users.login"), nullable=True)
    last_updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    currency_code = Column(String, ForeignKey("Sales.currency.code"), nullable=True)


class Batch(Base):
    __tablename__ = "batches"
    __table_args__ = {"schema": "Sales"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_code = Column(String(50), ForeignKey("Sales.product.code"), nullable=True)
    batch_code = Column(String(50), nullable=True)
    production_date = Column(Date, nullable=True)
    expiry_days = Column(Integer, nullable=True)
    expiry_date = Column(Date, nullable=True)
    stock_qty = Column(Integer, default=0)
    owner = Column(String(100), nullable=True)


class ProductBatch(Base):
    __tablename__ = "product_batches"
    __table_args__ = {"schema": "Sales"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("Sales.batches.id"), nullable=True)
    product_code = Column(String(50), ForeignKey("Sales.product.code"), nullable=True)
    production_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    quantity = Column(Integer, nullable=True)
    received_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Warehouse(Base):
    __tablename__ = "warehouse"
    __table_args__ = {"schema": "Sales"}

    code = Column(String(50), primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)
    storekeeper = Column(String, ForeignKey("Sales.users.login"), nullable=True)
    agent = Column(String, nullable=True)
    expeditor_login = Column(String, ForeignKey("Sales.users.login"), nullable=True)


class WarehouseStock(Base):
    """Остатки по складам (таблица из миграции 002)."""
    __tablename__ = "warehouse_stock"
    __table_args__ = {"schema": "Sales"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    warehouse_code = Column(String(50), ForeignKey("Sales.warehouse.code"), nullable=False)
    product_code = Column(String(50), ForeignKey("Sales.product.code"), nullable=False)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("Sales.batches.id"), nullable=True)
    quantity = Column(Integer, default=0)
    reserved_qty = Column(Integer, default=0)
    last_updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = {"schema": "Sales"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name_client = Column(Text, nullable=True)
    firm_name = Column(Text, nullable=True)
    category_client = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(Text, nullable=True)
    territory = Column(Text, nullable=True)
    landmark = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    contact_person = Column(Text, nullable=True)
    tax_id = Column(Text, nullable=True)
    status = Column(Text, nullable=True)
    login_agent = Column(Text, ForeignKey("Sales.users.login"), nullable=True)
    login_expeditor = Column(Text, ForeignKey("Sales.users.login"), nullable=True)
    latitude = Column(Numeric(9, 6), nullable=True)
    longitude = Column(Numeric(9, 6), nullable=True)
    PINFL = Column("pinfl", Text, nullable=True)
    contract_no = Column(Text, nullable=True)
    account_no = Column(Text, nullable=True)
    bank = Column(Text, nullable=True)
    MFO = Column("mfo", Text, nullable=True)
    OKED = Column("oked", Text, nullable=True)
    VAT_code = Column("vat_code", Text, nullable=True)
    main_photo_id = Column(Integer, ForeignKey("Sales.customer_photo.id", use_alter=True, name="customers_main_photo_id_fkey"), nullable=True)


class CustomerVisit(Base):
    """Визиты клиентам (ТЗ 3.0)."""
    __tablename__ = "customers_visits"
    __table_args__ = {"schema": "Sales"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("Sales.customers.id", ondelete="CASCADE"), nullable=False)
    visit_date = Column(Date, nullable=False)
    visit_time = Column(Time, nullable=True)
    status = Column(Text, nullable=False)  # planned | completed | cancelled
    responsible_login = Column(String, ForeignKey("Sales.users.login", ondelete="SET NULL"), nullable=True)
    comment = Column(Text, nullable=True)
    public_token = Column(Text, unique=True, nullable=False, server_default=text("md5(random()::text)"))
    created_by = Column(String, ForeignKey("Sales.users.login"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_by = Column(String, ForeignKey("Sales.users.login"), nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class CustomerPhoto(Base):
    """Фотографии клиентов (ТЗ 3.0)."""
    __tablename__ = "customer_photo"
    __table_args__ = {"schema": "Sales"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("Sales.customers.id", ondelete="CASCADE"), nullable=False)
    photo_path = Column(Text, nullable=False)
    original_filename = Column(Text, nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    download_token = Column(Text, unique=True, nullable=False, server_default=text("md5(random()::text)"))
    is_main = Column(Boolean, default=False)
    uploaded_by = Column(String, ForeignKey("Sales.users.login"), nullable=False)
    uploaded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class OperationType(Base):
    __tablename__ = "operation_types"
    __table_args__ = {"schema": "Sales"}

    code = Column(String, primary_key=True)  # PK без id, только code
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)


class OperationConfig(Base):
    """Конфигурация операций: правила для каждого типа операции."""
    __tablename__ = "operation_config"
    __table_args__ = {"schema": "Sales"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    operation_type_code = Column(String, ForeignKey("Sales.operation_types.code"), unique=True, nullable=False)
    default_status = Column(String, nullable=False, server_default=text("'completed'"))
    required_fields = Column(Text, nullable=False)  # JSON array as TEXT
    optional_fields = Column(Text, nullable=False, server_default="[]")
    hidden_fields = Column(Text, nullable=False, server_default="[]")
    readonly_fields = Column(Text, nullable=False, server_default='["operation_number","type_code","status","operation_date","created_by","created_at"]')
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class PaymentType(Base):
    __tablename__ = "payment_type"
    __table_args__ = {"schema": "Sales"}

    code = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)


class Currency(Base):
    __tablename__ = "currency"
    __table_args__ = {"schema": "Sales"}

    code = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=True)
    symbol = Column(String, nullable=True)
    is_default = Column(Boolean, default=False)


class Status(Base):
    __tablename__ = "status"
    __table_args__ = {"schema": "Sales"}

    code = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {"schema": "Sales"}

    order_no = Column(Integer, primary_key=True, autoincrement=False)  # PK: 1, 2, 3...
    customer_id = Column(Integer, ForeignKey("Sales.customers.id"), nullable=True)
    order_date = Column(TIMESTAMP(timezone=True), server_default=func.now())
    status_code = Column(String, ForeignKey("Sales.status.code"), nullable=True)
    total_amount = Column(Numeric(18, 2), nullable=True)
    payment_type_code = Column(String, ForeignKey("Sales.payment_type.code"), nullable=True)
    created_by = Column(String, ForeignKey("Sales.users.login"), nullable=True)
    # Назначенная дата поставки
    scheduled_delivery_at = Column(TIMESTAMP(timezone=True), nullable=True)
    # Дата и время перевода в статус «Доставка»
    status_delivery_at = Column(TIMESTAMP(timezone=True), nullable=True)
    # Дата и время закрытия заказа (доставлен / отмена)
    closed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    # Дата и время последнего изменения
    last_updated_at = Column(TIMESTAMP(timezone=True), nullable=True)
    # Login пользователя, выполнившего последнее изменение
    last_updated_by = Column(String, ForeignKey("Sales.users.login"), nullable=True)


class Item(Base):
    __tablename__ = "items"
    __table_args__ = {"schema": "Sales"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(Integer, ForeignKey("Sales.orders.order_no"), nullable=True)
    product_code = Column(String(50), ForeignKey("Sales.product.code"), nullable=True)
    quantity = Column(Integer, nullable=True)
    price = Column(Numeric(18, 2), nullable=True)
    last_updated_by = Column(String, ForeignKey("Sales.users.login"), nullable=True)
    last_updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Operation(Base):
    __tablename__ = "operations"
    __table_args__ = {"schema": "Sales"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operation_number = Column(String(50), unique=True, nullable=False)
    type_code = Column(String, ForeignKey("Sales.operation_types.code"), nullable=False)
    operation_date = Column(TIMESTAMP(timezone=True), server_default=func.now())
    completed_date = Column(TIMESTAMP(timezone=True), nullable=True)
    warehouse_from = Column(String(50), ForeignKey("Sales.warehouse.code"), nullable=True)
    warehouse_to = Column(String(50), ForeignKey("Sales.warehouse.code"), nullable=True)
    product_code = Column(String(50), ForeignKey("Sales.product.code"), nullable=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("Sales.batches.id"), nullable=True)
    quantity = Column(Integer, nullable=True)
    amount = Column(Numeric(18, 2), nullable=True)
    payment_type_code = Column(String, ForeignKey("Sales.payment_type.code"), nullable=True)
    customer_id = Column(Integer, ForeignKey("Sales.customers.id"), nullable=True)
    order_id = Column(Integer, ForeignKey("Sales.orders.order_no"), nullable=True)
    created_by = Column(String, ForeignKey("Sales.users.login"), nullable=False)
    expeditor_login = Column(String, ForeignKey("Sales.users.login"), nullable=True)
    cashier_login = Column(String, ForeignKey("Sales.users.login"), nullable=True)
    storekeeper_login = Column(String, ForeignKey("Sales.users.login"), nullable=True)
    related_operation_id = Column(UUID(as_uuid=True), ForeignKey("Sales.operations.id"), nullable=True)
    status = Column(String, nullable=True, server_default=text("'pending'"))  # noqa: used for server default
    comment = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
