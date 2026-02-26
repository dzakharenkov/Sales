# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** ai_realty  
**ID Ошибки:** 7274886438  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7274886438/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column properties.loan_interest_rate does not exist

**Тип исключения:** ProgrammingError  
**Сообщение об ошибке:** (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.UndefinedColumnError'>: column properties.loan_interest_rate does not exist
[SQL: SELECT ai_realty.properties.id, ai_realty.properties.user_id, ai_realty.properties.portfolio_id, ai_realty.properties.property_name, ai_realty.properties.address, ai_realty.properties.city, ai_realty.properties.state, ai_realty.properties.zip_code, ai_realty.properties.latitude, ai_realty.properties.longitude, ai_realty.properties.sqft, ai_realty.properties.bedrooms, ai_realty.properties.bathrooms, ai_realty.properties.purchase_price, ai_realty.properties.property_type, ai_realty.properties.monthly_rent, ai_realty.properties.monthly_mortgage_payment, ai_realty.properties.down_payment, ai_realty.properties.loan_amount, ai_realty.properties.loan_interest_rate, ai_realty.properties.loan_term_years, ai_realty.properties.property_tax_annual, ai_realty.properties.insurance_annual, ai_realty.properties.hoa_monthly, ai_realty.properties.maintenance_monthly, ai_realty.properties.vacancy_rate_percent, ai_realty.properties.condition, ai_realty.properties.property_status, ai_realty.properties.description, ai_realty.properties.notes, ai_realty.properties.primary_loan_id, ai_realty.properties.has_multiple_loans, ai_realty.properties.owner_entity_id, ai_realty.properties.owned_by_entity, ai_realty.properties.created_at, ai_realty.properties.updated_at, ai_realty.properties.last_updated_by 
FROM ai_realty.properties]
(Background on this error at: https://sqlalche.me/e/20/f405)  

**Статистика:**
- Кол-во возникновений: **1**
- Первое появление: 2026-02-18T20:08:04Z
- Последнее появление: 2026-02-18T20:08:04Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`sqlalchemy\dialects\postgresql\asyncpg.py:797`
в функции: `_handle_exception`

### Полный стектрейс:

#### Фрейм 49
- **Файл:** `sqlalchemy\dialects\postgresql\asyncpg.py`
- **Строка:** 797
- **Функция:** `_handle_exception`
- **Контекст кода:**

```python
                        "%s: %s" % (type(error), error)
                    )
                    translated_error.pgcode = translated_error.sqlstate = (
                        getattr(error, "sqlstate", None)
                    )
                    raise translated_error from error
            else:
                raise error
        else:
            raise error

```

#### Фрейм 48
- **Файл:** `sqlalchemy\dialects\postgresql\asyncpg.py`
- **Строка:** 513
- **Функция:** `_handle_exception`
- **Контекст кода:**

```python

    def close(self):
        self._rows.clear()

    def _handle_exception(self, error):
        self._adapt_connection._handle_exception(error)

    async def _prepare_and_execute(self, operation, parameters):
        adapt_connection = self._adapt_connection

        async with adapt_connection._execute_mutex:
```

#### Фрейм 47
- **Файл:** `sqlalchemy\dialects\postgresql\asyncpg.py`
- **Строка:** 563
- **Функция:** `_prepare_and_execute`
- **Контекст кода:**

```python
                        self.rowcount = int(reg.group(1))
                    else:
                        self.rowcount = -1

            except Exception as error:
                self._handle_exception(error)

    async def _executemany(self, operation, seq_of_parameters):
        adapt_connection = self._adapt_connection

        self.description = None
```

#### Фрейм 46
- **Файл:** `sqlalchemy\util\_concurrency_py3k.py`
- **Строка:** 196
- **Функция:** `greenlet_spawn`
- **Контекст кода:**

```python
    while not context.dead:
        switch_occurred = True
        try:
            # wait for a coroutine from await_only and then return its
            # result back to it.
            value = await result
        except BaseException:
            # this allows an exception to be raised within
            # the moderated greenlet so that it can continue
            # its expected flow.
            result = context.throw(*sys.exc_info())
```

#### Фрейм 45
- **Файл:** `sqlalchemy\util\_concurrency_py3k.py`
- **Строка:** 132
- **Функция:** `await_only`
- **Контекст кода:**

```python

    # returns the control to the driver greenlet passing it
    # a coroutine to run. Once the awaitable is done, the driver greenlet
    # switches back to this greenlet with the result of awaitable that is
    # then returned to the caller (or raised as error)
    return current.parent.switch(awaitable)  # type: ignore[no-any-return,attr-defined] # noqa: E501


def await_fallback(awaitable: Awaitable[_T]) -> _T:
    """Awaits an async function in a sync method.

```

#### Фрейм 44
- **Файл:** `sqlalchemy\dialects\postgresql\asyncpg.py`
- **Строка:** 585
- **Функция:** `execute`
- **Контекст кода:**

```python
                )
            except Exception as error:
                self._handle_exception(error)

    def execute(self, operation, parameters=None):
        self._adapt_connection.await_(
            self._prepare_and_execute(operation, parameters)
        )

    def executemany(self, operation, seq_of_parameters):
        return self._adapt_connection.await_(
```

#### Фрейм 43
- **Файл:** `sqlalchemy\engine\default.py`
- **Строка:** 952
- **Функция:** `do_execute`
- **Контекст кода:**

```python

    def do_executemany(self, cursor, statement, parameters, context=None):
        cursor.executemany(statement, parameters)

    def do_execute(self, cursor, statement, parameters, context=None):
        cursor.execute(statement, parameters)

    def do_execute_no_params(self, cursor, statement, context=None):
        cursor.execute(statement)

    def is_disconnect(
```

#### Фрейм 42
- **Файл:** `sqlalchemy\engine\base.py`
- **Строка:** 1967
- **Функция:** `_exec_single_context`
- **Контекст кода:**

```python
                            context,
                        ):
                            evt_handled = True
                            break
                if not evt_handled:
                    self.dialect.do_execute(
                        cursor, str_statement, effective_parameters, context
                    )

            if self._has_events or self.engine._has_events:
                self.dispatch.after_cursor_execute(
```

#### Фрейм 41
- **Файл:** `sqlalchemy\engine\base.py`
- **Строка:** 2363
- **Функция:** `_handle_dbapi_exception`
- **Контекст кода:**

```python

            if newraise:
                raise newraise.with_traceback(exc_info[2]) from e
            elif should_wrap:
                assert sqlalchemy_exception is not None
                raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
            else:
                assert exc_info[1] is not None
                raise exc_info[1].with_traceback(exc_info[2])
        finally:
            del self._reentrant_error
```

#### Фрейм 40
- **Файл:** `sqlalchemy\engine\base.py`
- **Строка:** 1986
- **Функция:** `_exec_single_context`
- **Контекст кода:**

```python
            context.post_exec()

            result = context._setup_result_proxy()

        except BaseException as e:
            self._handle_dbapi_exception(
                e, str_statement, effective_parameters, cursor, context
            )

        return result

```

#### Фрейм 39
- **Файл:** `sqlalchemy\engine\base.py`
- **Строка:** 1846
- **Функция:** `_execute_context`
- **Контекст кода:**

```python
        context.pre_exec()

        if context.execute_style is ExecuteStyle.INSERTMANYVALUES:
            return self._exec_insertmany_context(dialect, context)
        else:
            return self._exec_single_context(
                dialect, context, statement, parameters
            )

    def _exec_single_context(
        self,
```

#### Фрейм 38
- **Файл:** `sqlalchemy\engine\base.py`
- **Строка:** 1641
- **Функция:** `_execute_clauseelement`
- **Контекст кода:**

```python
            column_keys=keys,
            for_executemany=for_executemany,
            schema_translate_map=schema_translate_map,
            linting=self.dialect.compiler_linting | compiler.WARN_LINTING,
        )
        ret = self._execute_context(
            dialect,
            dialect.execution_ctx_cls._init_compiled,
            compiled_sql,
            distilled_parameters,
            execution_options,
```

#### Фрейм 37
- **Файл:** `sqlalchemy\sql\elements.py`
- **Строка:** 527
- **Функция:** `_execute_on_connection`
- **Контекст кода:**

```python
        execution_options: CoreExecuteOptionsParameter,
    ) -> Result[Any]:
        if self.supports_execution:
            if TYPE_CHECKING:
                assert isinstance(self, Executable)
            return connection._execute_clauseelement(
                self, distilled_params, execution_options
            )
        else:
            raise exc.ObjectNotExecutableError(self)

```

#### Фрейм 36
- **Файл:** `sqlalchemy\engine\base.py`
- **Строка:** 1419
- **Функция:** `execute`
- **Контекст кода:**

```python
        try:
            meth = statement._execute_on_connection
        except AttributeError as err:
            raise exc.ObjectNotExecutableError(statement) from err
        else:
            return meth(
                self,
                distilled_parameters,
                execution_options or NO_OPTIONS,
            )

```

#### Фрейм 35
- **Файл:** `sqlalchemy\orm\context.py`
- **Строка:** 306
- **Функция:** `orm_execute_statement`
- **Контекст кода:**

```python
        params,
        execution_options,
        bind_arguments,
        conn,
    ) -> Result:
        result = conn.execute(
            statement, params or {}, execution_options=execution_options
        )
        return cls.orm_setup_cursor_result(
            session,
            statement,
```

#### Фрейм 34
- **Файл:** `sqlalchemy\orm\session.py`
- **Строка:** 2249
- **Функция:** `_execute_internal`
- **Контекст кода:**

```python
            return conn.scalar(
                statement, params or {}, execution_options=execution_options
            )

        if compile_state_cls:
            result: Result[Any] = compile_state_cls.orm_execute_statement(
                self,
                statement,
                params or {},
                execution_options,
                bind_arguments,
```

#### Фрейм 33
- **Файл:** `sqlalchemy\orm\session.py`
- **Строка:** 2351
- **Функция:** `execute`
- **Контекст кода:**

```python

        :return: a :class:`_engine.Result` object.


        """
        return self._execute_internal(
            statement,
            params,
            execution_options=execution_options,
            bind_arguments=bind_arguments,
            _parent_execute_state=_parent_execute_state,
```

#### Фрейм 32
- **Файл:** `sqlalchemy\util\_concurrency_py3k.py`
- **Строка:** 201
- **Функция:** `greenlet_spawn`
- **Контекст кода:**

```python
            value = await result
        except BaseException:
            # this allows an exception to be raised within
            # the moderated greenlet so that it can continue
            # its expected flow.
            result = context.throw(*sys.exc_info())
        else:
            result = context.switch(value)

    if _require_await and not switch_occurred:
        raise exc.AwaitRequired(
```

#### Фрейм 31
- **Файл:** `sqlalchemy\ext\asyncio\session.py`
- **Строка:** 449
- **Функция:** `execute`
- **Контекст кода:**

```python
                _EXECUTE_OPTIONS
            )
        else:
            execution_options = _EXECUTE_OPTIONS

        result = await greenlet_spawn(
            self.sync_session.execute,
            statement,
            params=params,
            execution_options=execution_options,
            bind_arguments=bind_arguments,
```

#### Фрейм 30
- **Файл:** `app\api\v1\routers\ai_router.py`
- **Строка:** 96
- **Функция:** `ai_portfolio_optimization`
- **Контекст кода:**

```python
        if role in {"admin", "client_admin"} and getattr(user, "client_id", None):
            user_ids = (await session.execute(select(User.id).where(User.client_id == user.client_id))).scalars().all()
            q = q.where(Property.user_id.in_(user_ids))
        else:
            q = q.where(Property.user_id == user.id)
    rows = (await session.execute(q)).scalars().all()
    if not rows:
        return {"summary": "No properties in scope", "actions": []}
    actions = [
        "Prioritize refinancing highest-rate loans first.",
        "Shift capex to assets with strongest rent-growth spread.",
```

#### Фрейм 29
- **Файл:** `fastapi\routing.py`
- **Строка:** 212
- **Функция:** `run_endpoint_function`
- **Контекст кода:**

```python
    # Only called by get_request_handler. Has been split into its own function to
    # facilitate profiling endpoints, since inner functions are harder to profile.
    assert dependant.call is not None, "dependant.call must be a function"

    if is_coroutine:
        return await dependant.call(**values)
    else:
        return await run_in_threadpool(dependant.call, **values)


def get_request_handler(
```

#### Фрейм 28
- **Файл:** `fastapi\routing.py`
- **Строка:** 301
- **Функция:** `app`
- **Контекст кода:**

```python
                    async_exit_stack=async_exit_stack,
                    embed_body_fields=embed_body_fields,
                )
                errors = solved_result.errors
                if not errors:
                    raw_response = await run_endpoint_function(
                        dependant=dependant,
                        values=solved_result.values,
                        is_coroutine=is_coroutine,
                    )
                    if isinstance(raw_response, Response):
```

#### Фрейм 27
- **Файл:** `starlette\routing.py`
- **Строка:** 73
- **Функция:** `app`
- **Контекст кода:**

```python

    async def app(scope: Scope, receive: Receive, send: Send) -> None:
        request = Request(scope, receive, send)

        async def app(scope: Scope, receive: Receive, send: Send) -> None:
            response = await f(request)
            await response(scope, receive, send)

        await wrap_app_handling_exceptions(app, request)(scope, receive, send)

    return app
```

#### Фрейм 26
- **Файл:** `starlette\_exception_handler.py`
- **Строка:** 42
- **Функция:** `wrapped_app`
- **Контекст кода:**

```python
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await app(scope, receive, sender)
        except Exception as exc:
            handler = None

            if isinstance(exc, HTTPException):
                handler = status_handlers.get(exc.status_code)
```

#### Фрейм 25
- **Файл:** `starlette\_exception_handler.py`
- **Строка:** 53
- **Функция:** `wrapped_app`
- **Контекст кода:**

```python

            if handler is None:
                handler = _lookup_exception_handler(exception_handlers, exc)

            if handler is None:
                raise exc

            if response_started:
                raise RuntimeError("Caught handled exception, but response already started.") from exc

            if is_async_callable(handler):
```

#### Фрейм 24
- **Файл:** `starlette\routing.py`
- **Строка:** 76
- **Функция:** `app`
- **Контекст кода:**

```python

        async def app(scope: Scope, receive: Receive, send: Send) -> None:
            response = await f(request)
            await response(scope, receive, send)

        await wrap_app_handling_exceptions(app, request)(scope, receive, send)

    return app


def websocket_session(
```

#### Фрейм 23
- **Файл:** `starlette\routing.py`
- **Строка:** 288
- **Функция:** `handle`
- **Контекст кода:**

```python
                raise HTTPException(status_code=405, headers=headers)
            else:
                response = PlainTextResponse("Method Not Allowed", status_code=405, headers=headers)
            await response(scope, receive, send)
        else:
            await self.app(scope, receive, send)

    def __eq__(self, other: typing.Any) -> bool:
        return (
            isinstance(other, Route)
            and self.path == other.path
```

#### Фрейм 22
- **Файл:** `starlette\routing.py`
- **Строка:** 734
- **Функция:** `app`
- **Контекст кода:**

```python
            # Determine if any route matches the incoming scope,
            # and hand over to the matching route if found.
            match, child_scope = route.matches(scope)
            if match == Match.FULL:
                scope.update(child_scope)
                await route.handle(scope, receive, send)
                return
            elif match == Match.PARTIAL and partial is None:
                partial = route
                partial_scope = child_scope

```

#### Фрейм 21
- **Файл:** `starlette\routing.py`
- **Строка:** 714
- **Функция:** `__call__`
- **Контекст кода:**

```python

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        """
        The main entry point to the Router class.
        """
        await self.middleware_stack(scope, receive, send)

    async def app(self, scope: Scope, receive: Receive, send: Send) -> None:
        assert scope["type"] in ("http", "websocket", "lifespan")

        if "router" not in scope:
```

#### Фрейм 20
- **Файл:** `starlette\_exception_handler.py`
- **Строка:** 42
- **Функция:** `wrapped_app`
- **Контекст кода:**

```python
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await app(scope, receive, sender)
        except Exception as exc:
            handler = None

            if isinstance(exc, HTTPException):
                handler = status_handlers.get(exc.status_code)
```

#### Фрейм 19
- **Файл:** `starlette\_exception_handler.py`
- **Строка:** 53
- **Функция:** `wrapped_app`
- **Контекст кода:**

```python

            if handler is None:
                handler = _lookup_exception_handler(exception_handlers, exc)

            if handler is None:
                raise exc

            if response_started:
                raise RuntimeError("Caught handled exception, but response already started.") from exc

            if is_async_callable(handler):
```

#### Фрейм 18
- **Файл:** `starlette\middleware\exceptions.py`
- **Строка:** 62
- **Функция:** `__call__`
- **Контекст кода:**

```python
        if scope["type"] == "http":
            conn = Request(scope, receive, send)
        else:
            conn = WebSocket(scope, receive, send)

        await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)

    def http_exception(self, request: Request, exc: Exception) -> Response:
        assert isinstance(exc, HTTPException)
        if exc.status_code in {204, 304}:
            return Response(status_code=exc.status_code, headers=exc.headers)
```

#### Фрейм 17
- **Файл:** `starlette\middleware\cors.py`
- **Строка:** 85
- **Функция:** `__call__`
- **Контекст кода:**

```python
        method = scope["method"]
        headers = Headers(scope=scope)
        origin = headers.get("origin")

        if origin is None:
            await self.app(scope, receive, send)
            return

        if method == "OPTIONS" and "access-control-request-method" in headers:
            response = self.preflight_response(request_headers=headers)
            await response(scope, receive, send)
```

#### Фрейм 16
- **Файл:** `starlette\middleware\errors.py`
- **Строка:** 165
- **Функция:** `__call__`
- **Контекст кода:**

```python
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, receive, _send)
        except Exception as exc:
            request = Request(scope)
            if self.debug:
                # In debug mode, return traceback responses.
                response = self.debug_response(request, exc)
```

#### Фрейм 15
- **Файл:** `starlette\middleware\errors.py`
- **Строка:** 187
- **Функция:** `__call__`
- **Контекст кода:**

```python
                await response(scope, receive, send)

            # We always continue to raise the exception.
            # This allows servers to log the error, or allows test clients
            # to optionally raise the error within the test case.
            raise exc

    def format_line(self, index: int, line: str, frame_lineno: int, frame_index: int) -> str:
        values = {
            # HTML escape - line could contain < or >
            "line": html.escape(line).replace(" ", "&nbsp"),
```

#### Фрейм 14
- **Файл:** `starlette\applications.py`
- **Строка:** 112
- **Функция:** `__call__`
- **Контекст кода:**

```python

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        scope["app"] = self
        if self.middleware_stack is None:
            self.middleware_stack = self.build_middleware_stack()
        await self.middleware_stack(scope, receive, send)

    def on_event(self, event_type: str) -> typing.Callable:  # type: ignore[type-arg]
        return self.router.on_event(event_type)  # pragma: no cover

    def mount(self, path: str, app: ASGIApp, name: str | None = None) -> None:
```

#### Фрейм 13
- **Файл:** `fastapi\applications.py`
- **Строка:** 1054
- **Функция:** `__call__`
- **Контекст кода:**

```python
            self.add_route(self.redoc_url, redoc_html, include_in_schema=False)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if self.root_path:
            scope["root_path"] = self.root_path
        await super().__call__(scope, receive, send)

    def add_api_route(
        self,
        path: str,
        endpoint: Callable[..., Any],
```

#### Фрейм 12
- **Файл:** `httpx\_transports\asgi.py`
- **Строка:** 162
- **Функция:** `handle_async_request`
- **Контекст кода:**

```python

                if not more_body:
                    response_complete.set()

        try:
            await self.app(scope, receive, send)
        except Exception:  # noqa: PIE-786
            if self.raise_app_exceptions or not response_complete.is_set():
                raise

        assert response_complete.is_set()
```

#### Фрейм 11
- **Файл:** `httpx\_client.py`
- **Строка:** 1719
- **Функция:** `_send_single_request`
- **Контекст кода:**

```python
            raise RuntimeError(
                "Attempted to send an sync request with an AsyncClient instance."
            )

        with request_context(request=request):
            response = await transport.handle_async_request(request)

        assert isinstance(response.stream, AsyncByteStream)
        response.request = request
        response.stream = BoundAsyncStream(
            response.stream, response=response, timer=timer
```

#### Фрейм 10
- **Файл:** `httpx\_client.py`
- **Строка:** 1682
- **Функция:** `_send_handling_redirects`
- **Контекст кода:**

```python
                )

            for hook in self._event_hooks["request"]:
                await hook(request)

            response = await self._send_single_request(request)
            try:
                for hook in self._event_hooks["response"]:
                    await hook(response)

                response.history = list(history)
```

#### Фрейм 9
- **Файл:** `httpx\_client.py`
- **Строка:** 1645
- **Функция:** `_send_handling_auth`
- **Контекст кода:**

```python
        auth_flow = auth.async_auth_flow(request)
        try:
            request = await auth_flow.__anext__()

            while True:
                response = await self._send_handling_redirects(
                    request,
                    follow_redirects=follow_redirects,
                    history=history,
                )
                try:
```

#### Фрейм 8
- **Файл:** `httpx\_client.py`
- **Строка:** 1617
- **Функция:** `send`
- **Контекст кода:**

```python
            else follow_redirects
        )

        auth = self._build_request_auth(request, auth)

        response = await self._send_handling_auth(
            request,
            auth=auth,
            follow_redirects=follow_redirects,
            history=[],
        )
```

#### Фрейм 7
- **Файл:** `httpx\_client.py`
- **Строка:** 1530
- **Функция:** `request`
- **Контекст кода:**

```python
            headers=headers,
            cookies=cookies,
            timeout=timeout,
            extensions=extensions,
        )
        return await self.send(request, auth=auth, follow_redirects=follow_redirects)

    @asynccontextmanager
    async def stream(
        self,
        method: str,
```

#### Фрейм 6
- **Файл:** `httpx\_client.py`
- **Строка:** 1757
- **Функция:** `get`
- **Контекст кода:**

```python
        """
        Send a `GET` request.

        **Parameters**: See `httpx.request`.
        """
        return await self.request(
            "GET",
            url,
            params=params,
            headers=headers,
            cookies=cookies,
```

#### Фрейм 5
- **Файл:** `<stdin>`
- **Строка:** 25
- **Функция:** `main`
- **Контекст кода:**

```python
```

#### Фрейм 4
- **Файл:** `asyncio\base_events.py`
- **Строка:** 719
- **Функция:** `run_until_complete`
- **Контекст кода:**

```python
        finally:
            future.remove_done_callback(_run_until_complete_cb)
        if not future.done():
            raise RuntimeError('Event loop stopped before Future completed.')

        return future.result()

    def stop(self):
        """Stop running the event loop.

        Every callback already scheduled will still run.  This simply informs
```

#### Фрейм 3
- **Файл:** `asyncio\runners.py`
- **Строка:** 118
- **Функция:** `run`
- **Контекст кода:**

```python
        else:
            sigint_handler = None

        self._interrupt_count = 0
        try:
            return self._loop.run_until_complete(task)
        except exceptions.CancelledError:
            if self._interrupt_count > 0:
                uncancel = getattr(task, "uncancel", None)
                if uncancel is not None and uncancel() == 0:
                    raise KeyboardInterrupt()
```

#### Фрейм 2
- **Файл:** `asyncio\runners.py`
- **Строка:** 195
- **Функция:** `run`
- **Контекст кода:**

```python
        # fail fast with short traceback
        raise RuntimeError(
            "asyncio.run() cannot be called from a running event loop")

    with Runner(debug=debug, loop_factory=loop_factory) as runner:
        return runner.run(main)


def _cancel_all_tasks(loop):
    to_cancel = tasks.all_tasks(loop)
    if not to_cancel:
```

#### Фрейм 1
- **Файл:** `<stdin>`
- **Строка:** 47
- **Функция:** `<module>`
- **Контекст кода:**

```python
```

---

## Контекстная информация

### Информация о пользователе
- **User ID:** None
- **Email:** None
- **IP Address:** None

### Теги
```json
{
  "environment": "development",
  "handled": "no",
  "level": "error",
  "mechanism": "excepthook",
  "release": "HEAD",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "Sokol"
}
```

---

## Инструкции для исправления

**Воспроизведение ошибки:**
1. Перейти по ссылке в Sentry для просмотра деталей
2. Понять сценарий, при котором происходит ошибка
3. Попытаться воспроизвести локально

**Анализ кода:**
1. Открыть файл на строке, указанной в стектрейсе
2. Проанализировать логику и найти причину
3. Проверить граничные случаи и исключения

**Исправление:**
1. Написать патч/исправление
2. Добавить проверку входных данных, если необходимо
3. Убедиться, что обработка исключений корректна

**Тестирование:**
1. Написать юнит-тест, покрывающий этот сценарий
2. Провести ручное тестирование
3. Убедиться, что ошибка больше не возникает

**После исправления:**
1. Создать commit с описанием
2. Развернуть в production
3. Отметить статус в Excel как ✅ ИСПРАВЛЕНО

---

## Статус выполнения

- [ ] Ошибка воспроизведена
- [ ] Найдена причина
- [ ] Написано исправление
- [ ] Написаны тесты
- [ ] Code review пройден
- [ ] Развёрнуто в production
- [ ] Проверено в Sentry (ошибка исчезла)

**Статус:** ❌ НЕ НАЧИНАЛОСЬ


Создано: 2026-02-24 21:00:51