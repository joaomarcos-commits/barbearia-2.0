(() => {
  const WHATSAPP = '5511999999999'; // troque pelo número real (55 + DDD + número)
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const brl = n => n.toLocaleString('pt-BR');

  /* Header, menu e botão de topo */
  const header = $('header'), burger = $('.burger'), menu = $('#menu'), toTop = $('#toTop');
  const onScroll = () => {
    header.classList.toggle('scrolled', scrollY > 30);
    toTop.classList.toggle('show', scrollY > 700);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* Link ativo conforme a seção visível */
  const links = $$('#menu a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* Aparição suave: título de cada seção */
  $$('section:not(.hero) h2').forEach(h => h.classList.add('reveal'));
  const rev = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); }
  }), { threshold: .2 });
  $$('.reveal').forEach(el => rev.observe(el));

  /* Contadores animados */
  const cnt = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = '+' + brl(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick); cnt.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cnt.observe(el));

  /* Funcionamento: aberto agora? e lotação estimada */
  const schedule = d => d === 0 ? [8, 14] : d === 6 ? [7, 18] : [5, 23];
  const now = new Date(), day = now.getDay(), hr = now.getHours() + now.getMinutes() / 60;
  const [o, c] = schedule(day), isOpen = hr >= o && hr < c;
  $('#openNow').innerHTML = isOpen
    ? `<span class="dot"></span>Aberto agora, fecha às ${c}h.`
    : 'Fechado agora. Abrimos às ' + (hr < o ? `${o}h hoje.` : `${schedule((day + 1) % 7)[0]}h amanhã.`);

  const curve = h => { // estimativa por faixa de horário (picos às 6-8h e 18-20h)
    const pts = [[5,20],[6,55],[7,75],[8,60],[10,35],[12,45],[14,30],[16,40],[18,80],[19,92],[20,78],[21,50],[23,15]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, x] = pts[i], [b, y] = pts[i + 1];
      if (h >= a && h <= b) return x + (y - x) * (h - a) / (b - a);
    }
    return 10;
  };
  let pct = isOpen ? Math.round(curve(hr) * (day === 0 || day === 6 ? .6 : 1)) : 0;
  const msg = pct === 0 ? 'Academia fechada no momento.' : pct < 40 ? 'Tranquilo. Ótima hora para treinar sem fila.' : pct < 75 ? 'Movimento moderado. Quase sem espera nos aparelhos.' : 'Horário de pico. Pode haver espera em alguns aparelhos.';
  $('#liveMsg').textContent = msg + (isOpen ? ' (estimativa)' : '');
  $('.bar').setAttribute('aria-valuenow', pct);
  requestAnimationFrame(() => setTimeout(() => {
    $('#fill').style.width = pct + '%';
    const t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / 1400, 1); $('#pct').textContent = Math.round(pct * p); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, 400));

  /* Planos */
  const plans = [
    { nome: 'Básico', m: 89, a: 69, feats: [['Musculação livre', 1], ['Avaliação física inicial', 1], ['Horário comercial (6h às 17h)', 1], ['Aulas coletivas', 0], ['Personal training', 0]] },
    { nome: 'Plus', m: 129, a: 99, best: 1, feats: [['Musculação livre, horário integral', 1], ['Funcional, spinning e yoga', 1], ['Avaliação física a cada 3 meses', 1], ['Traga 1 amigo por mês', 1], ['Personal training', 0]] },
    { nome: 'Elite', m: 199, a: 159, feats: [['Todas as modalidades', 1], ['Boxe e Muay Thai incluídos', 1], ['2 sessões de personal por mês', 1], ['Avaliação física mensal', 1], ['Armário fixo e toalha', 1]] }
  ];
  let billing = 'mensal';
  const msgPlano = n => `Olá! Tenho interesse no plano ${n} (${billing}) da FitZone.`;
  const renderPlans = () => {
    $('#plans').innerHTML = plans.map(p => {
      const price = billing === 'mensal' ? p.m : p.a;
      const note = billing === 'mensal' ? 'Sem fidelidade' : `Cobrança anual de R$ ${brl(p.a * 12)}`;
      return `<article class="plan${p.best ? ' best' : ''}">
        ${p.best ? '<span class="tag">Mais escolhido</span>' : ''}
        <h3>${p.nome}</h3>
        <div class="price"><small>R$</small> ${price}<small>/mês</small></div>
        <p class="note">${note}</p>
        <ul>${p.feats.map(([t, on]) => `<li class="${on ? '' : 'off'}">${t}</li>`).join('')}</ul>
        <a class="btn${p.best ? '' : ' ghost'}" target="_blank" rel="noopener" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msgPlano(p.nome))}">Quero o ${p.nome}</a>
      </article>`;
    }).join('');
  };
  $$('.toggle button').forEach(b => b.addEventListener('click', () => {
    billing = b.dataset.billing;
    $$('.toggle button').forEach(x => x.setAttribute('aria-pressed', x === b));
    renderPlans();
  }));
  renderPlans();

  /* Grade de aulas */
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const A = (h, n, p, v) => ({ h, n, p, v });
  const semana = [
    A('07h00', 'Funcional', 'Prof. Rafa', 'Plus'), A('08h30', 'Yoga', 'Profa. Lia', 'Plus'),
    A('18h00', 'Spinning', 'Prof. Bruno', 'Plus'), A('19h15', 'Boxe', 'Prof. Davi', 'Elite'), A('20h30', 'Funcional', 'Profa. Carla', 'Plus')
  ];
  const grade = {
    1: semana, 3: semana,
    2: [A('06h30', 'Spinning', 'Prof. Bruno', 'Plus'), A('09h00', 'Yoga', 'Profa. Lia', 'Plus'), A('18h30', 'Muay Thai', 'Prof. Davi', 'Elite'), A('19h45', 'Funcional', 'Prof. Rafa', 'Plus')],
    4: [A('07h00', 'Funcional', 'Prof. Rafa', 'Plus'), A('12h15', 'Mobilidade', 'Profa. Lia', 'Plus'), A('18h00', 'Spinning', 'Prof. Bruno', 'Plus'), A('19h15', 'Boxe', 'Prof. Davi', 'Elite')],
    5: [A('06h30', 'Spinning', 'Prof. Bruno', 'Plus'), A('08h00', 'Funcional', 'Profa. Carla', 'Plus'), A('18h00', 'Funcional', 'Prof. Rafa', 'Plus'), A('19h00', 'Yoga', 'Profa. Lia', 'Plus')],
    6: [A('08h00', 'Aulão de funcional', 'Equipe FitZone', 'Plus'), A('09h30', 'Spinning', 'Prof. Bruno', 'Plus'), A('11h00', 'Boxe', 'Prof. Davi', 'Elite')],
    0: [A('09h00', 'Yoga', 'Profa. Lia', 'Plus'), A('10h30', 'Funcional', 'Prof. Rafa', 'Plus')]
  };
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  const tabs = $('#tabs'), list = $('#classes');
  const showDay = d => {
    $$('button', tabs).forEach(b => b.setAttribute('aria-selected', +b.dataset.d === d));
    list.innerHTML = grade[d].map(a => `<li class="cls"><time>${a.h}</time><div><strong>${a.n}</strong><span>${a.p}</span></div><em>${a.v === 'Elite' ? 'Plano Elite' : 'Plus e Elite'}</em></li>`).join('');
  };
  tabs.innerHTML = ordem.map(d => `<button role="tab" data-d="${d}" aria-selected="false">${dias[d]}</button>`).join('');
  tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showDay(+b.dataset.d); });
  tabs.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const bs = $$('button', tabs), i = bs.indexOf(document.activeElement);
    const n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
    n.focus(); showDay(+n.dataset.d);
  });
  showDay(day);

  /* Contato: validação + envio para o WhatsApp */
  $('#waBtn').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre a FitZone.')}`;
  const form = $('#form');
  const rules = {
    nome: v => v.trim().length >= 3 || 'Digite seu nome completo.',
    tel: v => v.replace(/\D/g, '').length >= 10 || 'Digite o DDD e o número, por exemplo (11) 90000-0000.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Digite um e-mail válido, como nome@email.com.'
  };
  const check = el => {
    const r = rules[el.name]; if (!r) return true;
    const res = r(el.value), ok = res === true;
    el.setAttribute('aria-invalid', !ok);
    el.parentElement.querySelector('.err').textContent = ok ? '' : res;
    return ok;
  };
  $$('input', form).forEach(el => el.addEventListener('blur', () => check(el)));
  $('input[name="tel"]').addEventListener('input', e => {
    let d = e.target.value.replace(/\D/g, '').slice(0, 11), s = d;
    if (d.length > 2) s = `(${d.slice(0, 2)}) ${d.slice(2, d.length > 10 ? 7 : 6)}${d.length > (d.length > 10 ? 7 : 6) ? '-' + d.slice(d.length > 10 ? 7 : 6) : ''}`;
    e.target.value = s;
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fields = $$('input[name]', form).filter(el => rules[el.name]);
    const valid = fields.map(check).every(Boolean);
    if (!valid) { fields.find(f => f.getAttribute('aria-invalid') === 'true').focus(); return; }
    const f = new FormData(form);
    const texto = `Olá! Meu nome é ${f.get('nome')}. Quero agendar uma aula grátis de ${f.get('interesse')}.\nWhatsApp: ${f.get('tel')}\nE-mail: ${f.get('email')}` + (f.get('msg').trim() ? `\nMensagem: ${f.get('msg').trim()}` : '');
    $('#ok').classList.add('show');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    form.reset();
  });

  $('#year').textContent = now.getFullYear();
})();