(function () {
  const token = localStorage.getItem('sds_token');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const api = (path, opts = {}) => {
    const url = path.startsWith('http') ? path : (window.location.origin + path);
    return fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        ...(opts.headers || {}),
      },
    }).then(async (r) => {
      const text = await r.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch (_) { data = null; }
      if (!r.ok) throw { status: r.status, data };
      return data;
    });
  };

  let currentUser = { login: '', fio: '', role: '' };
  const isAdmin = () => (currentUser.role || '').toLowerCase() === 'admin';

  function loadMe() {
    return api('/api/v1/auth/me').then((u) => {
      currentUser = u;
      document.getElementById('userName').textContent = (u.fio || u.login) + ' (' + u.role + ')';
    }).catch(() => {
      localStorage.removeItem('sds_token');
      window.location.href = '/login';
    });
  }

  function showModal(title, bodyHtml, onSave) {
    const wrap = document.getElementById('modalContainer');
    const id = 'm' + Date.now();
    wrap.innerHTML = '<div class="modal show" id="' + id + '"><div class="modal-inner"><h3>' + title + '</h3><div id="' + id + '_body">' + bodyHtml + '</div><div class="modal-actions"><button type="button" class="btn btn-primary" id="' + id + '_save">Сохранить</button><button type="button" class="btn btn-secondary" id="' + id + '_cancel">Отмена</button></div><div id="' + id + '_err" class="err"></div></div></div>';
    const saveBtn = document.getElementById(id + '_save');
    const cancelBtn = document.getElementById(id + '_cancel');
    const errEl = document.getElementById(id + '_err');
    cancelBtn.onclick = () => { document.getElementById(id).classList.remove('show'); };
    saveBtn.onclick = () => {
      errEl.textContent = '';
      onSave(errEl).then(() => document.getElementById(id).classList.remove('show')).catch((e) => {
        errEl.textContent = (e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'Ошибка';
      });
    };
  }

  function section(title, addLabel, addVisible, load, tableRender) {
    const content = document.getElementById('content');
    let addBtn = '';
    if (addVisible) addBtn = '<button type="button" class="btn btn-primary" id="sectionAdd">' + addLabel + '</button>';
    content.innerHTML = '<div class="card"><h2>' + title + '</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
    const tableDiv = document.getElementById('sectionTable');
    const errDiv = document.getElementById('sectionErr');
    const refresh = () => {
      errDiv.textContent = '';
      load().then((data) => { tableDiv.innerHTML = tableRender(data); }).catch((e) => {
        errDiv.textContent = (e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : 'Ошибка доступа') : 'Ошибка загрузки';
        tableDiv.innerHTML = '';
      });
    };
    if (addVisible) document.getElementById('sectionAdd').onclick = () => refresh();
    refresh();
    return refresh;
  }

  function usersSection() {
    let refreshFn;
    const doAdd = () => {
      showModal('Добавить пользователя', `
        <div class="form-group"><label>Логин</label><input type="text" id="u_login" required></div>
        <div class="form-group"><label>ФИО</label><input type="text" id="u_fio" required></div>
        <div class="form-group"><label>Пароль</label><input type="password" id="u_password" required></div>
        <div class="form-group"><label>Роль</label><select id="u_role"><option value="agent">agent</option><option value="admin">admin</option><option value="expeditor">expeditor</option><option value="stockman">stockman</option><option value="paymaster">paymaster</option></select></div>
        <div class="form-group"><label>Телефон</label><input type="text" id="u_phone"></div>
        <div class="form-group"><label>Email</label><input type="email" id="u_email"></div>
      `, (errEl) => api('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify({
          login: document.getElementById('u_login').value.trim(),
          fio: document.getElementById('u_fio').value.trim(),
          password: document.getElementById('u_password').value,
          role: document.getElementById('u_role').value,
          phone: document.getElementById('u_phone').value.trim() || null,
          email: document.getElementById('u_email').value.trim() || null,
        }),
      }).then(() => refreshFn()));
    };
    const doEdit = (login) => {
      showModal('Изменить пользователя: ' + login, `
        <div class="form-group"><label>ФИО</label><input type="text" id="ue_fio"></div>
        <div class="form-group"><label>Роль</label><select id="ue_role"><option value="agent">agent</option><option value="admin">admin</option><option value="expeditor">expeditor</option><option value="stockman">stockman</option><option value="paymaster">paymaster</option></select></div>
        <div class="form-group"><label>Статус</label><input type="text" id="ue_status" placeholder="активен"></div>
        <div class="form-group"><label>Телефон</label><input type="text" id="ue_phone"></div>
        <div class="form-group"><label>Email</label><input type="email" id="ue_email"></div>
      `, (errEl) => {
        const role = document.getElementById('ue_role').value;
        const status = document.getElementById('ue_status').value.trim();
        return api('/api/v1/users/' + encodeURIComponent(login), {
          method: 'PATCH',
          body: JSON.stringify({
            fio: document.getElementById('ue_fio').value.trim() || undefined,
            role: role,
            status: status || undefined,
            phone: document.getElementById('ue_phone').value.trim() || undefined,
            email: document.getElementById('ue_email').value.trim() || undefined,
          }),
        }).then(() => refreshFn());
      });
      api('/api/v1/users').then((list) => {
        const u = list.find((x) => x.login === login);
        if (u) {
          document.getElementById('ue_fio').value = u.fio || '';
          document.getElementById('ue_role').value = u.role || 'agent';
          document.getElementById('ue_status').value = u.status || 'активен';
        }
      });
    };
    const doSetPassword = (login) => {
      showModal('Сменить пароль: ' + login, `
        <div class="form-group"><label>Новый пароль</label><input type="password" id="up_password" required></div>
      `, () => api('/api/v1/users/' + encodeURIComponent(login) + '/set-password', {
        method: 'POST',
        body: JSON.stringify({ password: document.getElementById('up_password').value }),
      }).then(() => refreshFn()));
    };
    refreshFn = section('Пользователи', 'Добавить пользователя', isAdmin(), () => api('/api/v1/users').catch((e) => { if (e.status === 403) return null; throw e; }), (list) => {
      if (list === null || !Array.isArray(list)) return '<p>Доступ только для администратора.</p>';
      if (!list.length) return '<p>Нет пользователей.</p>';
      let html = '<table><thead><tr><th>Логин</th><th>ФИО</th><th>Роль</th><th>Статус</th><th>Пароль</th><th>Действия</th></tr></thead><tbody>';
      list.forEach((u) => {
        html += '<tr><td>' + (u.login || '') + '</td><td>' + (u.fio || '') + '</td><td>' + (u.role || '') + '</td><td>' + (u.status || '') + '</td><td>' + (u.has_password ? 'Да' : 'Нет') + '</td><td>';
        if (isAdmin()) {
          html += '<button type="button" class="btn btn-secondary btn-small" data-edit="' + (u.login || '') + '">Изменить</button>';
          html += '<button type="button" class="btn btn-secondary btn-small" data-pwd="' + (u.login || '') + '">Сменить пароль</button>';
        }
        html += '</td></tr>';
      });
      html += '</tbody></table>';
      const c = document.getElementById('sectionTable');
      if (c) {
        c.querySelectorAll('[data-edit]').forEach((el) => { el.onclick = () => doEdit(el.getAttribute('data-edit')); });
        c.querySelectorAll('[data-pwd]').forEach((el) => { el.onclick = () => doSetPassword(el.getAttribute('data-pwd')); });
      }
      return html;
    });
    if (isAdmin()) document.getElementById('sectionAdd').onclick = doAdd;
  }

  function productsSection() {
    let refreshFn;
    const doAdd = () => {
      showModal('Добавить товар', `
        <div class="form-group"><label>Код</label><input type="text" id="p_code" required></div>
        <div class="form-group"><label>Название</label><input type="text" id="p_name" required></div>
        <div class="form-group"><label>Тип (Yogurt / Tvorog / Tara)</label><input type="text" id="p_type_id" placeholder="Yogurt"></div>
        <div class="form-group"><label>Вес (г)</label><input type="number" id="p_weight_g"></div>
        <div class="form-group"><label>Ед.</label><input type="text" id="p_unit" value="ШТ"></div>
        <div class="form-group"><label>Цена</label><input type="number" step="0.01" id="p_price"></div>
        <div class="form-group"><label>Срок годности (дней)</label><input type="number" id="p_expiry_days"></div>
      `, () => api('/api/v1/dictionary/products', {
        method: 'POST',
        body: JSON.stringify({
          code: document.getElementById('p_code').value.trim(),
          name: document.getElementById('p_name').value.trim(),
          type_id: document.getElementById('p_type_id').value.trim() || null,
          weight_g: parseInt(document.getElementById('p_weight_g').value, 10) || null,
          unit: document.getElementById('p_unit').value.trim() || 'ШТ',
          price: parseFloat(document.getElementById('p_price').value) || null,
          expiry_days: parseInt(document.getElementById('p_expiry_days').value, 10) || null,
        }),
      }).then(() => refreshFn()));
    };
    const doEdit = (code, row) => {
      showModal('Изменить товар: ' + code, `
        <div class="form-group"><label>Название</label><input type="text" id="pe_name" value="' + (row.name || '').replace(/"/g, '&quot;') + '"></div>
        <div class="form-group"><label>Тип</label><input type="text" id="pe_type_id" value="' + (row.type_id || '') + '"></div>
        <div class="form-group"><label>Вес (г)</label><input type="number" id="pe_weight_g" value="' + (row.weight_g ?? '') + '"></div>
        <div class="form-group"><label>Ед.</label><input type="text" id="pe_unit" value="' + (row.unit || 'ШТ') + '"></div>
        <div class="form-group"><label>Цена</label><input type="number" step="0.01" id="pe_price" value="' + (row.price ?? '') + '"></div>
        <div class="form-group"><label>Срок годности (дней)</label><input type="number" id="pe_expiry_days" value="' + (row.expiry_days ?? '') + '"></div>
      `, () => api('/api/v1/dictionary/products/' + encodeURIComponent(code), {
        method: 'PUT',
        body: JSON.stringify({
          name: document.getElementById('pe_name').value.trim(),
          type_id: document.getElementById('pe_type_id').value.trim() || null,
          weight_g: parseInt(document.getElementById('pe_weight_g').value, 10) || null,
          unit: document.getElementById('pe_unit').value.trim() || null,
          price: parseFloat(document.getElementById('pe_price').value) || null,
          expiry_days: parseInt(document.getElementById('pe_expiry_days').value, 10) || null,
        }),
      }).then(() => refreshFn()));
    };
    const doDeactivate = (code) => {
      if (!confirm('Деактивировать товар ' + code + '?')) return;
      api('/api/v1/dictionary/products/' + encodeURIComponent(code), { method: 'DELETE' }).then(() => refreshFn());
    };
    refreshFn = section('Товары', 'Добавить товар', isAdmin(), () => api('/api/v1/dictionary/products'), (list) => {
      if (!Array.isArray(list)) return '<p>Ошибка загрузки.</p>';
      if (!list.length) return '<p>Нет товаров.</p>';
      let html = '<table><thead><tr><th>Код</th><th>Название</th><th>Тип</th><th>Вес</th><th>Ед.</th><th>Цена</th><th>Срок</th><th>Действия</th></tr></thead><tbody>';
      list.forEach((p) => {
        html += '<tr><td>' + (p.code || '') + '</td><td>' + (p.name || '') + '</td><td>' + (p.type_id || '') + '</td><td>' + (p.weight_g ?? '') + '</td><td>' + (p.unit || '') + '</td><td>' + (p.price ?? '') + '</td><td>' + (p.expiry_days ?? '') + '</td><td>';
        if (isAdmin()) {
          html += '<button type="button" class="btn btn-secondary btn-small" data-edit="' + p.code + '" data-json="' + escape(JSON.stringify(p)) + '">Изменить</button>';
          html += '<button type="button" class="btn btn-secondary btn-small" data-del="' + p.code + '">Деактивировать</button>';
        }
        html += '</td></tr>';
      });
      html += '</tbody></table>';
      setTimeout(() => {
        document.getElementById('sectionTable').querySelectorAll('[data-edit]').forEach((el) => {
          el.onclick = () => { try { doEdit(el.getAttribute('data-edit'), JSON.parse(unescape(el.getAttribute('data-json')))); } catch (_) {} };
        });
        document.getElementById('sectionTable').querySelectorAll('[data-del]').forEach((el) => {
          el.onclick = () => doDeactivate(el.getAttribute('data-del'));
        });
      }, 0);
      return html;
    });
    if (isAdmin()) document.getElementById('sectionAdd').onclick = doAdd;
  }

  function warehousesSection() {
    let refreshFn;
    const doAdd = () => {
      showModal('Добавить склад', `
        <div class="form-group"><label>Код</label><input type="text" id="w_code" required></div>
        <div class="form-group"><label>Название</label><input type="text" id="w_name" required></div>
        <div class="form-group"><label>Тип</label><input type="text" id="w_type" placeholder="Склад реализации"></div>
        <div class="form-group"><label>Кладовщик (логин)</label><input type="text" id="w_storekeeper"></div>
        <div class="form-group"><label>Агент</label><input type="text" id="w_agent"></div>
      `, () => api('/api/v1/dictionary/warehouses', {
        method: 'POST',
        body: JSON.stringify({
          code: document.getElementById('w_code').value.trim(),
          name: document.getElementById('w_name').value.trim(),
          type: document.getElementById('w_type').value.trim() || null,
          storekeeper: document.getElementById('w_storekeeper').value.trim() || null,
          agent: document.getElementById('w_agent').value.trim() || null,
        }),
      }).then(() => refreshFn()));
    };
    const doEdit = (code, row) => {
      showModal('Изменить склад: ' + code, `
        <div class="form-group"><label>Название</label><input type="text" id="we_name" value="' + (row.name || '').replace(/"/g, '&quot;') + '"></div>
        <div class="form-group"><label>Тип</label><input type="text" id="we_type" value="' + (row.type || '') + '"></div>
        <div class="form-group"><label>Кладовщик</label><input type="text" id="we_storekeeper" value="' + (row.storekeeper || '') + '"></div>
        <div class="form-group"><label>Агент</label><input type="text" id="we_agent" value="' + (row.agent || '') + '"></div>
      `, () => api('/api/v1/dictionary/warehouses/' + encodeURIComponent(code), {
        method: 'PUT',
        body: JSON.stringify({
          name: document.getElementById('we_name').value.trim(),
          type: document.getElementById('we_type').value.trim() || null,
          storekeeper: document.getElementById('we_storekeeper').value.trim() || null,
          agent: document.getElementById('we_agent').value.trim() || null,
        }),
      }).then(() => refreshFn()));
    };
    refreshFn = section('Склады', 'Добавить склад', isAdmin(), () => api('/api/v1/dictionary/warehouses'), (list) => {
      if (!Array.isArray(list)) return '<p>Ошибка загрузки.</p>';
      if (!list.length) return '<p>Нет складов.</p>';
      let html = '<table><thead><tr><th>Код</th><th>Название</th><th>Тип</th><th>Кладовщик</th><th>Агент</th><th>Действия</th></tr></thead><tbody>';
      list.forEach((w) => {
        html += '<tr><td>' + (w.code || '') + '</td><td>' + (w.name || '') + '</td><td>' + (w.type || '') + '</td><td>' + (w.storekeeper || '') + '</td><td>' + (w.agent || '') + '</td><td>';
        if (isAdmin()) html += '<button type="button" class="btn btn-secondary btn-small" data-edit="' + w.code + '" data-json="' + escape(JSON.stringify(w)) + '">Изменить</button>';
        html += '</td></tr>';
      });
      html += '</tbody></table>';
      setTimeout(() => {
        document.getElementById('sectionTable').querySelectorAll('[data-edit]').forEach((el) => {
          el.onclick = () => { try { doEdit(el.getAttribute('data-edit'), JSON.parse(unescape(el.getAttribute('data-json')))); } catch (_) {} };
        });
      }, 0);
      return html;
    });
    if (isAdmin()) document.getElementById('sectionAdd').onclick = doAdd;
  }

  function customersSection() {
    let refreshFn;
    const doAdd = () => {
      showModal('Добавить клиента', `
        <div class="form-group"><label>Название / Фирма</label><input type="text" id="c_name_client"></div>
        <div class="form-group"><label>Город</label><input type="text" id="c_city"></div>
        <div class="form-group"><label>Адрес</label><input type="text" id="c_address"></div>
        <div class="form-group"><label>Телефон</label><input type="text" id="c_phone"></div>
        <div class="form-group"><label>Логин агента</label><input type="text" id="c_login_agent"></div>
        <div class="form-group"><label>Логин экспедитора</label><input type="text" id="c_login_expeditor"></div>
      `, () => api('/api/v1/customers', {
        method: 'POST',
        body: JSON.stringify({
          name_client: document.getElementById('c_name_client').value.trim() || null,
          city: document.getElementById('c_city').value.trim() || null,
          address: document.getElementById('c_address').value.trim() || null,
          phone: document.getElementById('c_phone').value.trim() || null,
          login_agent: document.getElementById('c_login_agent').value.trim() || null,
          login_expeditor: document.getElementById('c_login_expeditor').value.trim() || null,
        }),
      }).then(() => refreshFn()));
    };
    const doEdit = (id, row) => {
      showModal('Изменить клиента', `
        <div class="form-group"><label>Название</label><input type="text" id="ce_name" value="' + (row.name_client || '').replace(/"/g, '&quot;') + '"></div>
        <div class="form-group"><label>Город</label><input type="text" id="ce_city" value="' + (row.city || '') + '"></div>
        <div class="form-group"><label>Телефон</label><input type="text" id="ce_phone" value="' + (row.phone || '') + '"></div>
        <div class="form-group"><label>Статус</label><input type="text" id="ce_status" value="' + (row.status || '') + '"></div>
      `, () => api('/api/v1/customers/' + id, {
        method: 'PATCH',
        body: JSON.stringify({
          name_client: document.getElementById('ce_name').value.trim() || undefined,
          city: document.getElementById('ce_city').value.trim() || undefined,
          phone: document.getElementById('ce_phone').value.trim() || undefined,
          status: document.getElementById('ce_status').value.trim() || undefined,
        }),
      }).then(() => refreshFn()));
    };
    refreshFn = section('Клиенты', 'Добавить клиента', true, () => api('/api/v1/customers'), (list) => {
      if (!Array.isArray(list)) return '<p>Ошибка загрузки.</p>';
      if (!list.length) return '<p>Нет клиентов.</p>';
      let html = '<table><thead><tr><th>Название</th><th>Город</th><th>Телефон</th><th>Агент</th><th>Экспедитор</th><th>Действия</th></tr></thead><tbody>';
      list.forEach((c) => {
        html += '<tr><td>' + (c.name_client || '') + '</td><td>' + (c.city || '') + '</td><td>' + (c.phone || '') + '</td><td>' + (c.login_agent || '') + '</td><td>' + (c.login_expeditor || '') + '</td><td>';
        html += '<button type="button" class="btn btn-secondary btn-small" data-edit="' + c.id + '" data-json="' + escape(JSON.stringify(c)) + '">Изменить</button>';
        html += '</td></tr>';
      });
      html += '</tbody></table>';
      setTimeout(() => {
        document.getElementById('sectionTable').querySelectorAll('[data-edit]').forEach((el) => {
          el.onclick = () => { try { doEdit(el.getAttribute('data-edit'), JSON.parse(unescape(el.getAttribute('data-json')))); } catch (_) {} };
        });
      }, 0);
      return html;
    });
    document.getElementById('sectionAdd').onclick = doAdd;
  }

  function ordersSection() {
    let refreshFn;
    const doCreate = () => {
      api('/api/v1/customers').then((customers) => {
        if (!customers.length) { alert('Сначала добавьте клиента.'); return; }
        let opts = customers.map((c) => '<option value="' + c.id + '">' + (c.name_client || c.id) + '</option>').join('');
        showModal('Создать заказ', `
          <div class="form-group"><label>Клиент</label><select id="o_customer_id">' + opts + '</select></div>
          <div class="form-group"><label>Статус</label><select id="o_status"><option value="open">open</option><option value="delivery">delivery</option><option value="completed">completed</option><option value="canceled">canceled</option></select></div>
        `, () => api('/api/v1/orders', {
          method: 'POST',
          body: JSON.stringify({
            customer_id: document.getElementById('o_customer_id').value,
            status_code: document.getElementById('o_status').value,
          }),
        }).then(() => refreshFn()));
      });
    };
    refreshFn = section('Заказы', 'Создать заказ', true, () => api('/api/v1/orders'), (list) => {
      if (!Array.isArray(list)) return '<p>Ошибка загрузки.</p>';
      if (!list.length) return '<p>Нет заказов.</p>';
      let html = '<table><thead><tr><th>ID</th><th>Клиент</th><th>Дата</th><th>Статус</th><th>Сумма</th></tr></thead><tbody>';
      list.forEach((o) => {
        html += '<tr><td>' + (o.id || '') + '</td><td>' + (o.customer_id || '') + '</td><td>' + (o.order_date || '') + '</td><td>' + (o.status_code || '') + '</td><td>' + (o.total_amount ?? '') + '</td></tr>';
      });
      html += '</tbody></table>';
      document.getElementById('sectionAdd').onclick = doCreate;
      return html;
    });
    document.getElementById('sectionAdd').onclick = doCreate;
  }

  function operationsSection() {
    let refreshFn;
    const doCreate = () => {
      Promise.all([api('/api/v1/operation-types'), api('/api/v1/dictionary/products'), api('/api/v1/customers')]).then(([types, products, customers]) => {
        const typeOpts = (types || []).map((t) => '<option value="' + t.code + '">' + t.name + ' (' + t.code + ')</option>').join('');
        const prodOpts = (products || []).map((p) => '<option value="' + p.code + '">' + p.name + '</option>').join('');
        const custOpts = (customers || []).map((c) => '<option value="' + c.id + '">' + (c.name_client || c.id) + '</option>').join('');
        showModal('Создать операцию (приход/расход/продажа)', `
          <div class="form-group"><label>Дата</label><input type="date" id="op_date" required></div>
          <div class="form-group"><label>Тип операции</label><select id="op_type">' + typeOpts + '</select></div>
          <div class="form-group"><label>Товар</label><select id="op_product">' + prodOpts + '</select></div>
          <div class="form-group"><label>Количество</label><input type="number" id="op_qty" required></div>
          <div class="form-group"><label>Сумма</label><input type="number" step="0.01" id="op_amount"></div>
          <div class="form-group"><label>Клиент (для продажи/возврата)</label><select id="op_customer"><option value="">—</option>' + custOpts + '</select></div>
          <div class="form-group"><label>Комментарий</label><input type="text" id="op_comment"></div>
        `, () => {
          const d = document.getElementById('op_date').value;
          const cust = document.getElementById('op_customer').value;
          return api('/api/v1/operations', {
            method: 'POST',
            body: JSON.stringify({
              operation_date: d,
              type_code: document.getElementById('op_type').value,
              product_code: document.getElementById('op_product').value,
              quantity: parseInt(document.getElementById('op_qty').value, 10),
              amount: parseFloat(document.getElementById('op_amount').value) || null,
              customer_id: cust || null,
              comment: document.getElementById('op_comment').value.trim() || null,
            }),
          }).then(() => refreshFn());
        });
        document.getElementById('op_date').value = new Date().toISOString().slice(0, 10);
      });
    };
    refreshFn = section('Операции', 'Создать операцию', isAdmin(), () => api('/api/v1/operations'), (list) => {
      if (!Array.isArray(list)) return '<p>Ошибка загрузки.</p>';
      if (!list.length) return '<p>Нет операций.</p>';
      let html = '<table><thead><tr><th>Дата</th><th>Тип</th><th>Товар</th><th>Кол-во</th><th>Сумма</th><th>Кто</th></tr></thead><tbody>';
      list.slice(0, 100).forEach((o) => {
        html += '<tr><td>' + (o.operation_date || '') + '</td><td>' + (o.type_code || '') + '</td><td>' + (o.product_code || '') + '</td><td>' + (o.quantity ?? '') + '</td><td>' + (o.amount ?? '') + '</td><td>' + (o.created_by || '') + '</td></tr>';
      });
      html += '</tbody></table>';
      if (isAdmin()) document.getElementById('sectionAdd').onclick = doCreate;
      return html;
    });
    if (isAdmin()) document.getElementById('sectionAdd').onclick = doCreate;
  }

  function stockSection() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="card"><h2>Остатки по складу</h2><div class="form-group"><label>Склад</label><select id="stock_wh"></select></div><p style="margin:8px 0 0 0"><button type="button" class="btn btn-primary" id="stockLoad">Показать остатки</button></p><div id="sectionTable" style="margin-top:16px"></div></div>';
    api('/api/v1/dictionary/warehouses').then((list) => {
      const sel = document.getElementById('stock_wh');
      (list || []).forEach((w) => { const o = document.createElement('option'); o.value = w.code; o.textContent = w.name + ' (' + w.code + ')'; sel.appendChild(o); });
    });
    document.getElementById('stockLoad').onclick = () => {
      const code = document.getElementById('stock_wh').value;
      if (!code) return;
      api('/api/v1/stock?warehouse_code=' + encodeURIComponent(code)).then((data) => {
        const tableDiv = document.getElementById('sectionTable');
        if (!Array.isArray(data) || !data.length) { tableDiv.innerHTML = '<p>Нет остатков или таблица warehouse_stock не создана (миграция 002).</p>'; return; }
        let html = '<table><thead><tr><th>Код товара</th><th>Название</th><th>Количество</th></tr></thead><tbody>';
        data.forEach((r) => { html += '<tr><td>' + (r.product_code || '') + '</td><td>' + (r.name || '') + '</td><td>' + (r.quantity ?? '') + '</td></tr>'; });
        html += '</tbody></table>';
        tableDiv.innerHTML = html;
      }).catch(() => { document.getElementById('sectionTable').innerHTML = '<p class="err">Ошибка загрузки остатков.</p>'; });
    };
  }

  function showSection(name) {
    document.querySelectorAll('.sidebar a').forEach((a) => a.classList.toggle('active', a.getAttribute('data-section') === name));
    if (name === 'users') usersSection();
    else if (name === 'products') productsSection();
    else if (name === 'warehouses') warehousesSection();
    else if (name === 'customers') customersSection();
    else if (name === 'orders') ordersSection();
    else if (name === 'operations') operationsSection();
    else if (name === 'stock') stockSection();
  }

  document.getElementById('btnLogout').onclick = () => {
    localStorage.removeItem('sds_token');
    window.location.href = '/login';
  };

  document.querySelectorAll('.sidebar a').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); showSection(a.getAttribute('data-section')); };
  });

  loadMe().then(() => {
    showSection('users');
  });
})();
