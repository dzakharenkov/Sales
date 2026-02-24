
    (function () {
      var token = localStorage.getItem('sds_token');
      var useBearerHeader = !!token && token !== 'cookie';
      if (!token) { window.location.href = '/login'; return; }

      var languageConfig = null;
      var currentLanguage = (localStorage.getItem('sds_lang') || '').toLowerCase() || 'ru';
      var currentSectionName = null;
      var LANG_FLAGS = { ru: 'RU', uz: 'UZ', en: 'EN' };
      var UI_TEXT = {
        users_title: { ru: 'РџРѕР»СЊР·РѕРІР°С‚РµР»Рё', uz: 'Foydalanuvchilar', en: 'Users' },
        add_user: { ru: 'Р”РѕР±Р°РІРёС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ', uz: 'Foydalanuvchi qo\'shish', en: 'Add user' },
        menu_access: { ru: 'РџСЂР°РІР° РґРѕСЃС‚СѓРїР° Рє РјРµРЅСЋ', uz: 'Menyu huquqlari', en: 'Menu access' },
        login: { ru: 'Р›РѕРіРёРЅ', uz: 'Login', en: 'Login' },
        fio: { ru: 'Р¤РРћ', uz: 'F.I.Sh.', en: 'Full Name' },
        role: { ru: 'Р РѕР»СЊ', uz: 'Rol', en: 'Role' },
        status: { ru: 'РЎС‚Р°С‚СѓСЃ', uz: 'Holat', en: 'Status' },
        password: { ru: 'РџР°СЂРѕР»СЊ', uz: 'Parol', en: 'Password' },
        actions: { ru: 'Р”РµР№СЃС‚РІРёСЏ', uz: 'Amallar', en: 'Actions' },
        yes: { ru: 'Р”Р°', uz: 'Ha', en: 'Yes' },
        no: { ru: 'РќРµС‚', uz: 'Yo\'q', en: 'No' },
        edit: { ru: 'РР·РјРµРЅРёС‚СЊ', uz: 'Tahrirlash', en: 'Edit' },
        change_password: { ru: 'РЎРјРµРЅРёС‚СЊ РїР°СЂРѕР»СЊ', uz: 'Parolni almashtirish', en: 'Change password' },
        admin_only: { ru: 'Р”РѕСЃС‚СѓРї С‚РѕР»СЊРєРѕ РґР»СЏ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°.', uz: 'Faqat administrator uchun.', en: 'Admin only.' },
        no_users: { ru: 'РќРµС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№.', uz: 'Foydalanuvchilar yo\'q.', en: 'No users.' },
        add_user_modal: { ru: 'Р”РѕР±Р°РІРёС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ', uz: 'Foydalanuvchi qo\'shish', en: 'Add user' },
        edit_user_modal: { ru: 'РР·РјРµРЅРёС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ', uz: 'Foydalanuvchini tahrirlash', en: 'Edit user' },
        change_password_modal: { ru: 'РЎРјРµРЅРёС‚СЊ РїР°СЂРѕР»СЊ', uz: 'Parolni almashtirish', en: 'Change password' },
        new_password: { ru: 'РќРѕРІС‹Р№ РїР°СЂРѕР»СЊ', uz: 'Yangi parol', en: 'New password' },
      };

      var RU_KEY_FALLBACK = {
        "button.about": "\u041e \u0441\u0438\u0441\u0442\u0435\u043c\u0435",
        "button.logout": "\u0412\u044b\u0439\u0442\u0438",
        "button.reset": "\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c",
        "button.show": "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c",
        "ui.common.export_excel": "\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0432 Excel",
        "ui.common.all": "\u0412\u0441\u0435",
        "ui.common.total": "\u0412\u0441\u0435\u0433\u043e",
        "ui.common.results": "\u0420\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u044b",
        "ui.common.all_staff": "\u0412\u0441\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438",
        "ui.common.select_customer": "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043a\u043b\u0438\u0435\u043d\u0442\u0430",
        "ui.common.not_selected": "\u041d\u0435 \u0432\u044b\u0431\u0440\u0430\u043d",
        "ui.cities.add": "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0433\u043e\u0440\u043e\u0434",
        "ui.territories.add": "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044e",
        "ui.products.add": "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440",
        "ui.visits_search.title": "\u041f\u043e\u0438\u0441\u043a \u0432\u0438\u0437\u0438\u0442\u0430",
        "ui.visits_search.customer_name_or_tax": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0438\u043b\u0438 \u0418\u041d\u041d",
        "ui.visits_create.title": "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0432\u0438\u0437\u0438\u0442",
        "ui.visits_calendar.title": "\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u0432\u0438\u0437\u0438\u0442\u043e\u0432",
        "ui.orders.create": "\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0437\u0430\u043a\u0430\u0437",
        "ui.orders.export": "\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043a\u0430\u0437\u044b \u0432 Excel",
        "ui.orders.save_variant": "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0432\u0430\u0440\u0438\u0430\u043d\u0442",
        "ui.orders.save_order": "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0437\u0430\u043a\u0430\u0437",
        "ui.order_items.title": "\u041f\u043e\u0437\u0438\u0446\u0438\u0438 \u0437\u0430\u043a\u0430\u0437\u043e\u0432",
        "ui.order_items.export": "\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u043f\u043e\u0437\u0438\u0446\u0438\u0438 \u0432 Excel",
        "ui.operations.create.title": "\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438",
        "ui.stock.title": "\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u043f\u043e \u0441\u043a\u043b\u0430\u0434\u0443",
        "ui.cash.pending.title": "\u041e\u0436\u0438\u0434\u0430\u044e\u0449\u0438\u0435 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438 \u043e\u0442 \u044d\u043a\u0441\u043f\u0435\u0434\u0438\u0442\u043e\u0440\u043e\u0432",
        "ui.cash.received.title": "\u041f\u0440\u0438\u043d\u044f\u0442\u044b\u0435 \u0434\u0435\u043d\u044c\u0433\u0438 \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434",
        "ui.cashier_orders.title": "\u0417\u0430\u043a\u0430\u0437\u044b \u0434\u043b\u044f \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u043e\u043f\u043b\u0430\u0442\u044b",
        "ui.report.customers.title": "\u041e\u0442\u0447\u0451\u0442: \u041f\u043e \u043a\u043b\u0438\u0435\u043d\u0442\u0430\u043c",
        "ui.report.agents.title": "\u041e\u0442\u0447\u0451\u0442: \u042d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u0430\u0433\u0435\u043d\u0442\u043e\u0432",
        "ui.report.expeditors.title": "\u041e\u0442\u0447\u0451\u0442: \u042d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u044d\u043a\u0441\u043f\u0435\u0434\u0438\u0442\u043e\u0440\u043e\u0432 (\u043f\u043e \u0437\u0430\u043a\u0430\u0437\u0430\u043c)",
        "ui.report.visits.title": "\u041e\u0442\u0447\u0451\u0442: \u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0432\u0438\u0437\u0438\u0442\u043e\u0432",
        "ui.report.photos.title": "\u041e\u0442\u0447\u0451\u0442: \u0424\u043e\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0438 \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432",
        "ui.report.photos.customers_without_photos": "\u041a\u043b\u0438\u0435\u043d\u0442\u044b \u0431\u0435\u0437 \u0444\u043e\u0442\u043e",
        "ui.dashboard.title": "\u0421\u0432\u043e\u0434\u043d\u0430\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430",
        "ui.dashboard.no_category_data": "\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445 \u043f\u043e \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f\u043c.",
        "label.id": "ID",
        "field.active_fem": "\u0410\u043a\u0442\u0438\u0432\u043d\u0430",
        "field.storekeeper": "\u041a\u043b\u0430\u0434\u043e\u0432\u0449\u0438\u043a",
        "field.expeditor_login": "\u042d\u043a\u0441\u043f\u0435\u0434\u0438\u0442\u043e\u0440 (login)",
        "field.weight": "\u0412\u0435\u0441",
        "field.unit": "\u0415\u0434.",
        "field.expiry": "\u0421\u0440\u043e\u043a",
        "field.responsible": "\u041e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439",
        "field.date_from": "\u0414\u0430\u0442\u0430 \u043e\u0442",
        "field.to": "\u043f\u043e",
        "field.date_time": "\u0414\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043c\u044f",
        "field.operation_type_required": "\u0422\u0438\u043f \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438 *",
        "field.customer_required": "\u041a\u043b\u0438\u0435\u043d\u0442 *",
        "field.visit_datetime_required": "\u0414\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043c\u044f \u0432\u0438\u0437\u0438\u0442\u0430 *",
        "field.agent_required": "\u0410\u0433\u0435\u043d\u0442 (\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439) *",
        "field.status_required": "\u0421\u0442\u0430\u0442\u0443\u0441 *",
        "field.comment": "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439",
        "field.payment_type": "\u0422\u0438\u043f \u043e\u043f\u043b\u0430\u0442\u044b",
        "field.payment_confirmed": "\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430",
        "field.last_update": "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435",
        "field.tax_id": "\u0418\u041d\u041d",
        "field.account_no": "\u0420/\u0421",
        "status.planned": "\u0417\u0430\u043f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u043d",
        "ui.translations.text_contains": "\u0422\u0435\u043a\u0441\u0442 \u0441\u043e\u0434\u0435\u0440\u0436\u0438\u0442...",
        "ui.customers.col.id": "ID \u043a\u043b\u0438\u0435\u043d\u0442\u0430",
        "ui.customers.col.name": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u0430",
        "ui.customers.col.firm": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0444\u0438\u0440\u043c\u044b",
        "ui.customers.col.city": "\u0413\u043e\u0440\u043e\u0434",
        "ui.customers.col.phone": "\u0422\u0435\u043b\u0435\u0444\u043e\u043d",
        "ui.customers.col.tax_id": "\u0418\u041d\u041d",
      };
      function tUi(key, fallback) {
        var tr = UI_TEXT[key];
        if (!tr) return fallback || key;
        return tr[currentLanguage] || tr.ru || fallback || key;
      }

      function uiTr(key, fallback) {
        var val = window._uiTranslations && window._uiTranslations[key];
        var isBroken = !!val && (val === key || /^\?{2,}/.test(String(val).trim()) || String(val).indexOf('??') >= 0);
        if (!val || isBroken) {
          if (currentLanguage === 'ru' && RU_KEY_FALLBACK[key]) return RU_KEY_FALLBACK[key];
          return fallback || key;
        }
        return val;
      }

      function formatUserStatusLabel(status) {
        var raw = (status || '').toString().trim().toLowerCase();
        var map = {
          active: { ru: 'Р°РєС‚РёРІРµРЅ', uz: 'faol', en: 'active' },
          'Р°РєС‚РёРІРµРЅ': { ru: 'Р°РєС‚РёРІРµРЅ', uz: 'faol', en: 'active' },
          inactive: { ru: 'РЅРµР°РєС‚РёРІРµРЅ', uz: 'nofaol', en: 'inactive' },
          'РЅРµР°РєС‚РёРІРµРЅ': { ru: 'РЅРµР°РєС‚РёРІРµРЅ', uz: 'nofaol', en: 'inactive' },
        };
        if (map[raw]) return map[raw][currentLanguage] || map[raw].ru;
        return status || '';
      }

      var CHILD_MENU_TEXT = {
        ref_payment: { ru: 'РўРёРїС‹ РѕРїР»Р°С‚', uz: 'To\'lov turlari', en: 'Payment types' },
        ref_products: { ru: 'РўРёРїС‹ РїСЂРѕРґСѓРєС‚РѕРІ', uz: 'Mahsulot turlari', en: 'Product types' },
        ref_operations: { ru: 'РўРёРїС‹ РѕРїРµСЂР°С†РёР№', uz: 'Operatsiya turlari', en: 'Operation types' },
        ref_currency: { ru: 'Р’Р°Р»СЋС‚Р°', uz: 'Valyuta', en: 'Currency' },
        ref_cities: { ru: 'Р“РѕСЂРѕРґР°', uz: 'Shaharlar', en: 'Cities' },
        ref_territories: { ru: 'РўРµСЂСЂРёС‚РѕСЂРёРё', uz: 'Hududlar', en: 'Territories' },
        warehouses: { ru: 'РЎРєР»Р°РґС‹', uz: 'Omborlar', en: 'Warehouses' },
        products: { ru: 'РўРѕРІР°СЂС‹', uz: 'Tovarlar', en: 'Products' },
        ref_translations: { ru: 'РџРµСЂРµРІРѕРґС‹', uz: 'Tarjimalar', en: 'Translations' },
        customers: { ru: 'РџРѕРёСЃРє РєР»РёРµРЅС‚Р°', uz: 'Mijoz qidirish', en: 'Customer search' },
        customers_create: { ru: 'РЎРѕР·РґР°С‚СЊ РєР»РёРµРЅС‚Р°', uz: 'Mijoz yaratish', en: 'Create customer' },
        customers_map: { ru: 'РљР»РёРµРЅС‚С‹ РЅР° РєР°СЂС‚Рµ', uz: 'Xaritadagi mijozlar', en: 'Customers on map' },
        visits_search: { ru: 'РџРѕРёСЃРє РІРёР·РёС‚Р°', uz: 'Tashrif qidirish', en: 'Visit search' },
        visits_create: { ru: 'РЎРѕР·РґР°С‚СЊ РІРёР·РёС‚', uz: 'Tashrif yaratish', en: 'Create visit' },
        visits_calendar: { ru: 'РљР°Р»РµРЅРґР°СЂСЊ РІРёР·РёС‚РѕРІ', uz: 'Tashriflar taqvimi', en: 'Visits calendar' },
        orders: { ru: 'РџРѕРёСЃРє Р·Р°РєР°Р·РѕРІ', uz: 'Buyurtmalar qidiruvi', en: 'Orders search' },
        orders_create: { ru: 'РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·', uz: 'Buyurtma yaratish', en: 'Create order' },
        order_items: { ru: 'РџРѕРёСЃРє РїРѕР·РёС†РёР№ Р·Р°РєР°Р·РѕРІ', uz: 'Buyurtma pozitsiyalari', en: 'Order items search' },
        operations: { ru: 'РџРѕРёСЃРє РѕРїРµСЂР°С†РёР№', uz: 'Operatsiyalar qidiruvi', en: 'Operations search' },
        operations_create: { ru: 'РЎРѕР·РґР°С‚СЊ РѕРїРµСЂР°С†РёСЋ', uz: 'Operatsiya yaratish', en: 'Create operation' },
        cash_pending: { ru: 'РћР¶РёРґР°СЋС‰РёРµ РїРµСЂРµРґР°С‡Рё РѕС‚ СЌРєСЃРїРµРґРёС‚РѕСЂРѕРІ', uz: 'Ekspeditordan kutilayotgan topshiruvlar', en: 'Pending handovers' },
        cash_received: { ru: 'РџСЂРёРЅСЏС‚С‹Рµ РґРµРЅСЊРіРё Р·Р° РїРµСЂРёРѕРґ', uz: 'Davr bo\'yicha qabul qilingan pul', en: 'Received cash' },
        cashier_orders: { ru: 'Р—Р°РєР°Р·С‹ РґР»СЏ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РѕРїР»Р°С‚С‹', uz: 'To\'lovni tasdiqlash buyurtmalari', en: 'Orders for payment confirmation' },
        report_customers: { ru: 'РџРѕ РєР»РёРµРЅС‚Р°Рј', uz: 'Mijozlar bo\'yicha', en: 'By customers' },
        report_agents: { ru: 'РџРѕ Р°РіРµРЅС‚Р°Рј', uz: 'Agentlar bo\'yicha', en: 'By agents' },
        report_expeditors: { ru: 'РџРѕ СЌРєСЃРїРµРґРёС‚РѕСЂР°Рј', uz: 'Ekspeditorlar bo\'yicha', en: 'By expeditors' },
        report_visits: { ru: 'РџРѕ РІРёР·РёС‚Р°Рј', uz: 'Tashriflar bo\'yicha', en: 'By visits' },
        report_dashboard: { ru: 'РЎРІРѕРґРЅР°СЏ Р°РЅР°Р»РёС‚РёРєР°', uz: 'Umumiy analitika', en: 'Dashboard' },
        report_photos: { ru: 'Р¤РѕС‚РѕРіСЂР°С„РёРё РєР»РёРµРЅС‚РѕРІ', uz: 'Mijoz suratlari', en: 'Customer photos' },
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
          "ui.customers.col.actions","ui.customers.col.id","ui.customers.col.name","ui.customers.col.firm","ui.customers.col.category","ui.customers.col.address","ui.customers.col.city","ui.customers.col.territory","ui.customers.col.landmark","ui.customers.col.phone","ui.customers.col.contact","ui.customers.col.tax_id","ui.customers.col.status","ui.customers.col.agent_login","ui.customers.col.expeditor_login","ui.customers.col.has_photo","ui.customers.col.lat","ui.customers.col.lon","ui.customers.col.pinfl","ui.customers.col.contract","ui.customers.col.account","ui.customers.col.bank","ui.customers.col.mfo","ui.customers.col.oked","ui.customers.col.vat_code","ui.customers.map.title","ui.customers.map.provider","ui.customers.map.yandex","ui.customers.map.displayed_prefix",
          "ui.dashboard.title","ui.dashboard.date_from","ui.dashboard.date_to","ui.dashboard.statuses","ui.dashboard.category","ui.dashboard.apply","ui.dashboard.loading","ui.dashboard.by_category","ui.dashboard.by_territory","ui.dashboard.export",
          "ui.visits_search.title","ui.visits_search.customer_name_or_tax","ui.visits_create.title","ui.visits_calendar.title",
          "ui.orders.create","ui.orders.export","ui.orders.save_variant","ui.orders.save_order","ui.order_items.title","ui.order_items.export",
          "ui.operations.create.title","ui.stock.title","ui.cash.pending.title","ui.cash.received.title","ui.cashier_orders.title",
          "ui.report.customers.title","ui.report.agents.title","ui.report.expeditors.title","ui.report.visits.title","ui.report.photos.title","ui.report.photos.customers_without_photos",
          "ui.products.add","ui.territories.add","ui.translations.text_contains",
          "ui.common.export_excel","ui.common.total","ui.common.select_customer","ui.common.not_selected","ui.common.all_staff",
          "ui.placeholder.date","ui.placeholder.datetime","ui.placeholder.order_no",
          "field.responsible","field.date_from","field.to","field.date_time","field.storekeeper","field.expeditor_login","field.contact_person",
          "field.active_fem","field.operation_type_required","field.status_required","field.visit_datetime_required","field.account_no","field.last_update","field.payment_type",
          "field.order_delivery_date","field.payment_confirmed","field.order_date","field.customers_count","field.orders_count","field.created_at","field.quantity","field.tax_id","field.unit","field.updated_by",
          "status.planned","menu.ref_payment","menu.ref_products","label.id",
          "field.type","field.customer","field.agent","field.expeditor","field.price",
          "ui.common.all","ui.common.any","ui.common.unassigned","ui.common.total_amount","ui.common.shown","ui.common.all_customers",
          "ui.orders.saved_search","ui.orders.current_search","ui.orders.found_count","ui.order_items.found_count","ui.order_items.load",
          "ui.reports.filters_hint","ui.operations.search_hint"
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
          userPrefix.innerHTML = uiTr("app.user_logged_in_prefix", "Logged in: ") + "<strong id=\"userName\">" + ((strong && strong.textContent) || "—") + "</strong>";
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
        function normalizeLiteralText(raw) {
          var s = (raw || "").replace(/ /g, " ").trim();
          if (!s) return "";
          try {
            if (/[\u00D0\u00D1]/.test(s)) s = decodeURIComponent(escape(s));
          } catch (_) {}
          return s.replace(/\s+/g, " ");
        }

        var textMap = {
          "????": "field.expiry",
          "? ???????": "button.about",
          "?????": "ui.common.total",
          "????????????": "status.planned",
          "???????????": "field.comment",
          "???? ?????": "menu.ref_payment",
          "???? ?????????": "menu.ref_products",
          "???? ????????": "field.created_at",
          "??????": "label.symbol",
          "??????????": "field.quantity",
          "????????": "label.description",
          "????? ??????": "ui.visits_search.title",
          "??????? ?????": "ui.orders.create",
          "????????? ???????": "ui.orders.save_variant",
          "??????? ???????": "ui.common.select_customer",
          "???????? ????????": "ui.operations.create.title",
          "??????? ?? ??????": "ui.stock.title",
          "????????? ???????? ?? ????????????": "ui.cash.pending.title",
          "???????? ?????? ?? ??????": "ui.cash.received.title",
          "?????? ??? ????????????? ??????": "ui.cashier_orders.title",
          "?????: ?? ????????": "ui.report.customers.title",
          "?????: ????????????? ???????": "ui.report.agents.title",
          "?????: ????????????? ???????????? (?? ???????)": "ui.report.expeditors.title",
          "?????: ????????? ???????": "ui.report.visits.title",
          "?????: ?????????? ????????": "ui.report.photos.title",
          "??????? ?????????": "ui.dashboard.title",
          "???????? ??????": "ui.currency.add",
          "???????? ?????": "ui.products.add",
          "???????? ??????????": "ui.territories.add",
          "??????? ?????? ? Excel": "ui.orders.export",
          "??????? ??????? ? Excel": "ui.order_items.export",
          "??????? ? Excel": "ui.common.export_excel",
          "Qidiruv": "label.search",
          "Excelga eksport": "ui.common.export_excel",
          "Umumiy analitika": "ui.dashboard.title",
          "Holatlar": "ui.dashboard.statuses",
          "Kategoriya": "ui.dashboard.category",
          "Qo'llash": "ui.dashboard.apply",
          "Mahsulot kategoriyalari bo'yicha": "ui.dashboard.by_category",
          "Hududlar bo'yicha": "ui.dashboard.by_territory",
          "????????? ? Excel": "ui.common.export_excel",
          "?????????": "field.storekeeper",
          "????????? ?????": "ui.orders.save_order",
          "?????????????": "field.responsible",
          "??? ??????????": "ui.common.all_staff",
          "???? ??": "field.date_from",
          "??": "field.to",
          "???? ? ?????": "field.date_time",
          "???": "field.tax_id",
          "???????": "field.active_fem",
          "ID": "label.id",
          "?????????? (login)": "field.expeditor_login",
          "??.": "field.unit",
          "?? ?????????": "label.default",
          "??? ???????? *": "field.operation_type_required",
          "?????? *": "field.status_required",
          "?? ??????": "ui.common.not_selected",
          "???? ? ????? ?????? *": "field.visit_datetime_required",
          "????? (?????????????) *": "field.agent_required",
          "??? ?????? ?? ??????????.": "ui.dashboard.no_category_data",
          "??????? ??? ????": "ui.report.photos.customers_without_photos",
          "?????????? ????": "field.contact_person",
          "?/?": "field.account_no",
          "????????? ?????????": "field.last_update",
          "???? ???????? ?": "field.delivery_date_from",
          "???? ???????? ??": "field.delivery_date_to",
          "??? ???????": "field.updated_by",
          "??? ??????": "field.payment_type",
          "???? ???????? ??????": "field.order_delivery_date",
          "?????? ????????????": "field.payment_confirmed",
          "???? ??????": "field.order_date",
          "?????????? ????????": "field.customers_count",
          "?????????? ???????": "field.orders_count"
        };
        textMap["\u0422\u0438\u043f\u044b \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0439"] = "menu.ref_operations";
        textMap["\u0412\u0430\u043b\u044e\u0442\u0430"] = "menu.ref_currency";
        textMap["\u0421\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a: \u0413\u043e\u0440\u043e\u0434\u0430"] = "menu.ref_cities";
        textMap["\u0421\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a: \u0422\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u0438"] = "menu.ref_territories";
        textMap["\u0421\u043a\u043b\u0430\u0434\u044b"] = "menu.warehouses";
        textMap["\u0422\u043e\u0432\u0430\u0440\u044b"] = "menu.products";
        textMap["\u041f\u043e\u0438\u0441\u043a \u0432\u0438\u0437\u0438\u0442\u0430"] = "ui.visits_search.title";
        textMap["\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u0432\u0438\u0437\u0438\u0442\u043e\u0432"] = "ui.visits_calendar.title";
        textMap["\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0432\u0438\u0437\u0438\u0442"] = "ui.visits_create.title";
        textMap["\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u0437\u0430\u043a\u0430\u0437"] = "ui.orders.create";
        textMap["\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043a\u0430\u0437\u044b \u0432 Excel"] = "ui.orders.export";
        textMap["\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0432\u0430\u0440\u0438\u0430\u043d\u0442"] = "ui.orders.save_variant";
        textMap["\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0437\u0430\u043a\u0430\u0437"] = "ui.orders.save_order";
        textMap["\u041f\u043e\u0437\u0438\u0446\u0438\u0438 \u0437\u0430\u043a\u0430\u0437\u043e\u0432"] = "ui.order_items.title";
        textMap["\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u043f\u043e\u0437\u0438\u0446\u0438\u0438 \u0432 Excel"] = "ui.order_items.export";
        textMap["\u041e\u0441\u0442\u0430\u0442\u043a\u0438 \u043f\u043e \u0441\u043a\u043b\u0430\u0434\u0443"] = "ui.stock.title";
        textMap["\u041e\u0442\u0447\u0451\u0442: \u041f\u043e \u043a\u043b\u0438\u0435\u043d\u0442\u0430\u043c"] = "ui.report.customers.title";
        textMap["\u041e\u0442\u0447\u0451\u0442: \u042d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u0430\u0433\u0435\u043d\u0442\u043e\u0432"] = "ui.report.agents.title";
        textMap["\u041e\u0442\u0447\u0451\u0442: \u042d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u044d\u043a\u0441\u043f\u0435\u0434\u0438\u0442\u043e\u0440\u043e\u0432 (\u043f\u043e \u0437\u0430\u043a\u0430\u0437\u0430\u043c)"] = "ui.report.expeditors.title";
        textMap["\u041e\u0442\u0447\u0451\u0442: \u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0432\u0438\u0437\u0438\u0442\u043e\u0432"] = "ui.report.visits.title";
        textMap["\u041e\u0442\u0447\u0451\u0442: \u0424\u043e\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0438 \u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432"] = "ui.report.photos.title";
        textMap["\u041a\u043b\u0438\u0435\u043d\u0442\u044b \u0431\u0435\u0437 \u0444\u043e\u0442\u043e"] = "ui.report.photos.customers_without_photos";
        textMap["\u0421\u0432\u043e\u0434\u043d\u0430\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430"] = "ui.dashboard.title";
        textMap["\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c"] = "button.show";
        textMap["\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c"] = "button.reset";
        textMap["\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c"] = "button.add";
        textMap["\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f"] = "label.actions";
        textMap["\u041a\u043e\u0434"] = "label.code";
        textMap["\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435"] = "label.name";
        textMap["\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"] = "label.description";
        textMap["\u0410\u043a\u0442\u0438\u0432\u043d\u0430"] = "field.active_fem";
        textMap["\u0421\u0442\u0440\u0430\u043d\u0430"] = "label.country";
        textMap["\u0421\u0438\u043c\u0432\u043e\u043b"] = "label.symbol";
        textMap["\u041f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e"] = "label.default";
        textMap["\u041f\u043e\u0438\u0441\u043a \u0437\u0430\u043a\u0430\u0437\u043e\u0432"] = "menu.orders";
        textMap["\u041e\u043f\u0435\u0440\u0430\u0446\u0438\u0438"] = "menu.operations";
        textMap["\u0417\u0430\u043a\u0430\u0437\u044b"] = "menu.orders";
        textMap["\u0422\u0438\u043f"] = "field.type";
        textMap["\u041a\u043b\u0438\u0435\u043d\u0442"] = "field.customer";
        textMap["\u0421\u0442\u0430\u0442\u0443\u0441"] = "label.status";
        textMap["\u0410\u0433\u0435\u043d\u0442"] = "field.agent";
        textMap["\u042d\u043a\u0441\u043f\u0435\u0434\u0438\u0442\u043e\u0440"] = "field.expeditor";
        textMap["\u0426\u0435\u043d\u0430"] = "field.price";
        textMap["\u0412\u0441\u0435"] = "ui.common.all";
        textMap["\u041f\u043e\u0438\u0441\u043a"] = "label.search";
        textMap["\u041a\u043b\u0438\u0435\u043d\u0442\u044b \u043d\u0430 \u043a\u0430\u0440\u0442\u0435"] = "ui.customers.map.title";
        textMap["\u041a\u0430\u0440\u0442\u0430:"] = "ui.customers.map.provider";
        textMap["\u042f\u043d\u0434\u0435\u043a\u0441.\u041a\u0430\u0440\u0442\u044b"] = "ui.customers.map.yandex";
        textMap["\u0418\u0414 \u043a\u043b\u0438\u0435\u043d\u0442\u0430"] = "ui.customers.col.id";
        textMap["\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u0430"] = "ui.customers.col.name";
        textMap["\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0444\u0438\u0440\u043c\u044b"] = "ui.customers.col.firm";
        textMap["\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u043a\u043b\u0438\u0435\u043d\u0442\u0430"] = "ui.customers.col.category";
        textMap["\u0410\u0434\u0440\u0435\u0441"] = "ui.customers.col.address";
        textMap["\u0422\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044f"] = "ui.customers.col.territory";
        textMap["\u041e\u0440\u0438\u0435\u043d\u0442\u0438\u0440"] = "ui.customers.col.landmark";
        textMap["\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u043d\u043e\u0435 \u043b\u0438\u0446\u043e"] = "ui.customers.col.contact";
        textMap["\u2014 \u0412\u0441\u0435 \u2014"] = "ui.common.all";
        textMap["\u2014 \u041d\u0435 \u0432\u044b\u0431\u0440\u0430\u043d\u043e \u2014"] = "ui.common.not_selected";
        textMap["\u2014 \u041d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d"] = "ui.common.unassigned";

        textMap["\u041d\u0430\u0439\u0442\u0438"] = "button.search";
        textMap["\u041e\u0442\u043c\u0435\u043d\u0430"] = "button.cancel";
        textMap["\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u0432 Excel"] = "ui.common.export_excel";
        textMap["\u0421\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0437\u0430\u043a\u0430\u0437\u0430"] = "ui.orders.create";
        textMap["\u041f\u043e\u0437\u0438\u0446\u0438\u0438 \u0437\u0430\u043a\u0430\u0437\u0430"] = "ui.order_items.title";
        textMap["\u0421\u043e\u0445\u0440\u0430\u043d\u0451\u043d\u043d\u044b\u0439 \u043f\u043e\u0438\u0441\u043a"] = "ui.orders.saved_search";
        textMap["\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u043f\u043e\u0438\u0441\u043a"] = "ui.orders.current_search";
        textMap["\u041d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d"] = "ui.common.unassigned";
        textMap["\u041f\u043e\u043a\u0430\u0437\u0430\u043d\u043e"] = "ui.common.shown";
        textMap["\u041d\u0430\u0439\u0434\u0435\u043d\u043e \u0437\u0430\u043a\u0430\u0437\u043e\u0432"] = "ui.orders.found_count";
        textMap["\u041d\u0430\u0439\u0434\u0435\u043d\u043e \u043f\u043e\u0437\u0438\u0446\u0438\u0439"] = "ui.order_items.found_count";
        textMap["\u041e\u0431\u0449\u0430\u044f \u0441\u0443\u043c\u043c\u0430"] = "ui.common.total_amount";
        textMap["\u0418\u0442\u043e\u0433\u043e \u0441\u0443\u043c\u043c\u0430"] = "ui.common.total_amount";
        textMap["\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043f\u043e\u0437\u0438\u0446\u0438\u0438"] = "ui.order_items.load";
        textMap["\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0444\u0438\u043b\u044c\u0442\u0440\u044b \u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c\u00bb."] = "ui.reports.filters_hint";
        textMap["\u041c\u0435\u043d\u044e"] = "app.menu_title";
        textMap["button.about"] = "button.about";
        textMap["button.logout"] = "button.logout";
        textMap["\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0432\u0430\u043b\u044e\u0442\u0443"] = "ui.currency.add";
        textMap["\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0433\u043e\u0440\u043e\u0434"] = "ui.cities.add";
        textMap["\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u0435\u0440\u0440\u0438\u0442\u043e\u0440\u0438\u044e"] = "ui.territories.add";
        textMap["\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440"] = "ui.products.add";
        textMap["\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043a\u043b\u0438\u0435\u043d\u0442\u0430"] = "ui.common.select_customer";
        textMap["\u041d\u0435 \u0432\u044b\u0431\u0440\u0430\u043d"] = "ui.common.not_selected";
        textMap["\u0410\u0433\u0435\u043d\u0442 (\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439)"] = "field.responsible";
        textMap["\u0417\u0430\u043f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u043d"] = "status.planned";
        textMap["\u041a\u043b\u0438\u0435\u043d\u0442 *"] = "field.customer_required";
        textMap["\u0414\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043c\u044f \u0432\u0438\u0437\u0438\u0442\u0430 *"] = "field.visit_datetime_required";
        textMap["\u0410\u0433\u0435\u043d\u0442 (\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439) *"] = "field.agent_required";
        textMap["\u0421\u0442\u0430\u0442\u0443\u0441 *"] = "field.status_required";
        textMap["\u041f\u043e \u0434\u0430\u0442\u0435"] = "field.date";


        var phMap = {
          "???????? ??? ???": "ui.visits_search.customer_name_or_tax",
          "??.??.????": "ui.placeholder.date",
          "??.??.???? ??:??": "ui.placeholder.datetime",
          "? ??????": "ui.placeholder.order_no",
          "ID ???????": "ui.customers.col.id",
          "???????? ???????": "ui.customers.col.name",
          "???????? ?????": "ui.customers.col.firm",
          "?????": "ui.customers.col.city",
          "???????": "ui.customers.col.phone",
          "???": "ui.customers.col.tax_id",
          "Category": "label.category",
          "Key contains...": "label.search",
          "Text contains...": "ui.translations.text_contains"
        };
        phMap["\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0438\u043b\u0438 \u0418\u041d\u041d"] = "ui.visits_search.customer_name_or_tax";
        phMap["\u0434\u0434.\u043c\u043c.\u0433\u0433\u0433\u0433"] = "ui.placeholder.date";
        phMap["\u0434\u0434.\u043c\u043c.\u0433\u0433\u0433\u0433 \u0447\u0447:\u043c\u043c"] = "ui.placeholder.datetime";
        phMap["\u2116 \u0437\u0430\u043a\u0430\u0437\u0430"] = "ui.placeholder.order_no";
        phMap["\u2014 \u0412\u0441\u0435 \u2014"] = "ui.common.all";
        phMap["\u2014 \u041b\u044e\u0431\u043e\u0439 \u2014"] = "ui.common.any";
        phMap["\u2014 \u0412\u0441\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438 \u2014"] = "ui.common.all_staff";
        phMap["\u2014 \u0412\u0441\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u044b \u2014"] = "ui.common.all_customers";
        phMap["\u2014 \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043b\u0438\u0435\u043d\u0442\u0430 \u2014"] = "ui.common.select_customer";
        phMap["\u2014 \u041d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u2014"] = "ui.common.unassigned";


        var nodes = root.querySelectorAll('h1,h2,h3,h4,th,label,button,a,p,span,option');
        nodes.forEach(function (el) {
          if (!el || el.id === 'userName') return;
          if (el.children && el.children.length) return;
          var rawOriginal = (el.textContent || '').trim();
          if (!rawOriginal) return;
          var raw = normalizeLiteralText(rawOriginal);
          var key = textMap[raw] || textMap[rawOriginal];
          if (!key && raw.indexOf('menu.') === 0) key = raw;
          if (!key && rawOriginal.indexOf('menu.') === 0) key = rawOriginal;
          if (key) el.textContent = uiTr(key, raw);
        });

        var placeholders = root.querySelectorAll('input[placeholder],textarea[placeholder]');
        placeholders.forEach(function (el) {
          var rawOriginal = (el.getAttribute('placeholder') || '').trim();
          if (!rawOriginal) return;
          var raw = normalizeLiteralText(rawOriginal);
          var key = phMap[raw] || phMap[rawOriginal];
          if (key) el.setAttribute('placeholder', uiTr(key, raw));
        });
      }

      function initLiteralI18nObserver() {
        var root = document.getElementById('content');
        if (!root || root.__i18nObserverAttached) return;
        root.__i18nObserverAttached = true;
        var scheduled = null;
        var obs = new MutationObserver(function () {
          if (scheduled) return;
          scheduled = setTimeout(function () {
            scheduled = null;
            applyLiteralI18n(root);
          }, 80);
        });
        obs.observe(root, { childList: true, subtree: true, characterData: true });
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
        references: [{ s: 'ref_payment', l: 'РўРёРїС‹ РѕРїР»Р°С‚' }, { s: 'ref_products', l: 'РўРёРїС‹ РїСЂРѕРґСѓРєС‚РѕРІ' }, { s: 'ref_operations', l: 'РўРёРїС‹ РѕРїРµСЂР°С†РёР№' }, { s: 'ref_currency', l: 'Р’Р°Р»СЋС‚Р°' }, { s: 'ref_cities', l: 'Р“РѕСЂРѕРґР°' }, { s: 'ref_territories', l: 'РўРµСЂСЂРёС‚РѕСЂРёРё' }, { s: 'warehouses', l: 'РЎРєР»Р°РґС‹' }, { s: 'products', l: 'РўРѕРІР°СЂС‹' }],
        customers: [{ s: 'customers', l: 'РџРѕРёСЃРє РєР»РёРµРЅС‚Р°' }, { s: 'customers_create', l: 'РЎРѕР·РґР°С‚СЊ РєР»РёРµРЅС‚Р°' }, { s: 'customers_map', l: 'РљР»РёРµРЅС‚С‹ РЅР° РєР°СЂС‚Рµ' }],
        visits: [{ s: 'visits_search', l: 'РџРѕРёСЃРє РІРёР·РёС‚Р°' }, { s: 'visits_create', l: 'РЎРѕР·РґР°С‚СЊ РІРёР·РёС‚' }, { s: 'visits_calendar', l: 'РљР°Р»РµРЅРґР°СЂСЊ РІРёР·РёС‚РѕРІ' }],
        orders: [{ s: 'orders', l: 'РџРѕРёСЃРє Р·Р°РєР°Р·РѕРІ' }, { s: 'orders_create', l: 'РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·' }, { s: 'order_items', l: 'РџРѕРёСЃРє РїРѕР·РёС†РёР№ Р·Р°РєР°Р·РѕРІ' }],
        operations: [{ s: 'operations', l: 'РџРѕРёСЃРє РѕРїРµСЂР°С†РёР№' }, { s: 'operations_create', l: 'РЎРѕР·РґР°С‚СЊ РѕРїРµСЂР°С†РёСЋ' }],
        cashier: [{ s: 'cash_pending', l: 'РћР¶РёРґР°СЋС‰РёРµ РїРµСЂРµРґР°С‡Рё РѕС‚ СЌРєСЃРїРµРґРёС‚РѕСЂРѕРІ' }, { s: 'cash_received', l: 'РџСЂРёРЅСЏС‚С‹Рµ РґРµРЅСЊРіРё Р·Р° РїРµСЂРёРѕРґ' }, { s: 'cashier_orders', l: 'Р—Р°РєР°Р·С‹ РґР»СЏ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РѕРїР»Р°С‚С‹' }],
        reports: [{ s: 'report_customers', l: 'РџРѕ РєР»РёРµРЅС‚Р°Рј' }, { s: 'report_agents', l: 'РџРѕ Р°РіРµРЅС‚Р°Рј' }, { s: 'report_expeditors', l: 'РџРѕ СЌРєСЃРїРµРґРёС‚РѕСЂР°Рј' }, { s: 'report_visits', l: 'РџРѕ РІРёР·РёС‚Р°Рј' }, { s: 'report_dashboard', l: 'РЎРІРѕРґРЅР°СЏ Р°РЅР°Р»РёС‚РёРєР°' }, { s: 'report_photos', l: 'Р¤РѕС‚РѕРіСЂР°С„РёРё РєР»РёРµРЅС‚РѕРІ' }]
      };
      var SIDEBAR_SECTIONS = { users: 'users', references: 'ref_parent', ref_translations: 'ref_translations', customers: 'customers_parent', visits: 'visits_parent', orders: 'orders_parent', operations: 'ops_parent', balances: 'stock', cashier: 'cash_parent', reports: 'reports_parent' };
      if (SIDEBAR_CHILDREN.references && !SIDEBAR_CHILDREN.references.some(function (c) { return c.s === 'ref_translations'; })) {
        SIDEBAR_CHILDREN.references.push({ s: 'ref_translations', l: 'РџРµСЂРµРІРѕРґС‹' });
      }
      var PARENT_IDS = { references: ['refParent', 'refSubmenu'], customers: ['customersParent', 'customersSubmenu'], visits: ['visitsParent', 'visitsSubmenu'], orders: ['ordersParent', 'ordersSubmenu'], operations: ['opsParent', 'opsSubmenu'], cashier: ['cashParent', 'cashSubmenu'], reports: ['reportsParent', 'reportsSubmenu'] };

      function renderSidebar(items) {
        var el = document.getElementById('sidebarMenu');
        if (!el) return;
        menuByCode = {};
        (items || []).forEach(function (m) {
          var normalizedCode = String((m && m.code) || '').replace(/^menu\./, '');
          if (!normalizedCode) return;
          menuByCode[normalizedCode] = m.access_level || 'view';
        });
        menuItems = items || [];

        // РџСЂРѕРїСѓСЃРєР°РµРј С‚РѕР»СЊРєРѕ РїРѕРґРїСѓРЅРєС‚С‹ СЃРїСЂР°РІРѕС‡РЅРёРєРѕРІ (ref_payment, ref_products Рё С‚.Рґ.)
        // РєРѕС‚РѕСЂС‹Рµ РІРѕР·РІСЂР°С‰РµРЅС‹ API РєР°Рє РѕС‚РґРµР»СЊРЅС‹Рµ Р·Р°РїРёСЃРё
        var skipCodes = {};
        if (SIDEBAR_CHILDREN['references']) {
          SIDEBAR_CHILDREN['references'].forEach(function (child) {
            // РџСЂРѕРїСѓСЃРєР°РµРј С‚РѕР»СЊРєРѕ РµСЃР»Рё СЌС‚РѕС‚ РїРѕРґРїСѓРЅРєС‚ СЃРїСЂР°РІРѕС‡РЅРёРєР° РµСЃС‚СЊ РІ API
            if (menuByCode[child.s] && child.s !== 'references') {
              skipCodes[child.s] = true;
            }
          });
        }

        var html = '';
        (items || []).forEach(function (m) {
          var rawCode = String((m && m.code) || '');
          var code = rawCode.replace(/^menu\./, '');
          if (!code) return;

          // РџСЂРѕРїСѓСЃРєР°РµРј РўРћР›Р¬РљРћ РїРѕРґРїСѓРЅРєС‚С‹ СЃРїСЂР°РІРѕС‡РЅРёРєРѕРІ
          if (skipCodes[code]) return;

          var section = SIDEBAR_SECTIONS[code] || code;
          var label = uiTr('menu.' + code, m.label || rawCode || code);
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
          if (el) el.textContent = (currentUser.fio || currentUser.login || 'вЂ”') + ' (' + (currentUser.role || 'вЂ”') + ')';
        }).catch(function () {
          localStorage.removeItem('sds_token');
          window.location.href = '/login';
        });
      };

      var loadMenu = function () {
        return api('/api/v1/menu').then(function (data) {
          var list = (data && data.menu) ? data.menu : [];
          var dynamicMenuKeys = [];
          (list || []).forEach(function (m) {
            var normalizedCode = String((m && m.code) || '').replace(/^menu\./, '');
            if (normalizedCode) dynamicMenuKeys.push('menu.' + normalizedCode);
          });
          Object.keys(SIDEBAR_CHILDREN || {}).forEach(function (parentCode) {
            dynamicMenuKeys.push('menu.' + parentCode);
            (SIDEBAR_CHILDREN[parentCode] || []).forEach(function (child) {
              var normalizedChild = String((child && child.s) || '').replace(/^menu\./, '');
              if (normalizedChild) dynamicMenuKeys.push('menu.' + normalizedChild);
            });
          });
          dynamicMenuKeys = Array.from(new Set(dynamicMenuKeys));
          if (!dynamicMenuKeys.length) {
            renderSidebar(list);
            return list;
          }
          return api('/api/v1/translations/resolve', {
            method: 'POST',
            body: JSON.stringify({ keys: dynamicMenuKeys, language: currentLanguage })
          }).then(function (res) {
            var resolved = (res && res.data) ? res.data : {};
            window._uiTranslations = Object.assign({}, window._uiTranslations || {}, resolved);
            renderSidebar(list);
            return list;
          }).catch(function () {
            renderSidebar(list);
            return list;
          });
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
          ? '<div class="modal-actions" style="justify-content:center"><button type="button" class="btn btn-primary" id="' + id + '_back">РќР°Р·Р°Рґ</button></div>'
          : '<div class="modal-actions"><button type="button" class="btn btn-primary" id="' + id + '_save">РЎРѕС…СЂР°РЅРёС‚СЊ</button><button type="button" class="btn btn-secondary" id="' + id + '_cancel">РћС‚РјРµРЅР°</button></div>';
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
                errEl.textContent = 'РћС€РёР±РєР° СЃРѕРµРґРёРЅРµРЅРёСЏ РёР»Рё СЃРµСЂРІРµСЂР°.' + statusMsg;
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
        var map = { planned: 'Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ', completed: 'Р—Р°РІРµСЂС€С‘РЅ', cancelled: 'РћС‚РјРµРЅС‘РЅ', postponed: 'РќР° СЂР°СЃСЃРјРѕС‚СЂРµРЅРёРё' };
        return (map[code] || code || '');
      }

      var showSection = function (name) {
        currentSectionName = name;
        var code = sectionToCode(name);
        console.log('showSection: name=' + name + ', code=' + code + ', menuByCode[code]=' + menuByCode[code]);
        if (!menuByCode[code] || menuByCode[code] === 'none') {
          console.error('Access denied for section: ' + name + ', code: ' + code);
          var content = document.getElementById('content');
          if (content) content.innerHTML = '<div class="card"><h2>Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰С‘РЅ</h2><p>Access Denied. РЈ РІР°СЃ РЅРµС‚ РїСЂР°РІ РЅР° СЌС‚РѕС‚ СЂР°Р·РґРµР».</p><p><button type="button" class="btn btn-primary" id="accessDeniedBack">РќР° РіР»Р°РІРЅСѓСЋ</button></p></div>';
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
        // Р”Р»СЏ РїСѓРЅРєС‚Р° РјРµРЅСЋ "РЎРѕР·РґР°С‚СЊ РєР»РёРµРЅС‚Р°" вЂ” С„РѕСЂРјР° СЃСЂР°Р·Сѓ РЅР° СЃС‚СЂР°РЅРёС†Рµ (Р±РµР· РјРѕРґР°Р»РєРё)
        if (name === 'customers_create') {
          loadCitiesAndTerritories().then(function () {
            return api('/api/v1/dictionary/user-logins').catch(function () { return []; });
          }).then(function (userList) {
            userList = userList || [];
            var content = document.getElementById('content');
            if (!content) return;
            var formHtml = custEditFormHtml({ status: 'РђРєС‚РёРІРЅС‹Р№' }, userList);
            content.innerHTML = '<div class="card"><h2>РЎРѕР·РґР°С‚СЊ РєР»РёРµРЅС‚Р°</h2><div id="custCreateErr" class="err" style="margin-bottom:12px"></div><div id="custCreateForm">' + formHtml + '</div><div class="modal-actions" style="margin-top:20px"><button type="button" class="btn btn-primary" id="custCreateSave">РЎРѕС…СЂР°РЅРёС‚СЊ</button><button type="button" class="btn btn-secondary" id="custCreateCancel">РћС‚РјРµРЅР°</button></div></div>';
            document.getElementById('custCreateCancel').onclick = function () { showSection('customers'); };
            document.getElementById('custCreateSave').onclick = function () {
              var errEl = document.getElementById('custCreateErr');
              if (errEl) errEl.textContent = '';
              api('/api/v1/customers', { method: 'POST', body: JSON.stringify(custFormBody()) }).then(function () { showSection('customers'); }).catch(function (e) {
                if (!errEl) return;
                var d = e && e.data && e.data.detail;
                errEl.textContent = (typeof d === 'string' ? d : (d ? JSON.stringify(d) : 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ'));
              });
            };
          });
          return;
        }
        if (name === 'customers_map') {
          loadSectionCustomersMap();
          return;
        }
        // Р”Р»СЏ РїСѓРЅРєС‚Р° РјРµРЅСЋ "РЎРѕР·РґР°С‚СЊ РѕРїРµСЂР°С†РёСЋ" вЂ” Р·Р°РіСЂСѓР¶Р°РµРј СЂР°Р·РґРµР» Рё СЃСЂР°Р·Сѓ РѕС‚РєСЂС‹РІР°РµРј С„РѕСЂРјСѓ СЃРѕР·РґР°РЅРёСЏ
        if (name === 'operations_create') {
          loadSectionOperations(false, true);
          return;
        }
        // Р”Р»СЏ РїСѓРЅРєС‚Р° РјРµРЅСЋ "РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·" РѕС‚РєСЂС‹РІР°РµРј С„РѕСЂРјСѓ СЃРѕР·РґР°РЅРёСЏ Р·Р°РєР°Р·Р°
        if (name === 'orders_create') {
          // РСЃРїРѕР»СЊР·СѓРµРј СЃСѓС‰РµСЃС‚РІСѓСЋС‰СѓСЋ РєРЅРѕРїРєСѓ "РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·" РёР· СЂР°Р·РґРµР»Р° Р·Р°РєР°Р·РѕРІ
          loadSectionOrders();
          setTimeout(function () {
            var btn = document.getElementById('orderAdd');
            if (btn) btn.click();
          }, 0);
          return;
        }
        content.innerHTML = '<div class="card"><p>Р—Р°РіСЂСѓР·РєР° СЂР°Р·РґРµР»Р°...</p></div>';
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
              showModal(tUi('add_user_modal', 'Add user'), '<div class="form-group"><label>' + tUi('login', 'Login') + '</label><input type="text" id="mu_login" required placeholder="Latin letters or numbers"></div><div class="form-group"><label>' + tUi('fio', 'Full Name') + '</label><input type="text" id="mu_fio" required placeholder="Name"></div><div class="form-group"><label>' + tUi('password', 'Password') + '</label><input type="password" id="mu_password" required></div><div class="form-group"><label>' + tUi('role', 'Role') + '</label><select id="mu_role"><option value="agent">agent</option><option value="admin">admin</option><option value="expeditor">expeditor</option><option value="stockman">stockman</option><option value="paymaster">paymaster</option></select></div><div class="form-group"><label>РўРµР»РµС„РѕРЅ</label><input type="text" id="mu_phone" placeholder="+998901234567"></div><div class="form-group"><label>Email</label><input type="email" id="mu_email" placeholder="user@example.com"></div>', function (errEl) {
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
              showModal(tUi('edit_user_modal', 'Edit user') + ': ' + login, '<div class="form-group"><label>' + tUi('fio', 'Full Name') + '</label><input type="text" id="eu_fio" value="' + esc(fio) + '"></div><div class="form-group"><label>' + tUi('role', 'Role') + '</label><select id="eu_role">' + roleOpts + '</select></div><div class="form-group"><label>' + tUi('status', 'Status') + '</label><input type="text" id="eu_status" value="' + esc(status) + '" placeholder="active"></div><div class="form-group"><label>РўРµР»РµС„РѕРЅ</label><input type="text" id="eu_phone" value="' + esc(phone) + '"></div><div class="form-group"><label>Email</label><input type="email" id="eu_email" value="' + esc(email) + '"></div>', function (errEl) {
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
          if (document.getElementById('sectionErr')) document.getElementById('sectionErr').textContent = (e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : 'РћС€РёР±РєР°') : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё';
        });
      }

      function loadSectionRoleMenuAccess() {
        var content = document.getElementById('content');
        if (!content) return;
        var roles = [{ v: 'admin', l: 'admin' }, { v: 'agent', l: 'agent' }, { v: 'expeditor', l: 'expeditor' }, { v: 'stockman', l: 'stockman' }, { v: 'paymaster', l: 'paymaster' }];
        var roleOpts = roles.map(function (r) { return '<option value="' + r.v + '">' + r.l + '</option>'; }).join('');
        content.innerHTML = '<div class="card"><h2>РџСЂР°РІР° РґРѕСЃС‚СѓРїР° Рє РјРµРЅСЋ</h2><p style="margin:0 0 12px 0"><label>Р РѕР»СЊ: </label><select id="rma_role" style="margin-right:12px">' + roleOpts + '</select><button type="button" class="btn btn-primary" id="rma_save">РЎРѕС…СЂР°РЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary" id="rma_back">РќР°Р·Р°Рґ Рє РїРѕР»СЊР·РѕРІР°С‚РµР»СЏРј</button></p><div id="rma_err" class="err" style="margin-top:8px"></div><div id="rma_table_wrap" style="margin-top:16px"><p>Р—Р°РіСЂСѓР·РєР°...</p></div></div>';
        document.getElementById('rma_back').onclick = function () { loadSectionUsers(); };
        var roleSel = document.getElementById('rma_role');
        var errEl = document.getElementById('rma_err');
        function loadMatrix() {
          var role = roleSel.value;
          errEl.textContent = '';
          document.getElementById('rma_table_wrap').innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
          api('/api/v1/admin/roles/' + encodeURIComponent(role) + '/menu-access').then(function (data) {
            var rows = (data && data.menu_access) ? data.menu_access : [];
            var tb = '<div style="overflow-x:auto"><table><thead><tr><th>РџСѓРЅРєС‚ РјРµРЅСЋ</th><th>Р”РѕСЃС‚СѓРї</th></tr></thead><tbody>';
            rows.forEach(function (row) {
              var name = 'rma_' + row.menu_item_id;
              var none = row.access_level === 'none' ? ' checked' : '';
              var view = row.access_level === 'view' ? ' checked' : '';
              var full = row.access_level === 'full' ? ' checked' : '';
              tb += '<tr><td>' + escAttr(row.menu_label || row.menu_code || '') + '</td><td><label style="margin-right:12px"><input type="radio" name="' + name + '" value="none" data-mid="' + row.menu_item_id + '"' + none + '> РЎРєСЂС‹С‚Рѕ</label><label style="margin-right:12px"><input type="radio" name="' + name + '" value="view" data-mid="' + row.menu_item_id + '"' + view + '> РџСЂРѕСЃРјРѕС‚СЂ</label><label><input type="radio" name="' + name + '" value="full" data-mid="' + row.menu_item_id + '"' + full + '> РџРѕР»РЅС‹Р№</label></td></tr>';
            });
            tb += '</tbody></table></div>';
            document.getElementById('rma_table_wrap').innerHTML = rows.length ? tb : '<p>РќРµС‚ РїСѓРЅРєС‚РѕРІ РјРµРЅСЋ.</p>';
          }).catch(function (e) {
            errEl.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : 'РћС€РёР±РєР°') : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё';
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
          if (!menu_access.length) { errEl.textContent = 'РќРµС‚ РґР°РЅРЅС‹С… РґР»СЏ СЃРѕС…СЂР°РЅРµРЅРёСЏ.'; return; }
          errEl.textContent = '';
          api('/api/v1/admin/roles/' + encodeURIComponent(role) + '/menu-access', { method: 'POST', body: JSON.stringify({ menu_access: menu_access }) }).then(function () {
            errEl.textContent = '';
            errEl.style.color = '#0a0';
            errEl.textContent = 'РџСЂР°РІР° РѕР±РЅРѕРІР»РµРЅС‹. РџРѕР»СЊР·РѕРІР°С‚РµР»Рё СѓРІРёРґСЏС‚ РёР·РјРµРЅРµРЅРёСЏ РїРѕСЃР»Рµ РїРµСЂРµР·Р°РіСЂСѓР·РєРё СЃС‚СЂР°РЅРёС†С‹.';
            setTimeout(function () { errEl.textContent = ''; errEl.style.color = ''; }, 3000);
          }).catch(function (e) {
            errEl.style.color = '';
            errEl.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : 'РћС€РёР±РєР°') : 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
          });
        };
        loadMatrix();
      }

      function productTypeSelectHtml(typeList, selected) {
        selected = selected || '';
        var opts = '<option value="">вЂ”</option>';
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
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="prodAdd">Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ</button>' : '';
          content.innerHTML = '<div class="card"><h2>РўРѕРІР°СЂС‹</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ С‚РѕРІР°СЂРѕРІ.</p>'; bindProdAdd(typeList); return; }
          var sortCol = 'code';
          var sortDir = 1;
          function renderProdTable(data) {
            var sorted = data.slice().sort(function (a, b) {
              return tableSortCompare(a, b, sortCol, sortDir, function (r, c) {
                if (c === 'weight_g' || c === 'price' || c === 'expiry_days') return (r[c] != null && r[c] !== '' ? String(Number(r[c])).padStart(15, '0') : '');
                return (r[c] || '').toString().toLowerCase();
              });
            });
            var t = '<table><thead><tr>' + sortableTh('code', 'РљРѕРґ', sortCol, sortDir) + sortableTh('name', 'РќР°Р·РІР°РЅРёРµ', sortCol, sortDir) + sortableTh('type_id', 'РўРёРї', sortCol, sortDir) + sortableTh('weight_g', 'Р’РµСЃ', sortCol, sortDir) + sortableTh('unit', 'Р•Рґ.', sortCol, sortDir) + sortableTh('price', 'Р¦РµРЅР°', sortCol, sortDir) + sortableTh('currency_code', 'Р’Р°Р»СЋС‚Р°', sortCol, sortDir) + sortableTh('expiry_days', 'РЎСЂРѕРє', sortCol, sortDir) + '<th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
            sorted.forEach(function (p) {
            var code = escAttr(p.code), name = escAttr(p.name), typeId = escAttr(p.type_id), unit = escAttr(p.unit);
            var curr = (p.currency_code || 'sum');
            t += '<tr><td>' + (p.code || '') + '</td><td>' + (p.name || '') + '</td><td>' + (p.type_id || '') + '</td><td>' + (p.weight_g != null ? p.weight_g : '') + '</td><td>' + (p.unit || '') + '</td><td>' + (p.price != null ? p.price : '') + '</td><td>' + escAttr(curr) + '</td><td>' + (p.expiry_days != null ? p.expiry_days : '') + '</td><td>';
            if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-prod-edit data-code="' + code + '" data-name="' + name + '" data-type="' + typeId + '" data-weight="' + (p.weight_g != null ? p.weight_g : '') + '" data-unit="' + unit + '" data-price="' + (p.price != null ? p.price : '') + '" data-expiry="' + (p.expiry_days != null ? p.expiry_days : '') + '" data-currency="' + escAttr(curr) + '">РР·РјРµРЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary btn-small" data-prod-del data-code="' + code + '">РЈРґР°Р»РёС‚СЊ</button>';
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
              var currOpts = '<option value>вЂ”</option>';
              (currencyList || []).forEach(function (c) {
                var codeCur = escAttr(c.code);
                var label = c.code + (c.symbol ? ' (' + c.symbol + ')' : '') + (c.name ? ' вЂ” ' + c.name : '');
                currOpts += '<option value="' + codeCur + '"' + (c.code === currSelected ? ' selected' : '') + '>' + escAttr(label) + '</option>';
              });
              if (!currencyList.length) {
                currOpts += '<option value="sum"' + (currSelected === 'sum' ? ' selected' : '') + '>sum вЂ” СЃСѓРј</option>';
              }
              var bodyHtml = '<div class="form-group"><label>РљРѕРґ (РЅРµ РёР·РјРµРЅСЏРµС‚СЃСЏ)</label><input type="text" id="prod_code" value="' + escAttr(code) + '" readonly></div><div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="prod_name" value="' + (unesc(el.getAttribute('data-name')) || '').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '"></div><div class="form-group"><label>РўРёРї</label><select id="prod_type">' + typeOpts + '</select></div><div class="form-group"><label>Р’РµСЃ (Рі)</label><input type="number" id="prod_weight" value="' + (el.getAttribute('data-weight') || '') + '"></div><div class="form-group"><label>Р•Рґ.</label><input type="text" id="prod_unit" value="' + (unesc(el.getAttribute('data-unit')) || '').replace(/"/g, '&quot;') + '" placeholder="РЁРў"></div><div class="form-group"><label>Р¦РµРЅР°</label><input type="number" step="0.01" id="prod_price" value="' + (el.getAttribute('data-price') || '') + '"></div><div class="form-group"><label>Р’Р°Р»СЋС‚Р°</label><select id="prod_currency">' + currOpts + '</select></div><div class="form-group"><label>РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё (РґРЅРµР№)</label><input type="number" id="prod_expiry" value="' + (el.getAttribute('data-expiry') || '') + '"></div>';
              showModal('РР·РјРµРЅРёС‚СЊ С‚РѕРІР°СЂ', bodyHtml, function (errEl) {
                return api('/api/v1/dictionary/products/' + encodeURIComponent(code), { method: 'PUT', body: JSON.stringify({ name: document.getElementById('prod_name').value.trim(), type_id: document.getElementById('prod_type').value || null, weight_g: document.getElementById('prod_weight').value ? parseInt(document.getElementById('prod_weight').value, 10) : null, unit: document.getElementById('prod_unit').value.trim() || null, price: document.getElementById('prod_price').value ? parseFloat(document.getElementById('prod_price').value) : null, expiry_days: document.getElementById('prod_expiry').value ? parseInt(document.getElementById('prod_expiry').value, 10) : null, currency_code: document.getElementById('prod_currency').value || null }) }).then(function () { loadSectionProducts(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-prod-del]').forEach(function (el) {
            el.onclick = function () {
              var code = (el.getAttribute('data-code') || '').replace(/&quot;/g, '"');
              if (!confirm('РЈРґР°Р»РёС‚СЊ (РґРµР°РєС‚РёРІРёСЂРѕРІР°С‚СЊ) С‚РѕРІР°СЂ В«' + code + 'В»?')) return;
              api('/api/v1/dictionary/products/' + encodeURIComponent(code), { method: 'DELETE' }).then(function () { loadSectionProducts(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР°'); });
            };
          });
          }
          renderProdTable(list);
        }).catch(function (e) {
          document.getElementById('content').innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С‚РѕРІР°СЂРѕРІ.</p></div>';
        });
        function bindProdAdd(typeList, currencyList) {
          var btn = document.getElementById('prodAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            var typeOpts = productTypeSelectHtml(typeList, '');
            var currOpts = '<option value="sum">sum вЂ” СЃСѓРј (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ)</option>';
            (currencyList || []).forEach(function (c) {
              if (c.code === 'sum') return;
              var label = c.code + (c.symbol ? ' (' + c.symbol + ')' : '') + (c.name ? ' вЂ” ' + c.name : '');
              currOpts += '<option value="' + escAttr(c.code) + '">' + escAttr(label) + '</option>';
            });
            var bodyHtml = '<div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="prod_name" placeholder="РќР°Р·РІР°РЅРёРµ"></div><div class="form-group"><label>РўРёРї</label><select id="prod_type">' + typeOpts + '</select></div><div class="form-group"><label>Р’РµСЃ (Рі)</label><input type="number" id="prod_weight" placeholder="0"></div><div class="form-group"><label>Р•Рґ.</label><input type="text" id="prod_unit" value="РЁРў" placeholder="РЁРў"></div><div class="form-group"><label>Р¦РµРЅР°</label><input type="number" step="0.01" id="prod_price" placeholder="0"></div><div class="form-group"><label>Р’Р°Р»СЋС‚Р°</label><select id="prod_currency">' + currOpts + '</select></div><div class="form-group"><label>РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё (РґРЅРµР№)</label><input type="number" id="prod_expiry" placeholder="0"></div>';
            showModal('Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ', bodyHtml, function (errEl) {
              var name = document.getElementById('prod_name').value.trim();
              if (!name) return Promise.reject({ data: { detail: 'РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ.' } });
              var currency = document.getElementById('prod_currency').value || 'sum';
              return api('/api/v1/dictionary/products', { method: 'POST', body: JSON.stringify({ name: name, type_id: document.getElementById('prod_type').value || null, weight_g: document.getElementById('prod_weight').value ? parseInt(document.getElementById('prod_weight').value, 10) : null, unit: document.getElementById('prod_unit').value.trim() || 'РЁРў', price: document.getElementById('prod_price').value ? parseFloat(document.getElementById('prod_price').value) : null, expiry_days: document.getElementById('prod_expiry').value ? parseInt(document.getElementById('prod_expiry').value, 10) : null, currency_code: currency }) }).then(function () { loadSectionProducts(); });
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
        var arrow = sortCol === col ? (sortDir > 0 ? ' в–І' : ' в–ј') : '';
        return '<th class="sortable" data-col="' + escAttr(col) + '" style="cursor:pointer">' + escAttr(label) + arrow + '</th>';
      }
      function formatStatusBadge(statusCode, statusName) {
        var code = (statusCode || '').toLowerCase().trim();
        var fallbackByCode = {
          pending: 'Р’ РѕР¶РёРґР°РЅРёРё',
          completed: 'Р’С‹РїРѕР»РЅРµРЅРѕ',
          cancelled: 'РћС‚РјРµРЅРµРЅРѕ',
          canceled: 'РћС‚РјРµРЅРµРЅРѕ',
          open: 'РћС‚РєСЂС‹С‚',
          delivery: 'Р”РѕСЃС‚Р°РІРєР°',
          delivered: 'Р”РѕСЃС‚Р°РІР»РµРЅ'
        };
        // Prefer canonical label by code to avoid broken DB labels.
        var text = fallbackByCode[code] || statusName || statusCode || '';
        var cls = 'status-badge--default';
        if (code === 'completed' || code === 'delivered' || code === 'РґРѕСЃС‚Р°РІР»РµРЅ') cls = 'status-badge--completed';
        else if (code === 'delivery' || code === 'РґРѕСЃС‚Р°РІРєР°') cls = 'status-badge--delivery';
        else if (code === 'open' || code === 'СЃРѕР·РґР°РЅ' || code === 'РЅРѕРІС‹Р№') cls = 'status-badge--open';
        else if (code === 'cancelled' || code === 'canceled' || code === 'РѕС‚РјРµРЅРµРЅ') cls = 'status-badge--cancelled';
        else if (code === 'pending') cls = 'status-badge--pending';
        return '<span class="status-badge ' + cls + '">' + escAttr(text) + '</span>';
      }
      function loadSectionRefPayment() {
        api('/api/v1/dictionary/payment-types').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="refAdd">Р”РѕР±Р°РІРёС‚СЊ</button>' : '';
          var html = '<div class="card"><h2>РўРёРїС‹ РѕРїР»Р°С‚</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С….</p>'; bindRefPaymentAdd(); return; }
          var sortCol = 'code';
          var sortDir = 1;
          function renderTable(data) {
            var sorted = data.slice().sort(function (a, b) {
              return tableSortCompare(a, b, sortCol, sortDir, function (r, c) {
                if (c === 'active') return (r.active === true ? '1' : '0');
                return (r[c] || '').toString().toLowerCase();
              });
            });
            var t = '<table><thead><tr>' + sortableTh('code', 'РљРѕРґ', sortCol, sortDir) + sortableTh('name', 'РќР°Р·РІР°РЅРёРµ', sortCol, sortDir) + sortableTh('description', 'РћРїРёСЃР°РЅРёРµ', sortCol, sortDir) + sortableTh('active', 'РђРєС‚РёРІРЅР°', sortCol, sortDir) + '<th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
            sorted.forEach(function (r) {
              var c = escAttr(r.code), n = escAttr(r.name), d = escAttr(r.description);
              var act = (r.active === false ? 'РќРµС‚' : 'Р”Р°');
              t += '<tr><td>' + (r.code || '') + '</td><td>' + (r.name || '') + '</td><td>' + (r.description || '') + '</td><td>' + act + '</td><td>';
              if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-code="' + c + '" data-name="' + n + '" data-desc="' + d + '" data-active="' + (r.active === false ? 'false' : 'true') + '">РР·РјРµРЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary btn-small" data-del data-code="' + c + '">РЈРґР°Р»РёС‚СЊ</button>';
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
              showModal('РР·РјРµРЅРёС‚СЊ С‚РёРї РѕРїР»Р°С‚С‹', '<div class="form-group"><label>РљРѕРґ (РЅРµ РёР·РјРµРЅСЏРµС‚СЃСЏ)</label><input type="text" id="re_code" value="' + el.getAttribute('data-code') + '" readonly></div><div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="re_name" value="' + (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') + '"></div><div class="form-group"><label>РћРїРёСЃР°РЅРёРµ</label><input type="text" id="re_desc" value="' + (el.getAttribute('data-desc') || '').replace(/&quot;/g, '"') + '"></div>', function (errEl) {
                return api('/api/v1/dictionary/payment-types/' + encodeURIComponent(el.getAttribute('data-code')), { method: 'PUT', body: JSON.stringify({ name: document.getElementById('re_name').value.trim(), description: document.getElementById('re_desc').value.trim() || null }) }).then(function () { loadSectionRefPayment(); });
              });
            };
          });
            tableDiv.querySelectorAll('[data-del]').forEach(function (el) {
              el.onclick = function () { if (!confirm('РЈРґР°Р»РёС‚СЊ С‚РёРї РѕРїР»Р°С‚С‹ В«' + el.getAttribute('data-code') + 'В»?')) return; api('/api/v1/dictionary/payment-types/' + encodeURIComponent(el.getAttribute('data-code')), { method: 'DELETE' }).then(function () { loadSectionRefPayment(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР°'); }); };
            });
          }
          renderTable(list);
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С‚РёРїРѕРІ РѕРїР»Р°С‚.</p></div>'; });
        function bindRefPaymentAdd() {
          var btn = document.getElementById('refAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('Р”РѕР±Р°РІРёС‚СЊ С‚РёРї РѕРїР»Р°С‚С‹', '<div class="form-group"><label>РљРѕРґ</label><input type="text" id="re_code" placeholder="РЅР°РїСЂРёРјРµСЂ card_sum"></div><div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="re_name" placeholder="РќР°Р·РІР°РЅРёРµ"></div><div class="form-group"><label>РћРїРёСЃР°РЅРёРµ</label><input type="text" id="re_desc" placeholder="РћРїРёСЃР°РЅРёРµ"></div>', function (errEl) {
              return api('/api/v1/dictionary/payment-types', { method: 'POST', body: JSON.stringify({ code: document.getElementById('re_code').value.trim(), name: document.getElementById('re_name').value.trim(), description: document.getElementById('re_desc').value.trim() || null }) }).then(function () { loadSectionRefPayment(); });
            });
          };
        }
      }

      function loadSectionRefCurrency() {
        api('/api/v1/dictionary/currencies').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="curAdd">Р”РѕР±Р°РІРёС‚СЊ РІР°Р»СЋС‚Сѓ</button>' : '';
          var html = '<div class="card"><h2>Р’Р°Р»СЋС‚Р°</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ РІР°Р»СЋС‚.</p>'; }
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
              var t = '<table><thead><tr>' + sortableTh('code', 'РљРѕРґ', sortCol, sortDir) + sortableTh('name', 'РќР°Р·РІР°РЅРёРµ', sortCol, sortDir) + sortableTh('country', 'РЎС‚СЂР°РЅР°', sortCol, sortDir) + sortableTh('symbol', 'РЎРёРјРІРѕР»', sortCol, sortDir) + sortableTh('is_default', 'РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ', sortCol, sortDir) + '<th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
              sorted.forEach(function (c) {
                t += '<tr><td>' + escAttr(c.code || '') + '</td><td>' + escAttr(c.name || '') + '</td><td>' + escAttr(c.country || '') + '</td><td>' + escAttr(c.symbol || '') + '</td><td>' + (c.is_default ? 'Р”Р°' : '') + '</td><td>';
                if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-cur-edit data-code="' + escAttr(c.code || '') + '">РР·РјРµРЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary btn-small" data-cur-del data-code="' + escAttr(c.code || '') + '">РЈРґР°Р»РёС‚СЊ</button>';
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
              var bodyHtml = '<div class="form-group"><label>РљРѕРґ</label><input type="text" id="cur_code" placeholder="sum"></div><div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="cur_name" placeholder="СЃСѓРј"></div><div class="form-group"><label>РЎС‚СЂР°РЅР°</label><input type="text" id="cur_country" placeholder="РЈР·Р±РµРєРёСЃС‚Р°РЅ"></div><div class="form-group"><label>РЎРёРјРІРѕР»</label><input type="text" id="cur_symbol" placeholder="СЃСѓРј"></div><div class="form-group"><label><input type="checkbox" id="cur_default"> Р’Р°Р»СЋС‚Р° РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ</label></div>';
              showModal('Р”РѕР±Р°РІРёС‚СЊ РІР°Р»СЋС‚Сѓ', bodyHtml, function (errEl) {
                var code = document.getElementById('cur_code').value.trim();
                var name = document.getElementById('cur_name').value.trim();
                if (!code || !name) { if (errEl) errEl.textContent = 'РљРѕРґ Рё РЅР°Р·РІР°РЅРёРµ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹.'; return; }
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
                  var isDefault = row ? (row.children[4].textContent.trim() === 'Р”Р°') : false;
                  var bodyHtml = '<div class="form-group"><label>РљРѕРґ (РЅРµР»СЊР·СЏ РёР·РјРµРЅРёС‚СЊ)</label><input type="text" id="cur_code" value="' + escAttr(code) + '" readonly></div><div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="cur_name" value="' + escAttr(name) + '"></div><div class="form-group"><label>РЎС‚СЂР°РЅР°</label><input type="text" id="cur_country" value="' + escAttr(country) + '"></div><div class="form-group"><label>РЎРёРјРІРѕР»</label><input type="text" id="cur_symbol" value="' + escAttr(symbol) + '"></div><div class="form-group"><label><input type="checkbox" id="cur_default"' + (isDefault ? ' checked' : '') + '> Р’Р°Р»СЋС‚Р° РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ</label></div>';
                  showModal('РР·РјРµРЅРёС‚СЊ РІР°Р»СЋС‚Сѓ', bodyHtml, function (errEl) {
                    var nameNew = document.getElementById('cur_name').value.trim();
                    if (!nameNew) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ.'; return; }
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
                  if (!confirm('РЈРґР°Р»РёС‚СЊ РІР°Р»СЋС‚Сѓ В«' + code + 'В»?')) return;
                  api('/api/v1/dictionary/currencies/' + encodeURIComponent(code), { method: 'DELETE' }).then(function () { loadSectionRefCurrency(); }).catch(function (e) {
                    alert((e && e.data && e.data.detail) ? e.data.detail : 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РІР°Р»СЋС‚С‹');
                  });
                };
              });
            }
          }
        }).catch(function (e) {
          var content = document.getElementById('content');
          if (content) content.innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РІР°Р»СЋС‚.</p></div>';
        });
      }
      function loadSectionRefProducts() {
        api('/api/v1/dictionary/products/types').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="refAdd">Р”РѕР±Р°РІРёС‚СЊ</button>' : '';
          var html = '<div class="card"><h2>РўРёРїС‹ РїСЂРѕРґСѓРєС‚РѕРІ</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С….</p>'; bindRefProductsAdd(); return; }
          var sortCol = 'name';
          var sortDir = 1;
          function renderTable(data) {
            var sorted = data.slice().sort(function (a, b) { return tableSortCompare(a, b, sortCol, sortDir); });
            var t = '<table><thead><tr>' + sortableTh('name', 'РќР°Р·РІР°РЅРёРµ', sortCol, sortDir) + sortableTh('description', 'РћРїРёСЃР°РЅРёРµ', sortCol, sortDir) + '<th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
            sorted.forEach(function (r) {
              var n = escAttr(r.name), d = escAttr(r.description);
              t += '<tr><td>' + (r.name || '') + '</td><td>' + (r.description || '') + '</td><td>';
              if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-name="' + n + '" data-desc="' + d + '">РР·РјРµРЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary btn-small" data-del data-name="' + n + '">РЈРґР°Р»РёС‚СЊ</button>';
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
                showModal('РР·РјРµРЅРёС‚СЊ С‚РёРї РїСЂРѕРґСѓРєС‚Р°', '<div class="form-group"><label>РќР°Р·РІР°РЅРёРµ (РЅРµ РёР·РјРµРЅСЏРµС‚СЃСЏ)</label><input type="text" id="rp_name" value="' + el.getAttribute('data-name') + '" readonly></div><div class="form-group"><label>РћРїРёСЃР°РЅРёРµ</label><input type="text" id="rp_desc" value="' + (el.getAttribute('data-desc') || '').replace(/&quot;/g, '"') + '"></div>', function (errEl) {
                  return api('/api/v1/dictionary/products/types/' + encodeURIComponent(nameVal), { method: 'PUT', body: JSON.stringify({ description: document.getElementById('rp_desc').value.trim() || null }) }).then(function () { loadSectionRefProducts(); });
                });
              };
            });
            tableDiv.querySelectorAll('[data-del]').forEach(function (el) {
              el.onclick = function () { if (!confirm('РЈРґР°Р»РёС‚СЊ С‚РёРї РїСЂРѕРґСѓРєС‚Р° В«' + (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') + 'В»?')) return; api('/api/v1/dictionary/products/types/' + encodeURIComponent((el.getAttribute('data-name') || '').replace(/&quot;/g, '"')), { method: 'DELETE' }).then(function () { loadSectionRefProducts(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР°'); }); };
            });
          }
          renderTable(list);
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С‚РёРїРѕРІ РїСЂРѕРґСѓРєС‚РѕРІ.</p></div>'; });
        function bindRefProductsAdd() {
          var btn = document.getElementById('refAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('Р”РѕР±Р°РІРёС‚СЊ С‚РёРї РїСЂРѕРґСѓРєС‚Р°', '<div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="rp_name" placeholder="РЅР°РїСЂРёРјРµСЂ Yogurt"></div><div class="form-group"><label>РћРїРёСЃР°РЅРёРµ</label><input type="text" id="rp_desc" placeholder="РћРїРёСЃР°РЅРёРµ"></div>', function (errEl) {
              return api('/api/v1/dictionary/products/types', { method: 'POST', body: JSON.stringify({ name: document.getElementById('rp_name').value.trim(), description: document.getElementById('rp_desc').value.trim() || null }) }).then(function () { loadSectionRefProducts(); });
            });
          };
        }
      }
      function loadSectionRefOperations() {
        api('/api/v1/operation-types').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="refAdd">Р”РѕР±Р°РІРёС‚СЊ</button>' : '';
          var html = '<div class="card"><h2>РўРёРїС‹ РѕРїРµСЂР°С†РёР№</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С….</p>'; bindRefOpsAdd(); return; }
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
            var arrow = sortDir > 0 ? ' в–І' : ' в–ј';
            var t = '<table><thead><tr><th class="sortable" data-col="code">РљРѕРґ' + (sortCol === 'code' ? arrow : '') + '</th><th class="sortable" data-col="name">РќР°Р·РІР°РЅРёРµ' + (sortCol === 'name' ? arrow : '') + '</th><th class="sortable" data-col="description">РћРїРёСЃР°РЅРёРµ' + (sortCol === 'description' ? arrow : '') + '</th><th class="sortable" data-col="active">РђРєС‚РёРІРЅР°' + (sortCol === 'active' ? arrow : '') + '</th><th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
            sorted.forEach(function (r) {
              var c = escAttr(r.code), n = escAttr(r.name), d = escAttr(r.description);
              var actText = (r.active === true ? 'Р”Р°' : 'РќРµС‚');
              var actAttr = (r.active === true ? 'true' : 'false');
              t += '<tr><td>' + (r.code || '') + '</td><td>' + (r.name || '') + '</td><td>' + (r.description || '') + '</td><td>' + actText + '</td><td>';
              if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-code="' + c + '" data-name="' + n + '" data-desc="' + d + '" data-active="' + actAttr + '">РР·РјРµРЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary btn-small" data-del data-code="' + c + '">РЈРґР°Р»РёС‚СЊ</button>';
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
                  + '<div class="form-group"><label>РљРѕРґ (РЅРµ РёР·РјРµРЅСЏРµС‚СЃСЏ)</label><input type="text" id="ro_code" value="' + el.getAttribute('data-code') + '" readonly></div>'
                  + '<div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="ro_name" value="' + (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') + '"></div>'
                  + '<div class="form-group"><label>РћРїРёСЃР°РЅРёРµ</label><input type="text" id="ro_desc" value="' + (el.getAttribute('data-desc') || '').replace(/&quot;/g, '"') + '"></div>'
                  + '<div class="form-group"><label>РђРєС‚РёРІРЅР°</label><select id="ro_active"><option value="true">Р”Р°</option><option value="false">РќРµС‚</option></select></div>';
                showModal('РР·РјРµРЅРёС‚СЊ С‚РёРї РѕРїРµСЂР°С†РёРё', bodyHtml, function (errEl) {
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
              el.onclick = function () { if (!confirm('РЈРґР°Р»РёС‚СЊ С‚РёРї РѕРїРµСЂР°С†РёРё В«' + el.getAttribute('data-code') + 'В»?')) return; api('/api/v1/operation-types/' + encodeURIComponent(el.getAttribute('data-code')), { method: 'DELETE' }).then(function () { loadSectionRefOperations(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР°'); }); };
            });
          }
          renderTable(list);
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С‚РёРїРѕРІ РѕРїРµСЂР°С†РёР№.</p></div>'; });
        function bindRefOpsAdd() {
          var btn = document.getElementById('refAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('Р”РѕР±Р°РІРёС‚СЊ С‚РёРї РѕРїРµСЂР°С†РёРё', '<div class="form-group"><label>РљРѕРґ</label><input type="text" id="ro_code" placeholder="РЅР°РїСЂРёРјРµСЂ transfer"></div><div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="ro_name" placeholder="РќР°Р·РІР°РЅРёРµ"></div><div class="form-group"><label>РћРїРёСЃР°РЅРёРµ</label><input type="text" id="ro_desc" placeholder="РћРїРёСЃР°РЅРёРµ"></div>', function (errEl) {
              return api('/api/v1/operation-types', { method: 'POST', body: JSON.stringify({ code: document.getElementById('ro_code').value.trim(), name: document.getElementById('ro_name').value.trim(), description: document.getElementById('ro_desc').value.trim() || null }) }).then(function () { loadSectionRefOperations(); });
            });
          };
        }
      }

      function whUserSelectHtml(userList, selectedSk, selectedAg, selectedExp) {
        selectedSk = selectedSk || ''; selectedAg = selectedAg || ''; selectedExp = selectedExp || '';
        var optsAll = '<option value="">вЂ” РќРµ РЅР°Р·РЅР°С‡РµРЅ</option>';
        var optsExp = '<option value="">вЂ” РќРµ РЅР°Р·РЅР°С‡РµРЅ</option>';
        (userList || []).forEach(function (u) {
          var login = escAttr(u.login);
          var label = (u.login || '') + (u.fio ? ' вЂ” ' + (u.fio || '').replace(/</g, '&lt;') : '');
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
        return '<div class="form-group"><label>РљР»Р°РґРѕРІС‰РёРє</label><select id="wh_sk">' + skOpts + '</select></div><div class="form-group"><label>РђРіРµРЅС‚</label><select id="wh_agent">' + agOpts + '</select></div><div class="form-group"><label>Р­РєСЃРїРµРґРёС‚РѕСЂ (login)</label><select id="wh_exp">' + exOpts + '</select></div>';
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
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="whAdd">Р”РѕР±Р°РІРёС‚СЊ</button>' : '';
          var html = '<div class="card"><h2>РЎРєР»Р°РґС‹</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('sectionTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ СЃРєР»Р°РґРѕРІ.</p>'; bindWhAdd(userList); return; }
          var sortCol = 'code';
          var sortDir = 1;
          function renderWhTable(data) {
            var sorted = data.slice().sort(function (a, b) { return tableSortCompare(a, b, sortCol, sortDir); });
            var t = '<table><thead><tr>' + sortableTh('code', 'РљРѕРґ', sortCol, sortDir) + sortableTh('name', 'РќР°Р·РІР°РЅРёРµ', sortCol, sortDir) + sortableTh('type', 'РўРёРї', sortCol, sortDir) + sortableTh('storekeeper', 'РљР»Р°РґРѕРІС‰РёРє', sortCol, sortDir) + sortableTh('agent', 'РђРіРµРЅС‚', sortCol, sortDir) + sortableTh('expeditor_login', 'Р­РєСЃРїРµРґРёС‚РѕСЂ (login)', sortCol, sortDir) + '<th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
            sorted.forEach(function (w) {
            var c = escAttr(w.code), n = escAttr(w.name), ty = escAttr(w.type), sk = escAttr(w.storekeeper), ag = escAttr(w.agent), ex = escAttr(w.expeditor_login);
            t += '<tr><td>' + (w.code || '') + '</td><td>' + (w.name || '') + '</td><td>' + (w.type || '') + '</td><td>' + (w.storekeeper || '') + '</td><td>' + (w.agent || '') + '</td><td>' + (w.expeditor_login || '') + '</td><td>';
            if (isAdmin()) t += '<button type="button" class="btn btn-secondary btn-small" data-wh-edit data-code="' + c + '" data-name="' + n + '" data-type="' + ty + '" data-storekeeper="' + sk + '" data-agent="' + ag + '" data-expeditor="' + ex + '">РР·РјРµРЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary btn-small" data-wh-del data-code="' + c + '">РЈРґР°Р»РёС‚СЊ</button>';
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
              var bodyHtml = '<div class="form-group"><label>РљРѕРґ (РЅРµ РёР·РјРµРЅСЏРµС‚СЃСЏ)</label><input type="text" id="wh_code" value="' + el.getAttribute('data-code') + '" readonly></div><div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="wh_name" value="' + (unesc(el.getAttribute('data-name')) || '').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '"></div><div class="form-group"><label>РўРёРї</label><input type="text" id="wh_type" value="' + (unesc(el.getAttribute('data-type')) || '').replace(/"/g, '&quot;').replace(/</g, '&lt;') + '"></div>' + whUserSelectHtml(userList, sk, ag, ex);
              showModal('РР·РјРµРЅРёС‚СЊ СЃРєР»Р°Рґ', bodyHtml, function (errEl) {
                var skVal = document.getElementById('wh_sk').value || null;
                var agVal = document.getElementById('wh_agent').value || null;
                var exVal = document.getElementById('wh_exp').value || null;
                return api('/api/v1/dictionary/warehouses/' + encodeURIComponent(unesc(el.getAttribute('data-code'))), { method: 'PUT', body: JSON.stringify({ name: document.getElementById('wh_name').value.trim(), type: document.getElementById('wh_type').value.trim() || null, storekeeper: skVal, agent: agVal, expeditor_login: exVal }) }).then(function () { loadSectionWarehouses(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-wh-del]').forEach(function (el) {
            el.onclick = function () { if (!confirm('РЈРґР°Р»РёС‚СЊ СЃРєР»Р°Рґ В«' + (el.getAttribute('data-code') || '').replace(/&quot;/g, '"') + 'В»?')) return; api('/api/v1/dictionary/warehouses/' + encodeURIComponent((el.getAttribute('data-code') || '').replace(/&quot;/g, '"')), { method: 'DELETE' }).then(function () { loadSectionWarehouses(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР°'); }); };
          });
          }
          renderWhTable(list);
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё СЃРєР»Р°РґРѕРІ.</p></div>'; });
        function bindWhAdd(userList) {
          var btn = document.getElementById('whAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            var bodyHtml = '<div class="form-group"><label>РљРѕРґ</label><input type="text" id="wh_code" placeholder="РЅР°РїСЂРёРјРµСЂ WH01"></div><div class="form-group"><label>РќР°Р·РІР°РЅРёРµ</label><input type="text" id="wh_name" placeholder="РќР°Р·РІР°РЅРёРµ"></div><div class="form-group"><label>РўРёРї</label><input type="text" id="wh_type" placeholder="РѕСЃРЅРѕРІРЅРѕР№"></div>' + whUserSelectHtml(userList, '', '', '');
            showModal('Р”РѕР±Р°РІРёС‚СЊ СЃРєР»Р°Рґ', bodyHtml, function (errEl) {
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
        var opts = '<option value="">вЂ” РќРµ РЅР°Р·РЅР°С‡РµРЅ</option>';
        (userList || []).forEach(function (u) {
          var login = escAttr(u.login);
          var label = (u.login || '') + (u.fio ? ' вЂ” ' + (u.fio || '').replace(/</g, '&lt;') : '');
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
        var cityOpts = '<option value="">вЂ” РќРµ РІС‹Р±СЂР°РЅРѕ вЂ”</option>';
        citiesCache.forEach(function (ct) { cityOpts += '<option value="' + ct.id + '"' + (ct.id === c.city_id ? ' selected' : '') + '>' + escAttr(ct.name) + '</option>'; });
        var territoryOpts = '<option value="">вЂ” РќРµ РІС‹Р±СЂР°РЅРѕ вЂ”</option>';
        territoriesCache.forEach(function (t) { territoryOpts += '<option value="' + t.id + '"' + (t.id === c.territory_id ? ' selected' : '') + '>' + escAttr(t.name) + '</option>'; });
        console.log('Built cityOpts:', cityOpts);
        console.log('Built territoryOpts:', territoryOpts);
        return f('РќР°Р·РІР°РЅРёРµ РєР»РёРµРЅС‚Р°', 'cust_name', c.name_client) + f('РќР°Р·РІР°РЅРёРµ С„РёСЂРјС‹', 'cust_firm', c.firm_name) + f('РљР°С‚РµРіРѕСЂРёСЏ РєР»РёРµРЅС‚Р°', 'cust_category', c.category_client) + f('РђРґСЂРµСЃ', 'cust_address', c.address) + '<div class="form-group"><label>Р“РѕСЂРѕРґ</label><select id="cust_city">' + cityOpts + '</select></div><div class="form-group"><label>РўРµСЂСЂРёС‚РѕСЂРёСЏ</label><select id="cust_territory">' + territoryOpts + '</select></div>' + f('РћСЂРёРµРЅС‚РёСЂ', 'cust_landmark', c.landmark) + f('РўРµР»РµС„РѕРЅ', 'cust_phone', c.phone) + f('РљРѕРЅС‚Р°РєС‚РЅРѕРµ Р»РёС†Рѕ', 'cust_contact', c.contact_person) + f('РРќРќ', 'cust_tax_id', c.tax_id) + f('РЎС‚Р°С‚СѓСЃ', 'cust_status', c.status) + '<div class="form-group"><label>login Р°РіРµРЅС‚Р°</label><select id="cust_agent">' + agOpts + '</select></div><div class="form-group"><label>login СЌРєСЃРїРµРґРёС‚РѕСЂР°</label><select id="cust_expeditor">' + exOpts + '</select></div>' + num('РЁРёСЂРѕС‚Р°', 'cust_lat', c.latitude) + num('Р”РѕР»РіРѕС‚Р°', 'cust_lon', c.longitude) + f('РџРРќР¤Р›', 'cust_pinfl', c.PINFL) + f('Р”РѕРіРѕРІРѕСЂ в„–', 'cust_contract_no', c.contract_no) + f('Р /РЎ', 'cust_account_no', c.account_no) + f('Р‘Р°РЅРє', 'cust_bank', c.bank) + f('РњР¤Рћ', 'cust_mfo', c.MFO) + f('РћРљР­Р”', 'cust_oked', c.OKED) + f('Р РµРіРёСЃС‚СЂР°С†РёРѕРЅРЅС‹Р№ РєРѕРґ РїР»Р°С‚РµР»СЊС‰РёРєР° РќР”РЎ', 'cust_vat_code', c.VAT_code);
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
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="custAdd">Р”РѕР±Р°РІРёС‚СЊ РєР»РёРµРЅС‚Р°</button>' : '';
          var exportBtn = isAdmin() ? '<button type="button" class="btn btn-secondary" id="custExport">РЎРєР°С‡Р°С‚СЊ РІ Excel РІСЃРµС… РєР»РёРµРЅС‚РѕРІ</button>' : '';
          var agentOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
          var expeditorOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
          userList.forEach(function (u) {
            var optHtml = '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>';
            agentOpts += optHtml;
            if ((u.role || '').toLowerCase() === 'expeditor') expeditorOpts += optHtml;
          });
          content.innerHTML = '<div class="card"><h2>РљР»РёРµРЅС‚С‹</h2><p style="margin:0 0 12px 0">' + addBtn + ' ' + exportBtn + '</p><div class="form-group" style="margin-bottom:12px"><label>РџРѕРёСЃРє</label></div><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"><input type="number" id="custSearchId" placeholder="РР” РєР»РёРµРЅС‚Р°" min="1" style="max-width:110px"><input id="custSearchName" placeholder="РќР°Р·РІР°РЅРёРµ РєР»РёРµРЅС‚Р°" style="max-width:180px"><input id="custSearchFirm" placeholder="РќР°Р·РІР°РЅРёРµ С„РёСЂРјС‹" style="max-width:180px"><input id="custSearchCity" placeholder="Р“РѕСЂРѕРґ" style="max-width:140px"><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">login Р°РіРµРЅС‚Р°</label><select id="custSearchAgent" style="max-width:160px">' + agentOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">login СЌРєСЃРїРµРґРёС‚РѕСЂР°</label><select id="custSearchExpeditor" style="max-width:160px">' + expeditorOpts + '</select></div><input id="custSearchPhone" placeholder="РўРµР»РµС„РѕРЅ" style="max-width:140px"><input id="custSearchTaxId" placeholder="РРќРќ" style="max-width:120px"><button type="button" class="btn btn-primary" id="btnCustSearch">РќР°Р№С‚Рё</button></div><div id="sectionTable"></div><div id="sectionErr" class="err"></div></div>';
          bindCustAdd(userList);
          var exportEl = document.getElementById('custExport');
          if (exportEl) exportEl.onclick = function () {
            var url = window.location.origin + '/api/v1/customers/export';
            fetch(url, { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) return r.json().then(function (d) { throw { data: d }; }).catch(function (e) { if (e.data) throw e; throw { data: { detail: r.statusText } }; });
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'clients.xlsx'; a.click(); URL.revokeObjectURL(a.href);
            }).catch(function (e) { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё: ' + (e && e.data && e.data.detail ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : e.message || 'РћС€РёР±РєР°')); });
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
              if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ РєР»РёРµРЅС‚РѕРІ.</p>'; return; }
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
                var cols = [{ col: 'id', lbl: 'РР” РєР»РёРµРЅС‚Р°' }, { col: 'name_client', lbl: 'РќР°Р·РІР°РЅРёРµ РєР»РёРµРЅС‚Р°' }, { col: 'firm_name', lbl: 'РќР°Р·РІР°РЅРёРµ С„РёСЂРјС‹' }, { col: 'category_client', lbl: 'РљР°С‚РµРіРѕСЂРёСЏ РєР»РёРµРЅС‚Р°' }, { col: 'address', lbl: 'РђРґСЂРµСЃ' }, { col: 'city', lbl: 'Р“РѕСЂРѕРґ' }, { col: 'territory', lbl: 'РўРµСЂСЂРёС‚РѕСЂРёСЏ' }, { col: 'landmark', lbl: 'РћСЂРёРµРЅС‚РёСЂ' }, { col: 'phone', lbl: 'РўРµР»РµС„РѕРЅ' }, { col: 'contact_person', lbl: 'РљРѕРЅС‚Р°РєС‚РЅРѕРµ Р»РёС†Рѕ' }, { col: 'tax_id', lbl: 'РРќРќ' }, { col: 'status', lbl: 'РЎС‚Р°С‚СѓСЃ' }, { col: 'login_agent', lbl: 'login Р°РіРµРЅС‚Р°' }, { col: 'login_expeditor', lbl: 'login СЌРєСЃРїРµРґРёС‚РѕСЂР°' }, { col: 'has_photo', lbl: 'Р•СЃС‚СЊ С„РѕС‚Рѕ' }, { col: 'latitude', lbl: 'РЁРёСЂРѕС‚Р°' }, { col: 'longitude', lbl: 'Р”РѕР»РіРѕС‚Р°' }, { col: 'PINFL', lbl: 'РџРРќР¤Р›' }, { col: 'contract_no', lbl: 'Р”РѕРіРѕРІРѕСЂ в„–' }, { col: 'account_no', lbl: 'Р /РЎ' }, { col: 'bank', lbl: 'Р‘Р°РЅРє' }, { col: 'MFO', lbl: 'РњР¤Рћ' }, { col: 'OKED', lbl: 'РћРљР­Р”' }, { col: 'VAT_code', lbl: 'Р РµРі. РєРѕРґ РќР”РЎ' }];
                var t = '<div style="overflow-x:auto"><table><thead><tr><th>Р”РµР№СЃС‚РІРёСЏ</th>';
                cols.forEach(function (x) { t += sortableTh(x.col, x.lbl, custSortCol, custSortDir); });
                t += '</tr></thead><tbody>';
                sorted.forEach(function (c) {
                  var id = c.id;
                  var custJson = escAttr(JSON.stringify(c));
                  t += '<tr><td>';
                  t += ' <button type="button" class="btn btn-secondary btn-small" data-cust-visits data-id="' + id + '" data-name="' + escAttr((c.name_client || c.firm_name || '').toString()) + '">Р’РёР·РёС‚С‹</button> <button type="button" class="btn btn-secondary btn-small" data-cust-photos data-id="' + id + '" data-name="' + escAttr((c.name_client || c.firm_name || '').toString()) + '">Р¤РѕС‚Рѕ</button> <button type="button" class="btn btn-secondary btn-small" data-cust-edit data-id="' + id + '" data-cust-json="' + custJson + '">РР·РјРµРЅРёС‚СЊ</button>';
                  if (isAdmin()) t += ' <button type="button" class="btn btn-secondary btn-small" data-cust-del data-id="' + id + '">РЈРґР°Р»РёС‚СЊ</button>';
                  t += '</td><td>' + (c.id != null ? c.id : '') + '</td><td>' + escAttr(c.name_client || '') + '</td><td>' + escAttr(c.firm_name || '') + '</td><td>' + escAttr(c.category_client || '') + '</td><td>' + escAttr(c.address || '') + '</td><td>' + escAttr(c.city || '') + '</td><td>' + escAttr(c.territory || '') + '</td><td>' + escAttr(c.landmark || '') + '</td><td>' + escAttr(c.phone || '') + '</td><td>' + escAttr(c.contact_person || '') + '</td><td>' + escAttr(c.tax_id || '') + '</td><td>' + escAttr(c.status || '') + '</td><td>' + escAttr(c.login_agent || '') + '</td><td>' + escAttr(c.login_expeditor || '') + '</td><td>' + (c.has_photo ? 'Р”Р°' : 'РќРµС‚') + '</td><td>' + (c.latitude != null ? c.latitude : '') + '</td><td>' + (c.longitude != null ? c.longitude : '') + '</td><td>' + escAttr(c.PINFL || '') + '</td><td>' + escAttr(c.contract_no || '') + '</td><td>' + escAttr(c.account_no || '') + '</td><td>' + escAttr(c.bank || '') + '</td><td>' + escAttr(c.MFO || '') + '</td><td>' + escAttr(c.OKED || '') + '</td><td>' + escAttr(c.VAT_code || '') + '</td></tr>';
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
                    showModal('РР·РјРµРЅРёС‚СЊ РєР»РёРµРЅС‚Р°', custEditFormHtml(c, userList), function (errEl) {
                      return api('/api/v1/customers/' + id, { method: 'PATCH', body: JSON.stringify(custFormBody()) }).then(function () { loadSectionCustomers(); });
                    });
                  });
                };
              });
              tableDiv.querySelectorAll('[data-cust-del]').forEach(function (el) {
                el.onclick = function () {
                  var id = el.getAttribute('data-id');
                  if (!confirm('РЈРґР°Р»РёС‚СЊ РєР»РёРµРЅС‚Р° ID ' + id + '?')) return;
                  api('/api/v1/customers/' + id, { method: 'DELETE' }).then(function () { loadSectionCustomers(); }).catch(function (e) { alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР°'); });
                };
              });
              tableDiv.querySelectorAll('[data-cust-visits]').forEach(function (el) {
                el.onclick = function () {
                  var cid = el.getAttribute('data-id');
                  var cname = (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') || ('РљР»РёРµРЅС‚ #' + cid);
                  var html = '<div id="visitsModalBody"><p>Р—Р°РіСЂСѓР·РєР°...</p></div><p style="margin-top:12px"><button type="button" class="btn btn-primary" id="btnAddVisitModal">Р”РѕР±Р°РІРёС‚СЊ РІРёР·РёС‚</button></p>';
                  showModal('Р’РёР·РёС‚С‹: ' + cname, html, function () { return Promise.resolve(); });
                  var container = document.getElementById('visitsModalBody');
                  var refreshVisits = function () {
                    if (!container) return;
                    api('/api/v1/customers/' + cid + '/visits?limit=100').then(function (r) {
                      var data = Array.isArray(r) ? r : (r && r.data) || [];
                      if (!container) return;
                      if (!data.length) { container.innerHTML = '<p>РќРµС‚ РІРёР·РёС‚РѕРІ.</p>'; return; }
                      var tbl = '<table style="width:100%"><thead><tr><th>Р”Р°С‚Р°</th><th>Р’СЂРµРјСЏ</th><th>РЎС‚Р°С‚СѓСЃ</th><th>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</th><th>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th><th></th></tr></thead><tbody>';
                      data.forEach(function (v) {
                        var statusRu = (v.status === 'planned' ? 'Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ' : v.status === 'completed' ? 'Р—Р°РІРµСЂС€С‘РЅ' : 'РћС‚РјРµРЅС‘РЅ');
                        var canEdit = v.status !== 'cancelled';
                        tbl += '<tr><td>' + (v.visit_date || '') + '</td><td>' + (v.visit_time || 'вЂ”') + '</td><td>' + statusRu + '</td><td>' + (v.responsible_name || v.responsible_login || 'вЂ”') + '</td><td>' + (v.comment || '').substring(0, 50) + (v.comment && v.comment.length > 50 ? 'вЂ¦' : '') + '</td><td><button type="button" class="btn btn-secondary btn-small" data-visit-open data-vid="' + v.id + '">РћС‚РєСЂС‹С‚СЊ</button> ' + (canEdit ? '<button type="button" class="btn btn-secondary btn-small" data-visit-edit data-vid="' + v.id + '">РР·РјРµРЅРёС‚СЊ</button> ' : '') + '<button type="button" class="btn btn-secondary btn-small" data-visit-del data-vid="' + v.id + '">РЈРґР°Р»РёС‚СЊ</button></td></tr>';
                      });
                      tbl += '</tbody></table>';
                      container.innerHTML = tbl;
                      container.querySelectorAll('[data-visit-del]').forEach(function (b) {
                        b.onclick = function () {
                          if (!confirm('РЈРґР°Р»РёС‚СЊ РІРёР·РёС‚?')) return;
                          api('/api/v1/visits/' + b.getAttribute('data-vid'), { method: 'DELETE' }).then(refreshVisits).catch(function (e) { alert(e.data && e.data.detail ? e.data.detail : 'РћС€РёР±РєР°'); });
                        };
                      });
                      container.querySelectorAll('[data-visit-open]').forEach(function (b) {
                        b.onclick = function () {
                          var vid = b.getAttribute('data-vid');
                          api('/api/v1/visits/' + vid).then(function (visit) {
                            var dateStr = visit.visit_date ? formatDateOnly(visit.visit_date) : 'вЂ”';
                            var timeStr = (visit.visit_time || '').toString().substring(0, 5) || 'вЂ”';
                            var statusRu = (visit.status === 'planned' ? 'Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ' : visit.status === 'completed' ? 'Р—Р°РІРµСЂС€С‘РЅ' : visit.status === 'cancelled' ? 'РћС‚РјРµРЅС‘РЅ' : 'РќР° СЂР°СЃСЃРјРѕС‚СЂРµРЅРёРё');
                            var body = '<div class="form-group"><label>РљР»РёРµРЅС‚</label><div>' + escAttr(visit.customer_name || '') + '</div></div><div class="form-group"><label>Р”Р°С‚Р°</label><div>' + escAttr(dateStr) + '</div></div><div class="form-group"><label>Р’СЂРµРјСЏ</label><div>' + escAttr(timeStr) + '</div></div><div class="form-group"><label>РЎС‚Р°С‚СѓСЃ</label><div>' + escAttr(statusRu) + '</div></div><div class="form-group"><label>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</label><div>' + escAttr(visit.responsible_name || visit.responsible_login || '') + '</div></div>' + (visit.comment ? '<div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><div>' + escAttr(visit.comment) + '</div></div>' : '') + '<p><button type="button" class="btn btn-secondary" id="vcard_edit_inner">РР·РјРµРЅРёС‚СЊ</button></p>';
                            showModal('РљР°СЂС‚РѕС‡РєР° РІРёР·РёС‚Р°', body, function () { return Promise.resolve(); });
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
                          }).catch(function (e) { alert(e.data && e.data.detail ? e.data.detail : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё'); });
                        };
                      });
                    }).catch(function () { if (container) container.innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РІРёР·РёС‚РѕРІ.</p>'; });
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
                  var cname = (el.getAttribute('data-name') || '').replace(/&quot;/g, '"') || ('РљР»РёРµРЅС‚ #' + cid);
                  var html = '<div id="photosModalBody"><p>Р—Р°РіСЂСѓР·РєР°...</p></div><p style="margin-top:12px"><strong>Р—Р°РіСЂСѓР·РєР° С„РѕС‚Рѕ</strong> (РєР»РёРµРЅС‚: ' + escAttr(cname) + ')</p><p style="display:flex;flex-wrap:wrap;align-items:center;gap:12px"><span style="position:relative"><input type="file" id="photoFile" accept="image/*" style="position:absolute;left:0;top:0;opacity:0;width:100%;height:100%;cursor:pointer;font-size:0"><button type="button" class="btn btn-secondary" style="pointer-events:none">Р’Р«Р‘Р РђРўР¬ Р¤РђР™Р›!</button></span><span id="photoFileName" style="font-size:13px;color:#64748b;min-width:120px"></span><button type="button" class="btn btn-primary" id="btnUploadPhoto">Р—Р°РіСЂСѓР·РёС‚СЊ</button></p><div id="photosUploadErr" class="err" style="margin-top:8px;display:none"></div>';
                  showModal('Р¤РѕС‚Рѕ: ' + cname, html, function () { return Promise.resolve(); }, { closeOnly: true });
                  var container = document.getElementById('photosModalBody');
                  var refreshPhotos = function () {
                    if (!container) return;
                    api('/api/v1/customers/' + cid + '/photos').then(function (r) {
                      var data = (r && r.data) || [];
                      if (!container) return;
                        if (!data.length) { container.innerHTML = '<p>РќРµС‚ С„РѕС‚РѕРіСЂР°С„РёР№.</p>'; return; }
                      var div = '<div style="display:flex;flex-wrap:wrap;gap:8px">';
                      data.forEach(function (p) {
                        var fname = (p.photo_path || '').split('/').pop() || '';
                        var url = p.photo_url || (fname ? (window.location.origin + '/photo/' + fname) : null) || (window.location.origin + '/api/v1/photos/download/' + (p.download_token || ''));
                        var desc = p.description || (p.photo_datetime ? ('РЎСЉС‘РјРєР°: ' + p.photo_datetime.slice(0, 16).replace('T', ' ')) : 'вЂ”');
                        div += '<div style="flex:0 0 auto"><a href="' + url + '" target="_blank"><img src="' + url + '" alt="" style="max-width:120px;max-height:120px;object-fit:cover;border-radius:6px"></a><p style="font-size:11px;margin:4px 0 0 0">' + (desc || 'вЂ”') + '</p></div>';
                      });
                      div += '</div>';
                      container.innerHTML = div;
                    }).catch(function (e) {
                      if (!container) return;
                      var msg = 'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ СЃРїРёСЃРѕРє С„РѕС‚РѕРіСЂР°С„РёР№.';
                      if (e && e.data) {
                        var d = e.data;
                        if (typeof d === 'string') msg += ' ' + d;
                        else if (d && d.detail) msg += ' ' + (typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail));
                        else if (e.status) msg += ' (HTTP ' + e.status + ')';
                      } else if (e && e.status) msg += ' (HTTP ' + e.status + ')';
                      container.innerHTML = '<p class="err">' + msg + '</p><p style="margin-top:8px"><button type="button" class="btn btn-secondary" id="btnRetryPhotos">РџРѕРІС‚РѕСЂРёС‚СЊ</button></p>';
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
                      if (!fileInput || !fileInput.files || !fileInput.files[0]) { if (uploadErrEl) { uploadErrEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ С„Р°Р№Р»'; uploadErrEl.className = 'err'; uploadErrEl.style.display = 'block'; } else alert('Р’С‹Р±РµСЂРёС‚Рµ С„Р°Р№Р»'); return; }
                      var token = localStorage.getItem('sds_token');
                      if (!token) { var m = 'РќРµС‚ С‚РѕРєРµРЅР° Р°РІС‚РѕСЂРёР·Р°С†РёРё. Р’РѕР№РґРёС‚Рµ Р·Р°РЅРѕРІРѕ.'; if (uploadErrEl) { uploadErrEl.textContent = m; uploadErrEl.style.display = 'block'; } else alert(m); return; }
                      uploadBtn.disabled = true;
                      if (uploadErrEl) { uploadErrEl.textContent = 'Р—Р°РіСЂСѓР·РєР°...'; uploadErrEl.className = ''; uploadErrEl.style.display = 'block'; }
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
                        if (uploadErrEl) { uploadErrEl.textContent = 'Р—Р°РіСЂСѓР¶РµРЅРѕ.'; uploadErrEl.className = 'msg'; uploadErrEl.style.display = 'block'; }
                        refreshPhotos();
                      }).catch(function (e) {
                        console.error('[Photo upload] error', e);
                        var msg = (e && e.detail) ? (typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail)) : (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) ? e.message : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С„РѕС‚Рѕ';
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
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё.</p></div>'; });
        function bindCustAdd(userList) {
          var btn = document.getElementById('custAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            loadCitiesAndTerritories().then(function () {
              var bodyHtml = custEditFormHtml({ status: 'РђРєС‚РёРІРЅС‹Р№' }, userList);
              showModal('Р”РѕР±Р°РІРёС‚СЊ РєР»РёРµРЅС‚Р°', bodyHtml, function (errEl) {
                return api('/api/v1/customers', { method: 'POST', body: JSON.stringify(custFormBody()) }).then(function () { loadSectionCustomers(); });
              });
            });
          };
        }
      }

      function loadSectionCustomersMap() {
        var content = document.getElementById('content');
        if (!content) return;
        content.innerHTML = '<div class="card"><h2>РљР»РёРµРЅС‚С‹ РЅР° РєР°СЂС‚Рµ</h2><div class="map-toolbar"><label>РљР°СЂС‚Р°:</label><select id="mapProvider"><option value="yandex">РЇРЅРґРµРєСЃ.РљР°СЂС‚С‹</option><option value="osm">OpenStreetMap</option></select></div><p id="customersMapInfo" style="margin:0 0 12px 0;font-size:14px;color:#555">Р—Р°РіСЂСѓР·РєР°...</p><div id="customersMap"></div></div>';
        api('/api/v1/config').catch(function () { return {}; }).then(function (config) {
          var yandexKey = (config && config.yandexMapsApiKey) ? config.yandexMapsApiKey : '';
          api('/api/v1/customers?limit=200').catch(function () { return []; }).then(function (list) {
            list = asList(list);
            var withCoords = list.filter(function (c) { return c.latitude != null && c.longitude != null && !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude)); });
            var infoEl = document.getElementById('customersMapInfo');
            var noCoordsMsg = withCoords.length === 0 ? ' РќРµС‚ РєР»РёРµРЅС‚РѕРІ СЃ РєРѕРѕСЂРґРёРЅР°С‚Р°РјРё вЂ” СѓРєР°Р¶РёС‚Рµ С€РёСЂРѕС‚Сѓ Рё РґРѕР»РіРѕС‚Сѓ РІ РєР°СЂС‚РѕС‡РєРµ РєР»РёРµРЅС‚Р° (РџРѕРёСЃРє РєР»РёРµРЅС‚Р° в†’ РР·РјРµРЅРёС‚СЊ).' : '';
            if (infoEl) infoEl.innerHTML = 'РћС‚РѕР±СЂР°Р¶РµРЅРѕ РєР»РёРµРЅС‚РѕРІ РЅР° РєР°СЂС‚Рµ: ' + withCoords.length + (list.length ? ' (РёР· ' + list.length + ')' : '') + (noCoordsMsg ? '<br><span style="color:#856404">' + noCoordsMsg + '</span>' : '');
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
                  var name = (c.name_client || c.firm_name || 'РљР»РёРµРЅС‚ #' + (c.id || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
                if (infoEl) infoEl.innerHTML = 'РћС‚РѕР±СЂР°Р¶РµРЅРѕ РєР»РёРµРЅС‚РѕРІ РЅР° РєР°СЂС‚Рµ: ' + withCoords.length + '. <span style="color:#c00">Р”Р»СЏ РЇРЅРґРµРєСЃ.РљР°СЂС‚ Р·Р°РґР°Р№С‚Рµ YANDEX_MAPS_API_KEY РЅР° СЃРµСЂРІРµСЂРµ РёР»Рё РІС‹Р±РµСЂРёС‚Рµ OpenStreetMap.</span>';
                return;
              }
              function doYandex() {
                if (typeof ymaps === 'undefined') {
                  var script = document.createElement('script');
                  script.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + encodeURIComponent(yandexKey) + '&lang=ru_RU';
                  script.onload = doYandex; script.onerror = function () { if (infoEl) infoEl.innerHTML = 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РЇРЅРґРµРєСЃ.РљР°СЂС‚.'; };
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
                    var name = (c.name_client || c.firm_name || 'РљР»РёРµРЅС‚ #' + (c.id || '')).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
        content.innerHTML = '<div class="card"><h2>Р—Р°РєР°Р·С‹</h2><p style="margin:0 0 12px 0"><button type="button" class="btn btn-primary" id="orderAdd">РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·</button>' + (isAdmin() ? ' <button type="button" class="btn btn-secondary" id="orderExport">РЎРєР°С‡Р°С‚СЊ Р·Р°РєР°Р·С‹ РІ Excel</button>' : '') + '</p><div class="form-group" style="margin:12px 0"><label>РџРѕРёСЃРє Р·Р°РєР°Р·РѕРІ</label></div><div id="orderSearchRow" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"></div><div id="sectionOrderErr" class="err"></div><div id="orderInfo" style="margin:12px 0;padding:8px;background:#f8f9fa;border-radius:4px;font-size:13px"></div><div id="sectionTable"></div></div>';
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
          }).catch(function (e) { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё: ' + (e && e.data && e.data.detail ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : e.message || 'РћС€РёР±РєР°')); });
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
          if (sc === 'completed' || sc === 'cancelled' || sc === 'canceled' || sc === 'РѕС‚РјРµРЅРµРЅ' || sc === 'Р·Р°РІРµСЂС€РµРЅ' || sc === 'closed' || sc === '4' || (sc.length && sc.charAt(0) === '4') || sc.indexOf('РѕС‚РјРµРЅРµРЅ') !== -1) return text;
          try {
            var d = parseBackendDate(isoStr);
            if (!d) return text;
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            d.setHours(0, 0, 0, 0);
            if (d < today) return '<span style="color:#c00;font-weight:bold" title="РџСЂРѕСЃСЂРѕС‡РµРЅР°">' + text + '</span>';
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
            infoDiv.innerHTML = '<strong>РќР°Р№РґРµРЅРѕ Р·Р°РєР°Р·РѕРІ:</strong> ' + totalCount + ' | <strong>РС‚РѕРіРѕ СЃСѓРјРјР°:</strong> ' + totalAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' СЃСѓРј';
          }
          
          if (!list || !list.length) { 
            tableDiv.innerHTML = '<p>Р—Р°РєР°Р·РѕРІ РЅРµ РЅР°Р№РґРµРЅРѕ. РР·РјРµРЅРёС‚Рµ РєСЂРёС‚РµСЂРёРё РїРѕРёСЃРєР° РёР»Рё СЃРѕР·РґР°Р№С‚Рµ Р·Р°РєР°Р·.</p>'; 
            if (infoDiv && totalCount === 0) {
              infoDiv.innerHTML = '<strong>РќР°Р№РґРµРЅРѕ Р·Р°РєР°Р·РѕРІ:</strong> 0 | <strong>РС‚РѕРіРѕ СЃСѓРјРјР°:</strong> 0,00 СЃСѓРј';
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
          var arrow = orderSortDir > 0 ? ' в–І' : ' в–ј';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (orderSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr><th>Р”РµР№СЃС‚РІРёСЏ</th>' + th('order_no', 'в„–') + th('customer_name', 'РљР»РёРµРЅС‚') + th('order_date', 'Р”Р°С‚Р° СЃРѕР·РґР°РЅРёСЏ') + th('status_code', 'РЎС‚Р°С‚СѓСЃ') + th('payment_type_name', 'РўРёРї РѕРїР»Р°С‚С‹') + th('total_amount', 'РЎСѓРјРјР°') + th('login_agent', 'РђРіРµРЅС‚') + th('login_expeditor', 'Р­РєСЃРїРµРґРёС‚РѕСЂ') + th('scheduled_delivery_at', 'Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё') + '<th>РџРµСЂРµРІРѕРґ РІ СЃС‚Р°С‚СѓСЃ В«Р”РѕСЃС‚Р°РІРєР°В»</th><th>Р”Р°С‚Р° Р·Р°РєСЂС‹С‚РёСЏ</th>' + th('last_updated_at', 'РџРѕСЃР»РµРґРЅРµРµ РёР·РјРµРЅРµРЅРёРµ') + th('last_updated_by', 'РљС‚Рѕ РёР·РјРµРЅРёР»') + '</tr></thead><tbody>';
          sorted.forEach(function (o) {
            t += '<tr><td><button type="button" class="btn btn-secondary btn-small" data-order-edit data-id="' + (o.order_no != null ? o.order_no : o.id) + '">РР·РјРµРЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary btn-small" data-order-copy data-id="' + (o.order_no != null ? o.order_no : o.id) + '" style="background:#17a2b8;color:#fff;border-color:#17a2b8">РљРѕРїРёСЂРѕРІР°С‚СЊ</button></td><td>' + (o.order_no != null ? o.order_no : o.id) + '</td><td>' + escAttr(o.customer_name || (o.customer_id != null ? 'ID ' + o.customer_id : '')) + '</td><td>' + formatDateTashkent(o.order_date) + '</td><td>' + formatStatusBadge(o.status_code, o.status_name) + '</td><td>' + escAttr(o.payment_type_name || o.payment_type_code || '') + '</td><td>' + (o.total_amount != null ? o.total_amount : '') + '</td><td>' + escAttr(o.login_agent || '') + '</td><td>' + escAttr(o.login_expeditor || '') + '</td><td>' + formatScheduledDelivery(o.scheduled_delivery_at, o.status_code) + '</td><td>' + formatDateTashkent(o.status_delivery_at) + '</td><td>' + formatDateTashkent(o.closed_at) + '</td><td>' + formatDateTashkent(o.last_updated_at) + '</td><td>' + escAttr(o.last_updated_by || '') + '</td></tr>';
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
                if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ Р·Р°РєР°Р·.';
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
                  if (titleEl) titleEl.textContent = 'РљРѕРїРёСЏ Р·Р°РєР°Р·Р° в„– ' + orderId;
                });
              }).catch(function (e) {
                if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ Р·Р°РєР°Р·.';
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
            if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р·Р°РєР°Р·РѕРІ.';
            tableDiv.innerHTML = '<p>РЎРїРёСЃРѕРє Р·Р°РєР°Р·РѕРІ РЅРµ Р·Р°РіСЂСѓР¶РµРЅ.</p>';
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
          if (!statuses.length) statuses = [{ code: 'open', name: 'РћС‚РєСЂС‹С‚' }, { code: 'cancelled', name: 'РћС‚РјРµРЅС‘РЅ' }];
          statuses = statuses.slice().sort(function (a, b) { return (a.name || a.code || '').localeCompare(b.name || b.code || ''); });
          var statusOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>'; statuses.forEach(function (s) { statusOpts += '<option value="' + escAttr(s.code) + '">' + escAttr(s.name || s.code) + '</option>'; });
          var userOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
          var expeditorUserOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
          userList.forEach(function (u) {
            var optHtml = '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>';
            userOpts += optHtml;
            if ((u.role || '').toLowerCase() === 'expeditor') expeditorUserOpts += optHtml;
          });
          var custOpts = '<option value="">вЂ” Р›СЋР±РѕР№ вЂ”</option>'; customers.forEach(function (c) { custOpts += '<option value="' + (c.id != null ? c.id : '') + '">' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          var presets = [];
          try { var p = localStorage.getItem(ORDER_PRESETS_STORAGE); if (p) presets = JSON.parse(p); } catch (e) {}
          var presetOpts = '<option value="">вЂ” РўРµРєСѓС‰РёР№ РїРѕРёСЃРє вЂ”</option>';
          presets.forEach(function (pr, i) { presetOpts += '<option value="' + i + '">' + escAttr(pr.name || 'Р’Р°СЂРёР°РЅС‚ ' + (i + 1)) + '</option>'; });
          searchRow.innerHTML = '<div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РЎРѕС…СЂР°РЅС‘РЅРЅС‹Р№ РїРѕРёСЃРє</label><select id="orderSearchPreset" style="max-width:180px">' + presetOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РќРѕРјРµСЂ Р·Р°РєР°Р·Р°</label><input type="number" id="orderSearchOrderNo" min="1" style="max-width:110px" placeholder="в„– Р·Р°РєР°Р·Р°"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РљР»РёРµРЅС‚</label><select id="orderSearchCustomerId" style="max-width:220px">' + custOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РЎС‚Р°С‚СѓСЃ</label><select id="orderSearchStatus" style="max-width:140px">' + statusOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё СЃ</label><input type="text" id="orderSearchDateFrom" style="max-width:130px" placeholder="РґРґ.РјРј.РіРіРіРі"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РїРѕ</label><input type="text" id="orderSearchDateTo" style="max-width:130px" placeholder="РґРґ.РјРј.РіРіРіРі"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РђРіРµРЅС‚</label><select id="orderSearchAgent" style="max-width:160px">' + userOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Р­РєСЃРїРµРґРёС‚РѕСЂ</label><select id="orderSearchExpeditor" style="max-width:160px">' + expeditorUserOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РљС‚Рѕ РёР·РјРµРЅРёР»</label><select id="orderSearchLastUpdatedBy" style="max-width:160px">' + userOpts + '</select></div><button type="button" class="btn btn-primary" id="orderSearchBtn">РќР°Р№С‚Рё</button> <button type="button" class="btn btn-secondary" id="orderSearchSavePreset">РЎРѕС…СЂР°РЅРёС‚СЊ РІР°СЂРёР°РЅС‚</button>';
          document.getElementById('orderSearchBtn').onclick = runOrderSearch;
          document.getElementById('orderSearchPreset').onchange = function () {
            var idx = this.value;
            if (idx === '') return;
            var pr = presets[parseInt(idx, 10)];
            if (pr && pr.filters) { setOrderSearchFilters(pr.filters); runOrderSearch(); }
          };
          document.getElementById('orderSearchSavePreset').onclick = function () {
            var name = prompt('РќР°Р·РІР°РЅРёРµ РІР°СЂРёР°РЅС‚Р° РїРѕРёСЃРєР° (РЅР°РїСЂРёРјРµСЂ: РњРѕРё Р·Р°РєР°Р·С‹)');
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
          if (savedFilters) { setOrderSearchFilters(savedFilters); runOrderSearch(); } else { tableDiv.innerHTML = '<p style="color:#666">РЈРєР°Р¶РёС‚Рµ РєСЂРёС‚РµСЂРёРё РїРѕРёСЃРєР° Рё РЅР°Р¶РјРёС‚Рµ В«РќР°Р№С‚РёВ» РёР»Рё РІС‹Р±РµСЂРёС‚Рµ СЃРѕС…СЂР°РЅС‘РЅРЅС‹Р№ РІР°СЂРёР°РЅС‚.</p>'; }
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
          searchRow.innerHTML = '<button type="button" class="btn btn-primary" id="orderSearchBtn">Р—Р°РіСЂСѓР·РёС‚СЊ Р·Р°РєР°Р·С‹</button>';
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
          var custOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р° вЂ”</option>';
          customers.forEach(function (c) { var s = (sel.cust != null && String(sel.cust) === String(c.id)) ? ' selected' : ''; custOpts += '<option value="' + (c.id != null ? c.id : '') + '"' + s + '>' + escAttr((c.name_client || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          if (!statuses || !statuses.length) statuses = [{ code: 'open', name: 'РћС‚РєСЂС‹С‚' }, { code: 'cancelled', name: 'РћС‚РјРµРЅС‘РЅ' }];
          statuses = statuses.slice().sort(function (a, b) { return (a.name || a.code || '').localeCompare(b.name || b.code || ''); });
          var statusOpts = ''; statuses.forEach(function (s) { var o = (s.code === sel.status) ? ' selected' : ''; statusOpts += '<option value="' + escAttr(s.code) + '"' + o + '>' + escAttr(s.name || s.code) + '</option>'; });
          var payOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ С‚РёРї РѕРїР»Р°С‚С‹ вЂ”</option>'; paymentTypes.forEach(function (pt) { var o = (pt.code === sel.payment) ? ' selected' : ''; payOpts += '<option value="' + escAttr(pt.code) + '"' + o + '>' + escAttr(pt.name || pt.code) + '</option>'; });
          var productOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ С‚РѕРІР°СЂ вЂ”</option>';
          products.forEach(function (p) { productOpts += '<option value="' + escAttr(p.code) + '" data-price="' + (p.price != null ? p.price : '') + '">' + escAttr((p.code || '') + ' вЂ” ' + (p.name || '')) + '</option>'; });
          var agentOpts = '<option value="">вЂ” РќРµ РЅР°Р·РЅР°С‡РµРЅ вЂ”</option>';
          var expeditorOpts = '<option value="">вЂ” РќРµ РЅР°Р·РЅР°С‡РµРЅ вЂ”</option>';
          userList.forEach(function (u) {
            var oAgent = (u.login === sel.agent) ? ' selected' : '';
            agentOpts += '<option value="' + escAttr(u.login) + '"' + oAgent + '>' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>';
            if ((u.role || '').toLowerCase() === 'expeditor') {
              var oExp = (u.login === sel.exp) ? ' selected' : '';
              expeditorOpts += '<option value="' + escAttr(u.login) + '"' + oExp + '>' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>';
            }
          });
          var content = document.getElementById('content');
          if (!content) return;
          content.innerHTML = '<div class="card"><h2 id="orderFormTitle">РЎРѕР·РґР°РЅРёРµ Р·Р°РєР°Р·Р°</h2><div id="orderCreateErr" class="err" style="margin-bottom:12px"></div><div id="orderFormMsg" class="msg" style="margin-bottom:12px;display:none"></div><div class="form-group"><label>РљР»РёРµРЅС‚</label><select id="orderCreateCustomer">' + custOpts + '</select></div><div class="form-group"><label>РђРіРµРЅС‚</label><select id="orderCreateAgent">' + agentOpts + '</select></div><div class="form-group"><label>Р­РєСЃРїРµРґРёС‚РѕСЂ</label><select id="orderCreateExpeditor">' + expeditorOpts + '</select></div><div class="form-group"><label>РЎС‚Р°С‚СѓСЃ</label><select id="orderCreateStatus">' + statusOpts + '</select></div><div class="form-group"><label>РўРёРї РѕРїР»Р°С‚С‹</label><select id="orderCreatePaymentType">' + payOpts + '</select></div><div class="form-group"><label>РќР°Р·РЅР°С‡РµРЅРЅР°СЏ РґР°С‚Р° РїРѕСЃС‚Р°РІРєРё</label><input type="text" id="orderScheduledDelivery" placeholder="РґРґ.РјРј.РіРіРіРі С‡С‡:РјРј" autocomplete="off"></div><div class="form-group"><label>РџРѕР·РёС†РёРё Р·Р°РєР°Р·Р°</label></div><div style="overflow-x:auto"><table><thead><tr><th>РўРѕРІР°СЂ</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ</th><th>Р¦РµРЅР°</th><th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody id="orderCreateItemsBody"></tbody></table></div><p style="margin:12px 0"><button type="button" class="btn btn-secondary" id="orderAddRow">Р”РѕР±Р°РІРёС‚СЊ РїРѕР·РёС†РёСЋ</button></p><div class="form-group"><label>РЎСѓРјРјР°</label><div id="orderCreateSum" style="padding:6px 0;font-weight:600">0</div></div><p><button type="button" class="btn btn-primary" id="orderCreateSave">РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РєР°Р·</button> <button type="button" class="btn btn-secondary" id="orderCreateCancel">РћС‚РјРµРЅР°</button></p><div style="margin-top:24px;padding:12px;background:#f8f9fa;border-radius:6px"><div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;color:#666">Р”Р°С‚Р° СЃРѕР·РґР°РЅРёСЏ Р·Р°РєР°Р·Р°</label><div id="orderOrderDate" class="form-readonly">вЂ”</div></div><div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;color:#666">РџРµСЂРµРІРѕРґ РІ СЃС‚Р°С‚СѓСЃ В«Р”РѕСЃС‚Р°РІРєР°В»</label><div id="orderStatusDeliveryAt" class="form-readonly">вЂ”</div></div><div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;color:#666">Р”Р°С‚Р° Рё РІСЂРµРјСЏ Р·Р°РєСЂС‹С‚РёСЏ Р·Р°РєР°Р·Р°</label><div id="orderClosedAt" class="form-readonly">вЂ”</div></div><div class="form-group" style="margin-bottom:8px"><label style="font-size:12px;color:#666">Р”Р°С‚Р° РїРѕСЃР»РµРґРЅРµРіРѕ РёР·РјРµРЅРµРЅРёСЏ</label><div id="orderLastUpdatedAt" class="form-readonly">вЂ”</div></div><div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:#666">РљС‚Рѕ РёР·РјРµРЅРёР»</label><div id="orderLastUpdatedBy" class="form-readonly">вЂ”</div></div></div></div>';
          document.getElementById('orderFormTitle').textContent = isEdit ? ('Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ Р·Р°РєР°Р·Р° в„– ' + orderId) : 'РЎРѕР·РґР°РЅРёРµ Р·Р°РєР°Р·Р°';
          function formatDateTashkent(isoStr) {
            if (!isoStr) return 'вЂ”';
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
            document.getElementById('orderLastUpdatedBy').textContent = orderData.last_updated_by || 'вЂ”';
          } else {
            document.getElementById('orderOrderDate').textContent = 'вЂ”';
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
            tr.innerHTML = '<td><select class="order-item-product" style="min-width:220px">' + productOpts + '</select></td><td><input type="number" min="1" class="order-item-qty" value="' + qty + '" style="width:80px"></td><td><input type="number" step="0.01" min="0" class="order-item-price" placeholder="РїРѕ РїСЂР°Р№СЃСѓ" value="' + priceStr + '" style="width:100px"></td><td><button type="button" class="btn btn-secondary btn-small order-item-del">РЈРґР°Р»РёС‚СЊ</button></td>';
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
            var isDeliveryStatus = ['2', 'delivery', 'РґРѕСЃС‚Р°РІРєР°'].indexOf(statusCodeLower) >= 0 || /РґРѕСЃС‚Р°РІ|deliver|shipping/.test((statusLabel + ' ' + statusCodeLower).toLowerCase());
            var payment_type_code = document.getElementById('orderCreatePaymentType').value || null;
            if (!customer_id) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р°.'; return; }
            var rows = tbody.querySelectorAll('tr');
            var items = []; var total = 0;
            for (var i = 0; i < rows.length; i++) {
              var product = rows[i].querySelector('.order-item-product').value;
              var qty = parseInt(rows[i].querySelector('.order-item-qty').value, 10) || 0;
              var priceVal = rows[i].querySelector('.order-item-price').value.trim();
              var price = priceVal !== '' ? parseFloat(priceVal) : null;
              if (product && qty > 0) { items.push({ product_code: product, quantity: qty, price: price, itemId: rows[i].getAttribute('data-item-id') || null }); total += qty * (price || 0); }
            }
            if (!items.length) { if (errEl) errEl.textContent = 'Р”РѕР±Р°РІСЊС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРЅСѓ РїРѕР·РёС†РёСЋ СЃ С‚РѕРІР°СЂРѕРј Рё РєРѕР»РёС‡РµСЃС‚РІРѕРј.'; return; }
            function errText(e) {
              if (!e) return 'РќРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°';
              var d = e.data;
              if (d && d.detail !== undefined) {
                if (typeof d.detail === 'string') return d.detail;
                if (Array.isArray(d.detail)) return d.detail.map(function (x) { return x.msg || x.message || JSON.stringify(x); }).join(' ');
                return JSON.stringify(d.detail);
              }
              if (d) return JSON.stringify(d);
              return (e.message || e.status || 'РћС€РёР±РєР° СЃРѕРµРґРёРЅРµРЅРёСЏ РёР»Рё СЃРµСЂРІРµСЂР°') + '';
            }
            var login_agent = document.getElementById('orderCreateAgent').value || null;
            var login_expeditor = document.getElementById('orderCreateExpeditor').value || null;
            var schedInput = document.getElementById('orderScheduledDelivery');
            var schedRaw = schedInput && schedInput.value ? schedInput.value.trim() : '';
            if (isDeliveryStatus && !schedRaw) {
              if (errEl) errEl.textContent = 'Р”Р»СЏ СЃС‚Р°С‚СѓСЃР° В«Р”РѕСЃС‚Р°РІРєР°В» СѓРєР°Р¶РёС‚Рµ В«РќР°Р·РЅР°С‡РµРЅРЅР°СЏ РґР°С‚Р° РїРѕСЃС‚Р°РІРєРёВ».';
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
              if (errEl) errEl.textContent = 'РќРµРєРѕСЂСЂРµРєС‚РЅР°СЏ РґР°С‚Р° РїРѕСЃС‚Р°РІРєРё. Р’С‹Р±РµСЂРёС‚Рµ РґР°С‚Сѓ РёР· РєР°Р»РµРЅРґР°СЂСЏ.';
              return;
            }
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            function doneSuccess() {
              if (msgEl) { msgEl.textContent = 'Р—Р°РєР°Р· СЃРѕС…СЂР°РЅС‘РЅ.'; msgEl.style.display = 'block'; }
              setTimeout(function () { loadSectionOrders(); }, 1500);
            }
            function doneError(e) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РєР°Р·';
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
                if (!newOrderId) { doneError({ data: { detail: 'Р—Р°РєР°Р· РЅРµ СЃРѕР·РґР°РЅ.' } }); return; }
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
              var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) || 'РћС€РёР±РєР°';
              var content = document.getElementById('content');
              if (content) content.innerHTML = '<div class="card"><h2>Р—Р°РєР°Р·С‹</h2><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РґР°РЅРЅС‹С… РґР»СЏ СЃРѕР·РґР°РЅРёСЏ Р·Р°РєР°Р·Р°: ' + msg + '</p><p><button type="button" class="btn btn-secondary" id="orderBackToList">Р’РµСЂРЅСѓС‚СЊСЃСЏ Рє СЃРїРёСЃРєСѓ</button> <button type="button" class="btn btn-primary" id="orderAdd">РЎРѕР·РґР°С‚СЊ Р·Р°РєР°Р·</button></p><div id="sectionTable"></div></div>';
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
        content.innerHTML = '<div class="card"><h2>РџРѕР·РёС†РёРё Р·Р°РєР°Р·РѕРІ</h2><p style="margin:0 0 12px 0">' + (isAdmin() ? '<button type="button" class="btn btn-secondary" id="orderItemsExport">РЎРєР°С‡Р°С‚СЊ РїРѕР·РёС†РёРё РІ Excel</button>' : '') + '</p><div class="form-group" style="margin:12px 0"><label>РџРѕРёСЃРє РїРѕР·РёС†РёР№ Р·Р°РєР°Р·РѕРІ</label></div><div id="orderItemsSearchRow" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"></div><div id="sectionOrderItemsErr" class="err"></div><div id="orderItemsInfo" style="margin:12px 0;padding:8px;background:#f8f9fa;border-radius:4px;font-size:13px"></div><div id="orderItemsTable"></div><div id="orderItemsPagination" style="margin-top:16px;display:flex;justify-content:center;align-items:center;gap:8px"></div></div>';
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
          if (sc === 'completed' || sc === 'cancelled' || sc === 'canceled' || sc === 'РѕС‚РјРµРЅРµРЅ' || sc === 'Р·Р°РІРµСЂС€РµРЅ' || sc === 'closed' || sc === '4' || (sc.length && sc.charAt(0) === '4') || sc.indexOf('РѕС‚РјРµРЅРµРЅ') !== -1) return text;
          try {
            var d = parseBackendDate(isoStr);
            if (!d) return text;
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            d.setHours(0, 0, 0, 0);
            if (d < today) return '<span style="color:#c00;font-weight:bold" title="РџСЂРѕСЃСЂРѕС‡РµРЅР°">' + text + '</span>';
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
            infoDiv.innerHTML = '<strong>РќР°Р№РґРµРЅРѕ РїРѕР·РёС†РёР№:</strong> ' + totalCount + ' | <strong>РџРѕРєР°Р·Р°РЅРѕ:</strong> ' + (totalCount > 0 ? start + '-' + end : '0') + ' | <strong>РћР±С‰Р°СЏ СЃСѓРјРјР°:</strong> ' + totalAmount.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' СЃСѓРј';
          }
          
          if (!list || !list.length) { 
            tableDiv.innerHTML = '<p>РџРѕР·РёС†РёРё Р·Р°РєР°Р·РѕРІ РЅРµ РЅР°Р№РґРµРЅС‹. РР·РјРµРЅРёС‚Рµ РєСЂРёС‚РµСЂРёРё РїРѕРёСЃРєР°.</p>'; 
            if (paginationDiv) paginationDiv.innerHTML = '';
            if (infoDiv && totalCount === 0) {
              infoDiv.innerHTML = '<strong>РќР°Р№РґРµРЅРѕ РїРѕР·РёС†РёР№:</strong> 0 | <strong>РџРѕРєР°Р·Р°РЅРѕ:</strong> 0 | <strong>РћР±С‰Р°СЏ СЃСѓРјРјР°:</strong> 0,00 СЃСѓРј';
            }
            return; 
          }
          
          var sorted = list.slice().sort(function (a, b) {
            return tableSortCompare(a, b, oiSortCol, oiSortDir, function (r, c) {
              if (c === 'quantity' || c === 'price' || c === 'amount') { var v = r[c] != null ? r[c] : (c === 'amount' ? ((r.quantity || 0) * (r.price != null ? r.price : 0)) : ''); return (v !== '' && v != null ? String(Number(v)).padStart(20, '0') : ''); }
              return (r[c] || '').toString().toLowerCase();
            });
          });
          var arrow = oiSortDir > 0 ? ' в–І' : ' в–ј';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (oiSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr><th>Р—Р°РєР°Р·</th>' + th('order_no', 'в„– Р·Р°РєР°Р·Р°') + th('customer_name', 'РљР»РёРµРЅС‚') + th('order_date', 'Р”Р°С‚Р° Р·Р°РєР°Р·Р°') + th('status_code', 'РЎС‚Р°С‚СѓСЃ') + th('payment_type_name', 'РўРёРї РѕРїР»Р°С‚С‹') + th('product_code', 'РљРѕРґ С‚РѕРІР°СЂР°') + th('product_name', 'РўРѕРІР°СЂ') + th('quantity', 'РљРѕР»РёС‡РµСЃС‚РІРѕ') + th('price', 'Р¦РµРЅР°') + th('amount', 'РЎСѓРјРјР°') + th('login_agent', 'РђРіРµРЅС‚') + th('login_expeditor', 'Р­РєСЃРїРµРґРёС‚РѕСЂ') + th('scheduled_delivery_at', 'Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё') + '<th>РџРµСЂРµРІРѕРґ РІ СЃС‚Р°С‚СѓСЃ В«Р”РѕСЃС‚Р°РІРєР°В»</th><th>Р”Р°С‚Р° Р·Р°РєСЂС‹С‚РёСЏ</th>' + th('order_last_updated_at', 'РџРѕСЃР»РµРґРЅРµРµ РёР·РјРµРЅРµРЅРёРµ Р·Р°РєР°Р·Р°') + th('order_last_updated_by', 'РљС‚Рѕ РёР·РјРµРЅРёР»') + '</tr></thead><tbody>';
          sorted.forEach(function (r) {
            var amt = (r.amount != null ? r.amount : ((r.quantity || 0) * (r.price != null ? r.price : 0)));
            var orderNo = (r.order_no != null ? r.order_no : '');
            t += '<tr><td><button type="button" class="btn btn-secondary btn-small" data-order-open data-order-no="' + escAttr(orderNo) + '" title="РћС‚РєСЂС‹С‚СЊ Р·Р°РєР°Р·">рџ“‹</button></td><td>' + orderNo + '</td><td>' + escAttr(r.customer_name || (r.customer_id != null ? 'ID ' + r.customer_id : '')) + '</td><td>' + formatDateTashkent(r.order_date) + '</td><td>' + formatStatusBadge(r.status_code, r.status_name) + '</td><td>' + escAttr(r.payment_type_name || r.payment_type_code || '') + '</td><td>' + escAttr(r.product_code || '') + '</td><td>' + escAttr(r.product_name || '') + '</td><td>' + (r.quantity != null ? r.quantity : '') + '</td><td>' + (r.price != null ? r.price : '') + '</td><td>' + (amt != null ? amt : '') + '</td><td>' + escAttr(r.login_agent || '') + '</td><td>' + escAttr(r.login_expeditor || '') + '</td><td>' + formatScheduledDeliveryOi(r.scheduled_delivery_at, r.status_code) + '</td><td>' + formatDateTashkent(r.status_delivery_at) + '</td><td>' + formatDateTashkent(r.closed_at) + '</td><td>' + formatDateTashkent(r.order_last_updated_at) + '</td><td>' + escAttr(r.order_last_updated_by || '') + '</td></tr>';
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
          // РџР°РіРёРЅР°С†РёСЏ
          if (paginationDiv && totalCount > pageSize) {
            var totalPages = Math.ceil(totalCount / pageSize);
            var pagHtml = '';
            if (currentPage > 1) {
              pagHtml += '<button type="button" class="btn btn-secondary btn-small" id="orderItemsPagePrev">вЂ№ РџСЂРµРґС‹РґСѓС‰Р°СЏ</button>';
            }
            pagHtml += '<span style="padding:0 12px">РЎС‚СЂР°РЅРёС†Р° ' + currentPage + ' РёР· ' + totalPages + '</span>';
            if (currentPage < totalPages) {
              pagHtml += '<button type="button" class="btn btn-secondary btn-small" id="orderItemsPageNext">РЎР»РµРґСѓСЋС‰Р°СЏ вЂє</button>';
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
            if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РїРѕР·РёС†РёР№ Р·Р°РєР°Р·РѕРІ.';
            tableDiv.innerHTML = '<p>РЎРїРёСЃРѕРє РїРѕР·РёС†РёР№ РЅРµ Р·Р°РіСЂСѓР¶РµРЅ.</p>';
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
            }).catch(function (e) { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё: ' + (e && e.data && e.data.detail ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : e.message || 'РћС€РёР±РєР°')); });
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
          if (!statuses.length) statuses = [{ code: 'open', name: 'РћС‚РєСЂС‹С‚' }, { code: 'cancelled', name: 'РћС‚РјРµРЅС‘РЅ' }];
          statuses = statuses.slice().sort(function (a, b) { return (a.name || a.code || '').localeCompare(b.name || b.code || ''); });
          var statusOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>'; statuses.forEach(function (s) { statusOpts += '<option value="' + escAttr(s.code) + '">' + escAttr(s.name || s.code) + '</option>'; });
          var userOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
          var expeditorUserOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
          userList.forEach(function (u) {
            var optHtml = '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>';
            userOpts += optHtml;
            if ((u.role || '').toLowerCase() === 'expeditor') expeditorUserOpts += optHtml;
          });
          var custOpts = '<option value="">вЂ” Р›СЋР±РѕР№ вЂ”</option>'; customers.forEach(function (c) { custOpts += '<option value="' + (c.id != null ? c.id : '') + '">' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          searchRow.innerHTML = '<div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РљР»РёРµРЅС‚</label><select id="orderItemsSearchCustomerId" style="max-width:220px">' + custOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РЎС‚Р°С‚СѓСЃ</label><select id="orderItemsSearchStatus" style="max-width:140px">' + statusOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё СЃ</label><input type="text" id="orderItemsSearchDateFrom" style="max-width:130px" placeholder="РґРґ.РјРј.РіРіРіРі"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РїРѕ</label><input type="text" id="orderItemsSearchDateTo" style="max-width:130px" placeholder="РґРґ.РјРј.РіРіРіРі"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РђРіРµРЅС‚</label><select id="orderItemsSearchAgent" style="max-width:160px">' + userOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Р­РєСЃРїРµРґРёС‚РѕСЂ</label><select id="orderItemsSearchExpeditor" style="max-width:160px">' + expeditorUserOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РљС‚Рѕ РёР·РјРµРЅРёР»</label><select id="orderItemsSearchLastUpdatedBy" style="max-width:160px">' + userOpts + '</select></div><button type="button" class="btn btn-primary" id="orderItemsSearchBtn">РќР°Р№С‚Рё</button>';
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
          tableDiv.innerHTML = '<p style="color:#666">РЈРєР°Р¶РёС‚Рµ РєСЂРёС‚РµСЂРёРё РїРѕРёСЃРєР° Рё РЅР°Р¶РјРёС‚Рµ В«РќР°Р№С‚РёВ».</p>';
          var infoDiv = document.getElementById('orderItemsInfo');
          var paginationDiv = document.getElementById('orderItemsPagination');
          if (infoDiv) infoDiv.innerHTML = '';
          if (paginationDiv) paginationDiv.innerHTML = '';
        }).catch(function () {
          searchRow.innerHTML = '<button type="button" class="btn btn-primary" id="orderItemsSearchBtn">Р—Р°РіСЂСѓР·РёС‚СЊ РїРѕР·РёС†РёРё</button>';
          document.getElementById('orderItemsSearchBtn').onclick = runSearch;
        });
      }

      function loadSectionOperations(showCreate, openCreateForm) {
        var content = document.getElementById('content');
        if (!content) return;
        var canCreate = (typeof showCreate === 'boolean') ? showCreate : true;
        var addBtn = (isAdmin() && canCreate) ? '<button type="button" class="btn btn-primary" id="opAdd">РЎРѕР·РґР°С‚СЊ РѕРїРµСЂР°С†РёСЋ</button>' : '';
        var exportBtn = isAdmin() ? ' <button type="button" class="btn btn-secondary" id="opExport">РЎРєР°С‡Р°С‚СЊ РІ Excel</button>' : '';
        content.innerHTML = '<div class="card"><h2>РћРїРµСЂР°С†РёРё</h2><p style="margin:0 0 12px 0">' + addBtn + exportBtn + '</p><div class="form-group" style="margin:12px 0"><label>РџРѕРёСЃРє РѕРїРµСЂР°С†РёР№</label></div><div id="opSearchRow" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"></div><div id="opSectionErr" class="err"></div><div id="opSectionTable"></div></div>';
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
          }).catch(function (e) { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё: ' + (e && e.data && e.data.detail ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : e.message || 'РћС€РёР±РєР°')); });
        };
        function formatDateOp(isoStr) {
          if (!isoStr) return '';
          try { var d = new Date(isoStr); return d.toLocaleDateString('ru-RU'); } catch (e) { return isoStr; }
        }
        function operationStatusRu(code) {
          var m = { pending: 'Р’ РѕР¶РёРґР°РЅРёРё', completed: 'Р’С‹РїРѕР»РЅРµРЅРѕ', cancelled: 'РћС‚РјРµРЅРµРЅРѕ', canceled: 'РћС‚РјРµРЅРµРЅРѕ' };
          return m[(code || '').toString().toLowerCase()] || (code || '');
        }
        var opSortCol = 'operation_number';
        var opSortDir = 1;
        var lastOpList = null;
        function renderOpTable(list) {
          if (errDiv) errDiv.textContent = '';
          list = asList(list);
          lastOpList = list;
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РћРїРµСЂР°С†РёР№ РЅРµ РЅР°Р№РґРµРЅРѕ. РР·РјРµРЅРёС‚Рµ РєСЂРёС‚РµСЂРёРё РїРѕРёСЃРєР° РёР»Рё СЃРѕР·РґР°Р№С‚Рµ РѕРїРµСЂР°С†РёСЋ.</p>'; return; }
          var sorted = list.slice().sort(function (a, b) {
            return tableSortCompare(a, b, opSortCol, opSortDir, function (r, c) {
              if (c === 'quantity' || c === 'amount') return (r[c] != null && r[c] !== '' ? String(Number(r[c])).padStart(20, '0') : '');
              return (r[c] || (r.type_name || r.type_code) || (r.customer_name || (r.customer_id != null ? 'ID ' + r.customer_id : '')) || '').toString().toLowerCase();
            });
          });
          var arrow = opSortDir > 0 ? ' в–І' : ' в–ј';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (opSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr><th>Р”РµР№СЃС‚РІРёСЏ</th>' + th('operation_number', 'в„– РѕРїРµСЂР°С†РёРё') + th('operation_date', 'Р”Р°С‚Р°') + th('type_code', 'РўРёРї') + th('status', 'РЎС‚Р°С‚СѓСЃ') + th('customer_name', 'РљР»РёРµРЅС‚') + th('product_code', 'РўРѕРІР°СЂ') + th('quantity', 'РљРѕР»-РІРѕ') + th('amount', 'РЎСѓРјРјР°') + th('order_id', 'Р—Р°РєР°Р· в„–') + th('created_by', 'РљС‚Рѕ СЃРѕР·РґР°Р»') + '</tr></thead><tbody>';
          sorted.forEach(function (o) {
            t += '<tr><td><button type="button" class="btn btn-secondary btn-small" data-op-edit data-id="' + escAttr(o.id) + '">РР·РјРµРЅРёС‚СЊ</button></td><td>' + escAttr(o.operation_number || '') + '</td><td>' + formatDateOp(o.operation_date) + '</td><td>' + escAttr(o.type_name || o.type_code || '') + '</td><td>' + formatStatusBadge(o.status, (o.status_name_ru != null && o.status_name_ru !== '') ? o.status_name_ru : operationStatusRu(o.status)) + '</td><td>' + escAttr(o.customer_name || (o.customer_id != null ? 'ID ' + o.customer_id : '')) + '</td><td>' + escAttr(o.product_code || '') + '</td><td>' + (o.quantity != null ? o.quantity : '') + '</td><td>' + (o.amount != null ? o.amount : '') + '</td><td>' + (o.order_id != null ? o.order_id : '') + '</td><td>' + escAttr(o.created_by || '') + '</td></tr>';
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
                  // РџСЂРё СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРё РїРѕРєР°Р·С‹РІР°РµРј РІСЃРµ С‚РёРїС‹ (РІРєР»СЋС‡Р°СЏ РЅРµР°РєС‚РёРІРЅС‹Рµ), С‡С‚РѕР±С‹ РјРѕР¶РЅРѕ Р±С‹Р»Рѕ СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРµ РѕРїРµСЂР°С†РёРё
                  // РќРѕ РµСЃР»Рё РѕРїРµСЂР°С†РёСЏ РёСЃРїРѕР»СЊР·СѓРµС‚ РЅРµР°РєС‚РёРІРЅС‹Р№ С‚РёРї, РѕРЅ РІСЃС‘ СЂР°РІРЅРѕ Р±СѓРґРµС‚ РґРѕСЃС‚СѓРїРµРЅ
                  openOperationForm(true, opId, opData, types, results[1] || [], results[2] || [], results[3] || [], results[4] || [], results[5] || []);
                });
              }).catch(function (e) {
                if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РѕРїРµСЂР°С†РёСЋ.';
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
            if (errDiv) errDiv.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РѕРїРµСЂР°С†РёР№.';
            tableDiv.innerHTML = '<p>РЎРїРёСЃРѕРє РЅРµ Р·Р°РіСЂСѓР¶РµРЅ.</p>';
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
          // Р¤РёР»СЊС‚СЂСѓРµРј С‚РѕР»СЊРєРѕ Р°РєС‚РёРІРЅС‹Рµ С‚РёРїС‹ РѕРїРµСЂР°С†РёР№ РґР»СЏ С„РёР»СЊС‚СЂРѕРІ
          var activeTypes = types.filter(function(ty) { return ty.active !== false; });
          var typeOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>'; activeTypes.forEach(function (ty) { typeOpts += '<option value="' + escAttr(ty.code) + '">' + escAttr(ty.name || ty.code) + '</option>'; });
          var statusOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option><option value="pending">Р’ РѕР¶РёРґР°РЅРёРё</option><option value="completed">Р’С‹РїРѕР»РЅРµРЅРѕ</option><option value="cancelled">РћС‚РјРµРЅРµРЅРѕ</option>';
          var custOpts = '<option value="">вЂ” Р›СЋР±РѕР№ вЂ”</option>'; customers.forEach(function (c) { custOpts += '<option value="' + (c.id != null ? c.id : '') + '">' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          var prodOpts = '<option value="">вЂ” Р›СЋР±РѕР№ вЂ”</option>'; products.forEach(function (p) { prodOpts += '<option value="' + escAttr(p.code) + '">' + escAttr((p.code || '') + ' вЂ” ' + (p.name || '')) + '</option>'; });
          var userOpts = '<option value="">вЂ” Р’СЃРµ вЂ”</option>'; userList.forEach(function (u) { userOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>'; });
          searchRow.innerHTML = '<div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РўРёРї</label><select id="opSearchType" style="max-width:160px">' + typeOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РЎС‚Р°С‚СѓСЃ</label><select id="opSearchStatus" style="max-width:100px">' + statusOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РљР»РёРµРЅС‚</label><select id="opSearchCustomerId" style="max-width:220px">' + custOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РўРѕРІР°СЂ</label><select id="opSearchProduct" style="max-width:200px">' + prodOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Р”Р°С‚Р° СЃ</label><input type="text" id="opSearchDateFrom" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:130px"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РїРѕ</label><input type="text" id="opSearchDateTo" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:130px"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РљС‚Рѕ СЃРѕР·РґР°Р»</label><select id="opSearchCreatedBy" style="max-width:160px">' + userOpts + '</select></div><button type="button" class="btn btn-primary" id="opSearchBtn">РќР°Р№С‚Рё</button>';
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
          tableDiv.innerHTML = '<p style="color:#666">РЈРєР°Р¶РёС‚Рµ РєСЂРёС‚РµСЂРёРё РїРѕРёСЃРєР° Рё РЅР°Р¶РјРёС‚Рµ В«РќР°Р№С‚РёВ» РёР»Рё РѕСЃС‚Р°РІСЊС‚Рµ РїРѕР»СЏ РїСѓСЃС‚С‹РјРё Рё РЅР°Р¶РјРёС‚Рµ В«РќР°Р№С‚РёВ» РґР»СЏ РїРѕР»РЅРѕРіРѕ СЃРїРёСЃРєР°. РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ Р·Р°РїСЂРѕСЃ РЅРµ РІС‹РїРѕР»РЅСЏРµС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё.</p>';
          if (openCreateForm && window.openOperationCreate) {
            window.openOperationCreate();
          }
        }).catch(function () {
          searchRow.innerHTML = '<button type="button" class="btn btn-primary" id="opSearchBtn">Р—Р°РіСЂСѓР·РёС‚СЊ РѕРїРµСЂР°С†РёРё</button>';
          document.getElementById('opSearchBtn').onclick = runOpSearch;
        });
        function openOperationForm(isEdit, operationId, opData, types, customers, products, warehouses, paymentTypes, userList) {
          warehouses = warehouses || []; paymentTypes = paymentTypes || []; userList = userList || [];
          var sel = isEdit && opData ? { type_code: opData.type_code || '', customer_id: opData.customer_id != null ? String(opData.customer_id) : '', product_code: opData.product_code || '', quantity: opData.quantity != null ? opData.quantity : '', amount: opData.amount != null ? opData.amount : '', comment: opData.comment || '', order_id: opData.order_id != null ? opData.order_id : '', operation_date: opData.operation_date ? opData.operation_date.slice(0, 10) : '', warehouse_from: opData.warehouse_from || '', warehouse_to: opData.warehouse_to || '', payment_type_code: opData.payment_type_code || '', status: opData.status || 'pending', expeditor_login: opData.expeditor_login || '', cashier_login: opData.cashier_login || '', storekeeper_login: opData.storekeeper_login || '' } : { type_code: '', customer_id: '', product_code: '', quantity: '1', amount: '', comment: '', order_id: '', operation_date: new Date().toISOString().slice(0, 10), warehouse_from: '', warehouse_to: '', payment_type_code: '', status: 'pending', expeditor_login: '', cashier_login: '', storekeeper_login: '' };
          // Р¤РёР»СЊС‚СЂСѓРµРј С‚РѕР»СЊРєРѕ Р°РєС‚РёРІРЅС‹Рµ С‚РёРїС‹ РѕРїРµСЂР°С†РёР№, РЅРѕ РїСЂРё СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРё РґРѕР±Р°РІР»СЏРµРј С‚РµРєСѓС‰РёР№ С‚РёРї РѕРїРµСЂР°С†РёРё (РґР°Р¶Рµ РµСЃР»Рё РЅРµР°РєС‚РёРІРµРЅ)
          var activeTypes = types.filter(function(ty) { return ty.active !== false; });
          if (isEdit && opData && opData.type_code) {
            var currentType = types.find(function(ty) { return ty.code === opData.type_code; });
            if (currentType && currentType.active === false) {
              // Р”РѕР±Р°РІР»СЏРµРј С‚РµРєСѓС‰РёР№ С‚РёРї РѕРїРµСЂР°С†РёРё, РґР°Р¶Рµ РµСЃР»Рё РѕРЅ РЅРµР°РєС‚РёРІРµРЅ (С‡С‚РѕР±С‹ РјРѕР¶РЅРѕ Р±С‹Р»Рѕ СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ СЃСѓС‰РµСЃС‚РІСѓСЋС‰СѓСЋ РѕРїРµСЂР°С†РёСЋ)
              activeTypes.push(currentType);
            }
          }
          var typeOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ С‚РёРї вЂ”</option>'; activeTypes.forEach(function (ty) { var o = (ty.code === sel.type_code) ? ' selected' : ''; typeOpts += '<option value="' + escAttr(ty.code) + '"' + o + '>' + escAttr(ty.name || ty.code) + '</option>'; });
          var custOpts = '<option value="">вЂ” РќРµ СѓРєР°Р·Р°РЅ вЂ”</option>'; customers.forEach(function (c) { var o = (String(c.id) === sel.customer_id) ? ' selected' : ''; custOpts += '<option value="' + (c.id != null ? c.id : '') + '"' + o + '>' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          var prodOpts = '<option value="">вЂ” РќРµ СѓРєР°Р·Р°РЅ вЂ”</option>'; products.forEach(function (p) { var o = (p.code === sel.product_code) ? ' selected' : ''; prodOpts += '<option value="' + escAttr(p.code) + '"' + o + '>' + escAttr((p.code || '') + ' вЂ” ' + (p.name || '')) + '</option>'; });
          var whOpts = '<option value="">вЂ” РќРµ СѓРєР°Р·Р°РЅ вЂ”</option>'; warehouses.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var payOpts = '<option value="">вЂ” РќРµ СѓРєР°Р·Р°РЅ вЂ”</option>'; paymentTypes.forEach(function (pt) { var o = (pt.code === sel.payment_type_code) ? ' selected' : ''; payOpts += '<option value="' + escAttr(pt.code) + '"' + o + '>' + escAttr(pt.name || pt.code) + '</option>'; });
          var statusOpts = '<option value="pending"' + (sel.status === 'pending' ? ' selected' : '') + '>Р’ РѕР¶РёРґР°РЅРёРё</option><option value="completed"' + (sel.status === 'completed' ? ' selected' : '') + '>Р’С‹РїРѕР»РЅРµРЅРѕ</option><option value="cancelled"' + (sel.status === 'cancelled' ? ' selected' : '') + '>РћС‚РјРµРЅРµРЅРѕ</option>';
          var userOpts = '<option value="">вЂ” РќРµ СѓРєР°Р·Р°РЅ вЂ”</option>'; userList.forEach(function (u) { userOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>'; });
          var content = document.getElementById('content');
          if (!content) return;
          var statusBlock = isEdit ? ('<div class="form-group" id="opFormStatusBlock"><label>РЎС‚Р°С‚СѓСЃ</label><select id="opCreateStatus">' + statusOpts + '</select></div>') : '';
          content.innerHTML = '<div class="card"><h2 id="opFormTitle">РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё</h2><div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div><div class="form-group"><label>Р”Р°С‚Р° РѕРїРµСЂР°С†РёРё</label><input type="text" id="opCreateDate" placeholder="РґРґ.РјРј.РіРіРіРі" autocomplete="off"></div><div class="form-group"><label>РўРёРї РѕРїРµСЂР°С†РёРё</label><select id="opCreateType" required>' + typeOpts + '</select></div>' + statusBlock + '<div class="form-group"><label>РЎРєР»Р°Рґ РѕС‚</label><select id="opCreateWarehouseFrom">' + whOpts + '</select></div><div class="form-group"><label>РЎРєР»Р°Рґ РІ</label><select id="opCreateWarehouseTo">' + whOpts + '</select></div><div class="form-group"><label>РљР»РёРµРЅС‚</label><select id="opCreateCustomer">' + custOpts + '</select></div><div class="form-group"><label>РўРѕРІР°СЂ</label><select id="opCreateProduct">' + prodOpts + '</select></div><div class="form-group"><label>РљРѕР»РёС‡РµСЃС‚РІРѕ</label><input type="number" id="opCreateQuantity" min="0" placeholder="РЅРµРѕР±СЏР·."></div><div class="form-group"><label>РЎСѓРјРјР°</label><input type="number" id="opCreateAmount" step="0.01" placeholder="РЅРµРѕР±СЏР·."></div><div class="form-group"><label>РўРёРї РѕРїР»Р°С‚С‹</label><select id="opCreatePaymentType">' + payOpts + '</select></div><div class="form-group"><label>Р—Р°РєР°Р· в„–</label><input type="number" id="opCreateOrderId" placeholder="РЅРµРѕР±СЏР·." min="0"></div><div class="form-group"><label>Р­РєСЃРїРµРґРёС‚РѕСЂ</label><select id="opCreateExpeditor">' + userOpts + '</select></div><div class="form-group"><label>РљР°СЃСЃРёСЂ</label><select id="opCreateCashier">' + userOpts + '</select></div><div class="form-group"><label>РљР»Р°РґРѕРІС‰РёРє</label><select id="opCreateStorekeeper">' + userOpts + '</select></div><div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="opCreateComment" placeholder="РЅРµРѕР±СЏР·."></div><div style="margin-top:24px;padding:12px;background:#f8f9fa;border-radius:6px"><div class="form-group" style="margin-bottom:0"><label style="font-size:12px;color:#666">РљС‚Рѕ СЃРѕР·РґР°Р»</label><div id="opCreatedBy" class="form-readonly">вЂ”</div></div></div><p style="margin-top:16px"><button type="button" class="btn btn-primary" id="opCreateSave">РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёСЋ</button> <button type="button" class="btn btn-secondary" id="opCreateCancel">РћС‚РјРµРЅР°</button></p></div>';
          document.getElementById('opFormTitle').textContent = isEdit ? ('Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ ' + (opData.operation_number || operationId)) : 'РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё';
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
          if (isEdit && opData && opData.created_by) document.getElementById('opCreatedBy').textContent = opData.created_by; else document.getElementById('opCreatedBy').textContent = 'вЂ”';
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
            if (!type_code) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ С‚РёРї РѕРїРµСЂР°С†РёРё.'; return; }
            function errText(e) {
              if (!e) return 'РќРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°';
              var d = e.data;
              if (d && d.detail !== undefined) { if (typeof d.detail === 'string') return d.detail; if (Array.isArray(d.detail)) return d.detail.map(function (x) { return x.msg || x.message || JSON.stringify(x); }).join(' '); return JSON.stringify(d.detail); }
              if (d) return JSON.stringify(d);
              return (e.message || e.status || 'РћС€РёР±РєР°') + '';
            }
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            function doneSuccess() {
              if (msgEl) { msgEl.textContent = 'РћРїРµСЂР°С†РёСЏ СЃРѕС…СЂР°РЅРµРЅР°.'; msgEl.style.display = 'block'; }
              setTimeout(function () { loadSectionOperations(false); }, 1500);
            }
            function doneError(e) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёСЋ';
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
          var whOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ вЂ”</option>';
          warehouses.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var prodOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ С‚РѕРІР°СЂ вЂ”</option>';
          products.forEach(function (p) { prodOpts += '<option value="' + escAttr(p.code) + '">' + escAttr((p.code || '') + ' вЂ” ' + (p.name || '')) + '</option>'; });
          var formHtml = '<div class="card"><h2>РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё: ' + escAttr(config.operation_name || 'РџСЂРёС…РѕРґ РЅР° СЃРєР»Р°Рґ') + '</h2>';
          if (config.description) formHtml += '<p style="color:#666;margin-bottom:16px">' + escAttr(config.description) + '</p>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          var productsMap = {};
          products.forEach(function (p) { productsMap[p.code] = p; });
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ РІ <span style="color:#c00">*</span></label><select id="opWhReceiptWarehouseTo" required>' + whOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">РўРѕРІР°СЂС‹</h3><div style="overflow-x:auto"><table id="opWhReceiptItemsTable" style="width:100%"><thead><tr><th>РўРѕРІР°СЂ <span style="color:#c00">*</span></th><th>РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё <span style="color:#c00">*</span></th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ <span style="color:#c00">*</span></th><th>Р¦РµРЅР° (РёР· СЃРїСЂР°РІРѕС‡РЅРёРєР°)</th><th>РЎСѓРјРјР°</th><th>РљРѕРґ РїР°СЂС‚РёРё (Р°РІС‚Рѕ)</th><th></th></tr></thead><tbody id="opWhReceiptItemsBody"><tr class="op-wh-receipt-row"><td><select class="op-wh-receipt-product" required>' + prodOpts + '</select></td><td><input type="text" class="op-wh-receipt-expiry" placeholder="РґРґ.РјРј.РіРіРіРі" required autocomplete="off"></td><td><input type="number" class="op-wh-receipt-quantity" min="1" required></td><td class="op-wh-receipt-price" style="text-align:right;padding:8px;font-weight:600">вЂ”</td><td class="op-wh-receipt-sum" style="text-align:right;padding:8px;font-weight:600">вЂ”</td><td><input type="text" class="op-wh-receipt-batch" readonly style="background:#f0f0f0"></td><td><button type="button" class="btn btn-secondary btn-small op-wh-receipt-remove" style="display:none">РЈРґР°Р»РёС‚СЊ</button></td></tr></tbody><tfoot id="opWhReceiptItemsFooter"><tr style="background:#f8f9fa;font-weight:600"><td colspan="3" style="text-align:right;padding:10px">РС‚РѕРіРѕ:</td><td></td><td id="opWhReceiptTotalSum" style="text-align:right;padding:10px">0</td><td colspan="2"></td></tr></tfoot></table></div><button type="button" class="btn btn-secondary" id="opWhReceiptAddRow" style="margin-top:8px">+ Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ</button></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="opWhReceiptComment" placeholder="РЅРµРѕР±СЏР·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="opWhReceiptSave">РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёСЋ</button> <button type="button" class="btn btn-secondary" id="opWhReceiptCancel">РћС‚РјРµРЅР°</button></p></div>';
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
            priceCell.textContent = price > 0 ? price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' СЃСѓРј' : 'вЂ”';
            var sum = price * quantity;
            sumCell.textContent = sum > 0 ? sum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' СЃСѓРј' : 'вЂ”';
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
              totalSumEl.innerHTML = totalSum > 0 ? totalSum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' СЃСѓРј<br><small style="font-weight:normal;color:#666">(' + totalQty + ' С€С‚.)</small>' : '0';
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
            newRow.innerHTML = '<td><select class="op-wh-receipt-product" required>' + prodOpts + '</select></td><td><input type="text" class="op-wh-receipt-expiry" placeholder="РґРґ.РјРј.РіРіРіРі" required autocomplete="off"></td><td><input type="number" class="op-wh-receipt-quantity" min="1" required></td><td class="op-wh-receipt-price" style="text-align:right;padding:8px;font-weight:600">вЂ”</td><td class="op-wh-receipt-sum" style="text-align:right;padding:8px;font-weight:600">вЂ”</td><td><input type="text" class="op-wh-receipt-batch" readonly style="background:#f0f0f0"></td><td><button type="button" class="btn btn-secondary btn-small op-wh-receipt-remove">РЈРґР°Р»РёС‚СЊ</button></td>';
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
            if (!warehouseTo) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ'; return; }
            var rows = document.querySelectorAll('.op-wh-receipt-row');
            if (!rows.length) { if (errEl) errEl.textContent = 'Р”РѕР±Р°РІСЊС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРёРЅ С‚РѕРІР°СЂ'; return; }
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
            if (hasErrors) { if (errEl) errEl.textContent = 'Р—Р°РїРѕР»РЅРёС‚Рµ РІСЃРµ РїРѕР»СЏ РґР»СЏ РІСЃРµС… С‚РѕРІР°СЂРѕРІ'; return; }
            if (!items.length) { if (errEl) errEl.textContent = 'Р”РѕР±Р°РІСЊС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРёРЅ С‚РѕРІР°СЂ'; return; }
            var payload = { warehouse_to: warehouseTo, items: items, comment: (document.getElementById('opWhReceiptComment').value || '').trim() || null };
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            function doneSuccess(result) {
              if (msgEl) { msgEl.textContent = 'РћРїРµСЂР°С†РёРё СЃРѕР·РґР°РЅС‹: ' + (result.operations_count || items.length) + ' С€С‚.'; msgEl.style.display = 'block'; }
              setTimeout(function () { loadSectionOperations(false); }, 2000);
            }
            function doneError(e) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёСЋ';
              var detail = e && e.data && e.data.detail;
              if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
              if (detail && detail.errors) {
                var errs = [];
                for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                if (errEl) errEl.textContent = errs.join('; ');
              } else if (errEl) errEl.textContent = 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
            }
            api('/api/v1/operations/warehouse_receipt/create-batch', { method: 'POST', body: JSON.stringify(payload) }).then(doneSuccess).catch(doneError);
          };
        }
        function buildAllocationForm(config, customers, products, warehouses, userList) {
          var content = document.getElementById('content');
          if (!content) return;
          var warehousesList = warehouses || [];
          var productsList = products || [];
          var whOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ вЂ”</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var expOpts = '<option value="">вЂ” РќРµ СѓРєР°Р·Р°РЅ вЂ”</option>';
          (userList || []).forEach(function (u) {
            if ((u.role || '').toLowerCase() !== 'expeditor') return;
            expOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>';
          });
          // РЎРїРёСЃРѕРє С‚РѕРІР°СЂРѕРІ Р±СѓРґРµРј РѕРіСЂР°РЅРёС‡РёРІР°С‚СЊ С‚РѕР»СЊРєРѕ С‚РµРјРё, Сѓ РєРѕС‚РѕСЂС‹С… РµСЃС‚СЊ РѕСЃС‚Р°С‚РєРё РЅР° РІС‹Р±СЂР°РЅРЅРѕРј СЃРєР»Р°РґРµ
          var productsMap = {}; productsList.forEach(function (p) { productsMap[p.code] = p; });
          var formHtml = '<div class="card"><h2>РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё: ' + escAttr(config.operation_name || 'Р’С‹РґР°С‡Р° СЌРєСЃРїРµРґРёС‚РѕСЂСѓ') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          // РїРѕСЂСЏРґРѕРє: РЎРєР»Р°Рґ РѕС‚ в†’ Р­РєСЃРїРµРґРёС‚РѕСЂ в†’ РЎРєР»Р°Рґ РІ (СЃРµСЂРѕРµ, Р°РІС‚РѕР·Р°РїРѕР»РЅСЏРµС‚СЃСЏ РїРѕ СЌРєСЃРїРµРґРёС‚РѕСЂСѓ)
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ РѕС‚ <span style="color:#c00">*</span></label><select id="allocWhFrom" required>' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Р­РєСЃРїРµРґРёС‚РѕСЂ <span style="color:#c00">*</span></label><select id="allocExpeditor" required>' + expOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ РІ <span style="color:#c00">*</span></label><select id="allocWhTo" required disabled style="background-color:#eee; color:#555;">' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё <span style="color:#c00">*</span></label><input type="text" id="allocDeliveryDate" placeholder="РґРґ.РјРј.РіРіРіРі" autocomplete="off"></div>';
          formHtml += '<p style="margin:8px 0 0 0"><button type="button" class="btn btn-secondary" id="allocPullByDate">РџРѕРґС‚СЏРЅСѓС‚СЊ С‚РѕРІР°СЂС‹ РїРѕ РґР°С‚Рµ РїРѕСЃС‚Р°РІРєРё</button></p>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">РўРѕРІР°СЂС‹</h3><div style="overflow-x:auto"><table id="allocItemsTable" style="width:100%"><thead><tr><th>РўРѕРІР°СЂ</th><th>РџР°СЂС‚РёСЏ</th><th>РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё</th><th>Р”РЅРµР№ РѕСЃС‚Р°Р»РѕСЃСЊ</th><th>Р”РѕСЃС‚СѓРїРЅРѕ</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ</th><th>Р’РµСЃ</th><th>Р¦РµРЅР°</th><th>РЎСѓРјРјР°</th><th></th></tr></thead><tbody id="allocItemsBody"><tr class="alloc-row"><td><select class="alloc-product" required><option value=\"\">вЂ” Р’С‹Р±РµСЂРёС‚Рµ С‚РѕРІР°СЂ вЂ”</option></select></td><td><select class="alloc-batch" required><option value=\"\">вЂ” РЅРµС‚ РґР°РЅРЅС‹С… вЂ”</option></select></td><td class="alloc-expiry">вЂ”</td><td class="alloc-days" style="text-align:center">вЂ”</td><td class="alloc-available" style="text-align:right">0</td><td><input type="number" class="alloc-qty" min="1" required></td><td class="alloc-weight" style="text-align:right">вЂ”</td><td class="alloc-price" style="text-align:right">вЂ”</td><td class="alloc-sum" style="text-align:right">вЂ”</td><td><button type="button" class="btn btn-secondary btn-small alloc-remove" style="display:none">РЈРґР°Р»РёС‚СЊ</button></td></tr></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="5" style="text-align:right;padding:8px">\u0418\u0442\u043e\u0433\u043e:</td><td id="allocTotalQty" style="text-align:right;padding:8px">0</td><td id="allocTotalWeight" style="text-align:right;padding:8px">0 \u043a\u0433</td><td></td><td id="allocTotalSum" style="text-align:right;padding:8px">0,00</td><td></td></tr></tfoot></table></div><button type="button" class="btn btn-secondary" id="allocAddRow" style="margin-top:8px">+ Р”РѕР±Р°РІРёС‚СЊ С‚РѕРІР°СЂ</button></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="allocComment" placeholder="РЅРµРѕР±СЏР·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="allocSave">РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё</button> <button type="button" class="btn btn-secondary" id="allocCancel">РћС‚РјРµРЅР°</button></p></div>';
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
            row.innerHTML = '<td><select class="alloc-product" required>' + prodOptsNow + '</select></td><td><select class="alloc-batch" required><option value="">вЂ” РЅРµС‚ РґР°РЅРЅС‹С… вЂ”</option></select></td><td class="alloc-expiry">вЂ”</td><td class="alloc-days" style="text-align:center">вЂ”</td><td class="alloc-available" style="text-align:right">0</td><td><input type="number" class="alloc-qty" min="1" required></td><td class="alloc-weight" style="text-align:right">вЂ”</td><td class="alloc-price" style="text-align:right">вЂ”</td><td class="alloc-sum" style="text-align:right">вЂ”</td><td><button type="button" class="btn btn-secondary btn-small alloc-remove">РЈРґР°Р»РёС‚СЊ</button></td>';
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
            var opts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ С‚РѕРІР°СЂ вЂ”</option>';
            if (!stockCache || !stockCache.length) return opts;
            var withStock = {};
            stockCache.forEach(function (s) {
              if (s.product_code) withStock[s.product_code] = true;
            });
            productsList.forEach(function (p) {
              if (withStock[p.code]) {
                opts += '<option value="' + escAttr(p.code) + '">' + escAttr((p.code || '') + ' вЂ” ' + (p.name || '')) + '</option>';
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
            var opts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ РїР°СЂС‚РёСЋ вЂ”</option>';
            rows.forEach(function (r) {
              var days = (r.days_until_expiry != null ? r.days_until_expiry : '');
              var status = r.expiry_status || {};
              var color = status.color || '';
              var icon = status.icon || '';
              opts += '<option value="' + escAttr(r.batch_code || '') + '" data-batch-id="' + escAttr(r.batch_id || '') + '" data-expiry="' + escAttr(r.expiry_date || '') + '" data-available="' + (r.total_qty != null ? r.total_qty : 0) + '" data-days="' + days + '" data-color="' + escAttr(color) + '" data-icon="' + escAttr(icon) + '">' + escAttr((r.batch_code || '') + (r.expiry_date ? ' вЂ” ' + formatDateOnly(r.expiry_date) : '')) + '</option>';
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
              expiryCell.textContent = expiry ? formatDateOnly(expiry) : 'вЂ”';
              availCell.textContent = avail;
              if (daysCell) {
                if (daysAttr === null || daysAttr === '' || isNaN(parseInt(daysAttr, 10))) {
                  daysCell.textContent = 'вЂ”';
                } else {
                  var days = parseInt(daysAttr, 10);
                  var badgeColor = '#28a745';
                  if (color === 'YELLOW') badgeColor = '#ffc107';
                  else if (color === 'RED') badgeColor = '#dc3545';
                  else if (color === 'BLACK') badgeColor = '#343a40';
                  var iconChar = icon || (color === 'YELLOW' ? 'рџџЎ' : (color === 'RED' ? 'рџ”ґ' : (color === 'BLACK' ? 'вљ«' : 'рџџў')));
                  var daysText = days + ' РґРЅ.';
                  daysCell.innerHTML = '<span class="badge" style="background-color:' + badgeColor + ';color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;">' + iconChar + ' ' + daysText + '</span>';
                }
              }
              var prod = productsMap[productCode];
              var price = prod && prod.price ? parseFloat(prod.price) : 0;
              var weightG = prod && prod.weight_g ? parseFloat(prod.weight_g) : 0;
              priceCell.textContent = price ? price.toFixed(2) : 'вЂ”';
              var qty = parseInt(qtyInp.value || '0', 10) || 0;
              if (qty > avail) qty = avail;
              if (qtyInp.value && parseInt(qtyInp.value, 10) !== qty) qtyInp.value = qty || '';
              var sum = price * qty;
              sumCell.textContent = sum ? sum.toFixed(2) : 'вЂ”';
              if (weightCell) {
                var totalWeightG = weightG * qty;
                if (totalWeightG > 0) {
                  var totalWeightKg = (totalWeightG / 1000).toFixed(2);
                  weightCell.textContent = totalWeightKg + ' РєРі';
                } else {
                  weightCell.textContent = 'вЂ”';
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
                wEl.textContent = totalWeightKg + ' РєРі';
              } else {
                wEl.textContent = '0 РєРі';
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
            if (!whFrom) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ РѕС‚.'; return; }
            if (!expeditor) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЌРєСЃРїРµРґРёС‚РѕСЂР°.'; return; }
            if (!deliveryDate) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ РґР°С‚Сѓ РїРѕСЃС‚Р°РІРєРё.'; return; }

            if (!options.skipConfirm && hasAllocationRowsData()) {
              var text = options.dateChangeMode
                ? 'РР·РјРµРЅРёС‚СЊ РґР°С‚Сѓ РїРѕСЃС‚Р°РІРєРё? РўРµРєСѓС‰РёРµ РїРѕР·РёС†РёРё Р±СѓРґСѓС‚ Р·Р°РјРµРЅРµРЅС‹.'
                : 'Р—Р°РјРµРЅРёС‚СЊ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёРµ РїРѕР·РёС†РёРё РЅРѕРІС‹РјРё?';
              if (!confirm(text)) return;
            }

            var pullBtn = document.getElementById('allocPullByDate');
            if (pullBtn) { pullBtn.disabled = true; pullBtn.textContent = 'РџРѕРґС‚СЏРіРёРІР°РµРј...'; }

            function bindMatchedOrderLinks() {
              if (!msgEl) return;
              msgEl.querySelectorAll('[data-alloc-order-id]').forEach(function (a) {
                a.onclick = function (ev) {
                  ev.preventDefault();
                  var orderId = parseInt(this.getAttribute('data-alloc-order-id') || '0', 10) || 0;
                  if (!orderId) return;
                  api('/api/v1/orders/' + orderId).then(function (order) {
                    var statusLabel = order.status_name || order.status_code || 'вЂ”';
                    var paymentLabel = order.payment_type_name || order.payment_type_code || 'вЂ”';
                    var amountValue = (order.total_amount != null && !isNaN(Number(order.total_amount)))
                      ? Number(order.total_amount).toLocaleString('ru-RU')
                      : (order.total_amount != null ? order.total_amount : 'вЂ”');
                    var lastUpdated = 'вЂ”';
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
                        var sumText = priceNum != null ? (qty * priceNum).toLocaleString('ru-RU') : 'вЂ”';
                        return '<tr>'
                          + '<td>' + escAttr(it.product_name || it.product_code || 'вЂ”') + '</td>'
                          + '<td style="text-align:right">' + escAttr(qty) + '</td>'
                          + '<td style="text-align:right">' + escAttr(priceNum != null ? priceNum.toLocaleString('ru-RU') : 'вЂ”') + '</td>'
                          + '<td style="text-align:right">' + escAttr(sumText) + '</td>'
                          + '</tr>';
                      }).join('');
                      itemsHtml = '<div class="form-group"><label>РџРѕР·РёС†РёРё Р·Р°РєР°Р·Р°</label><div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>РўРѕРІР°СЂ</th><th style="text-align:right">РљРѕР»-РІРѕ</th><th style="text-align:right">Р¦РµРЅР°</th><th style="text-align:right">РЎСѓРјРјР°</th></tr></thead><tbody>'
                        + rowsHtml
                        + '</tbody></table></div></div>';
                    }
                    var bodyHtml = ''
                      + '<div class="form-group"><label>РќРѕРјРµСЂ Р·Р°РєР°Р·Р°</label><div class="form-readonly">в„– ' + escAttr(order.order_no || order.id || orderId) + '</div></div>'
                      + '<div class="form-group"><label>РљР»РёРµРЅС‚</label><div class="form-readonly">' + escAttr(order.customer_name || 'вЂ”') + '</div></div>'
                      + '<div class="form-group"><label>РЎС‚Р°С‚СѓСЃ</label><div class="form-readonly">' + escAttr(statusLabel) + '</div></div>'
                      + '<div class="form-group"><label>РўРёРї РѕРїР»Р°С‚С‹</label><div class="form-readonly">' + escAttr(paymentLabel) + '</div></div>'
                      + '<div class="form-group"><label>РЎСѓРјРјР°</label><div class="form-readonly">' + escAttr(amountValue) + '</div></div>'
                      + '<div class="form-group"><label>Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё</label><div class="form-readonly">' + escAttr(order.scheduled_delivery_at ? formatDateOnly(order.scheduled_delivery_at) : 'вЂ”') + '</div></div>'
                      + '<div class="form-group"><label>РџРѕСЃР»РµРґРЅРµРµ РёР·РјРµРЅРµРЅРёРµ</label><div class="form-readonly">' + escAttr(lastUpdated) + '</div></div>'
                      + itemsHtml;
                    showModal('Р—Р°РєР°Р· в„– ' + orderId, bodyHtml, function () { return Promise.resolve(); }, { closeOnly: true });
                  }).catch(function (e) {
                    var detail = e && e.data && e.data.detail;
                    var msg = typeof detail === 'string'
                      ? detail
                      : (detail ? JSON.stringify(detail) : 'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ Р·Р°РєР°Р·.');
                    showModal(
                      'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р·Р°РєР°Р·Р°',
                      '<p style="margin:0 0 8px 0">' + escAttr(msg) + '</p><p style="margin:0;color:#666">Р—Р°РєР°Р·: в„– ' + escAttr(orderId) + '</p>',
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
                if (errEl) errEl.textContent = 'РћС€РёР±РєР° Р°РІС‚РѕРїРѕРґС‚СЏРіРёРІР°РЅРёСЏ С‚РѕРІР°СЂРѕРІ.';
                return;
              }
              if (resp.no_orders) {
                clearAllocationRows();
                addAllocationRow(null);
                updateTotals();
                if (msgEl) {
                  msgEl.textContent = resp.message || ('РќР° РІС‹Р±СЂР°РЅРЅСѓСЋ РґР°С‚Сѓ РЅРµС‚ Р°РєС‚РёРІРЅС‹С… Р·Р°РєР°Р·РѕРІ РґР»СЏ РґРѕСЃС‚Р°РІРєРё СЌРєСЃРїРµРґРёС‚РѕСЂРѕРј ' + expeditor + '.');
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
                      : 'вЂ”';
                    orderInfoText = ' <span>РџРѕРґС‚СЏРЅСѓС‚Рѕ РёР· Р·Р°РєР°Р·РѕРІ: ' + resp.matched_orders_count + ' (' + orderIdsHtml + ')</span>.';
                  }
                  msgEl.innerHTML = 'РўРѕРІР°СЂС‹ СѓСЃРїРµС€РЅРѕ РїРѕРґС‚СЏРЅСѓС‚С‹ РїРѕ РґР°С‚Рµ РїРѕСЃС‚Р°РІРєРё.' + orderInfoText;
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
              } else if (errEl) errEl.textContent = 'РћС€РёР±РєР° Р°РІС‚РѕРїРѕРґС‚СЏРіРёРІР°РЅРёСЏ С‚РѕРІР°СЂРѕРІ.';
            }).finally(function () {
              if (pullBtn) { pullBtn.disabled = false; pullBtn.textContent = 'РџРѕРґС‚СЏРЅСѓС‚СЊ С‚РѕРІР°СЂС‹ РїРѕ РґР°С‚Рµ РїРѕСЃС‚Р°РІРєРё'; }
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
                // РђРІС‚РѕРїРѕРґСЃС‚Р°РЅРѕРІРєР° СЃРєР»Р°РґР° РїРѕ СЌРєСЃРїРµРґРёС‚РѕСЂСѓ, РїРѕР»Рµ С‚РѕР»СЊРєРѕ РґР»СЏ РїСЂРѕСЃРјРѕС‚СЂР° (СЃРµСЂРѕРµ)
                whToSel.value = match.code;
              } else {
                // Р•СЃР»Рё СЃРІСЏР·РєРё РЅРµС‚ вЂ” РѕС‡РёС‰Р°РµРј РїРѕР»Рµ
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
                var ok = confirm('РР·РјРµРЅРёС‚СЊ РґР°С‚Сѓ РїРѕСЃС‚Р°РІРєРё? РўРµРєСѓС‰РёРµ РїРѕР·РёС†РёРё Р±СѓРґСѓС‚ Р·Р°РјРµРЅРµРЅС‹.');
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
            if (!whFrom || !whTo) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°РґС‹ РѕС‚ Рё РІ.'; return; }
            if (!expeditor) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЌРєСЃРїРµРґРёС‚РѕСЂР°.'; return; }
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
            if (!items.length) { if (errEl) errEl.textContent = 'Р”РѕР±Р°РІСЊС‚Рµ С…РѕС‚СЏ Р±С‹ РѕРґРёРЅ С‚РѕРІР°СЂ.'; return; }
            var comment = (document.getElementById('allocComment').value || '').trim() || null;
            var createdBy = (window.currentUser && window.currentUser.login) ? window.currentUser.login : null;
            var saveBtn = document.getElementById('allocSave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            var createdCount = 0;
            var idx = 0;
            function createNext() {
              if (idx >= items.length) {
                if (msgEl) { msgEl.textContent = 'РћРїРµСЂР°С†РёРё СЃРѕР·РґР°РЅС‹: ' + createdCount + ' С€С‚.'; msgEl.style.display = 'block'; }
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
                saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) {
                  var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                  if (errEl) errEl.textContent = errs.join('; ');
                } else if (errEl) errEl.textContent = 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
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
          var whOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ вЂ”</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var formHtml = '<div class="card"><h2>РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё: ' + escAttr(config.operation_name || 'РЎРїРёСЃР°РЅРёРµ С‚РѕРІР°СЂР°') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ <span style="color:#c00">*</span></label><select id="writeOffWh" required>' + whOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">РўРѕРІР°СЂС‹ РґР»СЏ СЃРїРёСЃР°РЅРёСЏ</h3><p style="color:#666;font-size:13px;margin-bottom:8px">Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ вЂ” РїРѕРґС‚СЏРЅСѓС‚СЃСЏ РѕСЃС‚Р°С‚РєРё РїРѕ РїР°СЂС‚РёСЏРј.</p><div style="overflow-x:auto"><table id="writeOffItemsTable" style="width:100%"><thead><tr><th>РўРѕРІР°СЂ</th><th>РџР°СЂС‚РёСЏ</th><th>РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё</th><th>Р”РЅРµР№ РѕСЃС‚Р°Р»РѕСЃСЊ</th><th>Р”РѕСЃС‚СѓРїРЅРѕ</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ Рє СЃРїРёСЃР°РЅРёСЋ</th><th>Р’РµСЃ</th><th>Р¦РµРЅР°</th><th>РЎСѓРјРјР°</th></tr></thead><tbody id="writeOffItemsBody"></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="5" style="text-align:right;padding:8px">РС‚РѕРіРѕ:</td><td id="writeOffTotalQty" style="text-align:right;padding:8px">0</td><td id="writeOffTotalWeight" style="text-align:right;padding:8px">вЂ”</td><td></td><td id="writeOffTotalSum" style="text-align:right;padding:8px">0</td></tr></tfoot></table></div></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="writeOffComment" placeholder="РЅРµРѕР±СЏР·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="writeOffSave">РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё</button> <button type="button" class="btn btn-secondary" id="writeOffCancel">РћС‚РјРµРЅР°</button></p></div>';
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
              if (!wh) tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ</td></tr>';
              else tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">РќРµС‚ РѕСЃС‚Р°С‚РєРѕРІ РЅР° СЃРєР»Р°РґРµ</td></tr>';
              document.getElementById('writeOffTotalQty').textContent = '0';
              document.getElementById('writeOffTotalSum').textContent = '0';
              document.getElementById('writeOffTotalWeight').textContent = 'вЂ”';
              return;
            }
            var totalQty = 0, totalSum = 0, totalWeightG = 0;
            stockCache.forEach(function (s) {
              var productName = (s.product_name || s.product_code || '');
              var expiry = s.expiry_date ? formatDateOnly(s.expiry_date) : 'вЂ”';
              var days = s.days_until_expiry != null ? s.days_until_expiry : 'вЂ”';
              var avail = s.total_qty != null ? s.total_qty : 0;
              var price = s.unit_price != null ? parseFloat(s.unit_price) : 0;
              var weightG = s.weight_g != null ? parseInt(s.weight_g, 10) : 0;
              var status = s.expiry_status || {};
              var color = status.color || '';
              var icon = status.icon || '';
              var daysHtml = (days === 'вЂ”' || days === '') ? 'вЂ”' : '<span class="badge" style="background-color:' + (color === 'YELLOW' ? '#ffc107' : color === 'RED' ? '#dc3545' : color === 'BLACK' ? '#343a40' : '#28a745') + ';color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;">' + (icon || '') + ' ' + days + ' РґРЅ.</span>';
              var row = document.createElement('tr');
              row.className = 'writeoff-row';
              row.setAttribute('data-product-code', s.product_code || '');
              row.setAttribute('data-batch-code', s.batch_code || '');
              row.setAttribute('data-available', String(avail));
              row.setAttribute('data-price', String(price));
              row.setAttribute('data-weight-g', String(weightG));
              row.innerHTML = '<td>' + escAttr(productName) + '</td><td>' + escAttr(s.batch_code || '') + '</td><td>' + expiry + '</td><td style="text-align:center">' + daysHtml + '</td><td style="text-align:right">' + avail + '</td><td><input type="number" class="writeoff-qty" min="0" max="' + avail + '" value="0" data-available="' + avail + '"></td><td class="writeoff-weight" style="text-align:right">вЂ”</td><td class="writeoff-price" style="text-align:right">' + (price ? price.toFixed(2) : 'вЂ”') + '</td><td class="writeoff-sum" style="text-align:right">0</td>';
              var qtyInp = row.querySelector('.writeoff-qty');
              var weightCell = row.querySelector('.writeoff-weight');
              var sumCell = row.querySelector('.writeoff-sum');
              function upd() {
                var q = parseInt(qtyInp.value || '0', 10) || 0;
                var maxA = parseInt(qtyInp.getAttribute('data-available') || '0', 10) || 0;
                if (q > maxA) { q = maxA; qtyInp.value = q || ''; }
                var sum = price * q;
                sumCell.textContent = sum ? sum.toFixed(2) : '0';
                if (weightG > 0 && q > 0) weightCell.textContent = ((weightG * q) / 1000).toFixed(2) + ' РєРі'; else weightCell.textContent = 'вЂ”';
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
            if (totalWeightG > 0) wEl.textContent = (totalWeightG / 1000).toFixed(2) + ' РєРі'; else wEl.textContent = 'вЂ”';
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
            if (!wh) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ.'; return; }
            if (!createdBy) { if (errEl) errEl.textContent = 'РќРµ РѕРїСЂРµРґРµР»РµРЅ С‚РµРєСѓС‰РёР№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ.'; return; }
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
            if (!items.length) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РєРѕР»РёС‡РµСЃС‚РІРѕ Рє СЃРїРёСЃР°РЅРёСЋ С…РѕС‚СЏ Р±С‹ РїРѕ РѕРґРЅРѕР№ РїРѕР·РёС†РёРё.'; return; }
            var saveBtn = document.getElementById('writeOffSave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            var createdCount = 0, idx = 0;
            function createNext() {
              if (idx >= items.length) {
                if (msgEl) { msgEl.textContent = 'РЎРѕР·РґР°РЅРѕ РѕРїРµСЂР°С†РёР№ СЃРїРёСЃР°РЅРёСЏ: ' + createdCount; msgEl.style.display = 'block'; }
                setTimeout(function () { loadSectionOperations(false); }, 1500);
                return;
              }
              var it = items[idx++];
              api('/api/v1/operations/write_off', { method: 'POST', body: JSON.stringify({ warehouse_from: wh, product_code: it.product_code, batch_code: it.batch_code, quantity: it.quantity, created_by: createdBy, comment: comment }) }).then(function () {
                createdCount += 1;
                createNext();
              }).catch(function (e) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) { var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]); if (errEl) errEl.textContent = errs.join('; '); }
                else if (errEl) errEl.textContent = 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
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
          var whOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ вЂ”</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var formHtml = '<div class="card"><h2>РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё: ' + escAttr(config.operation_name || 'РџРµСЂРµРјРµС‰РµРЅРёРµ РјРµР¶РґСѓ СЃРєР»Р°РґР°РјРё') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ РѕС‚ <span style="color:#c00">*</span></label><select id="transferWhFrom" required>' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ РІ <span style="color:#c00">*</span></label><select id="transferWhTo" required>' + whOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">РўРѕРІР°СЂС‹ РґР»СЏ РїРµСЂРµРјРµС‰РµРЅРёСЏ</h3><p style="color:#666;font-size:13px;margin-bottom:8px">Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°РґС‹ вЂ” РїРѕРґС‚СЏРЅСѓС‚СЃСЏ РѕСЃС‚Р°С‚РєРё РїРѕ РїР°СЂС‚РёСЏРј СЃРѕ СЃРєР»Р°РґР° В«РѕС‚В».</p><div style="overflow-x:auto"><table id="transferItemsTable" style="width:100%"><thead><tr><th>РўРѕРІР°СЂ</th><th>РџР°СЂС‚РёСЏ</th><th>РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё</th><th>Р”РЅРµР№ РѕСЃС‚Р°Р»РѕСЃСЊ</th><th>Р”РѕСЃС‚СѓРїРЅРѕ</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ Рє РїРµСЂРµРјРµС‰РµРЅРёСЋ</th><th>Р’РµСЃ</th><th>Р¦РµРЅР°</th><th>РЎСѓРјРјР°</th></tr></thead><tbody id="transferItemsBody"></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="5" style="text-align:right;padding:8px">РС‚РѕРіРѕ:</td><td id="transferTotalQty" style="text-align:right;padding:8px">0</td><td id="transferTotalWeight" style="text-align:right;padding:8px">вЂ”</td><td></td><td id="transferTotalSum" style="text-align:right;padding:8px">0</td></tr></tfoot></table></div></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="transferComment" placeholder="РЅРµРѕР±СЏР·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="transferSave">РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё</button> <button type="button" class="btn btn-secondary" id="transferCancel">РћС‚РјРµРЅР°</button></p></div>';
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
              if (!whFrom || !whTo) tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ РѕС‚ Рё СЃРєР»Р°Рґ РІ</td></tr>';
              else if (whFrom === whTo) tbody.innerHTML = '<tr><td colspan="9" style="color:#c00;padding:12px">РЎРєР»Р°Рґ РѕС‚ Рё СЃРєР»Р°Рґ РІ РЅРµ РґРѕР»Р¶РЅС‹ СЃРѕРІРїР°РґР°С‚СЊ</td></tr>';
              else tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">РќРµС‚ РѕСЃС‚Р°С‚РєРѕРІ РЅР° СЃРєР»Р°РґРµ В«РѕС‚В»</td></tr>';
              document.getElementById('transferTotalQty').textContent = '0';
              document.getElementById('transferTotalSum').textContent = '0';
              document.getElementById('transferTotalWeight').textContent = 'вЂ”';
              return;
            }
            stockCache.forEach(function (s) {
              var productName = (s.product_name || s.product_code || '');
              var expiry = s.expiry_date ? formatDateOnly(s.expiry_date) : 'вЂ”';
              var days = s.days_until_expiry != null ? s.days_until_expiry : 'вЂ”';
              var avail = s.total_qty != null ? s.total_qty : 0;
              var price = s.unit_price != null ? parseFloat(s.unit_price) : 0;
              var weightG = s.weight_g != null ? parseInt(s.weight_g, 10) : 0;
              var status = s.expiry_status || {};
              var color = status.color || '';
              var icon = status.icon || '';
              var daysHtml = (days === 'вЂ”' || days === '') ? 'вЂ”' : '<span class="badge" style="background-color:' + (color === 'YELLOW' ? '#ffc107' : color === 'RED' ? '#dc3545' : color === 'BLACK' ? '#343a40' : '#28a745') + ';color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;">' + (icon || '') + ' ' + days + ' РґРЅ.</span>';
              var row = document.createElement('tr');
              row.className = 'transfer-row';
              row.setAttribute('data-product-code', s.product_code || '');
              row.setAttribute('data-batch-code', s.batch_code || '');
              row.setAttribute('data-available', String(avail));
              row.setAttribute('data-price', String(price));
              row.setAttribute('data-weight-g', String(weightG));
              row.innerHTML = '<td>' + escAttr(productName) + '</td><td>' + escAttr(s.batch_code || '') + '</td><td>' + expiry + '</td><td style="text-align:center">' + daysHtml + '</td><td style="text-align:right">' + avail + '</td><td><input type="number" class="transfer-qty" min="0" max="' + avail + '" value="0" data-available="' + avail + '"></td><td class="transfer-weight" style="text-align:right">вЂ”</td><td class="transfer-price" style="text-align:right">' + (price ? price.toFixed(2) : 'вЂ”') + '</td><td class="transfer-sum" style="text-align:right">0</td>';
              var qtyInp = row.querySelector('.transfer-qty');
              var weightCell = row.querySelector('.transfer-weight');
              var sumCell = row.querySelector('.transfer-sum');
              function upd() {
                var q = parseInt(qtyInp.value || '0', 10) || 0;
                var maxA = parseInt(qtyInp.getAttribute('data-available') || '0', 10) || 0;
                if (q > maxA) { q = maxA; qtyInp.value = q || ''; }
                sumCell.textContent = price * q ? (price * q).toFixed(2) : '0';
                if (weightG > 0 && q > 0) weightCell.textContent = ((weightG * q) / 1000).toFixed(2) + ' РєРі'; else weightCell.textContent = 'вЂ”';
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
            if (totalWeightG > 0) wEl.textContent = (totalWeightG / 1000).toFixed(2) + ' РєРі'; else wEl.textContent = 'вЂ”';
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
            if (!whFrom || !whTo) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ РѕС‚ Рё СЃРєР»Р°Рґ РІ.'; return; }
            if (whFrom === whTo) { if (errEl) errEl.textContent = 'РЎРєР»Р°Рґ РѕС‚ Рё СЃРєР»Р°Рґ РІ РЅРµ РґРѕР»Р¶РЅС‹ СЃРѕРІРїР°РґР°С‚СЊ.'; return; }
            if (!createdBy) { if (errEl) errEl.textContent = 'РќРµ РѕРїСЂРµРґРµР»РµРЅ С‚РµРєСѓС‰РёР№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ.'; return; }
            var items = [];
            document.querySelectorAll('.transfer-row').forEach(function (row) {
              var qtyInp = row.querySelector('.transfer-qty');
              var q = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              if (q <= 0) return;
              items.push({ product_code: row.getAttribute('data-product-code') || '', batch_code: row.getAttribute('data-batch-code') || '', quantity: q });
            });
            if (!items.length) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РєРѕР»РёС‡РµСЃС‚РІРѕ Рє РїРµСЂРµРјРµС‰РµРЅРёСЋ С…РѕС‚СЏ Р±С‹ РїРѕ РѕРґРЅРѕР№ РїРѕР·РёС†РёРё.'; return; }
            var saveBtn = document.getElementById('transferSave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            var createdCount = 0, idx = 0;
            function createNext() {
              if (idx >= items.length) {
                if (msgEl) { msgEl.textContent = 'РЎРѕР·РґР°РЅРѕ РѕРїРµСЂР°С†РёР№ РїРµСЂРµРјРµС‰РµРЅРёСЏ: ' + createdCount; msgEl.style.display = 'block'; }
                setTimeout(function () { loadSectionOperations(false); }, 1500);
                return;
              }
              var it = items[idx++];
              api('/api/v1/operations/transfer', { method: 'POST', body: JSON.stringify({ warehouse_from: whFrom, warehouse_to: whTo, product_code: it.product_code, batch_code: it.batch_code, quantity: it.quantity, created_by: createdBy, comment: comment }) }).then(function () {
                createdCount += 1;
                createNext();
              }).catch(function (e) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) { var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]); if (errEl) errEl.textContent = errs.join('; '); }
                else if (errEl) errEl.textContent = 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
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
          var whOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ вЂ”</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var expOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ СЌРєСЃРїРµРґРёС‚РѕСЂР° вЂ”</option>';
          (userList || []).forEach(function (u) {
            if ((u.role || '').toLowerCase() !== 'expeditor') return;
            expOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>';
          });
          var formHtml = '<div class="card"><h2>РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё: ' + escAttr(config.operation_name || 'Р Р°Р·РґР°С‡Р° РѕР±СЂР°Р·С†РѕРІ') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          formHtml += '<div class="form-group"><label>Р­РєСЃРїРµРґРёС‚РѕСЂ <span style="color:#c00">*</span></label><select id="sampleExpeditor" required>' + expOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ РІ <span style="color:#c00">*</span></label><select id="sampleWhTo" required disabled style="background:#eee;color:#555">' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ РѕС‚ <span style="color:#c00">*</span></label><select id="sampleWhFrom" required>' + whOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">РћР±СЂР°Р·С†С‹</h3><p style="color:#666;font-size:13px;margin-bottom:8px">РћСЃС‚Р°С‚РєРё РѕС‚СЃРѕСЂС‚РёСЂРѕРІР°РЅС‹ РѕС‚ РїСЂРѕСЃСЂРѕС‡РµРЅРЅС‹С… Рє РЅРѕСЂРјР°Р»СЊРЅС‹Рј. РЈРєР°Р¶РёС‚Рµ РєРѕР»РёС‡РµСЃС‚РІРѕ РѕР±СЂР°Р·С†РѕРІ.</p><div style="overflow-x:auto"><table id="sampleItemsTable" style="width:100%"><thead><tr><th>РўРѕРІР°СЂ</th><th>РџР°СЂС‚РёСЏ</th><th>РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё</th><th>Р”РЅРµР№ РѕСЃС‚Р°Р»РѕСЃСЊ</th><th>Р”РѕСЃС‚СѓРїРЅРѕ</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ РѕР±СЂР°Р·С†РѕРІ</th><th>Р’РµСЃ</th><th>Р¦РµРЅР°</th><th>РЎСѓРјРјР°</th></tr></thead><tbody id="sampleItemsBody"></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="5" style="text-align:right;padding:8px">РС‚РѕРіРѕ:</td><td id="sampleTotalQty" style="text-align:right;padding:8px">0</td><td id="sampleTotalWeight" style="text-align:right;padding:8px">вЂ”</td><td></td><td id="sampleTotalSum" style="text-align:right;padding:8px">0</td></tr></tfoot></table></div></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="sampleComment" placeholder="РЅРµРѕР±СЏР·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="sampleSave">РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё</button> <button type="button" class="btn btn-secondary" id="sampleCancel">РћС‚РјРµРЅР°</button></p></div>';
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
              if (!whTo) tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">РЎРЅР°С‡Р°Р»Р° РІС‹Р±РµСЂРёС‚Рµ СЌРєСЃРїРµРґРёС‚РѕСЂР° (СЃРєР»Р°Рґ РІ Р·Р°РїРѕР»РЅРёС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё)</td></tr>';
              else if (!whFrom) tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ РѕС‚</td></tr>';
              else tbody.innerHTML = '<tr><td colspan="9" style="color:#666;padding:12px">РќРµС‚ РѕСЃС‚Р°С‚РєРѕРІ РЅР° СЃРєР»Р°РґРµ</td></tr>';
              document.getElementById('sampleTotalQty').textContent = '0';
              document.getElementById('sampleTotalSum').textContent = '0';
              document.getElementById('sampleTotalWeight').textContent = 'вЂ”';
              return;
            }
            stockCache.forEach(function (s) {
              var productName = (s.product_name || s.product_code || '');
              var expiry = s.expiry_date ? formatDateOnly(s.expiry_date) : 'вЂ”';
              var days = s.days_until_expiry != null ? s.days_until_expiry : 'вЂ”';
              var avail = s.total_qty != null ? s.total_qty : 0;
              var price = s.unit_price != null ? parseFloat(s.unit_price) : 0;
              var weightG = s.weight_g != null ? parseInt(s.weight_g, 10) : 0;
              var status = s.expiry_status || {};
              var color = status.color || '';
              var icon = status.icon || '';
              var daysHtml = (days === 'вЂ”' || days === '') ? 'вЂ”' : '<span class="badge" style="background-color:' + (color === 'YELLOW' ? '#ffc107' : color === 'RED' ? '#dc3545' : color === 'BLACK' ? '#343a40' : '#28a745') + ';color:#fff;border-radius:4px;padding:2px 6px;font-size:11px;">' + (icon || '') + ' ' + days + ' РґРЅ.</span>';
              var row = document.createElement('tr');
              row.className = 'sample-row';
              row.setAttribute('data-product-code', s.product_code || '');
              row.setAttribute('data-batch-code', s.batch_code || '');
              row.setAttribute('data-available', String(avail));
              row.setAttribute('data-price', String(price));
              row.setAttribute('data-weight-g', String(weightG));
              row.innerHTML = '<td>' + escAttr(productName) + '</td><td>' + escAttr(s.batch_code || '') + '</td><td>' + expiry + '</td><td style="text-align:center">' + daysHtml + '</td><td style="text-align:right">' + avail + '</td><td><input type="number" class="sample-qty" min="0" max="' + avail + '" value="0" data-available="' + avail + '"></td><td class="sample-weight" style="text-align:right">вЂ”</td><td class="sample-price" style="text-align:right">' + (price ? price.toFixed(2) : 'вЂ”') + '</td><td class="sample-sum" style="text-align:right">0</td>';
              var qtyInp = row.querySelector('.sample-qty');
              var weightCell = row.querySelector('.sample-weight');
              var sumCell = row.querySelector('.sample-sum');
              function upd() {
                var q = parseInt(qtyInp.value || '0', 10) || 0;
                var maxA = parseInt(qtyInp.getAttribute('data-available') || '0', 10) || 0;
                if (q > maxA) { q = maxA; qtyInp.value = q || ''; }
                sumCell.textContent = price * q ? (price * q).toFixed(2) : '0';
                if (weightG > 0 && q > 0) weightCell.textContent = ((weightG * q) / 1000).toFixed(2) + ' РєРі'; else weightCell.textContent = 'вЂ”';
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
            if (totalWeightG > 0) wEl.textContent = (totalWeightG / 1000).toFixed(2) + ' РєРі'; else wEl.textContent = 'вЂ”';
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
            if (!expeditor) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЌРєСЃРїРµРґРёС‚РѕСЂР°.'; return; }
            if (!whTo) { if (errEl) errEl.textContent = 'РЎРєР»Р°Рґ РІ РЅРµ РѕРїСЂРµРґРµР»С‘РЅ вЂ” РІС‹Р±РµСЂРёС‚Рµ СЌРєСЃРїРµРґРёС‚РѕСЂР°, РїСЂРёРІСЏР·Р°РЅРЅРѕРіРѕ Рє СЃРєР»Р°РґСѓ.'; return; }
            if (!whFrom) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ РѕС‚.'; return; }
            if (!createdBy) { if (errEl) errEl.textContent = 'РќРµ РѕРїСЂРµРґРµР»РµРЅ С‚РµРєСѓС‰РёР№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ.'; return; }
            var items = [];
            document.querySelectorAll('.sample-row').forEach(function (row) {
              var qtyInp = row.querySelector('.sample-qty');
              var q = parseInt((qtyInp && qtyInp.value) || '0', 10) || 0;
              if (q <= 0) return;
              items.push({ product_code: row.getAttribute('data-product-code') || '', batch_code: row.getAttribute('data-batch-code') || '', quantity: q });
            });
            if (!items.length) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РєРѕР»РёС‡РµСЃС‚РІРѕ РѕР±СЂР°Р·С†РѕРІ С…РѕС‚СЏ Р±С‹ РїРѕ РѕРґРЅРѕР№ РїРѕР·РёС†РёРё.'; return; }
            var saveBtn = document.getElementById('sampleSave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            var createdCount = 0, idx = 0;
            function createNext() {
              if (idx >= items.length) {
                if (msgEl) { msgEl.textContent = 'РЎРѕР·РґР°РЅРѕ РѕРїРµСЂР°С†РёР№ СЂР°Р·РґР°С‡Рё РѕР±СЂР°Р·С†РѕРІ: ' + createdCount; msgEl.style.display = 'block'; }
                setTimeout(function () { loadSectionOperations(false); }, 1500);
                return;
              }
              var it = items[idx++];
              api('/api/v1/operations/allocation', { method: 'POST', body: JSON.stringify({ warehouse_from: whFrom, warehouse_to: whTo, product_code: it.product_code, batch_code: it.batch_code, quantity: it.quantity, expeditor_login: expeditor, created_by: createdBy, comment: comment }) }).then(function () {
                createdCount += 1;
                createNext();
              }).catch(function (e) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) { var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]); if (errEl) errEl.textContent = errs.join('; '); }
                else if (errEl) errEl.textContent = 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
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
          var whOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ вЂ”</option>';
          warehousesList.forEach(function (w) { whOpts += '<option value="' + escAttr(w.code) + '">' + escAttr(w.name || w.code) + '</option>'; });
          var expOpts = '<option value="">вЂ” РќРµ СѓРєР°Р·Р°РЅ вЂ”</option>';
          (userList || []).forEach(function (u) {
            if ((u.role || '').toLowerCase() !== 'expeditor') return;
            expOpts += '<option value="' + escAttr(u.login) + '">' + escAttr(u.login + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>';
          });
          var custOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р° вЂ”</option>';
          customers.forEach(function (c) { custOpts += '<option value="' + (c.id != null ? c.id : '') + '">' + escAttr((c.name_client || c.firm_name || '') + ' (ID ' + (c.id != null ? c.id : '') + ')') + '</option>'; });
          var payOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ С‚РёРї РѕРїР»Р°С‚С‹ вЂ”</option>';
          paymentTypes.forEach(function (pt) { payOpts += '<option value="' + escAttr(pt.code) + '">' + escAttr(pt.name || pt.code) + '</option>'; });
          var formHtml = '<div class="card"><h2>РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё: ' + escAttr(config.operation_name || 'Р”РѕСЃС‚Р°РІРєР° РєР»РёРµРЅС‚Сѓ') + '</h2>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          formHtml += '<div class="form-group"><label>Р—Р°РєР°Р· в„– <span style="color:#c00">*</span></label><div style="display:flex;gap:8px;align-items:center"><input type="number" id="deliveryOrderId" min="1" required placeholder="Р’РІРµРґРёС‚Рµ РЅРѕРјРµСЂ Р·Р°РєР°Р·Р° РёР»Рё РЅР°Р№РґРёС‚Рµ" autocomplete="off" style="flex:1"><button type="button" class="btn btn-secondary" id="deliveryOrderSearchBtn">РќР°Р№С‚Рё Р·Р°РєР°Р·</button></div></div>';
          formHtml += '<div id="deliveryOrderInfo" style="margin-bottom:16px;display:none"></div>';
          formHtml += '<div class="form-group"><label>РЎРєР»Р°Рґ РѕС‚ <span style="color:#c00">*</span></label><select id="deliveryWhFrom" required>' + whOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>Р­РєСЃРїРµРґРёС‚РѕСЂ <span style="color:#c00">*</span></label><select id="deliveryExpeditor" required>' + expOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>РљР»РёРµРЅС‚ <span style="color:#c00">*</span></label><select id="deliveryCustomer" required>' + custOpts + '</select></div>';
          formHtml += '<div class="form-group"><label>РўРёРї РѕРїР»Р°С‚С‹ <span style="color:#c00">*</span></label><select id="deliveryPaymentType" required>' + payOpts + '</select></div>';
          formHtml += '<div style="margin-top:20px"><h3 style="margin-bottom:12px">РўРѕРІР°СЂС‹ Р·Р°РєР°Р·Р°</h3><div style="overflow-x:auto"><table id="deliveryItemsTable" style="width:100%"><thead><tr><th>РўРѕРІР°СЂ</th><th>РџР°СЂС‚РёСЏ</th><th>РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё</th><th>Р”РЅРµР№ РѕСЃС‚Р°Р»РѕСЃСЊ</th><th>Р”РѕСЃС‚СѓРїРЅРѕ</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ (Р·Р°РєР°Р·)</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ (РґРѕСЃС‚Р°РІРєР°)</th><th>Р¦РµРЅР°</th><th>РЎСѓРјРјР°</th></tr></thead><tbody id="deliveryItemsBody"></tbody><tfoot><tr style="background:#f8f9fa;font-weight:600"><td colspan="6" style="text-align:right;padding:8px">РС‚РѕРіРѕ:</td><td id="deliveryTotalQty" style="text-align:right;padding:8px">0</td><td></td><td id="deliveryTotalSum" style="text-align:right;padding:8px">0</td><td></td></tr></tfoot></table></div></div>';
          formHtml += '<div class="form-group" style="margin-top:20px"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="deliveryComment" placeholder="РЅРµРѕР±СЏР·."></div>';
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="deliverySave">РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё</button> <button type="button" class="btn btn-secondary" id="deliveryCancel">РћС‚РјРµРЅР°</button></p></div>';
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
            infoDiv.innerHTML = '<p style="color:#666">Р—Р°РіСЂСѓР·РєР° Р·Р°РєР°Р·Р°...</p>';
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
              infoDiv.innerHTML = '<p style="color:#28a745;font-weight:600">Р—Р°РєР°Р· в„–' + order.order_no + ' вЂ” ' + escAttr(order.customer_name || '') + '</p><p style="color:#666;font-size:12px;margin-top:4px">РЎРєР»Р°Рґ, СЌРєСЃРїРµРґРёС‚РѕСЂ, РєР»РёРµРЅС‚ Рё С‚РёРї РѕРїР»Р°С‚С‹ РІР·СЏС‚С‹ РёР· Р·Р°РєР°Р·Р° (С‚РѕР»СЊРєРѕ РґР»СЏ С‡С‚РµРЅРёСЏ).</p>';
              tbody.innerHTML = '';
              if (!order.items || !order.items.length) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:16px;color:#666">Р’ Р·Р°РєР°Р·Рµ РЅРµС‚ С‚РѕРІР°СЂРѕРІ</td></tr>';
                return;
              }
              if (whFrom) loadStock(whFrom).then(function () { renderOrderItems(order.items); });
              else renderOrderItems(order.items);
            }).catch(function (e) {
              var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) || 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р·Р°РєР°Р·Р°';
              infoDiv.innerHTML = '<p class="err">РћС€РёР±РєР°: ' + escAttr(msg) + '</p>';
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
              tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:16px;color:#666">РќРµС‚ С‚РѕРІР°СЂРѕРІ</td></tr>';
              return;
            }
            var whFrom = document.getElementById('deliveryWhFrom').value;
            items.forEach(function (item) {
              var product = productsMap[item.product_code] || {};
              var productName = (product.code || '') + ' вЂ” ' + (product.name || '');
              var stockRows = (stockCache || []).filter(function (s) { return s.product_code === item.product_code && (!whFrom || s.warehouse_code === whFrom); });
              stockRows.sort(function (a, b) {
                var ea = a.expiry_date || ''; var eb = b.expiry_date || '';
                return ea.localeCompare(eb);
              });
              var batchOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ РїР°СЂС‚РёСЋ вЂ”</option>';
              stockRows.forEach(function (r) {
                var days = (r.days_until_expiry != null ? r.days_until_expiry : '');
                var status = r.expiry_status || {};
                var color = status.color || '';
                var icon = status.icon || '';
                batchOpts += '<option value="' + escAttr(r.batch_code || '') + '" data-batch-id="' + escAttr(r.batch_id || '') + '" data-expiry="' + escAttr(r.expiry_date || '') + '" data-available="' + (r.total_qty != null ? r.total_qty : 0) + '" data-days="' + days + '" data-color="' + escAttr(color) + '" data-icon="' + escAttr(icon) + '">' + escAttr((r.batch_code || '') + (r.expiry_date ? ' вЂ” ' + formatDateOnly(r.expiry_date) : '')) + '</option>';
              });
              var price = (item.price != null ? parseFloat(item.price) : (product.price != null ? parseFloat(product.price) : 0)) || 0;
              var row = document.createElement('tr');
              row.className = 'delivery-row';
              row.setAttribute('data-product-code', item.product_code);
              row.setAttribute('data-order-qty', item.quantity || 0);
              row.setAttribute('data-price', price);
              row.innerHTML = '<td>' + escAttr(productName) + '</td><td><select class="delivery-batch" required>' + batchOpts + '</select></td><td class="delivery-expiry">вЂ”</td><td class="delivery-days" style="text-align:center">вЂ”</td><td class="delivery-available" style="text-align:right">0</td><td style="text-align:right;font-weight:600">' + (item.quantity || 0) + '</td><td><input type="number" class="delivery-qty" min="1" max="' + (item.quantity || 0) + '" value="' + (item.quantity || 0) + '" required></td><td class="delivery-price" style="text-align:right">' + (price ? price.toFixed(2) : 'вЂ”') + '</td><td class="delivery-sum" style="text-align:right">вЂ”</td>';
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
              expiryCell.textContent = expiry ? formatDateOnly(expiry) : 'вЂ”';
              availCell.textContent = avail;
              var orderQty = parseInt(row.getAttribute('data-order-qty') || '0', 10) || 0;
              var maxQty = Math.min(orderQty, avail);
              qtyInp.max = maxQty;
              if (parseInt(qtyInp.value || '0', 10) > maxQty) qtyInp.value = maxQty;
              if (daysCell) {
                if (daysAttr === null || daysAttr === '' || isNaN(parseInt(daysAttr, 10))) {
                  daysCell.textContent = 'вЂ”';
                } else {
                  var days = parseInt(daysAttr, 10);
                  var badgeColor = '#28a745';
                  if (color === 'YELLOW') badgeColor = '#ffc107';
                  else if (color === 'RED') badgeColor = '#dc3545';
                  else if (color === 'BLACK') badgeColor = '#343a40';
                  var iconChar = icon || (color === 'YELLOW' ? 'рџџЎ' : (color === 'RED' ? 'рџ”ґ' : (color === 'BLACK' ? 'вљ«' : 'рџџў')));
                  var daysText = days + ' РґРЅ.';
                  daysCell.innerHTML = '<span style="display:inline-block;padding:2px 6px;border-radius:4px;background:' + badgeColor + ';color:#fff;font-size:11px;font-weight:600">' + iconChar + ' ' + daysText + '</span>';
                }
              }
              updateRowSum();
            }
            function updateRowSum() {
              var qty = parseInt(qtyInp.value || '0', 10) || 0;
              var price = parseFloat(row.getAttribute('data-price') || '0') || 0;
              var sum = qty * price;
              sumCell.textContent = sum ? sum.toFixed(2) : 'вЂ”';
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
              var statusOptsHtml = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
              if (statuses && statuses.length) {
                statuses.forEach(function(s) {
                  statusOptsHtml += '<option value="' + escAttr(s.code) + '">' + escAttr(s.name || s.code) + '</option>';
                });
              } else {
                statusOptsHtml += '<option value="open">РћС‚РєСЂС‹С‚</option><option value="delivery">Р”РѕСЃС‚Р°РІРєР°</option>';
              }
              var modalHtml = '<div class="modal show" id="' + modalId + '"><div class="modal-inner" style="max-width:900px;max-height:90vh;overflow:auto"><h3>РџРѕРёСЃРє Р·Р°РєР°Р·Р°</h3>';
              modalHtml += '<div style="margin-bottom:16px"><div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-bottom:12px">';
              modalHtml += '<div><label style="display:block;margin-bottom:4px;font-size:13px;font-weight:600">Р­РєСЃРїРµРґРёС‚РѕСЂ</label><select id="orderSearchModalExpeditor" style="min-width:200px">' + expOpts + '</select></div>';
              modalHtml += '<div><label style="display:block;margin-bottom:4px;font-size:13px;font-weight:600">РЎС‚Р°С‚СѓСЃ</label><select id="orderSearchModalStatus" style="min-width:180px">' + statusOptsHtml + '</select></div>';
              modalHtml += '<div><label style="display:block;margin-bottom:4px;font-size:13px;font-weight:600">РљР»РёРµРЅС‚</label><select id="orderSearchModalCustomer" style="min-width:220px">' + custOpts + '</select></div>';
              modalHtml += '<div><button type="button" class="btn btn-primary" id="orderSearchModalBtn">РќР°Р№С‚Рё</button></div>';
              modalHtml += '</div><div style="margin-top:8px"><label><input type="checkbox" id="orderSearchModalNotClosed" checked> РўРѕР»СЊРєРѕ РЅРµ Р·Р°РєСЂС‹С‚С‹Рµ Р·Р°РєР°Р·С‹</label></div></div>';
              modalHtml += '<div id="orderSearchModalResults" style="margin-top:16px;max-height:400px;overflow-y:auto"></div>';
              modalHtml += '<div id="orderSearchModalErr" class="err" style="margin-top:8px"></div>';
              modalHtml += '<div class="modal-actions" style="margin-top:16px"><button type="button" class="btn btn-secondary" id="orderSearchModalCancel">РћС‚РјРµРЅР°</button></div></div></div>';
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
                if (resultsDiv) resultsDiv.innerHTML = '<p style="color:#666;text-align:center;padding:20px">РџРѕРёСЃРє...</p>';
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
                  
                  // РўРѕР»СЊРєРѕ РЅРµ Р·Р°РєСЂС‹С‚С‹Рµ: РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РїРѕРєР°Р·С‹РІР°РµРј С‚РѕР»СЊРєРѕ open Рё delivery (Р·Р°РєСЂС‹С‚С‹Рµ вЂ” completed Рё canceled)
                  if (filterNotClosed && orders && orders.length) {
                    var openStatusCodes = ['open', 'delivery'];
                    orders = orders.filter(function(o) {
                      var code = (o.status_code || '').toLowerCase().trim();
                      return openStatusCodes.indexOf(code) !== -1;
                    });
                  }
                  
                  if (!orders || !orders.length) {
                    resultsDiv.innerHTML = '<p style="color:#666;text-align:center;padding:20px">Р—Р°РєР°Р·С‹ РЅРµ РЅР°Р№РґРµРЅС‹. РР·РјРµРЅРёС‚Рµ РєСЂРёС‚РµСЂРёРё РїРѕРёСЃРєР°.</p>';
                    return;
                  }
                  var tableHtml = '<div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>в„–</th><th>РљР»РёРµРЅС‚</th><th>Р”Р°С‚Р° СЃРѕР·РґР°РЅРёСЏ</th><th>РЎС‚Р°С‚СѓСЃ</th><th>РЎСѓРјРјР°</th><th>Р­РєСЃРїРµРґРёС‚РѕСЂ</th><th>Р”РµР№СЃС‚РІРёРµ</th></tr></thead><tbody>';
                  orders.forEach(function(o) {
                    tableHtml += '<tr><td>' + (o.order_no || o.id) + '</td><td>' + escAttr(o.customer_name || '') + '</td><td>' + formatDateTashkent(o.order_date) + '</td><td>' + formatStatusBadge(o.status_code, o.status_name) + '</td><td>' + (o.total_amount || '0') + '</td><td>' + escAttr(o.login_expeditor || '') + '</td><td><button type="button" class="btn btn-primary btn-small" data-select-order="' + (o.order_no || o.id) + '">Р’С‹Р±СЂР°С‚СЊ</button></td></tr>';
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
                  var msg = 'РћС€РёР±РєР° РїРѕРёСЃРєР° Р·Р°РєР°Р·РѕРІ.';
                  if (e && e.data) {
                    var d = e.data.detail;
                    if (typeof d === 'string') msg = d;
                    else if (Array.isArray(d) && d.length) msg = d.map(function(x) { return x.msg || x.message || JSON.stringify(x); }).join(' ');
                    else if (d && typeof d === 'object') msg = JSON.stringify(d);
                  }
                  if (e && e.status) msg = 'РљРѕРґ ' + e.status + ': ' + msg;
                  else if (e && e.message) msg = msg + ' ' + String(e.message);
                  if (errDiv) errDiv.textContent = msg;
                  if (resultsDiv) resultsDiv.innerHTML = '';
                });
              }
              
              document.getElementById('orderSearchModalBtn').onclick = searchOrders;
              document.getElementById('orderSearchModalCancel').onclick = function() {
                document.getElementById(modalId).classList.remove('show');
              };
              // Р—Р°РєСЂС‹С‚РёРµ РїРѕ РєР»РёРєСѓ РІРЅРµ РјРѕРґР°Р»СЊРЅРѕРіРѕ РѕРєРЅР°
              document.getElementById(modalId).onclick = function(e) {
                if (e.target.id === modalId) {
                  document.getElementById(modalId).classList.remove('show');
                }
              };
              // РџРµСЂРІС‹Р№ РїРѕРёСЃРє Р±РµР· С„РёР»СЊС‚СЂРѕРІ вЂ” РїСЂРѕРІРµСЂРєР°, С‡С‚Рѕ API РѕС‚РІРµС‡Р°РµС‚
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
            if (!whFrom) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЃРєР»Р°Рґ РѕС‚.'; return; }
            if (!expeditor) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЌРєСЃРїРµРґРёС‚РѕСЂР°.'; return; }
            if (!customerId) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р°.'; return; }
            if (!paymentType) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ С‚РёРї РѕРїР»Р°С‚С‹.'; return; }
            if (!orderId) { if (errEl) errEl.textContent = 'Р’РІРµРґРёС‚Рµ РЅРѕРјРµСЂ Р·Р°РєР°Р·Р°.'; return; }
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
            if (!items.length) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ РїР°СЂС‚РёРё РґР»СЏ РІСЃРµС… С‚РѕРІР°СЂРѕРІ.'; return; }
            var comment = (document.getElementById('deliveryComment').value || '').trim() || null;
            var createdBy = (window.currentUser && window.currentUser.login) ? window.currentUser.login : null;
            var saveBtn = document.getElementById('deliverySave');
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            var createdCount = 0;
            var idx = 0;
            function createNext() {
              if (idx >= items.length) {
                var done = function () {
                  if (msgEl) { msgEl.textContent = 'РћРїРµСЂР°С†РёРё РґРѕСЃС‚Р°РІРєРё СЃРѕР·РґР°РЅС‹: ' + createdCount + ' С€С‚. Р—Р°РєР°Р· РїРµСЂРµРІРµРґС‘РЅ РІ СЃС‚Р°С‚СѓСЃ В«Р”РѕСЃС‚Р°РІР»РµРЅВ».'; msgEl.style.display = 'block'; }
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
                saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёРё';
                var detail = e && e.data && e.data.detail;
                if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
                if (detail && detail.errors) {
                  var errs = []; for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                  if (errEl) errEl.textContent = errs.join('; ');
                } else if (errEl) errEl.textContent = 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
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
          var formHtml = '<div class="card"><h2 id="opFormTitle">РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё: ' + escAttr(config.operation_name || config.operation_type) + '</h2>';
          if (config.description) formHtml += '<p style="color:#666;margin-bottom:16px">' + escAttr(config.description) + '</p>';
          formHtml += '<div id="opFormErr" class="err" style="margin-bottom:12px"></div><div id="opFormMsg" class="msg" style="margin-bottom:12px;display:none"></div>';
          var fieldMap = {
            warehouse_from: { label: 'РЎРєР»Р°Рґ РѕС‚', type: 'select', options: warehouses, id: 'opCreateWarehouseFrom' },
            warehouse_to: { label: 'РЎРєР»Р°Рґ РІ', type: 'select', options: warehouses, id: 'opCreateWarehouseTo' },
            product_code: { label: 'РўРѕРІР°СЂ', type: 'select', options: products, id: 'opCreateProduct' },
            batch_code: { label: 'РљРѕРґ РїР°СЂС‚РёРё', type: 'text', id: 'opCreateBatchCode', autoFromProductAndExpiry: true },
            expiry_date: { label: 'РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё', type: 'date', id: 'opCreateExpiryDate' },
            quantity: { label: 'РљРѕР»РёС‡РµСЃС‚РІРѕ', type: 'number', id: 'opCreateQuantity', min: 0 },
            amount: { label: 'РЎСѓРјРјР°', type: 'number', id: 'opCreateAmount', step: '0.01' },
            payment_type_code: { label: 'РўРёРї РѕРїР»Р°С‚С‹', type: 'select', options: paymentTypes, id: 'opCreatePaymentType' },
            customer_id: { label: 'РљР»РёРµРЅС‚', type: 'select', options: customers, id: 'opCreateCustomer' },
            order_id: { label: 'Р—Р°РєР°Р· в„–', type: 'number', id: 'opCreateOrderId', min: 0 },
            expeditor_login: { label: 'Р­РєСЃРїРµРґРёС‚РѕСЂ', type: 'select', options: (userList || []).filter(function (u) { return (u.role || '').toLowerCase() === 'expeditor'; }), id: 'opCreateExpeditor' },
            cashier_login: { label: 'РљР°СЃСЃРёСЂ', type: 'select', options: userList, id: 'opCreateCashier' },
            storekeeper_login: { label: 'РљР»Р°РґРѕРІС‰РёРє', type: 'select', options: userList, id: 'opCreateStorekeeper' },
            comment: { label: 'РљРѕРјРјРµРЅС‚Р°СЂРёР№', type: 'text', id: 'opCreateComment' },
            related_operation_id: { label: 'РЎРІСЏР·Р°РЅРЅР°СЏ РѕРїРµСЂР°С†РёСЏ', type: 'text', id: 'opCreateRelatedOp' }
          };
          fieldsToShow.forEach(function (fieldName) {
            if (hiddenFields.indexOf(fieldName) >= 0) return;
            var field = fieldMap[fieldName];
            if (!field) return;
            var isRequired = (config.required_fields || []).indexOf(fieldName) >= 0;
            var isReadonly = readonlyFields.indexOf(fieldName) >= 0;
            formHtml += '<div class="form-group"><label>' + escAttr(field.label || fieldName) + (isRequired ? ' <span style="color:#c00">*</span>' : '') + '</label>';
            if (fieldName === 'order_id' && config.operation_type === 'payment_receipt_from_customer') {
              formHtml += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input type="hidden" id="' + field.id + '"><input type="text" id="opCreateOrderDisplay" readonly placeholder="РЎРЅР°С‡Р°Р»Р° РІС‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р°" style="flex:1;min-width:200px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 10px"><button type="button" class="btn btn-secondary" id="opOrderPickBtn" disabled>Р’С‹Р±СЂР°С‚СЊ Р·Р°РєР°Р·</button></div></div>';
            } else if (fieldName === 'customer_id' && config.operation_type === 'payment_receipt_from_customer') {
              formHtml += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><input type="hidden" id="' + field.id + '"><input type="text" id="opCreateCustomerSearch" placeholder="РРќРќ РёР»Рё СЂ/СЃ" style="max-width:220px" autocomplete="off"><button type="button" class="btn btn-secondary" id="opCreateCustomerFind">РќР°Р№С‚Рё</button><span id="opCreateCustomerDisplay" style="color:#0f766e;font-weight:600"></span></div><div id="opCreateCustomerErr" class="err" style="margin-top:4px;font-size:12px"></div></div>';
            } else if (field.type === 'select') {
              var opts = '<option value="">вЂ” РќРµ СѓРєР°Р·Р°РЅ вЂ”</option>';
              if (field.options) {
                field.options.forEach(function (opt) {
                  if (fieldName === 'expeditor_login' && (opt.role || '').toLowerCase() !== 'expeditor') return;
                  var val = opt.code || opt.id || opt.login || '';
                  var text = (fieldName === 'customer_id')
                    ? ((opt.name_client || opt.firm_name || '') + ' (ID ' + (opt.id || '') + ')')
                    : ((fieldName === 'product_code')
                      ? ((opt.code || '') + ' вЂ” ' + (opt.name || ''))
                      : (opt.name || opt.code || opt.login || val));
                  opts += '<option value="' + escAttr(val) + '">' + escAttr(text) + '</option>';
                });
              }
              formHtml += '<select id="' + field.id + '"' + (isRequired ? ' required' : '') + (isReadonly ? ' disabled' : '') + '>' + opts + '</select></div>';
            } else {
              var inputType = field.type || 'text';
              var placeholder = (isRequired ? 'РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ' : 'РЅРµРѕР±СЏР·.');
              if (fieldName === 'expiry_date') { inputType = 'text'; placeholder = 'РґРґ.РјРј.РіРіРіРі'; }
              formHtml += '<input type="' + inputType + '" id="' + field.id + '"' + (isRequired ? ' required' : '') + (isReadonly ? ' readonly' : '') + (field.min !== undefined ? ' min="' + field.min + '"' : '') + (field.step !== undefined ? ' step="' + field.step + '"' : '') + ' placeholder="' + placeholder + '" autocomplete="off"></div>';
            }
          });
          formHtml += '<p style="margin-top:16px"><button type="button" class="btn btn-primary" id="opCreateSave">РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёСЋ</button> <button type="button" class="btn btn-secondary" id="opCreateCancel">РћС‚РјРµРЅР°</button></p></div>';
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
                if (orderDisplay) { orderDisplay.value = ''; orderDisplay.placeholder = 'РЎРЅР°С‡Р°Р»Р° РІС‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р°'; }
                if (amountEl) { amountEl.value = ''; amountEl.readOnly = false; }
                if (paymentTypeEl) { paymentTypeEl.value = ''; paymentTypeEl.disabled = false; }
              } else if (orderDisplay) orderDisplay.placeholder = 'РќР°Р¶РјРёС‚Рµ В«Р’С‹Р±СЂР°С‚СЊ Р·Р°РєР°Р·В»';
            }
            if (document.getElementById('opCreateCustomerFind')) {
              document.getElementById('opCreateCustomerFind').onclick = function () {
                var val = (customerSearchInput && customerSearchInput.value) ? customerSearchInput.value.trim() : '';
                if (customerErr) customerErr.textContent = '';
                if (!val) { if (customerErr) customerErr.textContent = 'Р’РІРµРґРёС‚Рµ РРќРќ РёР»Рё СЂР°СЃС‡С‘С‚РЅС‹Р№ СЃС‡С‘С‚'; return; }
                api('/api/v1/customers?search=' + encodeURIComponent(val)).then(function (data) {
                  var list = Array.isArray(data) ? data : (data && data.data ? data.data : []);
                  if (!list.length) { if (customerErr) customerErr.textContent = 'РљР»РёРµРЅС‚ РЅРµ РЅР°Р№РґРµРЅ'; return; }
                  var c = list[0];
                  var id = c.id != null ? c.id : c.customer_id;
                  if (customerIdInput) customerIdInput.value = id;
                  if (customerDisplay) customerDisplay.textContent = (c.name_client || c.firm_name || '') + ' (ID ' + id + ')';
                  if (customerErr) customerErr.textContent = '';
                  updateOrderPickState();
                }).catch(function () { if (customerErr) customerErr.textContent = 'РћС€РёР±РєР° РїРѕРёСЃРєР°'; });
              };
            }
            updateOrderPickState();
            if (orderPickBtn) {
              orderPickBtn.onclick = function () {
                var customerId = customerIdInput ? customerIdInput.value : '';
                if (!customerId || customerId.trim() === '') return;
                var modalId = 'opOrderPickModal_' + Date.now();
                var modalHtml = '<div class="modal show" id="' + modalId + '"><div class="modal-inner" style="max-width:700px;max-height:85vh;overflow:auto"><h3>Р’С‹Р±РѕСЂ Р·Р°РєР°Р·Р° (РЅРµРѕРїР»Р°С‡РµРЅРЅС‹Рµ)</h3><div id="opOrderPickLoading" style="padding:20px;text-align:center;color:#666">Р—Р°РіСЂСѓР·РєР° Р·Р°РєР°Р·РѕРІ...</div><div id="opOrderPickResults" style="margin-top:12px;max-height:400px;overflow-y:auto;display:none"></div><div id="opOrderPickErr" class="err" style="margin-top:8px"></div><div class="modal-actions" style="margin-top:16px"><button type="button" class="btn btn-secondary" id="opOrderPickCancel">РћС‚РјРµРЅР°</button></div></div></div>';
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
                      resultsEl.innerHTML = '<p style="color:#666;text-align:center;padding:20px">РќРµС‚ РЅРµРѕРїР»Р°С‡РµРЅРЅС‹С… Р·Р°РєР°Р·РѕРІ Сѓ РєР»РёРµРЅС‚Р°.</p>';
                      return;
                    }
                    var tableHtml = '<div style="overflow-x:auto"><table style="width:100%"><thead><tr><th>в„– Р·Р°РєР°Р·Р°</th><th>Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё</th><th>РЎС‚Р°С‚СѓСЃ</th><th>РЎСѓРјРјР°</th><th></th></tr></thead><tbody>';
                    orders.forEach(function (o) {
                      var orderNo = o.order_no != null ? o.order_no : o.id;
                      var deliveryDate = o.scheduled_delivery_at ? formatDateOnly(o.scheduled_delivery_at) : 'вЂ”';
                      var status = o.status_name || o.status_code || 'вЂ”';
                      var amount = o.total_amount != null ? (typeof o.total_amount === 'number' ? o.total_amount.toFixed(2) : o.total_amount) : 'вЂ”';
                      tableHtml += '<tr><td>' + escAttr(orderNo) + '</td><td>' + escAttr(deliveryDate) + '</td><td>' + formatStatusBadge(o.status_code, status) + '</td><td>' + escAttr(amount) + '</td><td><button type="button" class="btn btn-primary btn-small" data-op-select-order="' + escAttr(orderNo) + '" data-op-order-amount="' + escAttr(o.total_amount != null ? o.total_amount : '') + '" data-op-order-payment="' + escAttr(o.payment_type_code || '') + '" data-op-order-display="' + escAttr('в„– ' + orderNo + ' вЂ” ' + deliveryDate) + '">Р’С‹Р±СЂР°С‚СЊ</button></td></tr>';
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
                  var msg = 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р·Р°РєР°Р·РѕРІ.';
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
                if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ Р·Р°РєР°Р· РєР»РёРµРЅС‚Р°.';
                return;
              }
            }
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎРѕС…СЂР°РЅРµРЅРёРµ...';
            function doneSuccess(result) {
              if (msgEl) { msgEl.textContent = 'РћРїРµСЂР°С†РёСЏ СЃРѕР·РґР°РЅР°: ' + (result.operation_number || 'OK'); msgEl.style.display = 'block'; }
              setTimeout(function () { loadSectionOperations(false); }, 2000);
            }
            function doneError(e) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёСЋ';
              var detail = e && e.data && e.data.detail;
              if (typeof detail === 'string') { if (errEl) errEl.textContent = detail; return; }
              if (detail && detail.errors) {
                var errs = [];
                for (var k in detail.errors) errs.push(k + ': ' + detail.errors[k]);
                if (errEl) errEl.textContent = errs.join('; ');
              } else if (errEl) errEl.textContent = 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
            }
            api('/api/v1/operations/' + encodeURIComponent(config.operation_type) + '/create', { method: 'POST', body: JSON.stringify(payload) }).then(doneSuccess).catch(doneError);
          };
        }
        function openOperationCreate() {
          var content = document.getElementById('content');
          if (!content) return;
          // РџРѕРєР°Р·С‹РІР°РµРј UI СЃСЂР°Р·Сѓ вЂ” С‚РѕР»СЊРєРѕ С‚РёРї РѕРїРµСЂР°С†РёРё
          content.innerHTML = '<div class="card"><h2>РЎРѕР·РґР°РЅРёРµ РѕРїРµСЂР°С†РёРё</h2><div id="opFormErr" class="err" style="margin-bottom:12px"></div><div class="form-group"><label>РўРёРї РѕРїРµСЂР°С†РёРё <span style="color:#c00">*</span></label><select id="opSelectType" required><option value="">вЂ” Р—Р°РіСЂСѓР·РєР°...</option></select></div><div id="opFormContainer"></div></div>';
          // Р—Р°РіСЂСѓР¶Р°РµРј С‚РёРїС‹ РѕРїРµСЂР°С†РёР№ СЃСЂР°Р·Сѓ (Р±С‹СЃС‚СЂРѕ, РјР°Р»Рѕ РґР°РЅРЅС‹С…)
          api('/api/v1/operation-types').catch(function () { return []; }).then(function (types) {
            var typeOpts = '<option value="">вЂ” Р’С‹Р±РµСЂРёС‚Рµ С‚РёРї РѕРїРµСЂР°С†РёРё вЂ”</option>';
            (types || []).forEach(function (ty) {
              if (ty.active !== true || ty.has_config !== true) return;
              typeOpts += '<option value="' + escAttr(ty.code) + '">' + escAttr(ty.name || ty.code) + '</option>';
            });
            var sel = document.getElementById('opSelectType');
            if (sel) sel.innerHTML = typeOpts;
          });
          // Р¤РѕРЅРѕРІР°СЏ Р·Р°РіСЂСѓР·РєР° РѕСЃС‚Р°Р»СЊРЅС‹С… РґР°РЅРЅС‹С… (РєР»РёРµРЅС‚С‹, С‚РѕРІР°СЂС‹, СЃРєР»Р°РґС‹ Рё С‚.Рґ.)
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
            document.getElementById('opFormContainer').innerHTML = '<p>Р—Р°РіСЂСѓР·РєР° С„РѕСЂРјС‹...</p>';
            Promise.all([
              api('/api/v1/operations/' + encodeURIComponent(typeCode) + '/form-config'),
              formDataPromise
            ]).then(function (results) {
              var config = results[0];
              var fd = results[1];
              buildFormFromConfig(config, fd.customers, fd.products, fd.warehouses, fd.paymentTypes, fd.userList);
            }).catch(function (e) {
              var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) || 'РћС€РёР±РєР°';
              document.getElementById('opFormContainer').innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё: ' + escAttr(msg) + '</p>';
            });
          };
        }
        // Р”РµР»Р°РµРј С„СѓРЅРєС†РёСЋ РґРѕСЃС‚СѓРїРЅРѕР№ РёР· РіР»РѕР±Р°Р»СЊРЅРѕР№ РѕР±Р»Р°СЃС‚Рё РґР»СЏ showSection
        window.openOperationCreate = openOperationCreate;

        function bindOperationAdd() {
          var btn = document.getElementById('opAdd');
          if (!btn) return;
          btn.onclick = openOperationCreate;
        }
      }

      function loadSectionStock() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>РћСЃС‚Р°С‚РєРё РїРѕ СЃРєР»Р°РґСѓ</h2><p><label>РЎРєР»Р°Рґ </label><select id="stock_wh"><option value="">вЂ”</option></select> <button type="button" class="btn btn-primary" id="stockLoad">РџРѕРєР°Р·Р°С‚СЊ</button> <button type="button" class="btn btn-secondary" id="stockExport">Р’С‹РіСЂСѓР·РёС‚СЊ РІ Excel</button></p><div id="sectionTable" style="margin-top:12px"></div></div>';
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
          if (!data.length) { tableDiv.innerHTML = '<p>РќРµС‚ РѕСЃС‚Р°С‚РєРѕРІ.</p>'; return; }
          var sorted = data.slice().sort(function (a, b) {
            return tableSortCompare(a, b, stockSortCol, stockSortDir, function (r, c) {
              if (c === 'total_qty' || c === 'unit_price' || c === 'total_cost' || c === 'days_until_expiry') return (r[c] != null && r[c] !== '' ? String(Number(r[c])).padStart(20, '0') : '');
              if (c === 'expiry_date') return (r.expiry_date || '').toString();
              return (r[c] || r.warehouse_name || r.warehouse_code || r.product_name || '').toString().toLowerCase();
            });
          });
          var arrow = stockSortDir > 0 ? ' в–І' : ' в–ј';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (stockSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr>' + th('warehouse_code', 'РЎРєР»Р°Рґ') + th('product_code', 'РўРѕРІР°СЂ (РєРѕРґ)') + th('product_name', 'РќР°Р·РІР°РЅРёРµ С‚РѕРІР°СЂР°') + th('batch_code', 'РџР°СЂС‚РёСЏ (РєРѕРґ)') + th('total_qty', 'РћСЃС‚Р°С‚РѕРє') + th('unit_price', 'Р¦РµРЅР° Р·Р° 1 С€С‚') + th('total_cost', 'РЎСѓРјРјР°') + th('expiry_date', 'РЎСЂРѕРє РіРѕРґРЅРѕСЃС‚Рё') + th('days_until_expiry', 'Р”РЅРµР№ РѕСЃС‚Р°Р»РѕСЃСЊ') + '</tr></thead><tbody>';
          var totalQty = 0;
          var totalCost = 0;
          sorted.forEach(function (r) {
            var expiryDate = r.expiry_date ? formatDateOnly(r.expiry_date) : 'вЂ”';
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
              daysText = 'вЂ”';
            } else if (days <= 0) {
              daysText = (icon || 'вљ«') + ' РџСЂРѕСЃСЂРѕС‡РµРЅ (РґРЅРµР№: ' + days + ')';
            } else {
              daysText = (icon || 'рџџў') + ' ' + days + ' РґРЅ.';
            }
            var badgeHtml = daysText === 'вЂ”'
              ? 'вЂ”'
              : '<span class="badge" style="background-color:' + badgeColor + ';color:#fff;border-radius:4px;padding:4px 8px;font-size:12px;">' + escAttr(daysText) + '</span>';
            var price = (r.unit_price != null ? Number(r.unit_price) : 0);
            var cost = (r.total_cost != null ? Number(r.total_cost) : 0);
            var priceText = price ? price.toFixed(2) : 'вЂ”';
            var costText = cost ? cost.toFixed(2) : 'вЂ”';
            var qty = (r.total_qty != null ? r.total_qty : 0);
            totalQty += qty;
            totalCost += cost;
            t += '<tr><td>' + escAttr(r.warehouse_name || r.warehouse_code || '') + '</td><td>' + escAttr(r.product_code || '') + '</td><td>' + escAttr(r.product_name || '') + '</td><td>' + escAttr(r.batch_code || 'вЂ”') + '</td><td style="text-align:right;font-weight:600">' + qty + '</td><td style="text-align:right;">' + priceText + '</td><td style="text-align:right;font-weight:600">' + costText + '</td><td>' + expiryDate + '</td><td style="text-align:center;">' + badgeHtml + '</td></tr>';
          });
          // СЃС‚СЂРѕРєР° РРўРћР“Рћ
          t += '<tr style="background:#f8f9fa;font-weight:600"><td colspan="4" style="text-align:right;padding:8px">РС‚РѕРіРѕ:</td><td style="text-align:right;padding:8px">' + totalQty + '</td><td></td><td style="text-align:right;padding:8px">' + (totalCost ? totalCost.toFixed(2) : '0') + '</td><td></td><td></td></tr>';
          t += '</tbody></table></div>';
          tableDiv.innerHTML = t;
          tableDiv.querySelectorAll('th.sortable').forEach(function (thEl) {
            thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (stockSortCol === col) stockSortDir = -stockSortDir; else { stockSortCol = col; stockSortDir = 1; } renderStockTable(lastStockData); };
          });
        }
        document.getElementById('stockLoad').onclick = function () {
          var code = document.getElementById('stock_wh').value;
          var tableDiv = document.getElementById('sectionTable');
          tableDiv.innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
          var url = '/api/v1/warehouse/stock';
          if (code) url += '?warehouse=' + encodeURIComponent(code);
          api(url).then(function (response) {
            var data = (response && response.success && Array.isArray(response.data)) ? response.data : (Array.isArray(response) ? response : []);
            if (!data.length) { tableDiv.innerHTML = '<p>РќРµС‚ РѕСЃС‚Р°С‚РєРѕРІ' + (code ? ' РЅР° РІС‹Р±СЂР°РЅРЅРѕРј СЃРєР»Р°РґРµ' : '') + '.</p>'; return; }
            renderStockTable(data);
          }).catch(function (e) {
            var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.data && e.data.error) ? e.data.error : (e && e.message) || 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё';
            tableDiv.innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё: ' + escAttr(msg) + '</p>';
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
            var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : (e && e.message) || 'РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё';
            alert(msg);
          });
        };
      }

      function loadSectionCashPending() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>РћР¶РёРґР°СЋС‰РёРµ РїРµСЂРµРґР°С‡Рё РѕС‚ СЌРєСЃРїРµРґРёС‚РѕСЂРѕРІ</h2><p style="color:#666;font-size:13px;margin-bottom:16px">РџРµСЂРµРґР°С‡Рё РЅР°Р»РёС‡РЅС‹С… (cash_handover_from_expeditor) СЃРѕ СЃС‚Р°С‚СѓСЃРѕРј pending. Р’С‹Р±РµСЂРёС‚Рµ РїРµСЂРµРґР°С‡Сѓ Рё РЅР°Р¶РјРёС‚Рµ В«РџСЂРёРЅСЏС‚СЊВ» РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РѕРїРµСЂР°С†РёРё cash_receipt.</p><div id="cashPendingList"><p>Р—Р°РіСЂСѓР·РєР°...</p></div></div>';
        var div = document.getElementById('cashPendingList');
        var cpSortCol = 'operation_number';
        var cpSortDir = 1;
        var lastCpData = null;
        function renderCashPendingTable(data) {
          lastCpData = data;
          if (!div) return;
          if (!data.length) {
            div.innerHTML = '<p style="color:#666">РќРµС‚ РѕР¶РёРґР°СЋС‰РёС… РїРµСЂРµРґР°С‡.</p>';
            return;
          }
          var sorted = data.slice().sort(function (a, b) {
            return tableSortCompare(a, b, cpSortCol, cpSortDir, function (r, c) {
              if (c === 'amount') return (r.amount != null ? String(Number(r.amount)).padStart(20, '0') : '');
              return (r[c] || (r.expeditor_login || r.expeditor_fio) || (r.customer_name || (r.customer_id != null ? 'ID ' + r.customer_id : '')) || '').toString().toLowerCase();
            });
          });
          var arrow = cpSortDir > 0 ? ' в–І' : ' в–ј';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (cpSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr>' + th('operation_number', 'в„– РѕРїРµСЂР°С†РёРё') + th('expeditor_login', 'Р­РєСЃРїРµРґРёС‚РѕСЂ') + th('order_id', 'Р—Р°РєР°Р· в„–') + th('customer_name', 'РљР»РёРµРЅС‚') + th('amount', 'РЎСѓРјРјР°') + th('operation_date', 'Р”Р°С‚Р°') + '<th>Р”РµР№СЃС‚РІРёРµ</th></tr></thead><tbody>';
          sorted.forEach(function (h) {
            var amt = (h.amount != null) ? Number(h.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 'вЂ”';
            var dt = h.operation_date ? formatDateOnly(h.operation_date) : 'вЂ”';
            var exp = (h.expeditor_fio || h.expeditor_login || '') ? ((h.expeditor_login || '') + (h.expeditor_fio ? ' вЂ” ' + h.expeditor_fio : '')) : 'вЂ”';
            var orderNo = h.order_id != null ? h.order_id : 'вЂ”';
            var custName = h.customer_name || (h.customer_id != null ? 'ID ' + h.customer_id : 'вЂ”');
            t += '<tr><td>' + escAttr(h.operation_number || '') + '</td><td>' + escAttr(exp) + '</td><td>' + escAttr(orderNo) + '</td><td>' + escAttr(custName) + '</td><td style="text-align:right;font-weight:600">' + amt + '</td><td>' + dt + '</td><td><button type="button" class="btn btn-primary btn-small" data-accept-handover data-id="' + escAttr(h.id || '') + '" data-amount="' + escAttr(h.amount || '') + '" data-expeditor="' + escAttr(h.expeditor_login || '') + '">РџСЂРёРЅСЏС‚СЊ</button></td></tr>';
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
                var formHtml = '<div class="form-group"><label>РЎСѓРјРјР° (РѕС‚ РїРµСЂРµРґР°С‡Рё) <span style="color:#c00">*</span></label><input type="number" id="cr_amount" step="0.01" value="' + escAttr(amount || '') + '" required></div>';
                formHtml += '<div class="form-group"><label>РўРёРї РѕРїР»Р°С‚С‹ <span style="color:#c00">*</span></label><select id="cr_payment_type"><option value="cash_sum">РќР°Р»РёС‡РЅС‹Рµ</option></select></div>';
                formHtml += '<div class="form-group"><label>РљР°СЃСЃРёСЂ <span style="color:#c00">*</span></label><select id="cr_cashier"></select></div>';
                formHtml += '<div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="cr_comment" placeholder="РЅРµРѕР±СЏР·."></div>';
                showModal('РџСЂРёС‘Рј РЅР°Р»РёС‡РЅС‹С… РІ РєР°СЃСЃСѓ', formHtml, function (errEl) { return Promise.resolve(); });
                api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
                  var sel = document.getElementById('cr_cashier');
                  if (sel) {
                    userList = userList || [];
                    var me = (currentUser && currentUser.login) ? currentUser.login : '';
                    userList.forEach(function (u) {
                      var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' вЂ” ' + u.fio : ''); sel.appendChild(o);
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
                submitBtn.textContent = 'РџСЂРёРЅСЏС‚СЊ РЅР°Р»РёС‡РЅС‹Рµ';
                document.getElementById('modalContainer').querySelector('.modal-actions').appendChild(submitBtn);
                submitBtn.onclick = function () {
                  var errEl = document.querySelector('#modalContainer .modal.show .err');
                  var amountVal = document.getElementById('cr_amount').value;
                  var payType = document.getElementById('cr_payment_type').value;
                  var cashier = document.getElementById('cr_cashier').value;
                  var comment = document.getElementById('cr_comment').value.trim() || null;
                  if (!amountVal || parseFloat(amountVal) <= 0) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ СЃСѓРјРјСѓ.'; return; }
                  if (!cashier) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РєР°СЃСЃРёСЂР°.'; return; }
                  api('/api/v1/finances/accept-handover', { method: 'POST', body: JSON.stringify({ handover_operation_id: id, cashier_login: cashier, amount: parseFloat(amountVal), comment: comment || null }) }).then(function () {
                    var m = document.querySelector('#modalContainer .modal.show'); if (m) m.classList.remove('show');
                    loadPending();
                  }).catch(function (e) {
                    var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
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
            if (div) div.innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</p>';
          });
        }
        loadPending();
      }

      function loadSectionCashReceived() {
        var content = document.getElementById('content');
        var today = new Date();
        var todayStr = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
        content.innerHTML = '<div class="card"><h2>РџСЂРёРЅСЏС‚С‹Рµ РґРµРЅСЊРіРё Р·Р° РїРµСЂРёРѕРґ</h2><p><label>Р”Р°С‚Р° СЃ </label><input type="text" id="cashDateFrom" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:130px"> <label>РїРѕ </label><input type="text" id="cashDateTo" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:130px"> <button type="button" class="btn btn-primary" id="cashLoadReceived">РџРѕРєР°Р·Р°С‚СЊ</button> <button type="button" class="btn btn-secondary" id="cashExportExcel">Р’С‹РіСЂСѓР·РёС‚СЊ РІ Excel</button> <button type="button" class="btn btn-secondary" id="cashCreateManual">РЎРѕР·РґР°С‚СЊ РѕРїРµСЂР°С†РёСЋ РїСЂРёС‘РјР° РїР»Р°С‚РµР¶Р° (РѕС‚ РєР»РёРµРЅС‚Р°)</button></p><div id="cashReceivedList" style="margin-top:12px"><p>Р—Р°РіСЂСѓР·РєР°...</p></div></div>';
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
            if (div) div.innerHTML = '<p style="color:#666">РќРµС‚ РїСЂРёРЅСЏС‚С‹С… РґРµРЅРµРі Р·Р° РІС‹Р±СЂР°РЅРЅС‹Р№ РїРµСЂРёРѕРґ.</p>';
            return;
          }
          var sorted = data.slice().sort(function (a, b) {
            return tableSortCompare(a, b, crSortCol, crSortDir, function (r, c) {
              if (c === 'amount') return (r.amount != null ? String(Number(r.amount)).padStart(20, '0') : '');
              return (r[c] || '').toString().toLowerCase();
            });
          });
          var arrow = crSortDir > 0 ? ' в–І' : ' в–ј';
          var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (crSortCol === col ? arrow : '') + '</th>'; };
          var t = '<div style="overflow-x:auto"><table><thead><tr>' + th('operation_number', 'в„– РѕРїРµСЂР°С†РёРё') + th('amount', 'РЎСѓРјРјР°') + th('payment_type_code', 'РўРёРї РѕРїР»Р°С‚С‹') + th('cashier_login', 'РљР°СЃСЃРёСЂ') + '<th>РСЃС‚РѕС‡РЅРёРє</th>' + th('operation_date', 'Р”Р°С‚Р°') + '</tr></thead><tbody>';
          sorted.forEach(function (r) {
              var amt = (r.amount != null) ? Number(r.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 'вЂ”';
              var dt = r.operation_date ? formatDateOnly(r.operation_date) : 'вЂ”';
              var source = r.expeditor_login ? ('РѕС‚ СЌРєСЃРїРµРґРёС‚РѕСЂР° ' + r.expeditor_login) : (r.customer_id != null ? 'РѕС‚ РєР»РёРµРЅС‚Р° (ID ' + r.customer_id + ')' : 'РѕС‚ РєР»РёРµРЅС‚Р°');
              t += '<tr><td>' + escAttr(r.operation_number || '') + '</td><td style="text-align:right;font-weight:600">' + amt + '</td><td>' + escAttr(r.payment_type_code || '') + '</td><td>' + escAttr(r.cashier_login || '') + '</td><td>' + escAttr(source) + '</td><td>' + dt + '</td></tr>';
            });
          t += '</tbody></table></div><p style="margin-top:12px;font-weight:600">РС‚РѕРіРѕ Р·Р° РїРµСЂРёРѕРґ: ' + lastCrTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' СЃСѓРј</p>';
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
            div.innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</p>';
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
          }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cash_received.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function (e) { alert('РћС€РёР±РєР°: ' + (e && e.data && e.data.detail ? e.data.detail : 'РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё')); });
        };
        document.getElementById('cashCreateManual').onclick = function () {
          var formHtml = '<div class="form-group"><label>РЎСѓРјРјР° <span style="color:#c00">*</span></label><input type="number" id="crm_amount" step="0.01" required></div>';
          formHtml += '<div class="form-group"><label>РўРёРї РѕРїР»Р°С‚С‹ <span style="color:#c00">*</span></label><select id="crm_payment_type"><option value="bank_sum">Р‘Р°РЅРєРѕРІСЃРєРёР№ РїРµСЂРµРІРѕРґ</option></select></div>';
          formHtml += '<div class="form-group"><label>РљР°СЃСЃРёСЂ <span style="color:#c00">*</span></label><select id="crm_cashier"></select></div>';
          formHtml += '<div class="form-group"><label>РљР»РёРµРЅС‚ (ID)</label><input type="number" id="crm_customer_id" placeholder="РЅРµРѕР±СЏР·."></div>';
          formHtml += '<div class="form-group"><label>Р—Р°РєР°Р· в„–</label><input type="number" id="crm_order_id" placeholder="РЅРµРѕР±СЏР·."></div>';
          formHtml += '<div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="crm_comment" placeholder="РЅРµРѕР±СЏР·."></div>';
          showModal('РЎРѕР·РґР°С‚СЊ РѕРїРµСЂР°С†РёСЋ РїСЂРёС‘РјР° РїР»Р°С‚РµР¶Р° (РѕС‚ РєР»РёРµРЅС‚Р°)', formHtml, function (errEl) {
            var amountVal = document.getElementById('crm_amount').value;
            var payType = document.getElementById('crm_payment_type').value;
            var cashier = document.getElementById('crm_cashier').value;
            var custId = document.getElementById('crm_customer_id').value;
            var orderId = document.getElementById('crm_order_id').value;
            var comment = document.getElementById('crm_comment').value.trim() || null;
            if (!amountVal || parseFloat(amountVal) <= 0) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ СЃСѓРјРјСѓ.'; return Promise.reject(); }
            if (!payType) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ С‚РёРї РѕРїР»Р°С‚С‹.'; return Promise.reject(); }
            if (!cashier) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РєР°СЃСЃРёСЂР°.'; return Promise.reject(); }
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
                var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' вЂ” ' + u.fio : ''); sel.appendChild(o);
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
        content.innerHTML = '<div class="card"><h2>Р—Р°РєР°Р·С‹ РґР»СЏ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РѕРїР»Р°С‚С‹</h2><p style="color:#666;margin-bottom:12px">Р—Р°РєР°Р·С‹ СЃ СѓРєР°Р·Р°РЅРЅС‹Рј С‚РёРїРѕРј РѕРїР»Р°С‚С‹. РџРѕРґС‚РІРµСЂРґРёС‚Рµ РїСЂРёС‘Рј РґРµРЅРµРі РїРѕ РєР°Р¶РґРѕРјСѓ Р·Р°РєР°Р·Сѓ.</p><div style="margin-bottom:12px;display:flex;flex-wrap:wrap;align-items:flex-end;gap:8px 16px"><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РўРёРї РѕРїР»Р°С‚С‹</label><select id="cof_payment_type" style="max-width:180px"><option value="">вЂ” Р’СЃРµ вЂ”</option></select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РЎС‚Р°С‚СѓСЃ</label><select id="cof_status" style="max-width:160px"><option value="">вЂ” Р’СЃРµ вЂ”</option></select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РћРїР»Р°С‚Р° РїРѕРґС‚РІРµСЂР¶РґРµРЅР°</label><select id="cof_payment_confirmed" style="max-width:160px"><option value="">Р’СЃРµ</option><option value="true">РџРѕРґС‚РІРµСЂР¶РґРµРЅРѕ</option><option value="false">РќРµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРѕ</option></select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё СЃ</label><input type="text" id="cof_date_from" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:130px"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё РїРѕ</label><input type="text" id="cof_date_to" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:130px"></div><button type="button" class="btn btn-primary" id="cof_apply">РџРѕРєР°Р·Р°С‚СЊ</button> <button type="button" class="btn btn-secondary" id="cashierOrdersExport">Р’С‹РіСЂСѓР·РёС‚СЊ РІ Excel</button></div><div id="cashierOrdersList" style="margin-top:12px"><p>Р—Р°РіСЂСѓР·РєР°...</p></div></div>';
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
            div.innerHTML = '<p style="color:#666">РќРµС‚ Р·Р°РєР°Р·РѕРІ СЃ С‚РёРїРѕРј РѕРїР»Р°С‚С‹.</p>';
            return;
          }
          var t = '<div style="overflow-x:auto"><table><thead><tr><th>в„– Р·Р°РєР°Р·Р°</th><th>РљР»РёРµРЅС‚</th><th>РРќРќ</th><th>Р /РЎ</th><th>РђРіРµРЅС‚</th><th>Р­РєСЃРїРµРґРёС‚РѕСЂ</th><th>РЎСѓРјРјР°</th><th>РўРёРї РѕРїР»Р°С‚С‹</th><th>РЎС‚Р°С‚СѓСЃ</th><th>Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё Р·Р°РєР°Р·Р°</th><th>РћРїР»Р°С‚Р° РїРѕРґС‚РІРµСЂР¶РґРµРЅР°</th><th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
          data.forEach(function (r) {
            var amt = (r.total_amount != null) ? Number(r.total_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : 'вЂ”';
            var payConfirmed = r.payment_confirmed ? '<span class="status-badge status-badge--completed">РџРѕРґС‚РІРµСЂР¶РґРµРЅРѕ</span>' : '<span class="status-badge status-badge--pending">РќРµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРѕ</span>';
            var confirmBtn = r.payment_confirmed ? '' : '<button type="button" class="btn btn-primary btn-small" data-order-no="' + escAttr(r.order_no) + '" data-customer-id="' + (r.customer_id || '') + '" data-amount="' + (r.total_amount != null ? r.total_amount : '') + '" data-payment-type="' + escAttr(r.payment_type_code || '') + '">РџРѕРґС‚РІРµСЂРґРёС‚СЊ РѕРїР»Р°С‚Сѓ</button>';
            var deliveryDate = 'вЂ”';
            if (r.scheduled_delivery_at) {
              try {
                var d = parseBackendDate(r.scheduled_delivery_at);
                if (!d) throw new Error('Invalid date');
                deliveryDate = d.toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              } catch (e) { deliveryDate = r.scheduled_delivery_at; }
            }
            t += '<tr><td>' + escAttr(r.order_no || '') + '</td><td>' + escAttr(r.customer_name || 'вЂ”') + '</td><td>' + escAttr(r.tax_id || 'вЂ”') + '</td><td>' + escAttr(r.account_no || 'вЂ”') + '</td><td>' + escAttr(r.agent_name || r.login_agent || 'вЂ”') + '</td><td>' + escAttr(r.expeditor_name || r.login_expeditor || 'вЂ”') + '</td><td style="text-align:right;font-weight:600">' + amt + '</td><td>' + escAttr(r.payment_type_name || r.payment_type_code || '') + '</td><td>' + escAttr(r.status_name || r.status_code || '') + '</td><td>' + deliveryDate + '</td><td>' + payConfirmed + '</td><td>' + confirmBtn + '</td></tr>';
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
          }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders_for_confirmation.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function (e) { alert('РћС€РёР±РєР°: ' + (e && e.data && e.data.detail ? e.data.detail : 'РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё')); });
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
              if (div) div.innerHTML = '<p class="err">РћС€РёР±РєР°: ' + escAttr(res.error) + '</p>';
              return;
            }
            var data = (res && res.data) ? res.data : [];
            renderCashierOrdersTable(data);
          }).catch(function (e) {
            var msg = 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё';
            if (e && e.data) {
              if (typeof e.data.detail === 'string') msg = e.data.detail;
              else if (e.data.detail) msg = JSON.stringify(e.data.detail);
            }
            if (e && e.status === 404) msg = 'API РЅРµ РЅР°Р№РґРµРЅ (404). РџРµСЂРµР·Р°РїСѓСЃС‚РёС‚Рµ СЃРµСЂРІРµСЂ Рё РѕР±РЅРѕРІРёС‚Рµ СЃС‚СЂР°РЅРёС†Сѓ.';
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
            ptSel.innerHTML = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
            pts.forEach(function (p) { var o = document.createElement('option'); o.value = p.code; o.textContent = p.name || p.code; ptSel.appendChild(o); });
          }
          if (stSel) {
            stSel.innerHTML = '<option value="">вЂ” Р’СЃРµ вЂ”</option>';
            sts.forEach(function (s) { var o = document.createElement('option'); o.value = s.code; o.textContent = s.name || s.code; stSel.appendChild(o); });
          }
          loadCashierOrders();
        });
      }

      function openCashierConfirmModal(orderNo, customerId, amount, paymentType, onSuccess) {
        var formHtml = '<div class="form-group"><label>Р—Р°РєР°Р· в„–</label><div class="form-readonly">' + escAttr(orderNo) + '</div></div>';
        formHtml += '<div class="form-group"><label>РЎСѓРјРјР° <span style="color:#c00">*</span></label><input type="number" id="ccm_amount" step="0.01" value="' + (amount != null && !isNaN(amount) ? amount : '') + '" required></div>';
        formHtml += '<div class="form-group"><label>РўРёРї РѕРїР»Р°С‚С‹ <span style="color:#c00">*</span></label><select id="ccm_payment_type"></select></div>';
        formHtml += '<div class="form-group"><label>РљР°СЃСЃРёСЂ <span style="color:#c00">*</span></label><select id="ccm_cashier"></select></div>';
        formHtml += '<div class="form-group"><label>РљР»РёРµРЅС‚ (ID)</label><input type="number" id="ccm_customer_id" value="' + (customerId != null && !isNaN(customerId) ? customerId : '') + '" readonly class="from-order"></div>';
        formHtml += '<div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><input type="text" id="ccm_comment" placeholder="РЅРµРѕР±СЏР·."></div>';
        showModal('РџРѕРґС‚РІРµСЂРґРёС‚СЊ РїСЂРёС‘Рј РґРµРЅРµРі РїРѕ Р·Р°РєР°Р·Сѓ в„–' + orderNo, formHtml, function (errEl) {
          var amountVal = document.getElementById('ccm_amount').value;
          var payType = document.getElementById('ccm_payment_type').value;
          var cashier = document.getElementById('ccm_cashier').value;
          var comment = document.getElementById('ccm_comment').value.trim() || null;
          if (!amountVal || parseFloat(amountVal) <= 0) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ СЃСѓРјРјСѓ.'; return Promise.reject(); }
          if (!payType) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ С‚РёРї РѕРїР»Р°С‚С‹.'; return Promise.reject(); }
          if (!cashier) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РєР°СЃСЃРёСЂР°.'; return Promise.reject(); }
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
              var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' вЂ” ' + u.fio : ''); sel.appendChild(o);
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
        content.innerHTML = '<div class="card"><h2>РџРѕРёСЃРє РІРёР·РёС‚Р°</h2><div class="form-group" style="margin:12px 0"><label>РџРѕРёСЃРє</label></div><div id="vsSearchRow" style="display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:12px"></div><p><strong>Р РµР·СѓР»СЊС‚Р°С‚С‹</strong> (<span id="vs_total">0</span>):</p><div id="vs_table"></div></div>';
        var searchRow = document.getElementById('vsSearchRow');
        api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
          userList = userList || [];
          var respOpts = '<option value="">Р’СЃРµ СЃРѕС‚СЂСѓРґРЅРёРєРё</option>';
          userList.forEach(function (u) { respOpts += '<option value="' + escAttr(u.login) + '">' + escAttr((u.login || '') + (u.fio ? ' вЂ” ' + u.fio : '')) + '</option>'; });
          var statusOptions = [
            { code: 'planned', label: 'Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ' },
            { code: 'postponed', label: 'РќР° СЂР°СЃСЃРјРѕС‚СЂРµРЅРёРё' },
            { code: 'completed', label: 'Р—Р°РІРµСЂС€С‘РЅ' },
            { code: 'cancelled', label: 'РћС‚РјРµРЅС‘РЅ' }
          ];
          var statusHtml = '<div class="multiselect-status" id="vs_status_container"><div class="multiselect-trigger" id="vs_status_trigger"><div class="multiselect-tags" id="vs_status_tags"></div><button type="button" class="multiselect-clear" id="vs_status_clear" title="РћС‡РёСЃС‚РёС‚СЊ">Г—</button><span class="multiselect-arrow">в–ј</span></div><div class="multiselect-dropdown" id="vs_status_dropdown">';
          statusOptions.forEach(function (o) {
            statusHtml += '<label><input type="checkbox" value="' + escAttr(o.code) + '" id="vs_status_' + o.code + '"> ' + escAttr(o.label) + '</label>';
          });
          statusHtml += '</div></div>';
          searchRow.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:6px"><label style="font-size:11px;color:#666;display:block;margin-bottom:2px;width:100%">РљР»РёРµРЅС‚</label><input type="text" id="vs_customer_search" placeholder="РќР°Р·РІР°РЅРёРµ РёР»Рё РРќРќ" style="max-width:120px" title="Р’РІРµРґРёС‚Рµ РјРёРЅ. 2 СЃРёРјРІРѕР»Р°"><select id="vs_customer_pick" style="max-width:200px"><option value="">вЂ” Р’СЃРµ РєР»РёРµРЅС‚С‹ вЂ”</option></select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РЎС‚Р°С‚СѓСЃ</label>' + statusHtml + '</div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</label><select id="vs_responsible" style="max-width:160px">' + respOpts + '</select></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">Р”Р°С‚Р° РѕС‚</label><input type="text" id="vs_from" style="max-width:130px" placeholder="РґРґ.РјРј.РіРіРіРі"></div><div><label style="font-size:11px;color:#666;display:block;margin-bottom:2px">РїРѕ</label><input type="text" id="vs_to" style="max-width:130px" placeholder="РґРґ.РјРј.РіРіРіРі"></div><button type="button" class="btn btn-primary" id="vs_find">РќР°Р№С‚Рё</button> <button type="button" class="btn btn-secondary" id="vs_reset">РЎР±СЂРѕСЃРёС‚СЊ</button> <button type="button" class="btn btn-secondary" id="vs_export">Р’С‹РіСЂСѓР·РёС‚СЊ РІ Excel</button>';
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
              tagsEl.innerHTML = '<span class="multiselect-placeholder">Р’С‹Р±РµСЂРёС‚Рµ СЃС‚Р°С‚СѓСЃС‹</span>';
              return;
            }
            var html = '';
            var showCount = 1;
            selected.slice(0, showCount).forEach(function (o) {
              html += '<span class="multiselect-tag" data-code="' + escAttr(o.code) + '">' + escAttr(o.label) + ' <span class="multiselect-tag-remove">Г—</span></span>';
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
            document.getElementById('vs_customer_pick').innerHTML = '<option value="">вЂ” Р’СЃРµ РєР»РёРµРЅС‚С‹ вЂ”</option>';
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
            }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'visits.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function (e) { alert('РћС€РёР±РєР°: ' + (e && e.data && e.data.detail ? e.data.detail : 'РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё')); });
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
                vsPick.innerHTML = '<option value="">вЂ” Р’СЃРµ РєР»РёРµРЅС‚С‹ вЂ”</option>';
                list.forEach(function (c) {
                  var name = (c.name_client || c.firm_name || '').trim() || ('РљР»РёРµРЅС‚ #' + c.id);
                  var label = 'в—‹ ' + name + (c.tax_id ? ' (РРќРќ ' + c.tax_id + ')' : '');
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
              var dateStr = visit.visit_date ? formatDateOnly(visit.visit_date) : 'вЂ”';
              var timeStr = (visit.visit_time || '').toString().substring(0, 5) || 'вЂ”';
              var dtCombined = (dateStr + (timeStr && timeStr !== 'вЂ”' ? ' ' + timeStr : '')).trim() || 'вЂ”';
              var body = '<div class="form-group"><label>РљР»РёРµРЅС‚</label><div>' + escAttr(visit.customer_name || '') + '</div></div><div class="form-group"><label>Р”Р°С‚Р° Рё РІСЂРµРјСЏ</label><div>' + escAttr(dtCombined) + '</div></div><div class="form-group"><label>РЎС‚Р°С‚СѓСЃ</label><div>' + escAttr(visitStatusRu(visit.status)) + '</div></div><div class="form-group"><label>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</label><div>' + escAttr(visit.responsible_name || visit.responsible_login || '') + '</div></div>' + (visit.comment ? '<div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><div>' + escAttr(visit.comment) + '</div></div>' : '') + '<p style="text-align:center"><button type="button" class="btn btn-secondary" id="vcard_edit">РР·РјРµРЅРёС‚СЊ</button></p>';
              showModal('РљР°СЂС‚РѕС‡РєР° РІРёР·РёС‚Р°', body, function () { return Promise.resolve(); });
              var saveBtn = document.querySelector('#modalContainer .modal-actions .btn-primary');
              if (saveBtn) saveBtn.textContent = 'Р—Р°РєСЂС‹С‚СЊ';
              var editBtn = document.getElementById('vcard_edit');
              if (editBtn) editBtn.onclick = function () {
                document.querySelector('#modalContainer .modal.show') && document.querySelector('#modalContainer .modal.show').classList.remove('show');
                openVisitEditModal(visit.customer_id, visit, userList, refreshCallback || function () {});
              };
            });
          }).catch(function (e) {
            var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР°';
            alert(msg);
          });
        }
        var vsSortCol = 'visit_date';
        var vsSortDir = 1;
        var lastVsData = null;
        function renderVisitsTable(data) {
          if (!data || !data.length) { document.getElementById('vs_table').innerHTML = '<p>РќРµС‚ РІРёР·РёС‚РѕРІ.</p>'; return; }
          var sorted = data.slice().sort(function (a, b) { return tableSortCompare(a, b, vsSortCol, vsSortDir); });
          var arrow = vsSortDir > 0 ? ' в–І' : ' в–ј';
          var thf = function (c, lbl) { return '<th class="sortable" data-col="' + c + '" style="cursor:pointer">' + lbl + (vsSortCol === c ? arrow : '') + '</th>'; };
          var tb = '<div style="overflow-x:auto"><table><thead><tr>' + thf('visit_date', 'Р”Р°С‚Р° Рё РІСЂРµРјСЏ') + thf('customer_name', 'РљР»РёРµРЅС‚') + thf('status', 'РЎС‚Р°С‚СѓСЃ') + thf('responsible_login', 'РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№') + '<th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
          sorted.forEach(function (v) {
            var sc = 'status-badge--default';
            if (v.status === 'completed') sc = 'status-badge--completed';
            else if (v.status === 'cancelled') sc = 'status-badge--cancelled';
            else if (v.status === 'planned') sc = 'status-badge--delivery';
            var ds = v.visit_date ? formatDateOnly(v.visit_date) : 'вЂ”';
            var ts = (v.visit_time || '').toString().substring(0, 5) || '';
            var dtCombined = (ds + (ts && ts !== 'вЂ”' ? ' ' + ts : '')).trim();
            var sru = visitStatusRu(v.status);
            tb += '<tr><td>' + escAttr(dtCombined) + '</td><td>' + escAttr(v.customer_name || '') + '</td><td><span class="status-badge ' + sc + '">' + escAttr(sru) + '</span></td><td>' + escAttr(v.responsible_name || v.responsible_login || '') + '</td><td><button type="button" class="btn btn-secondary btn-small" data-visit-id="' + (v.id || '') + '">РћС‚РєСЂС‹С‚СЊ</button></td></tr>';
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
          document.getElementById('vs_table').innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
          api('/api/v1/visits/search?' + params.join('&')).then(function (res) {
            var total = (res && res.total != null) ? res.total : 0;
            var data = (res && res.data) ? res.data : [];
            lastVsData = data;
            document.getElementById('vs_total').textContent = total;
            if (!data.length) { document.getElementById('vs_table').innerHTML = '<p>РќРµС‚ РІРёР·РёС‚РѕРІ.</p>'; return; }
            renderVisitsTable(data);
          }).catch(function (e) {
            var msg = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР°';
            document.getElementById('vs_table').innerHTML = '<p class="err">' + escAttr(msg) + '</p>';
          });
        }
      }

      function openVisitAddModal(customerId, userList, refreshVisits) {
        var respOpts = '<option value="">вЂ” РќРµ РЅР°Р·РЅР°С‡РµРЅ вЂ”</option>';
        (userList || []).forEach(function (u) { respOpts += '<option value="' + escAttr(u.login) + '">' + escAttr((u.fio || u.login) + '') + '</option>'; });
        var formHtml = '<div class="form-group"><label>Р”Р°С‚Р° РІРёР·РёС‚Р° *</label><input type="text" id="v_date" placeholder="Р’С‹Р±РµСЂРёС‚Рµ РґР°С‚Сѓ" readonly style="cursor:pointer;background:#fff"></div><div class="form-group"><label>Р’СЂРµРјСЏ</label><input type="time" id="v_time"></div><div class="form-group"><label>РЎС‚Р°С‚СѓСЃ</label><select id="v_status"><option value="planned">Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ</option><option value="completed">Р—Р°РІРµСЂС€С‘РЅ</option><option value="cancelled">РћС‚РјРµРЅС‘РЅ</option><option value="postponed">РќР° СЂР°СЃСЃРјРѕС‚СЂРµРЅРёРё</option></select></div><div class="form-group"><label>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</label><select id="v_resp">' + respOpts + '</select></div><div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><textarea id="v_comment" rows="3" maxlength="5000" placeholder="РџСЂРё СЃС‚Р°С‚СѓСЃРµ В«Р—Р°РІРµСЂС€С‘РЅВ» СѓРєР°Р¶РёС‚Рµ, С‡С‚Рѕ Р±С‹Р»Рѕ СЃРґРµР»Р°РЅРѕ (РјРёРЅ. 10 СЃРёРјРІРѕР»РѕРІ)"></textarea><p id="v_comment_cnt" style="font-size:12px;color:#666">0 / 5000</p></div>';
        showModal('Р”РѕР±Р°РІРёС‚СЊ РІРёР·РёС‚', formHtml, function (errEl) {
          var d = document.getElementById('v_date') && document.getElementById('v_date').value;
          var t = document.getElementById('v_time') && document.getElementById('v_time').value;
          var s = document.getElementById('v_status') && document.getElementById('v_status').value;
          var r = document.getElementById('v_resp') && document.getElementById('v_resp').value;
          var c = (document.getElementById('v_comment') && document.getElementById('v_comment').value.trim()) || null;
          if (!d) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ РІРёР·РёС‚Р°.'; return; }
          if (s === 'completed' && (!c || c.length < 10)) { if (errEl) errEl.textContent = 'РџСЂРё СЃС‚Р°С‚СѓСЃРµ В«Р—Р°РІРµСЂС€С‘РЅВ» СѓРєР°Р¶РёС‚Рµ, С‡С‚Рѕ Р±С‹Р»Рѕ СЃРґРµР»Р°РЅРѕ РЅР° РІРёР·РёС‚Рµ (РјРёРЅРёРјСѓРј 10 СЃРёРјРІРѕР»РѕРІ).'; return; }
          if (s === 'completed' && c.length > 5000) { if (errEl) errEl.textContent = 'РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ Р±РѕР»РµРµ 5000 СЃРёРјРІРѕР»РѕРІ.'; return; }
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
          showModal('Р’РёР·РёС‚ РѕС‚РјРµРЅС‘РЅ', '<p>РћС‚РјРµРЅС‘РЅРЅС‹Р№ РІРёР·РёС‚ РЅРµР»СЊР·СЏ СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ. РЎРѕР·РґР°Р№С‚Рµ РЅРѕРІС‹Р№ РІРёР·РёС‚ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё.</p>', function () { return Promise.resolve(); });
          return;
        }
        var respOpts = '';
        (userList || []).forEach(function (u) { respOpts += '<option value="' + escAttr(u.login) + '">' + escAttr((u.fio || u.login) + '') + '</option>'; });
        var locked = visit.status === 'completed';
        var dateReadonly = locked ? ' readonly style="cursor:not-allowed;background:#f0f0f0"' : ' readonly style="cursor:pointer;background:#fff"';
        var visitDT = (visit.visit_date || '').toString() + ((visit.visit_time && visit.visit_time !== 'вЂ”') ? ' ' + (visit.visit_time + '').substring(0, 5) : '');
        var formHtml = '<div class="form-group"><label>Р”Р°С‚Р° Рё РІСЂРµРјСЏ РІРёР·РёС‚Р°</label><input type="text" id="ve_datetime" value="' + escAttr(visitDT.trim()) + '"' + dateReadonly + ' placeholder="РґРґ.РјРј.РіРіРіРі С‡С‡:РјРј"></div><div class="form-group"><label>РЎС‚Р°С‚СѓСЃ</label><select id="ve_status"' + (locked ? '' : '') + '><option value="planned"' + (visit.status === 'planned' ? ' selected' : '') + '>Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ</option><option value="completed"' + (visit.status === 'completed' ? ' selected' : '') + '>Р—Р°РІРµСЂС€С‘РЅ</option><option value="cancelled"' + (visit.status === 'cancelled' ? ' selected' : '') + '>РћС‚РјРµРЅС‘РЅ</option><option value="postponed"' + (visit.status === 'postponed' ? ' selected' : '') + '>РќР° СЂР°СЃСЃРјРѕС‚СЂРµРЅРёРё</option></select></div><div class="form-group"><label>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</label><select id="ve_resp"' + (locked ? ' disabled' : '') + '>' + respOpts + '</select></div><div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><textarea id="ve_comment" rows="3" maxlength="5000" style="width:100%">' + escAttr(visit.comment || '') + '</textarea><p id="ve_comment_cnt" style="font-size:12px;color:#666">' + (visit.comment ? visit.comment.length : 0) + ' / 5000</p></div>';
        showModal('РР·РјРµРЅРёС‚СЊ РІРёР·РёС‚', formHtml, function (errEl) {
          var dtVal = (document.getElementById('ve_datetime') && document.getElementById('ve_datetime').value) || '';
          var s = document.getElementById('ve_status') && document.getElementById('ve_status').value;
          var r = document.getElementById('ve_resp');
          var rVal = r ? (r.disabled ? visit.responsible_login : r.value) : visit.responsible_login;
          var c = (document.getElementById('ve_comment') && document.getElementById('ve_comment').value.trim()) || null;
          if (!dtVal) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ Рё РІСЂРµРјСЏ.'; return; }
          if (s === 'completed' && (!c || c.length < 10)) { if (errEl) errEl.textContent = 'РџСЂРё СЃС‚Р°С‚СѓСЃРµ В«Р—Р°РІРµСЂС€С‘РЅВ» СѓРєР°Р¶РёС‚Рµ, С‡С‚Рѕ Р±С‹Р»Рѕ СЃРґРµР»Р°РЅРѕ (РјРёРЅРёРјСѓРј 10 СЃРёРјРІРѕР»РѕРІ).'; return; }
          if (s === 'completed' && c.length > 5000) { if (errEl) errEl.textContent = 'РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ Р±РѕР»РµРµ 5000 СЃРёРјРІРѕР»РѕРІ.'; return; }
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
        content.innerHTML = '<div class="card"><h2>РЎРѕР·РґР°С‚СЊ РІРёР·РёС‚</h2><div id="vc_err" class="err"></div><div class="form-group"><label>РљР»РёРµРЅС‚ *</label><input type="hidden" id="vc_customer"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button type="button" class="btn btn-secondary btn-small" id="vc_customer_pick">Р’С‹Р±СЂР°С‚СЊ РєР»РёРµРЅС‚Р°</button><input type="text" id="vc_customer_display" readonly placeholder="РќРµ РІС‹Р±СЂР°РЅ" style="flex:1;min-width:260px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 10px"></div></div><div class="form-group"><label>Р”Р°С‚Р° Рё РІСЂРµРјСЏ РІРёР·РёС‚Р° *</label><input type="text" id="vc_datetime" readonly placeholder="РґРґ.РјРј.РіРіРіРі С‡С‡:РјРј" style="max-width:280px;cursor:pointer;background:#fff"></div><div class="form-group"><label>РђРіРµРЅС‚ (РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№) *</label><div id="vc_agent_badge" style="font-size:13px;margin-bottom:4px;color:#065f46;"></div><select id="vc_responsible"><option value="">вЂ”</option></select></div><div class="form-group"><label>РЎС‚Р°С‚СѓСЃ *</label><select id="vc_status"><option value="planned" selected>Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ</option><option value="completed">Р—Р°РІРµСЂС€С‘РЅ</option><option value="cancelled">РћС‚РјРµРЅС‘РЅ</option><option value="postponed">РќР° СЂР°СЃСЃРјРѕС‚СЂРµРЅРёРё</option></select></div><div class="form-group"><label>РљРѕРјРјРµРЅС‚Р°СЂРёР№</label><textarea id="vc_comment" rows="3" maxlength="5000" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px" placeholder="РџСЂРё СЃС‚Р°С‚СѓСЃРµ В«Р—Р°РІРµСЂС€С‘РЅВ» РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ СѓРєР°Р¶РёС‚Рµ, С‡С‚Рѕ Р±С‹Р»Рѕ СЃРґРµР»Р°РЅРѕ (РјРёРЅ. 10 СЃРёРјРІРѕР»РѕРІ)"></textarea><p id="vc_comment_counter" style="font-size:12px;color:#666;margin:4px 0 0 0">0 / 5000</p><p id="vc_comment_hint" class="err" style="display:none;margin-top:4px">РџСЂРё СЃС‚Р°С‚СѓСЃРµ В«Р—Р°РІРµСЂС€С‘РЅВ» РєРѕРјРјРµРЅС‚Р°СЂРёР№ РѕР±СЏР·Р°С‚РµР»РµРЅ (РјРёРЅРёРјСѓРј 10 СЃРёРјРІРѕР»РѕРІ). РЈРєР°Р¶РёС‚Рµ, С‡С‚Рѕ Р±С‹Р»Рѕ СЃРґРµР»Р°РЅРѕ РЅР° РІРёР·РёС‚Рµ.</p></div><p style="text-align:center"><button type="button" class="btn btn-primary" id="vc_save">РЎРѕС…СЂР°РЅРёС‚СЊ</button> <button type="button" class="btn btn-secondary" id="vc_cancel">РћС‚РјРµРЅР°</button></p></div>';
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
              var label = (u.login || '') + (u.fio ? ' вЂ” ' + u.fio : '');
              if (currentUser && u.login === currentUser.login) label += ' (РўРµРєСѓС‰РёР№)';
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
            var text = 'вњ“ ' + (u ? (u.login + (u.fio ? ' вЂ” ' + u.fio : '')) : login);
            if (currentUser && login === currentUser.login) text += ' (РўРµРєСѓС‰РёР№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ)';
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
            var agentOptions = '<option value=\"\">вЂ” Р’СЃРµ Р°РіРµРЅС‚С‹ вЂ”</option>';
            agents.forEach(function (u) {
              var label = (u.login || '') + (u.fio ? ' вЂ” ' + u.fio : '');
              var sel = (currentUser && u.login === currentUser.login) ? ' selected' : '';
              agentOptions += '<option value=\"' + escAttr(u.login || '') + '\"' + sel + '>' + escAttr(label) + '</option>';
            });
            var bodyHtml = '<div class=\"form-group\"><label>РџРѕРёСЃРє РїРѕ РєР»РёРµРЅС‚Сѓ / РРќРќ</label><input type=\"text\" id=\"vp_search\" placeholder=\"РќР°Р·РІР°РЅРёРµ РёР»Рё РРќРќ (РјРёРЅ. 2 СЃРёРјРІРѕР»Р°)\"></div><div class=\"form-group\"><label>РђРіРµРЅС‚</label><select id=\"vp_agent\">' + agentOptions + '</select></div><p><button type=\"button\" class=\"btn btn-primary btn-small\" id=\"vp_find\">РќР°Р№С‚Рё</button></p><div id=\"vp_results\"><p>Р’РІРµРґРёС‚Рµ РЅРµ РјРµРЅРµРµ 2 СЃРёРјРІРѕР»РѕРІ РґР»СЏ РїРѕРёСЃРєР°.</p></div>';
            showModal('Р’С‹Р±СЂР°С‚СЊ РєР»РёРµРЅС‚Р°', bodyHtml, function (errEl) {
              var checked = document.querySelector('input[name=\"vp_cust_id\"]:checked');
              if (!checked) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р°.'; return; }
              var id = checked.value;
              var name = checked.getAttribute('data-name') || ('РљР»РёРµРЅС‚ #' + id);
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
                  resultsEl.innerHTML = '<p>РЈРєР°Р¶РёС‚Рµ С…РѕС‚СЏ Р±С‹ 2 СЃРёРјРІРѕР»Р° РІ РїРѕРёСЃРєРµ РёР»Рё РІС‹Р±РµСЂРёС‚Рµ Р°РіРµРЅС‚Р°.</p>';
                  return;
                }
                if (q && q.length < 2) {
                  resultsEl.innerHTML = '<p>Р’РІРµРґРёС‚Рµ РЅРµ РјРµРЅРµРµ 2 СЃРёРјРІРѕР»РѕРІ.</p>';
                  return;
                }
                var params = ['limit=50'];
                if (q) params.push('search=' + encodeURIComponent(q));
                if (agent) params.push('login_agent=' + encodeURIComponent(agent));
                resultsEl.innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
                api('/api/v1/customers?' + params.join('&')).then(function (list) {
                  list = list || [];
                  if (!list.length) { resultsEl.innerHTML = '<p>РљР»РёРµРЅС‚С‹ РЅРµ РЅР°Р№РґРµРЅС‹.</p>'; return; }
                  var t = '<div style=\"max-height:380px;overflow:auto\"><table><thead><tr><th></th><th>РљР»РёРµРЅС‚</th><th>РРќРќ</th><th>РђРіРµРЅС‚</th></tr></thead><tbody>';
                  list.forEach(function (c) {
                    var id = c.id;
                    var name = (c.name_client || c.firm_name || '').trim() || ('РљР»РёРµРЅС‚ #' + id);
                    var tax = c.tax_id || '';
                    t += '<tr><td><input type=\"radio\" name=\"vp_cust_id\" value=\"' + id + '\" data-name=\"' + escAttr(name + (tax ? ' (РРќРќ ' + tax + ')' : '')) + '\"></td><td>' + escAttr(name) + '</td><td>' + escAttr(tax) + '</td><td>' + escAttr(c.login_agent || '') + '</td></tr>';
                  });
                  t += '</tbody></table></div>';
                  resultsEl.innerHTML = t;
                }).catch(function () {
                  resultsEl.innerHTML = '<p class=\"err\">РћС€РёР±РєР° РїРѕРёСЃРєР° РєР»РёРµРЅС‚РѕРІ.</p>';
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
            if (!customerId) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ РєР»РёРµРЅС‚Р°.'; return; }
            if (!datetimeVal) { if (errEl) errEl.textContent = 'РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ Рё РІСЂРµРјСЏ РІРёР·РёС‚Р°.'; return; }
            if (!responsible) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ Р°РіРµРЅС‚Р°.'; return; }
            if (!status) { if (errEl) errEl.textContent = 'Р’С‹Р±РµСЂРёС‚Рµ СЃС‚Р°С‚СѓСЃ.'; return; }
            if (status === 'completed') {
              if (!comment || comment.length < 10) { if (errEl) errEl.textContent = 'РљРѕРјРјРµРЅС‚Р°СЂРёР№ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РјРёРЅРёРјСѓРј 10 СЃРёРјРІРѕР»РѕРІ (СЃРµР№С‡Р°СЃ: ' + (comment ? comment.length : 0) + ').'; if (vcHint) vcHint.style.display = 'block'; return; }
              if (comment.length > 5000) { if (errEl) errEl.textContent = 'РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ РґРѕР»Р¶РµРЅ РїСЂРµРІС‹С€Р°С‚СЊ 5000 СЃРёРјРІРѕР»РѕРІ.'; return; }
            }
            var parts = datetimeVal.split(/[T ]/);
            var dateVal = parts[0] || '';
            var timeVal = parts[1] ? parts[1].substring(0, 5) : '';
            var body = { visit_date: dateVal, status: status, responsible_login: responsible || null, comment: comment };
            if (timeVal) body.visit_time = timeVal + ':00';
            api('/api/v1/customers/' + customerId + '/visits', { method: 'POST', body: JSON.stringify(body) }).then(function () { showSection('visits_search'); }).catch(function (e) {
              if (errEl) errEl.textContent = (e && e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ';
            });
          };
        });
      }

      function loadSectionVisitsCalendar() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>РљР°Р»РµРЅРґР°СЂСЊ РІРёР·РёС‚РѕРІ</h2><p><button type="button" class="btn btn-secondary" id="vcal_prev">в—„ РџСЂРµРґ.</button> <span id="vcal_title" style="margin:0 12px;font-weight:600"></span> <button type="button" class="btn btn-secondary" id="vcal_next">РЎР»РµРґ. в–є</button> <label style="margin-left:12px">РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№:</label> <select id="vcal_responsible" style="margin-left:6px"><option value="">Р’СЃРµ РІРёР·РёС‚С‹</option><option value="__me__">РњРѕРё РІРёР·РёС‚С‹</option></select></p><div id="vcal_header" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:12px;font-weight:600;font-size:12px;text-align:center"><div>РџРќ</div><div>Р’Рў</div><div>РЎР </div><div>Р§Рў</div><div>РџРў</div><div>РЎР‘</div><div>Р’РЎ</div></div><div id="vcal_grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:4px"></div><p style="margin-top:16px"><strong>РџРѕ РґР°С‚Рµ: <span id="vcal_sel_date"></span></strong> (<span id="vcal_day_count">0</span> РІРёР·РёС‚РѕРІ)</p><div id="vcal_day_list"></div></div>';
        api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
          var sel = document.getElementById('vcal_responsible');
          if (sel) {
            userList = userList || [];
            userList.forEach(function (u) { var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' вЂ” ' + u.fio : ''); sel.appendChild(o); });
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
                if (!list.length) { document.getElementById('vcal_day_list').innerHTML = '<p>РќРµС‚ РІРёР·РёС‚РѕРІ.</p>'; return; }
                var t = '<ul style="list-style:none;padding:0;margin:0">';
                list.forEach(function (ev) {
                  var time = (ev.time || '').substring(0, 5) || 'вЂ”';
                  t += '<li style="padding:8px;border-bottom:1px solid #eee">' + escAttr(time) + ' вЂ” ' + escAttr(ev.customer_name || '') + ' (' + escAttr(ev.responsible_login || '') + ')</li>';
                });
                t += '</ul>';
                document.getElementById('vcal_day_list').innerHTML = t;
              };
            });
          }).catch(function (e) {
            document.getElementById('vcal_grid').innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</p>';
          });
        }
        document.getElementById('vcal_prev').onclick = function () { viewMonth--; if (viewMonth < 1) { viewMonth = 12; viewYear--; } load(); };
        document.getElementById('vcal_next').onclick = function () { viewMonth++; if (viewMonth > 12) { viewMonth = 1; viewYear++; } load(); };
        document.getElementById('vcal_responsible').onchange = load;
        load();
      }

      function loadSectionReportCustomers() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>РћС‚С‡С‘С‚: РџРѕ РєР»РёРµРЅС‚Р°Рј</h2><p><label>РЎС‚Р°С‚СѓСЃ </label><select id="rc_status"><option value="all">Р’СЃРµ</option><option value="active">РђРєС‚РёРІРЅС‹Рµ</option><option value="inactive">РќРµР°РєС‚РёРІРЅС‹Рµ</option></select> <label>РђРіРµРЅС‚ </label><select id="rc_agent"><option value="">Р’СЃРµ</option></select> <label>Р”Р°С‚Р° СЃ </label><input type="text" id="rc_date_from" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:120px"> <label>РїРѕ </label><input type="text" id="rc_date_to" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:120px"> <button type="button" class="btn btn-primary" id="rc_load">РџРѕРєР°Р·Р°С‚СЊ</button> <button type="button" class="btn btn-secondary" id="rc_export">Р­РєСЃРїРѕСЂС‚ РІ Excel</button></p><div id="rc_table"><p style="color:#64748b">РЈРєР°Р¶РёС‚Рµ С„РёР»СЊС‚СЂС‹ Рё РЅР°Р¶РјРёС‚Рµ В«РџРѕРєР°Р·Р°С‚СЊВ».</p></div></div>';
        api('/api/v1/dictionary/user-logins').catch(function () { return []; }).then(function (userList) {
          var sel = document.getElementById('rc_agent');
          if (sel) userList.forEach(function (u) { var o = document.createElement('option'); o.value = u.login; o.textContent = (u.login || '') + (u.fio ? ' вЂ” ' + u.fio : ''); sel.appendChild(o); });
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
          document.getElementById('rc_table').innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
          api('/api/v1/reports/customers?' + params.join('&')).then(function (res) {
            var total = (res && res.total != null) ? res.total : 0;
            var data = (res && res.data) ? res.data : [];
            if (!data.length) { document.getElementById('rc_table').innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С….</p>'; return; }
            var rcSortCol = 'name_client';
            var rcSortDir = 1;
            var lastRcData = data;
            function clientDisplay(r) {
              var n = (r.name_client || '').trim();
              var f = (r.firm_name || '').trim();
              if (f && f !== n) return n + (n ? ' (' + f + ')' : f);
              return n || f || 'вЂ”';
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
              var arrow = rcSortDir > 0 ? ' в–І' : ' в–ј';
              var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (rcSortCol === col ? arrow : '') + '</th>'; };
              var tb = '<div style="overflow-x:auto"><table><thead><tr><th>#</th>' + th('name_client', 'РљР»РёРµРЅС‚') + th('agent_fio', 'Р¤РРћ РђРіРµРЅС‚Р°') + th('expeditor_fio', 'Р¤РРћ Р­РєСЃРїРµРґРёС‚РѕСЂР°') + th('total_visits', 'РљРѕР»-РІРѕ РІРёР·РёС‚РѕРІ Р°РіРµРЅС‚РѕРј') + th('completed_visits', 'РљРѕР»-РІРѕ Р·Р°РІРµСЂС€С‘РЅРЅС‹С… РІРёР·РёС‚РѕРІ Р°РіРµРЅС‚РѕРј') + th('orders_count', 'РљРѕР»-РІРѕ Р·Р°РєР°Р·РѕРІ') + th('orders_amount', 'РЎСѓРјРјР° Р·Р°РєР°Р·РѕРІ') + '</tr></thead><tbody>';
              sorted.forEach(function (r, i) {
                var ordersCount = r.orders_count || 0;
                var ordersAmount = (r.orders_amount != null) ? Number(r.orders_amount) : 0;
                var totalVisits = r.total_visits != null ? r.total_visits : 0;
                var completedVisits = r.completed_visits != null ? r.completed_visits : 0;
                tb += '<tr><td>' + (i + 1) + '</td><td>' + escAttr(clientDisplay(r)) + '</td><td>' + escAttr(r.agent_fio || '') + '</td><td>' + escAttr(r.expeditor_fio || '') + '</td><td>' + totalVisits + '</td><td>' + completedVisits + '</td><td>' + ordersCount + '</td><td>' + (ordersAmount ? ordersAmount.toFixed(2) : '0.00') + '</td></tr>';
              });
              tb += '</tbody></table></div><p><strong>РС‚РѕРіРѕ РєР»РёРµРЅС‚РѕРІ: ' + total + '</strong></p>';
              document.getElementById('rc_table').innerHTML = tb;
              document.getElementById('rc_table').querySelectorAll('th.sortable').forEach(function (thEl) {
                thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (rcSortCol === col) rcSortDir = -rcSortDir; else { rcSortCol = col; rcSortDir = 1; } renderRc(lastRcData); };
              });
            }
            renderRc(data);
          }).catch(function (e) {
            document.getElementById('rc_table').innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</p>';
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
              if (!r.ok) throw new Error('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_customers.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё РѕС‚С‡С‘С‚Р°.'); });
          };
        }
      }

      function loadSectionReportAgents() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>РћС‚С‡С‘С‚: Р­С„С„РµРєС‚РёРІРЅРѕСЃС‚СЊ Р°РіРµРЅС‚РѕРІ</h2><p><label>Р”Р°С‚Р° СЃ </label><input type="text" id="ra_date_from" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:120px"> <label>РїРѕ </label><input type="text" id="ra_date_to" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:120px"> <button type="button" class="btn btn-primary" id="ra_load">РџРѕРєР°Р·Р°С‚СЊ</button> <button type="button" class="btn btn-secondary" id="ra_export">Р­РєСЃРїРѕСЂС‚ РІ Excel</button></p><div id="ra_list"><p style="color:#64748b">РЈРєР°Р¶РёС‚Рµ С„РёР»СЊС‚СЂС‹ Рё РЅР°Р¶РјРёС‚Рµ В«РџРѕРєР°Р·Р°С‚СЊВ».</p></div></div>';
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
          document.getElementById('ra_list').innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
          api(url).then(function (res) {
            var data = (res && res.data) ? res.data : [];
            var err = (res && res.error) ? res.error : null;
            if (err) { document.getElementById('ra_list').innerHTML = '<p class="err">РћС€РёР±РєР°: ' + escAttr(err) + '</p>'; return; }
            if (!data.length) { document.getElementById('ra_list').innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С… Р·Р° РІС‹Р±СЂР°РЅРЅС‹Р№ РїРµСЂРёРѕРґ.</p>'; return; }
            var tb = '<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Р›РѕРіРёРЅ</th><th>Р¤РРћ</th><th>РљР»РёРµРЅС‚РѕРІ</th><th>Р’РёР·РёС‚РѕРІ</th><th>Р—Р°РІРµСЂС€РµРЅРѕ</th><th>% Р·Р°РІРµСЂС€С‘РЅРЅРѕСЃС‚Рё РІРёР·РёС‚РѕРІ</th><th>РЎСѓРјРјР° Р·Р°РєР°Р·РѕРІ</th><th>РљРѕР»-РІРѕ Р·Р°РєР°Р·РѕРІ</th><th>% Р·Р°РІРµСЂС€С‘РЅРЅРѕСЃС‚Рё Р·Р°РєР°Р·РѕРІ</th></tr></thead><tbody>';
            data.forEach(function (r, i) {
              var visitRate = (r.visit_completion_rate != null) ? r.visit_completion_rate : 0;
              var orderRate = (r.orders_completion_rate != null) ? r.orders_completion_rate : 0;
              var amt = (r.orders_amount != null) ? Number(r.orders_amount) : 0;
              tb += '<tr><td>' + (i + 1) + '</td><td>' + escAttr(r.login || '') + '</td><td>' + escAttr(r.fio || '') + '</td><td>' + (r.client_count || 0) + '</td><td>' + (r.total_visits || 0) + '</td><td>' + (r.completed_visits || 0) + '</td><td>' + visitRate + '%</td><td>' + (amt ? amt.toFixed(2) : '0.00') + '</td><td>' + (r.orders_count || 0) + '</td><td>' + orderRate + '%</td></tr>';
            });
            tb += '</tbody></table></div><p><strong>РС‚РѕРіРѕ Р°РіРµРЅС‚РѕРІ: ' + data.length + '</strong></p>';
            document.getElementById('ra_list').innerHTML = tb;
          }).catch(function (e) { document.getElementById('ra_list').innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</p>'; });
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
              if (!r.ok) throw new Error('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_agents.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё РѕС‚С‡С‘С‚Р°.'); });
          };
        }
      }

      function loadSectionReportExpeditors() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>РћС‚С‡С‘С‚: Р­С„С„РµРєС‚РёРІРЅРѕСЃС‚СЊ СЌРєСЃРїРµРґРёС‚РѕСЂРѕРІ (РїРѕ Р·Р°РєР°Р·Р°Рј)</h2><p><label>Р”Р°С‚Р° СЃ </label><input type="text" id="re_date_from" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:120px"> <label>РїРѕ </label><input type="text" id="re_date_to" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:120px"> <button type="button" class="btn btn-primary" id="re_load">РџРѕРєР°Р·Р°С‚СЊ</button> <button type="button" class="btn btn-secondary" id="re_export">Р­РєСЃРїРѕСЂС‚ РІ Excel</button></p><div id="re_list"><p style="color:#64748b">РЈРєР°Р¶РёС‚Рµ С„РёР»СЊС‚СЂС‹ Рё РЅР°Р¶РјРёС‚Рµ В«РџРѕРєР°Р·Р°С‚СЊВ».</p></div></div>';
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
          document.getElementById('re_list').innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
          api(url).then(function (res) {
            var data = (res && res.data) ? res.data : [];
            var err = (res && res.error) ? res.error : null;
            if (err) { document.getElementById('re_list').innerHTML = '<p class="err">РћС€РёР±РєР°: ' + escAttr(err) + '</p>'; return; }
            if (!data.length) { document.getElementById('re_list').innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С… Р·Р° РІС‹Р±СЂР°РЅРЅС‹Р№ РїРµСЂРёРѕРґ.</p>'; return; }
            var tb = '<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Р›РѕРіРёРЅ</th><th>Р¤РРћ</th><th>Р—Р°РєР°Р·РѕРІ</th><th>РЎСѓРјРјР°</th><th>РћС‚РєСЂС‹С‚Рѕ</th><th>Р’ РґРѕСЃС‚Р°РІРєРµ</th><th>Р”РѕСЃС‚Р°РІР»РµРЅРѕ</th><th>РћС‚РјРµРЅРµРЅРѕ</th></tr></thead><tbody>';
            data.forEach(function (r, i) {
              var amt = (r.orders_amount != null) ? Number(r.orders_amount) : 0;
              tb += '<tr><td>' + (i + 1) + '</td><td>' + escAttr(r.login || '') + '</td><td>' + escAttr(r.fio || '') + '</td><td>' + (r.orders_count || 0) + '</td><td>' + (amt ? amt.toFixed(2) : '0.00') + '</td><td>' + (r.orders_open || 0) + '</td><td>' + (r.orders_delivery || 0) + '</td><td>' + (r.orders_completed || 0) + '</td><td>' + (r.orders_cancelled || 0) + '</td></tr>';
            });
            tb += '</tbody></table></div><p><strong>РС‚РѕРіРѕ СЌРєСЃРїРµРґРёС‚РѕСЂРѕРІ: ' + data.length + '</strong></p>';
            document.getElementById('re_list').innerHTML = tb;
          }).catch(function (e) { document.getElementById('re_list').innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</p>'; });
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
              if (!r.ok) throw new Error('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_expeditors.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё РѕС‚С‡С‘С‚Р°.'); });
          };
        }
      }

      function loadSectionReportVisits() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>РћС‚С‡С‘С‚: РђРЅР°Р»РёС‚РёРєР° РІРёР·РёС‚РѕРІ</h2><p><label>Р”Р°С‚Р° СЃ </label><input type="text" id="rv_from" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:120px"> <label>РїРѕ </label><input type="text" id="rv_to" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:120px"> <button type="button" class="btn btn-primary" id="rv_load">РџРѕРєР°Р·Р°С‚СЊ</button> <button type="button" class="btn btn-secondary" id="rv_export">Р­РєСЃРїРѕСЂС‚ РІ Excel</button></p><div id="rv_summary"><p style="color:#64748b">РЈРєР°Р¶РёС‚Рµ С„РёР»СЊС‚СЂС‹ Рё РЅР°Р¶РјРёС‚Рµ В«РџРѕРєР°Р·Р°С‚СЊВ».</p></div><div id="rv_table"></div></div>';
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
          document.getElementById('rv_summary').innerHTML = ''; document.getElementById('rv_table').innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
          api(url).then(function (res) {
            var sum = (res && res.summary) ? res.summary : {};
            document.getElementById('rv_summary').innerHTML = '<p><strong>Р’СЃРµРіРѕ РІРёР·РёС‚РѕРІ:</strong> ' + (sum.total_visits || 0) + ', Р—Р°РІРµСЂС€РµРЅРѕ: ' + (sum.completed || 0) + ' (' + (sum.completion_rate != null ? sum.completion_rate : 0) + '%)</p>';
            var byDate = (res && res.by_date) ? res.by_date : [];
            if (!byDate.length) { document.getElementById('rv_table').innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С… РїРѕ РґР°С‚Р°Рј.</p>'; return; }
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
              var arrow = rvSortDir > 0 ? ' в–І' : ' в–ј';
              var th = function (col, lbl) { return '<th class="sortable" data-col="' + col + '" style="cursor:pointer">' + lbl + (rvSortCol === col ? arrow : '') + '</th>'; };
              var t = '<div style="overflow-x:auto"><table><thead><tr>' + th('date', 'Р”Р°С‚Р°') + th('total_visits', 'Р’СЃРµРіРѕ') + th('completed', 'Р—Р°РІРµСЂС€РµРЅРѕ') + th('planned', 'Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅРѕ') + th('cancelled', 'РћС‚РјРµРЅРµРЅРѕ') + '</tr></thead><tbody>';
              sorted.forEach(function (r) { t += '<tr><td>' + escAttr(r.date || '') + '</td><td>' + (r.total_visits || 0) + '</td><td>' + (r.completed || 0) + '</td><td>' + (r.planned || 0) + '</td><td>' + (r.cancelled || 0) + '</td></tr>'; });
              t += '</tbody></table></div>';
              document.getElementById('rv_table').innerHTML = t;
              document.getElementById('rv_table').querySelectorAll('th.sortable').forEach(function (thEl) {
                thEl.onclick = function () { var col = thEl.getAttribute('data-col'); if (rvSortCol === col) rvSortDir = -rvSortDir; else { rvSortCol = col; rvSortDir = 1; } renderRv(lastRvData); };
              });
            }
            renderRv(byDate);
          }).catch(function (e) { document.getElementById('rv_table').innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</p>'; });
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
              if (!r.ok) throw new Error('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_visits.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё РѕС‚С‡С‘С‚Р°.'); });
          };
        }
      }

      function loadSectionReportDashboard() {
        var content = document.getElementById('content');
        var today = new Date();
        var todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        content.innerHTML = '<div class="card"><h2>РЎРІРѕРґРЅР°СЏ Р°РЅР°Р»РёС‚РёРєР°</h2>' +
          '<div class="dashboard-filters" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:20px">' +
          '<label>Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё Р·Р°РєР°Р·Р° СЃ</label><input type="text" id="rd_date_from" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:110px" title="Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё Р·Р°РєР°Р·Р° СЃ">' +
          '<label>Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё Р·Р°РєР°Р·Р° РїРѕ</label><input type="text" id="rd_date_to" placeholder="РґРґ.РјРј.РіРіРіРі" style="max-width:110px" title="Р”Р°С‚Р° РїРѕСЃС‚Р°РІРєРё Р·Р°РєР°Р·Р° РїРѕ">' +
          '<label>РЎС‚Р°С‚СѓСЃС‹</label><select id="rd_status"><option value="">РћС‚РєСЂС‹С‚Рѕ, Р”РѕСЃС‚Р°РІРєР°, Р”РѕСЃС‚Р°РІР»РµРЅ</option><option value="open">РћС‚РєСЂС‹С‚Рѕ</option><option value="delivery">Р”РѕСЃС‚Р°РІРєР°</option><option value="completed">Р”РѕСЃС‚Р°РІР»РµРЅ</option></select>' +
          '<label>РљР°С‚РµРіРѕСЂРёСЏ</label><select id="rd_category"><option value="">Р’СЃРµ</option></select>' +
          '<button type="button" class="btn btn-primary" id="rd_load">РџСЂРёРјРµРЅРёС‚СЊ</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;margin-bottom:20px">' +
          '<div id="rd_summary" class="dashboard-summary" style="padding:24px;background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);border-radius:12px;color:#fff;min-height:120px"><div style="font-size:14px;opacity:0.9">Р—Р°РіСЂСѓР·РєР°...</div></div>' +
          '<div id="rd_chart_wrap" style="height:200px;min-width:200px"><canvas id="rd_chart"></canvas></div>' +
          '</div>' +
          '<div id="rd_table_wrap"><h3 style="margin:0 0 12px 0">РџРѕ РєР°С‚РµРіРѕСЂРёСЏРј РїСЂРѕРґСѓРєС‚РѕРІ</h3>' +
          '<p><button type="button" class="btn btn-secondary btn-small" id="rd_excel">Р­РєСЃРїРѕСЂС‚ РІ Excel</button></p>' +
          '<div id="rd_table"></div></div>' +
          '<div id="rd_territory_wrap" style="margin-top:24px"><h3 style="margin:0 0 12px 0">РџРѕ С‚РµСЂСЂРёС‚РѕСЂРёСЏРј</h3>' +
          '<p><button type="button" class="btn btn-secondary btn-small" id="rd_excel_territory">Р­РєСЃРїРѕСЂС‚ РІ Excel</button></p>' +
          '<div id="rd_territory_table"></div></div>';
        var rdFrom = document.getElementById('rd_date_from');
        var rdTo = document.getElementById('rd_date_to');
        if (window.flatpickr) {
          if (rdFrom) window.flatpickr(rdFrom, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', defaultDate: todayStr, allowInput: true });
          if (rdTo) window.flatpickr(rdTo, { locale: 'ru', dateFormat: 'Y-m-d', altInput: true, altFormat: 'd.m.Y', defaultDate: todayStr, allowInput: true });
        }
        var CATEGORY_LABELS = { 'Tvorog': 'РўРІРѕСЂРѕРі', 'Yogurt': 'Р™РѕРіСѓСЂС‚', 'Tara': 'РўР°СЂР°', 'Milk': 'РњРѕР»РѕРєРѕ', 'Kefir': 'РљРµС„РёСЂ', 'Smetana': 'РЎРјРµС‚Р°РЅР°', 'Maslo': 'РњР°СЃР»Рѕ' };
        api('/api/v1/dictionary/products/types').catch(function () { return []; }).then(function (types) {
          var sel = document.getElementById('rd_category');
          if (sel && types && types.length) types.forEach(function (t) { var o = document.createElement('option'); o.value = t.name; o.textContent = CATEGORY_LABELS[t.name] || t.name || t.description || ''; sel.appendChild(o); });
        });
        var rdChart = null;
        function render(res) {
          var err = (res && res.error) ? res.error : null;
          if (err) { document.getElementById('rd_summary').innerHTML = '<p class="err">РћС€РёР±РєР°: ' + escAttr(err) + '</p>'; return; }
          var total = (res && res.total_orders_sum) ? Number(res.total_orders_sum) : 0;
          var totalCount = (res && res.total_orders_count) ? Number(res.total_orders_count) : 0;
          var f = (res && res.filters) ? res.filters : {};
          var dateLabel = (f.date_from || f.date_to) ? ('СЃ ' + (f.date_from || '') + ' РїРѕ ' + (f.date_to || '')) : 'СЃРµРіРѕРґРЅСЏ';
          document.getElementById('rd_summary').innerHTML = '<div style="font-size:16px;opacity:0.95">Р’СЃРµРіРѕ <strong style="font-size:24px;font-weight:700">' + totalCount + '</strong> Р·Р°РєР°Р·РѕРІ ' + dateLabel + '<br/>- РЅР° СЃСѓРјРјСѓ <strong style="font-size:24px;font-weight:700">' + (total ? total.toLocaleString('ru-RU', {minimumFractionDigits:2,maximumFractionDigits:2}) : '0') + '</strong> СЃСѓРј</div>';
          var byCat = (res && res.by_category) ? res.by_category : [];
          try {
            if (window.Chart && document.getElementById('rd_chart')) {
              var ctx = document.getElementById('rd_chart').getContext('2d');
              if (rdChart) rdChart.destroy();
              var labels = byCat.map(function (c) { return c.category; });
              var data = byCat.map(function (c) { return c.share_pct; });
              if (!labels.length) { labels = ['РќРµС‚ РґР°РЅРЅС‹С…']; data = [100]; }
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
          var terrTb = '<div style="overflow-x:auto"><table style="text-align:center"><thead><tr><th>Р“РѕСЂРѕРґ</th><th>РўРµСЂСЂРёС‚РѕСЂРёСЏ</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ РєР»РёРµРЅС‚РѕРІ</th><th>РљРѕР»РёС‡РµСЃС‚РІРѕ Р·Р°РєР°Р·РѕРІ</th><th>РЎСѓРјРјР°</th></tr></thead><tbody>';
          byTerr.forEach(function (r) {
            terrTb += '<tr><td>' + escAttr(r.city || '') + '</td><td>' + escAttr(r.territory || '') + '</td><td>' + (r.customers_count || 0) + '</td><td>' + (r.orders_count || 0) + '</td><td>' + (r.orders_sum != null ? Number(r.orders_sum).toLocaleString('ru-RU', {minimumFractionDigits:2}) : '0') + '</td></tr>';
          });
          terrTb += '</tbody></table></div>';
          var rtEl = document.getElementById('rd_territory_table');
          if (rtEl) rtEl.innerHTML = terrTb;
          var tb = '<div style="overflow-x:auto"><table style="text-align:center"><thead><tr><th>РљР°С‚РµРіРѕСЂРёСЏ</th><th>Р”РѕР»СЏ %</th><th>РЎСѓРјРјР°</th><th>РћР±СЉС‘Рј</th></tr></thead><tbody>';
          var totalSum = 0, totalQty = 0;
          byCat.forEach(function (r) { totalSum += Number(r.sum_amount || 0); totalQty += Number(r.quantity || 0); });
          byCat.forEach(function (r) {
            tb += '<tr><td>' + escAttr(r.category || '') + '</td><td>' + (r.share_pct != null ? r.share_pct.toFixed(2) : '0') + '</td><td>' + (r.sum_amount != null ? Number(r.sum_amount).toLocaleString('ru-RU', {minimumFractionDigits:2}) : '0') + '</td><td>' + (r.quantity || 0) + '</td></tr>';
          });
          tb += '<tr style="font-weight:600;background:#f8fafc"><td>РС‚РѕРі</td><td>100</td><td>' + totalSum.toLocaleString('ru-RU', {minimumFractionDigits:2, maximumFractionDigits:2}) + '</td><td>' + totalQty + '</td></tr>';
          tb += '</tbody></table></div>';
          document.getElementById('rd_table').innerHTML = byCat.length ? tb : '<p>РќРµС‚ РґР°РЅРЅС‹С… РїРѕ РєР°С‚РµРіРѕСЂРёСЏРј.</p>';
        }
        function load() {
          var df = dateToApiFormat((document.getElementById('rd_date_from') && document.getElementById('rd_date_from').value) || '');
          var dt = dateToApiFormat((document.getElementById('rd_date_to') && document.getElementById('rd_date_to').value) || '');
          var status = document.getElementById('rd_status') && document.getElementById('rd_status').value;
          var cat = document.getElementById('rd_category') && document.getElementById('rd_category').value;
          var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt)); if (status) params.push('status_codes=' + encodeURIComponent(status)); if (cat) params.push('product_category=' + encodeURIComponent(cat));
          var url = '/api/v1/reports/dashboard'; if (params.length) url += '?' + params.join('&');
          api(url).then(render).catch(function (e) { render({ error: (e && e.data && e.data.detail) ? String(e.data.detail) : 'РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё' }); });
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
          fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) { if (!r.ok) throw new Error(); return r.blob(); }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dashboard_categories.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function () { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё'); });
        };
        var rdExcelTerr = document.getElementById('rd_excel_territory');
        if (rdExcelTerr) rdExcelTerr.onclick = function () {
          var df = dateToApiFormat((document.getElementById('rd_date_from') && document.getElementById('rd_date_from').value) || '');
          var dt = dateToApiFormat((document.getElementById('rd_date_to') && document.getElementById('rd_date_to').value) || '');
          var status = document.getElementById('rd_status') && document.getElementById('rd_status').value;
          var cat = document.getElementById('rd_category') && document.getElementById('rd_category').value;
          var params = []; if (df) params.push('date_from=' + encodeURIComponent(df)); if (dt) params.push('date_to=' + encodeURIComponent(dt)); if (status) params.push('status_codes=' + encodeURIComponent(status)); if (cat) params.push('product_category=' + encodeURIComponent(cat));
          var url = '/api/v1/reports/dashboard/export'; if (params.length) url += '?' + params.join('&');
          fetch(url, { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) { if (!r.ok) throw new Error(); return r.blob(); }).then(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dashboard_territories.xlsx'; a.click(); URL.revokeObjectURL(a.href); }).catch(function () { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё'); });
        };
      }

      function loadSectionReportPhotos() {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="card"><h2>РћС‚С‡С‘С‚: Р¤РѕС‚РѕРіСЂР°С„РёРё РєР»РёРµРЅС‚РѕРІ</h2><p><button type="button" class="btn btn-primary" id="rp_load">РџРѕРєР°Р·Р°С‚СЊ</button> <button type="button" class="btn btn-secondary" id="rp_export">Р­РєСЃРїРѕСЂС‚ РІ Excel</button></p><div id="rp_stats"></div><div id="rp_table_wrap"></div></div>';
        var rpSortCol = null, rpSortDir = 1;
        function run() {
          document.getElementById('rp_stats').innerHTML = '<p>Р—Р°РіСЂСѓР·РєР°...</p>';
          document.getElementById('rp_table_wrap').innerHTML = '';
          api('/api/v1/reports/photos').then(function (res) {
            var stats = (res && res.statistics) ? res.statistics : {};
            document.getElementById('rp_stats').innerHTML = '<p><strong>Р’СЃРµРіРѕ С„РѕС‚Рѕ:</strong> ' + (stats.total_photos || 0) + ', РљР»РёРµРЅС‚РѕРІ СЃ С„РѕС‚Рѕ: ' + (stats.customers_with_photos || 0) + ', Р‘РµР· С„РѕС‚Рѕ: ' + (stats.customers_without_photos || 0) + '</p>';
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
                tb += '<th' + (col ? ' data-col="' + col + '" style="cursor:pointer"' : '') + '>' + hdr + (col && rpSortCol === col ? (rpSortDir === 1 ? ' в–І' : ' в–ј') : '') + '</th>';
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
            var tb = buildTable(recentSorted, ['customer_name', 'address', 'city', 'territory', 'phone', 'contact_person', 'tax_id', 'uploaded_at', 'uploaded_by'], ['РљР»РёРµРЅС‚', 'РђРґСЂРµСЃ', 'Р“РѕСЂРѕРґ', 'РўРµСЂСЂРёС‚РѕСЂРёСЏ', 'РўРµР»РµС„РѕРЅ', 'РљРѕРЅС‚Р°РєС‚РЅРѕРµ Р»РёС†Рѕ', 'РРќРќ', 'Р”Р°С‚Р° Р·Р°РіСЂСѓР·РєРё', 'Р—Р°РіСЂСѓР¶РµРЅРѕ'], true);
            var withoutSorted = sortData(without, rpSortCol, rpSortDir);
            var tb2 = buildTable(withoutSorted, ['customer_name', 'address', 'city', 'territory', 'phone', 'contact_person', 'tax_id'], ['РљР»РёРµРЅС‚', 'РђРґСЂРµСЃ', 'Р“РѕСЂРѕРґ', 'РўРµСЂСЂРёС‚РѕСЂРёСЏ', 'РўРµР»РµС„РѕРЅ', 'РљРѕРЅС‚Р°РєС‚РЅРѕРµ Р»РёС†Рѕ', 'РРќРќ'], false);
            var html = '';
            if (without.length) {
              html += '<h3 style="margin:16px 0 8px 0">РљР»РёРµРЅС‚С‹ Р±РµР· С„РѕС‚Рѕ</h3>' + tb2;
            }
            html += '<h3 style="margin:16px 0 8px 0">РџРѕСЃР»РµРґРЅРёРµ Р·Р°РіСЂСѓР·РєРё</h3>' + (recent.length ? tb : '<p>РќРµС‚ РЅРµРґР°РІРЅРёС… Р·Р°РіСЂСѓР·РѕРє.</p>');
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
            document.getElementById('rp_stats').innerHTML = '<p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</p>';
          });
        }
        document.getElementById('rp_load').onclick = run;
        run();
        var rpExport = document.getElementById('rp_export');
        if (rpExport) {
          rpExport.onclick = function () {
            fetch('/api/v1/reports/photos/export', { method: 'GET', headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('sds_token') || '') } }).then(function (r) {
              if (!r.ok) throw new Error('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё');
              return r.blob();
            }).then(function (blob) {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'report_photos.xlsx';
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(function () { alert('РћС€РёР±РєР° РІС‹РіСЂСѓР·РєРё РѕС‚С‡С‘С‚Р°.'); });
          };
        }
      }

      // ========================================
      // РЎРџР РђР’РћР§РќРРљ: Р“РѕСЂРѕРґР°
      // ========================================
      function loadSectionTranslations() {
        var initialParams = ['limit=500'];
        if (currentLanguage) initialParams.push('language=' + encodeURIComponent(currentLanguage));

        Promise.all([
          api('/api/v1/translations?' + initialParams.join('&')).catch(function () { return []; }),
          api('/api/v1/translations/stats').catch(function () { return null; })
        ]).then(function (arr) {
          var list = arr[0] || [];
          var stats = arr[1] || null;
          var content = document.getElementById('content');
          if (!content) return;

          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="trAdd">Add translation</button>' : '';
          var html = '' +
            '<div class="card">' +
            '<h2>References: Translations</h2>' +
            '<div id="trStats" style="display:flex;gap:12px;flex-wrap:wrap;margin:0 0 14px 0"></div>' +
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

          var trLangEl = document.getElementById('trLang');
          if (trLangEl && currentLanguage) trLangEl.value = currentLanguage;

          function renderStats(data) {
            var el = document.getElementById('trStats');
            if (!el) return;
            if (!data || !data.overall || !data.telegram) { el.innerHTML = ''; return; }
            var langs = Array.isArray(data.languages) && data.languages.length ? data.languages : ['ru', 'uz', 'en'];
            var overall = data.overall.by_language || {};
            var tg = data.telegram.by_language || {};
            function line(map) {
              return langs.map(function (l) { return '<strong>' + l.toUpperCase() + '</strong>: ' + (map[l] || 0); }).join(' &nbsp;|&nbsp; ');
            }
            el.innerHTML = '' +
              '<div style="padding:10px 12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;min-width:340px">' +
              '<div style="font-weight:700;margin-bottom:6px">All translations</div>' +
              '<div>' + line(overall) + '</div>' +
              '<div style="margin-top:4px;color:#475569">Keys: ' + (data.overall.total_keys || 0) + '</div>' +
              '</div>' +
              '<div style="padding:10px 12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;min-width:340px">' +
              '<div style="font-weight:700;margin-bottom:6px">Telegram translations</div>' +
              '<div>' + line(tg) + '</div>' +
              '<div style="margin-top:4px;color:#475569">Keys: ' + (data.telegram.total_keys || 0) + '</div>' +
              '</div>' +
              '<div style="padding:10px 12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;min-width:260px">' +
              '<div style="font-weight:700;margin-bottom:6px">Quality</div>' +
              '<div>Missing keys by language set: <strong>' + (data.missing_any_language_keys || 0) + '</strong></div>' +
              '</div>';
          }

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

          renderStats(stats);
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
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="cityAdd">Р”РѕР±Р°РІРёС‚СЊ РіРѕСЂРѕРґ</button>' : '';
          var html = '<div class="card"><h2>РЎРїСЂР°РІРѕС‡РЅРёРє: Р“РѕСЂРѕРґР°</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="citiesTable"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('citiesTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С….</p>'; bindCityAdd(); return; }
          var t = '<table><thead><tr><th>ID</th><th>РќР°Р·РІР°РЅРёРµ</th><th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
          list.forEach(function (city) {
            t += '<tr><td>' + city.id + '</td><td>' + escAttr(city.name || '') + '</td><td>';
            if (isAdmin()) {
              t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-id="' + city.id + '" data-name="' + escAttr(city.name || '') + '">РР·РјРµРЅРёС‚СЊ</button> ';
              t += '<button type="button" class="btn btn-secondary btn-small" data-del data-id="' + city.id + '" data-name="' + escAttr(city.name || '') + '">РЈРґР°Р»РёС‚СЊ</button>';
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
              showModal('РР·РјРµРЅРёС‚СЊ РіРѕСЂРѕРґ', '<div class="form-group"><label>РќР°Р·РІР°РЅРёРµ РіРѕСЂРѕРґР°</label><input type="text" id="cityName" value="' + cityName.replace(/&quot;/g, '"') + '"></div>', function () {
                var name = document.getElementById('cityName').value.trim();
                if (!name) { alert('Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ'); return Promise.reject(); }
                return api('/api/v1/dictionary/cities/' + cityId, { method: 'PUT', body: JSON.stringify({ name: name }) }).then(function () { loadSectionCities(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-del]').forEach(function (btn) {
            btn.onclick = function () {
              var cityName = btn.getAttribute('data-name');
              if (!confirm('РЈРґР°Р»РёС‚СЊ РіРѕСЂРѕРґ В«' + cityName + 'В»?')) return;
              api('/api/v1/dictionary/cities/' + btn.getAttribute('data-id'), { method: 'DELETE' }).then(function () { loadSectionCities(); }).catch(function (e) {
                alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ');
              });
            };
          });
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РіРѕСЂРѕРґРѕРІ.</p></div>'; });
        function bindCityAdd() {
          var btn = document.getElementById('cityAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('Р”РѕР±Р°РІРёС‚СЊ РіРѕСЂРѕРґ', '<div class="form-group"><label>РќР°Р·РІР°РЅРёРµ РіРѕСЂРѕРґР°</label><input type="text" id="cityName" placeholder="РќР°РїСЂРёРјРµСЂ: РўР°С€РєРµРЅС‚"></div>', function () {
              var name = document.getElementById('cityName').value.trim();
              if (!name) { alert('Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ'); return Promise.reject(); }
              return api('/api/v1/dictionary/cities', { method: 'POST', body: JSON.stringify({ name: name }) }).then(function () { loadSectionCities(); });
            });
          };
        }
      }

      // ========================================
      // РЎРџР РђР’РћР§РќРРљ: РўРµСЂСЂРёС‚РѕСЂРёРё
      // ========================================
      function loadSectionTerritories() {
        api('/api/v1/dictionary/territories').then(function (list) {
          var content = document.getElementById('content');
          if (!content) return;
          var addBtn = isAdmin() ? '<button type="button" class="btn btn-primary" id="territoryAdd">Р”РѕР±Р°РІРёС‚СЊ С‚РµСЂСЂРёС‚РѕСЂРёСЋ</button>' : '';
          var html = '<div class="card"><h2>РЎРїСЂР°РІРѕС‡РЅРёРє: РўРµСЂСЂРёС‚РѕСЂРёРё</h2><p style="margin:0 0 12px 0">' + addBtn + '</p><div id="territoriesTable"></div></div>';
          content.innerHTML = html;
          var tableDiv = document.getElementById('territoriesTable');
          if (!Array.isArray(list) || !list.length) { tableDiv.innerHTML = '<p>РќРµС‚ РґР°РЅРЅС‹С….</p>'; bindTerritoryAdd(); return; }
          var t = '<table><thead><tr><th>ID</th><th>РќР°Р·РІР°РЅРёРµ</th><th>Р”РµР№СЃС‚РІРёСЏ</th></tr></thead><tbody>';
          list.forEach(function (territory) {
            t += '<tr><td>' + territory.id + '</td><td>' + escAttr(territory.name || '') + '</td><td>';
            if (isAdmin()) {
              t += '<button type="button" class="btn btn-secondary btn-small" data-edit data-id="' + territory.id + '" data-name="' + escAttr(territory.name || '') + '">РР·РјРµРЅРёС‚СЊ</button> ';
              t += '<button type="button" class="btn btn-secondary btn-small" data-del data-id="' + territory.id + '" data-name="' + escAttr(territory.name || '') + '">РЈРґР°Р»РёС‚СЊ</button>';
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
              showModal('РР·РјРµРЅРёС‚СЊ С‚РµСЂСЂРёС‚РѕСЂРёСЋ', '<div class="form-group"><label>РќР°Р·РІР°РЅРёРµ С‚РµСЂСЂРёС‚РѕСЂРёРё</label><input type="text" id="territoryName" value="' + territoryName.replace(/&quot;/g, '"') + '"></div>', function () {
                var name = document.getElementById('territoryName').value.trim();
                if (!name) { alert('Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ'); return Promise.reject(); }
                return api('/api/v1/dictionary/territories/' + territoryId, { method: 'PUT', body: JSON.stringify({ name: name }) }).then(function () { loadSectionTerritories(); });
              });
            };
          });
          tableDiv.querySelectorAll('[data-del]').forEach(function (btn) {
            btn.onclick = function () {
              var territoryName = btn.getAttribute('data-name');
              if (!confirm('РЈРґР°Р»РёС‚СЊ С‚РµСЂСЂРёС‚РѕСЂРёСЋ В«' + territoryName + 'В»?')) return;
              api('/api/v1/dictionary/territories/' + btn.getAttribute('data-id'), { method: 'DELETE' }).then(function () { loadSectionTerritories(); }).catch(function (e) {
                alert((e.data && e.data.detail) ? (typeof e.data.detail === 'string' ? e.data.detail : JSON.stringify(e.data.detail)) : 'РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ');
              });
            };
          });
        }).catch(function () { document.getElementById('content').innerHTML = '<div class="card"><p class="err">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё С‚РµСЂСЂРёС‚РѕСЂРёР№.</p></div>'; });
        function bindTerritoryAdd() {
          var btn = document.getElementById('territoryAdd');
          if (!btn || !isAdmin()) return;
          btn.onclick = function () {
            showModal('Р”РѕР±Р°РІРёС‚СЊ С‚РµСЂСЂРёС‚РѕСЂРёСЋ', '<div class="form-group"><label>РќР°Р·РІР°РЅРёРµ С‚РµСЂСЂРёС‚РѕСЂРёРё</label><input type="text" id="territoryName" placeholder="РќР°РїСЂРёРјРµСЂ: Р¦РµРЅС‚СЂ"></div>', function () {
              var name = document.getElementById('territoryName').value.trim();
              if (!name) { alert('Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ'); return Promise.reject(); }
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
            '<p><strong>РЎРёСЃС‚РµРјР° СѓРїСЂР°РІР»РµРЅРёСЏ РїСЂРѕРґР°Р¶Р°РјРё Рё РґРёСЃС‚СЂРёР±СѓС†РёРµР№</strong></p>' +
            '<p style="margin-top:8px;margin-bottom:4px">Р Р°Р·СЂР°Р±РѕС‚Р°РЅРѕ:</p>' +
            '<p style="margin:0 0 12px 0">Р—Р°С…Р°СЂРµРЅРєРѕРІ Р”РјРёС‚СЂРёР№</p>' +
            '<p style="margin:0 0 4px 0"><strong>РљРѕРЅС‚Р°РєС‚С‹ СЂР°Р·СЂР°Р±РѕС‚С‡РёРєР°:</strong></p>' +
            '<p style="margin:0 0 4px 0">рџ“§ Email: <a href="mailto:dima@zakharenkov.ru">dima@zakharenkov.ru</a></p>' +
            '<p style="margin:0 0 4px 0">рџЊђ РЎР°Р№С‚: <a href="https://zakharenkov.ru" target="_blank" rel="noopener">zakharenkov.ru</a></p>' +
            '<p style="margin:0 0 4px 0">рџ’ј LinkedIn: <a href="https://www.linkedin.com/in/dmity-zakharenkov/" target="_blank" rel="noopener">linkedin.com/in/dmity-zakharenkov</a></p>' +
            '<p style="margin:0 0 0 0">рџ“± Telegram: <a href="https://t.me/dmitry_zakharenkov" target="_blank" rel="noopener">@dmitry_zakharenkov</a></p>';
          showModal('Рћ СЃРёСЃС‚РµРјРµ', bodyHtml, function () { return Promise.resolve(); }, { closeOnly: true });
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

      document.getElementById('userName').textContent = 'Р—Р°РіСЂСѓР·РєР°...';
      initLiteralI18nObserver();
      loadMe().then(function () { return initLanguageSwitcher(); }).then(function () { return loadMenu(); }).then(function () {
        var first = (menuItems && menuItems[0]) ? (SIDEBAR_SECTIONS[menuItems[0].code] || 'users') : 'users';
        showSection(first);
      }).catch(function () { document.getElementById('userName').textContent = 'РћС€РёР±РєР°'; initLanguageSwitcher().then(function () { return loadMenu(); }).then(function () { showSection(menuItems[0] ? (SIDEBAR_SECTIONS[menuItems[0].code] || menuItems[0].code) : 'users'); }); });
    })();
  