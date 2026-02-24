(function () {
      var token = localStorage.getItem('sds_token');
      var useBearerHeader = !!token && token !== 'cookie';
      if (!token) { window.location.href = '/login'; return; }

      var languageConfig = null;
      var currentLanguage = (localStorage.getItem('sds_lang') || '').toLowerCase() || 'ru';
      var currentSectionName = null;
      var LANG_FLAGS = { ru: 'RU', uz: 'UZ', en: 'EN' };
      var UI_TEXT = {
        users_title: { ru: 'ÐÐ¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ð¸', uz: 'Foydalanuvchilar', en: 'Users' },
        add_user: { ru: 'ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ', uz: 'Foydalanuvchi qo\'shish', en: 'Add user' },
        menu_access: { ru: 'ÐÑÐ°Ð²Ð° Ð´Ð¾ÑÑÑÐ¿Ð° Ðº Ð¼ÐµÐ½Ñ', uz: 'Menyu huquqlari', en: 'Menu access' },
        login: { ru: 'ÐÐ¾Ð³Ð¸Ð½', uz: 'Login', en: 'Login' },
        fio: { ru: 'Ð¤ÐÐ', uz: 'F.I.Sh.', en: 'Full Name' },
        role: { ru: 'Ð Ð¾Ð»Ñ', uz: 'Rol', en: 'Role' },
        status: { ru: 'Ð¡ÑÐ°ÑÑÑ', uz: 'Holat', en: 'Status' },
        password: { ru: 'ÐÐ°ÑÐ¾Ð»Ñ', uz: 'Parol', en: 'Password' },
        actions: { ru: 'ÐÐµÐ¹ÑÑÐ²Ð¸Ñ', uz: 'Amallar', en: 'Actions' },
        yes: { ru: 'ÐÐ°', uz: 'Ha', en: 'Yes' },
        no: { ru: 'ÐÐµÑ', uz: 'Yo\'q', en: 'No' },
        edit: { ru: 'ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ', uz: 'Tahrirlash', en: 'Edit' },
        change_password: { ru: 'Ð¡Ð¼ÐµÐ½Ð¸ÑÑ Ð¿Ð°ÑÐ¾Ð»Ñ', uz: 'Parolni almashtirish', en: 'Change password' },
        admin_only: { ru: 'ÐÐ¾ÑÑÑÐ¿ ÑÐ¾Ð»ÑÐºÐ¾ Ð´Ð»Ñ Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑÑÐ°ÑÐ¾ÑÐ°.', uz: 'Faqat administrator uchun.', en: 'Admin only.' },
        no_users: { ru: 'ÐÐµÑ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»ÐµÐ¹.', uz: 'Foydalanuvchilar yo\'q.', en: 'No users.' },
        add_user_modal: { ru: 'ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ', uz: 'Foydalanuvchi qo\'shish', en: 'Add user' },
        edit_user_modal: { ru: 'ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ', uz: 'Foydalanuvchini tahrirlash', en: 'Edit user' },
        change_password_modal: { ru: 'Ð¡Ð¼ÐµÐ½Ð¸ÑÑ Ð¿Ð°ÑÐ¾Ð»Ñ', uz: 'Parolni almashtirish', en: 'Change password' },
        new_password: { ru: 'ÐÐ¾Ð²ÑÐ¹ Ð¿Ð°ÑÐ¾Ð»Ñ', uz: 'Yangi parol', en: 'New password' },
      };

      function tUi(key, fallback) {
        var tr = UI_TEXT[key];
        if (!tr) return fallback || key;
        return tr[currentLanguage] || tr.ru || fallback || key;
      }

      function uiTr(key, fallback) {
        return (window._uiTranslations && window._uiTranslations[key]) || fallback || key;
      }

      function formatUserStatusLabel(status) {
        var raw = (status || '').toString().trim().toLowerCase();
        var map = {
          active: { ru: 'Ð°ÐºÑÐ¸Ð²ÐµÐ½', uz: 'faol', en: 'active' },
          'Ð°ÐºÑÐ¸Ð²ÐµÐ½': { ru: 'Ð°ÐºÑÐ¸Ð²ÐµÐ½', uz: 'faol', en: 'active' },
          inactive: { ru: 'Ð½ÐµÐ°ÐºÑÐ¸Ð²ÐµÐ½', uz: 'nofaol', en: 'inactive' },
          'Ð½ÐµÐ°ÐºÑÐ¸Ð²ÐµÐ½': { ru: 'Ð½ÐµÐ°ÐºÑÐ¸Ð²ÐµÐ½', uz: 'nofaol', en: 'inactive' },
        };
        if (map[raw]) return map[raw][currentLanguage] || map[raw].ru;
        return status || '';
      }

      var CHILD_MENU_TEXT = {
        ref_payment: { ru: 'Ð¢Ð¸Ð¿Ñ Ð¾Ð¿Ð»Ð°Ñ', uz: 'To\'lov turlari', en: 'Payment types' },
        ref_products: { ru: 'Ð¢Ð¸Ð¿Ñ Ð¿ÑÐ¾Ð´ÑÐºÑÐ¾Ð²', uz: 'Mahsulot turlari', en: 'Product types' },
        ref_operations: { ru: 'Ð¢Ð¸Ð¿Ñ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹', uz: 'Operatsiya turlari', en: 'Operation types' },
        ref_currency: { ru: 'ÐÐ°Ð»ÑÑÐ°', uz: 'Valyuta', en: 'Currency' },
        ref_cities: { ru: 'ÐÐ¾ÑÐ¾Ð´Ð°', uz: 'Shaharlar', en: 'Cities' },
        ref_territories: { ru: 'Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸', uz: 'Hududlar', en: 'Territories' },
        warehouses: { ru: 'Ð¡ÐºÐ»Ð°Ð´Ñ', uz: 'Omborlar', en: 'Warehouses' },
        products: { ru: 'Ð¢Ð¾Ð²Ð°ÑÑ', uz: 'Tovarlar', en: 'Products' },
        ref_translations: { ru: 'ÐÐµÑÐµÐ²Ð¾Ð´Ñ', uz: 'Tarjimalar', en: 'Translations' },
        customers: { ru: 'ÐÐ¾Ð¸ÑÐº ÐºÐ»Ð¸ÐµÐ½ÑÐ°', uz: 'Mijoz qidirish', en: 'Customer search' },
        customers_create: { ru: 'Ð¡Ð¾Ð·Ð´Ð°ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°', uz: 'Mijoz yaratish', en: 'Create customer' },
        customers_map: { ru: 'ÐÐ»Ð¸ÐµÐ½ÑÑ Ð½Ð° ÐºÐ°ÑÑÐµ', uz: 'Xaritadagi mijozlar', en: 'Customers on map' },
        visits_search: { ru: 'ÐÐ¾Ð¸ÑÐº Ð²Ð¸Ð·Ð¸ÑÐ°', uz: 'Tashrif qidirish', en: 'Visit search' },
        visits_create: { ru: 'Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð²Ð¸Ð·Ð¸Ñ', uz: 'Tashrif yaratish', en: 'Create visit' },
        visits_calendar: { ru: 'ÐÐ°Ð»ÐµÐ½Ð´Ð°ÑÑ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð²', uz: 'Tashriflar taqvimi', en: 'Visits calendar' },
        orders: { ru: 'ÐÐ¾Ð¸ÑÐº Ð·Ð°ÐºÐ°Ð·Ð¾Ð²', uz: 'Buyurtmalar qidiruvi', en: 'Orders search' },
        orders_create: { ru: 'Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð·Ð°ÐºÐ°Ð·', uz: 'Buyurtma yaratish', en: 'Create order' },
        order_items: { ru: 'ÐÐ¾Ð¸ÑÐº Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¹ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²', uz: 'Buyurtma pozitsiyalari', en: 'Order items search' },
        operations: { ru: 'ÐÐ¾Ð¸ÑÐº Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹', uz: 'Operatsiyalar qidiruvi', en: 'Operations search' },
        operations_create: { ru: 'Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ', uz: 'Operatsiya yaratish', en: 'Create operation' },
        cash_pending: { ru: 'ÐÐ¶Ð¸Ð´Ð°ÑÑÐ¸Ðµ Ð¿ÐµÑÐµÐ´Ð°ÑÐ¸ Ð¾Ñ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ¾Ð²', uz: 'Ekspeditordan kutilayotgan topshiruvlar', en: 'Pending handovers' },
        cash_received: { ru: 'ÐÑÐ¸Ð½ÑÑÑÐµ Ð´ÐµÐ½ÑÐ³Ð¸ Ð·Ð° Ð¿ÐµÑÐ¸Ð¾Ð´', uz: 'Davr bo\'yicha qabul qilingan pul', en: 'Received cash' },
        cashier_orders: { ru: 'ÐÐ°ÐºÐ°Ð·Ñ Ð´Ð»Ñ Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¸Ñ Ð¾Ð¿Ð»Ð°ÑÑ', uz: 'To\'lovni tasdiqlash buyurtmalari', en: 'Orders for payment confirmation' },
        report_customers: { ru: 'ÐÐ¾ ÐºÐ»Ð¸ÐµÐ½ÑÐ°Ð¼', uz: 'Mijozlar bo\'yicha', en: 'By customers' },
        report_agents: { ru: 'ÐÐ¾ Ð°Ð³ÐµÐ½ÑÐ°Ð¼', uz: 'Agentlar bo\'yicha', en: 'By agents' },
        report_expeditors: { ru: 'ÐÐ¾ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°Ð¼', uz: 'Ekspeditorlar bo\'yicha', en: 'By expeditors' },
        report_visits: { ru: 'ÐÐ¾ Ð²Ð¸Ð·Ð¸ÑÐ°Ð¼', uz: 'Tashriflar bo\'yicha', en: 'By visits' },
        report_dashboard: { ru: 'Ð¡Ð²Ð¾Ð´Ð½Ð°Ñ Ð°Ð½Ð°Ð»Ð¸ÑÐ¸ÐºÐ°', uz: 'Umumiy analitika', en: 'Dashboard' },
        report_photos: { ru: 'Ð¤Ð¾ÑÐ¾Ð³ÑÐ°ÑÐ¸Ð¸ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð²', uz: 'Mijoz suratlari', en: 'Customer photos' },
      };

      function childLabel(c) {
        var rawCode = c && c.s ? String(c.s) : '';
        var code = rawCode.indexOf('menu.') === 0 ? rawCode.slice(5) : rawCode;
        var dbKey = code.indexOf('menu.') === 0 ? code : ('menu.' + code);
        if (window._uiTranslations && window._uiTranslations[dbKey]) return window._uiTranslations[dbKey];
        var tr = CHILD_MENU_TEXT[code] || CHILD_MENU_TEXT[rawCode];
        return (tr && (tr[currentLanguage] || tr.ru)) || (c && c.l) || code || rawCode || '';
      }

      function loadUiTranslations() {
        var keys = Object.keys(CHILD_MENU_TEXT).map(function (code) { return "menu." + code; });
        keys = keys.concat([
          "app.system_title",
          "app.menu_title",
          "app.user_logged_in_prefix",
          "button.about",
          "button.logout",
          "button.add","button.edit","button.delete","button.save","button.cancel","button.search","button.filter","button.export",
          "label.actions","label.code","label.name","label.description","label.status","label.country","label.symbol","label.default","label.yes","label.no","label.search","label.phone","label.city","label.category","label.date",
          "ui.common.loading","ui.common.no_data",
          "ui.currency.title","ui.currency.add","ui.currency.none","ui.currency.col.code","ui.currency.col.name","ui.currency.col.country","ui.currency.col.symbol","ui.currency.col.default","ui.currency.col.actions",
          "ui.customers.title","ui.customers.add","ui.customers.export","ui.customers.search","ui.customers.find","ui.customers.none",
          "ui.customers.col.actions","ui.customers.col.id","ui.customers.col.name","ui.customers.col.firm","ui.customers.col.category","ui.customers.col.address","ui.customers.col.city","ui.customers.col.territory","ui.customers.col.landmark","ui.customers.col.phone","ui.customers.col.contact","ui.customers.col.tax_id","ui.customers.col.status","ui.customers.col.agent_login","ui.customers.col.expeditor_login","ui.customers.col.has_photo","ui.customers.col.lat","ui.customers.col.lon","ui.customers.col.pinfl","ui.customers.col.contract","ui.customers.col.account","ui.customers.col.bank","ui.customers.col.mfo","ui.customers.col.oked","ui.customers.col.vat_code",
          "ui.dashboard.title","ui.dashboard.date_from","ui.dashboard.date_to","ui.dashboard.statuses","ui.dashboard.category","ui.dashboard.apply","ui.dashboard.loading","ui.dashboard.by_category","ui.dashboard.by_territory","ui.dashboard.export"
        ]);
        return api("/api/v1/translations/resolve", {
          method: "POST",
          body: JSON.stringify({ keys: keys, language: currentLanguage })
        }).then(function (res) {
          window._uiTranslations = (res && res.data) ? res.data : {};
          applySystemTitle();
        }).catch(function () {
          window._uiTranslations = {};
          applySystemTitle();
        });
      }

      function applySystemTitle() {
        var fallback = "Sales and Distribution Management System";
        var title = uiTr("app.system_title", fallback);
        var h1 = document.getElementById("systemTitle");
        if (h1) h1.textContent = title;
        var sidebarTitle = document.getElementById("sidebarTitle");
        if (sidebarTitle) sidebarTitle.textContent = uiTr("app.menu_title", "Menu");
        var userPrefix = document.querySelector(".header .user");
        if (userPrefix) {
          var strong = document.getElementById("userName");
          userPrefix.innerHTML = uiTr("app.user_logged_in_prefix", "Logged in: ") + "<strong id=\"userName\">" + ((strong && strong.textContent) || "") + "</strong>";
        }
        var aboutBtn = document.getElementById("btnAbout");
        if (aboutBtn) aboutBtn.textContent = uiTr("button.about", "About");
        var logoutBtn = document.getElementById("btnLogout");
        if (logoutBtn) logoutBtn.textContent = uiTr("button.logout", "Logout");
        document.title = title;
        applyLiteralI18n(document.querySelector(".header"));
      }

      function applyLiteralI18n(root) {
        root = root || document;
        var textMap = {
          "\u041c\u0435\u043d\u044e": "app.menu_title",
          "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438": "menu.users",
          "\u0421\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a\u0438": "menu.references",
          "\u041a\u043b\u0438\u0435\u043d\u0442\u044b": "ui.customers.title",
          "\u0412\u0430\u043b\u044e\u0442\u0430": "ui.currency.title",
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c": "button.add",
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043a\u043b\u0438\u0435\u043d\u0442\u0430": "ui.customers.add",
          "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0432\u0430\u043b\u044e\u0442\u0443": "ui.currency.add",
          "\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0432 Excel \u0432\u0441\u0435\u0445 \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432": "ui.customers.export",
          "\u041f\u043e\u0438\u0441\u043a": "label.search",
          "\u041d\u0430\u0439\u0442\u0438": "ui.customers.find",
          "\u0424\u0438\u043b\u044c\u0442\u0440": "button.filter",
          "\u041f\u0440\u0438\u043c\u0435\u043d\u0438\u0442\u044c": "ui.dashboard.apply",
          "\u042d\u043a\u0441\u043f\u043e\u0440\u0442 \u0432 Excel": "ui.dashboard.export",
          "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c": "button.edit",
          "\u0423\u0434\u0430\u043b\u0438\u0442\u044c": "button.delete",
          "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c": "button.save",
          "\u041e\u0442\u043c\u0435\u043d\u0430": "button.cancel",
          "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f": "label.actions",
          "\u041a\u043e\u0434": "label.code",
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435": "label.name",
          "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435": "label.description",
          "\u0421\u0442\u0440\u0430\u043d\u0430": "label.country",
          "\u0421\u0438\u043c\u0432\u043e\u043b": "label.symbol",
          "\u041f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e": "label.default",
          "\u0414\u0430": "label.yes",
          "\u041d\u0435\u0442": "label.no",
          "\u0421\u0432\u043e\u0434\u043d\u0430\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430": "ui.dashboard.title",
          "\u0414\u0430\u0442\u0430 \u043f\u043e\u0441\u0442\u0430\u0432\u043a\u0438 \u0437\u0430\u043a\u0430\u0437\u0430 \u0441": "ui.dashboard.date_from",
          "\u0414\u0430\u0442\u0430 \u043f\u043e\u0441\u0442\u0430\u0432\u043a\u0438 \u0437\u0430\u043a\u0430\u0437\u0430 \u043f\u043e": "ui.dashboard.date_to",
          "\u0421\u0442\u0430\u0442\u0443\u0441\u044b": "ui.dashboard.statuses",
          "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f": "ui.dashboard.category",
          "\u041f\u043e \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f\u043c \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432": "ui.dashboard.by_category",
          "\u041f\u043e \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044f\u043c": "ui.dashboard.by_territory",
          "\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445.": "ui.common.no_data",
          "\u041d\u0435\u0442 \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432.": "ui.customers.none",
          "\u041d\u0435\u0442 \u0432\u0430\u043b\u044e\u0442.": "ui.currency.none"
        };

        var phMap = {
          "ID \u043a\u043b\u0438\u0435\u043d\u0442\u0430": "ui.customers.col.id",
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u0430": "ui.customers.col.name",
          "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0444\u0438\u0440\u043c\u044b": "ui.customers.col.firm",
          "\u0413\u043e\u0440\u043e\u0434": "ui.customers.col.city",
          "\u0422\u0435\u043b\u0435\u0444\u043e\u043d": "ui.customers.col.phone",
          "\u0418\u041d\u041d": "ui.customers.col.tax_id",
          "Category": "label.category",
          "Key contains...": "label.search"
        };

        var nodes = root.querySelectorAll('h1,h2,h3,h4,th,label,button,a,p,span,option');
        nodes.forEach(function (el) {
          if (!el || el.id === 'userName') return;
          if (el.children && el.children.length) return;
          var raw = (el.textContent || '').trim();
          if (!raw) return;
          var key = textMap[raw];
          if (!key && raw.indexOf('menu.') === 0) key = raw;
          if (key) el.textContent = uiTr(key, raw);
        });

        var placeholders = root.querySelectorAll('input[placeholder],textarea[placeholder]');
        placeholders.forEach(function (el) {
          var raw = (el.getAttribute('placeholder') || '').trim();
          if (!raw) return;
          var key = phMap[raw];
          if (key) el.setAttribute('placeholder', uiTr(key, raw));
        });
      }

      function pathSupportsLanguage(path) {
        return path.indexOf('/api/v1/menu') === 0
          || path.indexOf('/api/v1/operation-types') === 0
          || path.indexOf('/api/v1/orders/statuses') === 0
          || path.indexOf('/api/v1/dictionary/payment-types') === 0;
      }

      function appendLanguage(path, method) {
        var upperMethod = (method || 'GET').toUpperCase();
        if (upperMethod !== 'GET') return path;
        if (!pathSupportsLanguage(path)) return path;
        if (/[?&]language=/.test(path)) return path;
        return path + (path.indexOf('?') >= 0 ? '&' : '?') + 'language=' + encodeURIComponent(currentLanguage);
      }

      var api = function (path, opts) {
        opts = opts || {};
        var method = opts.method || 'GET';
        var finalPath = path.indexOf('http') === 0 ? path : appendLanguage(path, method);
        var url = finalPath.indexOf('http') === 0 ? finalPath : (window.location.origin + finalPath);
        var headers = { 'Content-Type': 'application/json' };
        if (useBearerHeader) headers['Authorization'] = 'Bearer ' + token;
        if (opts.headers) for (var k in opts.headers) headers[k] = opts.headers[k];
        return fetch(url, { method: method, headers: headers, body: opts.body, credentials: 'same-origin' }).then(function (r) {
          return r.text().then(function (text) {
            var data = null;
            try { data = text ? JSON.parse(text) : null; } catch (_) {}
            if (!r.ok) throw { status: r.status, data: data };
            return data;
          });
        });
      };
      function asList(payload) {
        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray(payload.data)) return payload.data;
        if (payload && Array.isArray(payload.items)) return payload.items;
        if (payload && Array.isArray(payload.orders)) return payload.orders;
        return [];
      }

      function parseBackendDate(value) {
        if (!value) return null;
        try {
          var raw = String(value).trim();
          if (!raw) return null;
          var normalized = raw.replace(' ', 'T');
          var hasTimezone = /([zZ]|[+\-]\d{2}:\d{2})$/.test(normalized);
          if (!hasTimezone && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(normalized)) {
            normalized += 'Z';
          }
          var d = new Date(normalized);
          if (isNaN(d.getTime())) return null;
          return d;
        } catch (e) {
          return null;
        }
      }

      var currentUser = { login: '', fio: '', role: '' };
      var isAdmin = function () { return (currentUser.role || '').toLowerCase() === 'admin'; };
      var menuByCode = {};
      var menuItems = [];
      var currentSectionAccess = 'full';

      var SECTION_TO_CODE = {
        users: 'users',
        ref_parent: 'references', ref_payment: 'ref_payment', ref_products: 'ref_products', ref_operations: 'ref_operations', ref_currency: 'ref_currency', ref_cities: 'ref_cities', ref_territories: 'ref_territories', ref_translations: 'ref_translations', warehouses: 'warehouses', products: 'products',
        customers_parent: 'customers', customers: 'customers', customers_create: 'customers', customers_map: 'customers',
        visits_parent: 'visits', visits_search: 'visits', visits_create: 'visits', visits_calendar: 'visits',
        orders_parent: 'orders', orders: 'orders', orders_create: 'orders', order_items: 'orders',
        ops_parent: 'operations', operations: 'operations', operations_create: 'operations',
        stock: 'balances',
        cash_parent: 'cashier', cash_pending: 'cashier', cash_received: 'cashier', cashier_orders: 'cashier',
        reports_parent: 'reports', report_customers: 'reports', report_agents: 'reports', report_expeditors: 'reports', report_visits: 'reports', report_dashboard: 'reports', report_photos: 'reports',
        role_menu_access: 'users'
      };
      function sectionToCode(name) { return SECTION_TO_CODE[name] || name; }

      var SIDEBAR_ICONS = {
        users: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
        folder: '<path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>',
        building: '<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2z"/>',
        calendar: '<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>',
        'shopping-cart': '<path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v12z"/>',
        truck: '<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
        box: '<path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z"/>',
        dollar: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>',
        chart: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>'
      };
      var SIDEBAR_CHILDREN = {
        references: [{ s: 'ref_payment', l: 'Ð¢Ð¸Ð¿Ñ Ð¾Ð¿Ð»Ð°Ñ' }, { s: 'ref_products', l: 'Ð¢Ð¸Ð¿Ñ Ð¿ÑÐ¾Ð´ÑÐºÑÐ¾Ð²' }, { s: 'ref_operations', l: 'Ð¢Ð¸Ð¿Ñ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹' }, { s: 'ref_currency', l: 'ÐÐ°Ð»ÑÑÐ°' }, { s: 'ref_cities', l: 'ÐÐ¾ÑÐ¾Ð´Ð°' }, { s: 'ref_territories', l: 'Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸' }, { s: 'warehouses', l: 'Ð¡ÐºÐ»Ð°Ð´Ñ' }, { s: 'products', l: 'Ð¢Ð¾Ð²Ð°ÑÑ' }],
        customers: [{ s: 'customers', l: 'ÐÐ¾Ð¸ÑÐº ÐºÐ»Ð¸ÐµÐ½ÑÐ°' }, { s: 'customers_create', l: 'Ð¡Ð¾Ð·Ð´Ð°ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°' }, { s: 'customers_map', l: 'ÐÐ»Ð¸ÐµÐ½ÑÑ Ð½Ð° ÐºÐ°ÑÑÐµ' }],
        visits: [{ s: 'visits_search', l: 'ÐÐ¾Ð¸ÑÐº Ð²Ð¸Ð·Ð¸ÑÐ°' }, { s: 'visits_create', l: 'Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð²Ð¸Ð·Ð¸Ñ' }, { s: 'visits_calendar', l: 'ÐÐ°Ð»ÐµÐ½Ð´Ð°ÑÑ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð²' }],
        orders: [{ s: 'orders', l: 'ÐÐ¾Ð¸ÑÐº Ð·Ð°ÐºÐ°Ð·Ð¾Ð²' }, { s: 'orders_create', l: 'Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð·Ð°ÐºÐ°Ð·' }, { s: 'order_items', l: 'ÐÐ¾Ð¸ÑÐº Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¹ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²' }],
        operations: [{ s: 'operations', l: 'ÐÐ¾Ð¸ÑÐº Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹' }, { s: 'operations_create', l: 'Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ' }],
        cashier: [{ s: 'cash_pending', l: 'ÐÐ¶Ð¸Ð´Ð°ÑÑÐ¸Ðµ Ð¿ÐµÑÐµÐ´Ð°ÑÐ¸ Ð¾Ñ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ¾Ð²' }, { s: 'cash_received', l: 'ÐÑÐ¸Ð½ÑÑÑÐµ Ð´ÐµÐ½ÑÐ³Ð¸ Ð·Ð° Ð¿ÐµÑÐ¸Ð¾Ð´' }, { s: 'cashier_orders', l: 'ÐÐ°ÐºÐ°Ð·Ñ Ð´Ð»Ñ Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¸Ñ Ð¾Ð¿Ð»Ð°ÑÑ' }],
        reports: [{ s: 'report_customers', l: 'ÐÐ¾ ÐºÐ»Ð¸ÐµÐ½ÑÐ°Ð¼' }, { s: 'report_agents', l: 'ÐÐ¾ Ð°Ð³ÐµÐ½ÑÐ°Ð¼' }, { s: 'report_expeditors', l: 'ÐÐ¾ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°Ð¼' }, { s: 'report_visits', l: 'ÐÐ¾ Ð²Ð¸Ð·Ð¸ÑÐ°Ð¼' }, { s: 'report_dashboard', l: 'Ð¡Ð²Ð¾Ð´Ð½Ð°Ñ Ð°Ð½Ð°Ð»Ð¸ÑÐ¸ÐºÐ°' }, { s: 'report_photos', l: 'Ð¤Ð¾ÑÐ¾Ð³ÑÐ°ÑÐ¸Ð¸ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð²' }]
      };
      var SIDEBAR_SECTIONS = { users: 'users', references: 'ref_parent', ref_translations: 'ref_translations', customers: 'customers_parent', visits: 'visits_parent', orders: 'orders_parent', operations: 'ops_parent', balances: 'stock', cashier: 'cash_parent', reports: 'reports_parent' };
      if (SIDEBAR_CHILDREN.references && !SIDEBAR_CHILDREN.references.some(function (c) { return c.s === 'ref_translations'; })) {
        SIDEBAR_CHILDREN.references.push({ s: 'ref_translations', l: 'ÐÐµÑÐµÐ²Ð¾Ð´Ñ' });
      }
      var PARENT_IDS = { references: ['refParent', 'refSubmenu'], customers: ['customersParent', 'customersSubmenu'], visits: ['visitsParent', 'visitsSubmenu'], orders: ['ordersParent', 'ordersSubmenu'], operations: ['opsParent', 'opsSubmenu'], cashier: ['cashParent', 'cashSubmenu'], reports: ['reportsParent', 'reportsSubmenu'] };

      function renderSidebar(items) {
        var el = document.getElementById('sidebarMenu');
        if (!el) return;
        menuByCode = {};
        (items || []).forEach(function (m) { menuByCode[m.code] = m.access_level || 'view'; });
        menuItems = items || [];

        // ÐÑÐ¾Ð¿ÑÑÐºÐ°ÐµÐ¼ ÑÐ¾Ð»ÑÐºÐ¾ Ð¿Ð¾Ð´Ð¿ÑÐ½ÐºÑÑ ÑÐ¿ÑÐ°Ð²Ð¾ÑÐ½Ð¸ÐºÐ¾Ð² (ref_payment, ref_products Ð¸ Ñ.Ð´.)
        // ÐºÐ¾ÑÐ¾ÑÑÐµ Ð²Ð¾Ð·Ð²ÑÐ°ÑÐµÐ½Ñ API ÐºÐ°Ðº Ð¾ÑÐ´ÐµÐ»ÑÐ½ÑÐµ Ð·Ð°Ð¿Ð¸ÑÐ¸
        var skipCodes = {};
        if (SIDEBAR_CHILDREN['references']) {
          SIDEBAR_CHILDREN['references'].forEach(function (child) {
            // ÐÑÐ¾Ð¿ÑÑÐºÐ°ÐµÐ¼ ÑÐ¾Ð»ÑÐºÐ¾ ÐµÑÐ»Ð¸ ÑÑÐ¾Ñ Ð¿Ð¾Ð´Ð¿ÑÐ½ÐºÑ ÑÐ¿ÑÐ°Ð²Ð¾ÑÐ½Ð¸ÐºÐ° ÐµÑÑÑ Ð² API
            if (menuByCode[child.s] && child.s !== 'references') {
              skipCodes[child.s] = true;
            }
          });
        }

        var html = '';
        (items || []).forEach(function (m) {
          var code = m.code;

          // ÐÑÐ¾Ð¿ÑÑÐºÐ°ÐµÐ¼ Ð¢ÐÐÐ¬ÐÐ Ð¿Ð¾Ð´Ð¿ÑÐ½ÐºÑÑ ÑÐ¿ÑÐ°Ð²Ð¾ÑÐ½Ð¸ÐºÐ¾Ð²
          if (skipCodes[code]) return;

          var section = SIDEBAR_SECTIONS[code] || code;
          var label = uiTr('menu.' + code, m.label || code);
          var icon = SIDEBAR_ICONS[m.icon] || SIDEBAR_ICONS[code] || '';
          var ids = PARENT_IDS[code];
          var children = SIDEBAR_CHILDREN[code];
          if (children && children.length) {
            html += '<a href="#" class="parent" id="' + (ids ? ids[0] : '') + '" data-section="' + section + '"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">' + icon + '</svg></span>' + label + '</a>';
            html += '<div class="submenu" id="' + (ids ? ids[1] : '') + '">';
            children.forEach(function (c) {
              var childCode = sectionToCode(c.s);
              if (!menuByCode[childCode] || menuByCode[childCode] === 'none') return;
              html += '<a href="#" data-section="' + c.s + '">' + childLabel(c) + '</a>';
            });
            html += '</div>';
          } else {
            html += '<a href="#" data-section="' + section + '"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">' + icon + '</svg></span>' + label + '</a>';
          }
        });
        el.innerHTML = html;
      }

      function applyViewOnlyAccess() {
        if (currentSectionAccess !== 'view') return;
        var sel = '#content .sectionAdd, #content #sectionAdd, #content .btn-edit, #content .btn-delete, #content button[id*="Add"]:not(.btn-secondary), #content [data-action="edit"], #content [data-action="delete"], #content a[data-edit]';
        document.querySelectorAll(sel).forEach(function (e) { e.style.display = 'none'; });
      }

      var loadMe = function () {
        return api('/api/v1/auth/me').then(function (u) {
          currentUser = u || {};
          window.currentUser = currentUser;
          var el = document.getElementById('userName');
          if (el) el.textContent = (currentUser.fio || currentUser.login || 'â') + ' (' + (currentUser.role || 'â') + ')';
        }).catch(function () {
          localStorage.removeItem('sds_token');
          window.location.href = '/login';
        });
      };

      var loadMenu = function () {
        return api('/api/v1/menu').then(function (data) {
          var list = (data && data.menu) ? data.menu : [];
          console.log('API /menu returned:', list);
          renderSidebar(list);
          console.log('menuByCode after renderSidebar:', menuByCode);
          return list;
        }).catch(function () {
          menuByCode = {};
          menuItems = [];
          renderSidebar([]);
          return [];
        });
      };

      function renderLanguageSwitcher(enabled) {
        var wrap = document.getElementById('langSwitcher');
        if (!wrap) return;
        enabled = enabled || ['ru', 'uz', 'en'];
        wrap.innerHTML = '';
        var select = document.createElement('select');
        select.className = 'lang-select';
        select.title = 'Language';
        enabled.forEach(function (lang) {
          var opt = document.createElement('option');
          opt.value = lang;
          opt.textContent = LANG_FLAGS[lang] || lang.toUpperCase();
          select.appendChild(opt);
        });
        select.value = currentLanguage;
        select.onchange = function () {
          var lang = (select.value || '').toLowerCase();
          if (!lang || lang === currentLanguage) return;
          currentLanguage = lang;
          localStorage.setItem('sds_lang', lang);
          loadUiTranslations().then(function () { return loadMenu(); }).then(function () {
            var first = (menuItems && menuItems[0]) ? (SIDEBAR_SECTIONS[menuItems[0].code] || menuItems[0].code || 'users') : 'users';
            showSection(currentSectionName || first);
          });
        };
        wrap.appendChild(select);
      }

      function initLanguageSwitcher() {
        return api('/api/v1/translations/config/languages').then(function (cfg) {
          languageConfig = cfg || {};
          var enabled = Array.isArray(languageConfig.enabled_languages) && languageConfig.enabled_languages.length
            ? languageConfig.enabled_languages
            : ['ru', 'uz', 'en'];
          if (enabled.indexOf(currentLanguage) < 0) {
            currentLanguage = (languageConfig.default_language || enabled[0] || 'ru').toLowerCase();
            localStorage.setItem('sds_lang', currentLanguage);
          }
          renderLanguageSwitcher(enabled);
          return loadUiTranslations();
        }).catch(function () {
          renderLanguageSwitcher(['ru', 'uz', 'en']);
          return loadUiTranslations();
        });
      }

      var showModal = function (title, bodyHtml, onSave, opts) {
        var wrap = document.getElementById('modalContainer');
        if (!wrap) return;
        var id = 'modal' + Date.now();
        var closeOnly = opts && opts.closeOnly;
        var actionsHtml = closeOnly
          ? '<div class="modal-actions" style="justify-content:center"><button type="button" class="btn btn-primary" id="' + id + '_back">ÐÐ°Ð·Ð°Ð´</button></div>'
          : '<div class="modal-actions"><button type="button" class="btn btn-primary" id="' + id + '_save">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ</button><button type="button" class="btn btn-secondary" id="' + id + '_cancel">ÐÑÐ¼ÐµÐ½Ð°</button></div>';
        wrap.innerHTML = '<div class="modal show" id="' + id + '"><div class="modal-inner"><h3>' + title + '</h3><div id="' + id + '_body">' + bodyHtml + '</div>' + actionsHtml + '<div id="' + id + '_err" class="err"></div></div></div>';
        var errEl = document.getElementById(id + '_err');
        var closeModal = function () { document.getElementById(id).classList.remove('show'); };
        if (closeOnly) {
          document.getElementById(id + '_back').onclick = closeModal;
        } else {
          document.getElementById(id + '_cancel').onclick = closeModal;
          document.getElementById(id + '_save').onclick = function () {
            if (errEl) errEl.textContent = '';
            var p = onSave(errEl);
            if (p && p.then) p.then(closeModal).catch(function (e) {
              if (!errEl) return;
              var detail = e && e.data && e.data.detail;
              if (!detail) {
                var statusMsg = e && e.status ? ' [' + e.status + ']' : '';
                errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÐµÐ´Ð¸Ð½ÐµÐ½Ð¸Ñ Ð¸Ð»Ð¸ ÑÐµÑÐ²ÐµÑÐ°.' + statusMsg;
                return;
              }
              if (typeof detail === 'string') { errEl.textContent = detail; return; }
              if (Array.isArray(detail)) {
                var parts = detail.map(function (x) {
                  var loc = x.loc && x.loc.slice ? x.loc.slice(-1).join(' ') : '';
                  var msg = x.msg || x.message || '';
                  if (msg && msg.indexOf('Value error, ') === 0) msg = msg.replace('Value error, ', '');
                  return (loc ? loc + ': ' : '') + msg;
                });
                errEl.textContent = parts.join(' ');
              } else { errEl.textContent = typeof detail === 'object' ? JSON.stringify(detail) : String(detail); }
            }); else closeModal();
          };
        }
      };
      function formatDateOnly(isoStr) {
        if (!isoStr) return '';
        try {
          var d = parseBackendDate(isoStr);
          if (!d) return isoStr;
          return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) { return isoStr; }
      }
      function dateToApiFormat(val) {
        if (val == null || val === '') return null;
        var s = String(val).trim();
        if (!s) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        var m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (m) return m[3] + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0');
        return s;
      }
      function visitStatusRu(code) {
        var map = { planned: 'ÐÐ°Ð¿Ð»Ð°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½', completed: 'ÐÐ°Ð²ÐµÑÑÑÐ½', cancelled: 'ÐÑÐ¼ÐµÐ½ÑÐ½', postponed: 'ÐÐ° ÑÐ°ÑÑÐ¼Ð¾ÑÑÐµÐ½Ð¸Ð¸' };
        return (map[code] || code || '');
      }

      var showSection = function (name) {
        currentSectionName = name;
        var code = sectionToCode(name);
        console.log('showSection: name=' + name + ', code=' + code + ', menuByCode[code]=' + menuByCode[code]);
        if (!menuByCode[code] || menuByCode[code] === 'none') {
          console.error('Access denied for section: ' + name + ', code: ' + code);
          var content = document.getElementById('content');
          if (content) content.innerHTML = '<div class="card"><h2>ÐÐ¾ÑÑÑÐ¿ Ð·Ð°Ð¿ÑÐµÑÑÐ½</h2><p>Access Denied. Ð£ Ð²Ð°Ñ Ð½ÐµÑ Ð¿ÑÐ°Ð² Ð½Ð° ÑÑÐ¾Ñ ÑÐ°Ð·Ð´ÐµÐ».</p><p><button type="button" class="btn btn-primary" id="accessDeniedBack">ÐÐ° Ð³Ð»Ð°Ð²Ð½ÑÑ</button></p></div>';
          document.getElementById('accessDeniedBack').onclick = function () {
            var first = (menuItems && menuItems[0]) ? (SIDEBAR_SECTIONS[menuItems[0].code] || 'users') : 'users';
            showSection(first);
          };
          return;
        }
        currentSectionAccess = menuByCode[code] || 'full';
        document.querySelectorAll('.sidebar a').forEach(function (a) {
          var s = a.getAttribute('data-section');
          a.classList.toggle('active', s === name);
          if (a.id === 'refParent') a.classList.toggle('open', (name === 'ref_parent' || name === 'ref_payment' || name === 'ref_products' || name === 'ref_operations' || name === 'ref_currency' || name === 'ref_cities' || name === 'ref_territories' || name === 'ref_translations' || name === 'warehouses' || name === 'products'));
          if (a.id === 'customersParent') a.classList.toggle('open', (name === 'customers_parent' || name === 'customers' || name === 'customers_create' || name === 'customers_map'));
          if (a.id === 'visitsParent') a.classList.toggle('open', (name === 'visits_parent' || name === 'visits_search' || name === 'visits_create' || name === 'visits_calendar'));
          if (a.id === 'ordersParent') a.classList.toggle('open', (name === 'orders_parent' || name === 'orders' || name === 'orders_create' || name === 'order_items'));
          if (a.id === 'opsParent') a.classList.toggle('open', (name === 'ops_parent' || name === 'operations' || name === 'operations_create'));
          if (a.id === 'cashParent') a.classList.toggle('open', (name === 'cash_parent' || name === 'cash_pending' || name === 'cash_received' || name === 'cashier_orders'));
          if (a.id === 'reportsParent') a.classList.toggle('open', (name === 'reports_parent' || name === 'report_customers' || name === 'report_agents' || name === 'report_expeditors' || name === 'report_visits' || name === 'report_dashboard' || name === 'report_photos'));
        });
        var sub = document.getElementById('refSubmenu');
        if (sub) sub.classList.toggle('open', name === 'ref_parent' || name === 'ref_payment' || name === 'ref_products' || name === 'ref_operations' || name === 'ref_currency' || name === 'ref_cities' || name === 'ref_territories' || name === 'ref_translations' || name === 'warehouses' || name === 'products');
        var customersSub = document.getElementById('customersSubmenu');
        if (customersSub) customersSub.classList.toggle('open', name === 'customers_parent' || name === 'customers' || name === 'customers_create' || name === 'customers_map');
        var visitsSub = document.getElementById('visitsSubmenu');
        if (visitsSub) visitsSub.classList.toggle('open', name === 'visits_parent' || name === 'visits_search' || name === 'visits_create' || name === 'visits_calendar');
        var ordersSub = document.getElementById('ordersSubmenu');
        if (ordersSub) ordersSub.classList.toggle('open', name === 'orders_parent' || name === 'orders' || name === 'orders_create' || name === 'order_items');
        var opsSub = document.getElementById('opsSubmenu');
        if (opsSub) opsSub.classList.toggle('open', name === 'ops_parent' || name === 'operations' || name === 'operations_create');
        var cashSub = document.getElementById('cashSubmenu');
        if (cashSub) cashSub.classList.toggle('open', name === 'cash_parent' || name === 'cash_pending' || name === 'cash_received' || name === 'cashier_orders');
        var reportsSub = document.getElementById('reportsSubmenu');
        if (reportsSub) reportsSub.classList.toggle('open', name === 'reports_parent' || name === 'report_customers' || name === 'report_agents' || name === 'report_expeditors' || name === 'report_visits' || name === 'report_dashboard' || name === 'report_photos');
        var content = document.getElementById('content');
        if (!content) return;
        if (name === 'ref_parent' || name === 'ops_parent' || name === 'orders_parent' || name === 'customers_parent' || name === 'visits_parent' || name === 'cash_parent' || name === 'reports_parent') return;
        // ÐÐ»Ñ Ð¿ÑÐ½ÐºÑÐ° Ð¼ÐµÐ½Ñ "Ð¡Ð¾Ð·Ð´Ð°ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°" â ÑÐ¾ÑÐ¼Ð° ÑÑÐ°Ð·Ñ Ð½Ð° ÑÑÑÐ°Ð½Ð¸ÑÐµ (Ð±ÐµÐ· Ð¼Ð¾Ð´Ð°Ð»ÐºÐ¸)
        if (name === 'customers_create') {
          loadCitiesAndTerritories().then(function () {
            return api('/api/v1/dictionary/user-logins').catch(function () { return []; });
          }).then(function (userList) {
            userList = userList || [];
            var content = document.getElementById('content');
            if (!content) return;
            var formHtml = custEditFormHtml({ status: 'ÐÐºÑÐ¸Ð²Ð½ÑÐ¹' }, userList);
            content.innerHTML = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°</h2><div id="custCreateErr" class="err" style="margin-bottom:12px"></div><div id="custCreateForm">' + formHtml + '</div><div class="modal-actions" style="margin-top:20px"><button type="button" class="btn btn-primary" id="custCreateSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ</button><button type="button" class="btn btn-secondary" id="custCreateCancel">ÐÑÐ¼ÐµÐ½Ð°</button></div></div>';
            document.getElementById('custCreateCancel').onclick = function () { showSection('customers'); };
            document.getElementById('custCreateSave').onclick = function () {
              var errEl = document.getElementById('custCreateErr');
              if (errEl) errEl.textContent = '';
              api('/api/v1/customers', { method: 'POST', body: JSON.stringify(custFormBody()) }).then(function () { showSection('customers'); }).catch(function (e) {
                if (!errEl) return;
                var d = e && e.data && e.data.detail;
                errEl.textContent = (typeof d === 'string' ? d : (d ? JSON.stringify(d) : 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ'));
              });
            };
          });
          return;
        }
        if (name === 'customers_map') {
          loadSectionCustomersMap();
          return;
        }
        // ÐÐ»Ñ Ð¿ÑÐ½ÐºÑÐ° Ð¼ÐµÐ½Ñ "Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ" â Ð·Ð°Ð³ÑÑÐ¶Ð°ÐµÐ¼ ÑÐ°Ð·Ð´ÐµÐ» Ð¸ ÑÑÐ°Ð·Ñ Ð¾ÑÐºÑÑÐ²Ð°ÐµÐ¼ ÑÐ¾ÑÐ¼Ñ ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ
        if (name === 'operations_create') {
          loadSectionOperations(false, true);
          return;
        }
        // ÐÐ»Ñ Ð¿ÑÐ½ÐºÑÐ° Ð¼ÐµÐ½Ñ "Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð·Ð°ÐºÐ°Ð·" Ð¾ÑÐºÑÑÐ²Ð°ÐµÐ¼ ÑÐ¾ÑÐ¼Ñ ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ Ð·Ð°ÐºÐ°Ð·Ð°
        if (name === 'orders_create') {
          // ÐÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÐ¼ ÑÑÑÐµÑÑÐ²ÑÑÑÑÑ ÐºÐ½Ð¾Ð¿ÐºÑ "Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð·Ð°ÐºÐ°Ð·" Ð¸Ð· ÑÐ°Ð·Ð´ÐµÐ»Ð° Ð·Ð°ÐºÐ°Ð·Ð¾Ð²
          loadSectionOrders();
          setTimeout(function () {
            var btn = document.getElementById('orderAdd');
            if (btn) btn.click();
          }, 0);
          return;
        }
        content.innerHTML = '<div class="card"><p>ÐÐ°Ð³ÑÑÐ·ÐºÐ° ÑÐ°Ð·Ð´ÐµÐ»Ð°...</p></div>';
        if (name === 'users') loadSectionUsers();
        else if (name === 'products') loadSectionProducts();
        else if (name === 'ref_payment') loadSectionRefPayment();
        else if (name === 'ref_products') loadSectionRefProducts();
        else if (name === 'ref_operations') loadSectionRefOperations();
        else if (name === 'ref_currency') loadSectionRefCurrency();
        else if (name === 'warehouses') loadSectionWarehouses();
        else if (name === 'ref_cities') loadSectionCities();
        else if (name === 'ref_territories') loadSectionTerritories();
        else if (name === 'ref_translations') loadSectionTranslations();
        else if (name === 'customers') loadSectionCustomers();
        else if (name === 'orders') loadSectionOrders();
        else if (name === 'order_items') loadSectionOrderItems();
        else if (name === 'operations') loadSectionOperations(false);
        else if (name === 'stock') loadSectionStock();
        else if (name === 'cash_pending') loadSectionCashPending();
        else if (name === 'cash_received') loadSectionCashReceived();
        else if (name === 'cashier_orders') loadSectionCashierOrders();
        else if (name === 'visits_search') loadSectionVisitsSearch();
        else if (name === 'visits_create') loadSectionVisitsCreate();
        else if (name === 'visits_calendar') loadSectionVisitsCalendar();
        else if (name === 'report_customers') loadSectionReportCustomers();
        else if (name === 'report_agents') loadSectionReportAgents();
        else if (name === 'report_expeditors') loadSectionReportExpeditors();
        else if (name === 'report_visits') loadSectionReportVisits();
        else if (name === 'report_dashboard') loadSectionReportDashboard();
        else if (name === 'report_photos') loadSectionReportPhotos();
        setTimeout(applyViewOnlyAccess, 300);
        setTimeout(function () { applyLiteralI18n(document.getElementById("content")); }, 320);
      };

      function loadSectionUsers() {
        api('/api/v1/users').catch(function (e) { if (e && e.status === 403) return null; throw e; }).then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="sectionAdd">' + tUi('add_user', 'Add user') + '</button>' : '';
          var roleMenuBtn = isAdmin() ? ' <button type="button" class="btn btn-secondary" id="btnRoleMenuAccess">' + tUi('menu_access', 'Menu access') + '</button>' : '';
          var html = '<div class="card"><h2>' + tUi('users_title', 'Users') + '</h2><p style="margin:0 0 12px 0">' + addBtn + roleMenuBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          var errDiv = document.getElementById('sectionErr');
          if (list === null || !Array.isArray(list)) { tableDiv.innerHTML = '<p>' + tUi('admin_only', 'Admin only.') + '</p>'; return; }
          if (!list.length) { tableDiv.innerHTML = '<p>' + tUi('no_users', 'No users.') + '</p>'; return; }
          var sortCol = 'login';
          var sortDir = 1;
          function renderTable(data) {
            var sorted = data.slice().sort(function (a, b) { return tableSortCompare(a, b, sortCol, sortDir, function (r, c) { if (c === 'has_password') return (r.has_password ? '1' : '0'); return (r[c] || '').toString().toLowerCase(); }); });
            var t = '<table><thead><tr>' + sortableTh('login', tUi('login', 'Login'), sortCol, sortDir) + sortableTh('fio', tUi('fio', 'Full Name'), sortCol, sortDir) + sortableTh('role', tUi('role', 'Role'), sortCol, sortDir) + sortableTh('status', tUi('status', 'Status'), sortCol, sortDir) + sortableTh('has_password', tUi('password', 'Password'), sortCol, sortDir) + '<th>' + tUi('actions', 'Actions') + '</th></tr></thead><tbody>';
            sorted.forEach(function (u) {
            var login = (u.login || '').replace(/"/g, '&quot;');
            var fio = (u.fio || '').replace(/"/g, '&quot;');
            var status = (u.status || '').replace(/"/g, '&quot;');
            var phone = (u.phone || '').replace(/"/g, '&quot;');
            var email = (u.email || '').replace(/"/g, '&quot;');
            t += '<tr><td>' + (u.login || '') + '</td><td>' + (u.fio || '') + '</td><td>' + (u.role || '') + '</td><td>' + formatUserStatusLabel(u.status) + '</td><td>' + (u.has_password ? tUi('yes', 'Yes') : tUi('no', 'No')) + '</td><td>';
            if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-edit="' + login + '" data-fio="' + fio + '" data-role="' + (u.role || '') + '" data-status="' + status + '" data-phone="' + phone + '" data-email="' + email + '">' + tUi('edit', 'Edit') + '</button> <button type="button" class="btn btn-secondary btn-small" data-pwd="' + (u.login || '') + '">' + tUi('change_password', 'Change password') + '</button>';
            t += '</td></tr>';
            });
            t += '</tbody></table>';
            tableDiv.innerHTML = t;
            tableDiv.querySelectorAll('th.sortable').forEach(function (th) {
              th.onclick = function () { var col = th.getAttribute('data-col'); if (sortCol === col) sortDir = -sortDir; else { sortCol = col; sortDir = 1; } renderTable(list); };
            });
          }
          renderTable(list);
          if (isAdmin()) {
            var btnRoleMenu = document.getElementById('btnRoleMenuAccess');
            if (btnRoleMenu) btnRoleMenu.onclick = function () { loadSectionRoleMenuAccess(); };
            document.getElementById('sectionAdd').onclick = function () {
              showModal(tUi('add_user_modal', 'Add user'), '<div class="form-group"><label>' + tUi('login', 'Login') + '</label><input type="text" id="mu_login" required placeholder="Latin letters or numbers"></div><div class="form-group"><label>' + tUi('fio', 'Full Name') + '</label><input type="text" id="mu_fio" required placeholder="Name"></div><div class="form-group"><label>' + tUi('password', 'Password') + '</label><input type="password" id="mu_password" required></div><div class="form-group"><label>' + tUi('role', 'Role') + '</label><select id="mu_role"><option value="agent">agent</option><option value="admin">admin</option><option value="expeditor">expeditor</option><option value="stockman">stockman</option><option value="paymaster">paymaster</option></select></div><div class="form-group"><label>Ð¢ÐµÐ»ÐµÑÐ¾Ð½</label><input type="text" id="mu_phone" placeholder="+998901234567"></div><div class="form-group"><label>Email</label><input type="email" id="mu_email" placeholder="user@example.com"></div>', function (errEl) {
                return api('/api/v1/users', { method: 'POST', body: JSON.stringify({ login: document.getElementById('mu_login').value.trim(), fio: document.getElementById('mu_fio').value.trim(), password: document.getElementById('mu_password').value, role: document.getElementById('mu_role').value, phone: document.getElementById('mu_phone').value.trim() || null, email: document.getElementById('mu_email').value.trim() || null }) }).then(function () { loadSectionUsers(); });
              });
            };
          }
          tableDiv.querySelectorAll('[data-edit]').forEach(function (el) {
            el.onclick = function () {
              var login = el.getAttribute('data-edit').replace(/&quot;/g, '"');
              var fio = (el.getAttribute('data-fio') || '').replace(/&quot;/g, '"');
              var role = el.getAttribute('data-role') || 'agent';
              var status = (el.getAttribute('data-status') || '').replace(/&quot;/g, '"');
              var phone = (el.getAttribute('data-phone') || '').replace(/&quot;/g, '"');
              var email = (el.getAttribute('data-email') || '').replace(/&quot;/g, '"');
              var roles = ['agent', 'admin', 'expeditor', 'stockman', 'paymaster'];
              var roleOpts = roles.map(function (r) { return '<option value="' + r + '"' + (r === role ? ' selected' : '') + '>' + r + '</option>'; }).join('');
              var esc = function (s) { return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
              showModal(tUi('edit_user_modal', 'Edit user') + ': ' + login, '<div class="form-group"><label>' + tUi('fio', 'Full Name') + '</label><input type="text" id="eu_fio" value="' + esc(fio) + '"></div><div class="form-group"><label>' + tUi('role', 'Role') + '</label><select id="eu_role">' + roleOpts + '</select></div><div class="form-group"><label>' + tUi('status', 'Status') + '</label><input type="text" id="eu_status" value="' + esc(status) + '" placeholder="active"></div><div class="form-group"><label>Ð¢ÐµÐ»ÐµÑÐ¾Ð½</label><input type="text" id="eu_phone" value="' + esc(phone) + '"></div><div class="form-group"><label>Email</label><input type="email" id="eu_email" value="' + esc(email) + '"></div>', function (errEl) {
                return api('/api/v1/users/' + encodeURIComponent(login), { method: 'PATCH', body: JSON.stringify({ fio: document.getElementById('eu_fio').value.trim(), role: document.getElementById('eu_role').value, status: document.getElementById('eu_status').value.trim() || undefined, phone: document.getElementById('eu_phone').value.trim() || undefined, email: document.getElementById('eu_email').value.trim() || undefined }) }).then(function () { loadSectionUsers(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-pwd]').forEach(function (el) {
            el.onclick = function () {
              var login = el.getAttribute('data-pwd');
              showModal(tUi('change_password_modal', 'Change password') + ': ' + login, '<div class="form-group"><label>' + tUi('new_password', 'New password') + '</label><input type="password" id="sp_password" required></div>', function (errEl) {
                return api('/api/v1/users/' + encodeURIComponent(login) + '/set-password', { method: 'POST', body: JSON.stringify({ password: document.getElementById('sp_password').value }) }).then(function () { loadSectionUsers(); });
              });
            };
          });
        }).catch(function (e) {
          if (document.getElementById('sectionErr')) document.getElementById('sectionErr').textContent = (e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ°') : 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸';
        });
      }

      function loadSectionRoleMenuAccess() {
        var content = document.getElementById('content');
        if (!content) return;
        var roles = [{ v: 'admin', l: 'admin' }, { v: 'agent', l: 'agent' }, { v: 'expeditor', l: 'expeditor' }, { v: 'stockman', l: 'stockman' }, { v: 'paymaster', l: 'paymaster' }];
        var roleOpts = roles.map(function (r) { return '<option value="' + r.v + '">' + r.l + '</option>'; }).join('');
        content.innerHTML = '<div class="card"><h2>ÐÑÐ°Ð²Ð° Ð´Ð¾ÑÑÑÐ¿Ð° Ðº Ð¼ÐµÐ½Ñ</h2><p style="margin:0 0 12px 0"><label>Ð Ð¾Ð»Ñ: </label><select id="rma_role" style="margin-right:12px">' + roleOpts + '</select><button type="button" class="btn btn-primary" id="rma_save">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary" id="rma_back">ÐÐ°Ð·Ð°Ð´ Ðº Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»ÑÐ¼</button></p><div id="rma_err" class="err" style="margin-top:8px"></div><div id="rma_table_wrap" style="margin-top:16px"><p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p></div></div>';
        document.getElementById('rma_back').onclick = function () { loadSectionUsers(); };
        var roleSel = document.getElementById('rma_role');
        var errEl = document.getElementById('rma_err');
        function loadMatrix() {
          var role = roleSel.value;
          errEl.textContent = '';
          document.getElementById('rma_table_wrap').innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
          api('/api/v1/admin/roles/' + encodeURIComponent(role) + '/menu-access').then(function (data) {
            var rows = (data && data.menu_access) ? data.menu_access : [];
            var tb = '<div style="overflow-x:auto"><table><thead><tr><th>ÐÑÐ½ÐºÑ Ð¼ÐµÐ½Ñ</th><th>ÐÐ¾ÑÑÑÐ¿</th></tr></thead><tbody>';
            rows.forEach(function (row) {
              var name = 'rma_' + row.menu_item_id;
              var none = row.access_level === 'none' ? ' checked' : '';
              var view = row.access_level === 'view' ? ' checked' : '';
              var full = row.access_level === 'full' ? ' checked' : '';
              tb += '<tr><td>' + escAttr(row.menu_label || row.menu_code || '') + '</td><td><label style="margin-right:12px"><input type="radio" name="' + name + '" value="none" data-mid="' + row.menu_item_id + '"' + none + '> Ð¡ÐºÑÑÑÐ¾</label><label style="margin-right:12px"><input type="radio" name="' + name + '" value="view" data-mid="' + row.menu_item_id + '"' + view + '> ÐÑÐ¾ÑÐ¼Ð¾ÑÑ</label><label><input type="radio" name="' + name + '" value="full" data-mid="' + row.menu_item_id + '"' + full + '> ÐÐ¾Ð»Ð½ÑÐ¹</label></td></tr>';
            });
            tb += '</tbody></table></div>';
            document.getElementById('rma_table_wrap').innerHTML = rows.length ? tb : '<p>ÐÐµÑ Ð¿ÑÐ½ÐºÑÐ¾Ð² Ð¼ÐµÐ½Ñ.</p>';
          }).catch(function (e) {
            errEl.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ°') : 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸';
            document.getElementById('rma_table_wrap').innerHTML = '';
          });
        }
        roleSel.onchange = loadMatrix;
        document.getElementById('rma_save').onclick = function () {
          var role = roleSel.value;
          var wrap = document.getElementById('rma_table_wrap');
          var radios = wrap.querySelectorAll('input[type="radio"]:checked');
          var byMid = {};
          radios.forEach(function (r) { byMid[r.getAttribute('data-mid')] = r.value; });
          var menu_access = [];
          for (var mid in byMid) menu_access.push({ menu_item_id: parseInt(mid, 10), access_level: byMid[mid] });
          if (!menu_access.length) { errEl.textContent = 'ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ Ð´Ð»Ñ ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ.'; return; }
          errEl.textContent = '';
          api('/api/v1/admin/roles/' + encodeURIComponent(role) + '/menu-access', { method: 'POST', body: JSON.stringify({ menu_access: menu_access }) }).then(function () {
            errEl.textContent = '';
            errEl.style.color = '#0a0';
            errEl.textContent = 'ÐÑÐ°Ð²Ð° Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ñ. ÐÐ¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ð¸ ÑÐ²Ð¸Ð´ÑÑ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ Ð¿Ð¾ÑÐ»Ðµ Ð¿ÐµÑÐµÐ·Ð°Ð³ÑÑÐ·ÐºÐ¸ ÑÑÑÐ°Ð½Ð¸ÑÑ.';
            setTimeout(function () { errEl.textContent = ''; errEl.style.color = ''; }, 3000);
          }).catch(function (e) {
            errEl.style.color = '';
            errEl.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ°') : 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
          });
        };
        loadMatrix();
      }

      function productTypeSelectHtml(typeList, selected) {
        selected = selected || '';
        var opts = '<option value="">â</option>';
        (typeList || []).forEach(function (ty) {
          var name = escAttr(ty.name);
          opts += '<option value="' + name + '"' + (ty.name === selected ? ' selected' : '') + '>' + (ty.name || '') + '</option>';
        });
        return opts;
      }
      function loadSectionProducts() {
        Promise.all([
          api('/api/v1/dictionary/products').catch(function () { return []; }),
          api('/api/v1/dictionary/products/types').catch(function () { return []; }),
          api('/api/v1/dictionary/currencies').catch(function () { return []; })
        ]).then(function (results) {
          var list = results[0] || [];
          var typeList = results[1] || [];
          var currencyList = results[2] || [];
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="prodAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐ¾Ð²Ð°Ñ</button>' : '';
          content.innerHTML = '<div class="card"><h2>Ð¢Ð¾Ð²Ð°ÑÑ</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ ÑÐ¾Ð²Ð°ÑÐ¾Ð².</p>'; bindProdAdd(typeList); return; }
          var sortCol = 'code';
          var sortDir = 1;
          function renderProdTable(data) {
            var sorted = data.slice().sort(function (a, b) {
              return tableSortCompare(a, b, sortCol, sortDir, function (r, c) {
                if (c === 'weight_g' || c === 'price' || c === 'expiry_days') return (r[c] != null && r[c] !== '' ? String(Number(r[c])).padStart(15, '0') : '');
                return (r[c] || '').toString().toLowerCase();
              });
            });
            var t = '<table><thead><tr>' + sortableTh('code', 'ÐÐ¾Ð´', sortCol, sortDir) + sortableTh('name', 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ', sortCol, sortDir) + sortableTh('type_id', 'Ð¢Ð¸Ð¿', sortCol, sortDir) + sortableTh('weight_g', 'ÐÐµÑ', sortCol, sortDir) + sortableTh('unit', 'ÐÐ´.', sortCol, sortDir) + sortableTh('price', 'Ð¦ÐµÐ½Ð°', sortCol, sortDir) + sortableTh('currency_code', 'ÐÐ°Ð»ÑÑÐ°', sortCol, sortDir) + sortableTh('expiry_days', 'Ð¡ÑÐ¾Ðº', sortCol, sortDir) + '<th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
            sorted.forEach(function (p) {
            var code = escAttr(p.code), name = escAttr(p.name), typeId = escAttr(p.type_id), unit = escAttr(p.unit);
            var curr = (p.currency_code || 'sum');
            t += '<tr><td>' + (p.code || '') + '</td><td>' + (p.name || '') + '</td><td>' + (p.type_id || '') + '</td><td>' + (p.weight_g != null ? p.weight_g : '') + '</td><td>' + (p.unit || '') + '</td><td>' + (p.price != null ? p.price : '') + '</td><td>' + escAttr(curr) + '</td><td>' + (p.expiry_days != null ? p.expiry_days : '') + '</td><td>';
            if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-prod-edit data-code="' + code + '" data-name="' + name + '" data-type="' + typeId + '" data-weight="' + (p.weight_g != null ? p.weight_g : '') + '" data-unit="' + unit + '" data-price="' + (p.price != null ? p.price : '') + '" data-expiry="' + (p.expiry_days != null ? p.expiry_days : '') + '" data-currency="' + escAttr(curr) + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary btn-small" data-prod-del data-code="' + code + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
            t += '</td></tr>';
            });
            t += '</tbody></table>';
            tableDiv.innerHTML = t;
            tableDiv.querySelectorAll('th.sortable').forEach(function (th) {
              th.onclick = function () { var col = th.getAttribute('data-col'); if (sortCol === col) sortDir = -sortDir; else { sortCol = col; sortDir = 1; } renderProdTable(list); };
            });
            bindProdAdd(typeList, currencyList);
            tableDiv.querySelectorAll('[data-prod-edit]').forEach(function (el) {
            el.onclick = function () {
              var unesc = function (x) { return (x || '').replace(/&quot;/g, '"'); };
              var code = unesc(el.getAttribute('data-code'));
              var typeOpts = productTypeSelectHtml(typeList, unesc(el.getAttribute('data-type')));
              var currSelected = unesc(el.getAttribute('data-currency') || 'sum');
              var currOpts = '<option value>â</option>';
              (currencyList || []).forEach(function (c) {
                var codeCur = escAttr(c.code);
                var label = c.code + (c.symbol ? ' (' + c.symbol + ')' : '') + (c.name ? ' â ' + c.name : '');
                currOpts += '<option value="' + codeCur + '"' + (c.code === currSelected ? ' selected' : '') + '>' + escAttr(label) + '</option>';
              });
              if (!currencyList.length) {
                currOpts += '<option value="sum"' + (currSelected === 'sum' ? ' selected' : '') + '>sum â ÑÑÐ¼</option>';
              }
              var bodyHtml = '<div class="form-group"><label>ÐÐ¾Ð´ (Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½ÑÐµÑÑÑ)</label><input type="text" id="prod_code" value="' + escAttr(code) + '" readonly></div><div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="prod_name" value="' + (unesc(el.getAttribute('data-name')) || '').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '"></div><div class="form-group"><label>Ð¢Ð¸Ð¿</label><select id="prod_type">' + typeOpts + '</select></div><div class="form-group"><label>ÐÐµÑ (Ð³)</label><input type="number" id="prod_weight" value="' + (el.getAttribute('data-weight') || '') + '"></div><div class="form-group"><label>ÐÐ´.</label><input type="text" id="prod_unit" value="' + (unesc(el.getAttribute('data-unit')) || '').replace(/"/g, '&quot;') + '" placeholder="Ð¨Ð¢"></div><div class="form-group"><label>Ð¦ÐµÐ½Ð°</label><input type="number" step="0.01" id="prod_price" value="' + (el.getAttribute('data-price') || '') + '"></div><div class="form-group"><label>ÐÐ°Ð»ÑÑÐ°</label><select id="prod_currency">' + currOpts + '</select></div><div class="form-group"><label>Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸ (Ð´Ð½ÐµÐ¹)</label><input type="number" id="prod_expiry" value="' + (el.getAttribute('data-expiry') || '') + '"></div>';
              showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ ÑÐ¾Ð²Ð°Ñ', bodyHtml, function (errEl) {
                return api('/api/v1/dictionary/products/' + encodeURIComponent(code), { method: 'PUT', body: JSON.stringify({ name: document.getElementById('prod_name').value.trim(), type_id: document.getElementById('prod_type').value || null, weight_g: document.getElementById('prod_weight').value ? parseInt(document.getElementById('prod_weight').value, 10) : null, unit: document.getElementById('prod_unit').value.trim() || null, price: document.getElementById('prod_price').value ? parseFloat(document.getElementById('prod_price').value) : null, expiry_days: document.getElementById('prod_expiry').value ? parseInt(document.getElementById('prod_expiry').value, 10) : null, currency_code: document.getElementById('prod_currency').value || null }) }).then(function () { loadSectionProducts(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-prod-del]').forEach(function (el) {
            el.onclick = function () {
              var code = (el.getAttribute('data-code') || '').replace(/&quot;/g, '"');
              if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ (Ð´ÐµÐ°ÐºÑÐ¸Ð²Ð¸ÑÐ¾Ð²Ð°ÑÑ) ÑÐ¾Ð²Ð°Ñ Â«' + code + 'Â»?')) return;
              api('/api/v1/dictionary/products/' + encodeURIComponent(code), { method: 'DELETE' }).then(function () { loadSectionProducts(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ°'); });
            };
          });
          }
          renderProdTable(list);
        }).catch(function (e) {
          document.getElementById('content').innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ ÑÐ¾Ð²Ð°ÑÐ¾Ð².</p></div>';
        });
        function bindProdAdd(typeList, currencyList) {
          var btn = document.getElementById('prodAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            var typeOpts = productTypeSelectHtml(typeList, '');
            var currOpts = '<option value="sum">sum â ÑÑÐ¼ (Ð¿Ð¾ ÑÐ¼Ð¾Ð»ÑÐ°Ð½Ð¸Ñ)</option>';
            (currencyList || []).forEach(function (c) {
              if (c.code === 'sum') return;
              var label = c.code + (c.symbol ? ' (' + c.symbol + ')' : '') + (c.name ? ' â ' + c.name : '');
              currOpts += '<option value="' + escAttr(c.code) + '">' + escAttr(label) + '</option>';
            });
            var bodyHtml = '<div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="prod_name" placeholder="ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ"></div><div class="form-group"><label>Ð¢Ð¸Ð¿</label><select id="prod_type">' + typeOpts + '</select></div><div class="form-group"><label>ÐÐµÑ (Ð³)</label><input type="number" id="prod_weight" placeholder="0"></div><div class="form-group"><label>ÐÐ´.</label><input type="text" id="prod_unit" value="Ð¨Ð¢" placeholder="Ð¨Ð¢"></div><div class="form-group"><label>Ð¦ÐµÐ½Ð°</label><input type="number" step="0.01" id="prod_price" placeholder="0"></div><div class="form-group"><label>ÐÐ°Ð»ÑÑÐ°</label><select id="prod_currency">' + currOpts + '</select></div><div class="form-group"><label>Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸ (Ð´Ð½ÐµÐ¹)</label><input type="number" id="prod_expiry" placeholder="0"></div>';
            showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐ¾Ð²Ð°Ñ', bodyHtml, function (errEl) {
              var name = document.getElementById('prod_name').value.trim();
              if (!name) return Promise.reject({ data: { detail: 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ.' } });
              var currency = document.getElementById('prod_currency').value || 'sum';
              return api('/api/v1/dictionary/products', { method: 'POST', body: JSON.stringify({ name: name, type_id: document.getElementById('prod_type').value || null, weight_g: document.getElementById('prod_weight').value ? parseInt(document.getElementById('prod_weight').value, 10) : null, unit: document.getElementById('prod_unit').value.trim() || 'Ð¨Ð¢', price: document.getElementById('prod_price').value ? parseFloat(document.getElementById('prod_price').value) : null, expiry_days: document.getElementById('prod_expiry').value ? parseInt(document.getElementById('prod_expiry').value, 10) : null, currency_code: currency }) }).then(function () { loadSectionProducts(); });
            });
          };
        }
      }

      function escAttr(s) { var str = (s == null || s === undefined) ? '' : String(s); return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
      function tableSortCompare(a, b, sortCol, sortDir, getVal) {
        getVal = getVal || function (r, c) { return (r[c] || '').toString().toLowerCase(); };
        var va = getVal(a, sortCol);
        var vb = getVal(b, sortCol);
        var cmp = va < vb ? -1 : (va > vb ? 1 : 0);
        return sortDir * cmp;
      }
      function sortableTh(col, label, sortCol, sortDir) {
        var arrow = sortCol === col ? (sortDir > 0 ? ' â²' : ' â¼') : '';
        return '<th class="sortable" data-col="' + escAttr(col) + '" style="cursor:pointer">' + escAttr(label) + arrow + '</th>';
      }
      function formatStatusBadge(statusCode, statusName) {
        var code = (statusCode || '').toLowerCase().trim();
        var fallbackByCode = {
          pending: 'Ð Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ð¸',
          completed: 'ÐÑÐ¿Ð¾Ð»Ð½ÐµÐ½Ð¾',
          cancelled: 'ÐÑÐ¼ÐµÐ½ÐµÐ½Ð¾',
          canceled: 'ÐÑÐ¼ÐµÐ½ÐµÐ½Ð¾',
          open: 'ÐÑÐºÑÑÑ',
          delivery: 'ÐÐ¾ÑÑÐ°Ð²ÐºÐ°',
          delivered: 'ÐÐ¾ÑÑÐ°Ð²Ð»ÐµÐ½'
        };
        // Prefer canonical label by code to avoid broken DB labels.
        var text = fallbackByCode[code] || statusName || statusCode || '';
        var cls = 'status-badge--default';
        if (code === 'completed' || code === 'delivered' || code === 'Ð´Ð¾ÑÑÐ°Ð²Ð»ÐµÐ½') cls = 'status-badge--completed';
        else if (code === 'delivery' || code === 'Ð´Ð¾ÑÑÐ°Ð²ÐºÐ°') cls = 'status-badge--delivery';
        else if (code === 'open' || code === 'ÑÐ¾Ð·Ð´Ð°Ð½' || code === 'Ð½Ð¾Ð²ÑÐ¹') cls = 'status-badge--open';
        else if (code === 'cancelled' || code === 'canceled' || code === 'Ð¾ÑÐ¼ÐµÐ½ÐµÐ½') cls = 'status-badge--cancelled';
        else if (code === 'pending') cls = 'status-badge--pending';
        return '<span class="status-badge ' + cls + '">' + escAttr(text) + '</span>';
      }
      function loadSectionRefPayment() {
        api('/api/v1/dictionary/payment-types').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="refAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ</button>' : '';
          var html = '<div class="card"><h2>Ð¢Ð¸Ð¿Ñ Ð¾Ð¿Ð»Ð°Ñ</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ.</p>'; bindRefPaymentAdd(); return; }
          var sortCol = 'code';
          var sortDir = 1;
          function renderTable(data) {
            var sorted = data.slice().sort(function (a, b) {
              return tableSortCompare(a, b, sortCol, sortDir, function (r, c) {
                if (c === 'active') return (r.active === true ? '1' : '0');
                return (r[c] || '').toString().toLowerCase();
              });
            });
            var t = '<table><thead><tr>' + sortableTh('code', 'ÐÐ¾Ð´', sortCol, sortDir) + sortableTh('name', 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ', sortCol, sortDir) + sortableTh('description', 'ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ', sortCol, sortDir) + sortableTh('active', 'ÐÐºÑÐ¸Ð²Ð½Ð°', sortCol, sortDir) + '<th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
            sorted.forEach(function (r) {
              var c = escAttr(r.code), n = escAttr(r.name), d = escAttr(r.description);
              var act = (r.active === false ? 'ÐÐµÑ' : 'ÐÐ°');
              t += '<tr><td>' + (r.code || '') + '</td><td>' + (r.name || '') + '</td><td>' + (r.description || '') + '</td><td>' + act + '</td><td>';
              if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-code="' + c + '" data-name="' + n + '" data-desc="' + d + '" data-active="' + (r.active === false ? 'false' : 'true') + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary btn-small" data-del data-code="' + c + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
              t += '</td></tr>';
            });
            t += '</tbody></table>';
            tableDiv.innerHTML = t;
            tableDiv.querySelectorAll('th.sortable').forEach(function (th) {
              th.onclick = function () { var col = th.getAttribute('data-col'); if (sortCol === col) sortDir = -sortDir; else { sortCol = col; sortDir = 1; } renderTable(list); };
            });
            bindRefPaymentAdd();
            tableDiv.querySelectorAll('[data-edit]').forEach(function (el) {
            el.onclick = function () {
              showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ', '<div class="form-group"><label>ÐÐ¾Ð´ (Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½ÑÐµÑÑÑ)</label><input type="text" id="re_code" value="' + el.getAttribute('data-code') + '" readonly></div><div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="re_name" value="' + (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') + '"></div><div class="form-group"><label>ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ</label><input type="text" id="re_desc" value="' + (el.getAttribute('data-desc') || '').replace(/&quot;/g, '"') + '"></div>', function (errEl) {
                return api('/api/v1/dictionary/payment-types/' + encodeURIComponent(el.getAttribute('data-code')), { method: 'PUT', body: JSON.stringify({ name: document.getElementById('re_name').value.trim(), description: document.getElementById('re_desc').value.trim() || null }) }).then(function () { loadSectionRefPayment(); });
              });
            };
          });
            tableDiv.querySelectorAll('[data-del]').forEach(function (el) {
              el.onclick = function () { if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ Â«' + el.getAttribute('data-code') + 'Â»?')) return; api('/api/v1/dictionary/payment-types/' + encodeURIComponent(el.getAttribute('data-code')), { method: 'DELETE' }).then(function () { loadSectionRefPayment(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ°'); }); };
            });
          }
          renderTable(list);
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ ÑÐ¸Ð¿Ð¾Ð² Ð¾Ð¿Ð»Ð°Ñ.</p></div>'; });
        function bindRefPaymentAdd() {
          var btn = document.getElementById('refAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ', '<div class="form-group"><label>ÐÐ¾Ð´</label><input type="text" id="re_code" placeholder="Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ card_sum"></div><div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="re_name" placeholder="ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ"></div><div class="form-group"><label>ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ</label><input type="text" id="re_desc" placeholder="ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ"></div>', function (errEl) {
              return api('/api/v1/dictionary/payment-types', { method: 'POST', body: JSON.stringify({ code: document.getElementById('re_code').value.trim(), name: document.getElementById('re_name').value.trim(), description: document.getElementById('re_desc').value.trim() || null }) }).then(function () { loadSectionRefPayment(); });
            });
          };
        }
      }

      function loadSectionRefCurrency() {
        api('/api/v1/dictionary/currencies').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="curAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð²Ð°Ð»ÑÑÑ</button>' : '';
          var html = '<div class="card"><h2>ÐÐ°Ð»ÑÑÐ°</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ Ð²Ð°Ð»ÑÑ.</p>'; }
          else {
            var sortCol = 'code';
            var sortDir = 1;
            function renderTable(data) {
              var sorted = data.slice().sort(function (a, b) {
                return tableSortCompare(a, b, sortCol, sortDir, function (r, c) {
                  if (c === 'is_default') return (r.is_default ? '1' : '0');
                  return (r[c] || '').toString().toLowerCase();
                });
              });
              var t = '<table><thead><tr>' + sortableTh('code', 'ÐÐ¾Ð´', sortCol, sortDir) + sortableTh('name', 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ', sortCol, sortDir) + sortableTh('country', 'Ð¡ÑÑÐ°Ð½Ð°', sortCol, sortDir) + sortableTh('symbol', 'Ð¡Ð¸Ð¼Ð²Ð¾Ð»', sortCol, sortDir) + sortableTh('is_default', 'ÐÐ¾ ÑÐ¼Ð¾Ð»ÑÐ°Ð½Ð¸Ñ', sortCol, sortDir) + '<th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
              sorted.forEach(function (c) {
                t += '<tr><td>' + escAttr(c.code || '') + '</td><td>' + escAttr(c.name || '') + '</td><td>' + escAttr(c.country || '') + '</td><td>' + escAttr(c.symbol || '') + '</td><td>' + (c.is_default ? 'ÐÐ°' : '') + '</td><td>';
                if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-cur-edit data-code="' + escAttr(c.code || '') + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary btn-small" data-cur-del data-code="' + escAttr(c.code || '') + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
                t += '</td></tr>';
              });
              t += '</tbody></table>';
              tableDiv.innerHTML = t;
              tableDiv.querySelectorAll('th.sortable').forEach(function (th) {
                th.onclick = function () { var col = th.getAttribute('data-col'); if (sortCol === col) sortDir = -sortDir; else { sortCol = col; sortDir = 1; } renderTable(list); };
              });
            }
            renderTable(list);
          }
          if (isAdmin()) {
            var addBtnEl = document.getElementById('curAdd');
            if (addBtnEl) addBtnEl.onclick = function () {
              var bodyHtml = '<div class="form-group"><label>ÐÐ¾Ð´</label><input type="text" id="cur_code" placeholder="sum"></div><div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="cur_name" placeholder="ÑÑÐ¼"></div><div class="form-group"><label>Ð¡ÑÑÐ°Ð½Ð°</label><input type="text" id="cur_country" placeholder="Ð£Ð·Ð±ÐµÐºÐ¸ÑÑÐ°Ð½"></div><div class="form-group"><label>Ð¡Ð¸Ð¼Ð²Ð¾Ð»</label><input type="text" id="cur_symbol" placeholder="ÑÑÐ¼"></div><div class="form-group"><label><input type="checkbox" id="cur_default"> ÐÐ°Ð»ÑÑÐ° Ð¿Ð¾ ÑÐ¼Ð¾Ð»ÑÐ°Ð½Ð¸Ñ</label></div>';
              showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð²Ð°Ð»ÑÑÑ', bodyHtml, function (errEl) {
                var code = document.getElementById('cur_code').value.trim();
                var name = document.getElementById('cur_name').value.trim();
                if (!code || !name) { if (errEl) errEl.textContent = 'ÐÐ¾Ð´ Ð¸ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð¾Ð±ÑÐ·Ð°ÑÐµÐ»ÑÐ½Ñ.'; return; }
                var payload = {
                  code: code,
                  name: name,
                  country: document.getElementById('cur_country').value.trim() || null,
                  symbol: document.getElementById('cur_symbol').value.trim() || null,
                  is_default: document.getElementById('cur_default').checked,
                };
                return api('/api/v1/dictionary/currencies', { method: 'POST', body: JSON.stringify(payload) }).then(function () { loadSectionRefCurrency(); });
              });
            };
            var tableDiv = document.getElementById('sectionTable');
            if (tableDiv) {
              tableDiv.querySelectorAll('[data-cur-edit]').forEach(function (el) {
                el.onclick = function () {
                  var code = el.getAttribute('data-code');
                  var row = el.closest('tr');
                  var name = row ? row.children[1].textContent : '';
                  var country = row ? row.children[2].textContent : '';
                  var symbol = row ? row.children[3].textContent : '';
                  var isDefault = row ? (row.children[4].textContent.trim() === 'ÐÐ°') : false;
                  var bodyHtml = '<div class="form-group"><label>ÐÐ¾Ð´ (Ð½ÐµÐ»ÑÐ·Ñ Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑ)</label><input type="text" id="cur_code" value="' + escAttr(code) + '" readonly></div><div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="cur_name" value="' + escAttr(name) + '"></div><div class="form-group"><label>Ð¡ÑÑÐ°Ð½Ð°</label><input type="text" id="cur_country" value="' + escAttr(country) + '"></div><div class="form-group"><label>Ð¡Ð¸Ð¼Ð²Ð¾Ð»</label><input type="text" id="cur_symbol" value="' + escAttr(symbol) + '"></div><div class="form-group"><label><input type="checkbox" id="cur_default"' + (isDefault ? ' checked' : '') + '> ÐÐ°Ð»ÑÑÐ° Ð¿Ð¾ ÑÐ¼Ð¾Ð»ÑÐ°Ð½Ð¸Ñ</label></div>';
                  showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ Ð²Ð°Ð»ÑÑÑ', bodyHtml, function (errEl) {
                    var nameNew = document.getElementById('cur_name').value.trim();
                    if (!nameNew) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ.'; return; }
                    var payload = {
                      name: nameNew,
                      country: document.getElementById('cur_country').value.trim() || null,
                      symbol: document.getElementById('cur_symbol').value.trim() || null,
                      is_default: document.getElementById('cur_default').checked,
                    };
                    return api('/api/v1/dictionary/currencies/' + encodeURIComponent(code), { method: 'PUT', body: JSON.stringify(payload) }).then(function () { loadSectionRefCurrency(); });
                  });
                };
              });
              tableDiv.querySelectorAll('[data-cur-del]').forEach(function (el) {
                el.onclick = function () {
                  var code = el.getAttribute('data-code');
                  if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ Ð²Ð°Ð»ÑÑÑ Â«' + code + 'Â»?')) return;
                  api('/api/v1/dictionary/currencies/' + encodeURIComponent(code), { method: 'DELETE' }).then(function () { loadSectionRefCurrency(); }).catch(function (e) {
                    alert((e && e.data && e.data.detail) ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ´Ð°Ð»ÐµÐ½Ð¸Ñ Ð²Ð°Ð»ÑÑÑ');
                  });
                };
              });
            }
          }
        }).catch(function (e) {
          var content = document.getElementById('content');
          if (content) content.innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð²Ð°Ð»ÑÑ.</p></div>';
        });
      }
      function loadSectionRefProducts() {
        api('/api/v1/dictionary/products/types').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="refAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ</button>' : '';
          var html = '<div class="card"><h2>Ð¢Ð¸Ð¿Ñ Ð¿ÑÐ¾Ð´ÑÐºÑÐ¾Ð²</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ.</p>'; bindRefProductsAdd(); return; }
          var sortCol = 'name';
          var sortDir = 1;
          function renderTable(data) {
            var sorted = data.slice().sort(function (a, b) { return tableSortCompare(a, b, sortCol, sortDir); });
            var t = '<table><thead><tr>' + sortableTh('name', 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ', sortCol, sortDir) + sortableTh('description', 'ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ', sortCol, sortDir) + '<th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
            sorted.forEach(function (r) {
              var n = escAttr(r.name), d = escAttr(r.description);
              t += '<tr><td>' + (r.name || '') + '</td><td>' + (r.description || '') + '</td><td>';
              if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-name="' + n + '" data-desc="' + d + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary btn-small" data-del data-name="' + n + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
              t += '</td></tr>';
            });
            t += '</tbody></table>';
            tableDiv.innerHTML = t;
            tableDiv.querySelectorAll('th.sortable').forEach(function (th) {
              th.onclick = function () { var col = th.getAttribute('data-col'); if (sortCol === col) sortDir = -sortDir; else { sortCol = col; sortDir = 1; } renderTable(list); };
            });
            bindRefProductsAdd();
            tableDiv.querySelectorAll('[data-edit]').forEach(function (el) {
              el.onclick = function () {
                var nameVal = (el.getAttribute('data-name') || '').replace(/&quot;/g, '"');
                showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ ÑÐ¸Ð¿ Ð¿ÑÐ¾Ð´ÑÐºÑÐ°', '<div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ (Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½ÑÐµÑÑÑ)</label><input type="text" id="rp_name" value="' + el.getAttribute('data-name') + '" readonly></div><div class="form-group"><label>ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ</label><input type="text" id="rp_desc" value="' + (el.getAttribute('data-desc') || '').replace(/&quot;/g, '"') + '"></div>', function (errEl) {
                  return api('/api/v1/dictionary/products/types/' + encodeURIComponent(nameVal), { method: 'PUT', body: JSON.stringify({ description: document.getElementById('rp_desc').value.trim() || null }) }).then(function () { loadSectionRefProducts(); });
                });
              };
            });
            tableDiv.querySelectorAll('[data-del]').forEach(function (el) {
              el.onclick = function () { if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ ÑÐ¸Ð¿ Ð¿ÑÐ¾Ð´ÑÐºÑÐ° Â«' + (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') + 'Â»?')) return; api('/api/v1/dictionary/products/types/' + encodeURIComponent((el.getAttribute('data-name') || '').replace(/&quot;/g, '"')), { method: 'DELETE' }).then(function () { loadSectionRefProducts(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ°'); }); };
            });
          }
          renderTable(list);
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ ÑÐ¸Ð¿Ð¾Ð² Ð¿ÑÐ¾Ð´ÑÐºÑÐ¾Ð².</p></div>'; });
        function bindRefProductsAdd() {
          var btn = document.getElementById('refAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐ¸Ð¿ Ð¿ÑÐ¾Ð´ÑÐºÑÐ°', '<div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="rp_name" placeholder="Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ Yogurt"></div><div class="form-group"><label>ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ</label><input type="text" id="rp_desc" placeholder="ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ"></div>', function (errEl) {
              return api('/api/v1/dictionary/products/types', { method: 'POST', body: JSON.stringify({ name: document.getElementById('rp_name').value.trim(), description: document.getElementById('rp_desc').value.trim() || null }) }).then(function () { loadSectionRefProducts(); });
            });
          };
        }
      }
      function loadSectionRefOperations() {
        api('/api/v1/operation-types').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="refAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ</button>' : '';
          var html = '<div class="card"><h2>Ð¢Ð¸Ð¿Ñ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ.</p>'; bindRefOpsAdd(); return; }
          var sortCol = 'code';
          var sortDir = 1;
          function renderTable(data) {
            var sorted = data.slice().sort(function (a, b) {
              var va = (a[sortCol] || '').toString().toLowerCase();
              var vb = (b[sortCol] || '').toString().toLowerCase();
              if (sortCol === 'active') {
                va = (a.active === true ? '1' : '0');
                vb = (b.active === true ? '1' : '0');
              }
              var cmp = va < vb ? -1 : (va > vb ? 1 : 0);
              return sortDir * cmp;
            });
            var arrow = sortDir > 0 ? ' â²' : ' â¼';
            var t = '<table><thead><tr><th class="sortable" data-col="code">ÐÐ¾Ð´' + (sortCol === 'code' ? arrow : '') + '</th><th class="sortable" data-col="name">ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ' + (sortCol === 'name' ? arrow : '') + '</th><th class="sortable" data-col="description">ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ' + (sortCol === 'description' ? arrow : '') + '</th><th class="sortable" data-col="active">ÐÐºÑÐ¸Ð²Ð½Ð°' + (sortCol === 'active' ? arrow : '') + '</th><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
            sorted.forEach(function (r) {
              var c = escAttr(r.code), n = escAttr(r.name), d = escAttr(r.description);
              var actText = (r.active === true ? 'ÐÐ°' : 'ÐÐµÑ');
              var actAttr = (r.active === true ? 'true' : 'false');
              t += '<tr><td>' + (r.code || '') + '</td><td>' + (r.name || '') + '</td><td>' + (r.description || '') + '</td><td>' + actText + '</td><td>';
              if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-code="' + c + '" data-name="' + n + '" data-desc="' + d + '" data-active="' + actAttr + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary btn-small" data-del data-code="' + c + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
              t += '</td></tr>';
            });
            t += '</tbody></table>';
            tableDiv.innerHTML = t;
            tableDiv.querySelectorAll('th.sortable').forEach(function (th) {
              th.style.cursor = 'pointer';
              th.onclick = function () {
                var col = th.getAttribute('data-col');
                if (sortCol === col) sortDir = -sortDir; else { sortCol = col; sortDir = 1; }
                renderTable(list);
              };
            });
            bindRefOpsAdd();
            tableDiv.querySelectorAll('[data-edit]').forEach(function (el) {
              el.onclick = function () {
                var act = el.getAttribute('data-active') || 'true';
                var bodyHtml = ''
                  + '<div class="form-group"><label>ÐÐ¾Ð´ (Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½ÑÐµÑÑÑ)</label><input type="text" id="ro_code" value="' + el.getAttribute('data-code') + '" readonly></div>'
                  + '<div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="ro_name" value="' + (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') + '"></div>'
                  + '<div class="form-group"><label>ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ</label><input type="text" id="ro_desc" value="' + (el.getAttribute('data-desc') || '').replace(/&quot;/g, '"') + '"></div>'
                  + '<div class="form-group"><label>ÐÐºÑÐ¸Ð²Ð½Ð°</label><select id="ro_active"><option value="true">ÐÐ°</option><option value="false">ÐÐµÑ</option></select></div>';
                showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ ÑÐ¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸', bodyHtml, function (errEl) {
                  var name = document.getElementById('ro_name').value.trim();
                  var desc = document.getElementById('ro_desc').value.trim() || null;
                  var activeVal = document.getElementById('ro_active').value === 'true';
                  return api('/api/v1/operation-types/' + encodeURIComponent(el.getAttribute('data-code')), { method: 'PUT', body: JSON.stringify({ name: name, description: desc, active: activeVal }) }).then(function () { loadSectionRefOperations(); });
                });
                var sel = document.getElementById('ro_active');
                if (sel) sel.value = (act === 'false' ? 'false' : 'true');
              };
            });
            tableDiv.querySelectorAll('[data-del]').forEach(function (el) {
              el.onclick = function () { if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ ÑÐ¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸ Â«' + el.getAttribute('data-code') + 'Â»?')) return; api('/api/v1/operation-types/' + encodeURIComponent(el.getAttribute('data-code')), { method: 'DELETE' }).then(function () { loadSectionRefOperations(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ°'); }); };
            });
          }
          renderTable(list);
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ ÑÐ¸Ð¿Ð¾Ð² Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹.</p></div>'; });
        function bindRefOpsAdd() {
          var btn = document.getElementById('refAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐ¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸', '<div class="form-group"><label>ÐÐ¾Ð´</label><input type="text" id="ro_code" placeholder="Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ transfer"></div><div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="ro_name" placeholder="ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ"></div><div class="form-group"><label>ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ</label><input type="text" id="ro_desc" placeholder="ÐÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ"></div>', function (errEl) {
              return api('/api/v1/operation-types', { method: 'POST', body: JSON.stringify({ code: document.getElementById('ro_code').value.trim(), name: document.getElementById('ro_name').value.trim(), description: document.getElementById('ro_desc').value.trim() || null }) }).then(function () { loadSectionRefOperations(); });
            });
          };
        }
      }

      function whUserSelectHtml(userList, selectedSk, selectedAg, selectedExp) {
        selectedSk = selectedSk || ''; selectedAg = selectedAg || ''; selectedExp = selectedExp || '';
        var optsAll = '<option value="">â ÐÐµ Ð½Ð°Ð·Ð½Ð°ÑÐµÐ½</option>';
        var optsExp = '<option value="">â ÐÐµ Ð½Ð°Ð·Ð½Ð°ÑÐµÐ½</option>';
        (userList || []).forEach(function (u) {
          var login = escAttr(u.login);
          var label = (u.login || '') + (u.fio ? ' â ' + (u.fio || '').replace(/</g, '&lt;') : '');
          optsAll += '<option value="' + login + '">' + label + '</option>';
          var role = (u.role || '').toLowerCase();
          if (role === 'expeditor') {
            optsExp += '<option value="' + login + '">' + label + '</option>';
          }
        });
        var escSk = escAttr(selectedSk), escAg = escAttr(selectedAg), escEx = escAttr(selectedExp);
        var skOpts = optsAll.replace('value="' + escSk + '"', 'value="' + escSk + '" selected');
        var agOpts = optsAll.replace('value="' + escAg + '"', 'value="' + escAg + '" selected');
        var exOpts = optsExp.replace('value="' + escEx + '"', 'value="' + escEx + '" selected');
        return '<div class="form-group"><label>ÐÐ»Ð°Ð´Ð¾Ð²ÑÐ¸Ðº</label><select id="wh_sk">' + skOpts + '</select></div><div class="form-group"><label>ÐÐ³ÐµÐ½Ñ</label><select id="wh_agent">' + agOpts + '</select></div><div class="form-group"><label>Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ (login)</label><select id="wh_exp">' + exOpts + '</select></div>';
      }
      function loadSectionWarehouses() {
        Promise.all([
          api('/api/v1/dictionary/warehouses').catch(function () { return []; }),
          api('/api/v1/dictionary/user-logins').catch(function () { return []; })
        ]).then(function (results) {
          var list = results[0] || [];
          var userList = results[1] || [];
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="whAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ</button>' : '';
          var html = '<div class="card"><h2>Ð¡ÐºÐ»Ð°Ð´Ñ</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ ÑÐºÐ»Ð°Ð´Ð¾Ð².</p>'; bindWhAdd(userList); return; }
          var sortCol = 'code';
          var sortDir = 1;
          function renderWhTable(data) {
            var sorted = data.slice().sort(function (a, b) { return tableSortCompare(a, b, sortCol, sortDir); });
            var t = '<table><thead><tr>' + sortableTh('code', 'ÐÐ¾Ð´', sortCol, sortDir) + sortableTh('name', 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ', sortCol, sortDir) + sortableTh('type', 'Ð¢Ð¸Ð¿', sortCol, sortDir) + sortableTh('storekeeper', 'ÐÐ»Ð°Ð´Ð¾Ð²ÑÐ¸Ðº', sortCol, sortDir) + sortableTh('agent', 'ÐÐ³ÐµÐ½Ñ', sortCol, sortDir) + sortableTh('expeditor_login', 'Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ (login)', sortCol, sortDir) + '<th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
            sorted.forEach(function (w) {
            var c = escAttr(w.code), n = escAttr(w.name), ty = escAttr(w.type), sk = escAttr(w.storekeeper), ag = escAttr(w.agent), ex = escAttr(w.expeditor_login);
            t += '<tr><td>' + (w.code || '') + '</td><td>' + (w.name || '') + '</td><td>' + (w.type || '') + '</td><td>' + (w.storekeeper || '') + '</td><td>' + (w.agent || '') + '</td><td>' + (w.expeditor_login || '') + '</td><td>';
            if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-wh-edit data-code="' + c + '" data-name="' + n + '" data-type="' + ty + '" data-storekeeper="' + sk + '" data-agent="' + ag + '" data-expeditor="' + ex + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary btn-small" data-wh-del data-code="' + c + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
            t += '</td></tr>';
            });
            t += '</tbody></table>';
            tableDiv.innerHTML = t;
            tableDiv.querySelectorAll('th.sortable').forEach(function (th) {
              th.onclick = function () { var col = th.getAttribute('data-col'); if (sortCol === col) sortDir = -sortDir; else { sortCol = col; sortDir = 1; } renderWhTable(list); };
            });
            bindWhAdd(userList);
            tableDiv.querySelectorAll('[data-wh-edit]').forEach(function (el) {
            el.onclick = function () {
              var unesc = function (x) { return (x || '').replace(/&quot;/g, '"'); };
              var sk = unesc(el.getAttribute('data-storekeeper'));
              var ag = unesc(el.getAttribute('data-agent'));
              var ex = unesc(el.getAttribute('data-expeditor'));
              var bodyHtml = '<div class="form-group"><label>ÐÐ¾Ð´ (Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½ÑÐµÑÑÑ)</label><input type="text" id="wh_code" value="' + el.getAttribute('data-code') + '" readonly></div><div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="wh_name" value="' + (unesc(el.getAttribute('data-name')) || '').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '"></div><div class="form-group"><label>Ð¢Ð¸Ð¿</label><input type="text" id="wh_type" value="' + (unesc(el.getAttribute('data-type')) || '').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '"></div>' + whUserSelectHtml(userList, sk, ag, ex);
              showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ ÑÐºÐ»Ð°Ð´', bodyHtml, function (errEl) {
                var skVal = document.getElementById('wh_sk').value || null;
                var agVal = document.getElementById('wh_agent').value || null;
                var exVal = document.getElementById('wh_exp').value || null;
                return api('/api/v1/dictionary/warehouses/' + encodeURIComponent(unesc(el.getAttribute('data-code'))), { method: 'PUT', body: JSON.stringify({ name: document.getElementById('wh_name').value.trim(), type: document.getElementById('wh_type').value.trim() || null, storekeeper: skVal, agent: agVal, expeditor_login: exVal }) }).then(function () { loadSectionWarehouses(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-wh-del]').forEach(function (el) {
            el.onclick = function () { if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ ÑÐºÐ»Ð°Ð´ Â«' + (el.getAttribute('data-code') || '').replace(/&quot;/g, '"') + 'Â»?')) return; api('/api/v1/dictionary/warehouses/' + encodeURIComponent((el.getAttribute('data-code') || '').replace(/&quot;/g, '"')), { method: 'DELETE' }).then(function () { loadSectionWarehouses(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ°'); }); };
          });
          }
          renderWhTable(list);
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ ÑÐºÐ»Ð°Ð´Ð¾Ð².</p></div>'; });
        function bindWhAdd(userList) {
          var btn = document.getElementById('whAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            var bodyHtml = '<div class="form-group"><label>ÐÐ¾Ð´</label><input type="text" id="wh_code" placeholder="Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ WH01"></div><div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</label><input type="text" id="wh_name" placeholder="ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ"></div><div class="form-group"><label>Ð¢Ð¸Ð¿</label><input type="text" id="wh_type" placeholder="Ð¾ÑÐ½Ð¾Ð²Ð½Ð¾Ð¹"></div>' + whUserSelectHtml(userList, '', '', '');
            showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐºÐ»Ð°Ð´', bodyHtml, function (errEl) {
              var skVal = document.getElementById('wh_sk').value || null;
              var agVal = document.getElementById('wh_agent').value || null;
              var exVal = document.getElementById('wh_exp').value || null;
              return api('/api/v1/dictionary/warehouses', { method: 'POST', body: JSON.stringify({ code: document.getElementById('wh_code').value.trim(), name: document.getElementById('wh_name').value.trim(), type: document.getElementById('wh_type').value.trim() || null, storekeeper: skVal, agent: agVal, expeditor_login: exVal }) }).then(function () { loadSectionWarehouses(); });
            });
          };
        }
      }

      function custUserSelectHtml(userList, selected) {
        selected = selected || '';
        var opts = '<option value="">â ÐÐµ Ð½Ð°Ð·Ð½Ð°ÑÐµÐ½</option>';
        (userList || []).forEach(function (u) {
          var login = escAttr(u.login);
          var label = (u.login || '') + (u.fio ? ' â ' + (u.fio || '').replace(/</g, '&lt;') : '');
          opts += '<option value="' + login + '"' + (u.login === selected ? ' selected' : '') + '>' + label + '</option>';
        });
        return opts;
      }
      var citiesCache = [];
      var territoriesCache = [];
      function loadCitiesAndTerritories() {
        console.log('=== loadCitiesAndTerritories CALLED ===');
        return Promise.all([
          api('/api/v1/dictionary/cities').then(function (data) {
            console.log('Cities API returned:', data);
            citiesCache = data || [];
            console.log('citiesCache after assignment:', citiesCache);
            return citiesCache;
          }).catch(function (err) {
            console.error('Error loading cities:', err);
            citiesCache = [];
            return citiesCache;
          }),
          api('/api/v1/dictionary/territories').then(function (data) {
            console.log('Territories API returned:', data);
            territoriesCache = data || [];
            console.log('territoriesCache after assignment:', territoriesCache);
            return territoriesCache;
          }).catch(function (err) {
            console.error('Error loading territories:', err);
            territoriesCache = [];
            return territoriesCache;
          })
        ]).then(function() {
          console.log('=== loadCitiesAndTerritories COMPLETED ===');
          console.log('Final citiesCache:', citiesCache);
          console.log('Final territoriesCache:', territoriesCache);
        });
      }
      function custInputVal(v) { return (v != null && v !== '' ? String(v) : '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
      function custEditFormHtml(c, userList) {
        console.log('custEditFormHtml called - citiesCache:', citiesCache, 'territoriesCache:', territoriesCache);
        var agOpts = custUserSelectHtml(userList, c.login_agent || '');
        var expUsers = (userList || []).filter(function (u) { return (u.role || '').toLowerCase() === 'expeditor'; });
        var exOpts = custUserSelectHtml(expUsers, c.login_expeditor || '');
        var f = function (label, id, val) { return '<div class="form-group"><label>' + label + '</label><input type="text" id="' + id + '" value="' + custInputVal(val) + '"></div>'; };
        var num = function (label, id, val) { return '<div class="form-group"><label>' + label + '</label><input type="number" step="any" id="' + id + '" value="' + custInputVal(val) + '"></div>'; };
        var cityOpts = '<option value="">â ÐÐµ Ð²ÑÐ±ÑÐ°Ð½Ð¾ â</option>';
        citiesCache.forEach(function (ct) { cityOpts += '<option value="' + ct.id + '"' + (ct.id === c.city_id ? ' selected' : '') + '>' + escAttr(ct.name) + '</option>'; });
        var territoryOpts = '<option value="">â ÐÐµ Ð²ÑÐ±ÑÐ°Ð½Ð¾ â</option>';
        territoriesCache.forEach(function (t) { territoryOpts += '<option value="' + t.id + '"' + (t.id === c.territory_id ? ' selected' : '') + '>' + escAttr(t.name) + '</option>'; });
        console.log('Built cityOpts:', cityOpts);
        console.log('Built territoryOpts:', territoryOpts);
        return f('ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°', 'cust_name', c.name_client) + f('ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÑÐ¸ÑÐ¼Ñ', 'cust_firm', c.firm_name) + f('ÐÐ°ÑÐµÐ³Ð¾ÑÐ¸Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ°', 'cust_category', c.category_client) + f('ÐÐ´ÑÐµÑ', 'cust_address', c.address) + '<div class="form-group"><label>ÐÐ¾ÑÐ¾Ð´</label><select id="cust_city">' + cityOpts + '</select></div><div class="form-group"><label>Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ</label><select id="cust_territory">' + territoryOpts + '</select></div>' + f('ÐÑÐ¸ÐµÐ½ÑÐ¸Ñ', 'cust_landmark', c.landmark) + f('Ð¢ÐµÐ»ÐµÑÐ¾Ð½', 'cust_phone', c.phone) + f('ÐÐ¾Ð½ÑÐ°ÐºÑÐ½Ð¾Ðµ Ð»Ð¸ÑÐ¾', 'cust_contact', c.contact_person) + f('ÐÐÐ', 'cust_tax_id', c.tax_id) + f('Ð¡ÑÐ°ÑÑÑ', 'cust_status', c.status) + '<div class="form-group"><label>login Ð°Ð³ÐµÐ½ÑÐ°</label><select id="cust_agent">' + agOpts + '</select></div><div class="form-group"><label>login ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°</label><select id="cust_expeditor">' + exOpts + '</select></div>' + num('Ð¨Ð¸ÑÐ¾ÑÐ°', 'cust_lat', c.latitude) + num('ÐÐ¾Ð»Ð³Ð¾ÑÐ°', 'cust_lon', c.longitude) + f('ÐÐÐÐ¤Ð', 'cust_pinfl', c.PINFL) + f('ÐÐ¾Ð³Ð¾Ð²Ð¾Ñ â', 'cust_contract_no', c.contract_no) + f('Ð /Ð¡', 'cust_account_no', c.account_no) + f('ÐÐ°Ð½Ðº', 'cust_bank', c.bank) + f('ÐÐ¤Ð', 'cust_mfo', c.MFO) + f('ÐÐÐ­Ð', 'cust_oked', c.OKED) + f('Ð ÐµÐ³Ð¸ÑÑÑÐ°ÑÐ¸Ð¾Ð½Ð½ÑÐ¹ ÐºÐ¾Ð´ Ð¿Ð»Ð°ÑÐµÐ»ÑÑÐ¸ÐºÐ° ÐÐÐ¡', 'cust_vat_code', c.VAT_code);
      }
      function custFormBody() {
        var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
        var gn = function (id) { var v = g(id); return v === '' ? null : (Number(v)); };
        var citySelect = document.getElementById('cust_city');
        var territorySelect = document.getElementById('cust_territory');
        var cityId = citySelect && citySelect.value ? parseInt(citySelect.value, 10) : null;
        var territoryId = territorySelect && territorySelect.value ? parseInt(territorySelect.value, 10) : null;
        return { name_client: g('cust_name') || null, firm_name: g('cust_firm') || null, category_client: g('cust_category') || null, address: g('cust_address') || null, city_id: cityId, territory_id: territoryId, landmark: g('cust_landmark') || null, phone: g('cust_phone') || null, contact_person: g('cust_contact') || null, tax_id: g('cust_tax_id') || null, status: g('cust_status') || null, login_agent: document.getElementById('cust_agent') ? document.getElementById('cust_agent').value || null : null, login_expeditor: document.getElementById('cust_expeditor') ? document.getElementById('cust_expeditor').value || null : null, latitude: gn('cust_lat'), longitude: gn('cust_lon'), PINFL: g('cust_pinfl') || null, contract_no: g('cust_contract_no') || null, account_no: g('cust_account_no') || null, bank: g('cust_bank') || null, MFO: g('cust_mfo') || null, OKED: g('cust_oked') || null, VAT_code: g('cust_vat_code') || null };
      }
      function loadSectionCustomers() {
        api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
          userList = userList || [];
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="custAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°</button>' : '';
          var exportBtn = isAdmin() ? '<button type="button" class="btn btn-secondary" id="custExport">Ð¡ÐºÐ°ÑÐ°ÑÑ Ð² Excel Ð²ÑÐµÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð²</button>' : '';
          var agentOpts = '<option value="">â ÐÑÐµ â</option>';
          var expeditorOpts = '<option value="">â ÐÑÐµ â</option>';
          userList.forEach(function (u) {
            var optHtml = '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>';
            agentOpts += optHtml;
            if ((u.role || '').toLowerCase() === 'expeditor') expeditorOpts += optHtml;
          });
          content.innerHTML = '<div class="card"><h2>ÐÐ»Ð¸ÐµÐ½ÑÑ</h2><p style="margin:0 0 12px 0">' + addBtn + ' ' + exportBtn + '</p><div class="form-group" style="margin-bottom:12px"><label>ÐÐ¾Ð¸ÑÐº</label></div><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"><input type="number" id="custSearchId" placeholder="ÐÐ ÐºÐ»Ð¸ÐµÐ½ÑÐ°" min="1" style="max-width:110px"><input id="custSearchName" placeholder="ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°" style="max-width:180px"><input id="custSearchFirm" placeholder="ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÑÐ¸ÑÐ¼Ñ" style="max-width:180px"><input id="custSearchCity" placeholder="ÐÐ¾ÑÐ¾Ð´" style="max-width:140px"><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">login Ð°Ð³ÐµÐ½ÑÐ°</label><select id="custSearchAgent" style="max-width:160px">' + agentOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">login ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°</label><select id="custSearchExpeditor" style="max-width:160px">' + expeditorOpts + '</select></div><input id="custSearchPhone" placeholder="Ð¢ÐµÐ»ÐµÑÐ¾Ð½" style="max-width:140px"><input id="custSearchTaxId" placeholder="ÐÐÐ" style="max-width:120px"><button type="button" class="btn btn-primary" id="btnCustSearch">ÐÐ°Ð¹ÑÐ¸</button></div><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          bindCustAdd(userList);
          var exportEl = document.getElementById('custExport');
          if (exportEl) exportEl.onclick = function () {
            var url = window.location.origin + '/api/v1/customers/export';
            fetch(url, { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'clients.xlsx'; a.click(); URL.revokeObjectURL(a.href);
            }).catch(function (e) { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸: ' + (e && e.data && e.data.detail ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : e.message || 'ÐÑÐ¸Ð±ÐºÐ°')); });
          };
          function runCustomerSearch() {
            var cust_id = document.getElementById('custSearchId') ? document.getElementById('custSearchId').value.trim() : '';
            var name_client = document.getElementById('custSearchName') ? document.getElementById('custSearchName').value.trim() : '';
            var firm_name = document.getElementById('custSearchFirm') ? document.getElementById('custSearchFirm').value.trim() : '';
            var city = document.getElementById('custSearchCity') ? document.getElementById('custSearchCity').value.trim() : '';
            var login_agent = document.getElementById('custSearchAgent') ? document.getElementById('custSearchAgent').value : '';
            var login_expeditor = document.getElementById('custSearchExpeditor') ? document.getElementById('custSearchExpeditor').value : '';
            var phone = document.getElementById('custSearchPhone') ? document.getElementById('custSearchPhone').value.trim() : '';
            var tax_id = document.getElementById('custSearchTaxId') ? document.getElementById('custSearchTaxId').value.trim() : '';
            var params = ['limit=200'];
            if (cust_id) params.push('customer_id=' + encodeURIComponent(cust_id));
            if (name_client) params.push('name_client=' + encodeURIComponent(name_client));
            if (firm_name) params.push('firm_name=' + encodeURIComponent(firm_name));
            if (city) params.push('city=' + encodeURIComponent(city));
            if (login_agent) params.push('login_agent=' + encodeURIComponent(login_agent));
            if (login_expeditor) params.push('login_expeditor=' + encodeURIComponent(login_expeditor));
            if (phone) params.push('phone=' + encodeURIComponent(phone));
            if (tax_id) params.push('tax_id=' + encodeURIComponent(tax_id));
            api('/api/v1/customers?' + params.join('&')).catch(function () { return []; }).then(function (list) {
              list = asList(list);
              var tableDiv = document.getElementById('sectionTable');
              if (!tableDiv) return;
              if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð².</p>'; return; }
              var custSortCol = 'name_client';
              var custSortDir = 1;
              var canEditCust = isAdmin() || (menuByCode['customers'] && menuByCode['customers'] !== 'none') || (menuByCode['customers_create'] && menuByCode['customers_create'] !== 'none');
              function renderCustTable(data) {
                var sorted = data.slice().sort(function (a, b) {
                  return tableSortCompare(a, b, custSortCol, custSortDir, function (r, c) {
                    if (c === 'has_photo') return (r.has_photo ? '1' : '0');
                    if (c === 'id') return String(r[c] != null ? r[c] : 0).padStart(12, '0');
                    if (c === 'latitude' || c === 'longitude') return (r[c] != null ? r[c] : '').toString();
                    return (r[c] || '').toString().toLowerCase();
                  });
                });
                var cols = [{ col: 'id', lbl: 'ÐÐ ÐºÐ»Ð¸ÐµÐ½ÑÐ°' }, { col: 'name_client', lbl: 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°' }, { col: 'firm_name', lbl: 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÑÐ¸ÑÐ¼Ñ' }, { col: 'category_client', lbl: 'ÐÐ°ÑÐµÐ³Ð¾ÑÐ¸Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ°' }, { col: 'address', lbl: 'ÐÐ´ÑÐµÑ' }, { col: 'city', lbl: 'ÐÐ¾ÑÐ¾Ð´' }, { col: 'territory', lbl: 'Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ' }, { col: 'landmark', lbl: 'ÐÑÐ¸ÐµÐ½ÑÐ¸Ñ' }, { col: 'phone', lbl: 'Ð¢ÐµÐ»ÐµÑÐ¾Ð½' }, { col: 'contact_person', lbl: 'ÐÐ¾Ð½ÑÐ°ÐºÑÐ½Ð¾Ðµ Ð»Ð¸ÑÐ¾' }, { col: 'tax_id', lbl: 'ÐÐÐ' }, { col: 'status', lbl: 'Ð¡ÑÐ°ÑÑÑ' }, { col: 'login_agent', lbl: 'login Ð°Ð³ÐµÐ½ÑÐ°' }, { col: 'login_expeditor', lbl: 'login ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°' }, { col: 'has_photo', lbl: 'ÐÑÑÑ ÑÐ¾ÑÐ¾' }, { col: 'latitude', lbl: 'Ð¨Ð¸ÑÐ¾ÑÐ°' }, { col: 'longitude', lbl: 'ÐÐ¾Ð»Ð³Ð¾ÑÐ°' }, { col: 'PINFL', lbl: 'ÐÐÐÐ¤Ð' }, { col: 'contract_no', lbl: 'ÐÐ¾Ð³Ð¾Ð²Ð¾Ñ â' }, { col: 'account_no', lbl: 'Ð /Ð¡' }, { col: 'bank', lbl: 'ÐÐ°Ð½Ðº' }, { col: 'MFO', lbl: 'ÐÐ¤Ð' }, { col: 'OKED', lbl: 'ÐÐÐ­Ð' }, { col: 'VAT_code', lbl: 'Ð ÐµÐ³. ÐºÐ¾Ð´ ÐÐÐ¡' }];
                var t = '<div style="overflow-x:auto"><table><thead><tr><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th>';
                cols.forEach(function (x) { t += sortableTh(x.col, x.lbl, custSortCol, custSortDir); });
                t += '</tr></thead><tbody>';
                sorted.forEach(function (c) {
                  var id = c.id;
                  var custJson = escAttr(JSON.stringify(c));
                  t += '<tr><td>';
                  t += ' <button type="button" class="btn btn-secondary btn-small" data-cust-visits data-id="' + id + '" data-name="' + escAttr((c.name_client || c.firm_name || '').toString()) + '">ÐÐ¸Ð·Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary btn-small" data-cust-photos data-id="' + id + '" data-name="' + escAttr((c.name_client || c.firm_name || '').toString()) + '">Ð¤Ð¾ÑÐ¾</button> <button type="button" class="btn btn-secondary btn-small" data-cust-edit data-id="' + id + '" data-cust-json="' + custJson + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button>';
                  if (isAdmin()) t += ' <button type="button" class="btn btn-secondary btn-small" data-cust-del data-id="' + id + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
                  t += '</td><td>' + (c.id != null ? c.id : '') + '</td><td>' + escAttr(c.name_client || '') + '</td><td>' + escAttr(c.firm_name || '') + '</td><td>' + escAttr(c.category_client || '') + '</td><td>' + escAttr(c.address || '') + '</td><td>' + escAttr(c.city || '') + '</td><td>' + escAttr(c.territory || '') + '</td><td>' + escAttr(c.landmark || '') + '</td><td>' + escAttr(c.phone || '') + '</td><td>' + escAttr(c.contact_person || '') + '</td><td>' + escAttr(c.tax_id || '') + '</td><td>' + escAttr(c.status || '') + '</td><td>' + escAttr(c.login_agent || '') + '</td><td>' + escAttr(c.login_expeditor || '') + '</td><td>' + (c.has_photo ? 'ÐÐ°' : 'ÐÐµÑ') + '</td><td>' + (c.latitude != null ? c.latitude : '') + '</td><td>' + (c.longitude != null ? c.longitude : '') + '</td><td>' + escAttr(c.PINFL || '') + '</td><td>' + escAttr(c.contract_no || '') + '</td><td>' + escAttr(c.account_no || '') + '</td><td>' + escAttr(c.bank || '') + '</td><td>' + escAttr(c.MFO || '') + '</td><td>' + escAttr(c.OKED || '') + '</td><td>' + escAttr(c.VAT_code || '') + '</td></tr>';
                });
                t += '</tbody></table></div>';
                tableDiv.innerHTML = t;
                tableDiv.querySelectorAll('th.sortable').forEach(function (th) {
                  th.onclick = function () { var col = th.getAttribute('data-col'); if (custSortCol === col) custSortDir = -custSortDir; else { custSortCol = col; custSortDir = 1; } renderCustTable(list); };
                });
                tableDiv.querySelectorAll('[data-cust-edit]').forEach(function (el) {
                el.onclick = function () {
                  var id = el.getAttribute('data-id');
                  var jsonStr = (el.getAttribute('data-cust-json') || '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
                  var c = {}; try { c = JSON.parse(jsonStr); } catch (e) {}
                  loadCitiesAndTerritories().then(function () {
                    showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°', custEditFormHtml(c, userList), function (errEl) {
                      return api('/api/v1/customers/' + id, { method: 'PATCH', body: JSON.stringify(custFormBody()) }).then(function () { loadSectionCustomers(); });
                    });
                  });
                };
              });
              tableDiv.querySelectorAll('[data-cust-del]').forEach(function (el) {
                el.onclick = function () {
                  var id = el.getAttribute('data-id');
                  if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ° ID ' + id + '?')) return;
                  api('/api/v1/customers/' + id, { method: 'DELETE' }).then(function () { loadSectionCustomers(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ°'); });
                };
              });
              tableDiv.querySelectorAll('[data-cust-visits]').forEach(function (el) {
                el.onclick = function () {
                  var cid = el.getAttribute('data-id');
                  var cname = (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') || ('ÐÐ»Ð¸ÐµÐ½Ñ #' + cid);
                  var html = '<div id="visitsModalBody"><p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p></div><p style="margin-top:12px"><button type="button" class="btn btn-primary" id="btnAddVisitModal">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð²Ð¸Ð·Ð¸Ñ</button></p>';
                  showModal('ÐÐ¸Ð·Ð¸ÑÑ: ' + cname, html, function () { return Promise.resolve(); });
                  var container = document.getElementById('visitsModalBody');
                  var refreshVisits = function () {
                    if (!container) return;
                    api('/api/v1/customers/' + cid + '/visits?limit=100').then(function (r) {
                      var data = Array.isArray(r) ? r : (r && r.data) || [];
                      if (!container) return;
                      if (!data.length) { container.innerHTML = '<p>ÐÐµÑ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð².</p>'; return; }
                      var tbl = '<table style="width:100%"><thead><tr><th>ÐÐ°ÑÐ°</th><th>ÐÑÐµÐ¼Ñ</th><th>Ð¡ÑÐ°ÑÑÑ</th><th>ÐÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹</th><th>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</th><th></th></tr></thead><tbody>';
                      data.forEach(function (v) {
                        var statusRu = (v.status === 'planned' ? 'ÐÐ°Ð¿Ð»Ð°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½' : v.status === 'completed' ? 'ÐÐ°Ð²ÐµÑÑÑÐ½' : 'ÐÑÐ¼ÐµÐ½ÑÐ½');
                        var canEdit = v.status !== 'cancelled';
                        tbl += '<tr><td>' + (v.visit_date || '') + '</td><td>' + (v.visit_time || 'â') + '</td><td>' + statusRu + '</td><td>' + (v.responsible_name || v.responsible_login || 'â') + '</td><td>' + (v.comment || '').substring(0, 50) + (v.comment && v.comment.length > 50 ? 'â¦' : '') + '</td><td><button type="button" class="btn btn-secondary btn-small" data-visit-open data-vid="' + v.id + '">ÐÑÐºÑÑÑÑ</button> ' + (canEdit ? '<button type="button" class="btn btn-secondary btn-small" data-visit-edit data-vid="' + v.id + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> ' : '') + '<button type="button" class="btn btn-secondary btn-small" data-visit-del data-vid="' + v.id + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button></td></tr>';
                      });
                      tbl += '</tbody></table>';
                      container.innerHTML = tbl;
                      container.querySelectorAll('[data-visit-del]').forEach(function (b) {
                        b.onclick = function () {
                          if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ Ð²Ð¸Ð·Ð¸Ñ?')) return;
                          api('/api/v1/visits/' + b.getAttribute('data-vid'), { method: 'DELETE' }).then(refreshVisits).catch(function (e) { alert(e.data && e.data.detail ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ°'); });
                        };
                      });
                      container.querySelectorAll('[data-visit-open]').forEach(function (b) {
                        b.onclick = function () {
                          var vid = b.getAttribute('data-vid');
                          api('/api/v1/visits/' + vid).then(function (visit) {
                            var dateStr = visit.visit_date ? formatDateOnly(visit.visit_date) : 'â';
                            var timeStr = (visit.visit_time || '').toString().substring(0, 5) || 'â';
                            var statusRu = (visit.status === 'planned' ? 'ÐÐ°Ð¿Ð»Ð°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½' : visit.status === 'completed' ? 'ÐÐ°Ð²ÐµÑÑÑÐ½' : visit.status === 'cancelled' ? 'ÐÑÐ¼ÐµÐ½ÑÐ½' : 'ÐÐ° ÑÐ°ÑÑÐ¼Ð¾ÑÑÐµÐ½Ð¸Ð¸');
                            var body = '<div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ</label><div>' + escAttr(visit.customer_name || '') + '</div></div><div class="form-group"><label>ÐÐ°ÑÐ°</label><div>' + escAttr(dateStr) + '</div></div><div class="form-group"><label>ÐÑÐµÐ¼Ñ</label><div>' + escAttr(timeStr) + '</div></div><div class="form-group"><label>Ð¡ÑÐ°ÑÑÑ</label><div>' + escAttr(statusRu) + '</div></div><div class="form-group"><label>ÐÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹</label><div>' + escAttr(visit.responsible_name || visit.responsible_login || '') + '</div></div>' + (visit.comment ? '<div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><div>' + escAttr(visit.comment) + '</div></div>' : '') + '<p><button type="button" class="btn btn-secondary" id="vcard_edit_inner">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button></p>';
                            showModal('ÐÐ°ÑÑÐ¾ÑÐºÐ° Ð²Ð¸Ð·Ð¸ÑÐ°', body, function () { return Promise.resolve(); });
                            var editBtn = document.getElementById('vcard_edit_inner');
                            if (editBtn) editBtn.onclick = function () {
                              document.querySelector('#modalContainer .modal.show') && document.querySelector('#modalContainer .modal.show').classList.remove('show');
                              openVisitEditModal(cid, visit, userList, refreshVisits);
                            };
                          });
                        };
                      });
                      container.querySelectorAll('[data-visit-edit]').forEach(function (b) {
                        b.onclick = function () {
                          var vid = b.getAttribute('data-vid');
                          api('/api/v1/visits/' + vid).then(function (visit) {
                            openVisitEditModal(cid, visit, userList, refreshVisits);
                          }).catch(function (e) { alert(e.data && e.data.detail ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸'); });
                        };
                      });
                    }).catch(function () { if (container) container.innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð².</p>'; });
                  };
                  refreshVisits();
                  setTimeout(function () {
                    var addBtn = document.getElementById('btnAddVisitModal');
                    if (addBtn) addBtn.onclick = function () {
                      openVisitAddModal(cid, userList, refreshVisits);
                    };
                  }, 100);
                };
              });
              tableDiv.querySelectorAll('[data-cust-photos]').forEach(function (el) {
                el.onclick = function () {
                  var cid = el.getAttribute('data-id');
                  var cname = (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') || ('ÐÐ»Ð¸ÐµÐ½Ñ #' + cid);
                  var html = '<div id="photosModalBody"><p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p></div><p style="margin-top:12px"><strong>ÐÐ°Ð³ÑÑÐ·ÐºÐ° ÑÐ¾ÑÐ¾</strong> (ÐºÐ»Ð¸ÐµÐ½Ñ: ' + escAttr(cname) + ')</p><p style="display:flex;flex-wrap:wrap;align-items:center;gap:12px"><span style="position:relative"><input type="file" id="photoFile" accept="image/*" style="position:absolute;left:0;top:0;opacity:0;width:100%;height:100%;cursor:pointer;font-size:0"><button type="button" class="btn btn-secondary" style="pointer-events:none">ÐÐ«ÐÐ ÐÐ¢Ð¬ Ð¤ÐÐÐ!</button></span><span id="photoFileName" style="font-size:13px;color:#64748b;min-width:120px"></span><button type="button" class="btn btn-primary" id="btnUploadPhoto">ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ</button></p><div id="photosUploadErr" class="err" style="margin-top:8px;display:none"></div>';
                  showModal('Ð¤Ð¾ÑÐ¾: ' + cname, html, function () { return Promise.resolve(); }, { closeOnly: true });
                  var container = document.getElementById('photosModalBody');
                  var refreshPhotos = function () {
                    if (!container) return;
                    api('/api/v1/customers/' + cid + '/photos').then(function (r) {
                      var data = (r && r.data) || [];
                      if (!container) return;
                        if (!data.length) { container.innerHTML = '<p>ÐÐµÑ ÑÐ¾ÑÐ¾Ð³ÑÐ°ÑÐ¸Ð¹.</p>'; return; }
                      var div = '<div style="display:flex;flex-wrap:wrap;gap:8px">';
                      data.forEach(function (p) {
                        var fname = (p.photo_path || '').split('/').pop() || '';
                        var url = p.photo_url || (fname ? (window.location.origin + '/photo/' + fname) : null) || (window.location.origin + '/api/v1/photos/download/' + (p.download_token || ''));
                        var desc = p.description || (p.photo_datetime ? ('Ð¡ÑÑÐ¼ÐºÐ°: ' + p.photo_datetime.slice(0, 16).replace('T', ' ')) : 'â');
                        div += '<div style="flex:0 0 auto"><a href="' + url + '" target="_blank"><img src="' + url + '" alt="" style="max-width:120px;max-height:120px;object-fit:cover;border-radius:6px"></a><p style="font-size:11px;margin:4px 0 0 0">' + (desc || 'â') + '</p></div>';
                      });
                      div += '</div>';
                      container.innerHTML = div;
                    }).catch(function (e) {
                      if (!container) return;
                      var msg = 'ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð³ÑÑÐ·Ð¸ÑÑ ÑÐ¿Ð¸ÑÐ¾Ðº ÑÐ¾ÑÐ¾Ð³ÑÐ°ÑÐ¸Ð¹.';
                      if (e && e.data) {
                        var d = e.data;
                        if (typeof d === 'string') msg += ' ' + d;
                        else if (d && d.detail) msg += ' ' + (typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail));
                        else if (e.status) msg += ' (HTTP ' + e.status + ')';
                      } else if (e && e.status) msg += ' (HTTP ' + e.status + ')';
                      container.innerHTML = '<p class="err">' + msg + '</p><p style="margin-top:8px"><button type="button" class="btn btn-secondary" id="btnRetryPhotos">ÐÐ¾Ð²ÑÐ¾ÑÐ¸ÑÑ</button></p>';
                      var retryBtn = document.getElementById('btnRetryPhotos');
                      if (retryBtn) retryBtn.onclick = refreshPhotos;
                    });
                  };
                  refreshPhotos();
                  setTimeout(function () {
                    var fileInput = document.getElementById('photoFile');
                    var photoFileNameEl = document.getElementById('photoFileName');
                    var uploadErrEl = document.getElementById('photosUploadErr');
                    if (fileInput && photoFileNameEl) fileInput.addEventListener('change', function () {
                      photoFileNameEl.textContent = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : '';
                      if (uploadErrEl) uploadErrEl.textContent = '';
                    });
                    var uploadBtn = document.getElementById('btnUploadPhoto');
                    if (uploadBtn) uploadBtn.onclick = function () {
                      var fileInput = document.getElementById('photoFile');
                      if (!fileInput || !fileInput.files || !fileInput.files[0]) { if (uploadErrEl) { uploadErrEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ°Ð¹Ð»'; uploadErrEl.className = 'err'; uploadErrEl.style.display = 'block'; } else alert('ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ°Ð¹Ð»'); return; }
                      var token = localStorage.getItem('sds_token');
                      if (!token) { var m = 'ÐÐµÑ ÑÐ¾ÐºÐµÐ½Ð° Ð°Ð²ÑÐ¾ÑÐ¸Ð·Ð°ÑÐ¸Ð¸. ÐÐ¾Ð¹Ð´Ð¸ÑÐµ Ð·Ð°Ð½Ð¾Ð²Ð¾.'; if (uploadErrEl) { uploadErrEl.textContent = m; uploadErrEl.style.display = 'block'; } else alert(m); return; }
                      uploadBtn.disabled = true;
                      if (uploadErrEl) { uploadErrEl.textContent = 'ÐÐ°Ð³ÑÑÐ·ÐºÐ°...'; uploadErrEl.className = ''; uploadErrEl.style.display = 'block'; }
                      var fd = new FormData();
                      fd.append('file', fileInput.files[0]);
                      fd.append('is_main', 'false');
                      var url = window.location.origin + '/api/v1/customers/' + cid + '/photos';
                      console.log('[Photo upload] POST', url, 'file:', fileInput.files[0].name);
                      fetch(url, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: fd }).then(function (res) {
                        console.log('[Photo upload] status', res.status, res.statusText);
                        if (!res.ok) return res.text().then(function (text) {
                          var d;
                          try { d = JSON.parse(text); } catch (_) { d = { detail: res.status + ' ' + res.statusText + (text ? ': ' + text.slice(0, 200) : '') }; }
                          throw d;
                        });
                        return res.json();
                      }).then(function (data) {
                        console.log('[Photo upload] success', data);
                        fileInput.value = '';
                        if (photoFileNameEl) photoFileNameEl.textContent = '';
                        if (uploadErrEl) { uploadErrEl.textContent = 'ÐÐ°Ð³ÑÑÐ¶ÐµÐ½Ð¾.'; uploadErrEl.className = 'msg'; uploadErrEl.style.display = 'block'; }
                        refreshPhotos();
                      }).catch(function (e) {
                        console.error('[Photo upload] error', e);
                        var msg = (e && e.detail) ? (typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail)) : (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) ? e.message : 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ ÑÐ¾ÑÐ¾';
                        if (uploadErrEl) { uploadErrEl.textContent = msg; uploadErrEl.className = 'err'; uploadErrEl.style.display = 'block'; } else alert(msg);
                      }).finally(function () { uploadBtn.disabled = false; });
                    };
                  }, 150);
                };
              });
            }
              renderCustTable(list);
            });
          }
          document.getElementById('btnCustSearch').onclick = runCustomerSearch;
          runCustomerSearch();
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸.</p></div>'; });
        function bindCustAdd(userList) {
          var btn = document.getElementById('custAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            loadCitiesAndTerritories().then(function () {
              var bodyHtml = custEditFormHtml({ status: 'ÐÐºÑÐ¸Ð²Ð½ÑÐ¹' }, userList);
              showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°', bodyHtml, function (errEl) {
                return api('/api/v1/customers', { method: 'POST', body: JSON.stringify(custFormBody()) }).then(function () { loadSectionCustomers(); });
              });
            });
          };
        }
      }

      function loadSectionCustomersMap() {
        var content = document.getElementById('content');
        if (!content) return;
        content.innerHTML = '<div class="card"><h2>ÐÐ»Ð¸ÐµÐ½ÑÑ Ð½Ð° ÐºÐ°ÑÑÐµ</h2><div class="map-toolbar"><label>ÐÐ°ÑÑÐ°:</label><select id="mapProvider"><option value="yandex">Ð¯Ð½Ð´ÐµÐºÑ.ÐÐ°ÑÑÑ</option><option value="osm">OpenStreetMap</option></select></div><p id="customersMapInfo" style="margin:0 0 12px 0;font-size:14px;color:#555">ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p><div id="customersMap"></div></div>';
        api('/api/v1/config').catch(function () { return {}; }).then(function (config) {
          var yandexKey = (config && config.yandexMapsApiKey) ? config.yandexMapsApiKey : '';
          api('/api/v1/customers?limit=200').catch(function () { return []; }).then(function (list) {
            list = asList(list);
            var withCoords = list.filter(function (c) { return c.latitude != null && c.longitude != null && !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude)); });
            var infoEl = document.getElementById('customersMapInfo');
            var noCoordsMsg = withCoords.length === 0 ? ' ÐÐµÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð² Ñ ÐºÐ¾Ð¾ÑÐ´Ð¸Ð½Ð°ÑÐ°Ð¼Ð¸ â ÑÐºÐ°Ð¶Ð¸ÑÐµ ÑÐ¸ÑÐ¾ÑÑ Ð¸ Ð´Ð¾Ð»Ð³Ð¾ÑÑ Ð² ÐºÐ°ÑÑÐ¾ÑÐºÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ° (ÐÐ¾Ð¸ÑÐº ÐºÐ»Ð¸ÐµÐ½ÑÐ° â ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ).' : '';
            if (infoEl) infoEl.innerHTML = 'ÐÑÐ¾Ð±ÑÐ°Ð¶ÐµÐ½Ð¾ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð² Ð½Ð° ÐºÐ°ÑÑÐµ: ' + withCoords.length + (list.length ? ' (Ð¸Ð· ' + list.length + ')' : '') + (noCoordsMsg ? '<br><span style="color:#856404">' + noCoordsMsg + '</span>' : '');
            var defaultCenter = [41.2995, 69.2401];
            var zoom = 10;
            if (withCoords.length === 1) { defaultCenter = [Number(withCoords[0].latitude), Number(withCoords[0].longitude)]; }
            if (withCoords.length > 1) {
              var minLat = Math.min.apply(null, withCoords.map(function (c) { return Number(c.latitude); }));
              var maxLat = Math.max.apply(null, withCoords.map(function (c) { return Number(c.latitude); }));
              var minLon = Math.min.apply(null, withCoords.map(function (c) { return Number(c.longitude); }));
              var maxLon = Math.max.apply(null, withCoords.map(function (c) { return Number(c.longitude); }));
              defaultCenter = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
            }
            var center = defaultCenter;
            var leafletMap = null;
            function destroyCurrentMap() {
              if (window._customersLeafletMap) {
                try { window._customersLeafletMap.remove(); } catch (e) {}
                window._customersLeafletMap = null;
              }
              var container = document.getElementById('customersMap');
              if (container) container.innerHTML = '';
            }
            function initOsmMap() {
              destroyCurrentMap();
              var container = document.getElementById('customersMap');
              if (!container) return;
              function doInit() {
                if (window._customersLeafletMap) return;
                var map = L.map('customersMap').setView(center, zoom);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
                withCoords.forEach(function (c) {
                  var lat = Number(c.latitude);
                  var lon = Number(c.longitude);
                  var name = (c.name_client || c.firm_name || 'ÐÐ»Ð¸ÐµÐ½Ñ #' + (c.id || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                  var addr = (c.address || '') + (c.city ? ', ' + c.city : '') + (c.territory ? ', ' + c.territory : '');
                  var popup = '<div style="padding:4px 0"><strong>' + name + '</strong></div>' + (addr ? '<div style="font-size:12px;color:#666">' + addr.replace(/</g, '&lt;') + '</div>' : '') + (c.phone ? '<div style="font-size:12px">' + (c.phone + '').replace(/</g, '&lt;') + '</div>' : '');
                  L.marker([lat, lon]).addTo(map).bindPopup(popup);
                });
                if (withCoords.length > 1) map.fitBounds(withCoords.map(function (c) { return [Number(c.latitude), Number(c.longitude)]; }), { padding: [50, 50] });
                window._customersLeafletMap = map;
              }
              if (typeof L !== 'undefined') { doInit(); return; }
              var link = document.createElement('link');
              link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='; link.crossOrigin = '';
              document.head.appendChild(link);
              var script = document.createElement('script');
              script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
              script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='; script.crossOrigin = '';
              script.onload = doInit;
              document.head.appendChild(script);
            }
            function initYandexMap() {
              destroyCurrentMap();
              var container = document.getElementById('customersMap');
              if (container) container.innerHTML = '<div id="customersMapInner" style="width:100%;height:100%;min-height:400px"></div>';
              if (typeof ymaps === 'undefined' && !yandexKey) {
                if (infoEl) infoEl.innerHTML = 'ÐÑÐ¾Ð±ÑÐ°Ð¶ÐµÐ½Ð¾ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð² Ð½Ð° ÐºÐ°ÑÑÐµ: ' + withCoords.length + '. <span style="color:#c00">ÐÐ»Ñ Ð¯Ð½Ð´ÐµÐºÑ.ÐÐ°ÑÑ Ð·Ð°Ð´Ð°Ð¹ÑÐµ YANDEX_MAPS_API_KEY Ð½Ð° ÑÐµÑÐ²ÐµÑÐµ Ð¸Ð»Ð¸ Ð²ÑÐ±ÐµÑÐ¸ÑÐµ OpenStreetMap.</span>';
                return;
              }
              function doYandex() {
                if (typeof ymaps === 'undefined') {
                  var script = document.createElement('script');
                  script.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + encodeURIComponent(yandexKey) + '&lang=ru_RU';
                  script.onload = doYandex; script.onerror = function () { if (infoEl) infoEl.innerHTML = 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð¯Ð½Ð´ÐµÐºÑ.ÐÐ°ÑÑ.'; };
                  document.head.appendChild(script);
                  return;
                }
                ymaps.ready(function () {
                  var mapDiv = document.getElementById('customersMapInner') || document.getElementById('customersMap');
                  if (!mapDiv) return;
                  var map = new ymaps.Map(mapDiv, { center: center, zoom: zoom, controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl'] });
                  withCoords.forEach(function (c) {
                    var lat = Number(c.latitude);
                    var lon = Number(c.longitude);
                    var name = (c.name_client || c.firm_name || 'ÐÐ»Ð¸ÐµÐ½Ñ #' + (c.id || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                    var addr = (c.address || '') + (c.city ? ', ' + c.city : '') + (c.territory ? ', ' + c.territory : '');
                    var balloon = '<div style="padding:4px 0"><strong>' + name + '</strong></div>' + (addr ? '<div style="font-size:12px;color:#666">' + addr.replace(/</g, '&lt;') + '</div>' : '') + (c.phone ? '<div style="font-size:12px">' + (c.phone + '').replace(/</g, '&lt;') + '</div>' : '');
                    var placemark = new ymaps.Placemark([lat, lon], { balloonContent: balloon }, { preset: 'islands#redCircleIcon' });
                    map.geoObjects.add(placemark);
                  });
                  if (withCoords.length > 1) map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true, zoomMargin: 50 });
                });
              }
              doYandex();
            }
            function renderMap() {
              var sel = document.getElementById('mapProvider');
              var provider = (sel && sel.value) ? sel.value : 'osm';
              if (provider === 'osm') initOsmMap(); else initYandexMap();
            }
            document.getElementById('mapProvider').onchange = renderMap;
            renderMap();
          });
        });
      }

      function loadSectionOrders() {
        var content = document.getElementById('content');
        if (!content) return;
        content.innerHTML = '<div class="card"><h2>ÐÐ°ÐºÐ°Ð·Ñ</h2><p style="margin:0 0 12px 0"><button type="button" class="btn btn-primary" id="orderAdd">Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð·Ð°ÐºÐ°Ð·</button>' + (isAdmin() ? ' <button type="button" class="btn btn-secondary" id="orderExport">Ð¡ÐºÐ°ÑÐ°ÑÑ Ð·Ð°ÐºÐ°Ð·Ñ Ð² Excel</button>' : '') + '</p><div class="form-group" style="margin:12px 0"><label>ÐÐ¾Ð¸ÑÐº Ð·Ð°ÐºÐ°Ð·Ð¾Ð²</label></div><div id="orderSearchRow" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"></div><div id="sectionOrderErr" class="err"></div><div id="orderInfo" style="margin:12px 0;padding:8px;background:#f8f9fa;border-radius:4px;font-size:13px"></div><div id="sectionTable"></div></div>';
        var tableDiv = document.getElementById('sectionTable');
        var errDiv = document.getElementById('sectionOrderErr');
        var searchRow = document.getElementById('orderSearchRow');
        bindOrderAdd();
        var orderExportBtn = document.getElementById('orderExport');
        if (orderExportBtn) orderExportBtn.onclick = function () {
          var url = window.location.origin + '/api/v1/orders/export';
          fetch(url, { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
            if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
            return r.blob();
          }).then(function (blob) {
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders.xlsx'; a.click(); URL.revokeObjectURL(a.href);
          }).catch(function (e) { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸: ' + (e && e.data && e.data.detail ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : e.message || 'ÐÑÐ¸Ð±ÐºÐ°')); });
        };
        function formatDateTashkent(isoStr) {
          if (!isoStr) return '';
          try {
            var d = parseBackendDate(isoStr);
            if (!d) return isoStr;
            return d.toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          } catch (e) { return isoStr; }
        }
        function formatScheduledDelivery(isoStr, statusCode) {
          var text = formatDateTashkent(isoStr);
          if (!text) return '';
          var sc = (statusCode || '').toString().toLowerCase().replace(/\s/g, '');
          if (sc === 'completed' || sc === 'cancelled' || sc === 'canceled' || sc === 'Ð¾ÑÐ¼ÐµÐ½ÐµÐ½' || sc === 'Ð·Ð°Ð²ÐµÑÑÐµÐ½' || sc === 'closed' || sc === '4' || (sc.length && sc.charAt(0) === '4') || sc.indexOf('Ð¾ÑÐ¼ÐµÐ½ÐµÐ½') !== -1) return text;
          try {
            var d = parseBackendDate(isoStr);
            if (!d) return text;
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            d.setHours(0, 0, 0, 0);
            if (d < today) return '<span style="color:#c00;font-weight:bold" title="ÐÑÐ¾ÑÑÐ¾ÑÐµÐ½Ð°">' + text + '</span>';
          } catch (e) {}
          return text;
        }
        var orderSortCol = 'order_no';
        var orderSortDir = 1;
        function renderOrderTable(data) {
          if (errDiv) errDiv.textContent = '';
          var list = asList(data);
          var totalAmount = 0;
          var totalCount = 0;
          var infoDiv = document.getElementById('orderInfo');
          
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            totalCount = data.total_count || list.length;
            totalAmount = data.total_amount || 0;
          } else {
            totalCount = list.length;
            list.forEach(function(o) {
              totalAmount += (o.total_amount || 0);
            });
          }
          
          if (infoDiv) {
            infoDiv.innerHTML = '<strong>ÐÐ°Ð¹Ð´ÐµÐ½Ð¾ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²:</strong> ' + totalCount + ' | <strong>ÐÑÐ¾Ð³Ð¾ ÑÑÐ¼Ð¼Ð°:</strong> ' + totalAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' ÑÑÐ¼';
          }
          
          if (!list || !list.length) { 
            tableDiv.innerHTML = '<p>ÐÐ°ÐºÐ°Ð·Ð¾Ð² Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾. ÐÐ·Ð¼ÐµÐ½Ð¸ÑÐµ ÐºÑÐ¸ÑÐµÑÐ¸Ð¸ Ð¿Ð¾Ð¸ÑÐºÐ° Ð¸Ð»Ð¸ ÑÐ¾Ð·Ð´Ð°Ð¹ÑÐµ Ð·Ð°ÐºÐ°Ð·.</p>'; 
            if (infoDiv && totalCount === 0) {
              infoDiv.innerHTML = '<strong>ÐÐ°Ð¹Ð´ÐµÐ½Ð¾ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²:</strong> 0 | <strong>ÐÑÐ¾Ð³Ð¾ ÑÑÐ¼Ð¼Ð°:</strong> 0,00 ÑÑÐ¼';
            }
            return; 
          }
          var sorted = list.slice().sort(function (a, b) {
            return tableSortCompare(a, b, orderSortCol, orderSortDir, function (r, c) {
              if (c === 'order_no') return String(r.order_no != null ? r.order_no : (r.id || 0)).padStart(12, '0');
              if (c === 'total_amount') return (r.total_amount != null ? String(Number(r.total_amount)).padStart(20, '0') : '');
              if (c === 'order_date' || c === 'scheduled_delivery_at' || c === 'last_updated_at') return (r[c] || '').toString();
              return (r[c] || (r.customer_name || (r.customer_id != null ? 'ID ' + r.customer_id : '')) || '').toString().toLowerCase();
            });
          });
          var arrow = orderSortDir > 0 ? ' â²' : ' â¼';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (orderSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th>' + th('order_no', 'â') + th('customer_name', 'ÐÐ»Ð¸ÐµÐ½Ñ') + th('order_date', 'ÐÐ°ÑÐ° ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ') + th('status_code', 'Ð¡ÑÐ°ÑÑÑ') + th('payment_type_name', 'Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ') + th('total_amount', 'Ð¡ÑÐ¼Ð¼Ð°') + th('login_agent', 'ÐÐ³ÐµÐ½Ñ') + th('login_expeditor', 'Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ') + th('scheduled_delivery_at', 'ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸') + '<th>ÐÐµÑÐµÐ²Ð¾Ð´ Ð² ÑÑÐ°ÑÑÑ Â«ÐÐ¾ÑÑÐ°Ð²ÐºÐ°Â»</th><th>ÐÐ°ÑÐ° Ð·Ð°ÐºÑÑÑÐ¸Ñ</th>' + th('last_updated_at', 'ÐÐ¾ÑÐ»ÐµÐ´Ð½ÐµÐµ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ðµ') + th('last_updated_by', 'ÐÑÐ¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»') + '</tr></thead><tbody>';
          sorted.forEach(function (o) {
            t += '<tr><td><button type="button" class="btn btn-secondary btn-small" data-order-edit data-id="' + (o.order_no != null ? o.order_no : o.id) + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary btn-small" data-order-copy data-id="' + (o.order_no != null ? o.order_no : o.id) + '" style="background:#17a2b8;color:#fff;border-color:#17a2b8">ÐÐ¾Ð¿Ð¸ÑÐ¾Ð²Ð°ÑÑ</button></td><td>' + (o.order_no != null ? o.order_no : o.id) + '</td><td>' + escAttr(o.customer_name || (o.customer_id != null ? 'ID ' + o.customer_id : '')) + '</td><td>' + formatDateTashkent(o.order_date) + '</td><td>' + formatStatusBadge(o.status_code, o.status_name) + '</td><td>' + escAttr(o.payment_type_name || o.payment_type_code || '') + '</td><td>' + (o.total_amount != null ? o.total_amount : '') + '</td><td>' + escAttr(o.login_agent || '') + '</td><td>' + escAttr(o.login_expeditor || '') + '</td><td>' + formatScheduledDelivery(o.scheduled_delivery_at, o.status_code) + '</td><td>' + formatDateTashkent(o.status_delivery_at) + '</td><td>' + formatDateTashkent(o.closed_at) + '</td><td>' + formatDateTashkent(o.last_updated_at) + '</td><td>' + escAttr(o.last_updated_by || '') + '</td></tr>';
          });
          t += '</tbody></table></div>';
          tableDiv.innerHTML = t;
          tableDiv.querySelectorAll('th.sortable').forEach(function (thEl) {
            thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (orderSortCol === col) orderSortDir = -orderSortDir; else { orderSortCol = col; orderSortDir = 1; } renderOrderTable(data); };
          });
          tableDiv.querySelectorAll('[data-order-edit]').forEach(function (el) {
            el.onclick = function () {
              var orderId = el.getAttribute('data-id') || '';
              api('/api/v1/orders/' + orderId).then(function (orderData) {
                Promise.all([
                  api('/api/v1/customers?limit=200').catch(function () { return []; }),
                  api('/api/v1/orders/statuses').catch(function () { return []; }),
                  api('/api/v1/dictionary/products').catch(function () { return []; }),
                  api('/api/v1/dictionary/payment-types').catch(function () { return []; }),
                  api('/api/v1/dictionary/user-logins').catch(function () { return []; })
                ]).then(function (results) {
                  var customers = results[0] || [];
                  var statuses = results[1] || [];
                  var products = results[2] || [];
                  var paymentTypes = results[3] || [];
                  var userList = results[4] || [];
                  openOrderForm(true, orderId, orderData, customers, statuses, products, paymentTypes, userList);
                });
              }).catch(function (e) {
                if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð³ÑÑÐ·Ð¸ÑÑ Ð·Ð°ÐºÐ°Ð·.';
              });
            };
          });
          tableDiv.querySelectorAll('[data-order-copy]').forEach(function (el) {
            el.onclick = function () {
              var orderId = el.getAttribute('data-id') || '';
              api('/api/v1/orders/' + orderId).then(function (orderData) {
                Promise.all([
                  api('/api/v1/customers?limit=200').catch(function () { return []; }),
                  api('/api/v1/orders/statuses').catch(function () { return []; }),
                  api('/api/v1/dictionary/products').catch(function () { return []; }),
                  api('/api/v1/dictionary/payment-types').catch(function () { return []; }),
                  api('/api/v1/dictionary/user-logins').catch(function () { return []; })
                ]).then(function (results) {
                  var customers = results[0] || [];
                  var statuses = results[1] || [];
                  var products = results[2] || [];
                  var paymentTypes = results[3] || [];
                  var userList = results[4] || [];
                  var copyData = {
                    customer_id: orderData.customer_id,
                    customer_name: orderData.customer_name,
                    status_code: 'open',
                    payment_type_code: orderData.payment_type_code,
                    login_agent: orderData.login_agent,
                    login_expeditor: orderData.login_expeditor,
                    scheduled_delivery_at: null,
                    items: (orderData.items || []).map(function (it) {
                      return { product_code: it.product_code, quantity: it.quantity, price: it.price };
                    })
                  };
                  openOrderForm(false, null, copyData, customers, statuses, products, paymentTypes, userList);
                  var titleEl = document.getElementById('orderFormTitle');
                  if (titleEl) titleEl.textContent = 'ÐÐ¾Ð¿Ð¸Ñ Ð·Ð°ÐºÐ°Ð·Ð° â ' + orderId;
                });
              }).catch(function (e) {
                if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð³ÑÑÐ·Ð¸ÑÑ Ð·Ð°ÐºÐ°Ð·.';
              });
            };
          });
        }
        var ORDER_SEARCH_STORAGE = 'orderSearchFilters';
        var ORDER_PRESETS_STORAGE = 'orderSearchPresets';
        function getOrderSearchFilters() {
          var order_no = document.getElementById('orderSearchOrderNo') ? document.getElementById('orderSearchOrderNo').value : '';
          var customer_id = document.getElementById('orderSearchCustomerId') ? document.getElementById('orderSearchCustomerId').value : '';
          var status_code = document.getElementById('orderSearchStatus') ? document.getElementById('orderSearchStatus').value : '';
          var date_from = document.getElementById('orderSearchDateFrom') ? document.getElementById('orderSearchDateFrom').value : '';
          var date_to = document.getElementById('orderSearchDateTo') ? document.getElementById('orderSearchDateTo').value : '';
          var login_agent = document.getElementById('orderSearchAgent') ? document.getElementById('orderSearchAgent').value : '';
          var login_expeditor = document.getElementById('orderSearchExpeditor') ? document.getElementById('orderSearchExpeditor').value : '';
          var last_updated_by = document.getElementById('orderSearchLastUpdatedBy') ? document.getElementById('orderSearchLastUpdatedBy').value : '';
          return { order_no: order_no, customer_id: customer_id, status_code: status_code, date_from: date_from, date_to: date_to, login_agent: login_agent, login_expeditor: login_expeditor, last_updated_by: last_updated_by };
        }
        function setOrderSearchFilters(f) {
          if (!f) return;
          var el;
          if (el = document.getElementById('orderSearchOrderNo')) el.value = f.order_no || '';
          if (el = document.getElementById('orderSearchCustomerId')) el.value = f.customer_id || '';
          if (el = document.getElementById('orderSearchStatus')) el.value = f.status_code || '';
          if (el = document.getElementById('orderSearchDateFrom')) el.value = f.date_from || '';
          if (el = document.getElementById('orderSearchDateTo')) el.value = f.date_to || '';
          if (el = document.getElementById('orderSearchAgent')) el.value = f.login_agent || '';
          if (el = document.getElementById('orderSearchExpeditor')) el.value = f.login_expeditor || '';
          if (el = document.getElementById('orderSearchLastUpdatedBy')) el.value = f.last_updated_by || '';
        }
        function runOrderSearch() {
          var f = getOrderSearchFilters();
          try { localStorage.setItem(ORDER_SEARCH_STORAGE, JSON.stringify(f)); } catch (e) {}
          var params = [];
          if (f.order_no) params.push('order_no=' + encodeURIComponent(f.order_no));
          if (f.customer_id) params.push('customer_id=' + encodeURIComponent(f.customer_id));
          if (f.status_code) params.push('status_code=' + encodeURIComponent(f.status_code));
          if (f.date_from) params.push('scheduled_delivery_from=' + encodeURIComponent(f.date_from + 'T00:00:00'));
          if (f.date_to) params.push('scheduled_delivery_to=' + encodeURIComponent(f.date_to + 'T23:59:59'));
          if (f.login_agent) params.push('login_agent=' + encodeURIComponent(f.login_agent));
          if (f.login_expeditor) params.push('login_expeditor=' + encodeURIComponent(f.login_expeditor));
          if (f.last_updated_by) params.push('last_updated_by=' + encodeURIComponent(f.last_updated_by));
          api('/api/v1/orders' + (params.length ? '?' + params.join('&') : '')).then(renderOrderTable).catch(function (e) {
            if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð¾Ð².';
            tableDiv.innerHTML = '<p>Ð¡Ð¿Ð¸ÑÐ¾Ðº Ð·Ð°ÐºÐ°Ð·Ð¾Ð² Ð½Ðµ Ð·Ð°Ð³ÑÑÐ¶ÐµÐ½.</p>';
          });
        }
        Promise.all([
          api('/api/v1/orders/statuses').catch(function () { return []; }),
          api('/api/v1/dictionary/user-logins').catch(function () { return []; }),
          api('/api/v1/customers?limit=200').catch(function () { return []; })
        ]).then(function (results) {
          var statuses = asList(results[0]);
          var userList = asList(results[1]);
          var customers = asList(results[2]);
          if (!statuses.length) statuses = [{ code: 'open', name: 'ÐÑÐºÑÑÑ' }, { code: 'cancelled', name: 'ÐÑÐ¼ÐµÐ½ÑÐ½' }];
          statuses = statuses.slice().sort(function (a, b) { return (a.name || a.code || '').localeCompare(b.name || b.code || ''); });
          var statusOpts = '<option value="">â ÐÑÐµ â</option>'; statuses.forEach(function (s) { statusOpts += '<option value="' + escAttr(s.code) + '">' + escAttr(s.name || s.code) + '</option>'; });
          var userOpts = '<option value="">â ÐÑÐµ â</option>';
          var expeditorUserOpts = '<option value="">â ÐÑÐµ â</option>';
          userList.forEach(function (u) {
            var optHtml = '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>';
            userOpts += optHtml;
            if ((u.role || '').toLowerCase() === 'expeditor') expeditorUserOpts += optHtml;
          });
          var custOpts = '<option value="">â ÐÑÐ±Ð¾Ð¹ â</option>'; customers.forEach(function (c) { custOpts += '<option value="' + (c.id != null ? c.id : '') + '">' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          var presets = [];
          try { var p = localStorage.getItem(ORDER_PRESETS_STORAGE); if (p) presets = JSON.parse(p); } catch (e) {}
          var presetOpts = '<option value="">â Ð¢ÐµÐºÑÑÐ¸Ð¹ Ð¿Ð¾Ð¸ÑÐº â</option>';
          presets.forEach(function (pr, i) { presetOpts += '<option value="' + i + '">' + escAttr(pr.name || 'ÐÐ°ÑÐ¸Ð°Ð½Ñ ' + (i + 1)) + '</option>'; });
          searchRow.innerHTML = '<div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¡Ð¾ÑÑÐ°Ð½ÑÐ½Ð½ÑÐ¹ Ð¿Ð¾Ð¸ÑÐº</label><select id="orderSearchPreset" style="max-width:180px">' + presetOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ¾Ð¼ÐµÑ Ð·Ð°ÐºÐ°Ð·Ð°</label><input type="number" id="orderSearchOrderNo" min="1" style="max-width:110px" placeholder="â Ð·Ð°ÐºÐ°Ð·Ð°"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ»Ð¸ÐµÐ½Ñ</label><select id="orderSearchCustomerId" style="max-width:220px">' + custOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¡ÑÐ°ÑÑÑ</label><select id="orderSearchStatus" style="max-width:140px">' + statusOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ñ</label><input type="text" id="orderSearchDateFrom" style="max-width:130px" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¿Ð¾</label><input type="text" id="orderSearchDateTo" style="max-width:130px" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ³ÐµÐ½Ñ</label><select id="orderSearchAgent" style="max-width:160px">' + userOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ</label><select id="orderSearchExpeditor" style="max-width:160px">' + expeditorUserOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÑÐ¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»</label><select id="orderSearchLastUpdatedBy" style="max-width:160px">' + userOpts + '</select></div><button type="button" class="btn btn-primary" id="orderSearchBtn">ÐÐ°Ð¹ÑÐ¸</button> <button type="button" class="btn btn-secondary" id="orderSearchSavePreset">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð²Ð°ÑÐ¸Ð°Ð½Ñ</button>';
          document.getElementById('orderSearchBtn').onclick = runOrderSearch;
          document.getElementById('orderSearchPreset').onchange = function () {
            var idx = this.value;
            if (idx === '') return;
            var pr = presets[parseInt(idx, 10)];
            if (pr && pr.filters) { setOrderSearchFilters(pr.filters); runOrderSearch(); }
          };
          document.getElementById('orderSearchSavePreset').onclick = function () {
            var name = prompt('ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð²Ð°ÑÐ¸Ð°Ð½ÑÐ° Ð¿Ð¾Ð¸ÑÐºÐ° (Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ: ÐÐ¾Ð¸ Ð·Ð°ÐºÐ°Ð·Ñ)');
            if (!name || !name.trim()) return;
            var f = getOrderSearchFilters();
            presets.push({ name: name.trim(), filters: f });
            try { localStorage.setItem(ORDER_PRESETS_STORAGE, JSON.stringify(presets)); } catch (e) {}
            var sel = document.getElementById('orderSearchPreset');
            var opt = document.createElement('option'); opt.value = presets.length - 1; opt.textContent = name.trim(); sel.appendChild(opt);
          };
          var savedFilters = null;
          try { var s = localStorage.getItem(ORDER_SEARCH_STORAGE); if (s) savedFilters = JSON.parse(s); } catch (e) {}
          if (window.flatpickr) {
            var df = document.getElementById('orderSearchDateFrom');
            var dt = document.getElementById('orderSearchDateTo');
            if (df) window.flatpickr(df, { locale: 'ru', dateFormat: 'Y-m-d', allowInput: true });
            if (dt) window.flatpickr(dt, { locale: 'ru', dateFormat: 'Y-m-d', allowInput: true });
          }
          if (savedFilters) { setOrderSearchFilters(savedFilters); runOrderSearch(); } else { tableDiv.innerHTML = '<p style="color:#666">Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÑÐ¸ÑÐµÑÐ¸Ð¸ Ð¿Ð¾Ð¸ÑÐºÐ° Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ°Ð¹ÑÐ¸Â» Ð¸Ð»Ð¸ Ð²ÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¾ÑÑÐ°Ð½ÑÐ½Ð½ÑÐ¹ Ð²Ð°ÑÐ¸Ð°Ð½Ñ.</p>'; }
          function tryOpenOrderCard() {
            if (!window._openOrderNo) return;
            var orderNo = window._openOrderNo;
            window._openOrderNo = null;
            api('/api/v1/orders/' + orderNo).then(function (orderData) {
              Promise.all([
                api('/api/v1/customers?limit=200').catch(function () { return []; }),
                api('/api/v1/orders/statuses').catch(function () { return []; }),
                api('/api/v1/dictionary/products').catch(function () { return []; }),
                api('/api/v1/dictionary/payment-types').catch(function () { return []; }),
                api('/api/v1/dictionary/user-logins').catch(function () { return []; })
              ]).then(function (results) {
                openOrderForm(true, orderNo, orderData, results[0], results[1], results[2], results[3], results[4]);
              });
            }).catch(function () {});
          }
          tryOpenOrderCard();
        }).catch(function () {
          searchRow.innerHTML = '<button type="button" class="btn btn-primary" id="orderSearchBtn">ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ Ð·Ð°ÐºÐ°Ð·Ñ</button>';
          document.getElementById('orderSearchBtn').onclick = runOrderSearch;
          setTimeout(function () {
            if (window._openOrderNo) {
              var orderNo = window._openOrderNo;
              window._openOrderNo = null;
              api('/api/v1/orders/' + orderNo).then(function (orderData) {
                Promise.all([
                  api('/api/v1/customers?limit=200').catch(function () { return []; }),
                  api('/api/v1/orders/statuses').catch(function () { return []; }),
                  api('/api/v1/dictionary/products').catch(function () { return []; }),
                  api('/api/v1/dictionary/payment-types').catch(function () { return []; }),
                  api('/api/v1/dictionary/user-logins').catch(function () { return []; })
                ]).then(function (results) {
                  openOrderForm(true, orderNo, orderData, results[0], results[1], results[2], results[3], results[4]);
                });
              }).catch(function () {});
            }
          }, 100);
        });
        function openOrderForm(isEdit, orderId, orderData, customers, statuses, products, paymentTypes, userList) {
          customers = asList(customers);
          statuses = asList(statuses);
          products = asList(products);
          paymentTypes = asList(paymentTypes);
          userList = asList(userList);
          var sel = orderData ? { cust: orderData.customer_id, status: orderData.status_code || 'open', payment: orderData.payment_type_code || '', agent: orderData.login_agent || '', exp: orderData.login_expeditor || '' } : { cust: '', status: 'open', payment: '', agent: '', exp: '' };
          var custOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ° â</option>';
          customers.forEach(function (c) { var s = (sel.cust != null && String(sel.cust) === String(c.id)) ? ' selected' : ''; custOpts += '<option value="' + (c.id != null ? c.id : '') + '"' + s + '>' + escAttr((c.name_client || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          if (!statuses || !statuses.length) statuses = [{ code: 'open', name: 'ÐÑÐºÑÑÑ' }, { code: 'cancelled', name: 'ÐÑÐ¼ÐµÐ½ÑÐ½' }];
          statuses = statuses.slice().sort(function (a, b) { return (a.name || a.code || '').localeCompare(b.name || b.code || ''); });
          var statusOpts = ''; statuses.forEach(function (s) { var o = (s.code === sel.status) ? ' selected' : ''; statusOpts += '<option value="' + escAttr(s.code) + '"' + o + '>' + escAttr(s.name || s.code) + '</option>'; });
          var payOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ â</option>'; paymentTypes.forEach(function (pt) { var o = (pt.code === sel.payment) ? ' selected' : ''; payOpts += '<option value="' + escAttr(pt.code) + '"' + o + '>' + escAttr(pt.name || pt.code) + '</option>'; });
          var productOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¾Ð²Ð°Ñ â</option>';
          products.forEach(function (p) { productOpts += '<option value="' + escAttr(p.code) + '" data-price="' + (p.price != null ? p.price : '') + '">' + escAttr((p.code || '') + ' â ' + (p.name || '')) + '</option>'; });
          var agentOpts = '<option value="">â ÐÐµ Ð½Ð°Ð·Ð½Ð°ÑÐµÐ½ â</option>';
          var expeditorOpts = '<option value="">â ÐÐµ Ð½Ð°Ð·Ð½Ð°ÑÐµÐ½ â</option>';
          userList.forEach(function (u) {
            var oAgent = (u.login === sel.agent) ? ' selected' : '';
            agentOpts += '<option value="' + escAttr(u.login) + '"' + oAgent + '>' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>';
            if ((u.role || '').toLowerCase() === 'expeditor') {
              var oExp = (u.login === sel.exp) ? ' selected' : '';
              expeditorOpts += '<option value="' + escAttr(u.login) + '"' + oExp + '>' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>';
            }
          });
          var content = document.getElementById('content');
          if (!content) return;
          content.innerHTML = '<div class="card"><h2 id="orderFormTitle">Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð·Ð°ÐºÐ°Ð·Ð°</h2><div id="orderCreateErr" class="err" style="margin-bottom:12px"></div><div id="orderFormMsg" class="msg" style="margin-bottom:12px;display:none"></div><div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ</label><select id="orderCreateCustomer">' + custOpts + '</select></div><div class="form-group"><label>ÐÐ³ÐµÐ½Ñ</label><select id="orderCreateAgent">' + agentOpts + '</select></div><div class="form-group"><label>Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ</label><select id="orderCreateExpeditor">' + expeditorOpts + '</select></div><div class="form-group"><label>Ð¡ÑÐ°ÑÑÑ</label><select id="orderCreateStatus">' + statusOpts + '</select></div><div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ</label><select id="orderCreatePaymentType">' + payOpts + '</select></div><div class="form-group"><label>ÐÐ°Ð·Ð½Ð°ÑÐµÐ½Ð½Ð°Ñ Ð´Ð°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸</label><input type="text" id="orderScheduledDelivery" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³ ÑÑ:Ð¼Ð¼" autocomplete="off"></div><div class="form-group"><label>ÐÐ¾Ð·Ð¸ÑÐ¸Ð¸ Ð·Ð°ÐºÐ°Ð·Ð°</label></div><div style="overflow-x:auto"><table><thead><tr><th>Ð¢Ð¾Ð²Ð°Ñ</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾</th><th>Ð¦ÐµÐ½Ð°</th><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody id="orderCreateItemsBody"></tbody></table></div><p style="margin:12px 0"><button type="button" class="btn btn-secondary" id="orderAddRow">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ñ</button></p><div class="form-group"><label>Ð¡ÑÐ¼Ð¼Ð°</label><div id="orderCreateSum" style="padding:6px 0;font-weight:600">0</div></div><p><button type="button" class="btn btn-primary" id="orderCreateSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð·Ð°ÐºÐ°Ð·</button> <button type="button" class="btn btn-secondary" id="orderCreateCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p><div style="margin-top:24px;padding:12px;background:#f8f9fa;border-radius:6px"><div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;color:#666">ÐÐ°ÑÐ° ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ Ð·Ð°ÐºÐ°Ð·Ð°</label><div id="orderOrderDate" class="form-readonly">â</div></div><div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;color:#666">ÐÐµÑÐµÐ²Ð¾Ð´ Ð² ÑÑÐ°ÑÑÑ Â«ÐÐ¾ÑÑÐ°Ð²ÐºÐ°Â»</label><div id="orderStatusDeliveryAt" class="form-readonly">â</div></div><div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;color:#666">ÐÐ°ÑÐ° Ð¸ Ð²ÑÐµÐ¼Ñ Ð·Ð°ÐºÑÑÑÐ¸Ñ Ð·Ð°ÐºÐ°Ð·Ð°</label><div id="orderClosedAt" class="form-readonly">â</div></div><div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;color:#666">ÐÐ°ÑÐ° Ð¿Ð¾ÑÐ»ÐµÐ´Ð½ÐµÐ³Ð¾ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ</label><div id="orderLastUpdatedAt" class="form-readonly">â</div></div><div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:#666">ÐÑÐ¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»</label><div id="orderLastUpdatedBy" class="form-readonly">â</div></div></div></div>';
          document.getElementById('orderFormTitle').textContent = isEdit ? ('Ð ÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð¸Ðµ Ð·Ð°ÐºÐ°Ð·Ð° â ' + orderId) : 'Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð·Ð°ÐºÐ°Ð·Ð°';
          function formatDateTashkent(isoStr) {
            if (!isoStr) return 'â';
            try {
              var d = parseBackendDate(isoStr);
              if (!d) return isoStr;
              return d.toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            } catch (e) { return isoStr; }
          }
          function isoToDatetimeLocal(isoStr) {
            if (!isoStr) return '';
            try {
              var d = parseBackendDate(isoStr);
              if (!d) return '';
              var y = d.getFullYear(); var m = String(d.getMonth() + 1).padStart(2, '0'); var day = String(d.getDate()).padStart(2, '0');
              var h = String(d.getHours()).padStart(2, '0'); var min = String(d.getMinutes()).padStart(2, '0');
              return y + '-' + m + '-' + day + 'T' + h + ':' + min;
            } catch (e) { return ''; }
          }
          if (isEdit && orderData) {
            document.getElementById('orderOrderDate').textContent = formatDateTashkent(orderData.order_date);
            document.getElementById('orderStatusDeliveryAt').textContent = formatDateTashkent(orderData.status_delivery_at);
            document.getElementById('orderClosedAt').textContent = formatDateTashkent(orderData.closed_at);
            document.getElementById('orderLastUpdatedAt').textContent = formatDateTashkent(orderData.last_updated_at);
            document.getElementById('orderLastUpdatedBy').textContent = orderData.last_updated_by || 'â';
          } else {
            document.getElementById('orderOrderDate').textContent = 'â';
          }
          var schedEl = document.getElementById('orderScheduledDelivery');
          if (window.flatpickr && schedEl) {
            var defaultDate = (isEdit && orderData && orderData.scheduled_delivery_at) ? orderData.scheduled_delivery_at : null;
            window.flatpickr(schedEl, {
              enableTime: true,
              time_24hr: true,
              locale: 'ru',
              dateFormat: 'Y-m-d H:i',
              defaultDate: defaultDate,
              allowInput: false,
              firstDayOfWeek: 1
            });
          }
          var tbody = document.getElementById('orderCreateItemsBody');
          function updateAgentExpeditor() {
            var cid = document.getElementById('orderCreateCustomer').value;
            var cust = customers.filter(function (c) { return String(c.id) === String(cid); })[0];
            var agSel = document.getElementById('orderCreateAgent'); var exSel = document.getElementById('orderCreateExpeditor');
            if (agSel) { agSel.value = cust && cust.login_agent ? cust.login_agent : ''; }
            if (exSel) { exSel.value = cust && cust.login_expeditor ? cust.login_expeditor : ''; }
          }
          function updateSum() {
            var rows = tbody.querySelectorAll('tr'); var sum = 0;
            for (var i = 0; i < rows.length; i++) {
              var qty = parseInt(rows[i].querySelector('.order-item-qty').value, 10) || 0;
              var priceVal = rows[i].querySelector('.order-item-price').value.trim();
              var price = priceVal !== '' ? parseFloat(priceVal) : 0;
              sum += qty * price;
            }
            var el = document.getElementById('orderCreateSum'); if (el) el.textContent = sum;
          }
          document.getElementById('orderCreateCustomer').onchange = updateAgentExpeditor;
          function addRow(existingItem) {
            var tr = document.createElement('tr');
            if (existingItem) tr.setAttribute('data-item-id', existingItem.id || '');
            var qty = (existingItem && existingItem.quantity != null) ? existingItem.quantity : 1;
            var priceStr = (existingItem && existingItem.price != null) ? existingItem.price : '';
            tr.innerHTML = '<td><select class="order-item-product" style="min-width:220px">' + productOpts + '</select></td><td><input type="number" min="1" class="order-item-qty" value="' + qty + '" style="width:80px"></td><td><input type="number" step="0.01" min="0" class="order-item-price" placeholder="Ð¿Ð¾ Ð¿ÑÐ°Ð¹ÑÑ" value="' + priceStr + '" style="width:100px"></td><td><button type="button" class="btn btn-secondary btn-small order-item-del">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button></td>';
            tbody.appendChild(tr);
            if (existingItem && existingItem.product_code) { var selProd = tr.querySelector('.order-item-product'); selProd.value = existingItem.product_code; }
            tr.querySelector('.order-item-product').onchange = function () {
              var opt = this.options[this.selectedIndex];
              var price = opt && opt.getAttribute('data-price');
              var priceInput = tr.querySelector('.order-item-price');
              if (priceInput && price) priceInput.value = price;
              updateSum();
            };
            tr.querySelector('.order-item-qty').oninput = tr.querySelector('.order-item-price').oninput = updateSum;
            tr.querySelector('.order-item-del').onclick = function () { tr.remove(); updateSum(); };
          }
          if (orderData && orderData.items && orderData.items.length) {
            orderData.items.forEach(function (it) { addRow(it); });
          } else {
            addRow(null);
          }
          updateSum();
          document.getElementById('orderAddRow').onclick = function () { addRow(null); };
          document.getElementById('orderCreateCancel').onclick = function () { loadSectionOrders(); };
          document.getElementById('orderCreateSave').onclick = function () {
            var errEl = document.getElementById('orderCreateErr');
            var msgEl = document.getElementById('orderFormMsg');
            var saveBtn = document.getElementById('orderCreateSave');
            if (errEl) errEl.textContent = '';
            if (msgEl) { msgEl.style.display = 'none'; msgEl.textContent = ''; }
            var customer_id = document.getElementById('orderCreateCustomer').value;
            var statusEl = document.getElementById('orderCreateStatus');
            var status_code = statusEl.value || 'open';
            var statusLabel = '';
            if (statusEl && statusEl.selectedIndex >= 0) statusLabel = String(statusEl.options[statusEl.selectedIndex].textContent || '').toLowerCase();
            var statusCodeLower = String(status_code || '').toLowerCase();
            var isDeliveryStatus = ['2', 'delivery', 'Ð´Ð¾ÑÑÐ°Ð²ÐºÐ°'].indexOf(statusCodeLower) >= 0 || /Ð´Ð¾ÑÑÐ°Ð²|deliver|shipping/.test((statusLabel + ' ' + statusCodeLower).toLowerCase());
            var payment_type_code = document.getElementById('orderCreatePaymentType').value || null;
            if (!customer_id) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°.'; return; }
            var rows = tbody.querySelectorAll('tr');
            var items = []; var total = 0;
            for (var i = 0; i < rows.length; i++) {
              var product = rows[i].querySelector('.order-item-product').value;
              var qty = parseInt(rows[i].querySelector('.order-item-qty').value, 10) || 0;
              var priceVal = rows[i].querySelector('.order-item-price').value.trim();
              var price = priceVal !== '' ? parseFloat(priceVal) : null;
              if (product && qty > 0) { items.push({ product_code: product, quantity: qty, price: price, itemId: rows[i].getAttribute('data-item-id') || null }); total += qty * (price || 0); }
            }
            if (!items.length) { if (errEl) errEl.textContent = 'ÐÐ¾Ð±Ð°Ð²ÑÑÐµ ÑÐ¾ÑÑ Ð±Ñ Ð¾Ð´Ð½Ñ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ñ Ñ ÑÐ¾Ð²Ð°ÑÐ¾Ð¼ Ð¸ ÐºÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾Ð¼.'; return; }
            function errText(e) {
              if (!e) return 'ÐÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°';
              var d = e.data;
              if (d && d.detail !== undefined) {
                if (typeof d.detail === 'string') return d.detail;
                if (Array.isArray(d.detail)) return d.detail.map(function (x) { return x.msg || x.message || JSON.stringify(x); }).join(' ');
                return JSON.stringify(d.detail);
              }
              if (d) return JSON.stringify(d);
              return (e.message || e.status || 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÐµÐ´Ð¸Ð½ÐµÐ½Ð¸Ñ Ð¸Ð»Ð¸ ÑÐµÑÐ²ÐµÑÐ°') + '';
            }
            var login_agent = document.getElementById('orderCreateAgent').value || null;
            var login_expeditor = document.getElementById('orderCreateExpeditor').value || null;
            var schedInput = document.getElementById('orderScheduledDelivery');
            var schedRaw = schedInput && schedInput.value ? schedInput.value.trim() : '';
            if (isDeliveryStatus && !schedRaw) {
              if (errEl) errEl.textContent = 'ÐÐ»Ñ ÑÑÐ°ÑÑÑÐ° Â«ÐÐ¾ÑÑÐ°Ð²ÐºÐ°Â» ÑÐºÐ°Ð¶Ð¸ÑÐµ Â«ÐÐ°Ð·Ð½Ð°ÑÐµÐ½Ð½Ð°Ñ Ð´Ð°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸Â».';
              return;
            }
            var scheduled_delivery_at = null;
            if (schedRaw) {
              try {
                var v = schedRaw.replace(' ', 'T');
                if (v && v.length >= 16) scheduled_delivery_at = new Date(v + (v.length === 16 ? ':00' : '')).toISOString();
              } catch (e) {}
            }
            if (isDeliveryStatus && !scheduled_delivery_at) {
              if (errEl) errEl.textContent = 'ÐÐµÐºÐ¾ÑÑÐµÐºÑÐ½Ð°Ñ Ð´Ð°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸. ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð´Ð°ÑÑ Ð¸Ð· ÐºÐ°Ð»ÐµÐ½Ð´Ð°ÑÑ.';
              return;
            }
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            function doneSuccess() {
              if (msgEl) { msgEl.textContent = 'ÐÐ°ÐºÐ°Ð· ÑÐ¾ÑÑÐ°Ð½ÑÐ½.'; msgEl.style.display = 'block'; }
              setTimeout(function () { loadSectionOrders(); }, 1500);
            }
            function doneError(e) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð·Ð°ÐºÐ°Ð·';
              if (errEl) errEl.textContent = errText(e);
            }
            if (isEdit) {
              api('/api/v1/orders/' + orderId, { method: 'PATCH', body: JSON.stringify({ customer_id: parseInt(customer_id, 10), status_code: status_code, payment_type_code: payment_type_code || null, total_amount: total, scheduled_delivery_at: scheduled_delivery_at }) }).then(function () {
                var keptIds = [];
                var chain = Promise.resolve();
                items.forEach(function (it) {
                  if (it.itemId) {
                    keptIds.push(it.itemId);
                    chain = chain.then(function () { return api('/api/v1/orders/' + orderId + '/items/' + it.itemId, { method: 'PATCH', body: JSON.stringify({ quantity: it.quantity, price: it.price }) }); });
                  } else {
                    chain = chain.then(function () { return api('/api/v1/orders/' + orderId + '/items', { method: 'POST', body: JSON.stringify({ product_code: it.product_code, quantity: it.quantity, price: it.price }) }); });
                  }
                });
                var toDelete = (orderData.items || []).filter(function (it) { return it.id && keptIds.indexOf(it.id) === -1; });
                toDelete.forEach(function (it) {
                  chain = chain.then(function () { return api('/api/v1/orders/' + orderId + '/items/' + it.id, { method: 'DELETE' }); });
                });
                chain.then(function () {
                  return api('/api/v1/customers/' + customer_id, { method: 'PATCH', body: JSON.stringify({ login_agent: login_agent, login_expeditor: login_expeditor }) });
                }).then(doneSuccess).catch(doneError);
              }).catch(doneError);
            } else {
              api('/api/v1/orders', { method: 'POST', body: JSON.stringify({ customer_id: parseInt(customer_id, 10), status_code: status_code, payment_type_code: payment_type_code, scheduled_delivery_at: scheduled_delivery_at }) }).then(function (res) {
                var newOrderId = res && res.id;
                if (!newOrderId) { doneError({ data: { detail: 'ÐÐ°ÐºÐ°Ð· Ð½Ðµ ÑÐ¾Ð·Ð´Ð°Ð½.' } }); return; }
                var chain = Promise.resolve();
                items.forEach(function (it) {
                  chain = chain.then(function () { return api('/api/v1/orders/' + newOrderId + '/items', { method: 'POST', body: JSON.stringify({ product_code: it.product_code, quantity: it.quantity, price: it.price }) }); });
                });
                chain.then(function () {
                  return api('/api/v1/orders/' + newOrderId, { method: 'PATCH', body: JSON.stringify({ total_amount: total }) });
                }).then(function () {
                  return api('/api/v1/customers/' + customer_id, { method: 'PATCH', body: JSON.stringify({ login_agent: login_agent, login_expeditor: login_expeditor }) });
                }).then(doneSuccess).catch(doneError);
              }).catch(doneError);
            }
          };
        }
        function bindOrderAdd() {
          var btn = document.getElementById('orderAdd');
          if (!btn) return;
          btn.onclick = function () {
            Promise.all([
              api('/api/v1/customers?limit=200').catch(function () { return []; }),
              api('/api/v1/orders/statuses').catch(function () { return []; }),
              api('/api/v1/dictionary/products').catch(function () { return []; }),
              api('/api/v1/dictionary/payment-types').catch(function () { return []; }),
              api('/api/v1/dictionary/user-logins').catch(function () { return []; })
            ]).then(function (results) {
              openOrderForm(false, null, null, results[0] || [], results[1] || [], results[2] || [], results[3] || [], results[4] || []);
            }).catch(function (e) {
              var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) || 'ÐÑÐ¸Ð±ÐºÐ°';
              var content = document.getElementById('content');
              if (content) content.innerHTML = '<div class="card"><h2>ÐÐ°ÐºÐ°Ð·Ñ</h2><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð´Ð°Ð½Ð½ÑÑ Ð´Ð»Ñ ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ Ð·Ð°ÐºÐ°Ð·Ð°: ' + msg + '</p><p><button type="button" class="btn btn-secondary" id="orderBackToList">ÐÐµÑÐ½ÑÑÑÑÑ Ðº ÑÐ¿Ð¸ÑÐºÑ</button> <button type="button" class="btn btn-primary" id="orderAdd">Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð·Ð°ÐºÐ°Ð·</button></p><div id="sectionTable"></div></div>';
              bindOrderAdd();
              var backBtn = document.getElementById('orderBackToList');
              if (backBtn) backBtn.onclick = function () { loadSectionOrders(); };
            });
          };
        }
      }
      function loadSectionOrderItems() {
        var content = document.getElementById('content');
        if (!content) return;
        content.innerHTML = '<div class="card"><h2>ÐÐ¾Ð·Ð¸ÑÐ¸Ð¸ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²</h2><p style="margin:0 0 12px 0">' + (isAdmin() ? '<button type="button" class="btn btn-secondary" id="orderItemsExport">Ð¡ÐºÐ°ÑÐ°ÑÑ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¸ Ð² Excel</button>' : '') + '</p><div class="form-group" style="margin:12px 0"><label>ÐÐ¾Ð¸ÑÐº Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¹ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²</label></div><div id="orderItemsSearchRow" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"></div><div id="sectionOrderItemsErr" class="err"></div><div id="orderItemsInfo" style="margin:12px 0;padding:8px;background:#f8f9fa;border-radius:4px;font-size:13px"></div><div id="orderItemsTable"></div><div id="orderItemsPagination" style="margin-top:16px;display:flex;justify-content:center;align-items:center;gap:8px"></div></div>';
        var tableDiv = document.getElementById('orderItemsTable');
        var errDiv = document.getElementById('sectionOrderItemsErr');
        var searchRow = document.getElementById('orderItemsSearchRow');
        var exportBtn = document.getElementById('orderItemsExport');
          function formatDateTashkent(isoStr) {
            if (!isoStr) return '';
            try {
              var d = parseBackendDate(isoStr);
              if (!d) return isoStr;
              return d.toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            } catch (e) { return isoStr; }
          }
        function formatScheduledDeliveryOi(isoStr, statusCode) {
          var text = formatDateTashkent(isoStr);
          if (!text) return '';
          var sc = (statusCode || '').toString().toLowerCase().replace(/\s/g, '');
          if (sc === 'completed' || sc === 'cancelled' || sc === 'canceled' || sc === 'Ð¾ÑÐ¼ÐµÐ½ÐµÐ½' || sc === 'Ð·Ð°Ð²ÐµÑÑÐµÐ½' || sc === 'closed' || sc === '4' || (sc.length && sc.charAt(0) === '4') || sc.indexOf('Ð¾ÑÐ¼ÐµÐ½ÐµÐ½') !== -1) return text;
          try {
            var d = parseBackendDate(isoStr);
            if (!d) return text;
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            d.setHours(0, 0, 0, 0);
            if (d < today) return '<span style="color:#c00;font-weight:bold" title="ÐÑÐ¾ÑÑÐ¾ÑÐµÐ½Ð°">' + text + '</span>';
          } catch (e) {}
          return text;
        }
        function getFilters() {
          var customer_id = document.getElementById('orderItemsSearchCustomerId') ? document.getElementById('orderItemsSearchCustomerId').value : '';
          var status_code = document.getElementById('orderItemsSearchStatus') ? document.getElementById('orderItemsSearchStatus').value : '';
          var date_from = document.getElementById('orderItemsSearchDateFrom') ? document.getElementById('orderItemsSearchDateFrom').value : '';
          var date_to = document.getElementById('orderItemsSearchDateTo') ? document.getElementById('orderItemsSearchDateTo').value : '';
          var login_agent = document.getElementById('orderItemsSearchAgent') ? document.getElementById('orderItemsSearchAgent').value : '';
          var login_expeditor = document.getElementById('orderItemsSearchExpeditor') ? document.getElementById('orderItemsSearchExpeditor').value : '';
          var last_updated_by = document.getElementById('orderItemsSearchLastUpdatedBy') ? document.getElementById('orderItemsSearchLastUpdatedBy').value : '';
          return { customer_id: customer_id, status_code: status_code, date_from: date_from, date_to: date_to, login_agent: login_agent, login_expeditor: login_expeditor, last_updated_by: last_updated_by };
        }
        function buildQuery(f) {
          var params = [];
          if (f.customer_id) params.push('customer_id=' + encodeURIComponent(f.customer_id));
          if (f.status_code) params.push('status_code=' + encodeURIComponent(f.status_code));
          if (f.date_from) params.push('scheduled_delivery_from=' + encodeURIComponent(f.date_from + 'T00:00:00'));
          if (f.date_to) params.push('scheduled_delivery_to=' + encodeURIComponent(f.date_to + 'T23:59:59'));
          if (f.login_agent) params.push('login_agent=' + encodeURIComponent(f.login_agent));
          if (f.login_expeditor) params.push('login_expeditor=' + encodeURIComponent(f.login_expeditor));
          if (f.last_updated_by) params.push('last_updated_by=' + encodeURIComponent(f.last_updated_by));
          return params.length ? '?' + params.join('&') : '';
        }
        var currentPage = 1;
        var pageSize = 100;
        var totalCount = 0;
        var totalAmount = 0;
        var oiSortCol = 'order_no';
        var oiSortDir = 1;
        var lastOiData = null;
        function renderTable(data) {
          if (errDiv) errDiv.textContent = '';
          lastOiData = data;
          var list = Array.isArray(data) ? data : (data && data.items ? data.items : []);
          var infoDiv = document.getElementById('orderItemsInfo');
          var paginationDiv = document.getElementById('orderItemsPagination');
          
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            totalCount = data.total_count || 0;
            totalAmount = data.total_amount || 0;
            currentPage = Math.floor((data.offset || 0) / pageSize) + 1;
          } else {
            totalCount = list.length;
            totalAmount = 0;
            list.forEach(function(r) {
              var amt = (r.amount != null ? r.amount : ((r.quantity || 0) * (r.price != null ? r.price : 0)));
              totalAmount += amt;
            });
          }
          
          if (infoDiv) {
            var start = totalCount > 0 ? ((currentPage - 1) * pageSize + 1) : 0;
            var end = totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : 0;
            infoDiv.innerHTML = '<strong>ÐÐ°Ð¹Ð´ÐµÐ½Ð¾ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¹:</strong> ' + totalCount + ' | <strong>ÐÐ¾ÐºÐ°Ð·Ð°Ð½Ð¾:</strong> ' + (totalCount > 0 ? start + '-' + end : '0') + ' | <strong>ÐÐ±ÑÐ°Ñ ÑÑÐ¼Ð¼Ð°:</strong> ' + totalAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' ÑÑÐ¼';
          }
          
          if (!list || !list.length) { 
            tableDiv.innerHTML = '<p>ÐÐ¾Ð·Ð¸ÑÐ¸Ð¸ Ð·Ð°ÐºÐ°Ð·Ð¾Ð² Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ñ. ÐÐ·Ð¼ÐµÐ½Ð¸ÑÐµ ÐºÑÐ¸ÑÐµÑÐ¸Ð¸ Ð¿Ð¾Ð¸ÑÐºÐ°.</p>'; 
            if (paginationDiv) paginationDiv.innerHTML = '';
            if (infoDiv && totalCount === 0) {
              infoDiv.innerHTML = '<strong>ÐÐ°Ð¹Ð´ÐµÐ½Ð¾ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¹:</strong> 0 | <strong>ÐÐ¾ÐºÐ°Ð·Ð°Ð½Ð¾:</strong> 0 | <strong>ÐÐ±ÑÐ°Ñ ÑÑÐ¼Ð¼Ð°:</strong> 0,00 ÑÑÐ¼';
            }
            return; 
          }
          
          var sorted = list.slice().sort(function (a, b) {
            return tableSortCompare(a, b, oiSortCol, oiSortDir, function (r, c) {
              if (c === 'quantity' || c === 'price' || c === 'amount') { var v = r[c] != null ? r[c] : (c === 'amount' ? ((r.quantity || 0) * (r.price != null ? r.price : 0)) : ''); return (v !== '' && v != null ? String(Number(v)).padStart(20, '0') : ''); }
              return (r[c] || '').toString().toLowerCase();
            });
          });
          var arrow = oiSortDir > 0 ? ' â²' : ' â¼';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (oiSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr><th>ÐÐ°ÐºÐ°Ð·</th>' + th('order_no', 'â Ð·Ð°ÐºÐ°Ð·Ð°') + th('customer_name', 'ÐÐ»Ð¸ÐµÐ½Ñ') + th('order_date', 'ÐÐ°ÑÐ° Ð·Ð°ÐºÐ°Ð·Ð°') + th('status_code', 'Ð¡ÑÐ°ÑÑÑ') + th('payment_type_name', 'Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ') + th('product_code', 'ÐÐ¾Ð´ ÑÐ¾Ð²Ð°ÑÐ°') + th('product_name', 'Ð¢Ð¾Ð²Ð°Ñ') + th('quantity', 'ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾') + th('price', 'Ð¦ÐµÐ½Ð°') + th('amount', 'Ð¡ÑÐ¼Ð¼Ð°') + th('login_agent', 'ÐÐ³ÐµÐ½Ñ') + th('login_expeditor', 'Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ') + th('scheduled_delivery_at', 'ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸') + '<th>ÐÐµÑÐµÐ²Ð¾Ð´ Ð² ÑÑÐ°ÑÑÑ Â«ÐÐ¾ÑÑÐ°Ð²ÐºÐ°Â»</th><th>ÐÐ°ÑÐ° Ð·Ð°ÐºÑÑÑÐ¸Ñ</th>' + th('order_last_updated_at', 'ÐÐ¾ÑÐ»ÐµÐ´Ð½ÐµÐµ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ðµ Ð·Ð°ÐºÐ°Ð·Ð°') + th('order_last_updated_by', 'ÐÑÐ¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»') + '</tr></thead><tbody>';
          sorted.forEach(function (r) {
            var amt = (r.amount != null ? r.amount : ((r.quantity || 0) * (r.price != null ? r.price : 0)));
            var orderNo = (r.order_no != null ? r.order_no : '');
            t += '<tr><td><button type="button" class="btn btn-secondary btn-small" data-order-open data-order-no="' + escAttr(orderNo) + '" title="ÐÑÐºÑÑÑÑ Ð·Ð°ÐºÐ°Ð·">ð</button></td><td>' + orderNo + '</td><td>' + escAttr(r.customer_name || (r.customer_id != null ? 'ID ' + r.customer_id : '')) + '</td><td>' + formatDateTashkent(r.order_date) + '</td><td>' + formatStatusBadge(r.status_code, r.status_name) + '</td><td>' + escAttr(r.payment_type_name || r.payment_type_code || '') + '</td><td>' + escAttr(r.product_code || '') + '</td><td>' + escAttr(r.product_name || '') + '</td><td>' + (r.quantity != null ? r.quantity : '') + '</td><td>' + (r.price != null ? r.price : '') + '</td><td>' + (amt != null ? amt : '') + '</td><td>' + escAttr(r.login_agent || '') + '</td><td>' + escAttr(r.login_expeditor || '') + '</td><td>' + formatScheduledDeliveryOi(r.scheduled_delivery_at, r.status_code) + '</td><td>' + formatDateTashkent(r.status_delivery_at) + '</td><td>' + formatDateTashkent(r.closed_at) + '</td><td>' + formatDateTashkent(r.order_last_updated_at) + '</td><td>' + escAttr(r.order_last_updated_by || '') + '</td></tr>';
          });
          t += '</tbody></table></div>';
          tableDiv.innerHTML = t;
          tableDiv.querySelectorAll('th.sortable').forEach(function (thEl) {
            thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (oiSortCol === col) oiSortDir = -oiSortDir; else { oiSortCol = col; oiSortDir = 1; } renderTable(lastOiData); };
          });
          tableDiv.querySelectorAll('[data-order-open]').forEach(function (btn) {
            btn.onclick = function () {
              var orderNo = btn.getAttribute('data-order-no');
              if (orderNo) { window._openOrderNo = orderNo; showSection('orders'); }
            };
          });
          // ÐÐ°Ð³Ð¸Ð½Ð°ÑÐ¸Ñ
          if (paginationDiv && totalCount > pageSize) {
            var totalPages = Math.ceil(totalCount / pageSize);
            var pagHtml = '';
            if (currentPage > 1) {
              pagHtml += '<button type="button" class="btn btn-secondary btn-small" id="orderItemsPagePrev">â¹ ÐÑÐµÐ´ÑÐ´ÑÑÐ°Ñ</button>';
            }
            pagHtml += '<span style="padding:0 12px">Ð¡ÑÑÐ°Ð½Ð¸ÑÐ° ' + currentPage + ' Ð¸Ð· ' + totalPages + '</span>';
            if (currentPage < totalPages) {
              pagHtml += '<button type="button" class="btn btn-secondary btn-small" id="orderItemsPageNext">Ð¡Ð»ÐµÐ´ÑÑÑÐ°Ñ âº</button>';
            }
            paginationDiv.innerHTML = pagHtml;
            var prevBtn = document.getElementById('orderItemsPagePrev');
            var nextBtn = document.getElementById('orderItemsPageNext');
            if (prevBtn) prevBtn.onclick = function() { currentPage--; runSearch(false); };
            if (nextBtn) nextBtn.onclick = function() { currentPage++; runSearch(false); };
          } else if (paginationDiv) {
            paginationDiv.innerHTML = '';
          }
        }
        var searchButtonClicked = false;
        function runSearch(resetPage) {
          if (resetPage !== false) {
            currentPage = 1;
          }
          var f = getFilters();
          var qs = buildQuery(f);
          var offset = (currentPage - 1) * pageSize;
          if (qs) {
            qs += '&limit=' + pageSize + '&offset=' + offset;
          } else {
            qs = '?limit=' + pageSize + '&offset=' + offset;
          }
          api('/api/v1/orders/items' + qs).then(function(data) {
            renderTable(data);
          }).catch(function (e) {
            if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¹ Ð·Ð°ÐºÐ°Ð·Ð¾Ð².';
            tableDiv.innerHTML = '<p>Ð¡Ð¿Ð¸ÑÐ¾Ðº Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¹ Ð½Ðµ Ð·Ð°Ð³ÑÑÐ¶ÐµÐ½.</p>';
            var infoDiv = document.getElementById('orderItemsInfo');
            var paginationDiv = document.getElementById('orderItemsPagination');
            if (infoDiv) infoDiv.innerHTML = '';
            if (paginationDiv) paginationDiv.innerHTML = '';
          });
        }
        if (exportBtn) {
          exportBtn.onclick = function () {
            var f = getFilters();
            var qs = buildQuery(f);
            var url = window.location.origin + '/api/v1/orders/items/export' + qs;
            fetch(url, { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'order_items.xlsx'; a.click(); URL.revokeObjectURL(a.href);
            }).catch(function (e) { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸: ' + (e && e.data && e.data.detail ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : e.message || 'ÐÑÐ¸Ð±ÐºÐ°')); });
          };
        }
        Promise.all([
          api('/api/v1/orders/statuses').catch(function () { return []; }),
          api('/api/v1/dictionary/user-logins').catch(function () { return []; }),
          api('/api/v1/customers?limit=200').catch(function () { return []; })
        ]).then(function (results) {
          var statuses = results[0] || [];
          var userList = results[1] || [];
          var customers = results[2] || [];
          if (!statuses.length) statuses = [{ code: 'open', name: 'ÐÑÐºÑÑÑ' }, { code: 'cancelled', name: 'ÐÑÐ¼ÐµÐ½ÑÐ½' }];
          statuses = statuses.slice().sort(function (a, b) { return (a.name || a.code || '').localeCompare(b.name || b.code || ''); });
          var statusOpts = '<option value="">â ÐÑÐµ â</option>'; statuses.forEach(function (s) { statusOpts += '<option value="' + escAttr(s.code) + '">' + escAttr(s.name || s.code) + '</option>'; });
          var userOpts = '<option value="">â ÐÑÐµ â</option>';
          var expeditorUserOpts = '<option value="">â ÐÑÐµ â</option>';
          userList.forEach(function (u) {
            var optHtml = '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>';
            userOpts += optHtml;
            if ((u.role || '').toLowerCase() === 'expeditor') expeditorUserOpts += optHtml;
          });
          var custOpts = '<option value="">â ÐÑÐ±Ð¾Ð¹ â</option>'; customers.forEach(function (c) { custOpts += '<option value="' + (c.id != null ? c.id : '') + '">' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          searchRow.innerHTML = '<div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ»Ð¸ÐµÐ½Ñ</label><select id="orderItemsSearchCustomerId" style="max-width:220px">' + custOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¡ÑÐ°ÑÑÑ</label><select id="orderItemsSearchStatus" style="max-width:140px">' + statusOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ñ</label><input type="text" id="orderItemsSearchDateFrom" style="max-width:130px" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¿Ð¾</label><input type="text" id="orderItemsSearchDateTo" style="max-width:130px" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ³ÐµÐ½Ñ</label><select id="orderItemsSearchAgent" style="max-width:160px">' + userOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ</label><select id="orderItemsSearchExpeditor" style="max-width:160px">' + expeditorUserOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÑÐ¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»</label><select id="orderItemsSearchLastUpdatedBy" style="max-width:160px">' + userOpts + '</select></div><button type="button" class="btn btn-primary" id="orderItemsSearchBtn">ÐÐ°Ð¹ÑÐ¸</button>';
          document.getElementById('orderItemsSearchBtn').onclick = runSearch;
          if (window.flatpickr) {
            var df = document.getElementById('orderItemsSearchDateFrom');
            var dt = document.getElementById('orderItemsSearchDateTo');
            if (df) window.flatpickr(df, { locale: 'ru', dateFormat: 'Y-m-d', allowInput: true });
            if (dt) window.flatpickr(dt, { locale: 'ru', dateFormat: 'Y-m-d', allowInput: true });
          }
          currentPage = 1;
          totalCount = 0;
          totalAmount = 0;
          tableDiv.innerHTML = '<p style="color:#666">Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÑÐ¸ÑÐµÑÐ¸Ð¸ Ð¿Ð¾Ð¸ÑÐºÐ° Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ°Ð¹ÑÐ¸Â».</p>';
          var infoDiv = document.getElementById('orderItemsInfo');
          var paginationDiv = document.getElementById('orderItemsPagination');
          if (infoDiv) infoDiv.innerHTML = '';
          if (paginationDiv) paginationDiv.innerHTML = '';
        }).catch(function () {
          searchRow.innerHTML = '<button type="button" class="btn btn-primary" id="orderItemsSearchBtn">ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¸</button>';
          document.getElementById('orderItemsSearchBtn').onclick = runSearch;
        });
      }

      function loadSectionOperations(showCreate, openCreateForm) {
        var content = document.getElementById('content');
        if (!content) return;
        var canCreate = (typeof showCreate === 'boolean') ? showCreate : true;
        var addBtn = (isAdmin() && canCreate) ? '<button type="button" class="btn btn-primary" id="opAdd">Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ</button>' : '';
        var exportBtn = isAdmin() ? ' <button type="button" class="btn btn-secondary" id="opExport">Ð¡ÐºÐ°ÑÐ°ÑÑ Ð² Excel</button>' : '';
        content.innerHTML = '<div class="card"><h2>ÐÐ¿ÐµÑÐ°ÑÐ¸Ð¸</h2><p style="margin:0 0 12px 0">' + addBtn + exportBtn + '</p><div class="form-group" style="margin:12px 0"><label>ÐÐ¾Ð¸ÑÐº Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹</label></div><div id="opSearchRow" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"></div><div id="opSectionErr" class="err"></div><div id="opSectionTable"></div></div>';
        var tableDiv = document.getElementById('opSectionTable');
        var errDiv = document.getElementById('opSectionErr');
        var searchRow = document.getElementById('opSearchRow');
        bindOperationAdd();
        var opExportBtn = document.getElementById('opExport');
        if (opExportBtn) opExportBtn.onclick = function () {
          var url = window.location.origin + '/api/v1/operations/export';
          fetch(url, { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
            if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
            return r.blob();
          }).then(function (blob) {
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'operations.xlsx'; a.click(); URL.revokeObjectURL(a.href);
          }).catch(function (e) { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸: ' + (e && e.data && e.data.detail ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : e.message || 'ÐÑÐ¸Ð±ÐºÐ°')); });
        };
        function formatDateOp(isoStr) {
          if (!isoStr) return '';
          try { var d = new Date(isoStr); return d.toLocaleDateString('ru-RU'); } catch (e) { return isoStr; }
        }
        function operationStatusRu(code) {
          var m = { pending: 'Ð Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ð¸', completed: 'ÐÑÐ¿Ð¾Ð»Ð½ÐµÐ½Ð¾', cancelled: 'ÐÑÐ¼ÐµÐ½ÐµÐ½Ð¾', canceled: 'ÐÑÐ¼ÐµÐ½ÐµÐ½Ð¾' };
          return m[(code || '').toString().toLowerCase()] || (code || '');
        }
        var opSortCol = 'operation_number';
        var opSortDir = 1;
        var lastOpList = null;
        function renderOpTable(list) {
          if (errDiv) errDiv.textContent = '';
          list = asList(list);
          lastOpList = list;
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐ¿ÐµÑÐ°ÑÐ¸Ð¹ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾. ÐÐ·Ð¼ÐµÐ½Ð¸ÑÐµ ÐºÑÐ¸ÑÐµÑÐ¸Ð¸ Ð¿Ð¾Ð¸ÑÐºÐ° Ð¸Ð»Ð¸ ÑÐ¾Ð·Ð´Ð°Ð¹ÑÐµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ.</p>'; return; }
          var sorted = list.slice().sort(function (a, b) {
            return tableSortCompare(a, b, opSortCol, opSortDir, function (r, c) {
              if (c === 'quantity' || c === 'amount') return (r[c] != null && r[c] !== '' ? String(Number(r[c])).padStart(20, '0') : '');
              return (r[c] || (r.type_name || r.type_code) || (r.customer_name || (r.customer_id != null ? 'ID ' + r.customer_id : '')) || '').toString().toLowerCase();
            });
          });
          var arrow = opSortDir > 0 ? ' â²' : ' â¼';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (opSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th>' + th('operation_number', 'â Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸') + th('operation_date', 'ÐÐ°ÑÐ°') + th('type_code', 'Ð¢Ð¸Ð¿') + th('status', 'Ð¡ÑÐ°ÑÑÑ') + th('customer_name', 'ÐÐ»Ð¸ÐµÐ½Ñ') + th('product_code', 'Ð¢Ð¾Ð²Ð°Ñ') + th('quantity', 'ÐÐ¾Ð»-Ð²Ð¾') + th('amount', 'Ð¡ÑÐ¼Ð¼Ð°') + th('order_id', 'ÐÐ°ÐºÐ°Ð· â') + th('created_by', 'ÐÑÐ¾ ÑÐ¾Ð·Ð´Ð°Ð»') + '</tr></thead><tbody>';
          sorted.forEach(function (o) {
            t += '<tr><td><button type="button" class="btn btn-secondary btn-small" data-op-edit data-id="' + escAttr(o.id) + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button></td><td>' + escAttr(o.operation_number || '') + '</td><td>' + formatDateOp(o.operation_date) + '</td><td>' + escAttr(o.type_name || o.type_code || '') + '</td><td>' + formatStatusBadge(o.status, (o.status_name_ru != null && o.status_name_ru !== '') ? o.status_name_ru : operationStatusRu(o.status)) + '</td><td>' + escAttr(o.customer_name || (o.customer_id != null ? 'ID ' + o.customer_id : '')) + '</td><td>' + escAttr(o.product_code || '') + '</td><td>' + (o.quantity != null ? o.quantity : '') + '</td><td>' + (o.amount != null ? o.amount : '') + '</td><td>' + (o.order_id != null ? o.order_id : '') + '</td><td>' + escAttr(o.created_by || '') + '</td></tr>';
          });
          t += '</tbody></table></div>';
          tableDiv.innerHTML = t;
          tableDiv.querySelectorAll('th.sortable').forEach(function (thEl) {
            thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (opSortCol === col) opSortDir = -opSortDir; else { opSortCol = col; opSortDir = 1; } renderOpTable(lastOpList); };
          });
          tableDiv.querySelectorAll('[data-op-edit]').forEach(function (el) {
            el.onclick = function () {
              var opId = el.getAttribute('data-id') || '';
              api('/api/v1/operations/' + opId).then(function (opData) {
                Promise.all([
                  api('/api/v1/operation-types').catch(function () { return []; }),
                  api('/api/v1/customers?limit=200').catch(function () { return []; }),
                  api('/api/v1/dictionary/products').catch(function () { return []; }),
                  api('/api/v1/dictionary/warehouses').catch(function () { return []; }),
                  api('/api/v1/dictionary/payment-types').catch(function () { return []; }),
                  api('/api/v1/dictionary/user-logins').catch(function () { return []; })
                ]).then(function (results) {
                  var types = results[0] || [];
                  // ÐÑÐ¸ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð¸Ð¸ Ð¿Ð¾ÐºÐ°Ð·ÑÐ²Ð°ÐµÐ¼ Ð²ÑÐµ ÑÐ¸Ð¿Ñ (Ð²ÐºÐ»ÑÑÐ°Ñ Ð½ÐµÐ°ÐºÑÐ¸Ð²Ð½ÑÐµ), ÑÑÐ¾Ð±Ñ Ð¼Ð¾Ð¶Ð½Ð¾ Ð±ÑÐ»Ð¾ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°ÑÑ ÑÑÑÐµÑÑÐ²ÑÑÑÐ¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸
                  // ÐÐ¾ ÐµÑÐ»Ð¸ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ Ð¸ÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÑ Ð½ÐµÐ°ÐºÑÐ¸Ð²Ð½ÑÐ¹ ÑÐ¸Ð¿, Ð¾Ð½ Ð²ÑÑ ÑÐ°Ð²Ð½Ð¾ Ð±ÑÐ´ÐµÑ Ð´Ð¾ÑÑÑÐ¿ÐµÐ½
                  openOperationForm(true, opId, opData, types, results[1] || [], results[2] || [], results[3] || [], results[4] || [], results[5] || []);
                });
              }).catch(function (e) {
                if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð³ÑÑÐ·Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ.';
              });
            };
          });
        }
        var OP_SEARCH_STORAGE = 'opSearchFilters';
        function getOpSearchFilters() {
          return {
            type_code: document.getElementById('opSearchType') ? document.getElementById('opSearchType').value : '',
            status: document.getElementById('opSearchStatus') ? document.getElementById('opSearchStatus').value : '',
            customer_id: document.getElementById('opSearchCustomerId') ? document.getElementById('opSearchCustomerId').value : '',
            product_code: document.getElementById('opSearchProduct') ? document.getElementById('opSearchProduct').value : '',
            from_date: document.getElementById('opSearchDateFrom') ? document.getElementById('opSearchDateFrom').value : '',
            to_date: document.getElementById('opSearchDateTo') ? document.getElementById('opSearchDateTo').value : '',
            created_by: document.getElementById('opSearchCreatedBy') ? document.getElementById('opSearchCreatedBy').value : ''
          };
        }
        function setOpSearchFilters(f) {
          if (!f) return;
          var el;
          if (el = document.getElementById('opSearchType')) el.value = f.type_code || '';
          if (el = document.getElementById('opSearchStatus')) el.value = f.status || '';
          if (el = document.getElementById('opSearchCustomerId')) el.value = f.customer_id || '';
          if (el = document.getElementById('opSearchProduct')) el.value = f.product_code || '';
          if (el = document.getElementById('opSearchDateFrom')) el.value = f.from_date || '';
          if (el = document.getElementById('opSearchDateTo')) el.value = f.to_date || '';
          if (el = document.getElementById('opSearchCreatedBy')) el.value = f.created_by || '';
        }
        function runOpSearch() {
          var f = getOpSearchFilters();
          try { localStorage.setItem(OP_SEARCH_STORAGE, JSON.stringify(f)); } catch (e) {}
          var params = [];
          if (f.type_code) params.push('type_code=' + encodeURIComponent(f.type_code));
          if (f.status) params.push('status=' + encodeURIComponent(f.status));
          if (f.customer_id) params.push('customer_id=' + encodeURIComponent(f.customer_id));
          if (f.product_code) params.push('product_code=' + encodeURIComponent(f.product_code));
          if (f.from_date) params.push('from_date=' + encodeURIComponent(f.from_date));
          if (f.to_date) params.push('to_date=' + encodeURIComponent(f.to_date));
          if (f.created_by) params.push('created_by=' + encodeURIComponent(f.created_by));
          api('/api/v1/operations' + (params.length ? '?' + params.join('&') : '')).then(function (res) { renderOpTable(asList(res)); }).catch(function (e) {
            if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹.';
            tableDiv.innerHTML = '<p>Ð¡Ð¿Ð¸ÑÐ¾Ðº Ð½Ðµ Ð·Ð°Ð³ÑÑÐ¶ÐµÐ½.</p>';
          });
        }
        Promise.all([
          api('/api/v1/operation-types').catch(function () { return []; }),
          api('/api/v1/customers?limit=200').catch(function () { return []; }),
          api('/api/v1/dictionary/products').catch(function () { return []; }),
          api('/api/v1/dictionary/user-logins').catch(function () { return []; })
        ]).then(function (results) {
          var types = asList(results[0]);
          var customers = asList(results[1]);
          var products = asList(results[2]);
          var userList = asList(results[3]);
          // Ð¤Ð¸Ð»ÑÑÑÑÐµÐ¼ ÑÐ¾Ð»ÑÐºÐ¾ Ð°ÐºÑÐ¸Ð²Ð½ÑÐµ ÑÐ¸Ð¿Ñ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹ Ð´Ð»Ñ ÑÐ¸Ð»ÑÑÑÐ¾Ð²
          var activeTypes = types.filter(function(ty) { return ty.active !== false; });
          var typeOpts = '<option value="">â ÐÑÐµ â</option>'; activeTypes.forEach(function (ty) { typeOpts += '<option value="' + escAttr(ty.code) + '">' + escAttr(ty.name || ty.code) + '</option>'; });
          var statusOpts = '<option value="">â ÐÑÐµ â</option><option value="pending">Ð Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ð¸</option><option value="completed">ÐÑÐ¿Ð¾Ð»Ð½ÐµÐ½Ð¾</option><option value="cancelled">ÐÑÐ¼ÐµÐ½ÐµÐ½Ð¾</option>';
          var custOpts = '<option value="">â ÐÑÐ±Ð¾Ð¹ â</option>'; customers.forEach(function (c) { custOpts += '<option value="' + (c.id != null ? c.id : '') + '">' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          var prodOpts = '<option value="">â ÐÑÐ±Ð¾Ð¹ â</option>'; products.forEach(function (p) { prodOpts += '<option value="' + escAttr(p.code) + '">' + escAttr((p.code || '') + ' â ' + (p.name || '')) + '</option>'; });
          var userOpts = '<option value="">â ÐÑÐµ â</option>'; userList.forEach(function (u) { userOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>'; });
          searchRow.innerHTML = '<div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¢Ð¸Ð¿</label><select id="opSearchType" style="max-width:160px">' + typeOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¡ÑÐ°ÑÑÑ</label><select id="opSearchStatus" style="max-width:100px">' + statusOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ»Ð¸ÐµÐ½Ñ</label><select id="opSearchCustomerId" style="max-width:220px">' + custOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¢Ð¾Ð²Ð°Ñ</label><select id="opSearchProduct" style="max-width:200px">' + prodOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ°ÑÐ° Ñ</label><input type="text" id="opSearchDateFrom" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:130px"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¿Ð¾</label><input type="text" id="opSearchDateTo" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:130px"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÑÐ¾ ÑÐ¾Ð·Ð´Ð°Ð»</label><select id="opSearchCreatedBy" style="max-width:160px">' + userOpts + '</select></div><button type="button" class="btn btn-primary" id="opSearchBtn">ÐÐ°Ð¹ÑÐ¸</button>';
          if (window.flatpickr) {
            var opDf = document.getElementById('opSearchDateFrom');
            var opDt = document.getElementById('opSearchDateTo');
            if (opDf) window.flatpickr(opDf, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
            if (opDt) window.flatpickr(opDt, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
          }
          document.getElementById('opSearchBtn').onclick = runOpSearch;
          var savedFilters = null;
          try { var s = localStorage.getItem(OP_SEARCH_STORAGE); if (s) savedFilters = JSON.parse(s); } catch (e) {}
          if (savedFilters) {
            setOpSearchFilters(savedFilters);
          }
          tableDiv.innerHTML = '<p style="color:#666">Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÑÐ¸ÑÐµÑÐ¸Ð¸ Ð¿Ð¾Ð¸ÑÐºÐ° Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ°Ð¹ÑÐ¸Â» Ð¸Ð»Ð¸ Ð¾ÑÑÐ°Ð²ÑÑÐµ Ð¿Ð¾Ð»Ñ Ð¿ÑÑÑÑÐ¼Ð¸ Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ°Ð¹ÑÐ¸Â» Ð´Ð»Ñ Ð¿Ð¾Ð»Ð½Ð¾Ð³Ð¾ ÑÐ¿Ð¸ÑÐºÐ°. ÐÐ¾ ÑÐ¼Ð¾Ð»ÑÐ°Ð½Ð¸Ñ Ð·Ð°Ð¿ÑÐ¾Ñ Ð½Ðµ Ð²ÑÐ¿Ð¾Ð»Ð½ÑÐµÑÑÑ Ð°Ð²ÑÐ¾Ð¼Ð°ÑÐ¸ÑÐµÑÐºÐ¸.</p>';
          if (openCreateForm && window.openOperationCreate) {
            window.openOperationCreate();
          }
        }).catch(function () {
          searchRow.innerHTML = '<button type="button" class="btn btn-primary" id="opSearchBtn">ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</button>';
          document.getElementById('opSearchBtn').onclick = runOpSearch;
        });
        function openOperationForm(isEdit, operationId, opData, types, customers, products, warehouses, paymentTypes, userList) {
          warehouses = warehouses || []; paymentTypes = paymentTypes || []; userList = userList || [];
          var sel = isEdit && opData ? { type_code: opData.type_code || '', customer_id: opData.customer_id != null ? String(opData.customer_id) : '', product_code: opData.product_code || '', quantity: opData.quantity != null ? opData.quantity : '', amount: opData.amount != null ? opData.amount : '', comment: opData.comment || '', order_id: opData.order_id != null ? opData.order_id : '', operation_date: opData.operation_date ? opData.operation_date.slice(0, 10) : '', warehouse_from: opData.warehouse_from || '', warehouse_to: opData.warehouse_to || '', payment_type_code: opData.payment_type_code || '', status: opData.status || 'pending', expeditor_login: opData.expeditor_login || '', cashier_login: opData.cashier_login || '', storekeeper_login: opData.storekeeper_login || '' } : { type_code: '', customer_id: '', product_code: '', quantity: '1', amount: '', comment: '', order_id: '', operation_date: new Date().toISOString().slice(0, 10), warehouse_from: '', warehouse_to: '', payment_type_code: '', status: 'pending', expeditor_login: '', cashier_login: '', storekeeper_login: '' };
          // Ð¤Ð¸Ð»ÑÑÑÑÐµÐ¼ ÑÐ¾Ð»ÑÐºÐ¾ Ð°ÐºÑÐ¸Ð²Ð½ÑÐµ ÑÐ¸Ð¿Ñ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹, Ð½Ð¾ Ð¿ÑÐ¸ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð¸Ð¸ Ð´Ð¾Ð±Ð°Ð²Ð»ÑÐµÐ¼ ÑÐµÐºÑÑÐ¸Ð¹ ÑÐ¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸ (Ð´Ð°Ð¶Ðµ ÐµÑÐ»Ð¸ Ð½ÐµÐ°ÐºÑÐ¸Ð²ÐµÐ½)
          var activeTypes = types.filter(function(ty) { return ty.active !== false; });
          if (isEdit && opData && opData.type_code) {
            var currentType = types.find(function(ty) { return ty.code === opData.type_code; });
            if (currentType && currentType.active === false) {
              // ÐÐ¾Ð±Ð°Ð²Ð»ÑÐµÐ¼ ÑÐµÐºÑÑÐ¸Ð¹ ÑÐ¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸, Ð´Ð°Ð¶Ðµ ÐµÑÐ»Ð¸ Ð¾Ð½ Ð½ÐµÐ°ÐºÑÐ¸Ð²ÐµÐ½ (ÑÑÐ¾Ð±Ñ Ð¼Ð¾Ð¶Ð½Ð¾ Ð±ÑÐ»Ð¾ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°ÑÑ ÑÑÑÐµÑÑÐ²ÑÑÑÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ)
              activeTypes.push(currentType);
            }
          }
          var typeOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¸Ð¿ â</option>'; activeTypes.forEach(function (ty) { var o = (ty.code === sel.type_code) ? ' selected' : ''; typeOpts += '<option value="' + escAttr(ty.code) + '"' + o + '>' + escAttr(ty.name || ty.code) + '</option>'; });
          var custOpts = '<option value="">â ÐÐµ ÑÐºÐ°Ð·Ð°Ð½ â</option>'; customers.forEach(function (c) { var o = (String(c.id) === sel.customer_id) ? ' selected' : ''; custOpts += '<option value="' + (c.id != null ? c.id : '') + '"' + o + '>' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          var prodOpts = '<option value="">â ÐÐµ ÑÐºÐ°Ð·Ð°Ð½ â</option>'; products.forEach(function (p) { var o = (p.code === sel.product_code) ? ' selected' : ''; prodOpts += '<option value="' + escAttr(p.code) + '"' + o + '>' + escAttr((p.code || '') + ' â ' + (p.name || '')) + '</option>'; });
          var whOpts = '<option value="">â ÐÐµ ÑÐºÐ°Ð·Ð°Ð½ â</option>'; warehouses.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var payOpts = '<option value="">â ÐÐµ ÑÐºÐ°Ð·Ð°Ð½ â</option>'; paymentTypes.forEach(function (pt) { var o = (pt.code === sel.payment_type_code) ? ' selected' : ''; payOpts += '<option value="' + escAttr(pt.code) + '"' + o + '>' + escAttr(pt.name || pt.code) + '</option>'; });
          var statusOpts = '<option value="pending"' + (sel.status === 'pending' ? ' selected' : '') + '>Ð Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ð¸</option><option value="completed"' + (sel.status === 'completed' ? ' selected' : '') + '>ÐÑÐ¿Ð¾Ð»Ð½ÐµÐ½Ð¾</option><option value="cancelled"' + (sel.status === 'cancelled' ? ' selected' : '') + '>ÐÑÐ¼ÐµÐ½ÐµÐ½Ð¾</option>';
          var userOpts = '<option value="">â ÐÐµ ÑÐºÐ°Ð·Ð°Ð½ â</option>'; userList.forEach(function (u) { userOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>'; });
          var content = document.getElementById('content');
          if (!content) return;
          var statusBlock = isEdit ? ('<div class="form-group" id="opFormStatusBlock"><label>Ð¡ÑÐ°ÑÑÑ</label><select id="opCreateStatus">' + statusOpts + '</select></div>') : '';
          content.innerHTML = '<div class="card"><h2 id="opFormTitle">Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</h2><div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div><div class="form-group"><label>ÐÐ°ÑÐ° Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</label><input type="text" id="opCreateDate" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" autocomplete="off"></div><div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</label><select id="opCreateType" required>' + typeOpts + '</select></div>' + statusBlock + '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ</label><select id="opCreateWarehouseFrom">' + whOpts + '</select></div><div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð²</label><select id="opCreateWarehouseTo">' + whOpts + '</select></div><div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ</label><select id="opCreateCustomer">' + custOpts + '</select></div><div class="form-group"><label>Ð¢Ð¾Ð²Ð°Ñ</label><select id="opCreateProduct">' + prodOpts + '</select></div><div class="form-group"><label>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾</label><input type="number" id="opCreateQuantity" min="0" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div><div class="form-group"><label>Ð¡ÑÐ¼Ð¼Ð°</label><input type="number" id="opCreateAmount" step="0.01" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div><div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ</label><select id="opCreatePaymentType">' + payOpts + '</select></div><div class="form-group"><label>ÐÐ°ÐºÐ°Ð· â</label><input type="number" id="opCreateOrderId" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·." min="0"></div><div class="form-group"><label>Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ</label><select id="opCreateExpeditor">' + userOpts + '</select></div><div class="form-group"><label>ÐÐ°ÑÑÐ¸Ñ</label><select id="opCreateCashier">' + userOpts + '</select></div><div class="form-group"><label>ÐÐ»Ð°Ð´Ð¾Ð²ÑÐ¸Ðº</label><select id="opCreateStorekeeper">' + userOpts + '</select></div><div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="opCreateComment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div><div style="margin-top:24px;padding:12px;background:#f8f9fa;border-radius:6px"><div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:#666">ÐÑÐ¾ ÑÐ¾Ð·Ð´Ð°Ð»</label><div id="opCreatedBy" class="form-readonly">â</div></div></div><p style="margin-top:16px"><button type="button" class="btn btn-primary" id="opCreateSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ</button> <button type="button" class="btn btn-secondary" id="opCreateCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
          document.getElementById('opFormTitle').textContent = isEdit ? ('Ð ÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð¸Ðµ ' + (opData.operation_number || operationId)) : 'Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸';
          var opDateEl = document.getElementById('opCreateDate');
          if (opDateEl) {
            opDateEl.value = sel.operation_date ? sel.operation_date.replace(/^(\d{4})-(\d{2})-(\d{2}).*/, '$3.$2.$1') : '';
            if (window.flatpickr) {
              window.flatpickr(opDateEl, { locale: 'ru', dateFormat: 'd.m.Y', allowInput: true });
            }
          }
          document.getElementById('opCreateQuantity').value = sel.quantity;
          document.getElementById('opCreateAmount').value = sel.amount;
          document.getElementById('opCreateComment').value = sel.comment;
          document.getElementById('opCreateOrderId').value = sel.order_id;
          var wFrom = document.getElementById('opCreateWarehouseFrom'); if (wFrom) wFrom.value = sel.warehouse_from || '';
          var wTo = document.getElementById('opCreateWarehouseTo'); if (wTo) wTo.value = sel.warehouse_to || '';
          document.getElementById('opCreatePaymentType').value = sel.payment_type_code || '';
          var statusSel = document.getElementById('opCreateStatus'); if (statusSel) statusSel.value = sel.status || 'pending';
          var exSel = document.getElementById('opCreateExpeditor'); if (exSel) exSel.value = sel.expeditor_login || '';
          var cashSel = document.getElementById('opCreateCashier'); if (cashSel) cashSel.value = sel.cashier_login || '';
          var stSel = document.getElementById('opCreateStorekeeper'); if (stSel) stSel.value = sel.storekeeper_login || '';
          if (isEdit && opData && opData.created_by) document.getElementById('opCreatedBy').textContent = opData.created_by; else document.getElementById('opCreatedBy').textContent = 'â';
          document.getElementById('opCreateCancel').onclick = function () { loadSectionOperations(false); };
          document.getElementById('opCreateSave').onclick = function () {
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            var saveBtn = document.getElementById('opCreateSave');
            if (errEl) errEl.textContent = '';
            if (msgEl) { msgEl.style.display = 'none'; msgEl.textContent = ''; }
            var operation_dateRaw = document.getElementById('opCreateDate').value || '';
            var operation_date = null;
            if (operation_dateRaw) {
              var m = operation_dateRaw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
              if (m) operation_date = m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') + 'T12:00:00';
              else if (/^\d{4}-\d{2}-\d{2}/.test(operation_dateRaw)) operation_date = operation_dateRaw.slice(0, 10) + (operation_dateRaw.indexOf('T') >= 0 ? '' : 'T12:00:00');
            }
            var type_code = document.getElementById('opCreateType').value;
            var statusEl = document.getElementById('opCreateStatus');
            var status = (statusEl ? statusEl.value : null) || 'pending';
            var warehouse_from = document.getElementById('opCreateWarehouseFrom').value || null;
            var warehouse_to = document.getElementById('opCreateWarehouseTo').value || null;
            var customer_id = document.getElementById('opCreateCustomer').value;
            var product_code = document.getElementById('opCreateProduct').value || null;
            var qVal = document.getElementById('opCreateQuantity').value.trim();
            var quantity = qVal !== '' ? parseInt(qVal, 10) : null;
            var amountVal = document.getElementById('opCreateAmount').value.trim();
            var amount = amountVal !== '' ? parseFloat(amountVal) : null;
            var payment_type_code = document.getElementById('opCreatePaymentType').value || null;
            var orderIdVal = document.getElementById('opCreateOrderId').value.trim();
            var orderIdNum = orderIdVal !== '' ? parseInt(orderIdVal, 10) : NaN;
            var order_id = (orderIdNum > 0) ? orderIdNum : null;
            var comment = document.getElementById('opCreateComment').value.trim() || null;
            var expeditor_login = document.getElementById('opCreateExpeditor').value || null;
            var cashier_login = document.getElementById('opCreateCashier').value || null;
            var storekeeper_login = document.getElementById('opCreateStorekeeper').value || null;
            if (!type_code) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸.'; return; }
            function errText(e) {
              if (!e) return 'ÐÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°';
              var d = e.data;
              if (d && d.detail !== undefined) { if (typeof d.detail === 'string') return d.detail; if (Array.isArray(d.detail)) return d.detail.map(function (x) { return x.msg || x.message || JSON.stringify(x); }).join(' '); return JSON.stringify(d.detail); }
              if (d) return JSON.stringify(d);
              return (e.message || e.status || 'ÐÑÐ¸Ð±ÐºÐ°') + '';
            }
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            function doneSuccess() {
              if (msgEl) { msgEl.textContent = 'ÐÐ¿ÐµÑÐ°ÑÐ¸Ñ ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð°.'; msgEl.style.display = 'block'; }
              setTimeout(function () { loadSectionOperations(false); }, 1500);
            }
            function doneError(e) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ';
              if (errEl) errEl.textContent = errText(e);
            }
            var payload = { type_code: type_code, operation_date: operation_date, status: status, warehouse_from: warehouse_from, warehouse_to: warehouse_to, customer_id: customer_id ? parseInt(customer_id, 10) : null, product_code: product_code, quantity: quantity, amount: amount, payment_type_code: payment_type_code, order_id: order_id, comment: comment, expeditor_login: expeditor_login, cashier_login: cashier_login, storekeeper_login: storekeeper_login };
            if (isEdit) {
              api('/api/v1/operations/' + operationId, { method: 'PATCH', body: JSON.stringify(payload) }).then(doneSuccess).catch(doneError);
            } else {
              api('/api/v1/operations', { method: 'POST', body: JSON.stringify(payload) }).then(doneSuccess).catch(doneError);
            }
          };
        }
        function buildWarehouseReceiptForm(config, products, warehouses, userList) {
          var content = document.getElementById('content');
          if (!content) return;
          var whOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ â</option>';
          warehouses.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var prodOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¾Ð²Ð°Ñ â</option>';
          products.forEach(function (p) { prodOpts += '<option value="' + escAttr(p.code) + '">' + escAttr((p.code || '') + ' â ' + (p.name || '')) + '</option>'; });
          var formHtml = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸: ' + escAttr(config.operation_name || 'ÐÑÐ¸ÑÐ¾Ð´ Ð½Ð° ÑÐºÐ»Ð°Ð´') + '</h2>';
          if (config.description) formHtml += '<p style="color:#666;margin-bottom:16px">' + escAttr(config.description) + '</p>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          var productsMap = {};
          products.forEach(function (p) { productsMap[p.code] = p; });
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð² <span style="color:#c00">*</span></label><select id="opWhReceiptWarehouseTo" required>' + whOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">Ð¢Ð¾Ð²Ð°ÑÑ</h3><div style="overflow-x:auto"><table id="opWhReceiptItemsTable" style="width:100%"><thead><tr><th>Ð¢Ð¾Ð²Ð°Ñ <span style="color:#c00">*</span></th><th>Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸ <span style="color:#c00">*</span></th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ <span style="color:#c00">*</span></th><th>Ð¦ÐµÐ½Ð° (Ð¸Ð· ÑÐ¿ÑÐ°Ð²Ð¾ÑÐ½Ð¸ÐºÐ°)</th><th>Ð¡ÑÐ¼Ð¼Ð°</th><th>ÐÐ¾Ð´ Ð¿Ð°ÑÑÐ¸Ð¸ (Ð°Ð²ÑÐ¾)</th><th></th></tr></thead><tbody id="opWhReceiptItemsBody"><tr class="op-wh-receipt-row"><td><select class="op-wh-receipt-product" required>' + prodOpts + '</select></td><td><input type="text" class="op-wh-receipt-expiry" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" required autocomplete="off"></td><td><input type="number" class="op-wh-receipt-quantity" min="1" required></td><td class="op-wh-receipt-price" style="text-align:right;padding:8px;font-weight:600">â</td><td class="op-wh-receipt-sum" style="text-align:right;padding:8px;font-weight:600">â</td><td><input type="text" class="op-wh-receipt-batch" readonly style="background:#f0f0f0"></td><td><button type="button" class="btn btn-secondary btn-small op-wh-receipt-remove" style="display:none">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button></td></tr></tbody><tfoot id="opWhReceiptItemsFooter"><tr style="background:#f8f9fa;font-weight:600"><td colspan="3" style="text-align:right;padding:10px">ÐÑÐ¾Ð³Ð¾:</td><td></td><td id="opWhReceiptTotalSum" style="text-align:right;padding:10px">0</td><td colspan="2"></td></tr></tfoot></table></div><button type="button" class="btn btn-secondary" id="opWhReceiptAddRow" style="margin-top:8px">+ ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐ¾Ð²Ð°Ñ</button></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="opWhReceiptComment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="opWhReceiptSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ</button> <button type="button" class="btn btn-secondary" id="opWhReceiptCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
          content.innerHTML = formHtml;
          var expiryInputs = content.querySelectorAll('.op-wh-receipt-expiry');
          expiryInputs.forEach(function (el) {
            if (window.flatpickr) window.flatpickr(el, { locale: 'ru', dateFormat: 'd.m.Y', allowInput: true });
          });
          function updateRowCalculations(row) {
            var productSel = row.querySelector('.op-wh-receipt-product');
            var expiryInp = row.querySelector('.op-wh-receipt-expiry');
            var quantityInp = row.querySelector('.op-wh-receipt-quantity');
            var batchInp = row.querySelector('.op-wh-receipt-batch');
            var priceCell = row.querySelector('.op-wh-receipt-price');
            var sumCell = row.querySelector('.op-wh-receipt-sum');
            if (!productSel || !expiryInp || !batchInp || !priceCell || !sumCell) return;
            var productCode = (productSel.value || '').trim();
            var expiryRaw = (expiryInp.value || '').trim();
            var quantity = parseInt(quantityInp ? quantityInp.value : 0, 10) || 0;
            var product = productsMap[productCode];
            var price = product && product.price ? parseFloat(product.price) : 0;
            if (productCode && expiryRaw) {
              var m = expiryRaw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
              if (!m) {
                var iso = expiryRaw.match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (iso) m = [null, iso[3], iso[2], iso[1]];
              }
              if (m) {
                var ddmmyyyy = m[1].padStart(2, '0') + m[2].padStart(2, '0') + m[3];
                batchInp.value = productCode + '_' + ddmmyyyy;
              }
            } else {
              batchInp.value = '';
            }
            priceCell.textContent = price > 0 ? price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ÑÑÐ¼' : 'â';
            var sum = price * quantity;
            sumCell.textContent = sum > 0 ? sum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ÑÑÐ¼' : 'â';
            updateTotalSum();
          }
          function updateTotalSum() {
            var rows = document.querySelectorAll('.op-wh-receipt-row');
            var totalSum = 0;
            var totalQty = 0;
            rows.forEach(function (row) {
              var quantityInp = row.querySelector('.op-wh-receipt-quantity');
              var productSel = row.querySelector('.op-wh-receipt-product');
              if (!quantityInp || !productSel) return;
              var productCode = (productSel.value || '').trim();
              var quantity = parseInt(quantityInp.value, 10) || 0;
              var product = productsMap[productCode];
              var price = product && product.price ? parseFloat(product.price) : 0;
              totalQty += quantity;
              totalSum += price * quantity;
            });
            var totalSumEl = document.getElementById('opWhReceiptTotalSum');
            if (totalSumEl) {
              totalSumEl.innerHTML = totalSum > 0 ? totalSum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ÑÑÐ¼<br><small style="font-weight:normal;color:#666">(' + totalQty + ' ÑÑ.)</small>' : '0';
            }
          }
          function attachRowHandlers(row) {
            var productSel = row.querySelector('.op-wh-receipt-product');
            var expiryInp = row.querySelector('.op-wh-receipt-expiry');
            var quantityInp = row.querySelector('.op-wh-receipt-quantity');
            var removeBtn = row.querySelector('.op-wh-receipt-remove');
            if (productSel) productSel.onchange = function () { updateRowCalculations(row); };
            if (expiryInp) {
              expiryInp.onchange = function () { updateRowCalculations(row); };
              expiryInp.oninput = function () { updateRowCalculations(row); };
            }
            if (quantityInp) {
              quantityInp.onchange = function () { updateRowCalculations(row); };
              quantityInp.oninput = function () { updateRowCalculations(row); };
            }
            if (removeBtn) removeBtn.onclick = function () { row.remove(); updateTotalSum(); };
          }
          var rows = content.querySelectorAll('.op-wh-receipt-row');
          rows.forEach(function (row) {
            attachRowHandlers(row);
            updateRowCalculations(row);
          });
          document.getElementById('opWhReceiptAddRow').onclick = function () {
            var tbody = document.getElementById('opWhReceiptItemsBody');
            var newRow = document.createElement('tr');
            newRow.className = 'op-wh-receipt-row';
            newRow.innerHTML = '<td><select class="op-wh-receipt-product" required>' + prodOpts + '</select></td><td><input type="text" class="op-wh-receipt-expiry" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" required autocomplete="off"></td><td><input type="number" class="op-wh-receipt-quantity" min="1" required></td><td class="op-wh-receipt-price" style="text-align:right;padding:8px;font-weight:600">â</td><td class="op-wh-receipt-sum" style="text-align:right;padding:8px;font-weight:600">â</td><td><input type="text" class="op-wh-receipt-batch" readonly style="background:#f0f0f0"></td><td><button type="button" class="btn btn-secondary btn-small op-wh-receipt-remove">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button></td>';
            tbody.appendChild(newRow);
            var expiryEl = newRow.querySelector('.op-wh-receipt-expiry');
            if (expiryEl && window.flatpickr) window.flatpickr(expiryEl, { locale: 'ru', dateFormat: 'd.m.Y', allowInput: true });
            attachRowHandlers(newRow);
            var allRows = tbody.querySelectorAll('.op-wh-receipt-row');
            if (allRows.length > 1) allRows.forEach(function (r) { var btn = r.querySelector('.op-wh-receipt-remove'); if (btn) btn.style.display = 'inline-block'; });
          };
          document.getElementById('opWhReceiptCancel').onclick = function () { loadSectionOperations(false); };
          document.getElementById('opWhReceiptSave').onclick = function () {
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            var saveBtn = document.getElementById('opWhReceiptSave');
            if (errEl) errEl.textContent = '';
            if (msgEl) { msgEl.style.display = 'none'; msgEl.textContent = ''; }
            var warehouseTo = document.getElementById('opWhReceiptWarehouseTo').value;
            if (!warehouseTo) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´'; return; }
            var rows = document.querySelectorAll('.op-wh-receipt-row');
            if (!rows.length) { if (errEl) errEl.textContent = 'ÐÐ¾Ð±Ð°Ð²ÑÑÐµ ÑÐ¾ÑÑ Ð±Ñ Ð¾Ð´Ð¸Ð½ ÑÐ¾Ð²Ð°Ñ'; return; }
            var items = [];
            var hasErrors = false;
            rows.forEach(function (row, idx) {
              var productSel = row.querySelector('.op-wh-receipt-product');
              var expiryInp = row.querySelector('.op-wh-receipt-expiry');
              var quantityInp = row.querySelector('.op-wh-receipt-quantity');
              var batchInp = row.querySelector('.op-wh-receipt-batch');
              if (!productSel || !expiryInp || !quantityInp || !batchInp) return;
              var productCode = (productSel.value || '').trim();
              var expiryDate = (expiryInp.value || '').trim();
              var quantity = parseInt(quantityInp.value, 10);
              var batchCode = (batchInp.value || '').trim();
              if (!productCode || !expiryDate || isNaN(quantity) || quantity <= 0) {
                hasErrors = true;
                return;
              }
              items.push({ product_code: productCode, expiry_date: expiryDate, quantity: quantity, batch_code: batchCode });
            });
            if (hasErrors) { if (errEl) errEl.textContent = 'ÐÐ°Ð¿Ð¾Ð»Ð½Ð¸ÑÐµ Ð²ÑÐµ Ð¿Ð¾Ð»Ñ Ð´Ð»Ñ Ð²ÑÐµÑ ÑÐ¾Ð²Ð°ÑÐ¾Ð²'; return; }
            if (!items.length) { if (errEl) errEl.textContent = 'ÐÐ¾Ð±Ð°Ð²ÑÑÐµ ÑÐ¾ÑÑ Ð±Ñ Ð¾Ð´Ð¸Ð½ ÑÐ¾Ð²Ð°Ñ'; return; }
            var payload = { warehouse_to: warehouseTo, items: items, comment: (document.getElementById('opWhReceiptComment').value || '').trim() || null };
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            function doneSuccess(result) {
              if (msgEl) { msgEl.textContent = 'ÐÐ¿ÐµÑÐ°ÑÐ¸Ð¸ ÑÐ¾Ð·Ð´Ð°Ð½Ñ: ' + (result.operations_count || items.length) + ' ÑÑ.'; msgEl.style.display = 'block'; }
              setTimeout(function () { loadSectionOperations(false); }, 2000);
            }
            function doneError(e) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ';
              var detail = e && e.data && e.data.detail;
              if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
              if (detail && detail.errors) {
                var errs = [];
                for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                if (errEl) errEl.textContent = errs.join('; ');
              } else if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
            }
            api('/api/v1/operations/warehouse_receipt/create-batch', { method: 'POST', body: JSON.stringify(payload) }).then(doneSuccess).catch(doneError);
          };
        }
        function buildAllocationForm(config, customers, products, warehouses, userList) {
          var content = document.getElementById('content');
          if (!content) return;
          var warehousesList = warehouses || [];
          var productsList = products || [];
          var whOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ â</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var expOpts = '<option value="">â ÐÐµ ÑÐºÐ°Ð·Ð°Ð½ â</option>';
          (userList || []).forEach(function (u) {
            if ((u.role || '').toLowerCase() !== 'expeditor') return;
            expOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>';
          });
          // Ð¡Ð¿Ð¸ÑÐ¾Ðº ÑÐ¾Ð²Ð°ÑÐ¾Ð² Ð±ÑÐ´ÐµÐ¼ Ð¾Ð³ÑÐ°Ð½Ð¸ÑÐ¸Ð²Ð°ÑÑ ÑÐ¾Ð»ÑÐºÐ¾ ÑÐµÐ¼Ð¸, Ñ ÐºÐ¾ÑÐ¾ÑÑÑ ÐµÑÑÑ Ð¾ÑÑÐ°ÑÐºÐ¸ Ð½Ð° Ð²ÑÐ±ÑÐ°Ð½Ð½Ð¾Ð¼ ÑÐºÐ»Ð°Ð´Ðµ
          var productsMap = {}; productsList.forEach(function (p) { productsMap[p.code] = p; });
          var formHtml = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸: ' + escAttr(config.operation_name || 'ÐÑÐ´Ð°ÑÐ° ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÑ') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          // Ð¿Ð¾ÑÑÐ´Ð¾Ðº: Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ â Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ â Ð¡ÐºÐ»Ð°Ð´ Ð² (ÑÐµÑÐ¾Ðµ, Ð°Ð²ÑÐ¾Ð·Ð°Ð¿Ð¾Ð»Ð½ÑÐµÑÑÑ Ð¿Ð¾ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÑ)
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ <span style="color:#c00">*</span></label><select id="allocWhFrom" required>' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ <span style="color:#c00">*</span></label><select id="allocExpeditor" required>' + expOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð² <span style="color:#c00">*</span></label><select id="allocWhTo" required disabled style="background-color:#eee; color:#555;">' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ <span style="color:#c00">*</span></label><input type="text" id="allocDeliveryDate" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" autocomplete="off"></div>';
          formHtml += '<p style="margin:8px 0 0 0"><button type="button" class="btn btn-secondary" id="allocPullByDate">ÐÐ¾Ð´ÑÑÐ½ÑÑÑ ÑÐ¾Ð²Ð°ÑÑ Ð¿Ð¾ Ð´Ð°ÑÐµ Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸</button></p>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">Ð¢Ð¾Ð²Ð°ÑÑ</h3><div style="overflow-x:auto"><table id="allocItemsTable" style="width:100%"><thead><tr><th>Ð¢Ð¾Ð²Ð°Ñ</th><th>ÐÐ°ÑÑÐ¸Ñ</th><th>Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸</th><th>ÐÐ½ÐµÐ¹ Ð¾ÑÑÐ°Ð»Ð¾ÑÑ</th><th>ÐÐ¾ÑÑÑÐ¿Ð½Ð¾</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾</th><th>ÐÐµÑ</th><th>Ð¦ÐµÐ½Ð°</th><th>Ð¡ÑÐ¼Ð¼Ð°</th><th></th></tr></thead><tbody id="allocItemsBody"><tr class="alloc-row"><td><select class="alloc-product" required><option value=\"\">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¾Ð²Ð°Ñ â</option></select></td><td><select class="alloc-batch" required><option value=\"\">â Ð½ÐµÑ Ð´Ð°Ð½Ð½ÑÑ â</option></select></td><td class="alloc-expiry">â</td><td class="alloc-days" style="text-align:center">â</td><td class="alloc-available" style="text-align:right">0</td><td><input type="number" class="alloc-qty" min="1" required></td><td class="alloc-weight" style="text-align:right">â</td><td class="alloc-price" style="text-align:right">â</td><td class="alloc-sum" style="text-align:right">â</td><td><button type="button" class="btn btn-secondary btn-small alloc-remove" style="display:none">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button></td></tr></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="5" style="text-align:right;padding:8px">\u0418\u0442\u043e\u0433\u043e:</td><td id="allocTotalQty" style="text-align:right;padding:8px">0</td><td id="allocTotalWeight" style="text-align:right;padding:8px">0 \u043a\u0433</td><td></td><td id="allocTotalSum" style="text-align:right;padding:8px">0,00</td><td></td></tr></tfoot></table></div><button type="button" class="btn btn-secondary" id="allocAddRow" style="margin-top:8px">+ ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐ¾Ð²Ð°Ñ</button></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="allocComment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="allocSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</button> <button type="button" class="btn btn-secondary" id="allocCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
          content.innerHTML = formHtml;
          var allocDeliveryDateEl = document.getElementById('allocDeliveryDate');
          if (allocDeliveryDateEl && window.flatpickr) {
            window.flatpickr(allocDeliveryDateEl, { locale: 'ru', dateFormat: 'd.m.Y', allowInput: true });
          }
          var stockCache = null;
          var lastAllocDeliveryDateValue = allocDeliveryDateEl ? (allocDeliveryDateEl.value || '') : '';

          function hasAllocationRowsData() {
            var rows = document.querySelectorAll('.alloc-row');
            var hasData = false;
            rows.forEach(function (row) {
              var prodSel = row.querySelector('.alloc-product');
              var batchSel = row.querySelector('.alloc-batch');
              var qtyInp = row.querySelector('.alloc-qty');
              var qty = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              if ((prodSel && prodSel.value) || (batchSel && batchSel.value) || qty > 0) hasData = true;
            });
            return hasData;
          }

          function clearAllocationRows() {
            var tbody = document.getElementById('allocItemsBody');
            if (!tbody) return;
            tbody.innerHTML = '';
          }

          function addAllocationRow(prefill) {
            var tbody = document.getElementById('allocItemsBody');
            if (!tbody) return null;
            var row = document.createElement('tr');
            row.className = 'alloc-row';
            var prodOptsNow = buildProductOptionsFromStock();
            row.innerHTML = '<td><select class="alloc-product" required>' + prodOptsNow + '</select></td><td><select class="alloc-batch" required><option value="">â Ð½ÐµÑ Ð´Ð°Ð½Ð½ÑÑ â</option></select></td><td class="alloc-expiry">â</td><td class="alloc-days" style="text-align:center">â</td><td class="alloc-available" style="text-align:right">0</td><td><input type="number" class="alloc-qty" min="1" required></td><td class="alloc-weight" style="text-align:right">â</td><td class="alloc-price" style="text-align:right">â</td><td class="alloc-sum" style="text-align:right">â</td><td><button type="button" class="btn btn-secondary btn-small alloc-remove">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button></td>';
            tbody.appendChild(row);
            attachAllocRowHandlers(row);
            if (prefill && prefill.product_code) {
              var prodSel = row.querySelector('.alloc-product');
              if (prodSel) prodSel.value = prefill.product_code;
              updateRowFromStock(row);
              var batchSel = row.querySelector('.alloc-batch');
              if (batchSel && prefill.batch_code) batchSel.value = prefill.batch_code;
              var qtyInp = row.querySelector('.alloc-qty');
              if (qtyInp && prefill.quantity != null) qtyInp.value = String(prefill.quantity);
              updateRowFromStock(row);
            } else {
              updateRowFromStock(row);
            }
            return row;
          }
          function loadStock(whCode) {
            if (!whCode) { stockCache = null; return Promise.resolve(); }
            return api('/api/v1/warehouse/stock?warehouse=' + encodeURIComponent(whCode)).then(function (resp) {
              stockCache = (resp && resp.success && Array.isArray(resp.data)) ? resp.data : [];
            }).catch(function () { stockCache = []; });
          }
          function buildProductOptionsFromStock() {
            var opts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¾Ð²Ð°Ñ â</option>';
            if (!stockCache || !stockCache.length) return opts;
            var withStock = {};
            stockCache.forEach(function (s) {
              if (s.product_code) withStock[s.product_code] = true;
            });
            productsList.forEach(function (p) {
              if (withStock[p.code]) {
                opts += '<option value="' + escAttr(p.code) + '">' + escAttr((p.code || '') + ' â ' + (p.name || '')) + '</option>';
              }
            });
            return opts;
          }
          function updateRowFromStock(row) {
            var productSel = row.querySelector('.alloc-product');
            var batchSel = row.querySelector('.alloc-batch');
            var expiryCell = row.querySelector('.alloc-expiry');
            var daysCell = row.querySelector('.alloc-days');
            var availCell = row.querySelector('.alloc-available');
            var weightCell = row.querySelector('.alloc-weight');
            var priceCell = row.querySelector('.alloc-price');
            var sumCell = row.querySelector('.alloc-sum');
            var qtyInp = row.querySelector('.alloc-qty');
            if (!productSel || !batchSel) return;
            var whFrom = document.getElementById('allocWhFrom').value;
            var productCode = productSel.value || '';
            var prevBatchCode = (batchSel && batchSel.value) ? String(batchSel.value) : '';
            var rows = (stockCache || []).filter(function (s) { return s.product_code === productCode && (!whFrom || s.warehouse_code === whFrom); });
            rows.sort(function (a, b) {
              var ea = a.expiry_date || ''; var eb = b.expiry_date || '';
              return ea.localeCompare(eb);
            });
            var opts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð¿Ð°ÑÑÐ¸Ñ â</option>';
            rows.forEach(function (r) {
              var days = (r.days_until_expiry != null ? r.days_until_expiry : '');
              var status = r.expiry_status || {};
              var color = status.color || '';
              var icon = status.icon || '';
              opts += '<option value="' + escAttr(r.batch_code || '') + '" data-batch-id="' + escAttr(r.batch_id || '') + '" data-expiry="' + escAttr(r.expiry_date || '') + '" data-available="' + (r.total_qty != null ? r.total_qty : 0) + '" data-days="' + days + '" data-color="' + escAttr(color) + '" data-icon="' + escAttr(icon) + '">' + escAttr((r.batch_code || '') + (r.expiry_date ? ' â ' + formatDateOnly(r.expiry_date) : '')) + '</option>';
            });
            batchSel.innerHTML = opts;
            if (rows.length) {
              var restored = false;
              if (prevBatchCode) {
                for (var i = 0; i < batchSel.options.length; i += 1) {
                  if (batchSel.options[i] && batchSel.options[i].value === prevBatchCode) {
                    batchSel.selectedIndex = i;
                    restored = true;
                    break;
                  }
                }
              }
              if (!restored) batchSel.selectedIndex = 1;
            }
            updateBatchInfo();
            function updateBatchInfo() {
              var opt = batchSel.options[batchSel.selectedIndex] || null;
              var expiry = opt ? opt.getAttribute('data-expiry') || '' : '';
              var avail = opt ? parseInt(opt.getAttribute('data-available') || '0', 10) || 0 : 0;
              var daysAttr = opt ? opt.getAttribute('data-days') : null;
              var color = opt ? opt.getAttribute('data-color') || '' : '';
              var icon = opt ? opt.getAttribute('data-icon') || '' : '';
              expiryCell.textContent = expiry ? formatDateOnly(expiry) : 'â';
              availCell.textContent = avail;
              if (daysCell) {
                if (daysAttr === null || daysAttr === '' || isNaN(parseInt(daysAttr, 10))) {
                  daysCell.textContent = 'â';
                } else {
                  var days = parseInt(daysAttr, 10);
                  var badgeColor = '#28a745';
                  if (color === 'YELLOW') badgeColor = '#ffc107';
                  else if (color === 'RED') badgeColor = '#dc3545';
                  else if (color === 'BLACK') badgeColor = '#343a40';
                  var iconChar = icon || (color === 'YELLOW' ? 'ð¡' : (color === 'RED' ? 'ð´' : (color === 'BLACK' ? 'â«' : 'ð¢')));
                  var daysText = days + ' Ð´Ð½.';
                  daysCell.innerHTML = '<span class="badge" style="background-color:' + badgeColor + ';color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;">' + iconChar + ' ' + daysText + '</span>';
                }
              }
              var prod = productsMap[productCode];
              var price = prod && prod.price ? parseFloat(prod.price) : 0;
              var weightG = prod && prod.weight_g ? parseFloat(prod.weight_g) : 0;
              priceCell.textContent = price ? price.toFixed(2) : 'â';
              var qty = parseInt(qtyInp.value || '0', 10) || 0;
              if (qty > avail) qty = avail;
              if (qtyInp.value && parseInt(qtyInp.value, 10) !== qty) qtyInp.value = qty || '';
              var sum = price * qty;
              sumCell.textContent = sum ? sum.toFixed(2) : 'â';
              if (weightCell) {
                var totalWeightG = weightG * qty;
                if (totalWeightG > 0) {
                  var totalWeightKg = (totalWeightG / 1000).toFixed(2);
                  weightCell.textContent = totalWeightKg + ' ÐºÐ³';
                } else {
                  weightCell.textContent = 'â';
                }
              }
              updateTotals();
            }
            batchSel.onchange = updateBatchInfo;
            qtyInp.oninput = updateBatchInfo;
            qtyInp.onchange = updateBatchInfo;
          }
          function updateTotals() {
            var rows = document.querySelectorAll('.alloc-row');
            var totalQty = 0;
            var totalSum = 0;
            var totalWeightG = 0;
            rows.forEach(function (row) {
              var qty = parseInt((row.querySelector('.alloc-qty') || {}).value || '0', 10) || 0;
              var productSel = row.querySelector('.alloc-product');
              if (!productSel) return;
              var prod = productsMap[productSel.value || ''];
              var price = prod && prod.price ? parseFloat(prod.price) : 0;
              var weightG = prod && prod.weight_g ? parseFloat(prod.weight_g) : 0;
              totalQty += qty;
              totalSum += price * qty;
              totalWeightG += weightG * qty;
            });
            var qEl = document.getElementById('allocTotalQty');
            var sEl = document.getElementById('allocTotalSum');
            var wEl = document.getElementById('allocTotalWeight');
            if (qEl) qEl.textContent = totalQty.toLocaleString('ru-RU');
            if (sEl) sEl.textContent = totalSum.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (wEl) {
              if (totalWeightG > 0) {
                var totalWeightKg = (totalWeightG / 1000).toFixed(2);
                wEl.textContent = totalWeightKg + ' ÐºÐ³';
              } else {
                wEl.textContent = '0 ÐºÐ³';
              }
            }
          }

          function pullAllocationByDate(options) {
            options = options || {};
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            if (errEl) errEl.textContent = '';
            if (msgEl) { msgEl.style.display = 'none'; msgEl.textContent = ''; }

            var whFrom = document.getElementById('allocWhFrom').value;
            var expeditor = document.getElementById('allocExpeditor').value;
            var deliveryDate = (document.getElementById('allocDeliveryDate').value || '').trim();
            if (!whFrom) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ Ð¾Ñ.'; return; }
            if (!expeditor) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°.'; return; }
            if (!deliveryDate) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð´Ð°ÑÑ Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸.'; return; }

            if (!options.skipConfirm && hasAllocationRowsData()) {
              var text = options.dateChangeMode
                ? 'ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ Ð´Ð°ÑÑ Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸? Ð¢ÐµÐºÑÑÐ¸Ðµ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¸ Ð±ÑÐ´ÑÑ Ð·Ð°Ð¼ÐµÐ½ÐµÐ½Ñ.'
                : 'ÐÐ°Ð¼ÐµÐ½Ð¸ÑÑ ÑÑÑÐµÑÑÐ²ÑÑÑÐ¸Ðµ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¸ Ð½Ð¾Ð²ÑÐ¼Ð¸?';
              if (!confirm(text)) return;
            }

            var pullBtn = document.getElementById('allocPullByDate');
            if (pullBtn) { pullBtn.disabled = true; pullBtn.textContent = 'ÐÐ¾Ð´ÑÑÐ³Ð¸Ð²Ð°ÐµÐ¼...'; }

            function bindMatchedOrderLinks() {
              if (!msgEl) return;
              msgEl.querySelectorAll('[data-alloc-order-id]').forEach(function (a) {
                a.onclick = function (ev) {
                  ev.preventDefault();
                  var orderId = parseInt(this.getAttribute('data-alloc-order-id') || '0', 10) || 0;
                  if (!orderId) return;
                  api('/api/v1/orders/' + orderId).then(function (order) {
                    var statusLabel = order.status_name || order.status_code || 'â';
                    var paymentLabel = order.payment_type_name || order.payment_type_code || 'â';
                    var amountValue = (order.total_amount != null && !isNaN(Number(order.total_amount)))
                      ? Number(order.total_amount).toLocaleString('ru-RU')
                      : (order.total_amount != null ? order.total_amount : 'â');
                    var lastUpdated = 'â';
                    if (order.last_updated_at) {
                      try {
                        var dLast = new Date(order.last_updated_at);
                        lastUpdated = isNaN(dLast.getTime())
                          ? String(order.last_updated_at)
                          : dLast.toLocaleString('ru-RU', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            });
                      } catch (_) {
                        lastUpdated = String(order.last_updated_at);
                      }
                    }
                    var itemsHtml = '';
                    var orderItems = Array.isArray(order.items) ? order.items : [];
                    if (orderItems.length) {
                      var rowsHtml = orderItems.map(function (it) {
                        var qty = Number(it.quantity || 0);
                        var priceNum = (it.price != null && !isNaN(Number(it.price))) ? Number(it.price) : null;
                        var sumText = priceNum != null ? (qty * priceNum).toLocaleString('ru-RU') : 'â';
                        return '<tr>'
                          + '<td>' + escAttr(it.product_name || it.product_code || 'â') + '</td>'
                          + '<td style="text-align:right">' + escAttr(qty) + '</td>'
                          + '<td style="text-align:right">' + escAttr(priceNum != null ? priceNum.toLocaleString('ru-RU') : 'â') + '</td>'
                          + '<td style="text-align:right">' + escAttr(sumText) + '</td>'
                          + '</tr>';
                      }).join('');
                      itemsHtml = '<div class="form-group"><label>ÐÐ¾Ð·Ð¸ÑÐ¸Ð¸ Ð·Ð°ÐºÐ°Ð·Ð°</label><div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>Ð¢Ð¾Ð²Ð°Ñ</th><th style="text-align:right">ÐÐ¾Ð»-Ð²Ð¾</th><th style="text-align:right">Ð¦ÐµÐ½Ð°</th><th style="text-align:right">Ð¡ÑÐ¼Ð¼Ð°</th></tr></thead><tbody>'
                        + rowsHtml
                        + '</tbody></table></div></div>';
                    }
                    var bodyHtml = ''
                      + '<div class="form-group"><label>ÐÐ¾Ð¼ÐµÑ Ð·Ð°ÐºÐ°Ð·Ð°</label><div class="form-readonly">â ' + escAttr(order.order_no || order.id || orderId) + '</div></div>'
                      + '<div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ</label><div class="form-readonly">' + escAttr(order.customer_name || 'â') + '</div></div>'
                      + '<div class="form-group"><label>Ð¡ÑÐ°ÑÑÑ</label><div class="form-readonly">' + escAttr(statusLabel) + '</div></div>'
                      + '<div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ</label><div class="form-readonly">' + escAttr(paymentLabel) + '</div></div>'
                      + '<div class="form-group"><label>Ð¡ÑÐ¼Ð¼Ð°</label><div class="form-readonly">' + escAttr(amountValue) + '</div></div>'
                      + '<div class="form-group"><label>ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸</label><div class="form-readonly">' + escAttr(order.scheduled_delivery_at ? formatDateOnly(order.scheduled_delivery_at) : 'â') + '</div></div>'
                      + '<div class="form-group"><label>ÐÐ¾ÑÐ»ÐµÐ´Ð½ÐµÐµ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ðµ</label><div class="form-readonly">' + escAttr(lastUpdated) + '</div></div>'
                      + itemsHtml;
                    showModal('ÐÐ°ÐºÐ°Ð· â ' + orderId, bodyHtml, function () { return Promise.resolve(); }, { closeOnly: true });
                  }).catch(function (e) {
                    var detail = e && e.data && e.data.detail;
                    var msg = typeof detail === 'string'
                      ? detail
                      : (detail ? JSON.stringify(detail) : 'ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð³ÑÑÐ·Ð¸ÑÑ Ð·Ð°ÐºÐ°Ð·.');
                    showModal(
                      'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð°',
                      '<p style="margin:0 0 8px 0">' + escAttr(msg) + '</p><p style="margin:0;color:#666">ÐÐ°ÐºÐ°Ð·: â ' + escAttr(orderId) + '</p>',
                      function () { return Promise.resolve(); },
                      { closeOnly: true }
                    );
                  });
                };
              });
            }

            api(
              '/api/v1/operations/allocation/suggest-by-delivery-date'
              + '?warehouse_from=' + encodeURIComponent(whFrom)
              + '&expeditor_login=' + encodeURIComponent(expeditor)
              + '&delivery_date=' + encodeURIComponent(deliveryDate)
            ).then(function (resp) {
              if (!resp || resp.success !== true) {
                if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° Ð°Ð²ÑÐ¾Ð¿Ð¾Ð´ÑÑÐ³Ð¸Ð²Ð°Ð½Ð¸Ñ ÑÐ¾Ð²Ð°ÑÐ¾Ð².';
                return;
              }
              if (resp.no_orders) {
                clearAllocationRows();
                addAllocationRow(null);
                updateTotals();
                if (msgEl) {
                  msgEl.textContent = resp.message || ('ÐÐ° Ð²ÑÐ±ÑÐ°Ð½Ð½ÑÑ Ð´Ð°ÑÑ Ð½ÐµÑ Ð°ÐºÑÐ¸Ð²Ð½ÑÑ Ð·Ð°ÐºÐ°Ð·Ð¾Ð² Ð´Ð»Ñ Ð´Ð¾ÑÑÐ°Ð²ÐºÐ¸ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ¾Ð¼ ' + expeditor + '.');
                  msgEl.style.display = 'block';
                }
                return;
              }

              var renderPrefill = function () {
                var prefillRows = [];
                (resp.items || []).forEach(function (item) {
                  (item.allocations || []).forEach(function (a) {
                    var qty = parseInt(a.allocated_qty || '0', 10) || 0;
                    if (qty <= 0) return;
                    prefillRows.push({
                      product_code: a.product_code,
                      batch_code: a.batch_code,
                      quantity: qty
                    });
                  });
                });
                clearAllocationRows();
                if (prefillRows.length) {
                  prefillRows.forEach(function (r) { addAllocationRow(r); });
                } else {
                  addAllocationRow(null);
                }
                updateTotals();

                if (resp.warnings && resp.warnings.length) {
                  if (errEl) errEl.textContent = resp.warnings.join(' | ');
                } else if (msgEl) {
                  var orderInfoText = '';
                  if (resp.matched_orders_count != null) {
                    var orderIds = Array.isArray(resp.matched_order_ids) ? resp.matched_order_ids : [];
                    var orderIdsHtml = orderIds.length
                      ? orderIds.map(function (id) {
                          return '<a href="#" data-alloc-order-id="' + escAttr(id) + '" style="margin-right:6px">\u2116' + escAttr(id) + '</a>';
                        }).join('')
                      : 'â';
                    orderInfoText = ' <span>ÐÐ¾Ð´ÑÑÐ½ÑÑÐ¾ Ð¸Ð· Ð·Ð°ÐºÐ°Ð·Ð¾Ð²: ' + resp.matched_orders_count + ' (' + orderIdsHtml + ')</span>.';
                  }
                  msgEl.innerHTML = 'Ð¢Ð¾Ð²Ð°ÑÑ ÑÑÐ¿ÐµÑÐ½Ð¾ Ð¿Ð¾Ð´ÑÑÐ½ÑÑÑ Ð¿Ð¾ Ð´Ð°ÑÐµ Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸.' + orderInfoText;
                  msgEl.style.display = 'block';
                  bindMatchedOrderLinks();
                }
              };
              loadStock(whFrom).then(renderPrefill).catch(renderPrefill);
            }).catch(function (e) {
              var detail = e && e.data && e.data.detail;
              if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
              if (detail && detail.errors) {
                var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                if (errEl) errEl.textContent = errs.join('; ');
              } else if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° Ð°Ð²ÑÐ¾Ð¿Ð¾Ð´ÑÑÐ³Ð¸Ð²Ð°Ð½Ð¸Ñ ÑÐ¾Ð²Ð°ÑÐ¾Ð².';
            }).finally(function () {
              if (pullBtn) { pullBtn.disabled = false; pullBtn.textContent = 'ÐÐ¾Ð´ÑÑÐ½ÑÑÑ ÑÐ¾Ð²Ð°ÑÑ Ð¿Ð¾ Ð´Ð°ÑÐµ Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸'; }
            });
          }
          function attachAllocRowHandlers(row) {
            var prodSel = row.querySelector('.alloc-product');
            var qtyInp = row.querySelector('.alloc-qty');
            var batchSel = row.querySelector('.alloc-batch');
            var removeBtn = row.querySelector('.alloc-remove');
            if (prodSel) prodSel.onchange = function () { updateRowFromStock(row); updateTotals(); };
            if (qtyInp) qtyInp.oninput = function () { updateRowFromStock(row); updateTotals(); };
            if (batchSel) batchSel.onchange = function () { updateRowFromStock(row); updateTotals(); };
            if (removeBtn) removeBtn.onclick = function () { row.remove(); updateTotals(); };
          }
          document.getElementById('allocWhFrom').onchange = function () {
            loadStock(this.value).then(function () {
              var rows = document.querySelectorAll('.alloc-row');
              var prodOptsHtml = buildProductOptionsFromStock();
              rows.forEach(function (row) {
                var prodSel = row.querySelector('.alloc-product');
                if (prodSel) {
                  var prev = prodSel.value || '';
                  prodSel.innerHTML = prodOptsHtml;
                  if (prev) {
                    var opt = prodSel.querySelector('option[value="' + prev.replace(/"/g, '&quot;') + '"]');
                    if (opt) prodSel.value = prev;
                  }
                }
                updateRowFromStock(row);
              });
              updateTotals();
            });
          };
          var expSel = document.getElementById('allocExpeditor');
          if (expSel) {
            expSel.onchange = function () {
              var login = this.value || '';
              var whToSel = document.getElementById('allocWhTo');
              if (!whToSel) return;
              var match = null;
              if (login) {
                (warehousesList || []).forEach(function (w) {
                  if (!match && w.expeditor_login && w.expeditor_login === login) match = w;
                });
              }
              if (match && match.code) {
                // ÐÐ²ÑÐ¾Ð¿Ð¾Ð´ÑÑÐ°Ð½Ð¾Ð²ÐºÐ° ÑÐºÐ»Ð°Ð´Ð° Ð¿Ð¾ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÑ, Ð¿Ð¾Ð»Ðµ ÑÐ¾Ð»ÑÐºÐ¾ Ð´Ð»Ñ Ð¿ÑÐ¾ÑÐ¼Ð¾ÑÑÐ° (ÑÐµÑÐ¾Ðµ)
                whToSel.value = match.code;
              } else {
                // ÐÑÐ»Ð¸ ÑÐ²ÑÐ·ÐºÐ¸ Ð½ÐµÑ â Ð¾ÑÐ¸ÑÐ°ÐµÐ¼ Ð¿Ð¾Ð»Ðµ
                whToSel.value = '';
              }
            };
          }
          var allocPullBtn = document.getElementById('allocPullByDate');
          if (allocPullBtn) {
            allocPullBtn.onclick = function () { pullAllocationByDate({ skipConfirm: false, dateChangeMode: false }); };
          }
          if (allocDeliveryDateEl) {
            allocDeliveryDateEl.onchange = function () {
              var newVal = (this.value || '').trim();
              if (!newVal) { lastAllocDeliveryDateValue = ''; return; }
              if (hasAllocationRowsData()) {
                var ok = confirm('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ Ð´Ð°ÑÑ Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸? Ð¢ÐµÐºÑÑÐ¸Ðµ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¸ Ð±ÑÐ´ÑÑ Ð·Ð°Ð¼ÐµÐ½ÐµÐ½Ñ.');
                if (!ok) {
                  this.value = lastAllocDeliveryDateValue;
                  return;
                }
              }
              lastAllocDeliveryDateValue = newVal;
              pullAllocationByDate({ skipConfirm: true, dateChangeMode: true });
            };
          }
          var firstRow = document.querySelector('.alloc-row');
          if (firstRow) attachAllocRowHandlers(firstRow);
          document.getElementById('allocAddRow').onclick = function () {
            addAllocationRow(null);
          };
          document.getElementById('allocCancel').onclick = function () { loadSectionOperations(false); };
          document.getElementById('allocSave').onclick = function () {
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            var whFrom = document.getElementById('allocWhFrom').value;
            var whTo = document.getElementById('allocWhTo').value;
            var expeditor = document.getElementById('allocExpeditor').value;
            if (errEl) errEl.textContent = '';
            if (!whFrom || !whTo) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´Ñ Ð¾Ñ Ð¸ Ð².'; return; }
            if (!expeditor) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°.'; return; }
            var rows = document.querySelectorAll('.alloc-row');
            var items = [];
            rows.forEach(function (row) {
              var prodSel = row.querySelector('.alloc-product');
              var batchSel = row.querySelector('.alloc-batch');
              var qtyInp = row.querySelector('.alloc-qty');
              if (!prodSel || !batchSel || !qtyInp) return;
              var productCode = (prodSel.value || '').trim();
              var batchCode = (batchSel.value || '').trim();
              var qty = parseInt(qtyInp.value || '0', 10) || 0;
              if (!productCode || !batchCode || !qty) return;
              var opt = batchSel.options[batchSel.selectedIndex] || null;
              var available = opt ? parseInt(opt.getAttribute('data-available') || '0', 10) || 0 : 0;
              if (qty > available) qty = available;
              items.push({ product_code: productCode, batch_code: batchCode, quantity: qty });
            });
            if (!items.length) { if (errEl) errEl.textContent = 'ÐÐ¾Ð±Ð°Ð²ÑÑÐµ ÑÐ¾ÑÑ Ð±Ñ Ð¾Ð´Ð¸Ð½ ÑÐ¾Ð²Ð°Ñ.'; return; }
            var comment = (document.getElementById('allocComment').value || '').trim() || null;
            var createdBy = (window.currentUser && window.currentUser.login) ? window.currentUser.login : null;
            var saveBtn = document.getElementById('allocSave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            var createdCount = 0;
            var idx = 0;
            function createNext() {
              if (idx >= items.length) {
                if (msgEl) { msgEl.textContent = 'ÐÐ¿ÐµÑÐ°ÑÐ¸Ð¸ ÑÐ¾Ð·Ð´Ð°Ð½Ñ: ' + createdCount + ' ÑÑ.'; msgEl.style.display = 'block'; }
                setTimeout(function () { loadSectionOperations(false); }, 1500);
                return;
              }
              var it = items[idx++];
              api('/api/v1/operations/allocation', {
                method: 'POST',
                body: JSON.stringify({
                  warehouse_from: whFrom,
                  warehouse_to: whTo,
                  product_code: it.product_code,
                  batch_code: it.batch_code,
                  quantity: it.quantity,
                  expeditor_login: expeditor,
                  created_by: createdBy,
                  comment: comment
                })
              }).then(function () {
                createdCount += 1;
                createNext();
              }).catch(function (e) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) {
                  var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                  if (errEl) errEl.textContent = errs.join('; ');
                } else if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
              });
            }
            createNext();
          };
        }
        function buildWriteOffForm(config, products, warehouses, userList) {
          var content = document.getElementById('content');
          if (!content) return;
          var warehousesList = warehouses || [];
          var productsList = products || [];
          var productsMap = {}; productsList.forEach(function (p) { productsMap[p.code] = p; });
          var whOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ â</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var formHtml = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸: ' + escAttr(config.operation_name || 'Ð¡Ð¿Ð¸ÑÐ°Ð½Ð¸Ðµ ÑÐ¾Ð²Ð°ÑÐ°') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ <span style="color:#c00">*</span></label><select id="writeOffWh" required>' + whOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">Ð¢Ð¾Ð²Ð°ÑÑ Ð´Ð»Ñ ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ñ</h3><p style="color:#666;font-size:13px;margin-bottom:8px">ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ â Ð¿Ð¾Ð´ÑÑÐ½ÑÑÑÑ Ð¾ÑÑÐ°ÑÐºÐ¸ Ð¿Ð¾ Ð¿Ð°ÑÑÐ¸ÑÐ¼.</p><div style="overflow-x:auto"><table id="writeOffItemsTable" style="width:100%"><thead><tr><th>Ð¢Ð¾Ð²Ð°Ñ</th><th>ÐÐ°ÑÑÐ¸Ñ</th><th>Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸</th><th>ÐÐ½ÐµÐ¹ Ð¾ÑÑÐ°Ð»Ð¾ÑÑ</th><th>ÐÐ¾ÑÑÑÐ¿Ð½Ð¾</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ Ðº ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ñ</th><th>ÐÐµÑ</th><th>Ð¦ÐµÐ½Ð°</th><th>Ð¡ÑÐ¼Ð¼Ð°</th></tr></thead><tbody id="writeOffItemsBody"></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="5" style="text-align:right;padding:8px">ÐÑÐ¾Ð³Ð¾:</td><td id="writeOffTotalQty" style="text-align:right;padding:8px">0</td><td id="writeOffTotalWeight" style="text-align:right;padding:8px">â</td><td></td><td id="writeOffTotalSum" style="text-align:right;padding:8px">0</td></tr></tfoot></table></div></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="writeOffComment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="writeOffSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</button> <button type="button" class="btn btn-secondary" id="writeOffCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
          content.innerHTML = formHtml;
          var stockCache = [];
          function loadStock(whCode) {
            if (!whCode) { stockCache = []; return Promise.resolve(); }
            return api('/api/v1/warehouse/stock?warehouse=' + encodeURIComponent(whCode)).then(function (resp) {
              stockCache = (resp && resp.success && Array.isArray(resp.data)) ? resp.data : [];
              stockCache.sort(function (a, b) {
                var da = a.days_until_expiry != null ? a.days_until_expiry : 1e9;
                var db = b.days_until_expiry != null ? b.days_until_expiry : 1e9;
                return da - db;
              });
            }).catch(function () { stockCache = []; });
          }
          function renderWriteOffTable() {
            var tbody = document.getElementById('writeOffItemsBody');
            var wh = document.getElementById('writeOffWh').value;
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!wh || !stockCache.length) {
              if (!wh) tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´</td></tr>';
              else tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">ÐÐµÑ Ð¾ÑÑÐ°ÑÐºÐ¾Ð² Ð½Ð° ÑÐºÐ»Ð°Ð´Ðµ</td></tr>';
              document.getElementById('writeOffTotalQty').textContent = '0';
              document.getElementById('writeOffTotalSum').textContent = '0';
              document.getElementById('writeOffTotalWeight').textContent = 'â';
              return;
            }
            var totalQty = 0, totalSum = 0, totalWeightG = 0;
            stockCache.forEach(function (s) {
              var productName = (s.product_name || s.product_code || '');
              var expiry = s.expiry_date ? formatDateOnly(s.expiry_date) : 'â';
              var days = s.days_until_expiry != null ? s.days_until_expiry : 'â';
              var avail = s.total_qty != null ? s.total_qty : 0;
              var price = s.unit_price != null ? parseFloat(s.unit_price) : 0;
              var weightG = s.weight_g != null ? parseInt(s.weight_g, 10) : 0;
              var status = s.expiry_status || {};
              var color = status.color || '';
              var icon = status.icon || '';
              var daysHtml = (days === 'â' || days === '') ? 'â' : '<span class="badge" style="background-color:' + (color === 'YELLOW' ? '#ffc107' : color === 'RED' ? '#dc3545' : color === 'BLACK' ? '#343a40' : '#28a745') + ';color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;">' + (icon || '') + ' ' + days + ' Ð´Ð½.</span>';
              var row = document.createElement('tr');
              row.className = 'writeoff-row';
              row.setAttribute('data-product-code', s.product_code || '');
              row.setAttribute('data-batch-code', s.batch_code || '');
              row.setAttribute('data-available', String(avail));
              row.setAttribute('data-price', String(price));
              row.setAttribute('data-weight-g', String(weightG));
              row.innerHTML = '<td>' + escAttr(productName) + '</td><td>' + escAttr(s.batch_code || '') + '</td><td>' + expiry + '</td><td style="text-align:center">' + daysHtml + '</td><td style="text-align:right">' + avail + '</td><td><input type="number" class="writeoff-qty" min="0" max="' + avail + '" value="0" data-available="' + avail + '"></td><td class="writeoff-weight" style="text-align:right">â</td><td class="writeoff-price" style="text-align:right">' + (price ? price.toFixed(2) : 'â') + '</td><td class="writeoff-sum" style="text-align:right">0</td>';
              var qtyInp = row.querySelector('.writeoff-qty');
              var weightCell = row.querySelector('.writeoff-weight');
              var sumCell = row.querySelector('.writeoff-sum');
              function upd() {
                var q = parseInt(qtyInp.value || '0', 10) || 0;
                var maxA = parseInt(qtyInp.getAttribute('data-available') || '0', 10) || 0;
                if (q > maxA) { q = maxA; qtyInp.value = q || ''; }
                var sum = price * q;
                sumCell.textContent = sum ? sum.toFixed(2) : '0';
                if (weightG > 0 && q > 0) weightCell.textContent = ((weightG * q) / 1000).toFixed(2) + ' ÐºÐ³'; else weightCell.textContent = 'â';
                updateWriteOffTotals();
              }
              qtyInp.oninput = upd;
              qtyInp.onchange = upd;
              tbody.appendChild(row);
            });
            updateWriteOffTotals();
          }
          function updateWriteOffTotals() {
            var totalQty = 0, totalSum = 0, totalWeightG = 0;
            document.querySelectorAll('.writeoff-row').forEach(function (row) {
              var qtyInp = row.querySelector('.writeoff-qty');
              var code = row.getAttribute('data-product-code');
              var price = parseFloat(row.getAttribute('data-price') || '0') || 0;
              var wg = parseInt(row.getAttribute('data-weight-g') || '0', 10) || 0;
              var q = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              totalQty += q;
              totalSum += price * q;
              totalWeightG += wg * q;
            });
            document.getElementById('writeOffTotalQty').textContent = totalQty;
            document.getElementById('writeOffTotalSum').textContent = totalSum ? totalSum.toFixed(2) : '0';
            var wEl = document.getElementById('writeOffTotalWeight');
            if (totalWeightG > 0) wEl.textContent = (totalWeightG / 1000).toFixed(2) + ' ÐºÐ³'; else wEl.textContent = 'â';
          }
          document.getElementById('writeOffWh').onchange = function () {
            loadStock(this.value).then(renderWriteOffTable);
          };
          document.getElementById('writeOffCancel').onclick = function () { loadSectionOperations(false); };
          document.getElementById('writeOffSave').onclick = function () {
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            var wh = document.getElementById('writeOffWh').value;
            var comment = (document.getElementById('writeOffComment').value || '').trim() || null;
            var createdBy = (window.currentUser && window.currentUser.login) ? window.currentUser.login : ((currentUser && currentUser.login) ? currentUser.login : null);
            if (errEl) errEl.textContent = '';
            if (!wh) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´.'; return; }
            if (!createdBy) { if (errEl) errEl.textContent = 'ÐÐµ Ð¾Ð¿ÑÐµÐ´ÐµÐ»ÐµÐ½ ÑÐµÐºÑÑÐ¸Ð¹ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ.'; return; }
            var items = [];
            document.querySelectorAll('.writeoff-row').forEach(function (row) {
              var qtyInp = row.querySelector('.writeoff-qty');
              var q = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              if (q <= 0) return;
              items.push({
                product_code: row.getAttribute('data-product-code') || '',
                batch_code: row.getAttribute('data-batch-code') || '',
                quantity: q
              });
            });
            if (!items.length) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ Ðº ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ñ ÑÐ¾ÑÑ Ð±Ñ Ð¿Ð¾ Ð¾Ð´Ð½Ð¾Ð¹ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¸.'; return; }
            var saveBtn = document.getElementById('writeOffSave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            var createdCount = 0, idx = 0;
            function createNext() {
              if (idx >= items.length) {
                if (msgEl) { msgEl.textContent = 'Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¾ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹ ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ñ: ' + createdCount; msgEl.style.display = 'block'; }
                setTimeout(function () { loadSectionOperations(false); }, 1500);
                return;
              }
              var it = items[idx++];
              api('/api/v1/operations/write_off', { method: 'POST', body: JSON.stringify({ warehouse_from: wh, product_code: it.product_code, batch_code: it.batch_code, quantity: it.quantity, created_by: createdBy, comment: comment }) }).then(function () {
                createdCount += 1;
                createNext();
              }).catch(function (e) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) { var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]); if (errEl) errEl.textContent = errs.join('; '); }
                else if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
              });
            }
            createNext();
          };
        }
        function buildTransferForm(config, products, warehouses, userList) {
          var content = document.getElementById('content');
          if (!content) return;
          var warehousesList = warehouses || [];
          var productsList = products || [];
          var productsMap = {}; productsList.forEach(function (p) { productsMap[p.code] = p; });
          var whOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ â</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var formHtml = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸: ' + escAttr(config.operation_name || 'ÐÐµÑÐµÐ¼ÐµÑÐµÐ½Ð¸Ðµ Ð¼ÐµÐ¶Ð´Ñ ÑÐºÐ»Ð°Ð´Ð°Ð¼Ð¸') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ <span style="color:#c00">*</span></label><select id="transferWhFrom" required>' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð² <span style="color:#c00">*</span></label><select id="transferWhTo" required>' + whOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">Ð¢Ð¾Ð²Ð°ÑÑ Ð´Ð»Ñ Ð¿ÐµÑÐµÐ¼ÐµÑÐµÐ½Ð¸Ñ</h3><p style="color:#666;font-size:13px;margin-bottom:8px">ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´Ñ â Ð¿Ð¾Ð´ÑÑÐ½ÑÑÑÑ Ð¾ÑÑÐ°ÑÐºÐ¸ Ð¿Ð¾ Ð¿Ð°ÑÑÐ¸ÑÐ¼ ÑÐ¾ ÑÐºÐ»Ð°Ð´Ð° Â«Ð¾ÑÂ».</p><div style="overflow-x:auto"><table id="transferItemsTable" style="width:100%"><thead><tr><th>Ð¢Ð¾Ð²Ð°Ñ</th><th>ÐÐ°ÑÑÐ¸Ñ</th><th>Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸</th><th>ÐÐ½ÐµÐ¹ Ð¾ÑÑÐ°Ð»Ð¾ÑÑ</th><th>ÐÐ¾ÑÑÑÐ¿Ð½Ð¾</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ Ðº Ð¿ÐµÑÐµÐ¼ÐµÑÐµÐ½Ð¸Ñ</th><th>ÐÐµÑ</th><th>Ð¦ÐµÐ½Ð°</th><th>Ð¡ÑÐ¼Ð¼Ð°</th></tr></thead><tbody id="transferItemsBody"></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="5" style="text-align:right;padding:8px">ÐÑÐ¾Ð³Ð¾:</td><td id="transferTotalQty" style="text-align:right;padding:8px">0</td><td id="transferTotalWeight" style="text-align:right;padding:8px">â</td><td></td><td id="transferTotalSum" style="text-align:right;padding:8px">0</td></tr></tfoot></table></div></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="transferComment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="transferSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</button> <button type="button" class="btn btn-secondary" id="transferCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
          content.innerHTML = formHtml;
          var stockCache = [];
          function loadStock(whCode) {
            if (!whCode) { stockCache = []; return Promise.resolve(); }
            return api('/api/v1/warehouse/stock?warehouse=' + encodeURIComponent(whCode)).then(function (resp) {
              stockCache = (resp && resp.success && Array.isArray(resp.data)) ? resp.data : [];
            }).catch(function () { stockCache = []; });
          }
          function renderTransferTable() {
            var tbody = document.getElementById('transferItemsBody');
            var whFrom = document.getElementById('transferWhFrom').value;
            var whTo = document.getElementById('transferWhTo').value;
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!whFrom || !whTo || whFrom === whTo || !stockCache.length) {
              if (!whFrom || !whTo) tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ Ð¾Ñ Ð¸ ÑÐºÐ»Ð°Ð´ Ð²</td></tr>';
              else if (whFrom === whTo) tbody.innerHTML = '<tr><td colspan="9" style="color:#c00;padding:12px">Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ Ð¸ ÑÐºÐ»Ð°Ð´ Ð² Ð½Ðµ Ð´Ð¾Ð»Ð¶Ð½Ñ ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÑÑ</td></tr>';
              else tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">ÐÐµÑ Ð¾ÑÑÐ°ÑÐºÐ¾Ð² Ð½Ð° ÑÐºÐ»Ð°Ð´Ðµ Â«Ð¾ÑÂ»</td></tr>';
              document.getElementById('transferTotalQty').textContent = '0';
              document.getElementById('transferTotalSum').textContent = '0';
              document.getElementById('transferTotalWeight').textContent = 'â';
              return;
            }
            stockCache.forEach(function (s) {
              var productName = (s.product_name || s.product_code || '');
              var expiry = s.expiry_date ? formatDateOnly(s.expiry_date) : 'â';
              var days = s.days_until_expiry != null ? s.days_until_expiry : 'â';
              var avail = s.total_qty != null ? s.total_qty : 0;
              var price = s.unit_price != null ? parseFloat(s.unit_price) : 0;
              var weightG = s.weight_g != null ? parseInt(s.weight_g, 10) : 0;
              var status = s.expiry_status || {};
              var color = status.color || '';
              var icon = status.icon || '';
              var daysHtml = (days === 'â' || days === '') ? 'â' : '<span class="badge" style="background-color:' + (color === 'YELLOW' ? '#ffc107' : color === 'RED' ? '#dc3545' : color === 'BLACK' ? '#343a40' : '#28a745') + ';color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;">' + (icon || '') + ' ' + days + ' Ð´Ð½.</span>';
              var row = document.createElement('tr');
              row.className = 'transfer-row';
              row.setAttribute('data-product-code', s.product_code || '');
              row.setAttribute('data-batch-code', s.batch_code || '');
              row.setAttribute('data-available', String(avail));
              row.setAttribute('data-price', String(price));
              row.setAttribute('data-weight-g', String(weightG));
              row.innerHTML = '<td>' + escAttr(productName) + '</td><td>' + escAttr(s.batch_code || '') + '</td><td>' + expiry + '</td><td style="text-align:center">' + daysHtml + '</td><td style="text-align:right">' + avail + '</td><td><input type="number" class="transfer-qty" min="0" max="' + avail + '" value="0" data-available="' + avail + '"></td><td class="transfer-weight" style="text-align:right">â</td><td class="transfer-price" style="text-align:right">' + (price ? price.toFixed(2) : 'â') + '</td><td class="transfer-sum" style="text-align:right">0</td>';
              var qtyInp = row.querySelector('.transfer-qty');
              var weightCell = row.querySelector('.transfer-weight');
              var sumCell = row.querySelector('.transfer-sum');
              function upd() {
                var q = parseInt(qtyInp.value || '0', 10) || 0;
                var maxA = parseInt(qtyInp.getAttribute('data-available') || '0', 10) || 0;
                if (q > maxA) { q = maxA; qtyInp.value = q || ''; }
                sumCell.textContent = price * q ? (price * q).toFixed(2) : '0';
                if (weightG > 0 && q > 0) weightCell.textContent = ((weightG * q) / 1000).toFixed(2) + ' ÐºÐ³'; else weightCell.textContent = 'â';
                updateTransferTotals();
              }
              qtyInp.oninput = upd;
              qtyInp.onchange = upd;
              tbody.appendChild(row);
            });
            updateTransferTotals();
          }
          function updateTransferTotals() {
            var totalQty = 0, totalSum = 0, totalWeightG = 0;
            document.querySelectorAll('.transfer-row').forEach(function (row) {
              var qtyInp = row.querySelector('.transfer-qty');
              var price = parseFloat(row.getAttribute('data-price') || '0') || 0;
              var wg = parseInt(row.getAttribute('data-weight-g') || '0', 10) || 0;
              var q = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              totalQty += q;
              totalSum += price * q;
              totalWeightG += wg * q;
            });
            document.getElementById('transferTotalQty').textContent = totalQty;
            document.getElementById('transferTotalSum').textContent = totalSum ? totalSum.toFixed(2) : '0';
            var wEl = document.getElementById('transferTotalWeight');
            if (totalWeightG > 0) wEl.textContent = (totalWeightG / 1000).toFixed(2) + ' ÐºÐ³'; else wEl.textContent = 'â';
          }
          document.getElementById('transferWhFrom').onchange = function () {
            var whFrom = this.value;
            if (whFrom) loadStock(whFrom).then(renderTransferTable); else renderTransferTable();
          };
          document.getElementById('transferWhTo').onchange = renderTransferTable;
          document.getElementById('transferCancel').onclick = function () { loadSectionOperations(false); };
          document.getElementById('transferSave').onclick = function () {
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            var whFrom = document.getElementById('transferWhFrom').value;
            var whTo = document.getElementById('transferWhTo').value;
            var comment = (document.getElementById('transferComment').value || '').trim() || null;
            var createdBy = (currentUser && currentUser.login) ? currentUser.login : null;
            if (errEl) errEl.textContent = '';
            if (!whFrom || !whTo) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ Ð¾Ñ Ð¸ ÑÐºÐ»Ð°Ð´ Ð².'; return; }
            if (whFrom === whTo) { if (errEl) errEl.textContent = 'Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ Ð¸ ÑÐºÐ»Ð°Ð´ Ð² Ð½Ðµ Ð´Ð¾Ð»Ð¶Ð½Ñ ÑÐ¾Ð²Ð¿Ð°Ð´Ð°ÑÑ.'; return; }
            if (!createdBy) { if (errEl) errEl.textContent = 'ÐÐµ Ð¾Ð¿ÑÐµÐ´ÐµÐ»ÐµÐ½ ÑÐµÐºÑÑÐ¸Ð¹ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ.'; return; }
            var items = [];
            document.querySelectorAll('.transfer-row').forEach(function (row) {
              var qtyInp = row.querySelector('.transfer-qty');
              var q = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              if (q <= 0) return;
              items.push({ product_code: row.getAttribute('data-product-code') || '', batch_code: row.getAttribute('data-batch-code') || '', quantity: q });
            });
            if (!items.length) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ Ðº Ð¿ÐµÑÐµÐ¼ÐµÑÐµÐ½Ð¸Ñ ÑÐ¾ÑÑ Ð±Ñ Ð¿Ð¾ Ð¾Ð´Ð½Ð¾Ð¹ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¸.'; return; }
            var saveBtn = document.getElementById('transferSave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            var createdCount = 0, idx = 0;
            function createNext() {
              if (idx >= items.length) {
                if (msgEl) { msgEl.textContent = 'Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¾ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹ Ð¿ÐµÑÐµÐ¼ÐµÑÐµÐ½Ð¸Ñ: ' + createdCount; msgEl.style.display = 'block'; }
                setTimeout(function () { loadSectionOperations(false); }, 1500);
                return;
              }
              var it = items[idx++];
              api('/api/v1/operations/transfer', { method: 'POST', body: JSON.stringify({ warehouse_from: whFrom, warehouse_to: whTo, product_code: it.product_code, batch_code: it.batch_code, quantity: it.quantity, created_by: createdBy, comment: comment }) }).then(function () {
                createdCount += 1;
                createNext();
              }).catch(function (e) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) { var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]); if (errEl) errEl.textContent = errs.join('; '); }
                else if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
              });
            }
            createNext();
          };
        }
        function buildPromotionalSampleForm(config, products, warehouses, userList) {
          var content = document.getElementById('content');
          if (!content) return;
          var warehousesList = warehouses || [];
          var productsList = products || [];
          var productsMap = {}; productsList.forEach(function (p) { productsMap[p.code] = p; });
          var whOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ â</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var expOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ° â</option>';
          (userList || []).forEach(function (u) {
            if ((u.role || '').toLowerCase() !== 'expeditor') return;
            expOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>';
          });
          var formHtml = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸: ' + escAttr(config.operation_name || 'Ð Ð°Ð·Ð´Ð°ÑÐ° Ð¾Ð±ÑÐ°Ð·ÑÐ¾Ð²') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          formHtml += '<div class="form-group"><label>Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ <span style="color:#c00">*</span></label><select id="sampleExpeditor" required>' + expOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð² <span style="color:#c00">*</span></label><select id="sampleWhTo" required disabled style="background:#eee;color:#555">' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ <span style="color:#c00">*</span></label><select id="sampleWhFrom" required>' + whOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">ÐÐ±ÑÐ°Ð·ÑÑ</h3><p style="color:#666;font-size:13px;margin-bottom:8px">ÐÑÑÐ°ÑÐºÐ¸ Ð¾ÑÑÐ¾ÑÑÐ¸ÑÐ¾Ð²Ð°Ð½Ñ Ð¾Ñ Ð¿ÑÐ¾ÑÑÐ¾ÑÐµÐ½Ð½ÑÑ Ðº Ð½Ð¾ÑÐ¼Ð°Ð»ÑÐ½ÑÐ¼. Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ Ð¾Ð±ÑÐ°Ð·ÑÐ¾Ð².</p><div style="overflow-x:auto"><table id="sampleItemsTable" style="width:100%"><thead><tr><th>Ð¢Ð¾Ð²Ð°Ñ</th><th>ÐÐ°ÑÑÐ¸Ñ</th><th>Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸</th><th>ÐÐ½ÐµÐ¹ Ð¾ÑÑÐ°Ð»Ð¾ÑÑ</th><th>ÐÐ¾ÑÑÑÐ¿Ð½Ð¾</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ Ð¾Ð±ÑÐ°Ð·ÑÐ¾Ð²</th><th>ÐÐµÑ</th><th>Ð¦ÐµÐ½Ð°</th><th>Ð¡ÑÐ¼Ð¼Ð°</th></tr></thead><tbody id="sampleItemsBody"></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="5" style="text-align:right;padding:8px">ÐÑÐ¾Ð³Ð¾:</td><td id="sampleTotalQty" style="text-align:right;padding:8px">0</td><td id="sampleTotalWeight" style="text-align:right;padding:8px">â</td><td></td><td id="sampleTotalSum" style="text-align:right;padding:8px">0</td></tr></tfoot></table></div></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="sampleComment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="sampleSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</button> <button type="button" class="btn btn-secondary" id="sampleCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
          content.innerHTML = formHtml;
          var stockCache = [];
          function loadStock(whCode) {
            if (!whCode) { stockCache = []; return Promise.resolve(); }
            return api('/api/v1/warehouse/stock?warehouse=' + encodeURIComponent(whCode)).then(function (resp) {
              stockCache = (resp && resp.success && Array.isArray(resp.data)) ? resp.data : [];
              stockCache.sort(function (a, b) {
                var da = a.days_until_expiry != null ? a.days_until_expiry : 1e9;
                var db = b.days_until_expiry != null ? b.days_until_expiry : 1e9;
                return da - db;
              });
            }).catch(function () { stockCache = []; });
          }
          function renderSampleTable() {
            var tbody = document.getElementById('sampleItemsBody');
            var whFrom = document.getElementById('sampleWhFrom').value;
            var whTo = document.getElementById('sampleWhTo').value;
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!whFrom || !whTo || !stockCache.length) {
              if (!whTo) tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">Ð¡Ð½Ð°ÑÐ°Ð»Ð° Ð²ÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ° (ÑÐºÐ»Ð°Ð´ Ð² Ð·Ð°Ð¿Ð¾Ð»Ð½Ð¸ÑÑÑ Ð°Ð²ÑÐ¾Ð¼Ð°ÑÐ¸ÑÐµÑÐºÐ¸)</td></tr>';
              else if (!whFrom) tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ Ð¾Ñ</td></tr>';
              else tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">ÐÐµÑ Ð¾ÑÑÐ°ÑÐºÐ¾Ð² Ð½Ð° ÑÐºÐ»Ð°Ð´Ðµ</td></tr>';
              document.getElementById('sampleTotalQty').textContent = '0';
              document.getElementById('sampleTotalSum').textContent = '0';
              document.getElementById('sampleTotalWeight').textContent = 'â';
              return;
            }
            stockCache.forEach(function (s) {
              var productName = (s.product_name || s.product_code || '');
              var expiry = s.expiry_date ? formatDateOnly(s.expiry_date) : 'â';
              var days = s.days_until_expiry != null ? s.days_until_expiry : 'â';
              var avail = s.total_qty != null ? s.total_qty : 0;
              var price = s.unit_price != null ? parseFloat(s.unit_price) : 0;
              var weightG = s.weight_g != null ? parseInt(s.weight_g, 10) : 0;
              var status = s.expiry_status || {};
              var color = status.color || '';
              var icon = status.icon || '';
              var daysHtml = (days === 'â' || days === '') ? 'â' : '<span class="badge" style="background-color:' + (color === 'YELLOW' ? '#ffc107' : color === 'RED' ? '#dc3545' : color === 'BLACK' ? '#343a40' : '#28a745') + ';color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;">' + (icon || '') + ' ' + days + ' Ð´Ð½.</span>';
              var row = document.createElement('tr');
              row.className = 'sample-row';
              row.setAttribute('data-product-code', s.product_code || '');
              row.setAttribute('data-batch-code', s.batch_code || '');
              row.setAttribute('data-available', String(avail));
              row.setAttribute('data-price', String(price));
              row.setAttribute('data-weight-g', String(weightG));
              row.innerHTML = '<td>' + escAttr(productName) + '</td><td>' + escAttr(s.batch_code || '') + '</td><td>' + expiry + '</td><td style="text-align:center">' + daysHtml + '</td><td style="text-align:right">' + avail + '</td><td><input type="number" class="sample-qty" min="0" max="' + avail + '" value="0" data-available="' + avail + '"></td><td class="sample-weight" style="text-align:right">â</td><td class="sample-price" style="text-align:right">' + (price ? price.toFixed(2) : 'â') + '</td><td class="sample-sum" style="text-align:right">0</td>';
              var qtyInp = row.querySelector('.sample-qty');
              var weightCell = row.querySelector('.sample-weight');
              var sumCell = row.querySelector('.sample-sum');
              function upd() {
                var q = parseInt(qtyInp.value || '0', 10) || 0;
                var maxA = parseInt(qtyInp.getAttribute('data-available') || '0', 10) || 0;
                if (q > maxA) { q = maxA; qtyInp.value = q || ''; }
                sumCell.textContent = price * q ? (price * q).toFixed(2) : '0';
                if (weightG > 0 && q > 0) weightCell.textContent = ((weightG * q) / 1000).toFixed(2) + ' ÐºÐ³'; else weightCell.textContent = 'â';
                updateSampleTotals();
              }
              qtyInp.oninput = upd;
              qtyInp.onchange = upd;
              tbody.appendChild(row);
            });
            updateSampleTotals();
          }
          function updateSampleTotals() {
            var totalQty = 0, totalSum = 0, totalWeightG = 0;
            document.querySelectorAll('.sample-row').forEach(function (row) {
              var qtyInp = row.querySelector('.sample-qty');
              var price = parseFloat(row.getAttribute('data-price') || '0') || 0;
              var wg = parseInt(row.getAttribute('data-weight-g') || '0', 10) || 0;
              var q = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              totalQty += q;
              totalSum += price * q;
              totalWeightG += wg * q;
            });
            document.getElementById('sampleTotalQty').textContent = totalQty;
            document.getElementById('sampleTotalSum').textContent = totalSum ? totalSum.toFixed(2) : '0';
            var wEl = document.getElementById('sampleTotalWeight');
            if (totalWeightG > 0) wEl.textContent = (totalWeightG / 1000).toFixed(2) + ' ÐºÐ³'; else wEl.textContent = 'â';
          }
          document.getElementById('sampleExpeditor').onchange = function () {
            var login = this.value || '';
            var whToSel = document.getElementById('sampleWhTo');
            var match = null;
            if (login) warehousesList.forEach(function (w) { if (!match && w.expeditor_login === login) match = w; });
            if (match && match.code) whToSel.value = match.code; else whToSel.value = '';
            renderSampleTable();
          };
          document.getElementById('sampleWhFrom').onchange = function () {
            loadStock(this.value).then(renderSampleTable);
          };
          document.getElementById('sampleCancel').onclick = function () { loadSectionOperations(false); };
          document.getElementById('sampleSave').onclick = function () {
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            var whFrom = document.getElementById('sampleWhFrom').value;
            var whTo = document.getElementById('sampleWhTo').value;
            var expeditor = document.getElementById('sampleExpeditor').value;
            var comment = (document.getElementById('sampleComment').value || '').trim() || null;
            var createdBy = (currentUser && currentUser.login) ? currentUser.login : null;
            if (errEl) errEl.textContent = '';
            if (!expeditor) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°.'; return; }
            if (!whTo) { if (errEl) errEl.textContent = 'Ð¡ÐºÐ»Ð°Ð´ Ð² Ð½Ðµ Ð¾Ð¿ÑÐµÐ´ÐµÐ»ÑÐ½ â Ð²ÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°, Ð¿ÑÐ¸Ð²ÑÐ·Ð°Ð½Ð½Ð¾Ð³Ð¾ Ðº ÑÐºÐ»Ð°Ð´Ñ.'; return; }
            if (!whFrom) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ Ð¾Ñ.'; return; }
            if (!createdBy) { if (errEl) errEl.textContent = 'ÐÐµ Ð¾Ð¿ÑÐµÐ´ÐµÐ»ÐµÐ½ ÑÐµÐºÑÑÐ¸Ð¹ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ.'; return; }
            var items = [];
            document.querySelectorAll('.sample-row').forEach(function (row) {
              var qtyInp = row.querySelector('.sample-qty');
              var q = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              if (q <= 0) return;
              items.push({ product_code: row.getAttribute('data-product-code') || '', batch_code: row.getAttribute('data-batch-code') || '', quantity: q });
            });
            if (!items.length) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ Ð¾Ð±ÑÐ°Ð·ÑÐ¾Ð² ÑÐ¾ÑÑ Ð±Ñ Ð¿Ð¾ Ð¾Ð´Ð½Ð¾Ð¹ Ð¿Ð¾Ð·Ð¸ÑÐ¸Ð¸.'; return; }
            var saveBtn = document.getElementById('sampleSave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            var createdCount = 0, idx = 0;
            function createNext() {
              if (idx >= items.length) {
                if (msgEl) { msgEl.textContent = 'Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¾ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹ ÑÐ°Ð·Ð´Ð°ÑÐ¸ Ð¾Ð±ÑÐ°Ð·ÑÐ¾Ð²: ' + createdCount; msgEl.style.display = 'block'; }
                setTimeout(function () { loadSectionOperations(false); }, 1500);
                return;
              }
              var it = items[idx++];
              api('/api/v1/operations/allocation', { method: 'POST', body: JSON.stringify({ warehouse_from: whFrom, warehouse_to: whTo, product_code: it.product_code, batch_code: it.batch_code, quantity: it.quantity, expeditor_login: expeditor, created_by: createdBy, comment: comment }) }).then(function () {
                createdCount += 1;
                createNext();
              }).catch(function (e) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) { var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]); if (errEl) errEl.textContent = errs.join('; '); }
                else if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
              });
            }
            createNext();
          };
        }
        function buildDeliveryForm(config, customers, products, warehouses, paymentTypes, userList) {
          var content = document.getElementById('content');
          if (!content) return;
          var warehousesList = warehouses || [];
          var productsList = products || [];
          var productsMap = {}; productsList.forEach(function (p) { productsMap[p.code] = p; });
          var whOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ â</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var expOpts = '<option value="">â ÐÐµ ÑÐºÐ°Ð·Ð°Ð½ â</option>';
          (userList || []).forEach(function (u) {
            if ((u.role || '').toLowerCase() !== 'expeditor') return;
            expOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' â ' + u.fio : '')) + '</option>';
          });
          var custOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ° â</option>';
          customers.forEach(function (c) { custOpts += '<option value="' + (c.id != null ? c.id : '') + '">' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          var payOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ â</option>';
          paymentTypes.forEach(function (pt) { payOpts += '<option value="' + escAttr(pt.code) + '">' + escAttr(pt.name || pt.code) + '</option>'; });
          var formHtml = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸: ' + escAttr(config.operation_name || 'ÐÐ¾ÑÑÐ°Ð²ÐºÐ° ÐºÐ»Ð¸ÐµÐ½ÑÑ') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          formHtml += '<div class="form-group"><label>ÐÐ°ÐºÐ°Ð· â <span style="color:#c00">*</span></label><div style="display:flex;gap:8px;align-items:center"><input type="number" id="deliveryOrderId" min="1" required placeholder="ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð½Ð¾Ð¼ÐµÑ Ð·Ð°ÐºÐ°Ð·Ð° Ð¸Ð»Ð¸ Ð½Ð°Ð¹Ð´Ð¸ÑÐµ" autocomplete="off" style="flex:1"><button type="button" class="btn btn-secondary" id="deliveryOrderSearchBtn">ÐÐ°Ð¹ÑÐ¸ Ð·Ð°ÐºÐ°Ð·</button></div></div>';
          formHtml += '<div id="deliveryOrderInfo" style="margin-bottom:16px;display:none"></div>';
          formHtml += '<div class="form-group"><label>Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ <span style="color:#c00">*</span></label><select id="deliveryWhFrom" required>' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ <span style="color:#c00">*</span></label><select id="deliveryExpeditor" required>' + expOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ <span style="color:#c00">*</span></label><select id="deliveryCustomer" required>' + custOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ <span style="color:#c00">*</span></label><select id="deliveryPaymentType" required>' + payOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">Ð¢Ð¾Ð²Ð°ÑÑ Ð·Ð°ÐºÐ°Ð·Ð°</h3><div style="overflow-x:auto"><table id="deliveryItemsTable" style="width:100%"><thead><tr><th>Ð¢Ð¾Ð²Ð°Ñ</th><th>ÐÐ°ÑÑÐ¸Ñ</th><th>Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸</th><th>ÐÐ½ÐµÐ¹ Ð¾ÑÑÐ°Ð»Ð¾ÑÑ</th><th>ÐÐ¾ÑÑÑÐ¿Ð½Ð¾</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ (Ð·Ð°ÐºÐ°Ð·)</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ (Ð´Ð¾ÑÑÐ°Ð²ÐºÐ°)</th><th>Ð¦ÐµÐ½Ð°</th><th>Ð¡ÑÐ¼Ð¼Ð°</th></tr></thead><tbody id="deliveryItemsBody"></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="6" style="text-align:right;padding:8px">ÐÑÐ¾Ð³Ð¾:</td><td id="deliveryTotalQty" style="text-align:right;padding:8px">0</td><td></td><td id="deliveryTotalSum" style="text-align:right;padding:8px">0</td><td></td></tr></tfoot></table></div></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="deliveryComment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="deliverySave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</button> <button type="button" class="btn btn-secondary" id="deliveryCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
          content.innerHTML = formHtml;
          var orderData = null;
          var stockCache = null;
          function loadStock(whCode) {
            if (!whCode) { stockCache = null; return Promise.resolve(); }
            return api('/api/v1/warehouse/stock?warehouse=' + encodeURIComponent(whCode)).then(function (resp) {
              stockCache = (resp && resp.success && Array.isArray(resp.data)) ? resp.data : [];
            }).catch(function () { stockCache = []; });
          }
          document.getElementById('deliveryOrderId').onchange = function () {
            var orderId = parseInt(this.value || '0', 10) || 0;
            var infoDiv = document.getElementById('deliveryOrderInfo');
            var tbody = document.getElementById('deliveryItemsBody');
            if (!orderId) {
              infoDiv.style.display = 'none';
              tbody.innerHTML = '';
              orderData = null;
              var custSel = document.getElementById('deliveryCustomer');
              var paySel = document.getElementById('deliveryPaymentType');
              var expSel = document.getElementById('deliveryExpeditor');
              var whSel = document.getElementById('deliveryWhFrom');
              if (custSel) { custSel.disabled = false; custSel.classList.remove('from-order'); }
              if (paySel) { paySel.disabled = false; paySel.classList.remove('from-order'); }
              if (expSel) { expSel.disabled = false; expSel.classList.remove('from-order'); }
              if (whSel) { whSel.disabled = false; whSel.classList.remove('from-order'); }
              return;
            }
            infoDiv.style.display = 'block';
            infoDiv.innerHTML = '<p style="color:#666">ÐÐ°Ð³ÑÑÐ·ÐºÐ° Ð·Ð°ÐºÐ°Ð·Ð°...</p>';
            api('/api/v1/orders/' + orderId).then(function (order) {
              orderData = order;
              var custSel = document.getElementById('deliveryCustomer');
              var paySel = document.getElementById('deliveryPaymentType');
              var expSel = document.getElementById('deliveryExpeditor');
              var whSel = document.getElementById('deliveryWhFrom');
              if (custSel && order.customer_id) custSel.value = String(order.customer_id);
              if (paySel && order.payment_type_code) paySel.value = order.payment_type_code;
              if (expSel && order.login_expeditor) expSel.value = order.login_expeditor;
              if (whSel && order.warehouse_from_expeditor) {
                whSel.value = order.warehouse_from_expeditor;
                whSel.disabled = true; whSel.classList.add('from-order');
              }
              var whFrom = whSel ? whSel.value : '';
              custSel.disabled = true; custSel.classList.add('from-order');
              paySel.disabled = true; paySel.classList.add('from-order');
              if (expSel) { expSel.disabled = true; expSel.classList.add('from-order'); }
              infoDiv.innerHTML = '<p style="color:#28a745;font-weight:600">ÐÐ°ÐºÐ°Ð· â' + order.order_no + ' â ' + escAttr(order.customer_name || '') + '</p><p style="color:#666;font-size:12px;margin-top:4px">Ð¡ÐºÐ»Ð°Ð´, ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ, ÐºÐ»Ð¸ÐµÐ½Ñ Ð¸ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ Ð²Ð·ÑÑÑ Ð¸Ð· Ð·Ð°ÐºÐ°Ð·Ð° (ÑÐ¾Ð»ÑÐºÐ¾ Ð´Ð»Ñ ÑÑÐµÐ½Ð¸Ñ).</p>';
              tbody.innerHTML = '';
              if (!order.items || !order.items.length) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:16px;color:#666">Ð Ð·Ð°ÐºÐ°Ð·Ðµ Ð½ÐµÑ ÑÐ¾Ð²Ð°ÑÐ¾Ð²</td></tr>';
                return;
              }
              if (whFrom) loadStock(whFrom).then(function () { renderOrderItems(order.items); });
              else renderOrderItems(order.items);
            }).catch(function (e) {
              var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) || 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð°';
              infoDiv.innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ°: ' + escAttr(msg) + '</p>';
              tbody.innerHTML = '';
              orderData = null;
            });
          };
          document.getElementById('deliveryWhFrom').onchange = function () {
            var whCode = this.value || '';
            loadStock(whCode).then(function () {
              if (orderData && orderData.items) renderOrderItems(orderData.items);
            });
          };
          function renderOrderItems(items) {
            var tbody = document.getElementById('deliveryItemsBody');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!items || !items.length) {
              tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:16px;color:#666">ÐÐµÑ ÑÐ¾Ð²Ð°ÑÐ¾Ð²</td></tr>';
              return;
            }
            var whFrom = document.getElementById('deliveryWhFrom').value;
            items.forEach(function (item) {
              var product = productsMap[item.product_code] || {};
              var productName = (product.code || '') + ' â ' + (product.name || '');
              var stockRows = (stockCache || []).filter(function (s) { return s.product_code === item.product_code && (!whFrom || s.warehouse_code === whFrom); });
              stockRows.sort(function (a, b) {
                var ea = a.expiry_date || ''; var eb = b.expiry_date || '';
                return ea.localeCompare(eb);
              });
              var batchOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð¿Ð°ÑÑÐ¸Ñ â</option>';
              stockRows.forEach(function (r) {
                var days = (r.days_until_expiry != null ? r.days_until_expiry : '');
                var status = r.expiry_status || {};
                var color = status.color || '';
                var icon = status.icon || '';
                batchOpts += '<option value="' + escAttr(r.batch_code || '') + '" data-batch-id="' + escAttr(r.batch_id || '') + '" data-expiry="' + escAttr(r.expiry_date || '') + '" data-available="' + (r.total_qty != null ? r.total_qty : 0) + '" data-days="' + days + '" data-color="' + escAttr(color) + '" data-icon="' + escAttr(icon) + '">' + escAttr((r.batch_code || '') + (r.expiry_date ? ' â ' + formatDateOnly(r.expiry_date) : '')) + '</option>';
              });
              var price = (item.price != null ? parseFloat(item.price) : (product.price != null ? parseFloat(product.price) : 0)) || 0;
              var row = document.createElement('tr');
              row.className = 'delivery-row';
              row.setAttribute('data-product-code', item.product_code);
              row.setAttribute('data-order-qty', item.quantity || 0);
              row.setAttribute('data-price', price);
              row.innerHTML = '<td>' + escAttr(productName) + '</td><td><select class="delivery-batch" required>' + batchOpts + '</select></td><td class="delivery-expiry">â</td><td class="delivery-days" style="text-align:center">â</td><td class="delivery-available" style="text-align:right">0</td><td style="text-align:right;font-weight:600">' + (item.quantity || 0) + '</td><td><input type="number" class="delivery-qty" min="1" max="' + (item.quantity || 0) + '" value="' + (item.quantity || 0) + '" required></td><td class="delivery-price" style="text-align:right">' + (price ? price.toFixed(2) : 'â') + '</td><td class="delivery-sum" style="text-align:right">â</td>';
              tbody.appendChild(row);
              var batchSel = row.querySelector('.delivery-batch');
              if (batchSel && stockRows.length > 0) {
                batchSel.selectedIndex = 1;
              }
              attachDeliveryRowHandlers(row);
            });
            updateDeliveryTotals();
          }
          function attachDeliveryRowHandlers(row) {
            var batchSel = row.querySelector('.delivery-batch');
            var qtyInp = row.querySelector('.delivery-qty');
            var expiryCell = row.querySelector('.delivery-expiry');
            var daysCell = row.querySelector('.delivery-days');
            var availCell = row.querySelector('.delivery-available');
            var sumCell = row.querySelector('.delivery-sum');
            if (!batchSel || !qtyInp) return;
            function updateBatchInfo() {
              var opt = batchSel.options[batchSel.selectedIndex] || null;
              var expiry = opt ? opt.getAttribute('data-expiry') || '' : '';
              var avail = opt ? parseInt(opt.getAttribute('data-available') || '0', 10) || 0 : 0;
              var daysAttr = opt ? opt.getAttribute('data-days') : null;
              var color = opt ? opt.getAttribute('data-color') || '' : '';
              var icon = opt ? opt.getAttribute('data-icon') || '' : '';
              expiryCell.textContent = expiry ? formatDateOnly(expiry) : 'â';
              availCell.textContent = avail;
              var orderQty = parseInt(row.getAttribute('data-order-qty') || '0', 10) || 0;
              var maxQty = Math.min(orderQty, avail);
              qtyInp.max = maxQty;
              if (parseInt(qtyInp.value || '0', 10) > maxQty) qtyInp.value = maxQty;
              if (daysCell) {
                if (daysAttr === null || daysAttr === '' || isNaN(parseInt(daysAttr, 10))) {
                  daysCell.textContent = 'â';
                } else {
                  var days = parseInt(daysAttr, 10);
                  var badgeColor = '#28a745';
                  if (color === 'YELLOW') badgeColor = '#ffc107';
                  else if (color === 'RED') badgeColor = '#dc3545';
                  else if (color === 'BLACK') badgeColor = '#343a40';
                  var iconChar = icon || (color === 'YELLOW' ? 'ð¡' : (color === 'RED' ? 'ð´' : (color === 'BLACK' ? 'â«' : 'ð¢')));
                  var daysText = days + ' Ð´Ð½.';
                  daysCell.innerHTML = '<span style="display:inline-block;padding:2px 6px;border-radius:4px;background:' + badgeColor + ';color:#fff;font-size:11px;font-weight:600">' + iconChar + ' ' + daysText + '</span>';
                }
              }
              updateRowSum();
            }
            function updateRowSum() {
              var qty = parseInt(qtyInp.value || '0', 10) || 0;
              var price = parseFloat(row.getAttribute('data-price') || '0') || 0;
              var sum = qty * price;
              sumCell.textContent = sum ? sum.toFixed(2) : 'â';
              updateDeliveryTotals();
            }
            batchSel.onchange = updateBatchInfo;
            qtyInp.onchange = updateRowSum;
            qtyInp.oninput = updateRowSum;
            updateBatchInfo();
          }
          function updateDeliveryTotals() {
            var rows = document.querySelectorAll('.delivery-row');
            var totalQty = 0;
            var totalSum = 0;
            rows.forEach(function (row) {
              var qtyInp = row.querySelector('.delivery-qty');
              var sumCell = row.querySelector('.delivery-sum');
              if (qtyInp && sumCell) {
                var qty = parseInt(qtyInp.value || '0', 10) || 0;
                var sum = parseFloat(sumCell.textContent || '0') || 0;
                totalQty += qty;
                totalSum += sum;
              }
            });
            var totalQtyEl = document.getElementById('deliveryTotalQty');
            var totalSumEl = document.getElementById('deliveryTotalSum');
            if (totalQtyEl) totalQtyEl.textContent = totalQty;
            if (totalSumEl) totalSumEl.textContent = totalSum ? totalSum.toFixed(2) : '0';
          }
          function showOrderSearchModal() {
            api('/api/v1/orders/statuses').catch(function() { return []; }).then(function(statuses) {
        function formatDateTashkent(isoStr) {
          if (!isoStr) return '';
          try {
            var d = parseBackendDate(isoStr);
            if (!d) return isoStr;
            return d.toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          } catch (e) { return isoStr; }
        }
              var modalId = 'orderSearchModal_' + Date.now();
              var statusOptsHtml = '<option value="">â ÐÑÐµ â</option>';
              if (statuses && statuses.length) {
                statuses.forEach(function(s) {
                  statusOptsHtml += '<option value="' + escAttr(s.code) + '">' + escAttr(s.name || s.code) + '</option>';
                });
              } else {
                statusOptsHtml += '<option value="open">ÐÑÐºÑÑÑ</option><option value="delivery">ÐÐ¾ÑÑÐ°Ð²ÐºÐ°</option>';
              }
              var modalHtml = '<div class="modal show" id="' + modalId + '"><div class="modal-inner" style="max-width:900px;max-height:90vh;overflow:auto"><h3>ÐÐ¾Ð¸ÑÐº Ð·Ð°ÐºÐ°Ð·Ð°</h3>';
              modalHtml += '<div style="margin-bottom:16px"><div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-bottom:12px">';
              modalHtml += '<div><label style="display:block;margin-bottom:4px;font-size:13px;font-weight:600">Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ</label><select id="orderSearchModalExpeditor" style="min-width:200px">' + expOpts + '</select></div>';
              modalHtml += '<div><label style="display:block;margin-bottom:4px;font-size:13px;font-weight:600">Ð¡ÑÐ°ÑÑÑ</label><select id="orderSearchModalStatus" style="min-width:180px">' + statusOptsHtml + '</select></div>';
              modalHtml += '<div><label style="display:block;margin-bottom:4px;font-size:13px;font-weight:600">ÐÐ»Ð¸ÐµÐ½Ñ</label><select id="orderSearchModalCustomer" style="min-width:220px">' + custOpts + '</select></div>';
              modalHtml += '<div><button type="button" class="btn btn-primary" id="orderSearchModalBtn">ÐÐ°Ð¹ÑÐ¸</button></div>';
              modalHtml += '</div><div style="margin-top:8px"><label><input type="checkbox" id="orderSearchModalNotClosed" checked> Ð¢Ð¾Ð»ÑÐºÐ¾ Ð½Ðµ Ð·Ð°ÐºÑÑÑÑÐµ Ð·Ð°ÐºÐ°Ð·Ñ</label></div></div>';
              modalHtml += '<div id="orderSearchModalResults" style="margin-top:16px;max-height:400px;overflow-y:auto"></div>';
              modalHtml += '<div id="orderSearchModalErr" class="err" style="margin-top:8px"></div>';
              modalHtml += '<div class="modal-actions" style="margin-top:16px"><button type="button" class="btn btn-secondary" id="orderSearchModalCancel">ÐÑÐ¼ÐµÐ½Ð°</button></div></div></div>';
              var modalContainer = document.getElementById('modalContainer');
              if (!modalContainer) {
                modalContainer = document.createElement('div');
                modalContainer.id = 'modalContainer';
                document.body.appendChild(modalContainer);
              }
              modalContainer.innerHTML = modalHtml;
              var resultsDiv = document.getElementById('orderSearchModalResults');
              var errDiv = document.getElementById('orderSearchModalErr');
              
              function searchOrders() {
                if (errDiv) errDiv.textContent = '';
                if (resultsDiv) resultsDiv.innerHTML = '<p style="color:#666;text-align:center;padding:20px">ÐÐ¾Ð¸ÑÐº...</p>';
                var expeditor = document.getElementById('orderSearchModalExpeditor') ? document.getElementById('orderSearchModalExpeditor').value : '';
                var status = document.getElementById('orderSearchModalStatus') ? document.getElementById('orderSearchModalStatus').value : '';
                var customer = document.getElementById('orderSearchModalCustomer') ? document.getElementById('orderSearchModalCustomer').value : '';
                var notClosed = document.getElementById('orderSearchModalNotClosed') ? document.getElementById('orderSearchModalNotClosed').checked : true;
                var params = [];
                if (expeditor && expeditor.trim()) params.push('login_expeditor=' + encodeURIComponent(expeditor.trim()));
                if (status && status.trim()) params.push('status_code=' + encodeURIComponent(status.trim()));
                if (customer && customer.trim() && !isNaN(parseInt(customer, 10))) params.push('customer_id=' + encodeURIComponent(customer.trim()));
                performSearch(params, notClosed);
              }
              
              function performSearch(params, filterNotClosed) {
                var url = '/api/v1/orders' + (params.length ? '?' + params.join('&') : '');
                api(url).then(function(data) {
                  var orders = Array.isArray(data) ? data : (data && data.orders ? data.orders : []);
                  if (!resultsDiv) return;
                  
                  // Ð¢Ð¾Ð»ÑÐºÐ¾ Ð½Ðµ Ð·Ð°ÐºÑÑÑÑÐµ: Ð¿Ð¾ ÑÐ¼Ð¾Ð»ÑÐ°Ð½Ð¸Ñ Ð¿Ð¾ÐºÐ°Ð·ÑÐ²Ð°ÐµÐ¼ ÑÐ¾Ð»ÑÐºÐ¾ open Ð¸ delivery (Ð·Ð°ÐºÑÑÑÑÐµ â completed Ð¸ canceled)
                  if (filterNotClosed && orders && orders.length) {
                    var openStatusCodes = ['open', 'delivery'];
                    orders = orders.filter(function(o) {
                      var code = (o.status_code || '').toLowerCase().trim();
                      return openStatusCodes.indexOf(code) !== -1;
                    });
                  }
                  
                  if (!orders || !orders.length) {
                    resultsDiv.innerHTML = '<p style="color:#666;text-align:center;padding:20px">ÐÐ°ÐºÐ°Ð·Ñ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ñ. ÐÐ·Ð¼ÐµÐ½Ð¸ÑÐµ ÐºÑÐ¸ÑÐµÑÐ¸Ð¸ Ð¿Ð¾Ð¸ÑÐºÐ°.</p>';
                    return;
                  }
                  var tableHtml = '<div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>â</th><th>ÐÐ»Ð¸ÐµÐ½Ñ</th><th>ÐÐ°ÑÐ° ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ</th><th>Ð¡ÑÐ°ÑÑÑ</th><th>Ð¡ÑÐ¼Ð¼Ð°</th><th>Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ</th><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ðµ</th></tr></thead><tbody>';
                  orders.forEach(function(o) {
                    tableHtml += '<tr><td>' + (o.order_no || o.id) + '</td><td>' + escAttr(o.customer_name || '') + '</td><td>' + formatDateTashkent(o.order_date) + '</td><td>' + formatStatusBadge(o.status_code, o.status_name) + '</td><td>' + (o.total_amount || '0') + '</td><td>' + escAttr(o.login_expeditor || '') + '</td><td><button type="button" class="btn btn-primary btn-small" data-select-order="' + (o.order_no || o.id) + '">ÐÑÐ±ÑÐ°ÑÑ</button></td></tr>';
                  });
                  tableHtml += '</tbody></table></div>';
                  resultsDiv.innerHTML = tableHtml;
                  resultsDiv.querySelectorAll('[data-select-order]').forEach(function(btn) {
                    btn.onclick = function() {
                      var orderId = this.getAttribute('data-select-order');
                      document.getElementById('deliveryOrderId').value = orderId;
                      document.getElementById(modalId).classList.remove('show');
                      document.getElementById('deliveryOrderId').dispatchEvent(new Event('change'));
                    };
                  });
                }).catch(function(e) {
                  console.error('Order search error:', e);
                  var msg = 'ÐÑÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð¸ÑÐºÐ° Ð·Ð°ÐºÐ°Ð·Ð¾Ð².';
                  if (e && e.data) {
                    var d = e.data.detail;
                    if (typeof d === 'string') msg = d;
                    else if (Array.isArray(d) && d.length) msg = d.map(function(x) { return x.msg || x.message || JSON.stringify(x); }).join(' ');
                    else if (d && typeof d === 'object') msg = JSON.stringify(d);
                  }
                  if (e && e.status) msg = 'ÐÐ¾Ð´ ' + e.status + ': ' + msg;
                  else if (e && e.message) msg = msg + ' ' + String(e.message);
                  if (errDiv) errDiv.textContent = msg;
                  if (resultsDiv) resultsDiv.innerHTML = '';
                });
              }
              
              document.getElementById('orderSearchModalBtn').onclick = searchOrders;
              document.getElementById('orderSearchModalCancel').onclick = function() {
                document.getElementById(modalId).classList.remove('show');
              };
              // ÐÐ°ÐºÑÑÑÐ¸Ðµ Ð¿Ð¾ ÐºÐ»Ð¸ÐºÑ Ð²Ð½Ðµ Ð¼Ð¾Ð´Ð°Ð»ÑÐ½Ð¾Ð³Ð¾ Ð¾ÐºÐ½Ð°
              document.getElementById(modalId).onclick = function(e) {
                if (e.target.id === modalId) {
                  document.getElementById(modalId).classList.remove('show');
                }
              };
              // ÐÐµÑÐ²ÑÐ¹ Ð¿Ð¾Ð¸ÑÐº Ð±ÐµÐ· ÑÐ¸Ð»ÑÑÑÐ¾Ð² â Ð¿ÑÐ¾Ð²ÐµÑÐºÐ°, ÑÑÐ¾ API Ð¾ÑÐ²ÐµÑÐ°ÐµÑ
              performSearch([], document.getElementById('orderSearchModalNotClosed').checked);
            });
          }
          document.getElementById('deliveryOrderSearchBtn').onclick = showOrderSearchModal;
          document.getElementById('deliveryCancel').onclick = function () { loadSectionOperations(false); };
          document.getElementById('deliverySave').onclick = function () {
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            var whFrom = document.getElementById('deliveryWhFrom').value;
            var expeditor = document.getElementById('deliveryExpeditor').value;
            var customerId = document.getElementById('deliveryCustomer').value;
            var paymentType = document.getElementById('deliveryPaymentType').value;
            var orderId = parseInt(document.getElementById('deliveryOrderId').value || '0', 10) || 0;
            if (errEl) errEl.textContent = '';
            if (!whFrom) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÐ»Ð°Ð´ Ð¾Ñ.'; return; }
            if (!expeditor) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°.'; return; }
            if (!customerId) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°.'; return; }
            if (!paymentType) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ.'; return; }
            if (!orderId) { if (errEl) errEl.textContent = 'ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð½Ð¾Ð¼ÐµÑ Ð·Ð°ÐºÐ°Ð·Ð°.'; return; }
            var rows = document.querySelectorAll('.delivery-row');
            var items = [];
            rows.forEach(function (row) {
              var batchSel = row.querySelector('.delivery-batch');
              var qtyInp = row.querySelector('.delivery-qty');
              var productCode = row.getAttribute('data-product-code') || '';
              if (!batchSel || !qtyInp || !productCode) return;
              var batchCode = (batchSel.value || '').trim();
              var qty = parseInt(qtyInp.value || '0', 10) || 0;
              if (!batchCode || !qty) return;
              var opt = batchSel.options[batchSel.selectedIndex] || null;
              var available = opt ? parseInt(opt.getAttribute('data-available') || '0', 10) || 0 : 0;
              if (qty > available) qty = available;
              var price = parseFloat(row.getAttribute('data-price') || '0') || 0;
              var amount = qty * price;
              items.push({ product_code: productCode, batch_code: batchCode, quantity: qty, amount: amount });
            });
            if (!items.length) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð¿Ð°ÑÑÐ¸Ð¸ Ð´Ð»Ñ Ð²ÑÐµÑ ÑÐ¾Ð²Ð°ÑÐ¾Ð².'; return; }
            var comment = (document.getElementById('deliveryComment').value || '').trim() || null;
            var createdBy = (window.currentUser && window.currentUser.login) ? window.currentUser.login : null;
            var saveBtn = document.getElementById('deliverySave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            var createdCount = 0;
            var idx = 0;
            function createNext() {
              if (idx >= items.length) {
                var done = function () {
                  if (msgEl) { msgEl.textContent = 'ÐÐ¿ÐµÑÐ°ÑÐ¸Ð¸ Ð´Ð¾ÑÑÐ°Ð²ÐºÐ¸ ÑÐ¾Ð·Ð´Ð°Ð½Ñ: ' + createdCount + ' ÑÑ. ÐÐ°ÐºÐ°Ð· Ð¿ÐµÑÐµÐ²ÐµÐ´ÑÐ½ Ð² ÑÑÐ°ÑÑÑ Â«ÐÐ¾ÑÑÐ°Ð²Ð»ÐµÐ½Â».'; msgEl.style.display = 'block'; }
                  setTimeout(function () { loadSectionOperations(false); }, 1500);
                };
                if (createdCount > 0 && orderId) {
                  api('/api/v1/orders/' + orderId, { method: 'PATCH', body: JSON.stringify({ status_code: 'completed' }) }).then(done).catch(function () { done(); });
                } else {
                  done();
                }
                return;
              }
              var it = items[idx++];
              var payload = {
                warehouse_from: whFrom,
                product_code: it.product_code,
                batch_code: it.batch_code,
                quantity: it.quantity,
                customer_id: parseInt(customerId, 10),
                amount: it.amount,
                payment_type_code: paymentType,
                expeditor_login: expeditor,
                order_id: orderId,
                comment: comment
              };
              api('/api/v1/operations/' + encodeURIComponent(config.operation_type) + '/create', { method: 'POST', body: JSON.stringify(payload) }).then(function () {
                createdCount += 1;
                createNext();
              }).catch(function (e) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) {
                  var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                  if (errEl) errEl.textContent = errs.join('; ');
                } else if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
              });
            }
            createNext();
          };
        }
        function buildFormFromConfig(config, customers, products, warehouses, paymentTypes, userList) {
          var content = document.getElementById('content');
          if (!content) return;
          var fieldsToShow = (config.required_fields || []).concat(config.optional_fields || []);
          var hiddenFields = config.hidden_fields || [];
          var readonlyFields = config.readonly_fields || [];
          if (config.operation_type === 'payment_receipt_from_customer') {
            var prio = ['customer_id', 'order_id'];
            var rest = fieldsToShow.filter(function (f) { return prio.indexOf(f) === -1; });
            fieldsToShow = prio.filter(function (f) { return fieldsToShow.indexOf(f) >= 0; }).concat(rest);
          }
          if (config.operation_type === 'warehouse_receipt') {
            buildWarehouseReceiptForm(config, products, warehouses, userList);
            return;
          }
          if (config.operation_type === 'allocation') {
            buildAllocationForm(config, customers, products, warehouses, userList);
            return;
          }
          if (config.operation_type === 'delivery') {
            buildDeliveryForm(config, customers, products, warehouses, paymentTypes, userList);
            return;
          }
          if (config.operation_type === 'write_off') {
            buildWriteOffForm(config, products, warehouses, userList);
            return;
          }
          if (config.operation_type === 'transfer') {
            buildTransferForm(config, products, warehouses, userList);
            return;
          }
          if (config.operation_type === 'promotional_sample') {
            buildPromotionalSampleForm(config, products, warehouses, userList);
            return;
          }
          var formHtml = '<div class="card"><h2 id="opFormTitle">Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸: ' + escAttr(config.operation_name || config.operation_type) + '</h2>';
          if (config.description) formHtml += '<p style="color:#666;margin-bottom:16px">' + escAttr(config.description) + '</p>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          var fieldMap = {
            warehouse_from: { label: 'Ð¡ÐºÐ»Ð°Ð´ Ð¾Ñ', type: 'select', options: warehouses, id: 'opCreateWarehouseFrom' },
            warehouse_to: { label: 'Ð¡ÐºÐ»Ð°Ð´ Ð²', type: 'select', options: warehouses, id: 'opCreateWarehouseTo' },
            product_code: { label: 'Ð¢Ð¾Ð²Ð°Ñ', type: 'select', options: products, id: 'opCreateProduct' },
            batch_code: { label: 'ÐÐ¾Ð´ Ð¿Ð°ÑÑÐ¸Ð¸', type: 'text', id: 'opCreateBatchCode', autoFromProductAndExpiry: true },
            expiry_date: { label: 'Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸', type: 'date', id: 'opCreateExpiryDate' },
            quantity: { label: 'ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾', type: 'number', id: 'opCreateQuantity', min: 0 },
            amount: { label: 'Ð¡ÑÐ¼Ð¼Ð°', type: 'number', id: 'opCreateAmount', step: '0.01' },
            payment_type_code: { label: 'Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ', type: 'select', options: paymentTypes, id: 'opCreatePaymentType' },
            customer_id: { label: 'ÐÐ»Ð¸ÐµÐ½Ñ', type: 'select', options: customers, id: 'opCreateCustomer' },
            order_id: { label: 'ÐÐ°ÐºÐ°Ð· â', type: 'number', id: 'opCreateOrderId', min: 0 },
            expeditor_login: { label: 'Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ', type: 'select', options: (userList || []).filter(function (u) { return (u.role || '').toLowerCase() === 'expeditor'; }), id: 'opCreateExpeditor' },
            cashier_login: { label: 'ÐÐ°ÑÑÐ¸Ñ', type: 'select', options: userList, id: 'opCreateCashier' },
            storekeeper_login: { label: 'ÐÐ»Ð°Ð´Ð¾Ð²ÑÐ¸Ðº', type: 'select', options: userList, id: 'opCreateStorekeeper' },
            comment: { label: 'ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹', type: 'text', id: 'opCreateComment' },
            related_operation_id: { label: 'Ð¡Ð²ÑÐ·Ð°Ð½Ð½Ð°Ñ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ', type: 'text', id: 'opCreateRelatedOp' }
          };
          fieldsToShow.forEach(function (fieldName) {
            if (hiddenFields.indexOf(fieldName) >= 0) return;
            var field = fieldMap[fieldName];
            if (!field) return;
            var isRequired = (config.required_fields || []).indexOf(fieldName) >= 0;
            var isReadonly = readonlyFields.indexOf(fieldName) >= 0;
            formHtml += '<div class="form-group"><label>' + escAttr(field.label || fieldName) + (isRequired ? ' <span style="color:#c00">*</span>' : '') + '</label>';
            if (fieldName === 'order_id' && config.operation_type === 'payment_receipt_from_customer') {
              formHtml += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input type="hidden" id="' + field.id + '"><input type="text" id="opCreateOrderDisplay" readonly placeholder="Ð¡Ð½Ð°ÑÐ°Ð»Ð° Ð²ÑÐ±ÐµÑÐ¸ÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°" style="flex:1;min-width:200px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 10px"><button type="button" class="btn btn-secondary" id="opOrderPickBtn" disabled>ÐÑÐ±ÑÐ°ÑÑ Ð·Ð°ÐºÐ°Ð·</button></div></div>';
            } else if (fieldName === 'customer_id' && config.operation_type === 'payment_receipt_from_customer') {
              formHtml += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><input type="hidden" id="' + field.id + '"><input type="text" id="opCreateCustomerSearch" placeholder="ÐÐÐ Ð¸Ð»Ð¸ Ñ/Ñ" style="max-width:220px" autocomplete="off"><button type="button" class="btn btn-secondary" id="opCreateCustomerFind">ÐÐ°Ð¹ÑÐ¸</button><span id="opCreateCustomerDisplay" style="color:#0f766e;font-weight:600"></span></div><div id="opCreateCustomerErr" class="err" style="margin-top:4px;font-size:12px"></div></div>';
            } else if (field.type === 'select') {
              var opts = '<option value="">â ÐÐµ ÑÐºÐ°Ð·Ð°Ð½ â</option>';
              if (field.options) {
                field.options.forEach(function (opt) {
                  if (fieldName === 'expeditor_login' && (opt.role || '').toLowerCase() !== 'expeditor') return;
                  var val = opt.code || opt.id || opt.login || '';
                  var text = (fieldName === 'customer_id')
                    ? ((opt.name_client || opt.firm_name || '') + ' (ID ' + (opt.id || '') + ')')
                    : ((fieldName === 'product_code')
                      ? ((opt.code || '') + ' â ' + (opt.name || ''))
                      : (opt.name || opt.code || opt.login || val));
                  opts += '<option value="' + escAttr(val) + '">' + escAttr(text) + '</option>';
                });
              }
              formHtml += '<select id="' + field.id + '"' + (isRequired ? ' required' : '') + (isReadonly ? ' disabled' : '') + '>' + opts + '</select></div>';
            } else {
              var inputType = field.type || 'text';
              var placeholder = (isRequired ? 'Ð¾Ð±ÑÐ·Ð°ÑÐµÐ»ÑÐ½Ð¾' : 'Ð½ÐµÐ¾Ð±ÑÐ·.');
              if (fieldName === 'expiry_date') { inputType = 'text'; placeholder = 'Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³'; }
              formHtml += '<input type="' + inputType + '" id="' + field.id + '"' + (isRequired ? ' required' : '') + (isReadonly ? ' readonly' : '') + (field.min !== undefined ? ' min="' + field.min + '"' : '') + (field.step !== undefined ? ' step="' + field.step + '"' : '') + ' placeholder="' + placeholder + '" autocomplete="off"></div>';
            }
          });
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="opCreateSave">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ</button> <button type="button" class="btn btn-secondary" id="opCreateCancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
          content.innerHTML = formHtml;
          var expiryEl = document.getElementById('opCreateExpiryDate');
          if (expiryEl && window.flatpickr) {
            window.flatpickr(expiryEl, { locale: 'ru', dateFormat: 'd.m.Y', allowInput: true });
          }
          function updateBatchCodeFromProductAndExpiry() {
            var productEl = document.getElementById('opCreateProduct');
            var expiryEl = document.getElementById('opCreateExpiryDate');
            var batchEl = document.getElementById('opCreateBatchCode');
            if (!productEl || !expiryEl || !batchEl) return;
            var productCode = (productEl.value || '').trim();
            var expiryRaw = (expiryEl.value || '').trim();
            if (!productCode || !expiryRaw) return;
            var m = expiryRaw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (!m) {
              var iso = expiryRaw.match(/^(\d{4})-(\d{2})-(\d{2})/);
              if (iso) m = [null, iso[3], iso[2], iso[1]];
            }
            if (m) {
              var ddmmyyyy = m[1].padStart(2, '0') + m[2].padStart(2, '0') + m[3];
              batchEl.value = productCode + '_' + ddmmyyyy;
            }
          }
          var productEl = document.getElementById('opCreateProduct');
          var expiryEl = document.getElementById('opCreateExpiryDate');
          var batchEl = document.getElementById('opCreateBatchCode');
          if (productEl && expiryEl && batchEl && fieldMap.batch_code && fieldMap.batch_code.autoFromProductAndExpiry) {
            productEl.onchange = updateBatchCodeFromProductAndExpiry;
            if (expiryEl) { expiryEl.onchange = updateBatchCodeFromProductAndExpiry; expiryEl.oninput = updateBatchCodeFromProductAndExpiry; }
          }
          if (config.operation_type === 'payment_receipt_from_customer') {
            var customerIdInput = document.getElementById('opCreateCustomer');
            var customerSearchInput = document.getElementById('opCreateCustomerSearch');
            var customerDisplay = document.getElementById('opCreateCustomerDisplay');
            var customerErr = document.getElementById('opCreateCustomerErr');
            var orderIdInput = document.getElementById('opCreateOrderId');
            var orderDisplay = document.getElementById('opCreateOrderDisplay');
            var orderPickBtn = document.getElementById('opOrderPickBtn');
            var amountEl = document.getElementById('opCreateAmount');
            var paymentTypeEl = document.getElementById('opCreatePaymentType');
            function updateOrderPickState() {
              var cust = customerIdInput ? customerIdInput.value : '';
              if (orderPickBtn) orderPickBtn.disabled = !cust || cust.trim() === '';
              if (!cust || cust.trim() === '') {
                if (orderIdInput) orderIdInput.value = '';
                if (orderDisplay) { orderDisplay.value = ''; orderDisplay.placeholder = 'Ð¡Ð½Ð°ÑÐ°Ð»Ð° Ð²ÑÐ±ÐµÑÐ¸ÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°'; }
                if (amountEl) { amountEl.value = ''; amountEl.readOnly = false; }
                if (paymentTypeEl) { paymentTypeEl.value = ''; paymentTypeEl.disabled = false; }
              } else if (orderDisplay) orderDisplay.placeholder = 'ÐÐ°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÑÐ±ÑÐ°ÑÑ Ð·Ð°ÐºÐ°Ð·Â»';
            }
            if (document.getElementById('opCreateCustomerFind')) {
              document.getElementById('opCreateCustomerFind').onclick = function () {
                var val = (customerSearchInput && customerSearchInput.value) ? customerSearchInput.value.trim() : '';
                if (customerErr) customerErr.textContent = '';
                if (!val) { if (customerErr) customerErr.textContent = 'ÐÐ²ÐµÐ´Ð¸ÑÐµ ÐÐÐ Ð¸Ð»Ð¸ ÑÐ°ÑÑÑÑÐ½ÑÐ¹ ÑÑÑÑ'; return; }
                api('/api/v1/customers?search=' + encodeURIComponent(val)).then(function (data) {
                  var list = Array.isArray(data) ? data : (data && data.data ? data.data : []);
                  if (!list.length) { if (customerErr) customerErr.textContent = 'ÐÐ»Ð¸ÐµÐ½Ñ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½'; return; }
                  var c = list[0];
                  var id = c.id != null ? c.id : c.customer_id;
                  if (customerIdInput) customerIdInput.value = id;
                  if (customerDisplay) customerDisplay.textContent = (c.name_client || c.firm_name || '') + ' (ID ' + id + ')';
                  if (customerErr) customerErr.textContent = '';
                  updateOrderPickState();
                }).catch(function () { if (customerErr) customerErr.textContent = 'ÐÑÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð¸ÑÐºÐ°'; });
              };
            }
            updateOrderPickState();
            if (orderPickBtn) {
              orderPickBtn.onclick = function () {
                var customerId = customerIdInput ? customerIdInput.value : '';
                if (!customerId || customerId.trim() === '') return;
                var modalId = 'opOrderPickModal_' + Date.now();
                var modalHtml = '<div class="modal show" id="' + modalId + '"><div class="modal-inner" style="max-width:700px;max-height:85vh;overflow:auto"><h3>ÐÑÐ±Ð¾Ñ Ð·Ð°ÐºÐ°Ð·Ð° (Ð½ÐµÐ¾Ð¿Ð»Ð°ÑÐµÐ½Ð½ÑÐµ)</h3><div id="opOrderPickLoading" style="padding:20px;text-align:center;color:#666">ÐÐ°Ð³ÑÑÐ·ÐºÐ° Ð·Ð°ÐºÐ°Ð·Ð¾Ð²...</div><div id="opOrderPickResults" style="margin-top:12px;max-height:400px;overflow-y:auto;display:none"></div><div id="opOrderPickErr" class="err" style="margin-top:8px"></div><div class="modal-actions" style="margin-top:16px"><button type="button" class="btn btn-secondary" id="opOrderPickCancel">ÐÑÐ¼ÐµÐ½Ð°</button></div></div></div>';
                var modalContainer = document.getElementById('modalContainer');
                if (!modalContainer) { modalContainer = document.createElement('div'); modalContainer.id = 'modalContainer'; document.body.appendChild(modalContainer); }
                modalContainer.innerHTML = modalHtml;
                var loadingEl = document.getElementById('opOrderPickLoading');
                var resultsEl = document.getElementById('opOrderPickResults');
                var errEl = document.getElementById('opOrderPickErr');
                api('/api/v1/orders?customer_id=' + encodeURIComponent(customerId)).then(function (data) {
                  var orders = Array.isArray(data) ? data : (data && data.orders ? data.orders : data && data.data ? data.data : []);
                  orders = (orders || []).filter(function (o) { var s = (o.status_code || '').toLowerCase(); return s !== 'completed' && s !== 'canceled' && s !== 'cancelled'; });
                  if (loadingEl) loadingEl.style.display = 'none';
                  if (resultsEl) {
                    resultsEl.style.display = 'block';
                    if (!orders.length) {
                      resultsEl.innerHTML = '<p style="color:#666;text-align:center;padding:20px">ÐÐµÑ Ð½ÐµÐ¾Ð¿Ð»Ð°ÑÐµÐ½Ð½ÑÑ Ð·Ð°ÐºÐ°Ð·Ð¾Ð² Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ°.</p>';
                      return;
                    }
                    var tableHtml = '<div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>â Ð·Ð°ÐºÐ°Ð·Ð°</th><th>ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸</th><th>Ð¡ÑÐ°ÑÑÑ</th><th>Ð¡ÑÐ¼Ð¼Ð°</th><th></th></tr></thead><tbody>';
                    orders.forEach(function (o) {
                      var orderNo = o.order_no != null ? o.order_no : o.id;
                      var deliveryDate = o.scheduled_delivery_at ? formatDateOnly(o.scheduled_delivery_at) : 'â';
                      var status = o.status_name || o.status_code || 'â';
                      var amount = o.total_amount != null ? (typeof o.total_amount === 'number' ? o.total_amount.toFixed(2) : o.total_amount) : 'â';
                      tableHtml += '<tr><td>' + escAttr(orderNo) + '</td><td>' + escAttr(deliveryDate) + '</td><td>' + formatStatusBadge(o.status_code, status) + '</td><td>' + escAttr(amount) + '</td><td><button type="button" class="btn btn-primary btn-small" data-op-select-order="' + escAttr(orderNo) + '" data-op-order-amount="' + escAttr(o.total_amount != null ? o.total_amount : '') + '" data-op-order-payment="' + escAttr(o.payment_type_code || '') + '" data-op-order-display="' + escAttr('â ' + orderNo + ' â ' + deliveryDate) + '">ÐÑÐ±ÑÐ°ÑÑ</button></td></tr>';
                    });
                    tableHtml += '</tbody></table></div>';
                    resultsEl.innerHTML = tableHtml;
                    resultsEl.querySelectorAll('[data-op-select-order]').forEach(function (btn) {
                      btn.onclick = function () {
                        var ordId = this.getAttribute('data-op-select-order');
                        var disp = this.getAttribute('data-op-order-display') || ('\u2116 ' + ordId);
                        if (orderIdInput) orderIdInput.value = ordId;
                        if (orderDisplay) orderDisplay.value = disp;
                        var amt = this.getAttribute('data-op-order-amount');
                        var pay = this.getAttribute('data-op-order-payment') || '';
                        if (amountEl) { amountEl.value = amt != null && amt !== '' ? amt : ''; amountEl.readOnly = true; }
                        if (paymentTypeEl) { try { paymentTypeEl.value = pay; paymentTypeEl.disabled = true; } catch (e) {} }
                        document.getElementById(modalId).classList.remove('show');
                      };
                    });
                  }
                }).catch(function (e) {
                  if (loadingEl) loadingEl.style.display = 'none';
                  if (resultsEl) { resultsEl.style.display = 'block'; resultsEl.innerHTML = ''; }
                  var msg = 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð¾Ð².';
                  if (e && e.data && e.data.detail) msg = typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail);
                  if (errEl) errEl.textContent = msg;
                });
                document.getElementById('opOrderPickCancel').onclick = function () { document.getElementById(modalId).classList.remove('show'); };
                document.getElementById(modalId).onclick = function (e) { if (e.target.id === modalId) document.getElementById(modalId).classList.remove('show'); };
              };
            }
          }
          document.getElementById('opCreateCancel').onclick = function () { loadSectionOperations(false); };
          document.getElementById('opCreateSave').onclick = function () {
            var errEl = document.getElementById('opFormErr');
            var msgEl = document.getElementById('opFormMsg');
            var saveBtn = document.getElementById('opCreateSave');
            if (errEl) errEl.textContent = '';
            if (msgEl) { msgEl.style.display = 'none'; msgEl.textContent = ''; }
            var payload = {};
            fieldsToShow.forEach(function (fieldName) {
              if (hiddenFields.indexOf(fieldName) >= 0) return;
              var field = fieldMap[fieldName];
              if (!field) return;
              var el = document.getElementById(field.id);
              if (!el) return;
              var val = el.value;
              if (val && val.trim() !== '') {
                if (fieldName === 'customer_id' || fieldName === 'order_id' || fieldName === 'quantity') {
                  var num = parseInt(val, 10);
                  if (!isNaN(num)) payload[fieldName] = num;
                } else if (fieldName === 'amount') {
                  var num = parseFloat(val);
                  if (!isNaN(num)) payload[fieldName] = num;
                } else {
                  payload[fieldName] = val.trim();
                }
              }
            });
            if (config.operation_type === 'payment_receipt_from_customer' && (config.required_fields || []).indexOf('order_id') >= 0) {
              var ordIdVal = document.getElementById('opCreateOrderId') ? document.getElementById('opCreateOrderId').value : '';
              if (!ordIdVal || ordIdVal.trim() === '') {
                if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð·Ð°ÐºÐ°Ð· ÐºÐ»Ð¸ÐµÐ½ÑÐ°.';
                return;
              }
            }
            saveBtn.disabled = true;
            saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ðµ...';
            function doneSuccess(result) {
              if (msgEl) { msgEl.textContent = 'ÐÐ¿ÐµÑÐ°ÑÐ¸Ñ ÑÐ¾Ð·Ð´Ð°Ð½Ð°: ' + (result.operation_number || 'OK'); msgEl.style.display = 'block'; }
              setTimeout(function () { loadSectionOperations(false); }, 2000);
            }
            function doneError(e) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ';
              var detail = e && e.data && e.data.detail;
              if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
              if (detail && detail.errors) {
                var errs = [];
                for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                if (errEl) errEl.textContent = errs.join('; ');
              } else if (errEl) errEl.textContent = 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
            }
            api('/api/v1/operations/' + encodeURIComponent(config.operation_type) + '/create', { method: 'POST', body: JSON.stringify(payload) }).then(doneSuccess).catch(doneError);
          };
        }
        function openOperationCreate() {
          var content = document.getElementById('content');
          if (!content) return;
          // ÐÐ¾ÐºÐ°Ð·ÑÐ²Ð°ÐµÐ¼ UI ÑÑÐ°Ð·Ñ â ÑÐ¾Ð»ÑÐºÐ¾ ÑÐ¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸
          content.innerHTML = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸</h2><div id="opFormErr" class="err" style="margin-bottom:12px"></div><div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸ <span style="color:#c00">*</span></label><select id="opSelectType" required><option value="">â ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</option></select></div><div id="opFormContainer"></div></div>';
          // ÐÐ°Ð³ÑÑÐ¶Ð°ÐµÐ¼ ÑÐ¸Ð¿Ñ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¹ ÑÑÐ°Ð·Ñ (Ð±ÑÑÑÑÐ¾, Ð¼Ð°Ð»Ð¾ Ð´Ð°Ð½Ð½ÑÑ)
          api('/api/v1/operation-types').catch(function () { return []; }).then(function (types) {
            var typeOpts = '<option value="">â ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÐ¸Ð¿ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸ â</option>';
            (types || []).forEach(function (ty) {
              if (ty.active !== true || ty.has_config !== true) return;
              typeOpts += '<option value="' + escAttr(ty.code) + '">' + escAttr(ty.name || ty.code) + '</option>';
            });
            var sel = document.getElementById('opSelectType');
            if (sel) sel.innerHTML = typeOpts;
          });
          // Ð¤Ð¾Ð½Ð¾Ð²Ð°Ñ Ð·Ð°Ð³ÑÑÐ·ÐºÐ° Ð¾ÑÑÐ°Ð»ÑÐ½ÑÑ Ð´Ð°Ð½Ð½ÑÑ (ÐºÐ»Ð¸ÐµÐ½ÑÑ, ÑÐ¾Ð²Ð°ÑÑ, ÑÐºÐ»Ð°Ð´Ñ Ð¸ Ñ.Ð´.)
          var formDataPromise = Promise.all([
            api('/api/v1/customers?limit=200').catch(function () { return []; }),
            api('/api/v1/dictionary/products').catch(function () { return []; }),
            api('/api/v1/dictionary/warehouses').catch(function () { return []; }),
            api('/api/v1/dictionary/payment-types').catch(function () { return []; }),
            api('/api/v1/dictionary/user-logins').catch(function () { return []; })
          ]).then(function (results) {
            return { customers: results[0] || [], products: results[1] || [], warehouses: results[2] || [], paymentTypes: results[3] || [], userList: results[4] || [] };
          });
          document.getElementById('opSelectType').onchange = function () {
            var typeCode = this.value;
            if (!typeCode) { document.getElementById('opFormContainer').innerHTML = ''; return; }
            document.getElementById('opFormContainer').innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ° ÑÐ¾ÑÐ¼Ñ...</p>';
            Promise.all([
              api('/api/v1/operations/' + encodeURIComponent(typeCode) + '/form-config'),
              formDataPromise
            ]).then(function (results) {
              var config = results[0];
              var fd = results[1];
              buildFormFromConfig(config, fd.customers, fd.products, fd.warehouses, fd.paymentTypes, fd.userList);
            }).catch(function (e) {
              var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) || 'ÐÑÐ¸Ð±ÐºÐ°';
              document.getElementById('opFormContainer').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸: ' + escAttr(msg) + '</p>';
            });
          };
        }
        // ÐÐµÐ»Ð°ÐµÐ¼ ÑÑÐ½ÐºÑÐ¸Ñ Ð´Ð¾ÑÑÑÐ¿Ð½Ð¾Ð¹ Ð¸Ð· Ð³Ð»Ð¾Ð±Ð°Ð»ÑÐ½Ð¾Ð¹ Ð¾Ð±Ð»Ð°ÑÑÐ¸ Ð´Ð»Ñ showSection
        window.openOperationCreate = openOperationCreate;

        function bindOperationAdd() {
          var btn = document.getElementById('opAdd');
          if (!btn) return;
          btn.onclick = openOperationCreate;
        }
      }

      function loadSectionStock() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÑÑÐ°ÑÐºÐ¸ Ð¿Ð¾ ÑÐºÐ»Ð°Ð´Ñ</h2><p><label>Ð¡ÐºÐ»Ð°Ð´ </label><select id="stock_wh"><option value="">â</option></select> <button type="button" class="btn btn-primary" id="stockLoad">ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ</button> <button type="button" class="btn btn-secondary" id="stockExport">ÐÑÐ³ÑÑÐ·Ð¸ÑÑ Ð² Excel</button></p><div id="sectionTable" style="margin-top:12px"></div></div>';
        api('/api/v1/dictionary/warehouses').then(function (list) {
          var sel = document.getElementById('stock_wh');
          if (sel && list) list.forEach(function (w) { var o = document.createElement('option'); o.value = w.code; o.textContent = w.name + ' (' + w.code + ')'; sel.appendChild(o); });
        });
        var stockSortCol = 'product_code';
        var stockSortDir = 1;
        var lastStockData = null;
        function renderStockTable(data) {
          lastStockData = data;
          var tableDiv = document.getElementById('sectionTable');
          if (!data.length) { tableDiv.innerHTML = '<p>ÐÐµÑ Ð¾ÑÑÐ°ÑÐºÐ¾Ð².</p>'; return; }
          var sorted = data.slice().sort(function (a, b) {
            return tableSortCompare(a, b, stockSortCol, stockSortDir, function (r, c) {
              if (c === 'total_qty' || c === 'unit_price' || c === 'total_cost' || c === 'days_until_expiry') return (r[c] != null && r[c] !== '' ? String(Number(r[c])).padStart(20, '0') : '');
              if (c === 'expiry_date') return (r.expiry_date || '').toString();
              return (r[c] || r.warehouse_name || r.warehouse_code || r.product_name || '').toString().toLowerCase();
            });
          });
          var arrow = stockSortDir > 0 ? ' â²' : ' â¼';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (stockSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr>' + th('warehouse_code', 'Ð¡ÐºÐ»Ð°Ð´') + th('product_code', 'Ð¢Ð¾Ð²Ð°Ñ (ÐºÐ¾Ð´)') + th('product_name', 'ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÑÐ¾Ð²Ð°ÑÐ°') + th('batch_code', 'ÐÐ°ÑÑÐ¸Ñ (ÐºÐ¾Ð´)') + th('total_qty', 'ÐÑÑÐ°ÑÐ¾Ðº') + th('unit_price', 'Ð¦ÐµÐ½Ð° Ð·Ð° 1 ÑÑ') + th('total_cost', 'Ð¡ÑÐ¼Ð¼Ð°') + th('expiry_date', 'Ð¡ÑÐ¾Ðº Ð³Ð¾Ð´Ð½Ð¾ÑÑÐ¸') + th('days_until_expiry', 'ÐÐ½ÐµÐ¹ Ð¾ÑÑÐ°Ð»Ð¾ÑÑ') + '</tr></thead><tbody>';
          var totalQty = 0;
          var totalCost = 0;
          sorted.forEach(function (r) {
            var expiryDate = r.expiry_date ? formatDateOnly(r.expiry_date) : 'â';
            var days = r.days_until_expiry;
            var status = r.expiry_status || {};
            var color = status.color || null;
            var icon = status.icon || '';
            var badgeColor = '#28a745';
            if (color === 'YELLOW') badgeColor = '#ffc107';
            else if (color === 'RED') badgeColor = '#dc3545';
            else if (color === 'BLACK') badgeColor = '#343a40';
            var daysText = '';
            if (days == null) {
              daysText = 'â';
            } else if (days <= 0) {
              daysText = (icon || 'â«') + ' ÐÑÐ¾ÑÑÐ¾ÑÐµÐ½ (Ð´Ð½ÐµÐ¹: ' + days + ')';
            } else {
              daysText = (icon || 'ð¢') + ' ' + days + ' Ð´Ð½.';
            }
            var badgeHtml = daysText === 'â'
              ? 'â'
              : '<span class="badge" style="background-color:' + badgeColor + ';color:#fff;border-radius:4px;padding:4px 8px;font-size:12px;">' + escAttr(daysText) + '</span>';
            var price = (r.unit_price != null ? Number(r.unit_price) : 0);
            var cost = (r.total_cost != null ? Number(r.total_cost) : 0);
            var priceText = price ? price.toFixed(2) : 'â';
            var costText = cost ? cost.toFixed(2) : 'â';
            var qty = (r.total_qty != null ? r.total_qty : 0);
            totalQty += qty;
            totalCost += cost;
            t += '<tr><td>' + escAttr(r.warehouse_name || r.warehouse_code || '') + '</td><td>' + escAttr(r.product_code || '') + '</td><td>' + escAttr(r.product_name || '') + '</td><td>' + escAttr(r.batch_code || 'â') + '</td><td style="text-align:right;font-weight:600">' + qty + '</td><td style="text-align:right;">' + priceText + '</td><td style="text-align:right;font-weight:600">' + costText + '</td><td>' + expiryDate + '</td><td style="text-align:center;">' + badgeHtml + '</td></tr>';
          });
          // ÑÑÑÐ¾ÐºÐ° ÐÐ¢ÐÐÐ
          t += '<tr style="background:#f8f9fa;font-weight:600"><td colspan="4" style="text-align:right;padding:8px">ÐÑÐ¾Ð³Ð¾:</td><td style="text-align:right;padding:8px">' + totalQty + '</td><td></td><td style="text-align:right;padding:8px">' + (totalCost ? totalCost.toFixed(2) : '0') + '</td><td></td><td></td></tr>';
          t += '</tbody></table></div>';
          tableDiv.innerHTML = t;
          tableDiv.querySelectorAll('th.sortable').forEach(function (thEl) {
            thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (stockSortCol === col) stockSortDir = -stockSortDir; else { stockSortCol = col; stockSortDir = 1; } renderStockTable(lastStockData); };
          });
        }
        document.getElementById('stockLoad').onclick = function () {
          var code = document.getElementById('stock_wh').value;
          var tableDiv = document.getElementById('sectionTable');
          tableDiv.innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
          var url = '/api/v1/warehouse/stock';
          if (code) url += '?warehouse=' + encodeURIComponent(code);
          api(url).then(function (response) {
            var data = (response && response.success && Array.isArray(response.data)) ? response.data : (Array.isArray(response) ? response : []);
            if (!data.length) { tableDiv.innerHTML = '<p>ÐÐµÑ Ð¾ÑÑÐ°ÑÐºÐ¾Ð²' + (code ? ' Ð½Ð° Ð²ÑÐ±ÑÐ°Ð½Ð½Ð¾Ð¼ ÑÐºÐ»Ð°Ð´Ðµ' : '') + '.</p>'; return; }
            renderStockTable(data);
          }).catch(function (e) {
            var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.data && e.data.error) ? e.data.error : (e && e.message) || 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸';
            tableDiv.innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸: ' + escAttr(msg) + '</p>';
          });
        };
        document.getElementById('stockExport').onclick = function () {
          var code = document.getElementById('stock_wh').value;
          var url = '/api/v1/warehouse/stock/export';
          if (code) url += '?warehouse=' + encodeURIComponent(code);
          fetch(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
          }).then(function (r) {
            if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
            return r.blob();
          }).then(function (blob) {
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'warehouse_stock.xlsx'; a.click(); URL.revokeObjectURL(a.href);
          }).catch(function (e) {
            var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) || 'ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸';
            alert(msg);
          });
        };
      }

      function loadSectionCashPending() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÐ¶Ð¸Ð´Ð°ÑÑÐ¸Ðµ Ð¿ÐµÑÐµÐ´Ð°ÑÐ¸ Ð¾Ñ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ¾Ð²</h2><p style="color:#666;font-size:13px;margin-bottom:16px">ÐÐµÑÐµÐ´Ð°ÑÐ¸ Ð½Ð°Ð»Ð¸ÑÐ½ÑÑ (cash_handover_from_expeditor) ÑÐ¾ ÑÑÐ°ÑÑÑÐ¾Ð¼ pending. ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð¿ÐµÑÐµÐ´Ð°ÑÑ Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÑÐ¸Ð½ÑÑÑÂ» Ð´Ð»Ñ ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ñ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸ cash_receipt.</p><div id="cashPendingList"><p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p></div></div>';
        var div = document.getElementById('cashPendingList');
        var cpSortCol = 'operation_number';
        var cpSortDir = 1;
        var lastCpData = null;
        function renderCashPendingTable(data) {
          lastCpData = data;
          if (!div) return;
          if (!data.length) {
            div.innerHTML = '<p style="color:#666">ÐÐµÑ Ð¾Ð¶Ð¸Ð´Ð°ÑÑÐ¸Ñ Ð¿ÐµÑÐµÐ´Ð°Ñ.</p>';
            return;
          }
          var sorted = data.slice().sort(function (a, b) {
            return tableSortCompare(a, b, cpSortCol, cpSortDir, function (r, c) {
              if (c === 'amount') return (r.amount != null ? String(Number(r.amount)).padStart(20, '0') : '');
              return (r[c] || (r.expeditor_login || r.expeditor_fio) || (r.customer_name || (r.customer_id != null ? 'ID ' + r.customer_id : '')) || '').toString().toLowerCase();
            });
          });
          var arrow = cpSortDir > 0 ? ' â²' : ' â¼';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (cpSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr>' + th('operation_number', 'â Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸') + th('expeditor_login', 'Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ') + th('order_id', 'ÐÐ°ÐºÐ°Ð· â') + th('customer_name', 'ÐÐ»Ð¸ÐµÐ½Ñ') + th('amount', 'Ð¡ÑÐ¼Ð¼Ð°') + th('operation_date', 'ÐÐ°ÑÐ°') + '<th>ÐÐµÐ¹ÑÑÐ²Ð¸Ðµ</th></tr></thead><tbody>';
          sorted.forEach(function (h) {
            var amt = (h.amount != null) ? Number(h.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 'â';
            var dt = h.operation_date ? formatDateOnly(h.operation_date) : 'â';
            var exp = (h.expeditor_fio || h.expeditor_login || '') ? ((h.expeditor_login || '') + (h.expeditor_fio ? ' â ' + h.expeditor_fio : '')) : 'â';
            var orderNo = h.order_id != null ? h.order_id : 'â';
            var custName = h.customer_name || (h.customer_id != null ? 'ID ' + h.customer_id : 'â');
            t += '<tr><td>' + escAttr(h.operation_number || '') + '</td><td>' + escAttr(exp) + '</td><td>' + escAttr(orderNo) + '</td><td>' + escAttr(custName) + '</td><td style="text-align:right;font-weight:600">' + amt + '</td><td>' + dt + '</td><td><button type="button" class="btn btn-primary btn-small" data-accept-handover data-id="' + escAttr(h.id || '') + '" data-amount="' + escAttr(h.amount || '') + '" data-expeditor="' + escAttr(h.expeditor_login || '') + '">ÐÑÐ¸Ð½ÑÑÑ</button></td></tr>';
          });
          t += '</tbody></table></div>';
          div.innerHTML = t;
          div.querySelectorAll('th.sortable').forEach(function (thEl) {
            thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (cpSortCol === col) cpSortDir = -cpSortDir; else { cpSortCol = col; cpSortDir = 1; } renderCashPendingTable(lastCpData); };
          });
          div.querySelectorAll('[data-accept-handover]').forEach(function (btn) {
            btn.onclick = function () {
                var id = btn.getAttribute('data-id');
                var amount = btn.getAttribute('data-amount');
                var expeditor = btn.getAttribute('data-expeditor');
                if (!id) return;
                var formHtml = '<div class="form-group"><label>Ð¡ÑÐ¼Ð¼Ð° (Ð¾Ñ Ð¿ÐµÑÐµÐ´Ð°ÑÐ¸) <span style="color:#c00">*</span></label><input type="number" id="cr_amount" step="0.01" value="' + escAttr(amount || '') + '" required></div>';
                formHtml += '<div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ <span style="color:#c00">*</span></label><select id="cr_payment_type"><option value="cash_sum">ÐÐ°Ð»Ð¸ÑÐ½ÑÐµ</option></select></div>';
                formHtml += '<div class="form-group"><label>ÐÐ°ÑÑÐ¸Ñ <span style="color:#c00">*</span></label><select id="cr_cashier"></select></div>';
                formHtml += '<div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="cr_comment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
                showModal('ÐÑÐ¸ÑÐ¼ Ð½Ð°Ð»Ð¸ÑÐ½ÑÑ Ð² ÐºÐ°ÑÑÑ', formHtml, function (errEl) { return Promise.resolve(); });
                api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
                  var sel = document.getElementById('cr_cashier');
                  if (sel) {
                    userList = userList || [];
                    var me = (currentUser && currentUser.login) ? currentUser.login : '';
                    userList.forEach(function (u) {
                      var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' â ' + u.fio : ''); sel.appendChild(o);
                      if (u.login === me) sel.value = me;
                    });
                  }
                });
                api('/api/v1/dictionary/payment-types').catch(function () { return []; }).then(function (pts) {
                  var sel = document.getElementById('cr_payment_type');
                  if (sel && pts && pts.length) {
                    sel.innerHTML = '';
                    pts.forEach(function (pt) {
                      var o = document.createElement('option'); o.value = pt.code; o.textContent = pt.name || pt.code;
                      sel.appendChild(o);
                      if (pt.code === 'cash_sum') sel.value = 'cash_sum';
                    });
                  }
                });
                var submitBtn = document.createElement('button');
                submitBtn.type = 'button';
                submitBtn.className = 'btn btn-primary';
                submitBtn.textContent = 'ÐÑÐ¸Ð½ÑÑÑ Ð½Ð°Ð»Ð¸ÑÐ½ÑÐµ';
                document.getElementById('modalContainer').querySelector('.modal-actions').appendChild(submitBtn);
                submitBtn.onclick = function () {
                  var errEl = document.querySelector('#modalContainer .modal.show .err');
                  var amountVal = document.getElementById('cr_amount').value;
                  var payType = document.getElementById('cr_payment_type').value;
                  var cashier = document.getElementById('cr_cashier').value;
                  var comment = document.getElementById('cr_comment').value.trim() || null;
                  if (!amountVal || parseFloat(amountVal) <= 0) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÑÐ¼Ð¼Ñ.'; return; }
                  if (!cashier) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÐ°ÑÑÐ¸ÑÐ°.'; return; }
                  api('/api/v1/finances/accept-handover', { method: 'POST', body: JSON.stringify({ handover_operation_id: id, cashier_login: cashier, amount: parseFloat(amountVal), comment: comment || null }) }).then(function () {
                    var m = document.querySelector('#modalContainer .modal.show'); if (m) m.classList.remove('show');
                    loadPending();
                  }).catch(function (e) {
                    var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
                    var modalErr = document.querySelector('#modalContainer .modal.show .err');
                    if (modalErr) modalErr.textContent = msg;
                  });
                };
              };
            });
          }
        function loadPending() {
          api('/api/v1/finances/pending-handovers').then(function (res) {
            var data = (res && res.success && res.data) ? res.data : [];
            renderCashPendingTable(data);
          }).catch(function (e) {
            if (div) div.innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</p>';
          });
        }
        loadPending();
      }

      function loadSectionCashReceived() {
        var content = document.getElementById('content');
        var today = new Date();
        var todayStr = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
        content.innerHTML = '<div class="card"><h2>ÐÑÐ¸Ð½ÑÑÑÐµ Ð´ÐµÐ½ÑÐ³Ð¸ Ð·Ð° Ð¿ÐµÑÐ¸Ð¾Ð´</h2><p><label>ÐÐ°ÑÐ° Ñ </label><input type="text" id="cashDateFrom" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:130px"> <label>Ð¿Ð¾ </label><input type="text" id="cashDateTo" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:130px"> <button type="button" class="btn btn-primary" id="cashLoadReceived">ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ</button> <button type="button" class="btn btn-secondary" id="cashExportExcel">ÐÑÐ³ÑÑÐ·Ð¸ÑÑ Ð² Excel</button> <button type="button" class="btn btn-secondary" id="cashCreateManual">Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ Ð¿ÑÐ¸ÑÐ¼Ð° Ð¿Ð»Ð°ÑÐµÐ¶Ð° (Ð¾Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ°)</button></p><div id="cashReceivedList" style="margin-top:12px"><p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p></div></div>';
        var dateFromEl = document.getElementById('cashDateFrom');
        var dateToEl = document.getElementById('cashDateTo');
        if (dateFromEl) {
          dateFromEl.value = todayStr;
          if (window.flatpickr) window.flatpickr(dateFromEl, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
        }
        if (dateToEl) {
          dateToEl.value = todayStr;
          if (window.flatpickr) window.flatpickr(dateToEl, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
        }
        var crSortCol = 'operation_number';
        var crSortDir = 1;
        var lastCrData = null;
        var lastCrTotal = 0;
        function renderCashReceivedTable(data, total) {
          lastCrData = data;
          lastCrTotal = total || 0;
          var div = document.getElementById('cashReceivedList');
          if (!div || !data.length) {
            if (div) div.innerHTML = '<p style="color:#666">ÐÐµÑ Ð¿ÑÐ¸Ð½ÑÑÑÑ Ð´ÐµÐ½ÐµÐ³ Ð·Ð° Ð²ÑÐ±ÑÐ°Ð½Ð½ÑÐ¹ Ð¿ÐµÑÐ¸Ð¾Ð´.</p>';
            return;
          }
          var sorted = data.slice().sort(function (a, b) {
            return tableSortCompare(a, b, crSortCol, crSortDir, function (r, c) {
              if (c === 'amount') return (r.amount != null ? String(Number(r.amount)).padStart(20, '0') : '');
              return (r[c] || '').toString().toLowerCase();
            });
          });
          var arrow = crSortDir > 0 ? ' â²' : ' â¼';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (crSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr>' + th('operation_number', 'â Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ð¸') + th('amount', 'Ð¡ÑÐ¼Ð¼Ð°') + th('payment_type_code', 'Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ') + th('cashier_login', 'ÐÐ°ÑÑÐ¸Ñ') + '<th>ÐÑÑÐ¾ÑÐ½Ð¸Ðº</th>' + th('operation_date', 'ÐÐ°ÑÐ°') + '</tr></thead><tbody>';
          sorted.forEach(function (r) {
              var amt = (r.amount != null) ? Number(r.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 'â';
              var dt = r.operation_date ? formatDateOnly(r.operation_date) : 'â';
              var source = r.expeditor_login ? ('Ð¾Ñ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ° ' + r.expeditor_login) : (r.customer_id != null ? 'Ð¾Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ° (ID ' + r.customer_id + ')' : 'Ð¾Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ°');
              t += '<tr><td>' + escAttr(r.operation_number || '') + '</td><td style="text-align:right;font-weight:600">' + amt + '</td><td>' + escAttr(r.payment_type_code || '') + '</td><td>' + escAttr(r.cashier_login || '') + '</td><td>' + escAttr(source) + '</td><td>' + dt + '</td></tr>';
            });
          t += '</tbody></table></div><p style="margin-top:12px;font-weight:600">ÐÑÐ¾Ð³Ð¾ Ð·Ð° Ð¿ÐµÑÐ¸Ð¾Ð´: ' + lastCrTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ÑÑÐ¼</p>';
          div.innerHTML = t;
          div.querySelectorAll('th.sortable').forEach(function (thEl) {
            thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (crSortCol === col) crSortDir = -crSortDir; else { crSortCol = col; crSortDir = 1; } renderCashReceivedTable(lastCrData, lastCrTotal); };
          });
        }
        function dateToApiFormat(val) {
          if (!val || !(val = (val + '').trim())) return '';
          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
          var m = val.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
          if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
          return val;
        }
        function loadReceived() {
          var div = document.getElementById('cashReceivedList');
          var dateFromVal = dateToApiFormat(document.getElementById('cashDateFrom') ? document.getElementById('cashDateFrom').value : '');
          var dateToVal = dateToApiFormat(document.getElementById('cashDateTo') ? document.getElementById('cashDateTo').value : '');
          if (!div) return;
          var params = [];
          if (dateFromVal) params.push('date_from=' + encodeURIComponent(dateFromVal));
          if (dateToVal) params.push('date_to=' + encodeURIComponent(dateToVal));
          var url = '/api/v1/finances/cash-received' + (params.length ? '?' + params.join('&') : '');
          api(url).then(function (res) {
            var data = (res && res.data) ? res.data : [];
            var total = (res && res.total_amount != null) ? Number(res.total_amount) : 0;
            renderCashReceivedTable(data, total);
          }).catch(function (e) {
            div.innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</p>';
          });
        }
        document.getElementById('cashLoadReceived').onclick = loadReceived;
        loadReceived();
        document.getElementById('cashExportExcel').onclick = function () {
          var params = [];
          var df = document.getElementById('cashDateFrom'); var dt = document.getElementById('cashDateTo');
          var dfVal = dateToApiFormat(df ? df.value : ''); var dtVal = dateToApiFormat(dt ? dt.value : '');
          if (dfVal) params.push('date_from=' + encodeURIComponent(dfVal));
          if (dtVal) params.push('date_to=' + encodeURIComponent(dtVal));
          var url = window.location.origin + '/api/v1/finances/cash-received/export' + (params.length ? '?' + params.join('&') : '');
          fetch(url, { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
            if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
            return r.blob();
          }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cash_received.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function (e) { alert('ÐÑÐ¸Ð±ÐºÐ°: ' + (e && e.data && e.data.detail ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸')); });
        };
        document.getElementById('cashCreateManual').onclick = function () {
          var formHtml = '<div class="form-group"><label>Ð¡ÑÐ¼Ð¼Ð° <span style="color:#c00">*</span></label><input type="number" id="crm_amount" step="0.01" required></div>';
          formHtml += '<div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ <span style="color:#c00">*</span></label><select id="crm_payment_type"><option value="bank_sum">ÐÐ°Ð½ÐºÐ¾Ð²ÑÐºÐ¸Ð¹ Ð¿ÐµÑÐµÐ²Ð¾Ð´</option></select></div>';
          formHtml += '<div class="form-group"><label>ÐÐ°ÑÑÐ¸Ñ <span style="color:#c00">*</span></label><select id="crm_cashier"></select></div>';
          formHtml += '<div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ (ID)</label><input type="number" id="crm_customer_id" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          formHtml += '<div class="form-group"><label>ÐÐ°ÐºÐ°Ð· â</label><input type="number" id="crm_order_id" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          formHtml += '<div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="crm_comment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
          showModal('Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð¾Ð¿ÐµÑÐ°ÑÐ¸Ñ Ð¿ÑÐ¸ÑÐ¼Ð° Ð¿Ð»Ð°ÑÐµÐ¶Ð° (Ð¾Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ°)', formHtml, function (errEl) {
            var amountVal = document.getElementById('crm_amount').value;
            var payType = document.getElementById('crm_payment_type').value;
            var cashier = document.getElementById('crm_cashier').value;
            var custId = document.getElementById('crm_customer_id').value;
            var orderId = document.getElementById('crm_order_id').value;
            var comment = document.getElementById('crm_comment').value.trim() || null;
            if (!amountVal || parseFloat(amountVal) <= 0) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÑÐ¼Ð¼Ñ.'; return Promise.reject(); }
            if (!payType) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ.'; return Promise.reject(); }
            if (!cashier) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÐ°ÑÑÐ¸ÑÐ°.'; return Promise.reject(); }
            var payload = { amount: parseFloat(amountVal), payment_type_code: payType, cashier_login: cashier, comment: comment };
            if (custId && !isNaN(parseInt(custId, 10))) payload.customer_id = parseInt(custId, 10);
            if (orderId && !isNaN(parseInt(orderId, 10))) payload.order_id = parseInt(orderId, 10);
            return api('/api/v1/finances/cash-receipt-manual', { method: 'POST', body: JSON.stringify(payload) }).then(function () { loadReceived(); });
          });
          api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
            var sel = document.getElementById('crm_cashier');
            if (sel) {
              userList = userList || [];
              var me = (currentUser && currentUser.login) ? currentUser.login : '';
              userList.forEach(function (u) {
                var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' â ' + u.fio : ''); sel.appendChild(o);
                if (u.login === me) sel.value = me;
              });
            }
          });
          api('/api/v1/dictionary/payment-types').catch(function () { return []; }).then(function (pts) {
            var sel = document.getElementById('crm_payment_type');
            if (sel && pts && pts.length) {
              sel.innerHTML = '';
              pts.forEach(function (pt) {
                var o = document.createElement('option'); o.value = pt.code; o.textContent = pt.name || pt.code;
                sel.appendChild(o);
                if (pt.code === 'bank_sum') sel.value = 'bank_sum';
              });
            }
          });
        };
        loadReceived();
      }

      function loadSectionCashierOrders() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÐ°ÐºÐ°Ð·Ñ Ð´Ð»Ñ Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¸Ñ Ð¾Ð¿Ð»Ð°ÑÑ</h2><p style="color:#666;margin-bottom:12px">ÐÐ°ÐºÐ°Ð·Ñ Ñ ÑÐºÐ°Ð·Ð°Ð½Ð½ÑÐ¼ ÑÐ¸Ð¿Ð¾Ð¼ Ð¾Ð¿Ð»Ð°ÑÑ. ÐÐ¾Ð´ÑÐ²ÐµÑÐ´Ð¸ÑÐµ Ð¿ÑÐ¸ÑÐ¼ Ð´ÐµÐ½ÐµÐ³ Ð¿Ð¾ ÐºÐ°Ð¶Ð´Ð¾Ð¼Ñ Ð·Ð°ÐºÐ°Ð·Ñ.</p><div style="margin-bottom:12px;display:flex;flex-wrap:wrap;align-items:flex-end;gap:8px 16px"><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ</label><select id="cof_payment_type" style="max-width:180px"><option value="">â ÐÑÐµ â</option></select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¡ÑÐ°ÑÑÑ</label><select id="cof_status" style="max-width:160px"><option value="">â ÐÑÐµ â</option></select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ¿Ð»Ð°ÑÐ° Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð°</label><select id="cof_payment_confirmed" style="max-width:160px"><option value="">ÐÑÐµ</option><option value="true">ÐÐ¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¾</option><option value="false">ÐÐµ Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¾</option></select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ñ</label><input type="text" id="cof_date_from" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:130px"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ð¿Ð¾</label><input type="text" id="cof_date_to" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:130px"></div><button type="button" class="btn btn-primary" id="cof_apply">ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ</button> <button type="button" class="btn btn-secondary" id="cashierOrdersExport">ÐÑÐ³ÑÑÐ·Ð¸ÑÑ Ð² Excel</button></div><div id="cashierOrdersList" style="margin-top:12px"><p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p></div></div>';
        var div = document.getElementById('cashierOrdersList');
        if (window.flatpickr) {
          var cofDf = document.getElementById('cof_date_from');
          var cofDt = document.getElementById('cof_date_to');
          if (cofDf) window.flatpickr(cofDf, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
          if (cofDt) window.flatpickr(cofDt, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
        }
        function renderCashierOrdersTable(data) {
          if (!div) return;
          if (!data || !data.length) {
            div.innerHTML = '<p style="color:#666">ÐÐµÑ Ð·Ð°ÐºÐ°Ð·Ð¾Ð² Ñ ÑÐ¸Ð¿Ð¾Ð¼ Ð¾Ð¿Ð»Ð°ÑÑ.</p>';
            return;
          }
          var t = '<div style="overflow-x:auto"><table><thead><tr><th>â Ð·Ð°ÐºÐ°Ð·Ð°</th><th>ÐÐ»Ð¸ÐµÐ½Ñ</th><th>ÐÐÐ</th><th>Ð /Ð¡</th><th>ÐÐ³ÐµÐ½Ñ</th><th>Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾Ñ</th><th>Ð¡ÑÐ¼Ð¼Ð°</th><th>Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ</th><th>Ð¡ÑÐ°ÑÑÑ</th><th>ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð°</th><th>ÐÐ¿Ð»Ð°ÑÐ° Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð°</th><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
          data.forEach(function (r) {
            var amt = (r.total_amount != null) ? Number(r.total_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 'â';
            var payConfirmed = r.payment_confirmed ? '<span class="status-badge status-badge--completed">ÐÐ¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¾</span>' : '<span class="status-badge status-badge--pending">ÐÐµ Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¾</span>';
            var confirmBtn = r.payment_confirmed ? '' : '<button type="button" class="btn btn-primary btn-small" data-order-no="' + escAttr(r.order_no) + '" data-customer-id="' + (r.customer_id || '') + '" data-amount="' + (r.total_amount != null ? r.total_amount : '') + '" data-payment-type="' + escAttr(r.payment_type_code || '') + '">ÐÐ¾Ð´ÑÐ²ÐµÑÐ´Ð¸ÑÑ Ð¾Ð¿Ð»Ð°ÑÑ</button>';
            var deliveryDate = 'â';
            if (r.scheduled_delivery_at) {
              try {
                var d = parseBackendDate(r.scheduled_delivery_at);
                if (!d) throw new Error('Invalid date');
                deliveryDate = d.toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              } catch (e) { deliveryDate = r.scheduled_delivery_at; }
            }
            t += '<tr><td>' + escAttr(r.order_no || '') + '</td><td>' + escAttr(r.customer_name || 'â') + '</td><td>' + escAttr(r.tax_id || 'â') + '</td><td>' + escAttr(r.account_no || 'â') + '</td><td>' + escAttr(r.agent_name || r.login_agent || 'â') + '</td><td>' + escAttr(r.expeditor_name || r.login_expeditor || 'â') + '</td><td style="text-align:right;font-weight:600">' + amt + '</td><td>' + escAttr(r.payment_type_name || r.payment_type_code || '') + '</td><td>' + escAttr(r.status_name || r.status_code || '') + '</td><td>' + deliveryDate + '</td><td>' + payConfirmed + '</td><td>' + confirmBtn + '</td></tr>';
          });
          t += '</tbody></table></div>';
          div.innerHTML = t;
          div.querySelectorAll('button[data-order-no]').forEach(function (btn) {
            btn.onclick = function () {
              var orderNo = parseInt(btn.getAttribute('data-order-no'), 10);
              var customerId = btn.getAttribute('data-customer-id');
              var amount = btn.getAttribute('data-amount');
              var paymentType = btn.getAttribute('data-payment-type');
              openCashierConfirmModal(orderNo, customerId ? parseInt(customerId, 10) : null, amount ? parseFloat(amount) : null, paymentType, function () { loadCashierOrders(); });
            };
          });
        }
        document.getElementById('cashierOrdersExport').onclick = function () {
          var pt = document.getElementById('cof_payment_type') && document.getElementById('cof_payment_type').value;
          var st = document.getElementById('cof_status') && document.getElementById('cof_status').value;
          var pc = document.getElementById('cof_payment_confirmed') && document.getElementById('cof_payment_confirmed').value;
          var df = document.getElementById('cof_date_from') && document.getElementById('cof_date_from').value;
          var dt = document.getElementById('cof_date_to') && document.getElementById('cof_date_to').value;
          var params = [];
          if (pt) params.push('payment_type_code=' + encodeURIComponent(pt));
          if (st) params.push('status_code=' + encodeURIComponent(st));
          if (pc) params.push('payment_confirmed=' + encodeURIComponent(pc));
          if (df) params.push('scheduled_delivery_from=' + encodeURIComponent(dateToApiFormatCof(df)));
          if (dt) params.push('scheduled_delivery_to=' + encodeURIComponent(dateToApiFormatCof(dt)));
          var url = window.location.origin + '/api/v1/finances/orders-for-confirmation/export' + (params.length ? '?' + params.join('&') : '');
          fetch(url, { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
            if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
            return r.blob();
          }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders_for_confirmation.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function (e) { alert('ÐÑÐ¸Ð±ÐºÐ°: ' + (e && e.data && e.data.detail ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸')); });
        };
        function dateToApiFormatCof(val) {
          if (!val || !(val + '').trim()) return '';
          var v = (val + '').trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
          var m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
          if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
          return v;
        }
        function loadCashierOrders() {
          var pt = document.getElementById('cof_payment_type') && document.getElementById('cof_payment_type').value;
          var st = document.getElementById('cof_status') && document.getElementById('cof_status').value;
          var pc = document.getElementById('cof_payment_confirmed') && document.getElementById('cof_payment_confirmed').value;
          var df = document.getElementById('cof_date_from') && document.getElementById('cof_date_from').value;
          var dt = document.getElementById('cof_date_to') && document.getElementById('cof_date_to').value;
          var params = [];
          if (pt) params.push('payment_type_code=' + encodeURIComponent(pt));
          if (st) params.push('status_code=' + encodeURIComponent(st));
          if (pc) params.push('payment_confirmed=' + encodeURIComponent(pc));
          if (df) params.push('scheduled_delivery_from=' + encodeURIComponent(dateToApiFormatCof(df)));
          if (dt) params.push('scheduled_delivery_to=' + encodeURIComponent(dateToApiFormatCof(dt)));
          var url = '/api/v1/finances/orders-for-confirmation' + (params.length ? '?' + params.join('&') : '');
          api(url).then(function (res) {
            if (res && res.success === false && res.error) {
              if (div) div.innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ°: ' + escAttr(res.error) + '</p>';
              return;
            }
            var data = (res && res.data) ? res.data : [];
            renderCashierOrdersTable(data);
          }).catch(function (e) {
            var msg = 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸';
            if (e && e.data) {
              if (typeof e.data.detail === 'string') msg = e.data.detail;
              else if (e.data.detail) msg = JSON.stringify(e.data.detail);
            }
            if (e && e.status === 404) msg = 'API Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½ (404). ÐÐµÑÐµÐ·Ð°Ð¿ÑÑÑÐ¸ÑÐµ ÑÐµÑÐ²ÐµÑ Ð¸ Ð¾Ð±Ð½Ð¾Ð²Ð¸ÑÐµ ÑÑÑÐ°Ð½Ð¸ÑÑ.';
            if (div) div.innerHTML = '<p class="err">' + escAttr(msg) + '</p>';
          });
        }
        document.getElementById('cof_apply').onclick = loadCashierOrders;
        Promise.all([
          api('/api/v1/dictionary/payment-types').catch(function () { return []; }),
          api('/api/v1/orders/statuses').catch(function () { return []; })
        ]).then(function (results) {
          var pts = results[0] || [];
          var sts = results[1] || [];
          var ptSel = document.getElementById('cof_payment_type');
          var stSel = document.getElementById('cof_status');
          if (ptSel) {
            ptSel.innerHTML = '<option value="">â ÐÑÐµ â</option>';
            pts.forEach(function (p) { var o = document.createElement('option'); o.value = p.code; o.textContent = p.name || p.code; ptSel.appendChild(o); });
          }
          if (stSel) {
            stSel.innerHTML = '<option value="">â ÐÑÐµ â</option>';
            sts.forEach(function (s) { var o = document.createElement('option'); o.value = s.code; o.textContent = s.name || s.code; stSel.appendChild(o); });
          }
          loadCashierOrders();
        });
      }

      function openCashierConfirmModal(orderNo, customerId, amount, paymentType, onSuccess) {
        var formHtml = '<div class="form-group"><label>ÐÐ°ÐºÐ°Ð· â</label><div class="form-readonly">' + escAttr(orderNo) + '</div></div>';
        formHtml += '<div class="form-group"><label>Ð¡ÑÐ¼Ð¼Ð° <span style="color:#c00">*</span></label><input type="number" id="ccm_amount" step="0.01" value="' + (amount != null && !isNaN(amount) ? amount : '') + '" required></div>';
        formHtml += '<div class="form-group"><label>Ð¢Ð¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ <span style="color:#c00">*</span></label><select id="ccm_payment_type"></select></div>';
        formHtml += '<div class="form-group"><label>ÐÐ°ÑÑÐ¸Ñ <span style="color:#c00">*</span></label><select id="ccm_cashier"></select></div>';
        formHtml += '<div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ (ID)</label><input type="number" id="ccm_customer_id" value="' + (customerId != null && !isNaN(customerId) ? customerId : '') + '" readonly class="from-order"></div>';
        formHtml += '<div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><input type="text" id="ccm_comment" placeholder="Ð½ÐµÐ¾Ð±ÑÐ·."></div>';
        showModal('ÐÐ¾Ð´ÑÐ²ÐµÑÐ´Ð¸ÑÑ Ð¿ÑÐ¸ÑÐ¼ Ð´ÐµÐ½ÐµÐ³ Ð¿Ð¾ Ð·Ð°ÐºÐ°Ð·Ñ â' + orderNo, formHtml, function (errEl) {
          var amountVal = document.getElementById('ccm_amount').value;
          var payType = document.getElementById('ccm_payment_type').value;
          var cashier = document.getElementById('ccm_cashier').value;
          var comment = document.getElementById('ccm_comment').value.trim() || null;
          if (!amountVal || parseFloat(amountVal) <= 0) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÑÐ¼Ð¼Ñ.'; return Promise.reject(); }
          if (!payType) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÐ¸Ð¿ Ð¾Ð¿Ð»Ð°ÑÑ.'; return Promise.reject(); }
          if (!cashier) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÐºÐ°ÑÑÐ¸ÑÐ°.'; return Promise.reject(); }
          var payload = { amount: parseFloat(amountVal), payment_type_code: payType, cashier_login: cashier, order_id: orderNo, comment: comment };
          if (customerId != null && !isNaN(customerId)) payload.customer_id = customerId;
          return api('/api/v1/finances/cash-receipt-manual', { method: 'POST', body: JSON.stringify(payload) }).then(function () { if (onSuccess) onSuccess(); });
        });
        api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
          var sel = document.getElementById('ccm_cashier');
          if (sel && userList && userList.length) {
            sel.innerHTML = '';
            var me = (currentUser && currentUser.login) ? currentUser.login : '';
            userList.forEach(function (u) {
              var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' â ' + u.fio : ''); sel.appendChild(o);
              if (u.login === me) sel.value = me;
            });
          }
        });
        api('/api/v1/dictionary/payment-types').catch(function () { return []; }).then(function (pts) {
          var sel = document.getElementById('ccm_payment_type');
          if (sel && pts && pts.length) {
            sel.innerHTML = '';
            pts.forEach(function (pt) {
              var o = document.createElement('option'); o.value = pt.code; o.textContent = pt.name || pt.code;
              sel.appendChild(o);
            });
            sel.value = pts.some(function (p) { return p.code === 'bank_sum'; }) ? 'bank_sum' : (pts[0] ? pts[0].code : '');
          }
        });
      }

      function loadSectionVisitsSearch() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÐ¾Ð¸ÑÐº Ð²Ð¸Ð·Ð¸ÑÐ°</h2><div class="form-group" style="margin:12px 0"><label>ÐÐ¾Ð¸ÑÐº</label></div><div id="vsSearchRow" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"></div><p><strong>Ð ÐµÐ·ÑÐ»ÑÑÐ°ÑÑ</strong> (<span id="vs_total">0</span>):</p><div id="vs_table"></div></div>';
        var searchRow = document.getElementById('vsSearchRow');
        api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
          userList = userList || [];
          var respOpts = '<option value="">ÐÑÐµ ÑÐ¾ÑÑÑÐ´Ð½Ð¸ÐºÐ¸</option>';
          userList.forEach(function (u) { respOpts += '<option value="' + escAttr(u.login) + '">' + escAttr((u.login || '') + (u.fio ? ' â ' + u.fio : '')) + '</option>'; });
          var statusOptions = [
            { code: 'planned', label: 'ÐÐ°Ð¿Ð»Ð°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½' },
            { code: 'postponed', label: 'ÐÐ° ÑÐ°ÑÑÐ¼Ð¾ÑÑÐµÐ½Ð¸Ð¸' },
            { code: 'completed', label: 'ÐÐ°Ð²ÐµÑÑÑÐ½' },
            { code: 'cancelled', label: 'ÐÑÐ¼ÐµÐ½ÑÐ½' }
          ];
          var statusHtml = '<div class="multiselect-status" id="vs_status_container"><div class="multiselect-trigger" id="vs_status_trigger"><div class="multiselect-tags" id="vs_status_tags"></div><button type="button" class="multiselect-clear" id="vs_status_clear" title="ÐÑÐ¸ÑÑÐ¸ÑÑ">Ã</button><span class="multiselect-arrow">â¼</span></div><div class="multiselect-dropdown" id="vs_status_dropdown">';
          statusOptions.forEach(function (o) {
            statusHtml += '<label><input type="checkbox" value="' + escAttr(o.code) + '" id="vs_status_' + o.code + '"> ' + escAttr(o.label) + '</label>';
          });
          statusHtml += '</div></div>';
          searchRow.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:6px"><label style="font-size:11px;color:#666;display:block;margin-bottom:2px;width:100%">ÐÐ»Ð¸ÐµÐ½Ñ</label><input type="text" id="vs_customer_search" placeholder="ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð¸Ð»Ð¸ ÐÐÐ" style="max-width:120px" title="ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð¼Ð¸Ð½. 2 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð°"><select id="vs_customer_pick" style="max-width:200px"><option value="">â ÐÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÑ â</option></select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¡ÑÐ°ÑÑÑ</label>' + statusHtml + '</div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹</label><select id="vs_responsible" style="max-width:160px">' + respOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">ÐÐ°ÑÐ° Ð¾Ñ</label><input type="text" id="vs_from" style="max-width:130px" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Ð¿Ð¾</label><input type="text" id="vs_to" style="max-width:130px" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³"></div><button type="button" class="btn btn-primary" id="vs_find">ÐÐ°Ð¹ÑÐ¸</button> <button type="button" class="btn btn-secondary" id="vs_reset">Ð¡Ð±ÑÐ¾ÑÐ¸ÑÑ</button> <button type="button" class="btn btn-secondary" id="vs_export">ÐÑÐ³ÑÑÐ·Ð¸ÑÑ Ð² Excel</button>';
          ['planned', 'postponed'].forEach(function (c) { var cb = document.getElementById('vs_status_' + c); if (cb) cb.checked = true; });
          ['completed', 'cancelled'].forEach(function (c) { var cb = document.getElementById('vs_status_' + c); if (cb) cb.checked = false; });
          function renderVsStatusTags() {
            var tagsEl = document.getElementById('vs_status_tags');
            if (!tagsEl) return;
            var selected = [];
            statusOptions.forEach(function (o) {
              var cb = document.getElementById('vs_status_' + o.code);
              if (cb && cb.checked) selected.push(o);
            });
            if (selected.length === 0) {
              tagsEl.innerHTML = '<span class="multiselect-placeholder">ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÑÐ°ÑÑÑÑ</span>';
              return;
            }
            var html = '';
            var showCount = 1;
            selected.slice(0, showCount).forEach(function (o) {
              html += '<span class="multiselect-tag" data-code="' + escAttr(o.code) + '">' + escAttr(o.label) + ' <span class="multiselect-tag-remove">Ã</span></span>';
            });
            if (selected.length > showCount) {
              html += '<span class="multiselect-plus">+' + (selected.length - showCount) + '</span>';
            }
            tagsEl.innerHTML = html;
            tagsEl.querySelectorAll('.multiselect-tag-remove').forEach(function (btn) {
              btn.onclick = function (e) {
                e.stopPropagation();
                var code = btn.closest('.multiselect-tag').getAttribute('data-code');
                var cb = document.getElementById('vs_status_' + code);
                if (cb) cb.checked = false;
                renderVsStatusTags();
              };
            });
          }
          renderVsStatusTags();
          var vsContainer = document.getElementById('vs_status_container');
          var vsTrigger = document.getElementById('vs_status_trigger');
          var vsDropdown = document.getElementById('vs_status_dropdown');
          var vsClear = document.getElementById('vs_status_clear');
          if (vsTrigger) vsTrigger.onclick = function (e) {
            if (e.target.closest('.multiselect-clear') || e.target.closest('.multiselect-tag-remove')) return;
            vsContainer.classList.toggle('open');
          };
          vsContainer.querySelectorAll('.multiselect-dropdown input[type="checkbox"]').forEach(function (cb) {
            cb.onclick = function (e) { e.stopPropagation(); renderVsStatusTags(); };
          });
          vsDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
          if (vsClear) vsClear.onclick = function (e) {
            e.stopPropagation();
            statusOptions.forEach(function (o) {
              var cb = document.getElementById('vs_status_' + o.code);
              if (cb) cb.checked = false;
            });
            renderVsStatusTags();
          };
          document.addEventListener('click', function closeVsStatus(e) {
            if (vsContainer && !vsContainer.contains(e.target)) vsContainer.classList.remove('open');
          });
          if (window.flatpickr) {
            var df = document.getElementById('vs_from');
            var dt = document.getElementById('vs_to');
            if (df) window.flatpickr(df, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
            if (dt) window.flatpickr(dt, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
          }
          var vsFindBtn = document.getElementById('vs_find');
          var vsResetBtn = document.getElementById('vs_reset');
          if (vsFindBtn) vsFindBtn.onclick = runSearch;
          if (vsResetBtn) vsResetBtn.onclick = function () {
            document.getElementById('vs_customer_search').value = '';
            document.getElementById('vs_customer_pick').innerHTML = '<option value="">â ÐÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÑ â</option>';
            ['planned', 'postponed'].forEach(function (code) {
              var cb = document.getElementById('vs_status_' + code);
              if (cb) cb.checked = true;
            });
            ['completed', 'cancelled'].forEach(function (code) {
              var cb = document.getElementById('vs_status_' + code);
              if (cb) cb.checked = false;
            });
            renderVsStatusTags();
            document.getElementById('vs_responsible').value = '';
            document.getElementById('vs_from').value = '';
            document.getElementById('vs_to').value = '';
            document.getElementById('vs_table').innerHTML = '';
            document.getElementById('vs_total').textContent = '0';
          };
          var vsExportBtn = document.getElementById('vs_export');
          if (vsExportBtn) vsExportBtn.onclick = function () {
            var params = [];
            var customer_id = document.getElementById('vs_customer_pick') && document.getElementById('vs_customer_pick').value;
            var customer_name = document.getElementById('vs_customer_search') && document.getElementById('vs_customer_search').value.trim();
            var statuses = [];
            ['planned', 'postponed', 'completed', 'cancelled'].forEach(function (code) {
              var cb = document.getElementById('vs_status_' + code);
              if (cb && cb.checked) statuses.push(code);
            });
            var status = statuses.length ? statuses.join(',') : '';
            var responsible = document.getElementById('vs_responsible') && document.getElementById('vs_responsible').value;
            var from = document.getElementById('vs_from') && document.getElementById('vs_from').value;
            var to = document.getElementById('vs_to') && document.getElementById('vs_to').value;
            if (customer_id) params.push('customer_id=' + encodeURIComponent(customer_id));
            else if (customer_name) params.push('customer_name=' + encodeURIComponent(customer_name));
            if (status) params.push('status=' + encodeURIComponent(status));
            if (responsible) params.push('responsible_login=' + encodeURIComponent(responsible));
            if (from) params.push('from_date=' + encodeURIComponent(from));
            if (to) params.push('to_date=' + encodeURIComponent(to));
            var url = window.location.origin + '/api/v1/visits/export' + (params.length ? '?' + params.join('&') : '');
            fetch(url, { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
              return r.blob();
            }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'visits.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function (e) { alert('ÐÑÐ¸Ð±ÐºÐ°: ' + (e && e.data && e.data.detail ? e.data.detail : 'ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸')); });
          };
          var vsSearch = document.getElementById('vs_customer_search');
          var vsPick = document.getElementById('vs_customer_pick');
          if (vsSearch && vsPick) {
            var lookupTimer = null;
            var runLookup = function (q) {
              q = (q || '').trim();
              if (q.length < 2) return;
              api('/api/v1/customers?search=' + encodeURIComponent(q) + '&limit=20').then(function (list) {
                list = list || [];
                vsPick.innerHTML = '<option value="">â ÐÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÑ â</option>';
                list.forEach(function (c) {
                  var name = (c.name_client || c.firm_name || '').trim() || ('ÐÐ»Ð¸ÐµÐ½Ñ #' + c.id);
                  var label = 'â ' + name + (c.tax_id ? ' (ÐÐÐ ' + c.tax_id + ')' : '');
                  var o = document.createElement('option');
                  o.value = c.id;
                  o.textContent = label;
                  vsPick.appendChild(o);
                });
                if (list.length === 1) vsPick.value = list[0].id;
              }).catch(function () { /* ignore */ });
            };
            vsSearch.oninput = function () {
              var q = vsSearch.value || '';
              if (lookupTimer) clearTimeout(lookupTimer);
              if (q.trim().length < 2) return;
              lookupTimer = setTimeout(function () { runLookup(q); }, 300);
            };
          }
          runSearch();
        });
        function openVisitCardModal(visitId, refreshCallback) {
          api('/api/v1/visits/' + visitId).then(function (visit) {
            api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
              userList = userList || [];
              var dateStr = visit.visit_date ? formatDateOnly(visit.visit_date) : 'â';
              var timeStr = (visit.visit_time || '').toString().substring(0, 5) || 'â';
              var dtCombined = (dateStr + (timeStr && timeStr !== 'â' ? ' ' + timeStr : '')).trim() || 'â';
              var body = '<div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ</label><div>' + escAttr(visit.customer_name || '') + '</div></div><div class="form-group"><label>ÐÐ°ÑÐ° Ð¸ Ð²ÑÐµÐ¼Ñ</label><div>' + escAttr(dtCombined) + '</div></div><div class="form-group"><label>Ð¡ÑÐ°ÑÑÑ</label><div>' + escAttr(visitStatusRu(visit.status)) + '</div></div><div class="form-group"><label>ÐÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹</label><div>' + escAttr(visit.responsible_name || visit.responsible_login || '') + '</div></div>' + (visit.comment ? '<div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><div>' + escAttr(visit.comment) + '</div></div>' : '') + '<p style="text-align:center"><button type="button" class="btn btn-secondary" id="vcard_edit">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button></p>';
              showModal('ÐÐ°ÑÑÐ¾ÑÐºÐ° Ð²Ð¸Ð·Ð¸ÑÐ°', body, function () { return Promise.resolve(); });
              var saveBtn = document.querySelector('#modalContainer .modal-actions .btn-primary');
              if (saveBtn) saveBtn.textContent = 'ÐÐ°ÐºÑÑÑÑ';
              var editBtn = document.getElementById('vcard_edit');
              if (editBtn) editBtn.onclick = function () {
                document.querySelector('#modalContainer .modal.show') && document.querySelector('#modalContainer .modal.show').classList.remove('show');
                openVisitEditModal(visit.customer_id, visit, userList, refreshCallback || function () {});
              };
            });
          }).catch(function (e) {
            var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ°';
            alert(msg);
          });
        }
        var vsSortCol = 'visit_date';
        var vsSortDir = 1;
        var lastVsData = null;
        function renderVisitsTable(data) {
          if (!data || !data.length) { document.getElementById('vs_table').innerHTML = '<p>ÐÐµÑ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð².</p>'; return; }
          var sorted = data.slice().sort(function (a, b) { return tableSortCompare(a, b, vsSortCol, vsSortDir); });
          var arrow = vsSortDir > 0 ? ' â²' : ' â¼';
          var thf = function (c, lbl) { return '<th class="sortable" data-col="' + c + '" style="cursor:pointer">' + lbl + (vsSortCol === c ? arrow : '') + '</th>'; };
          var tb = '<div style="overflow-x:auto"><table><thead><tr>' + thf('visit_date', 'ÐÐ°ÑÐ° Ð¸ Ð²ÑÐµÐ¼Ñ') + thf('customer_name', 'ÐÐ»Ð¸ÐµÐ½Ñ') + thf('status', 'Ð¡ÑÐ°ÑÑÑ') + thf('responsible_login', 'ÐÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹') + '<th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
          sorted.forEach(function (v) {
            var sc = 'status-badge--default';
            if (v.status === 'completed') sc = 'status-badge--completed';
            else if (v.status === 'cancelled') sc = 'status-badge--cancelled';
            else if (v.status === 'planned') sc = 'status-badge--delivery';
            var ds = v.visit_date ? formatDateOnly(v.visit_date) : 'â';
            var ts = (v.visit_time || '').toString().substring(0, 5) || '';
            var dtCombined = (ds + (ts && ts !== 'â' ? ' ' + ts : '')).trim();
            var sru = visitStatusRu(v.status);
            tb += '<tr><td>' + escAttr(dtCombined) + '</td><td>' + escAttr(v.customer_name || '') + '</td><td><span class="status-badge ' + sc + '">' + escAttr(sru) + '</span></td><td>' + escAttr(v.responsible_name || v.responsible_login || '') + '</td><td><button type="button" class="btn btn-secondary btn-small" data-visit-id="' + (v.id || '') + '">ÐÑÐºÑÑÑÑ</button></td></tr>';
          });
          tb += '</tbody></table></div>';
          document.getElementById('vs_table').innerHTML = tb;
          document.getElementById('vs_table').querySelectorAll('th.sortable').forEach(function (t) {
            t.onclick = function () { var col = t.getAttribute('data-col'); if (vsSortCol === col) vsSortDir = -vsSortDir; else { vsSortCol = col; vsSortDir = 1; } renderVisitsTable(lastVsData); };
          });
          document.getElementById('vs_table').querySelectorAll('[data-visit-id]').forEach(function (b) {
            b.onclick = function () { openVisitCardModal(b.getAttribute('data-visit-id'), runSearch); };
          });
        }
        function runSearch() {
          var params = ['limit=50', 'offset=0'];
          var customer_id = document.getElementById('vs_customer_pick') && document.getElementById('vs_customer_pick').value;
          var customer_name = document.getElementById('vs_customer_search') && document.getElementById('vs_customer_search').value.trim();
          var statuses = [];
          ['planned', 'postponed', 'completed', 'cancelled'].forEach(function (code) {
            var cb = document.getElementById('vs_status_' + code);
            if (cb && cb.checked) statuses.push(code);
          });
          var status = statuses.length ? statuses.join(',') : '';
          var responsible = document.getElementById('vs_responsible') && document.getElementById('vs_responsible').value;
          var from = document.getElementById('vs_from') && document.getElementById('vs_from').value;
          var to = document.getElementById('vs_to') && document.getElementById('vs_to').value;
          if (customer_id) params.push('customer_id=' + encodeURIComponent(customer_id));
          else if (customer_name) params.push('customer_name=' + encodeURIComponent(customer_name));
          if (status) params.push('status=' + encodeURIComponent(status));
          if (responsible) params.push('responsible_login=' + encodeURIComponent(responsible));
          if (from) params.push('from_date=' + encodeURIComponent(from));
          if (to) params.push('to_date=' + encodeURIComponent(to));
          document.getElementById('vs_table').innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
          api('/api/v1/visits/search?' + params.join('&')).then(function (res) {
            var total = (res && res.total != null) ? res.total : 0;
            var data = (res && res.data) ? res.data : [];
            lastVsData = data;
            document.getElementById('vs_total').textContent = total;
            if (!data.length) { document.getElementById('vs_table').innerHTML = '<p>ÐÐµÑ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð².</p>'; return; }
            renderVisitsTable(data);
          }).catch(function (e) {
            var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ°';
            document.getElementById('vs_table').innerHTML = '<p class="err">' + escAttr(msg) + '</p>';
          });
        }
      }

      function openVisitAddModal(customerId, userList, refreshVisits) {
        var respOpts = '<option value="">â ÐÐµ Ð½Ð°Ð·Ð½Ð°ÑÐµÐ½ â</option>';
        (userList || []).forEach(function (u) { respOpts += '<option value="' + escAttr(u.login) + '">' + escAttr((u.fio || u.login) + '') + '</option>'; });
        var formHtml = '<div class="form-group"><label>ÐÐ°ÑÐ° Ð²Ð¸Ð·Ð¸ÑÐ° *</label><input type="text" id="v_date" placeholder="ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð´Ð°ÑÑ" readonly style="cursor:pointer;background:#fff"></div><div class="form-group"><label>ÐÑÐµÐ¼Ñ</label><input type="time" id="v_time"></div><div class="form-group"><label>Ð¡ÑÐ°ÑÑÑ</label><select id="v_status"><option value="planned">ÐÐ°Ð¿Ð»Ð°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½</option><option value="completed">ÐÐ°Ð²ÐµÑÑÑÐ½</option><option value="cancelled">ÐÑÐ¼ÐµÐ½ÑÐ½</option><option value="postponed">ÐÐ° ÑÐ°ÑÑÐ¼Ð¾ÑÑÐµÐ½Ð¸Ð¸</option></select></div><div class="form-group"><label>ÐÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹</label><select id="v_resp">' + respOpts + '</select></div><div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><textarea id="v_comment" rows="3" maxlength="5000" placeholder="ÐÑÐ¸ ÑÑÐ°ÑÑÑÐµ Â«ÐÐ°Ð²ÐµÑÑÑÐ½Â» ÑÐºÐ°Ð¶Ð¸ÑÐµ, ÑÑÐ¾ Ð±ÑÐ»Ð¾ ÑÐ´ÐµÐ»Ð°Ð½Ð¾ (Ð¼Ð¸Ð½. 10 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð²)"></textarea><p id="v_comment_cnt" style="font-size:12px;color:#666">0 / 5000</p></div>';
        showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð²Ð¸Ð·Ð¸Ñ', formHtml, function (errEl) {
          var d = document.getElementById('v_date') && document.getElementById('v_date').value;
          var t = document.getElementById('v_time') && document.getElementById('v_time').value;
          var s = document.getElementById('v_status') && document.getElementById('v_status').value;
          var r = document.getElementById('v_resp') && document.getElementById('v_resp').value;
          var c = (document.getElementById('v_comment') && document.getElementById('v_comment').value.trim()) || null;
          if (!d) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ Ð´Ð°ÑÑ Ð²Ð¸Ð·Ð¸ÑÐ°.'; return; }
          if (s === 'completed' && (!c || c.length < 10)) { if (errEl) errEl.textContent = 'ÐÑÐ¸ ÑÑÐ°ÑÑÑÐµ Â«ÐÐ°Ð²ÐµÑÑÑÐ½Â» ÑÐºÐ°Ð¶Ð¸ÑÐµ, ÑÑÐ¾ Ð±ÑÐ»Ð¾ ÑÐ´ÐµÐ»Ð°Ð½Ð¾ Ð½Ð° Ð²Ð¸Ð·Ð¸ÑÐµ (Ð¼Ð¸Ð½Ð¸Ð¼ÑÐ¼ 10 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð²).'; return; }
          if (s === 'completed' && c.length > 5000) { if (errEl) errEl.textContent = 'ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹ Ð½Ðµ Ð±Ð¾Ð»ÐµÐµ 5000 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð².'; return; }
          var body = { visit_date: d, status: s, responsible_login: r || null, comment: c };
          if (t) body.visit_time = t + (t.length === 5 ? ':00' : '');
          return api('/api/v1/customers/' + customerId + '/visits', { method: 'POST', body: JSON.stringify(body) }).then(refreshVisits);
        });
        setTimeout(function () {
          var vDate = document.getElementById('v_date');
          if (vDate && window.flatpickr) window.flatpickr(vDate, { locale: 'ru', dateFormat: 'Y-m-d' });
          var vResp = document.getElementById('v_resp');
          if (vResp && currentUser && currentUser.login) vResp.value = currentUser.login;
          var vComment = document.getElementById('v_comment');
          var vCnt = document.getElementById('v_comment_cnt');
          if (vComment && vCnt) { vComment.oninput = function () { vCnt.textContent = vComment.value.length + ' / 5000'; }; vCnt.textContent = vComment.value.length + ' / 5000'; }
        }, 100);
      }

      function openVisitEditModal(customerId, visit, userList, refreshVisits) {
        if (visit.status === 'cancelled') {
          showModal('ÐÐ¸Ð·Ð¸Ñ Ð¾ÑÐ¼ÐµÐ½ÑÐ½', '<p>ÐÑÐ¼ÐµÐ½ÑÐ½Ð½ÑÐ¹ Ð²Ð¸Ð·Ð¸Ñ Ð½ÐµÐ»ÑÐ·Ñ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°ÑÑ. Ð¡Ð¾Ð·Ð´Ð°Ð¹ÑÐµ Ð½Ð¾Ð²ÑÐ¹ Ð²Ð¸Ð·Ð¸Ñ Ð¿ÑÐ¸ Ð½ÐµÐ¾Ð±ÑÐ¾Ð´Ð¸Ð¼Ð¾ÑÑÐ¸.</p>', function () { return Promise.resolve(); });
          return;
        }
        var respOpts = '';
        (userList || []).forEach(function (u) { respOpts += '<option value="' + escAttr(u.login) + '">' + escAttr((u.fio || u.login) + '') + '</option>'; });
        var locked = visit.status === 'completed';
        var dateReadonly = locked ? ' readonly style="cursor:not-allowed;background:#f0f0f0"' : ' readonly style="cursor:pointer;background:#fff"';
        var visitDT = (visit.visit_date || '').toString() + ((visit.visit_time && visit.visit_time !== 'â') ? ' ' + (visit.visit_time + '').substring(0, 5) : '');
        var formHtml = '<div class="form-group"><label>ÐÐ°ÑÐ° Ð¸ Ð²ÑÐµÐ¼Ñ Ð²Ð¸Ð·Ð¸ÑÐ°</label><input type="text" id="ve_datetime" value="' + escAttr(visitDT.trim()) + '"' + dateReadonly + ' placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³ ÑÑ:Ð¼Ð¼"></div><div class="form-group"><label>Ð¡ÑÐ°ÑÑÑ</label><select id="ve_status"' + (locked ? '' : '') + '><option value="planned"' + (visit.status === 'planned' ? ' selected' : '') + '>ÐÐ°Ð¿Ð»Ð°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½</option><option value="completed"' + (visit.status === 'completed' ? ' selected' : '') + '>ÐÐ°Ð²ÐµÑÑÑÐ½</option><option value="cancelled"' + (visit.status === 'cancelled' ? ' selected' : '') + '>ÐÑÐ¼ÐµÐ½ÑÐ½</option><option value="postponed"' + (visit.status === 'postponed' ? ' selected' : '') + '>ÐÐ° ÑÐ°ÑÑÐ¼Ð¾ÑÑÐµÐ½Ð¸Ð¸</option></select></div><div class="form-group"><label>ÐÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹</label><select id="ve_resp"' + (locked ? ' disabled' : '') + '>' + respOpts + '</select></div><div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><textarea id="ve_comment" rows="3" maxlength="5000" style="width:100%">' + escAttr(visit.comment || '') + '</textarea><p id="ve_comment_cnt" style="font-size:12px;color:#666">' + (visit.comment ? visit.comment.length : 0) + ' / 5000</p></div>';
        showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ Ð²Ð¸Ð·Ð¸Ñ', formHtml, function (errEl) {
          var dtVal = (document.getElementById('ve_datetime') && document.getElementById('ve_datetime').value) || '';
          var s = document.getElementById('ve_status') && document.getElementById('ve_status').value;
          var r = document.getElementById('ve_resp');
          var rVal = r ? (r.disabled ? visit.responsible_login : r.value) : visit.responsible_login;
          var c = (document.getElementById('ve_comment') && document.getElementById('ve_comment').value.trim()) || null;
          if (!dtVal) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ Ð´Ð°ÑÑ Ð¸ Ð²ÑÐµÐ¼Ñ.'; return; }
          if (s === 'completed' && (!c || c.length < 10)) { if (errEl) errEl.textContent = 'ÐÑÐ¸ ÑÑÐ°ÑÑÑÐµ Â«ÐÐ°Ð²ÐµÑÑÑÐ½Â» ÑÐºÐ°Ð¶Ð¸ÑÐµ, ÑÑÐ¾ Ð±ÑÐ»Ð¾ ÑÐ´ÐµÐ»Ð°Ð½Ð¾ (Ð¼Ð¸Ð½Ð¸Ð¼ÑÐ¼ 10 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð²).'; return; }
          if (s === 'completed' && c.length > 5000) { if (errEl) errEl.textContent = 'ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹ Ð½Ðµ Ð±Ð¾Ð»ÐµÐµ 5000 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð².'; return; }
          var parts = dtVal.split(/[T ]/);
          var d = parts[0] || '';
          var t = parts[1] ? parts[1].substring(0, 5) : null;
          var body = { status: s, comment: c };
          if (!locked) { body.visit_date = d; body.responsible_login = rVal || null; if (t) body.visit_time = t + ':00'; else body.visit_time = null; }
          return api('/api/v1/visits/' + visit.id, { method: 'PUT', body: JSON.stringify(body) }).then(refreshVisits);
        });
        setTimeout(function () {
          var veDatetime = document.getElementById('ve_datetime');
          if (veDatetime && window.flatpickr && !locked) window.flatpickr(veDatetime, { locale: 'ru', dateFormat: 'Y-m-d H:i', altInput: true, altFormat: 'd.m.Y H:i', enableTime: true, time_24hr: true, allowInput: false });
          var veResp = document.getElementById('ve_resp');
          if (veResp && visit.responsible_login) veResp.value = visit.responsible_login;
          var veComment = document.getElementById('ve_comment');
          var veCnt = document.getElementById('ve_comment_cnt');
          if (veComment && veCnt) veComment.oninput = function () { veCnt.textContent = veComment.value.length + ' / 5000'; };
        }, 100);
      }

      function loadSectionVisitsCreate() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð²Ð¸Ð·Ð¸Ñ</h2><div id="vc_err" class="err"></div><div class="form-group"><label>ÐÐ»Ð¸ÐµÐ½Ñ *</label><input type="hidden" id="vc_customer"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button type="button" class="btn btn-secondary btn-small" id="vc_customer_pick">ÐÑÐ±ÑÐ°ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°</button><input type="text" id="vc_customer_display" readonly placeholder="ÐÐµ Ð²ÑÐ±ÑÐ°Ð½" style="flex:1;min-width:260px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 10px"></div></div><div class="form-group"><label>ÐÐ°ÑÐ° Ð¸ Ð²ÑÐµÐ¼Ñ Ð²Ð¸Ð·Ð¸ÑÐ° *</label><input type="text" id="vc_datetime" readonly placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³ ÑÑ:Ð¼Ð¼" style="max-width:280px;cursor:pointer;background:#fff"></div><div class="form-group"><label>ÐÐ³ÐµÐ½Ñ (Ð¾ÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹) *</label><div id="vc_agent_badge" style="font-size:13px;margin-bottom:4px;color:#065f46;"></div><select id="vc_responsible"><option value="">â</option></select></div><div class="form-group"><label>Ð¡ÑÐ°ÑÑÑ *</label><select id="vc_status"><option value="planned" selected>ÐÐ°Ð¿Ð»Ð°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½</option><option value="completed">ÐÐ°Ð²ÐµÑÑÑÐ½</option><option value="cancelled">ÐÑÐ¼ÐµÐ½ÑÐ½</option><option value="postponed">ÐÐ° ÑÐ°ÑÑÐ¼Ð¾ÑÑÐµÐ½Ð¸Ð¸</option></select></div><div class="form-group"><label>ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹</label><textarea id="vc_comment" rows="3" maxlength="5000" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px" placeholder="ÐÑÐ¸ ÑÑÐ°ÑÑÑÐµ Â«ÐÐ°Ð²ÐµÑÑÑÐ½Â» Ð¾Ð±ÑÐ·Ð°ÑÐµÐ»ÑÐ½Ð¾ ÑÐºÐ°Ð¶Ð¸ÑÐµ, ÑÑÐ¾ Ð±ÑÐ»Ð¾ ÑÐ´ÐµÐ»Ð°Ð½Ð¾ (Ð¼Ð¸Ð½. 10 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð²)"></textarea><p id="vc_comment_counter" style="font-size:12px;color:#666;margin:4px 0 0 0">0 / 5000</p><p id="vc_comment_hint" class="err" style="display:none;margin-top:4px">ÐÑÐ¸ ÑÑÐ°ÑÑÑÐµ Â«ÐÐ°Ð²ÐµÑÑÑÐ½Â» ÐºÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹ Ð¾Ð±ÑÐ·Ð°ÑÐµÐ»ÐµÐ½ (Ð¼Ð¸Ð½Ð¸Ð¼ÑÐ¼ 10 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð²). Ð£ÐºÐ°Ð¶Ð¸ÑÐµ, ÑÑÐ¾ Ð±ÑÐ»Ð¾ ÑÐ´ÐµÐ»Ð°Ð½Ð¾ Ð½Ð° Ð²Ð¸Ð·Ð¸ÑÐµ.</p></div><p style="text-align:center"><button type="button" class="btn btn-primary" id="vc_save">Ð¡Ð¾ÑÑÐ°Ð½Ð¸ÑÑ</button> <button type="button" class="btn btn-secondary" id="vc_cancel">ÐÑÐ¼ÐµÐ½Ð°</button></p></div>';
        Promise.all([api('/api/v1/dictionary/user-logins').catch(function () { return []; })]).then(function (arr) {
          var userList = arr[0] || [];
          var respSel = document.getElementById('vc_responsible');
          var vcAgentBadge = document.getElementById('vc_agent_badge');
          var agents = (userList || []).filter(function (u) {
            var r = (u.role || '').toLowerCase();
            return r === 'agent';
          });
          if (respSel) {
            agents.forEach(function (u) {
              var o = document.createElement('option');
              o.value = u.login;
              var label = (u.login || '') + (u.fio ? ' â ' + u.fio : '');
              if (currentUser && u.login === currentUser.login) label += ' (Ð¢ÐµÐºÑÑÐ¸Ð¹)';
              o.textContent = label;
              respSel.appendChild(o);
            });
            if (currentUser && currentUser.login) {
              respSel.value = currentUser.login;
            }
          }
          function updateAgentBadge() {
            if (!respSel || !vcAgentBadge) return;
            var login = respSel.value;
            if (!login) { vcAgentBadge.textContent = ''; return; }
            var u = agents.find(function (a) { return a.login === login; });
            var text = 'â ' + (u ? (u.login + (u.fio ? ' â ' + u.fio : '')) : login);
            if (currentUser && login === currentUser.login) text += ' (Ð¢ÐµÐºÑÑÐ¸Ð¹ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ)';
            vcAgentBadge.textContent = text;
          }
          if (respSel) respSel.onchange = updateAgentBadge;
          updateAgentBadge();
          var vcDatetimeEl = document.getElementById('vc_datetime');
          if (vcDatetimeEl && window.flatpickr) {
            window.flatpickr(vcDatetimeEl, {
              enableTime: true,
              time_24hr: true,
              locale: 'ru',
              dateFormat: 'Y-m-d H:i',
              altInput: true,
              altFormat: 'd.m.Y H:i',
              defaultDate: new Date(),
              allowInput: false,
              firstDayOfWeek: 1
            });
          }
          var vcCustomerId = document.getElementById('vc_customer');
          var vcCustomerDisplay = document.getElementById('vc_customer_display');
          var pickBtn = document.getElementById('vc_customer_pick');
          var openCustomerPicker = function () {
            var agentOptions = '<option value=\"\">â ÐÑÐµ Ð°Ð³ÐµÐ½ÑÑ â</option>';
            agents.forEach(function (u) {
              var label = (u.login || '') + (u.fio ? ' â ' + u.fio : '');
              var sel = (currentUser && u.login === currentUser.login) ? ' selected' : '';
              agentOptions += '<option value=\"' + escAttr(u.login || '') + '\"' + sel + '>' + escAttr(label) + '</option>';
            });
            var bodyHtml = '<div class=\"form-group\"><label>ÐÐ¾Ð¸ÑÐº Ð¿Ð¾ ÐºÐ»Ð¸ÐµÐ½ÑÑ / ÐÐÐ</label><input type=\"text\" id=\"vp_search\" placeholder=\"ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð¸Ð»Ð¸ ÐÐÐ (Ð¼Ð¸Ð½. 2 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð°)\"></div><div class=\"form-group\"><label>ÐÐ³ÐµÐ½Ñ</label><select id=\"vp_agent\">' + agentOptions + '</select></div><p><button type=\"button\" class=\"btn btn-primary btn-small\" id=\"vp_find\">ÐÐ°Ð¹ÑÐ¸</button></p><div id=\"vp_results\"><p>ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð½Ðµ Ð¼ÐµÐ½ÐµÐµ 2 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð² Ð´Ð»Ñ Ð¿Ð¾Ð¸ÑÐºÐ°.</p></div>';
            showModal('ÐÑÐ±ÑÐ°ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ°', bodyHtml, function (errEl) {
              var checked = document.querySelector('input[name=\"vp_cust_id\"]:checked');
              if (!checked) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°.'; return; }
              var id = checked.value;
              var name = checked.getAttribute('data-name') || ('ÐÐ»Ð¸ÐµÐ½Ñ #' + id);
              if (vcCustomerId) vcCustomerId.value = id;
              if (vcCustomerDisplay) vcCustomerDisplay.value = name;
              return Promise.resolve();
            });
            setTimeout(function () {
              var searchEl = document.getElementById('vp_search');
              var agentEl = document.getElementById('vp_agent');
              var resultsEl = document.getElementById('vp_results');
              var findBtn = document.getElementById('vp_find');
              var runSearch = function () {
                if (!resultsEl) return;
                var q = (searchEl && searchEl.value || '').trim();
                var agent = agentEl && agentEl.value;
                if (!q && !agent) {
                  resultsEl.innerHTML = '<p>Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÐ¾ÑÑ Ð±Ñ 2 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð° Ð² Ð¿Ð¾Ð¸ÑÐºÐµ Ð¸Ð»Ð¸ Ð²ÑÐ±ÐµÑÐ¸ÑÐµ Ð°Ð³ÐµÐ½ÑÐ°.</p>';
                  return;
                }
                if (q && q.length < 2) {
                  resultsEl.innerHTML = '<p>ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð½Ðµ Ð¼ÐµÐ½ÐµÐµ 2 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð².</p>';
                  return;
                }
                var params = ['limit=50'];
                if (q) params.push('search=' + encodeURIComponent(q));
                if (agent) params.push('login_agent=' + encodeURIComponent(agent));
                resultsEl.innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
                api('/api/v1/customers?' + params.join('&')).then(function (list) {
                  list = list || [];
                  if (!list.length) { resultsEl.innerHTML = '<p>ÐÐ»Ð¸ÐµÐ½ÑÑ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ñ.</p>'; return; }
                  var t = '<div style=\"max-height:380px;overflow:auto\"><table><thead><tr><th></th><th>ÐÐ»Ð¸ÐµÐ½Ñ</th><th>ÐÐÐ</th><th>ÐÐ³ÐµÐ½Ñ</th></tr></thead><tbody>';
                  list.forEach(function (c) {
                    var id = c.id;
                    var name = (c.name_client || c.firm_name || '').trim() || ('ÐÐ»Ð¸ÐµÐ½Ñ #' + id);
                    var tax = c.tax_id || '';
                    t += '<tr><td><input type=\"radio\" name=\"vp_cust_id\" value=\"' + id + '\" data-name=\"' + escAttr(name + (tax ? ' (ÐÐÐ ' + tax + ')' : '')) + '\"></td><td>' + escAttr(name) + '</td><td>' + escAttr(tax) + '</td><td>' + escAttr(c.login_agent || '') + '</td></tr>';
                  });
                  t += '</tbody></table></div>';
                  resultsEl.innerHTML = t;
                }).catch(function () {
                  resultsEl.innerHTML = '<p class=\"err\">ÐÑÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð¸ÑÐºÐ° ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð².</p>';
                });
              };
              if (findBtn) findBtn.onclick = runSearch;
              if (searchEl) searchEl.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } };
              runSearch();
            }, 50);
          };
          if (pickBtn) pickBtn.onclick = openCustomerPicker;
          var vcComment = document.getElementById('vc_comment');
          var vcCounter = document.getElementById('vc_comment_counter');
          var vcHint = document.getElementById('vc_comment_hint');
          function updateCommentUI() {
            var len = (vcComment && vcComment.value) ? vcComment.value.length : 0;
            if (vcCounter) vcCounter.textContent = len + ' / 5000';
            var statusEl = document.getElementById('vc_status');
            var needComment = statusEl && statusEl.value === 'completed';
            if (vcHint) vcHint.style.display = (needComment && len < 10) ? 'block' : 'none';
          }
          if (vcComment) { vcComment.oninput = updateCommentUI; vcComment.onchange = updateCommentUI; }
          var vcStatusEl = document.getElementById('vc_status');
          if (vcStatusEl) vcStatusEl.onchange = updateCommentUI;
          updateCommentUI();
          document.getElementById('vc_cancel').onclick = function () { showSection('visits_search'); };
          document.getElementById('vc_save').onclick = function () {
            var errEl = document.getElementById('vc_err');
            if (errEl) errEl.textContent = '';
            var customerId = document.getElementById('vc_customer').value;
            var datetimeVal = (document.getElementById('vc_datetime') && document.getElementById('vc_datetime').value) || '';
            var responsible = document.getElementById('vc_responsible').value;
            var status = (document.getElementById('vc_status') && document.getElementById('vc_status').value) || 'planned';
            var comment = document.getElementById('vc_comment').value.trim() || null;
            if (!customerId) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÐºÐ»Ð¸ÐµÐ½ÑÐ°.'; return; }
            if (!datetimeVal) { if (errEl) errEl.textContent = 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ Ð´Ð°ÑÑ Ð¸ Ð²ÑÐµÐ¼Ñ Ð²Ð¸Ð·Ð¸ÑÐ°.'; return; }
            if (!responsible) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ Ð°Ð³ÐµÐ½ÑÐ°.'; return; }
            if (!status) { if (errEl) errEl.textContent = 'ÐÑÐ±ÐµÑÐ¸ÑÐµ ÑÑÐ°ÑÑÑ.'; return; }
            if (status === 'completed') {
              if (!comment || comment.length < 10) { if (errEl) errEl.textContent = 'ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹ Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð±ÑÑÑ Ð¼Ð¸Ð½Ð¸Ð¼ÑÐ¼ 10 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð² (ÑÐµÐ¹ÑÐ°Ñ: ' + (comment ? comment.length : 0) + ').'; if (vcHint) vcHint.style.display = 'block'; return; }
              if (comment.length > 5000) { if (errEl) errEl.textContent = 'ÐÐ¾Ð¼Ð¼ÐµÐ½ÑÐ°ÑÐ¸Ð¹ Ð½Ðµ Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð¿ÑÐµÐ²ÑÑÐ°ÑÑ 5000 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð².'; return; }
            }
            var parts = datetimeVal.split(/[T ]/);
            var dateVal = parts[0] || '';
            var timeVal = parts[1] ? parts[1].substring(0, 5) : '';
            var body = { visit_date: dateVal, status: status, responsible_login: responsible || null, comment: comment };
            if (timeVal) body.visit_time = timeVal + ':00';
            api('/api/v1/customers/' + customerId + '/visits', { method: 'POST', body: JSON.stringify(body) }).then(function () { showSection('visits_search'); }).catch(function (e) {
              if (errEl) errEl.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ';
            });
          };
        });
      }

      function loadSectionVisitsCalendar() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÐ°Ð»ÐµÐ½Ð´Ð°ÑÑ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð²</h2><p><button type="button" class="btn btn-secondary" id="vcal_prev">â ÐÑÐµÐ´.</button> <span id="vcal_title" style="margin:0 12px;font-weight:600"></span> <button type="button" class="btn btn-secondary" id="vcal_next">Ð¡Ð»ÐµÐ´. âº</button> <label style="margin-left:12px">ÐÑÐ²ÐµÑÑÑÐ²ÐµÐ½Ð½ÑÐ¹:</label> <select id="vcal_responsible" style="margin-left:6px"><option value="">ÐÑÐµ Ð²Ð¸Ð·Ð¸ÑÑ</option><option value="__me__">ÐÐ¾Ð¸ Ð²Ð¸Ð·Ð¸ÑÑ</option></select></p><div id="vcal_header" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:12px;font-weight:600;font-size:12px;text-align:center"><div>ÐÐ</div><div>ÐÐ¢</div><div>Ð¡Ð </div><div>Ð§Ð¢</div><div>ÐÐ¢</div><div>Ð¡Ð</div><div>ÐÐ¡</div></div><div id="vcal_grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:4px"></div><p style="margin-top:16px"><strong>ÐÐ¾ Ð´Ð°ÑÐµ: <span id="vcal_sel_date"></span></strong> (<span id="vcal_day_count">0</span> Ð²Ð¸Ð·Ð¸ÑÐ¾Ð²)</p><div id="vcal_day_list"></div></div>';
        api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
          var sel = document.getElementById('vcal_responsible');
          if (sel) {
            userList = userList || [];
            userList.forEach(function (u) { var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' â ' + u.fio : ''); sel.appendChild(o); });
          }
        });
        var cur = new Date();
        var viewYear = cur.getFullYear();
        var viewMonth = cur.getMonth() + 1;
        function monthName() { return new Date(viewYear, viewMonth - 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }); }
        function load() {
          var respVal = document.getElementById('vcal_responsible') && document.getElementById('vcal_responsible').value;
          var responsible = (respVal === '__me__' && currentUser && currentUser.login) ? currentUser.login : (respVal && respVal !== '__me__' ? respVal : '');
          var url = '/api/v1/visits/calendar?year=' + viewYear + '&month=' + viewMonth;
          if (responsible) url += '&responsible_login=' + encodeURIComponent(responsible);
          document.getElementById('vcal_title').textContent = monthName();
          api(url).then(function (res) {
            var events = (res && res.events) ? res.events : [];
            var daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
            var firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
            var dow = firstDow === 0 ? 7 : firstDow;
            var html = '';
            for (var i = 1; i < dow; i++) html += '<div style="padding:8px;background:#f0f0f0;border-radius:4px;min-height:40px"></div>';
            var byDate = {};
            events.forEach(function (ev) {
              var d = (ev.date || '').substring(0, 10);
              if (!byDate[d]) byDate[d] = []; byDate[d].push(ev);
            });
            for (var d = 1; d <= daysInMonth; d++) {
              var key = viewYear + '-' + (viewMonth < 10 ? '0' : '') + viewMonth + '-' + (d < 10 ? '0' : '') + d;
              var list = byDate[key] || [];
              var color = list.length ? '#0d9488' : '#f8f9fa';
              html += '<div class="vcal-day" data-date="' + key + '" style="padding:8px;background:' + color + ';color:' + (list.length ? '#fff' : '#333') + ';border-radius:4px;min-height:40px;cursor:pointer">' + d + (list.length ? ' (' + list.length + ')' : '') + '</div>';
            }
            document.getElementById('vcal_grid').innerHTML = html;
            document.querySelectorAll('.vcal-day').forEach(function (el) {
              el.onclick = function () {
                var key = el.getAttribute('data-date');
                document.getElementById('vcal_sel_date').textContent = key;
                var list = byDate[key] || [];
                document.getElementById('vcal_day_count').textContent = list.length;
                if (!list.length) { document.getElementById('vcal_day_list').innerHTML = '<p>ÐÐµÑ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð².</p>'; return; }
                var t = '<ul style="list-style:none;padding:0;margin:0">';
                list.forEach(function (ev) {
                  var time = (ev.time || '').substring(0, 5) || 'â';
                  t += '<li style="padding:8px;border-bottom:1px solid #eee">' + escAttr(time) + ' â ' + escAttr(ev.customer_name || '') + ' (' + escAttr(ev.responsible_login || '') + ')</li>';
                });
                t += '</ul>';
                document.getElementById('vcal_day_list').innerHTML = t;
              };
            });
          }).catch(function (e) {
            document.getElementById('vcal_grid').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</p>';
          });
        }
        document.getElementById('vcal_prev').onclick = function () { viewMonth--; if (viewMonth < 1) { viewMonth = 12; viewYear--; } load(); };
        document.getElementById('vcal_next').onclick = function () { viewMonth++; if (viewMonth > 12) { viewMonth = 1; viewYear++; } load(); };
        document.getElementById('vcal_responsible').onchange = load;
        load();
      }

      function loadSectionReportCustomers() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÑÑÑÑ: ÐÐ¾ ÐºÐ»Ð¸ÐµÐ½ÑÐ°Ð¼</h2><p><label>Ð¡ÑÐ°ÑÑÑ </label><select id="rc_status"><option value="all">ÐÑÐµ</option><option value="active">ÐÐºÑÐ¸Ð²Ð½ÑÐµ</option><option value="inactive">ÐÐµÐ°ÐºÑÐ¸Ð²Ð½ÑÐµ</option></select> <label>ÐÐ³ÐµÐ½Ñ </label><select id="rc_agent"><option value="">ÐÑÐµ</option></select> <label>ÐÐ°ÑÐ° Ñ </label><input type="text" id="rc_date_from" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:120px"> <label>Ð¿Ð¾ </label><input type="text" id="rc_date_to" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:120px"> <button type="button" class="btn btn-primary" id="rc_load">ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ</button> <button type="button" class="btn btn-secondary" id="rc_export">Ð­ÐºÑÐ¿Ð¾ÑÑ Ð² Excel</button></p><div id="rc_table"><p style="color:#64748b">Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÐ¸Ð»ÑÑÑÑ Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ¾ÐºÐ°Ð·Ð°ÑÑÂ».</p></div></div>';
        api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
          var sel = document.getElementById('rc_agent');
          if (sel) userList.forEach(function (u) { var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' â ' + u.fio : ''); sel.appendChild(o); });
        });
        var rcDateFrom = document.getElementById('rc_date_from');
        var rcDateTo = document.getElementById('rc_date_to');
        if (window.flatpickr) {
          if (rcDateFrom) window.flatpickr(rcDateFrom, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
          if (rcDateTo) window.flatpickr(rcDateTo, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
        }
        function run() {
          var params = [];
          var status = document.getElementById('rc_status') && document.getElementById('rc_status').value;
          var agent = document.getElementById('rc_agent') && document.getElementById('rc_agent').value;
          var df = dateToApiFormat((document.getElementById('rc_date_from') && document.getElementById('rc_date_from').value) || '');
          var dt = dateToApiFormat((document.getElementById('rc_date_to') && document.getElementById('rc_date_to').value) || '');
          if (status && status !== 'all') params.push('status=' + encodeURIComponent(status));
          if (agent) params.push('agent_login=' + encodeURIComponent(agent));
          if (df) params.push('date_from=' + encodeURIComponent(df));
          if (dt) params.push('date_to=' + encodeURIComponent(dt));
          document.getElementById('rc_table').innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
          api('/api/v1/reports/customers?' + params.join('&')).then(function (res) {
            var total = (res && res.total != null) ? res.total : 0;
            var data = (res && res.data) ? res.data : [];
            if (!data.length) { document.getElementById('rc_table').innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ.</p>'; return; }
            var rcSortCol = 'name_client';
            var rcSortDir = 1;
            var lastRcData = data;
            function clientDisplay(r) {
              var n = (r.name_client || '').trim();
              var f = (r.firm_name || '').trim();
              if (f && f !== n) return n + (n ? ' (' + f + ')' : f);
              return n || f || 'â';
            }
            function renderRc(data) {
              var sorted = data.slice().sort(function (a, b) {
                return tableSortCompare(a, b, rcSortCol, rcSortDir, function (r, c) {
                  if (c === 'orders_count') return (r[c] != null ? String(Number(r[c])).padStart(10, '0') : '');
                  if (c === 'orders_amount') return (r.orders_amount != null ? String(Number(r.orders_amount)).padStart(20, '0') : '');
                  if (c === 'total_visits' || c === 'completed_visits') return (r[c] != null ? String(Number(r[c])).padStart(10, '0') : '');
                  return (r[c] || '').toString().toLowerCase();
                });
              });
              var arrow = rcSortDir > 0 ? ' â²' : ' â¼';
              var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (rcSortCol === col ? arrow : '') + '</th>'; };
              var tb = '<div style="overflow-x:auto"><table><thead><tr><th>#</th>' + th('name_client', 'ÐÐ»Ð¸ÐµÐ½Ñ') + th('agent_fio', 'Ð¤ÐÐ ÐÐ³ÐµÐ½ÑÐ°') + th('expeditor_fio', 'Ð¤ÐÐ Ð­ÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ°') + th('total_visits', 'ÐÐ¾Ð»-Ð²Ð¾ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð² Ð°Ð³ÐµÐ½ÑÐ¾Ð¼') + th('completed_visits', 'ÐÐ¾Ð»-Ð²Ð¾ Ð·Ð°Ð²ÐµÑÑÑÐ½Ð½ÑÑ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð² Ð°Ð³ÐµÐ½ÑÐ¾Ð¼') + th('orders_count', 'ÐÐ¾Ð»-Ð²Ð¾ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²') + th('orders_amount', 'Ð¡ÑÐ¼Ð¼Ð° Ð·Ð°ÐºÐ°Ð·Ð¾Ð²') + '</tr></thead><tbody>';
              sorted.forEach(function (r, i) {
                var ordersCount = r.orders_count || 0;
                var ordersAmount = (r.orders_amount != null) ? Number(r.orders_amount) : 0;
                var totalVisits = r.total_visits != null ? r.total_visits : 0;
                var completedVisits = r.completed_visits != null ? r.completed_visits : 0;
                tb += '<tr><td>' + (i + 1) + '</td><td>' + escAttr(clientDisplay(r)) + '</td><td>' + escAttr(r.agent_fio || '') + '</td><td>' + escAttr(r.expeditor_fio || '') + '</td><td>' + totalVisits + '</td><td>' + completedVisits + '</td><td>' + ordersCount + '</td><td>' + (ordersAmount ? ordersAmount.toFixed(2) : '0.00') + '</td></tr>';
              });
              tb += '</tbody></table></div><p><strong>ÐÑÐ¾Ð³Ð¾ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð²: ' + total + '</strong></p>';
              document.getElementById('rc_table').innerHTML = tb;
              document.getElementById('rc_table').querySelectorAll('th.sortable').forEach(function (thEl) {
                thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (rcSortCol === col) rcSortDir = -rcSortDir; else { rcSortCol = col; rcSortDir = 1; } renderRc(lastRcData); };
              });
            }
            renderRc(data);
          }).catch(function (e) {
            document.getElementById('rc_table').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</p>';
          });
        }
        document.getElementById('rc_load').onclick = run;
        var exportBtn = document.getElementById('rc_export');
        if (exportBtn) {
          exportBtn.onclick = function () {
            var params = [];
            var status = document.getElementById('rc_status') && document.getElementById('rc_status').value;
            var agent = document.getElementById('rc_agent') && document.getElementById('rc_agent').value;
            var df = dateToApiFormat((document.getElementById('rc_date_from') && document.getElementById('rc_date_from').value) || '');
            var dt = dateToApiFormat((document.getElementById('rc_date_to') && document.getElementById('rc_date_to').value) || '');
            if (status && status !== 'all') params.push('status=' + encodeURIComponent(status));
            if (agent) params.push('agent_login=' + encodeURIComponent(agent));
            if (df) params.push('date_from=' + encodeURIComponent(df));
            if (dt) params.push('date_to=' + encodeURIComponent(dt));
            var url = '/api/v1/reports/customers/export';
            if (params.length) url += '?' + params.join('&');
            fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) throw new Error('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_customers.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸ Ð¾ÑÑÑÑÐ°.'); });
          };
        }
      }

      function loadSectionReportAgents() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÑÑÑÑ: Ð­ÑÑÐµÐºÑÐ¸Ð²Ð½Ð¾ÑÑÑ Ð°Ð³ÐµÐ½ÑÐ¾Ð²</h2><p><label>ÐÐ°ÑÐ° Ñ </label><input type="text" id="ra_date_from" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:120px"> <label>Ð¿Ð¾ </label><input type="text" id="ra_date_to" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:120px"> <button type="button" class="btn btn-primary" id="ra_load">ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ</button> <button type="button" class="btn btn-secondary" id="ra_export">Ð­ÐºÑÐ¿Ð¾ÑÑ Ð² Excel</button></p><div id="ra_list"><p style="color:#64748b">Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÐ¸Ð»ÑÑÑÑ Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ¾ÐºÐ°Ð·Ð°ÑÑÂ».</p></div></div>';
        var raDateFrom = document.getElementById('ra_date_from');
        var raDateTo = document.getElementById('ra_date_to');
        if (window.flatpickr) {
          if (raDateFrom) window.flatpickr(raDateFrom, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
          if (raDateTo) window.flatpickr(raDateTo, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
        }
        function run() {
          var df = dateToApiFormat((document.getElementById('ra_date_from') && document.getElementById('ra_date_from').value) || '');
          var dt = dateToApiFormat((document.getElementById('ra_date_to') && document.getElementById('ra_date_to').value) || '');
          var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt));
          var url = '/api/v1/reports/agents'; if (params.length) url += '?' + params.join('&');
          document.getElementById('ra_list').innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
          api(url).then(function (res) {
            var data = (res && res.data) ? res.data : [];
            var err = (res && res.error) ? res.error : null;
            if (err) { document.getElementById('ra_list').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ°: ' + escAttr(err) + '</p>'; return; }
            if (!data.length) { document.getElementById('ra_list').innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ Ð·Ð° Ð²ÑÐ±ÑÐ°Ð½Ð½ÑÐ¹ Ð¿ÐµÑÐ¸Ð¾Ð´.</p>'; return; }
            var tb = '<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>ÐÐ¾Ð³Ð¸Ð½</th><th>Ð¤ÐÐ</th><th>ÐÐ»Ð¸ÐµÐ½ÑÐ¾Ð²</th><th>ÐÐ¸Ð·Ð¸ÑÐ¾Ð²</th><th>ÐÐ°Ð²ÐµÑÑÐµÐ½Ð¾</th><th>% Ð·Ð°Ð²ÐµÑÑÑÐ½Ð½Ð¾ÑÑÐ¸ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð²</th><th>Ð¡ÑÐ¼Ð¼Ð° Ð·Ð°ÐºÐ°Ð·Ð¾Ð²</th><th>ÐÐ¾Ð»-Ð²Ð¾ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²</th><th>% Ð·Ð°Ð²ÐµÑÑÑÐ½Ð½Ð¾ÑÑÐ¸ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²</th></tr></thead><tbody>';
            data.forEach(function (r, i) {
              var visitRate = (r.visit_completion_rate != null) ? r.visit_completion_rate : 0;
              var orderRate = (r.orders_completion_rate != null) ? r.orders_completion_rate : 0;
              var amt = (r.orders_amount != null) ? Number(r.orders_amount) : 0;
              tb += '<tr><td>' + (i + 1) + '</td><td>' + escAttr(r.login || '') + '</td><td>' + escAttr(r.fio || '') + '</td><td>' + (r.client_count || 0) + '</td><td>' + (r.total_visits || 0) + '</td><td>' + (r.completed_visits || 0) + '</td><td>' + visitRate + '%</td><td>' + (amt ? amt.toFixed(2) : '0.00') + '</td><td>' + (r.orders_count || 0) + '</td><td>' + orderRate + '%</td></tr>';
            });
            tb += '</tbody></table></div><p><strong>ÐÑÐ¾Ð³Ð¾ Ð°Ð³ÐµÐ½ÑÐ¾Ð²: ' + data.length + '</strong></p>';
            document.getElementById('ra_list').innerHTML = tb;
          }).catch(function (e) { document.getElementById('ra_list').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</p>'; });
        }
        document.getElementById('ra_load').onclick = run;
        var raExport = document.getElementById('ra_export');
        if (raExport) {
          raExport.onclick = function () {
            var df = dateToApiFormat((document.getElementById('ra_date_from') && document.getElementById('ra_date_from').value) || '');
            var dt = dateToApiFormat((document.getElementById('ra_date_to') && document.getElementById('ra_date_to').value) || '');
            var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt));
            var url = '/api/v1/reports/agents/export'; if (params.length) url += '?' + params.join('&');
            fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) throw new Error('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_agents.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸ Ð¾ÑÑÑÑÐ°.'); });
          };
        }
      }

      function loadSectionReportExpeditors() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÑÑÑÑ: Ð­ÑÑÐµÐºÑÐ¸Ð²Ð½Ð¾ÑÑÑ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ¾Ð² (Ð¿Ð¾ Ð·Ð°ÐºÐ°Ð·Ð°Ð¼)</h2><p><label>ÐÐ°ÑÐ° Ñ </label><input type="text" id="re_date_from" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:120px"> <label>Ð¿Ð¾ </label><input type="text" id="re_date_to" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:120px"> <button type="button" class="btn btn-primary" id="re_load">ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ</button> <button type="button" class="btn btn-secondary" id="re_export">Ð­ÐºÑÐ¿Ð¾ÑÑ Ð² Excel</button></p><div id="re_list"><p style="color:#64748b">Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÐ¸Ð»ÑÑÑÑ Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ¾ÐºÐ°Ð·Ð°ÑÑÂ».</p></div></div>';
        var reDateFrom = document.getElementById('re_date_from');
        var reDateTo = document.getElementById('re_date_to');
        if (window.flatpickr) {
          if (reDateFrom) window.flatpickr(reDateFrom, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
          if (reDateTo) window.flatpickr(reDateTo, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
        }
        function run() {
          var df = dateToApiFormat((document.getElementById('re_date_from') && document.getElementById('re_date_from').value) || '');
          var dt = dateToApiFormat((document.getElementById('re_date_to') && document.getElementById('re_date_to').value) || '');
          var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt));
          var url = '/api/v1/reports/expeditors'; if (params.length) url += '?' + params.join('&');
          document.getElementById('re_list').innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
          api(url).then(function (res) {
            var data = (res && res.data) ? res.data : [];
            var err = (res && res.error) ? res.error : null;
            if (err) { document.getElementById('re_list').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ°: ' + escAttr(err) + '</p>'; return; }
            if (!data.length) { document.getElementById('re_list').innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ Ð·Ð° Ð²ÑÐ±ÑÐ°Ð½Ð½ÑÐ¹ Ð¿ÐµÑÐ¸Ð¾Ð´.</p>'; return; }
            var tb = '<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>ÐÐ¾Ð³Ð¸Ð½</th><th>Ð¤ÐÐ</th><th>ÐÐ°ÐºÐ°Ð·Ð¾Ð²</th><th>Ð¡ÑÐ¼Ð¼Ð°</th><th>ÐÑÐºÑÑÑÐ¾</th><th>Ð Ð´Ð¾ÑÑÐ°Ð²ÐºÐµ</th><th>ÐÐ¾ÑÑÐ°Ð²Ð»ÐµÐ½Ð¾</th><th>ÐÑÐ¼ÐµÐ½ÐµÐ½Ð¾</th></tr></thead><tbody>';
            data.forEach(function (r, i) {
              var amt = (r.orders_amount != null) ? Number(r.orders_amount) : 0;
              tb += '<tr><td>' + (i + 1) + '</td><td>' + escAttr(r.login || '') + '</td><td>' + escAttr(r.fio || '') + '</td><td>' + (r.orders_count || 0) + '</td><td>' + (amt ? amt.toFixed(2) : '0.00') + '</td><td>' + (r.orders_open || 0) + '</td><td>' + (r.orders_delivery || 0) + '</td><td>' + (r.orders_completed || 0) + '</td><td>' + (r.orders_cancelled || 0) + '</td></tr>';
            });
            tb += '</tbody></table></div><p><strong>ÐÑÐ¾Ð³Ð¾ ÑÐºÑÐ¿ÐµÐ´Ð¸ÑÐ¾ÑÐ¾Ð²: ' + data.length + '</strong></p>';
            document.getElementById('re_list').innerHTML = tb;
          }).catch(function (e) { document.getElementById('re_list').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</p>'; });
        }
        document.getElementById('re_load').onclick = run;
        var reExport = document.getElementById('re_export');
        if (reExport) {
          reExport.onclick = function () {
            var df = dateToApiFormat((document.getElementById('re_date_from') && document.getElementById('re_date_from').value) || '');
            var dt = dateToApiFormat((document.getElementById('re_date_to') && document.getElementById('re_date_to').value) || '');
            var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt));
            var url = '/api/v1/reports/expeditors/export'; if (params.length) url += '?' + params.join('&');
            fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) throw new Error('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_expeditors.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸ Ð¾ÑÑÑÑÐ°.'); });
          };
        }
      }

      function loadSectionReportVisits() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÑÑÑÑ: ÐÐ½Ð°Ð»Ð¸ÑÐ¸ÐºÐ° Ð²Ð¸Ð·Ð¸ÑÐ¾Ð²</h2><p><label>ÐÐ°ÑÐ° Ñ </label><input type="text" id="rv_from" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:120px"> <label>Ð¿Ð¾ </label><input type="text" id="rv_to" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:120px"> <button type="button" class="btn btn-primary" id="rv_load">ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ</button> <button type="button" class="btn btn-secondary" id="rv_export">Ð­ÐºÑÐ¿Ð¾ÑÑ Ð² Excel</button></p><div id="rv_summary"><p style="color:#64748b">Ð£ÐºÐ°Ð¶Ð¸ÑÐµ ÑÐ¸Ð»ÑÑÑÑ Ð¸ Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ¾ÐºÐ°Ð·Ð°ÑÑÂ».</p></div><div id="rv_table"></div></div>';
        var rvFrom = document.getElementById('rv_from');
        var rvTo = document.getElementById('rv_to');
        if (window.flatpickr) {
          if (rvFrom) window.flatpickr(rvFrom, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
          if (rvTo) window.flatpickr(rvTo, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', allowInput: true });
        }
        function run() {
          var from = dateToApiFormat((document.getElementById('rv_from') && document.getElementById('rv_from').value) || '');
          var to = dateToApiFormat((document.getElementById('rv_to') && document.getElementById('rv_to').value) || '');
          var params = []; if (from) params.push('from_date=' + encodeURIComponent(from)); if (to) params.push('to_date=' + encodeURIComponent(to));
          var url = '/api/v1/reports/visits'; if (params.length) url += '?' + params.join('&');
          document.getElementById('rv_summary').innerHTML = ''; document.getElementById('rv_table').innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
          api(url).then(function (res) {
            var sum = (res && res.summary) ? res.summary : {};
            document.getElementById('rv_summary').innerHTML = '<p><strong>ÐÑÐµÐ³Ð¾ Ð²Ð¸Ð·Ð¸ÑÐ¾Ð²:</strong> ' + (sum.total_visits || 0) + ', ÐÐ°Ð²ÐµÑÑÐµÐ½Ð¾: ' + (sum.completed || 0) + ' (' + (sum.completion_rate != null ? sum.completion_rate : 0) + '%)</p>';
            var byDate = (res && res.by_date) ? res.by_date : [];
            if (!byDate.length) { document.getElementById('rv_table').innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ Ð¿Ð¾ Ð´Ð°ÑÐ°Ð¼.</p>'; return; }
            var rvSortCol = 'date';
            var rvSortDir = 1;
            var lastRvData = byDate;
            function renderRv(data) {
              var sorted = data.slice().sort(function (a, b) {
                return tableSortCompare(a, b, rvSortCol, rvSortDir, function (r, c) {
                  if (c === 'total_visits' || c === 'completed' || c === 'planned' || c === 'cancelled') return (r[c] != null ? String(Number(r[c])).padStart(10, '0') : '');
                  return (r[c] || '').toString();
                });
              });
              var arrow = rvSortDir > 0 ? ' â²' : ' â¼';
              var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (rvSortCol === col ? arrow : '') + '</th>'; };
              var t = '<div style="overflow-x:auto"><table><thead><tr>' + th('date', 'ÐÐ°ÑÐ°') + th('total_visits', 'ÐÑÐµÐ³Ð¾') + th('completed', 'ÐÐ°Ð²ÐµÑÑÐµÐ½Ð¾') + th('planned', 'ÐÐ°Ð¿Ð»Ð°Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¾') + th('cancelled', 'ÐÑÐ¼ÐµÐ½ÐµÐ½Ð¾') + '</tr></thead><tbody>';
              sorted.forEach(function (r) { t += '<tr><td>' + escAttr(r.date || '') + '</td><td>' + (r.total_visits || 0) + '</td><td>' + (r.completed || 0) + '</td><td>' + (r.planned || 0) + '</td><td>' + (r.cancelled || 0) + '</td></tr>'; });
              t += '</tbody></table></div>';
              document.getElementById('rv_table').innerHTML = t;
              document.getElementById('rv_table').querySelectorAll('th.sortable').forEach(function (thEl) {
                thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (rvSortCol === col) rvSortDir = -rvSortDir; else { rvSortCol = col; rvSortDir = 1; } renderRv(lastRvData); };
              });
            }
            renderRv(byDate);
          }).catch(function (e) { document.getElementById('rv_table').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</p>'; });
        }
        document.getElementById('rv_load').onclick = run;
        var rvExport = document.getElementById('rv_export');
        if (rvExport) {
          rvExport.onclick = function () {
            var from = dateToApiFormat((document.getElementById('rv_from') && document.getElementById('rv_from').value) || '');
            var to = dateToApiFormat((document.getElementById('rv_to') && document.getElementById('rv_to').value) || '');
            var params = []; if (from) params.push('from_date=' + encodeURIComponent(from)); if (to) params.push('to_date=' + encodeURIComponent(to));
            var url = '/api/v1/reports/visits/export'; if (params.length) url += '?' + params.join('&');
            fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) throw new Error('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_visits.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸ Ð¾ÑÑÑÑÐ°.'); });
          };
        }
      }

      function loadSectionReportDashboard() {
        var content = document.getElementById('content');
        var today = new Date();
        var todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        content.innerHTML = '<div class="card"><h2>Ð¡Ð²Ð¾Ð´Ð½Ð°Ñ Ð°Ð½Ð°Ð»Ð¸ÑÐ¸ÐºÐ°</h2>' +
          '<div class="dashboard-filters" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:20px">' +
          '<label>ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð° Ñ</label><input type="text" id="rd_date_from" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:110px" title="ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð° Ñ">' +
          '<label>ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð° Ð¿Ð¾</label><input type="text" id="rd_date_to" placeholder="Ð´Ð´.Ð¼Ð¼.Ð³Ð³Ð³Ð³" style="max-width:110px" title="ÐÐ°ÑÐ° Ð¿Ð¾ÑÑÐ°Ð²ÐºÐ¸ Ð·Ð°ÐºÐ°Ð·Ð° Ð¿Ð¾">' +
          '<label>Ð¡ÑÐ°ÑÑÑÑ</label><select id="rd_status"><option value="">ÐÑÐºÑÑÑÐ¾, ÐÐ¾ÑÑÐ°Ð²ÐºÐ°, ÐÐ¾ÑÑÐ°Ð²Ð»ÐµÐ½</option><option value="open">ÐÑÐºÑÑÑÐ¾</option><option value="delivery">ÐÐ¾ÑÑÐ°Ð²ÐºÐ°</option><option value="completed">ÐÐ¾ÑÑÐ°Ð²Ð»ÐµÐ½</option></select>' +
          '<label>ÐÐ°ÑÐµÐ³Ð¾ÑÐ¸Ñ</label><select id="rd_category"><option value="">ÐÑÐµ</option></select>' +
          '<button type="button" class="btn btn-primary" id="rd_load">ÐÑÐ¸Ð¼ÐµÐ½Ð¸ÑÑ</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;margin-bottom:20px">' +
          '<div id="rd_summary" class="dashboard-summary" style="padding:24px;background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);border-radius:12px;color:#fff;min-height:120px"><div style="font-size:14px;opacity:0.9">ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</div></div>' +
          '<div id="rd_chart_wrap" style="height:200px;min-width:200px"><canvas id="rd_chart"></canvas></div>' +
          '</div>' +
          '<div id="rd_table_wrap"><h3 style="margin:0 0 12px 0">ÐÐ¾ ÐºÐ°ÑÐµÐ³Ð¾ÑÐ¸ÑÐ¼ Ð¿ÑÐ¾Ð´ÑÐºÑÐ¾Ð²</h3>' +
          '<p><button type="button" class="btn btn-secondary btn-small" id="rd_excel">Ð­ÐºÑÐ¿Ð¾ÑÑ Ð² Excel</button></p>' +
          '<div id="rd_table"></div></div>' +
          '<div id="rd_territory_wrap" style="margin-top:24px"><h3 style="margin:0 0 12px 0">ÐÐ¾ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸ÑÐ¼</h3>' +
          '<p><button type="button" class="btn btn-secondary btn-small" id="rd_excel_territory">Ð­ÐºÑÐ¿Ð¾ÑÑ Ð² Excel</button></p>' +
          '<div id="rd_territory_table"></div></div>';
        var rdFrom = document.getElementById('rd_date_from');
        var rdTo = document.getElementById('rd_date_to');
        if (window.flatpickr) {
          if (rdFrom) window.flatpickr(rdFrom, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', defaultDate: todayStr, allowInput: true });
          if (rdTo) window.flatpickr(rdTo, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', defaultDate: todayStr, allowInput: true });
        }
        var CATEGORY_LABELS = { 'Tvorog': 'Ð¢Ð²Ð¾ÑÐ¾Ð³', 'Yogurt': 'ÐÐ¾Ð³ÑÑÑ', 'Tara': 'Ð¢Ð°ÑÐ°', 'Milk': 'ÐÐ¾Ð»Ð¾ÐºÐ¾', 'Kefir': 'ÐÐµÑÐ¸Ñ', 'Smetana': 'Ð¡Ð¼ÐµÑÐ°Ð½Ð°', 'Maslo': 'ÐÐ°ÑÐ»Ð¾' };
        api('/api/v1/dictionary/products/types').catch(function () { return []; }).then(function (types) {
          var sel = document.getElementById('rd_category');
          if (sel && types && types.length) types.forEach(function (t) { var o = document.createElement('option'); o.value = t.name; o.textContent = CATEGORY_LABELS[t.name] || t.name || t.description || ''; sel.appendChild(o); });
        });
        var rdChart = null;
        function render(res) {
          var err = (res && res.error) ? res.error : null;
          if (err) { document.getElementById('rd_summary').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ°: ' + escAttr(err) + '</p>'; return; }
          var total = (res && res.total_orders_sum) ? Number(res.total_orders_sum) : 0;
          var totalCount = (res && res.total_orders_count) ? Number(res.total_orders_count) : 0;
          var f = (res && res.filters) ? res.filters : {};
          var dateLabel = (f.date_from || f.date_to) ? ('Ñ ' + (f.date_from || '') + ' Ð¿Ð¾ ' + (f.date_to || '')) : 'ÑÐµÐ³Ð¾Ð´Ð½Ñ';
          document.getElementById('rd_summary').innerHTML = '<div style="font-size:16px;opacity:0.95">ÐÑÐµÐ³Ð¾ <strong style="font-size:24px;font-weight:700">' + totalCount + '</strong> Ð·Ð°ÐºÐ°Ð·Ð¾Ð² ' + dateLabel + '<br/>- Ð½Ð° ÑÑÐ¼Ð¼Ñ <strong style="font-size:24px;font-weight:700">' + (total ? total.toLocaleString('ru-RU', {minimumFractionDigits:2,maximumFractionDigits:2}) : '0') + '</strong> ÑÑÐ¼</div>';
          var byCat = (res && res.by_category) ? res.by_category : [];
          try {
            if (window.Chart && document.getElementById('rd_chart')) {
              var ctx = document.getElementById('rd_chart').getContext('2d');
              if (rdChart) rdChart.destroy();
              var labels = byCat.map(function (c) { return c.category; });
              var data = byCat.map(function (c) { return c.share_pct; });
              if (!labels.length) { labels = ['ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ']; data = [100]; }
              var colors = ['#60a5fa','#34d399','#fbbf24','#f87171','#a78bfa','#22d3ee'];
              var maxLen = Math.max(data.length, 1);
              var chartOpts = {
                type: 'doughnut',
                data: { labels: labels, datasets: [{ data: data, backgroundColor: colors.slice(0, maxLen), borderWidth: 0 }] },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { generateLabels: function(chart) { var ds = chart.data; return (ds.labels || []).map(function(l, i) { return { text: l + ' (' + (ds.datasets[0].data[i] || 0) + '%)', fillStyle: ds.datasets[0].backgroundColor[i] }; }); } } },
                    tooltip: { callbacks: { label: function(ctx) { var pct = ctx.parsed ? ctx.parsed : 0; return (ctx.label || '') + ': ' + pct.toFixed(1) + '%'; } } },
                    datalabels: { formatter: function(v) { return v ? v.toFixed(1) + '%' : ''; }, color: '#fff', font: { size: 13, weight: 'bold' } }
                  }
                }
              };
              if (typeof ChartDataLabels !== 'undefined') Chart.register(ChartDataLabels);
              rdChart = new Chart(ctx, chartOpts);
            }
          } catch (chartErr) { if (console && console.warn) console.warn('Chart:', chartErr); }
          var byTerr = (res && res.by_territory) ? res.by_territory : [];
          var terrTb = '<div style="overflow-x:auto"><table style="text-align:center"><thead><tr><th>ÐÐ¾ÑÐ¾Ð´</th><th>Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð²</th><th>ÐÐ¾Ð»Ð¸ÑÐµÑÑÐ²Ð¾ Ð·Ð°ÐºÐ°Ð·Ð¾Ð²</th><th>Ð¡ÑÐ¼Ð¼Ð°</th></tr></thead><tbody>';
          byTerr.forEach(function (r) {
            terrTb += '<tr><td>' + escAttr(r.city || '') + '</td><td>' + escAttr(r.territory || '') + '</td><td>' + (r.customers_count || 0) + '</td><td>' + (r.orders_count || 0) + '</td><td>' + (r.orders_sum != null ? Number(r.orders_sum).toLocaleString('ru-RU', {minimumFractionDigits:2}) : '0') + '</td></tr>';
          });
          terrTb += '</tbody></table></div>';
          var rtEl = document.getElementById('rd_territory_table');
          if (rtEl) rtEl.innerHTML = terrTb;
          var tb = '<div style="overflow-x:auto"><table style="text-align:center"><thead><tr><th>ÐÐ°ÑÐµÐ³Ð¾ÑÐ¸Ñ</th><th>ÐÐ¾Ð»Ñ %</th><th>Ð¡ÑÐ¼Ð¼Ð°</th><th>ÐÐ±ÑÑÐ¼</th></tr></thead><tbody>';
          var totalSum = 0, totalQty = 0;
          byCat.forEach(function (r) { totalSum += Number(r.sum_amount || 0); totalQty += Number(r.quantity || 0); });
          byCat.forEach(function (r) {
            tb += '<tr><td>' + escAttr(r.category || '') + '</td><td>' + (r.share_pct != null ? r.share_pct.toFixed(2) : '0') + '</td><td>' + (r.sum_amount != null ? Number(r.sum_amount).toLocaleString('ru-RU', {minimumFractionDigits:2}) : '0') + '</td><td>' + (r.quantity || 0) + '</td></tr>';
          });
          tb += '<tr style="font-weight:600;background:#f8fafc"><td>ÐÑÐ¾Ð³</td><td>100</td><td>' + totalSum.toLocaleString('ru-RU', {minimumFractionDigits:2, maximumFractionDigits:2}) + '</td><td>' + totalQty + '</td></tr>';
          tb += '</tbody></table></div>';
          document.getElementById('rd_table').innerHTML = byCat.length ? tb : '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ Ð¿Ð¾ ÐºÐ°ÑÐµÐ³Ð¾ÑÐ¸ÑÐ¼.</p>';
        }
        function load() {
          var df = dateToApiFormat((document.getElementById('rd_date_from') && document.getElementById('rd_date_from').value) || '');
          var dt = dateToApiFormat((document.getElementById('rd_date_to') && document.getElementById('rd_date_to').value) || '');
          var status = document.getElementById('rd_status') && document.getElementById('rd_status').value;
          var cat = document.getElementById('rd_category') && document.getElementById('rd_category').value;
          var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt)); if (status) params.push('status_codes=' + encodeURIComponent(status)); if (cat) params.push('product_category=' + encodeURIComponent(cat));
          var url = '/api/v1/reports/dashboard'; if (params.length) url += '?' + params.join('&');
          api(url).then(render).catch(function (e) { render({ error: (e && e.data && e.data.detail) ? String(e.data.detail) : 'ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸' }); });
        }
        document.getElementById('rd_load').onclick = load;
        setTimeout(load, 100);
        document.getElementById('rd_excel').onclick = function () {
          var df = dateToApiFormat((document.getElementById('rd_date_from') && document.getElementById('rd_date_from').value) || '');
          var dt = dateToApiFormat((document.getElementById('rd_date_to') && document.getElementById('rd_date_to').value) || '');
          var status = document.getElementById('rd_status') && document.getElementById('rd_status').value;
          var cat = document.getElementById('rd_category') && document.getElementById('rd_category').value;
          var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt)); if (status) params.push('status_codes=' + encodeURIComponent(status)); if (cat) params.push('product_category=' + encodeURIComponent(cat));
          var url = '/api/v1/reports/dashboard/export'; if (params.length) url += '?' + params.join('&');
          fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) { if (!r.ok) throw new Error(); return r.blob(); }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dashboard_categories.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function () { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸'); });
        };
        var rdExcelTerr = document.getElementById('rd_excel_territory');
        if (rdExcelTerr) rdExcelTerr.onclick = function () {
          var df = dateToApiFormat((document.getElementById('rd_date_from') && document.getElementById('rd_date_from').value) || '');
          var dt = dateToApiFormat((document.getElementById('rd_date_to') && document.getElementById('rd_date_to').value) || '');
          var status = document.getElementById('rd_status') && document.getElementById('rd_status').value;
          var cat = document.getElementById('rd_category') && document.getElementById('rd_category').value;
          var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt)); if (status) params.push('status_codes=' + encodeURIComponent(status)); if (cat) params.push('product_category=' + encodeURIComponent(cat));
          var url = '/api/v1/reports/dashboard/export'; if (params.length) url += '?' + params.join('&');
          fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) { if (!r.ok) throw new Error(); return r.blob(); }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dashboard_territories.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function () { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸'); });
        };
      }

      function loadSectionReportPhotos() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>ÐÑÑÑÑ: Ð¤Ð¾ÑÐ¾Ð³ÑÐ°ÑÐ¸Ð¸ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð²</h2><p><button type="button" class="btn btn-primary" id="rp_load">ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ</button> <button type="button" class="btn btn-secondary" id="rp_export">Ð­ÐºÑÐ¿Ð¾ÑÑ Ð² Excel</button></p><div id="rp_stats"></div><div id="rp_table_wrap"></div></div>';
        var rpSortCol = null, rpSortDir = 1;
        function run() {
          document.getElementById('rp_stats').innerHTML = '<p>ÐÐ°Ð³ÑÑÐ·ÐºÐ°...</p>';
          document.getElementById('rp_table_wrap').innerHTML = '';
          api('/api/v1/reports/photos').then(function (res) {
            var stats = (res && res.statistics) ? res.statistics : {};
            document.getElementById('rp_stats').innerHTML = '<p><strong>ÐÑÐµÐ³Ð¾ ÑÐ¾ÑÐ¾:</strong> ' + (stats.total_photos || 0) + ', ÐÐ»Ð¸ÐµÐ½ÑÐ¾Ð² Ñ ÑÐ¾ÑÐ¾: ' + (stats.customers_with_photos || 0) + ', ÐÐµÐ· ÑÐ¾ÑÐ¾: ' + (stats.customers_without_photos || 0) + '</p>';
            var without = (res && res.customers_without_photos) ? res.customers_without_photos : [];
            var recent = (res && res.recent_uploads) ? res.recent_uploads : [];
            var sortData = function (data, col, dir) {
              if (!col) return data;
              return data.slice().sort(function (a, b) {
                var av = (a[col] || '').toString().toLowerCase();
                var bv = (b[col] || '').toString().toLowerCase();
                return av === bv ? 0 : (av < bv ? -1 : 1) * dir;
              });
            };
            var buildTable = function (data, fields, headers, includeDate) {
              var tb = '<div style="overflow-x:auto;margin-top:16px"><table><thead><tr>';
              for (var i = 0; i < headers.length; i++) {
                var hdr = headers[i];
                var col = fields[i];
                tb += '<th' + (col ? ' data-col="' + col + '" style="cursor:pointer"' : '') + '>' + hdr + (col && rpSortCol === col ? (rpSortDir === 1 ? ' â²' : ' â¼') : '') + '</th>';
              }
              tb += '</tr></thead><tbody>';
              data.forEach(function (row) {
                tb += '<tr>';
                for (var i = 0; i < fields.length; i++) {
                  var val = row[fields[i]];
                  if (includeDate && fields[i] === 'uploaded_at' && val) val = val.replace('T', ' ').substring(0, 19);
                  tb += '<td>' + escAttr(val || '') + '</td>';
                }
                tb += '</tr>';
              });
              tb += '</tbody></table></div>';
              return tb;
            };
            var recentSorted = sortData(recent, rpSortCol, rpSortDir);
            var tb = buildTable(recentSorted, ['customer_name', 'address', 'city', 'territory', 'phone', 'contact_person', 'tax_id', 'uploaded_at', 'uploaded_by'], ['ÐÐ»Ð¸ÐµÐ½Ñ', 'ÐÐ´ÑÐµÑ', 'ÐÐ¾ÑÐ¾Ð´', 'Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ', 'Ð¢ÐµÐ»ÐµÑÐ¾Ð½', 'ÐÐ¾Ð½ÑÐ°ÐºÑÐ½Ð¾Ðµ Ð»Ð¸ÑÐ¾', 'ÐÐÐ', 'ÐÐ°ÑÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸', 'ÐÐ°Ð³ÑÑÐ¶ÐµÐ½Ð¾'], true);
            var withoutSorted = sortData(without, rpSortCol, rpSortDir);
            var tb2 = buildTable(withoutSorted, ['customer_name', 'address', 'city', 'territory', 'phone', 'contact_person', 'tax_id'], ['ÐÐ»Ð¸ÐµÐ½Ñ', 'ÐÐ´ÑÐµÑ', 'ÐÐ¾ÑÐ¾Ð´', 'Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ', 'Ð¢ÐµÐ»ÐµÑÐ¾Ð½', 'ÐÐ¾Ð½ÑÐ°ÐºÑÐ½Ð¾Ðµ Ð»Ð¸ÑÐ¾', 'ÐÐÐ'], false);
            var html = '';
            if (without.length) {
              html += '<h3 style="margin:16px 0 8px 0">ÐÐ»Ð¸ÐµÐ½ÑÑ Ð±ÐµÐ· ÑÐ¾ÑÐ¾</h3>' + tb2;
            }
            html += '<h3 style="margin:16px 0 8px 0">ÐÐ¾ÑÐ»ÐµÐ´Ð½Ð¸Ðµ Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</h3>' + (recent.length ? tb : '<p>ÐÐµÑ Ð½ÐµÐ´Ð°Ð²Ð½Ð¸Ñ Ð·Ð°Ð³ÑÑÐ·Ð¾Ðº.</p>');
            document.getElementById('rp_table_wrap').innerHTML = html;
            var ths = document.querySelectorAll('#rp_table_wrap th[data-col]');
            ths.forEach(function (th) {
              th.onclick = function () {
                var col = th.getAttribute('data-col');
                if (rpSortCol === col) rpSortDir = -rpSortDir;
                else { rpSortCol = col; rpSortDir = 1; }
                run();
              };
            });
          }).catch(function (e) {
            document.getElementById('rp_stats').innerHTML = '<p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸</p>';
          });
        }
        document.getElementById('rp_load').onclick = run;
        run();
        var rpExport = document.getElementById('rp_export');
        if (rpExport) {
          rpExport.onclick = function () {
            fetch('/api/v1/reports/photos/export', { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) throw new Error('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_photos.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('ÐÑÐ¸Ð±ÐºÐ° Ð²ÑÐ³ÑÑÐ·ÐºÐ¸ Ð¾ÑÑÑÑÐ°.'); });
          };
        }
      }

      // ========================================
      // Ð¡ÐÐ ÐÐÐÐ§ÐÐÐ: ÐÐ¾ÑÐ¾Ð´Ð°
      // ========================================
      function loadSectionTranslations() {
        api('/api/v1/translations?limit=500').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="trAdd">Add translation</button>' : '';
          var html = '' +
            '<div class="card">' +
            '<h2>References: Translations</h2>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
            '<input id="trKeyLike" placeholder="Key contains..." style="padding:8px 10px;border:1px solid #ccc;border-radius:6px">' +
            '<input id="trTextLike" placeholder="Text contains..." style="padding:8px 10px;border:1px solid #ccc;border-radius:6px">' +
            '<select id="trLang" style="padding:8px 10px;border:1px solid #ccc;border-radius:6px"><option value="">All languages</option><option value="ru">ru</option><option value="uz">uz</option><option value="en">en</option></select>' +
            '<input id="trCat" placeholder="Category" style="padding:8px 10px;border:1px solid #ccc;border-radius:6px">' +
            '<button type="button" class="btn btn-secondary" id="trFilter">Filter</button>' + addBtn +
            '</div>' +
            '<div id="trTable"></div><div id="trErr" class="err"></div>' +
            '</div>';
          content.innerHTML = html;

          function render(rows) {
            var tableDiv = document.getElementById('trTable');
            if (!Array.isArray(rows) || !rows.length) { tableDiv.innerHTML = '<p>No translations.</p>'; return; }
            var t = '<table><thead><tr><th>Key</th><th>Lang</th><th>Text</th><th>Category</th><th>Actions</th></tr></thead><tbody>';
            rows.forEach(function (r) {
              t += '<tr>' +
                '<td>' + escAttr(r.translation_key || '') + '</td>' +
                '<td>' + escAttr(r.language_code || '') + '</td>' +
                '<td>' + escAttr(r.translation_text || '') + '</td>' +
                '<td>' + escAttr(r.category || '') + '</td>' +
                '<td>' + (isAdmin() ?
                  '<button type="button" class="btn btn-secondary btn-small" data-tr-edit="' + escAttr(r.id || '') + '" data-tr-json="' + escape(JSON.stringify(r)) + '">Edit</button>' +
                  '<button type="button" class="btn btn-secondary btn-small" data-tr-del="' + escAttr(r.id || '') + '">Delete</button>' :
                  '') + '</td>' +
                '</tr>';
            });
            t += '</tbody></table>';
            tableDiv.innerHTML = t;

            tableDiv.querySelectorAll('[data-tr-edit]').forEach(function (btn) {
              btn.onclick = function () {
                var r = JSON.parse(unescape(btn.getAttribute('data-tr-json')));
                showModal('Edit translation',
                  '<div class="form-group"><label>Text</label><input type="text" id="tre_text" value="' + escAttr(r.translation_text || '') + '"></div>' +
                  '<div class="form-group"><label>Category</label><input type="text" id="tre_cat" value="' + escAttr(r.category || '') + '"></div>' +
                  '<div class="form-group"><label>Notes</label><input type="text" id="tre_notes" value="' + escAttr(r.notes || '') + '"></div>',
                  function () {
                    return api('/api/v1/translations/' + encodeURIComponent(r.id), {
                      method: 'PUT',
                      body: JSON.stringify({
                        translation_text: document.getElementById('tre_text').value.trim(),
                        category: document.getElementById('tre_cat').value.trim() || null,
                        notes: document.getElementById('tre_notes').value.trim() || null
                      })
                    }).then(function () { loadSectionTranslations(); });
                  }
                );
              };
            });

            tableDiv.querySelectorAll('[data-tr-del]').forEach(function (btn) {
              btn.onclick = function () {
                if (!confirm('Delete translation?')) return;
                api('/api/v1/translations/' + encodeURIComponent(btn.getAttribute('data-tr-del')), { method: 'DELETE' })
                  .then(function () { loadSectionTranslations(); })
                  .catch(function (e) { alert((e.data && e.data.detail) ? e.data.detail : 'Delete failed'); });
              };
            });
          }

          render(list || []);

          var trFilter = document.getElementById('trFilter');
          if (trFilter) {
            trFilter.onclick = function () {
              var params = [];
              var keyLike = document.getElementById('trKeyLike').value.trim();
              var textLike = document.getElementById('trTextLike').value.trim();
              var lang = document.getElementById('trLang').value;
              var cat = document.getElementById('trCat').value.trim();
              if (keyLike) params.push('key_like=' + encodeURIComponent(keyLike));
              if (textLike) params.push('text_like=' + encodeURIComponent(textLike));
              if (lang) params.push('language=' + encodeURIComponent(lang));
              if (cat) params.push('category=' + encodeURIComponent(cat));
              params.push('limit=500');
              api('/api/v1/translations?' + params.join('&')).then(render);
            };
          }

          var trAdd = document.getElementById('trAdd');
          if (trAdd) {
            trAdd.onclick = function () {
              showModal('Add translation',
                '<div class="form-group"><label>Key</label><input type="text" id="tr_key" placeholder="menu.users"></div>' +
                '<div class="form-group"><label>Language</label><select id="tr_lang"><option value="ru">ru</option><option value="uz">uz</option><option value="en">en</option></select></div>' +
                '<div class="form-group"><label>Text</label><input type="text" id="tr_text"></div>' +
                '<div class="form-group"><label>Category</label><input type="text" id="tr_category" placeholder="menu"></div>' +
                '<div class="form-group"><label>Notes</label><input type="text" id="tr_notes"></div>',
                function () {
                  return api('/api/v1/translations', {
                    method: 'POST',
                    body: JSON.stringify({
                      translation_key: document.getElementById('tr_key').value.trim(),
                      language_code: document.getElementById('tr_lang').value,
                      translation_text: document.getElementById('tr_text').value.trim(),
                      category: document.getElementById('tr_category').value.trim() || null,
                      notes: document.getElementById('tr_notes').value.trim() || null
                    })
                  }).then(function () { loadSectionTranslations(); });
                }
              );
            };
          }
        }).catch(function () {
          var content = document.getElementById('content');
          if (content) content.innerHTML = '<div class="card"><p class="err">Failed to load translations.</p></div>';
        });
      }

      function loadSectionCities() {
        api('/api/v1/dictionary/cities').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="cityAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð³Ð¾ÑÐ¾Ð´</button>' : '';
          var html = '<div class="card"><h2>Ð¡Ð¿ÑÐ°Ð²Ð¾ÑÐ½Ð¸Ðº: ÐÐ¾ÑÐ¾Ð´Ð°</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="citiesTable"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('citiesTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ.</p>'; bindCityAdd(); return; }
          var t = '<table><thead><tr><th>ID</th><th>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</th><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
          list.forEach(function (city) {
            t += '<tr><td>' + city.id + '</td><td>' + escAttr(city.name || '') + '</td><td>';
            if (isAdmin()) {
              t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-id="' + city.id + '" data-name="' + escAttr(city.name || '') + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> ';
              t += '<button type="button" class="btn btn-secondary btn-small" data-del data-id="' + city.id + '" data-name="' + escAttr(city.name || '') + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
            }
            t += '</td></tr>';
          });
          t += '</tbody></table>';
          tableDiv.innerHTML = t;
          bindCityAdd();
          tableDiv.querySelectorAll('[data-edit]').forEach(function (btn) {
            btn.onclick = function () {
              var cityId = btn.getAttribute('data-id');
              var cityName = btn.getAttribute('data-name');
              showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ Ð³Ð¾ÑÐ¾Ð´', '<div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð³Ð¾ÑÐ¾Ð´Ð°</label><input type="text" id="cityName" value="' + cityName.replace(/&quot;/g, '"') + '"></div>', function () {
                var name = document.getElementById('cityName').value.trim();
                if (!name) { alert('ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ'); return Promise.reject(); }
                return api('/api/v1/dictionary/cities/' + cityId, { method: 'PUT', body: JSON.stringify({ name: name }) }).then(function () { loadSectionCities(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-del]').forEach(function (btn) {
            btn.onclick = function () {
              var cityName = btn.getAttribute('data-name');
              if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ Ð³Ð¾ÑÐ¾Ð´ Â«' + cityName + 'Â»?')) return;
              api('/api/v1/dictionary/cities/' + btn.getAttribute('data-id'), { method: 'DELETE' }).then(function () { loadSectionCities(); }).catch(function (e) {
                alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ´Ð°Ð»ÐµÐ½Ð¸Ñ');
              });
            };
          });
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ Ð³Ð¾ÑÐ¾Ð´Ð¾Ð².</p></div>'; });
        function bindCityAdd() {
          var btn = document.getElementById('cityAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ Ð³Ð¾ÑÐ¾Ð´', '<div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð³Ð¾ÑÐ¾Ð´Ð°</label><input type="text" id="cityName" placeholder="ÐÐ°Ð¿ÑÐ¸Ð¼ÐµÑ: Ð¢Ð°ÑÐºÐµÐ½Ñ"></div>', function () {
              var name = document.getElementById('cityName').value.trim();
              if (!name) { alert('ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ'); return Promise.reject(); }
              return api('/api/v1/dictionary/cities', { method: 'POST', body: JSON.stringify({ name: name }) }).then(function () { loadSectionCities(); });
            });
          };
        }
      }

      // ========================================
      // Ð¡ÐÐ ÐÐÐÐ§ÐÐÐ: Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸
      // ========================================
      function loadSectionTerritories() {
        api('/api/v1/dictionary/territories').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="territoryAdd">ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ</button>' : '';
          var html = '<div class="card"><h2>Ð¡Ð¿ÑÐ°Ð²Ð¾ÑÐ½Ð¸Ðº: Ð¢ÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="territoriesTable"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('territoriesTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>ÐÐµÑ Ð´Ð°Ð½Ð½ÑÑ.</p>'; bindTerritoryAdd(); return; }
          var t = '<table><thead><tr><th>ID</th><th>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ</th><th>ÐÐµÐ¹ÑÑÐ²Ð¸Ñ</th></tr></thead><tbody>';
          list.forEach(function (territory) {
            t += '<tr><td>' + territory.id + '</td><td>' + escAttr(territory.name || '') + '</td><td>';
            if (isAdmin()) {
              t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-id="' + territory.id + '" data-name="' + escAttr(territory.name || '') + '">ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ</button> ';
              t += '<button type="button" class="btn btn-secondary btn-small" data-del data-id="' + territory.id + '" data-name="' + escAttr(territory.name || '') + '">Ð£Ð´Ð°Ð»Ð¸ÑÑ</button>';
            }
            t += '</td></tr>';
          });
          t += '</tbody></table>';
          tableDiv.innerHTML = t;
          bindTerritoryAdd();
          tableDiv.querySelectorAll('[data-edit]').forEach(function (btn) {
            btn.onclick = function () {
              var territoryId = btn.getAttribute('data-id');
              var territoryName = btn.getAttribute('data-name');
              showModal('ÐÐ·Ð¼ÐµÐ½Ð¸ÑÑ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ', '<div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸</label><input type="text" id="territoryName" value="' + territoryName.replace(/&quot;/g, '"') + '"></div>', function () {
                var name = document.getElementById('territoryName').value.trim();
                if (!name) { alert('ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ'); return Promise.reject(); }
                return api('/api/v1/dictionary/territories/' + territoryId, { method: 'PUT', body: JSON.stringify({ name: name }) }).then(function () { loadSectionTerritories(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-del]').forEach(function (btn) {
            btn.onclick = function () {
              var territoryName = btn.getAttribute('data-name');
              if (!confirm('Ð£Ð´Ð°Ð»Ð¸ÑÑ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ Â«' + territoryName + 'Â»?')) return;
              api('/api/v1/dictionary/territories/' + btn.getAttribute('data-id'), { method: 'DELETE' }).then(function () { loadSectionTerritories(); }).catch(function (e) {
                alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'ÐÑÐ¸Ð±ÐºÐ° ÑÐ´Ð°Ð»ÐµÐ½Ð¸Ñ');
              });
            };
          });
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¹.</p></div>'; });
        function bindTerritoryAdd() {
          var btn = document.getElementById('territoryAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('ÐÐ¾Ð±Ð°Ð²Ð¸ÑÑ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ñ', '<div class="form-group"><label>ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ ÑÐµÑÑÐ¸ÑÐ¾ÑÐ¸Ð¸</label><input type="text" id="territoryName" placeholder="ÐÐ°Ð¿ÑÐ¸Ð¼ÐµÑ: Ð¦ÐµÐ½ÑÑ"></div>', function () {
              var name = document.getElementById('territoryName').value.trim();
              if (!name) { alert('ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ'); return Promise.reject(); }
              return api('/api/v1/dictionary/territories', { method: 'POST', body: JSON.stringify({ name: name }) }).then(function () { loadSectionTerritories(); });
            });
          };
        }
      }

      document.getElementById('btnLogout').onclick = function () {
        fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin' })
          .catch(function () { return null; })
          .finally(function () {
            localStorage.removeItem('sds_token');
            window.location.href = '/login';
          });
      };
      var btnAbout = document.getElementById('btnAbout');
      if (btnAbout) {
        btnAbout.onclick = function () {
          var bodyHtml = '' +
            '<p><strong>Ð¡Ð¸ÑÑÐµÐ¼Ð° ÑÐ¿ÑÐ°Ð²Ð»ÐµÐ½Ð¸Ñ Ð¿ÑÐ¾Ð´Ð°Ð¶Ð°Ð¼Ð¸ Ð¸ Ð´Ð¸ÑÑÑÐ¸Ð±ÑÑÐ¸ÐµÐ¹</strong></p>' +
            '<p style="margin-top:8px;margin-bottom:4px">Ð Ð°Ð·ÑÐ°Ð±Ð¾ÑÐ°Ð½Ð¾:</p>' +
            '<p style="margin:0 0 12px 0">ÐÐ°ÑÐ°ÑÐµÐ½ÐºÐ¾Ð² ÐÐ¼Ð¸ÑÑÐ¸Ð¹</p>' +
            '<p style="margin:0 0 4px 0"><strong>ÐÐ¾Ð½ÑÐ°ÐºÑÑ ÑÐ°Ð·ÑÐ°Ð±Ð¾ÑÑÐ¸ÐºÐ°:</strong></p>' +
            '<p style="margin:0 0 4px 0">ð§ Email: <a href="mailto:dima@zakharenkov.ru">dima@zakharenkov.ru</a></p>' +
            '<p style="margin:0 0 4px 0">ð Ð¡Ð°Ð¹Ñ: <a href="https://zakharenkov.ru" target="_blank" rel="noopener">zakharenkov.ru</a></p>' +
            '<p style="margin:0 0 4px 0">ð¼ LinkedIn: <a href="https://www.linkedin.com/in/dmity-zakharenkov/" target="_blank" rel="noopener">linkedin.com/in/dmity-zakharenkov</a></p>' +
            '<p style="margin:0 0 0 0">ð± Telegram: <a href="https://t.me/dmitry_zakharenkov" target="_blank" rel="noopener">@dmitry_zakharenkov</a></p>';
          showModal('Ð ÑÐ¸ÑÑÐµÐ¼Ðµ', bodyHtml, function () { return Promise.resolve(); }, { closeOnly: true });
        };
      }
      var sidebarEl = document.querySelector('.sidebar');
      if (sidebarEl) {
        sidebarEl.addEventListener('click', function (e) {
          var a = e.target && e.target.closest ? e.target.closest('a') : null;
          if (!a || !a.getAttribute('data-section')) return;
          e.preventDefault();
          var s = a.getAttribute('data-section');
          if (s === 'ref_parent' || s === 'customers_parent' || s === 'visits_parent' || s === 'orders_parent' || s === 'ops_parent' || s === 'cash_parent' || s === 'reports_parent') {
            var sub = document.getElementById(a.id === 'refParent' ? 'refSubmenu' : a.id === 'customersParent' ? 'customersSubmenu' : a.id === 'visitsParent' ? 'visitsSubmenu' : a.id === 'ordersParent' ? 'ordersSubmenu' : a.id === 'opsParent' ? 'opsSubmenu' : a.id === 'cashParent' ? 'cashSubmenu' : a.id === 'reportsParent' ? 'reportsSubmenu' : null);
            if (sub) sub.classList.toggle('open');
            a.classList.toggle('open');
          } else {
            showSection(s);
          }
        });
      }

      document.getElementById('userName').textContent = 'ÐÐ°Ð³ÑÑÐ·ÐºÐ°...';
      loadMe().then(function () { return initLanguageSwitcher(); }).then(function () { return loadMenu(); }).then(function () {
        var first = (menuItems && menuItems[0]) ? (SIDEBAR_SECTIONS[menuItems[0].code] || 'users') : 'users';
        showSection(first);
      }).catch(function () { document.getElementById('userName').textContent = 'ÐÑÐ¸Ð±ÐºÐ°'; initLanguageSwitcher().then(function () { return loadMenu(); }).then(function () { showSection(menuItems[0] ? (SIDEBAR_SECTIONS[menuItems[0].code] || menuItems[0].code) : 'users'); }); });
    })();