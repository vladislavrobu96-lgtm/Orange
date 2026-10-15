(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const STORE = 'transportMessages_v1';
  const ADMIN_PIN_KEY = 'transportMessages_adminPin';
  const defaultState = () => ({activeChat:'7000',profileName:'Пользователь',messages:{'7000':[{id:1,from:'system',text:'Trimiteți codul de patru cifre pentru procesare.',time:stamp()}],'7001':[{id:2,from:'system',text:'Trimiteți codul de patru cifre pentru procesare.',time:stamp()}]},keys:[{id:'k0',key:'TM-START-2026',label:'Стартовый ключ',status:'active',created:stamp(),usedBy:'Этот браузер'}],activated:true,adminPin:'2468',adminUnlocked:false});
  function stamp(){return new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});}
  let state;
  try { state = JSON.parse(localStorage.getItem(STORE)) || defaultState(); } catch { state = defaultState(); }
  // Standalone app state is saved in this browser.
  function save(){localStorage.setItem(STORE,JSON.stringify(state));}
  let activeView='messages',adminTab='keys',toastTimer;
  const PREF_KEY='transportMessages_preferences';
  const defaultPrefs={theme:'light',fontSize:'normal',enterToSend:true,compact:false,showTimes:true};
  let prefs;try{prefs={...defaultPrefs,...JSON.parse(localStorage.getItem(PREF_KEY)||'{}')};}catch{prefs={...defaultPrefs};}
  function savePrefs(){localStorage.setItem(PREF_KEY,JSON.stringify(prefs));applyPrefs();}
  function applyPrefs(){document.body.dataset.theme=prefs.theme==='dark'?'dark':'light';document.documentElement.style.setProperty('--message-font-size',prefs.fontSize==='small'?'12px':prefs.fontSize==='large'?'16px':'14px');document.body.classList.toggle('compact-messages',!!prefs.compact);document.body.classList.toggle('hide-message-times',!prefs.showTimes);const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=prefs.theme==='dark'?'#1c1c1e':'#f5f5f7';}
  applyPrefs();
  const chats={
    '7000':{name:'7000',subtitle:'Троллейбусы',type:'trolley',initial:[{id:'7000a',from:'system',text:'Trimiteți codul de patru cifre pentru procesare.',time:stamp()}]},
    '7001':{name:'7001',subtitle:'Автобусы',type:'bus',initial:[{id:'7001a',from:'system',text:'Trimiteți codul de patru cifre pentru procesare.',time:stamp()}]},
    'mom':{name:'Мама',subtitle:'Личная переписка',type:'mom',initial:[{id:'m1',from:'contact',text:'Доброе утро ❤️',time:'09:12'},{id:'m2',from:'user',text:'Доброе утро!',time:'09:14'},{id:'m3',from:'contact',text:'Не забудь купить хлеб по дороге 🙂',time:'09:24'}]},
    'dad':{name:'Папа',subtitle:'Личная переписка',type:'dad',initial:[{id:'d1',from:'contact',text:'Во сколько будешь дома?',time:'08:51'},{id:'d2',from:'user',text:'Примерно к шести.',time:'08:53'}]},
    'nastya':{name:'Настя',subtitle:'iMessage',type:'nastya',initial:[{id:'n1',from:'user',text:'Привет, как дела?',time:'Вчера'},{id:'n2',from:'contact',text:'Всё хорошо 😊 А у тебя?',time:'Вчера'},{id:'n3',from:'user',text:'Тоже хорошо!',time:'Вчера'},{id:'n4',from:'contact',text:'Хорошо, тогда до встречи!',time:'Вчера'}]},
    'friends':{name:'Друзья',subtitle:'Групповой чат · 4 участника',type:'friends',initial:[{id:'f1',from:'contact',text:'Кто сегодня гуляет?',time:'Вчера'},{id:'f2',from:'user',text:'Я могу после обеда.',time:'Вчера'},{id:'f3',from:'contact',text:'Давайте тогда в 16:00!',time:'Вчера'}]}
  };
  // Upgrade existing local storage from older builds by adding the built-in fictional chats.
  for (const [id, chat] of Object.entries(chats)) {
    if (!state.messages[id]) state.messages[id] = chat.initial.map(m => ({...m}));
  }
  // Keep processing-status and ticket messages in history. Only discard the obsolete
  // acknowledgement text from an earlier build.
  for (const id of ['7000','7001']) {
    state.messages[id]=(state.messages[id]||[]).filter(m => !(typeof m.text==='string' && /a fost înregistrată în conversație|was recorded in the conversation/i.test(m.text)));
  }
  state.profileName ||= 'Пользователь';
  if (!chats[state.activeChat]) state.activeChat='7000';
  save();
  function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function setChat(id){if(!chats[id])return;state.activeChat=id;save();renderChat();$$('.chat-item').forEach(b=>b.classList.toggle('active',b.dataset.chat===id));document.querySelector('.app-shell').classList.add('chat-open');$$('.nav-link').forEach(x=>x.classList.toggle('selected',x.dataset.view==='messages'));}
  function renderChat(){
    const id=state.activeChat,c=chats[id];
    $('#headerName').textContent=c.name;$('#headerSubtitle').textContent=c.subtitle;
    $('#headerAvatar').textContent=({'mom':'М','dad':'П','nastya':'Н','friends':'Д'}[id]||id);
    $('#headerAvatar').className='avatar small '+c.type;
    $('#composerHint').textContent='';
    const box=$('#messages');
    box.innerHTML='<div class="day-divider">Сегодня</div>';
    const list=state.messages[id]||[];
    if(!list.length) box.innerHTML+='<div class="empty-state">История пока пуста. Напишите сообщение ниже.</div>';
    for(const m of list){
      if(m.from==='ticket'){
        // Backward compatibility for ticket entries stored by earlier builds.
        const legacyTicketText = m.text || makeTicketText(String(m.route||'0000').slice(0,4), new Date(m.issuedAt || Date.now()), m.ticketNumber);
        box.insertAdjacentHTML('beforeend',`<div class="message-row incoming"><div class="bubble">${esc(legacyTicketText)}</div><span class="message-time">${esc(m.timeSent||m.time||'')}</span></div>`);
        continue;
      }
      const outgoing=m.from==='user';
      box.insertAdjacentHTML('beforeend',`<div class="message-row ${outgoing?'outgoing':'incoming'}"><div class="bubble">${esc(m.text)}</div><span class="message-time">${esc(m.time||'')}</span></div>`);
    }
    // Keep the message list itself as the scroll container and force a bottom position
    // after layout, including on iOS Safari where scrollHeight may update one frame later.
    const scrollToLatest=()=>{box.scrollTop=box.scrollHeight;box.scrollTo({top:box.scrollHeight,behavior:'auto'});};
    scrollToLatest();
    requestAnimationFrame(()=>{scrollToLatest();requestAnimationFrame(()=>{scrollToLatest();setTimeout(scrollToLatest,80);});});
  }
  function pushMessage(id,m){if(!state.messages[id])state.messages[id]=[];state.messages[id].push(m);save();if(state.activeChat===id)renderChat();updateChatPreviews();}
  function updateChatPreviews(){for(const b of $$('.chat-item')){const id=b.dataset.chat;const list=state.messages[id]||[];const last=list[list.length-1];const p=b.querySelector('.chat-preview p');const t=b.querySelector('.chat-line time');if(p&&last)p.textContent=last.text|| (last.from==='ticket'?'Bilet electronic': 'Сообщение');if(t&&last)t.textContent=last.time||'сейчас';}}
  function makeTicketText(code, sentAt = new Date(), ticketNumber = null){
    const pad = n => String(n).padStart(2,'0');
    const ticketId = ticketNumber || String(Math.floor(100000000 + Math.random() * 900000000));
    const date = `${pad(sentAt.getDate())}.${pad(sentAt.getMonth()+1)}.${sentAt.getFullYear()}`;
    const time = `${pad(sentAt.getHours())}:${pad(sentAt.getMinutes())}`;
    return `Bilet electronic nr. ${ticketId}\nData ${date} ora ${time}\nValabil 1 ora\nPret 7 MDL\nNumar de bord ${code}`;
  }
  function handleSend(text){text=text.trim();if(!text)return;const id=state.activeChat;const sentAt=new Date();pushMessage(id,{id:Date.now(),from:'user',text,time:stamp()});
    if(id==='7000'||id==='7001'){
      const match=text.match(/^\d{4}$/);
      if(match){
        const code=text;
        // First send the processing notice, then a separate electronic-ticket message.
        setTimeout(()=>pushMessage(id,{id:Date.now()+1,from:'contact',text:'Solicitarea este in curs de procesare.',time:stamp()}),350);
        setTimeout(()=>pushMessage(id,{id:Date.now()+2,from:'contact',text:makeTicketText(code,sentAt),time:stamp()}),1250);
      } else {
        setTimeout(()=>pushMessage(id,{id:Date.now()+1,from:'contact',text:'Trimiteți codul de patru cifre.',time:stamp()}),250);
      }
      return;
    }
    // Diverse fictional replies, selected by chat and message context. Avoid repeating the latest reply.
    const replies={
      mom:{
        greeting:['Привет, солнышко ❤️ Как ты?','Привет! Как прошёл день? 😊','О, хорошо, что написал(а) ❤️','Я тебя слушаю 🙂'],
        question:['Сейчас посмотрю и напишу тебе.','Думаю, что да, но уточню. ❤️','Хороший вопрос, давай разберёмся.','Не уверена, сейчас проверю 🙂'],
        thanks:['Пожалуйста, родной ❤️','Всегда пожалуйста 😊','Не за что, я же рядом.','Рада помочь! ❤️'],
        plan:['Хорошо, договорились ❤️','Напиши, если планы поменяются.','Ладно, только предупреди заранее 🙂','Отлично, тогда так и сделаем.'],
        general:['Хорошо, я поняла ❤️','Ладно, спасибо, что предупредил(а).','Расскажешь потом, как всё прошло? 😊','Не забудь мне написать, когда сможешь.','Поняла тебя. Обнимаю ❤️','Хорошо 🙂 А что ещё нового?','Давай, я тогда буду на связи.','Спасибо, что сказал(а)! ❤️','Хорошо, только береги себя.','Ага, поняла 😊','Давай обсудим это чуть позже.','Как думаешь, что лучше сделать?']
      },
      dad:{
        greeting:['Привет! Что нового?','Здорово. Как день проходит?','Привет, я на связи.','Слушаю тебя.'],
        question:['Сейчас проверю и скажу.','Давай уточним, чтобы не ошибиться.','Пока точно не знаю, узнаю.','Посмотрим, какой вариант лучше.'],
        thanks:['Не за что.','Обращайся, если что.','Всегда пожалуйста.','Хорошо, рад помочь.'],
        plan:['Ладно, договорились.','Хорошо, только предупреди заранее.','Принято. Напиши, если что-то изменится.','Тогда решено.'],
        general:['Понял тебя.','Хорошо, спасибо за информацию.','Напиши, когда будешь знать точнее.','Давай потом спокойно обсудим.','Хорошо. Как всё прошло?','Принято 👍','Я понял, действуй по ситуации.','Окей, буду иметь в виду.','Если понадобится помощь — скажи.','Давай держать связь.','Хорошо, тогда на этом договорились.','Понял. Не забудь сообщить, как доберёшься.']
      },
      nastya:{
        greeting:['Привееет 😊 Как ты?','О, привет! Что расскажешь? 💗','Привет-привет ✨','Рада твоему сообщению 😊'],
        question:['Хмм, дай подумать 😄','Мне кажется, можно попробовать!','Сейчас объясню, как я это вижу 🙂','А ты сам(а) как думаешь? 👀'],
        thanks:['Всегда пожалуйста 🫶','Да не за что 😊','Ахах, обращайся 💗','Рада помочь!'],
        plan:['Давай, звучит классно 😄','Хорошо! Договорились 💗','Напиши потом, во сколько точно.','Окей, тогда спишемся ближе к делу 😊'],
        general:['Ахах, вот это да 😂','Поняла тебя 😊','Ого, рассказывай дальше 👀','Хахаха, жизненно 😭','Ну всё, теперь мне интересно 😄','Давай потом ещё обсудим 💗','А что было дальше?','Звучит неплохо, кстати ✨','Я тебя поняла 🫶','Ахах, не ожидала такого','Окей, буду ждать новостей 😊','Ладно, тогда не пропадай 💗','Кстати, хотела тебя кое о чём спросить','Мне нравится эта идея 😌','Ну посмотрим, как получится 😄','Хорошо-хорошо, записала 😂']
      },
      friends:{
        greeting:['Йо, народ, что происходит? 😄','Всем привет! Какие новости?','Я тут 👀','Здарова, что обсуждаем?'],
        question:['Кто-нибудь уже проверял?','Давайте сравним варианты.','Хороший вопрос, у кого какие идеи?','Ща, давайте разберёмся 😄'],
        thanks:['Без проблем 😎','Всегда пожалуйста!','Да не вопрос 😂','Обращайтесь, команда!'],
        plan:['Мне подходит, я за! 🙌','Давайте время подтвердим чуть позже.','Окей, кто ещё сможет?','Погнали, только решим где встречаемся 😄'],
        general:['Ахахах 😂','Звучит нормально, я за.','А кто ещё будет?','Давайте решим в чате, чтобы все знали.','У меня пока без изменений.','Кто-нибудь ещё в деле? 👀','Окей, держите меня в курсе.','Ахах, ну вы даёте 😭','Давайте без долгих обсуждений — выбираем вариант 😄','Я могу, только скажите время.','Кстати, есть ещё одна идея.','Скиньте подробности сюда.','Поддерживаю 👍','Так, а конкретнее? 😂','Давайте голосование устроим.','О, это уже интересно.','Мне подходит, посмотрим кто ещё сможет.','Я чуть позже отвечу, сейчас занят.']
      }
    };
    const lower=text.toLowerCase();
    let category='general';
    if(/привет|здравств|доброе утро|добрый вечер|хай|здаров/.test(lower)) category='greeting';
    else if(/спасибо|благодар/.test(lower)) category='thanks';
    else if(/\?|как думаешь|что лучше|почему|когда|где|кто|можно ли/.test(lower)) category='question';
    else if(/давай|встреч|пойд|план|буду|приед|время|договор|увидимся/.test(lower)) category='plan';
    const groups=replies[id]||{general:['Хорошо 😊','Понял!','Расскажи подробнее.']};
    const choices=groups[category]||groups.general;
    const previous=[...(state.messages[id]||[])].reverse().find(m=>m.from==='contact')?.text;
    const alternatives=choices.filter(reply=>reply!==previous);
    const pool=alternatives.length?alternatives:choices;
    const reply=pool[Math.floor(Math.random()*pool.length)];
    setTimeout(()=>pushMessage(id,{id:Date.now()+1,from:'contact',text:reply,time:stamp()}),450);
  }
  $('#messageForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#messageInput');const text=input.value;input.value='';handleSend(text);});
  $$('.chat-item').forEach(b=>b.addEventListener('click',()=>setChat(b.dataset.chat)));
  $('#mobileBack').addEventListener('click',()=>document.querySelector('.app-shell').classList.remove('chat-open'));
  $('#searchInput').addEventListener('input',e=>{$$('.chat-item').forEach(b=>b.hidden=!(b.textContent.toLowerCase().includes(e.target.value.toLowerCase())));});
  $('#newChatBtn').addEventListener('click',()=>openModal(`<h2>Новый чат</h2><p class="modal-lead">Выберите переписку, чтобы открыть её.</p><div class="quick-chat-list">${Object.entries(chats).map(([id,c])=>`<button class="quick-chat-option" data-open-chat="${esc(id)}"><span class="avatar ${c.type}">${esc(({mom:'М',dad:'П',nastya:'Н',friends:'Д'}[id]||id))}</span><span><b>${esc(c.name)}</b><small>${esc(c.subtitle)}</small></span><span class="quick-chat-arrow">›</span></button>`).join('')}</div><button class="secondary-btn full" id="modalOk">Отмена</button>`,()=>$$('[data-open-chat]').forEach(b=>b.addEventListener('click',()=>{setChat(b.dataset.openChat);closeModal();}))));
  $('#attachBtn').addEventListener('click',()=>{const isTransport=state.activeChat==='7000'||state.activeChat==='7001';openModal(`<h2>${isTransport?'Код маршрута':'Действия с сообщением'}</h2><p class="modal-lead">${isTransport?'Выберите пример четырёхзначного кода или введите свой.':'Можно быстро вставить текст в поле сообщения.'}</p>${isTransport?`<div class="quick-code-grid">${['1001','1002','2001','3001'].map(code=>`<button class="quick-code" data-code="${code}">${code}</button>`).join('')}</div>`:''}<label class="field-label" for="quickMessage">${isTransport?'Или свой код / текст':'Текст сообщения'}</label><input class="field" id="quickMessage" maxlength="500" placeholder="${isTransport?'Например, 1001':'Введите сообщение'}"><button class="primary-btn full" id="insertMessage">Вставить в сообщение</button><button class="secondary-btn full" id="modalOk">Закрыть</button>`,()=>{ $$('[data-code]').forEach(b=>b.addEventListener('click',()=>{$('#quickMessage').value=b.dataset.code;}));$('#insertMessage')?.addEventListener('click',()=>{const val=$('#quickMessage').value.trim();if(!val){$('#quickMessage').focus();showToast('Введите текст или код.');return;}$('#messageInput').value=val;closeModal();$('#messageInput').focus();});});});
  $('#infoBtn').addEventListener('click',()=>openModal(`<h2>О чате ${state.activeChat}</h2><p class="modal-lead">${chats[state.activeChat].subtitle}.</p><button class="secondary-btn full" id="modalOk">Понятно</button>`));
  $('#clearChatBtn').addEventListener('click',()=>openModal(`<h2>Очистить историю?</h2><p class="modal-lead">История чата ${state.activeChat} будет удалена.</p><button class="danger-btn full" id="confirmClear">Удалить историю</button><button class="secondary-btn full" id="modalOk">Отмена</button>`,()=>{$('#confirmClear')?.addEventListener('click',()=>{state.messages[state.activeChat]=[];save();renderChat();updateChatPreviews();closeModal();showToast('История очищена.');});}));
  $('#topSettingsBtn').addEventListener('click',openSettings);
  $('#topAuthBtn').addEventListener('click',activationModal);
  $('#topAdminBtn').addEventListener('click',openAdmin);
  // The small top-left key icon is always visible; it opens PIN login or the admin panel.
  $('#profileMenu').addEventListener('click',()=>openModal(`<h2>Профиль</h2><label class="field-label" for="profileNameInput">Имя пользователя</label><input class="field" id="profileNameInput" maxlength="40" value="${esc(state.profileName||'Пользователь')}" placeholder="Как к тебе обращаться"><button class="primary-btn full" id="saveProfileName">Сохранить имя</button><button class="secondary-btn full" id="goActivation">Управление доступом</button><button class="secondary-btn full" id="goSettings">Настройки приложения</button><button class="secondary-btn full" id="modalOk">Закрыть</button>`,()=>{$('#saveProfileName')?.addEventListener('click',()=>{state.profileName=$('#profileNameInput').value.trim()||'Пользователь';save();$('#profileName').textContent=state.profileName;closeModal();showToast('Имя сохранено.');});$('#goActivation')?.addEventListener('click',activationModal);$('#goSettings')?.addEventListener('click',openSettings);}));
  $$('.nav-link').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='settings'){activeView='settings';$$('.nav-link').forEach(x=>x.classList.toggle('selected',x===b));openSettings();}else{activeView='messages';$$('.nav-link').forEach(x=>x.classList.toggle('selected',x===b));document.querySelector('.app-shell').classList.remove('chat-open');}}));
  const backdrop=$('#modalBackdrop');function openModal(html,after){$('#modalContent').innerHTML=html;backdrop.classList.remove('hidden');$('#modalContent').querySelectorAll('#modalOk').forEach(b=>b.addEventListener('click',closeModal));if(after)after();}function closeModal(){backdrop.classList.add('hidden');$('#modalContent').innerHTML='';}$('#modalClose').addEventListener('click',closeModal);backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal();});
  function openSettings(){
    openModal(`<h2>Настройки приложения</h2><p class="modal-lead">Настрой интерфейс под себя. Изменения сохраняются на этом устройстве.</p>
      <div class="settings-section"><h3>Внешний вид</h3><p>Выбери оформление и размер текста.</p>
        <div class="settings-row"><div><label for="themeSelect">Тема</label><small>Светлая или тёмная</small></div><select class="settings-select" id="themeSelect"><option value="light" ${prefs.theme==='light'?'selected':''}>Белая</option><option value="dark" ${prefs.theme==='dark'?'selected':''}>Чёрная</option></select></div>
        <div class="settings-row"><div><label for="fontSizeSelect">Размер текста</label><small>В сообщениях и переписках</small></div><select class="settings-select" id="fontSizeSelect"><option value="small" ${prefs.fontSize==='small'?'selected':''}>Маленький</option><option value="normal" ${prefs.fontSize==='normal'?'selected':''}>Обычный</option><option value="large" ${prefs.fontSize==='large'?'selected':''}>Большой</option></select></div>
        <div class="settings-row"><div><label for="compactToggle">Компактные сообщения</label><small>Меньше расстояние между сообщениями</small></div><input class="settings-switch" id="compactToggle" type="checkbox" ${prefs.compact?'checked':''}></div>
      </div>
      <div class="settings-section"><h3>Удобство</h3><p>Управляй отправкой и отображением времени.</p>
        <div class="settings-row"><div><label for="enterToggle">Enter отправляет сообщение</label><small>Если выключить, Enter добавит новую строку</small></div><input class="settings-switch" id="enterToggle" type="checkbox" ${prefs.enterToSend?'checked':''}></div>
        <div class="settings-row"><div><label for="timesToggle">Время у сообщений</label><small>Показывать время отправки</small></div><input class="settings-switch" id="timesToggle" type="checkbox" ${prefs.showTimes?'checked':''}></div>
      </div>
      <button class="secondary-btn full" id="resetSettings">Сбросить настройки</button><button class="primary-btn full" id="modalOk">Готово</button>`,()=>{
      $('#themeSelect').addEventListener('change',e=>{prefs.theme=e.target.value;savePrefs();});
      $('#fontSizeSelect').addEventListener('change',e=>{prefs.fontSize=e.target.value;savePrefs();});
      $('#compactToggle').addEventListener('change',e=>{prefs.compact=e.target.checked;savePrefs();});
      $('#enterToggle').addEventListener('change',e=>{prefs.enterToSend=e.target.checked;savePrefs();});
      $('#timesToggle').addEventListener('change',e=>{prefs.showTimes=e.target.checked;savePrefs();});
      $('#resetSettings').addEventListener('click',()=>{prefs={...defaultPrefs};savePrefs();openSettings();showToast('Настройки сброшены.');});
    });
  }
  $('#messageInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&prefs.enterToSend){e.preventDefault();$('#messageForm').requestSubmit();}});
  function activationModal(){openModal(`<h2>Активация доступа</h2><p class="modal-lead">Введите лицензионный ключ, выданный администратором. В текущей версии ключи действуют только локально в этом браузере.</p><label class="field-label" for="licenseInput">Лицензионный ключ</label><input class="field" id="licenseInput" placeholder="Например, TM-START-2026" autocomplete="off"><div id="activationMessage"></div><button class="primary-btn full" id="activateBtn">Активировать</button><button class="secondary-btn full" id="modalOk">Отмена</button>` ,()=>{$('#activateBtn').addEventListener('click',()=>{const value=$('#licenseInput').value.trim().toUpperCase();const key=state.keys.find(k=>k.key.toUpperCase()===value&&k.status==='active');const msg=$('#activationMessage');if(!key){msg.className='form-error';msg.textContent='Ключ не найден, отозван или введён неверно.';return;}state.activated=true;key.usedBy='Этот браузер';save();$('#licenseStatus').textContent='Доступ активирован';msg.className='form-success';msg.textContent='Доступ активирован в этом браузере.';showToast('Ключ принят.');setTimeout(closeModal,650);});$('#licenseInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')$('#activateBtn').click();});});}
  function openAdmin(){if(!state.adminUnlocked){adminLogin();return;}adminPanel();}
  function adminLogin(){openModal(`<h2>Панель администратора</h2><p class="modal-lead">Войдите, используя пароль главного администратора.</p><label class="field-label" for="adminPin">PIN администратора</label><input class="field" id="adminPin" type="password" inputmode="numeric" placeholder="Введите PIN"><div id="adminError"></div><button class="primary-btn full" id="adminLoginBtn">Войти</button><button class="secondary-btn full" id="modalOk">Отмена</button>`,()=>{$('#adminLoginBtn').addEventListener('click',()=>{if($('#adminPin').value!==state.adminPin){$('#adminError').className='form-error';$('#adminError').textContent='Неверный PIN.';return;}state.adminUnlocked=true;save();closeModal();adminPanel();});$('#adminPin')?.addEventListener('keydown',e=>{if(e.key==='Enter')$('#adminLoginBtn').click();});});}
  function adminPanel(){adminTab='keys';renderAdmin();}
  function renderAdmin(){const active=state.keys.filter(k=>k.status==='active').length;let inner='';if(adminTab==='keys'){inner=`<div class="stat-grid"><div class="stat"><b>${state.keys.length}</b><span>Всего ключей</span></div><div class="stat"><b>${active}</b><span>Активны</span></div><div class="stat"><b>${state.keys.length-active}</b><span>Отозваны</span></div></div><label class="field-label" for="keyLabel">Название / владелец (необязательно)</label><input class="field" id="keyLabel" placeholder="Например, Клиент 01"><button class="primary-btn full" id="createKeyBtn">＋ Создать лицензионный ключ</button><div class="key-list">${state.keys.map(k=>`<div class="key-row"><div><code>${esc(k.key)}</code><small>${esc(k.label||'Без названия')} · создан: ${esc(k.created)}</small></div><span class="status-pill ${k.status==='active'?'':'revoked'}">${k.status==='active'?'Активен':'Отозван'}</span>${k.status==='active'?`<button class="small-action revoke-key" data-id="${esc(k.id)}">Отозвать</button>`:`<button class="small-action restore-key" data-id="${esc(k.id)}">Восстановить</button>`}<button class="small-action copy-key" data-key="${esc(k.key)}">Копировать</button></div>`).join('')}</div>`;}else{inner=`<h3>Настройки администратора</h3><label class="field-label" for="oldPin">Текущий PIN</label><input class="field" id="oldPin" type="password" placeholder="Текущий PIN"><label class="field-label" for="newPin">Новый PIN (минимум 4 символа)</label><input class="field" id="newPin" type="password" placeholder="Новый PIN"><div id="pinMessage"></div><button class="primary-btn full" id="savePinBtn">Сменить PIN</button><button class="secondary-btn full" id="logoutAdminBtn">Выйти из панели</button>`;}
    openModal(`<h2>Управление доступом</h2><p class="modal-lead">Создание, отзыв и восстановление ключей для этого локального экземпляра.</p><div class="admin-tabs"><button class="admin-tab ${adminTab==='keys'?'active':''}" data-tab="keys">Лицензии</button><button class="admin-tab ${adminTab==='settings'?'active':''}" data-tab="settings">Настройки</button></div>${inner}<button class="secondary-btn full" id="modalOk">Закрыть</button>`,()=>wireAdmin());
  }
  function wireAdmin(){$$('.admin-tab').forEach(b=>b.addEventListener('click',()=>{adminTab=b.dataset.tab;renderAdmin();}));$('#createKeyBtn')?.addEventListener('click',()=>{const key='TM-'+cryptoRandom().toUpperCase();state.keys.unshift({id:'k'+Date.now(),key,label:$('#keyLabel').value.trim()||'Новый пользователь',status:'active',created:stamp(),usedBy:''});save();renderAdmin();showToast('Ключ создан.');});$$('.revoke-key').forEach(b=>b.addEventListener('click',()=>{const k=state.keys.find(k=>k.id===b.dataset.id);if(k){k.status='revoked';save();renderAdmin();showToast('Ключ отозван.');}}));$$('.restore-key').forEach(b=>b.addEventListener('click',()=>{const k=state.keys.find(k=>k.id===b.dataset.id);if(k){k.status='active';save();renderAdmin();showToast('Ключ восстановлен.');}}));$$('.copy-key').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.key);showToast('Ключ скопирован.');}catch{showToast('Ключ: '+b.dataset.key);}}));$('#savePinBtn')?.addEventListener('click',()=>{const msg=$('#pinMessage');if($('#oldPin').value!==state.adminPin){msg.className='form-error';msg.textContent='Текущий PIN неверен.';return;}if($('#newPin').value.length<4){msg.className='form-error';msg.textContent='Новый PIN должен содержать минимум 4 символа.';return;}state.adminPin=$('#newPin').value;save();msg.className='form-success';msg.textContent='PIN изменён для этого браузера.';});$('#logoutAdminBtn')?.addEventListener('click',()=>{state.adminUnlocked=false;save();closeModal();showToast('Вы вышли из панели.');});}
  function cryptoRandom(){const arr=new Uint8Array(6);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(arr);else for(let i=0;i<arr.length;i++)arr[i]=Math.floor(Math.random()*256);return [...arr].map(x=>x.toString(16).padStart(2,'0')).join('');}
  $('#profileName').textContent=state.profileName||'Пользователь';$('#licenseStatus').textContent=state.activated?'Доступ активен':'Требуется активация';
  $('#gateAction').addEventListener('click',()=>{ $('#licenseGate').classList.add('hidden'); activationModal(); });
  $('#gateAdminAction').addEventListener('click',()=>{ $('#licenseGate').classList.add('hidden'); openAdmin(); });
  // Admin access is available from the small key icon in the upper-left toolbar.
  setChat(state.activeChat||'7000');
  updateChatPreviews();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
