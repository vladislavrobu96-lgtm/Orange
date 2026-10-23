(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const STORE = 'transportMessages_v1';
  const ADMIN_PIN_KEY = 'transportMessages_adminPin';
  const defaultState = () => ({activeChat:'7000',profileName:'Пользователь',messages:{'7000':[{id:1,from:'system',text:'Trimiteți codul de patru cifre pentru procesare.',time:stamp()}],'7001':[{id:2,from:'system',text:'Trimiteți codul de patru cifre pentru procesare.',time:stamp()}]},keys:[],activated:false,adminPin:'2468',adminUnlocked:false});
  function stamp(){return new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});}
  let state;
  try { state = JSON.parse(localStorage.getItem(STORE)) || defaultState(); } catch { state = defaultState(); }
  // Standalone app state is saved in this browser.
  function save(){localStorage.setItem(STORE,JSON.stringify(state));}
  let activeView='messages',adminTab='keys',toastTimer;
  const PREF_KEY='transportMessages_preferences';
  const defaultPrefs={theme:'light',fontSize:'normal',enterToSend:true,compact:false,showTimes:false};
  let prefs;try{prefs={...defaultPrefs,...JSON.parse(localStorage.getItem(PREF_KEY)||'{}')};}catch{prefs={...defaultPrefs};}
  function savePrefs(){localStorage.setItem(PREF_KEY,JSON.stringify(prefs));applyPrefs();}
  function applyPrefs(){document.body.dataset.theme=prefs.theme==='dark'?'dark':'light';document.documentElement.style.setProperty('--message-font-size',prefs.fontSize==='small'?'15px':prefs.fontSize==='large'?'20px':'17px');document.body.classList.toggle('compact-messages',!!prefs.compact);document.body.classList.toggle('hide-message-times',!prefs.showTimes);document.body.classList.remove('show-island');const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=prefs.theme==='dark'?'#000000':'#ffffff';}
  applyPrefs();
  const chats={
    '7000':{name:'7000',subtitle:'Текстовое сообщение · SMS',type:'trolley',initial:[{id:'7000a',from:'system',text:'Trimiteți codul de patru cifre pentru procesare.',time:stamp()}]},
    '7001':{name:'7001',subtitle:'Текстовое сообщение · SMS',type:'bus',initial:[{id:'7001a',from:'system',text:'Trimiteți codul de patru cifre pentru procesare.',time:stamp()}]},
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
  const ACCESS_STORE='transportMessages_access_v2';
  const ACCESS_HASHES=["637ad71e2f22554f1a644a7c247c73d11d977ab35b3f42ae4cf23c2db120468b", "db90fb07cc41086f29e395999034cbc8afc8dbc5cc4b307f810f4decf5ac07d8", "b96a2d6cfd47055e8ddb947ca8a91a2b50965424f118800d79d7fa8f6703c857", "5d10f3e84c4b173f713dae991bb1393aceb9b97433e19b30dc1bfe721a66cf78", "5793c4596c0a21af7c0db730129beaa93d8d5026796969ccb7b2fd76bd51b5e4", "af8b3cae087c9aa669e1ee53f395e085f2ae16f6f16604ff1c1c52b26d018a1b", "3c95657a654a5ca40602e3a246bef30d482849f542598b480bea2fc7ba730022", "4a1cd865ed02d6589efa10421ea3ddb764ca558bb364d6a544bbc1f9638d6c32", "f2b874330aea5fc7c3bbacba87656f9c1333dd3c33ef6fa1610ba119250cde22", "01e1a4ab7403d7c45d25a82d83b0278307cd049af1d63227b92288257f3a8912", "131b93ba5b5337534402c311b867758e4b045d06f96efbdebe6de403c222ceb1", "d0c21fbaee3457a616f9fc8ba8f8ee6ce72a7c70ec9ff5c7cd3dd6e0b3590e50", "c40e759a85c054dc738fb5a2c0ef012ac17d23bebc480afa01bd9f7e66e15bf7", "0602f8e9d90e84ab273e7647840a1d95705ca7233c76ab0e33bee7994e4355df", "04b7e57e6f5c49143cc35629226b4a1bc2d07e6309c2a88101771926a049a6f5", "64aef91e682f75470210199134d95bb627f1ed677d3ffa2ccb0c91a23e4719f5", "9b424e7a51949da4e9792e361060454dd02d9889d106d6f2b28c45e0b1b67ef8", "7dff9d8f8a0014d7b188dec1805cc3fca24036bb1bc715bcb66871bc4f90ef58", "5cf8f7832616bdd4574d5b878ebd4c3db16c62be2462b684f8aab65f5308142f", "53138419c8a9a220777c842c552d179f175287518b3a93e6f58ca29ebe77d83a"];
  let access;
  try{access=JSON.parse(localStorage.getItem(ACCESS_STORE)||'null');}catch{access=null;}
  if(!access||!Number.isInteger(access.slot)||access.slot<0||access.slot>=ACCESS_HASHES.length){
    const random=new Uint32Array(1);crypto.getRandomValues(random);
    access={slot:Math.floor((random[0]/4294967296)*ACCESS_HASHES.length),activated:false};
    localStorage.setItem(ACCESS_STORE,JSON.stringify(access));
  }
  function saveAccess(){localStorage.setItem(ACCESS_STORE,JSON.stringify(access));}
  function applyAccess(){
    state.activated=access.activated===true;
    document.body.classList.toggle('access-locked',!state.activated);
    $('.app-shell').inert=!state.activated;
    $('#licenseGate').classList.toggle('hidden',state.activated);
    $('#gateTitle').textContent='Активация приложения';
    $('#gateText').textContent='Запрос № '+String(access.slot+1).padStart(2,'0')+'. Введите ключ владельца для этого номера.';
    $('#licenseStatus').textContent=state.activated?'Доступ активен':'Требуется активация';
  }
  function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function setChat(id){if(!chats[id])return;state.activeChat=id;save();renderChat();$$('.chat-item').forEach(b=>b.classList.toggle('active',b.dataset.chat===id));document.querySelector('.app-shell').classList.add('chat-open');$$('.nav-link').forEach(x=>x.classList.toggle('selected',x.dataset.view==='messages'));}
  function renderChat(){
    const id=state.activeChat,c=chats[id];
    $('#headerName').textContent=c.name;$('#headerSubtitle').textContent=c.subtitle;
    $('#headerAvatar').textContent='';
    $('#headerAvatar').className='avatar small '+c.type;
    $('#composerHint').textContent='';
    const box=$('#messages');
    box.innerHTML='<div class="conversation-type">'+esc(c.subtitle)+'</div><div class="day-divider">Сегодня</div>';
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
    const ticketId = ticketNumber || String(code) + String(Math.floor(Math.random() * 100000)).padStart(5,'0');
    const date = `${pad(sentAt.getDate())}.${pad(sentAt.getMonth()+1)}.${sentAt.getFullYear()}`;
    const time = `${pad(sentAt.getHours())}:${pad(sentAt.getMinutes())}`;
    return `Bilet electronic nr. ${ticketId}\nData ${date} ora ${time}\nValabil 1 ora\nPret 7 MDL\nNumar de bord ${code}`;
  }
  function handleSend(text){if(!access.activated){activationModal();return;}text=text.trim();if(!text)return;const id=state.activeChat;const sentAt=new Date();pushMessage(id,{id:Date.now(),from:'user',text,time:stamp()});
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
  function resizeComposer(){const input=$('#messageInput');input.style.height='auto';input.style.height=Math.min(input.scrollHeight,112)+'px';$('.composer').classList.toggle('has-text',!!input.value.trim());}
  $('#messageInput').addEventListener('input',resizeComposer);
  $('#messageInput').addEventListener('focus',()=>setTimeout(()=>{const box=$('#messages');box.scrollTop=box.scrollHeight;},180));
  function fitViewport(){if(window.visualViewport){document.documentElement.style.setProperty('--viewport-height',window.visualViewport.height+'px');}const probe=document.createElement('div');probe.style.paddingTop='env(safe-area-inset-top)';document.body.append(probe);document.body.classList.toggle('has-native-safe-area',parseFloat(getComputedStyle(probe).paddingTop)>0);probe.remove();}
  function syncOverlayInsets(){const panel=$('.main-panel');panel.style.setProperty('--composer-height',$('.composer-wrap').offsetHeight+'px');panel.style.setProperty('--chat-header-height',$('.chat-header').offsetHeight+'px');}
  if('ResizeObserver' in window){const overlayObserver=new ResizeObserver(syncOverlayInsets);overlayObserver.observe($('.composer-wrap'));overlayObserver.observe($('.chat-header'));}else{window.addEventListener('resize',syncOverlayInsets);}
  syncOverlayInsets();
  window.visualViewport?.addEventListener('resize',fitViewport);window.addEventListener('resize',fitViewport);fitViewport();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  $('#messageForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#messageInput');const text=input.value;input.value='';resizeComposer();handleSend(text);});
  $$('.chat-item').forEach(b=>b.addEventListener('click',()=>setChat(b.dataset.chat)));
  $('#mobileBack').addEventListener('click',()=>document.querySelector('.app-shell').classList.remove('chat-open'));
  $('#searchInput').addEventListener('input',e=>{$$('.chat-item').forEach(b=>b.hidden=!(b.textContent.toLowerCase().includes(e.target.value.toLowerCase())));});
  $('#newChatBtn').addEventListener('click',()=>openModal(`<h2>Новый чат</h2><p class="modal-lead">Выберите переписку, чтобы открыть её.</p><div class="quick-chat-list">${Object.entries(chats).map(([id,c])=>`<button class="quick-chat-option" data-open-chat="${esc(id)}"><span class="avatar ${c.type}" aria-hidden="true"></span><span><b>${esc(c.name)}</b><small>${esc(c.subtitle)}</small></span><span class="quick-chat-arrow">›</span></button>`).join('')}</div><button class="secondary-btn full" id="modalOk">Отмена</button>`,()=>$$('[data-open-chat]').forEach(b=>b.addEventListener('click',()=>{setChat(b.dataset.openChat);closeModal();}))));
  $('#attachBtn').addEventListener('click',()=>{const isTransport=state.activeChat==='7000'||state.activeChat==='7001';openModal(`<h2>${isTransport?'Код маршрута':'Действия с сообщением'}</h2><p class="modal-lead">${isTransport?'Выберите пример четырёхзначного кода или введите свой.':'Можно быстро вставить текст в поле сообщения.'}</p>${isTransport?`<div class="quick-code-grid">${['1001','1002','2001','3001'].map(code=>`<button class="quick-code" data-code="${code}">${code}</button>`).join('')}</div>`:''}<label class="field-label" for="quickMessage">${isTransport?'Или свой код / текст':'Текст сообщения'}</label><input class="field" id="quickMessage" maxlength="500" placeholder="${isTransport?'Например, 1001':'Введите сообщение'}"><button class="primary-btn full" id="insertMessage">Вставить в сообщение</button><button class="secondary-btn full" id="modalOk">Закрыть</button>`,()=>{ $$('[data-code]').forEach(b=>b.addEventListener('click',()=>{$('#quickMessage').value=b.dataset.code;}));$('#insertMessage')?.addEventListener('click',()=>{const val=$('#quickMessage').value.trim();if(!val){$('#quickMessage').focus();showToast('Введите текст или код.');return;}$('#messageInput').value=val;closeModal();resizeComposer();$('#messageInput').focus();});});});
  $('#contactDetails').addEventListener('click',()=>$('#infoBtn').click());
  $('#infoBtn').addEventListener('click',()=>openModal(`<h2>О чате ${state.activeChat}</h2><p class="modal-lead">${chats[state.activeChat].subtitle}.</p><button class="secondary-btn full" id="modalOk">Понятно</button>`));
  $('#clearChatBtn').addEventListener('click',()=>openModal(`<h2>Очистить историю?</h2><p class="modal-lead">История чата ${state.activeChat} будет удалена.</p><button class="danger-btn full" id="confirmClear">Удалить историю</button><button class="secondary-btn full" id="modalOk">Отмена</button>`,()=>{$('#confirmClear')?.addEventListener('click',()=>{state.messages[state.activeChat]=[];save();renderChat();updateChatPreviews();closeModal();showToast('История очищена.');});}));
  $('#topSettingsBtn').addEventListener('click',openSettings);
  $('#topAuthBtn').addEventListener('click',()=>$('#profileMenu').click());
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
  $('#messageInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&prefs.enterToSend){e.preventDefault();$('#messageForm').requestSubmit();}});
  function activationModal(){
    if(access.activated){showToast('Доступ уже активирован на этом устройстве.');return;}
    openModal(`<h2>Запрос № ${String(access.slot+1).padStart(2,'0')}</h2><p class="modal-lead">Введите соответствующий ключ из таблицы владельца.</p><label class="field-label" for="licenseInput">Ключ доступа</label><input class="field access-input" id="licenseInput" placeholder="5 букв и цифр" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false"><div id="activationMessage" role="status"></div><button class="primary-btn full" id="activateBtn">Открыть приложение</button><button class="secondary-btn full" id="modalOk">Отмена</button>`,()=>{
      $('#activateBtn').addEventListener('click',async()=>{
        const value=$('#licenseInput').value.trim().toUpperCase();const msg=$('#activationMessage');
        if(!/^[A-Z0-9]{5}$/.test(value)){msg.className='form-error';msg.textContent='Введите 5 латинских букв и цифр.';return;}
        const btn=$('#activateBtn');btn.disabled=true;
        try{
          const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
          const hex=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
          if(hex!==ACCESS_HASHES[access.slot]){msg.className='form-error';msg.textContent='Ключ не подходит для этого номера запроса.';return;}
          access.activated=true;saveAccess();save();applyAccess();closeModal();showToast('Доступ активирован.');
        }catch{msg.className='form-error';msg.textContent='Не удалось проверить ключ. Откройте приложение по HTTPS или через localhost.';}
        finally{if(btn.isConnected)btn.disabled=false;}
      });
      $('#licenseInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#activateBtn').click();});
      $('#licenseInput').focus();
    });
  }
  function openAdmin(){if(!state.adminUnlocked){adminLogin();return;}adminPanel();}
  function adminLogin(){openModal(`<h2>Панель администратора</h2><p class="modal-lead">Войдите, используя пароль главного администратора.</p><label class="field-label" for="adminPin">PIN администратора</label><input class="field" id="adminPin" type="password" inputmode="numeric" placeholder="Введите PIN"><div id="adminError"></div><button class="primary-btn full" id="adminLoginBtn">Войти</button><button class="secondary-btn full" id="modalOk">Отмена</button>`,()=>{$('#adminLoginBtn').addEventListener('click',()=>{if($('#adminPin').value!==state.adminPin){$('#adminError').className='form-error';$('#adminError').textContent='Неверный PIN.';return;}state.adminUnlocked=true;save();closeModal();adminPanel();});$('#adminPin')?.addEventListener('keydown',e=>{if(e.key==='Enter')$('#adminLoginBtn').click();});});}
  function adminPanel(){adminTab='keys';renderAdmin();}
  function renderAdmin(){const active=state.keys.filter(k=>k.status==='active').length;let inner='';if(adminTab==='keys'){inner='';}else{inner=`<h3>Настройки администратора</h3><label class="field-label" for="oldPin">Текущий PIN</label><input class="field" id="oldPin" type="password" placeholder="Текущий PIN"><label class="field-label" for="newPin">Новый PIN (минимум 4 символа)</label><input class="field" id="newPin" type="password" placeholder="Новый PIN"><div id="pinMessage"></div><button class="primary-btn full" id="savePinBtn">Сменить PIN</button><button class="secondary-btn full" id="logoutAdminBtn">Выйти из панели</button>`;}
    if(adminTab==='keys')inner=`<div class="settings-section"><h3>20 ключей доступа</h3><p>Для каждого браузера случайно выбирается один номер запроса. Ключи находятся в отдельной таблице владельца.</p><p>Запрос на этом устройстве: <b>№ ${String(access.slot+1).padStart(2,'0')}</b></p><p>Статус: <b>${access.activated?'Активирован':'Ожидает ключ'}</b></p></div>`;
    openModal(`<h2>Управление доступом</h2><p class="modal-lead">Активация на этом устройстве и настройки администратора.</p><div class="admin-tabs"><button class="admin-tab ${adminTab==='keys'?'active':''}" data-tab="keys">Лицензии</button><button class="admin-tab ${adminTab==='settings'?'active':''}" data-tab="settings">Настройки</button></div>${inner}<button class="secondary-btn full" id="modalOk">Закрыть</button>`,()=>wireAdmin());
  }
  function wireAdmin(){$$('.admin-tab').forEach(b=>b.addEventListener('click',()=>{adminTab=b.dataset.tab;renderAdmin();}));$('#createKeyBtn')?.addEventListener('click',()=>{const key='TM-'+cryptoRandom().toUpperCase();state.keys.unshift({id:'k'+Date.now(),key,label:$('#keyLabel').value.trim()||'Новый пользователь',status:'active',created:stamp(),usedBy:''});save();renderAdmin();showToast('Ключ создан.');});$$('.revoke-key').forEach(b=>b.addEventListener('click',()=>{const k=state.keys.find(k=>k.id===b.dataset.id);if(k){k.status='revoked';save();renderAdmin();showToast('Ключ отозван.');}}));$$('.restore-key').forEach(b=>b.addEventListener('click',()=>{const k=state.keys.find(k=>k.id===b.dataset.id);if(k){k.status='active';save();renderAdmin();showToast('Ключ восстановлен.');}}));$$('.copy-key').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.key);showToast('Ключ скопирован.');}catch{showToast('Ключ: '+b.dataset.key);}}));$('#savePinBtn')?.addEventListener('click',()=>{const msg=$('#pinMessage');if($('#oldPin').value!==state.adminPin){msg.className='form-error';msg.textContent='Текущий PIN неверен.';return;}if($('#newPin').value.length<4){msg.className='form-error';msg.textContent='Новый PIN должен содержать минимум 4 символа.';return;}state.adminPin=$('#newPin').value;save();msg.className='form-success';msg.textContent='PIN изменён для этого браузера.';});$('#logoutAdminBtn')?.addEventListener('click',()=>{state.adminUnlocked=false;save();closeModal();showToast('Вы вышли из панели.');});}
  function cryptoRandom(){const arr=new Uint8Array(6);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(arr);else for(let i=0;i<arr.length;i++)arr[i]=Math.floor(Math.random()*256);return [...arr].map(x=>x.toString(16).padStart(2,'0')).join('');}
  $('#profileName').textContent=state.profileName||'Пользователь';$('#licenseStatus').textContent=state.activated?'Доступ активен':'Требуется активация';
  $('#gateAction').addEventListener('click',activationModal);
  $('#gateAdminAction').addEventListener('click',openAdmin);
  // Admin access is available from the small key icon in the upper-left toolbar.
  setChat(state.activeChat||'7000');
  if(matchMedia('(max-width:700px)').matches)$('.app-shell').classList.remove('chat-open');
  $$('.chat-item .avatar').forEach(a=>{a.textContent='';a.setAttribute('aria-hidden','true');});
  updateChatPreviews();
  applyAccess();
  window.addEventListener('storage',e=>{if(e.key===ACCESS_STORE){try{const updated=JSON.parse(e.newValue);if(updated?.slot===access.slot){access.activated=updated.activated===true;applyAccess();}}catch{}}});
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();


