class BalanceAccount {
  constructor({ name, type, openingBalance = 0 }) {
    this.name = name;
    this.type = type;
    this.openingBalance = openingBalance;
  }

  get closingBalanceSide() {
    return this.type === 'asset' ? 'Soll' : 'Haben';
  }

  calculateClosingBalance(entries) {
    const debit = entries.filter((entry) => entry.side === 'Soll').reduce((sum, entry) => sum + entry.amount, 0);
    const credit = entries.filter((entry) => entry.side === 'Haben').reduce((sum, entry) => sum + entry.amount, 0);
    return this.type === 'asset'
      ? this.openingBalance + debit - credit
      : this.openingBalance + credit - debit;
  }
}

class BusinessCase {
  constructor({ text, debitAccount, creditAccount, amount }) {
    this.text = text;
    this.debitAccount = debitAccount;
    this.creditAccount = creditAccount;
    this.amount = amount;
  }

  get postingText() {
    return `${this.debitAccount} an ${this.creditAccount}`;
  }

  matches(firstAccount, firstSide, secondAccount, secondSide) {
    const correctOrder = firstAccount === this.debitAccount && firstSide === 'Soll'
      && secondAccount === this.creditAccount && secondSide === 'Haben';
    const reverseOrder = firstAccount === this.creditAccount && firstSide === 'Haben'
      && secondAccount === this.debitAccount && secondSide === 'Soll';
    return correctOrder || reverseOrder;
  }
}

class RoundGenerator {
  static templates = [
    { text: 'Wir kaufen technische Anlagen und Maschinen auf Ziel.', debitAccount: 'TA u. Maschinen', creditAccount: 'Verb. a. LL', categoryExample: 'Aktiv-Passiv-Mehrung', amounts: [1250, 1800, 2400, 3150, 4200] },
    { text: 'Wir kaufen neue Büroausstattung auf Ziel. Die Rechnung wird später bezahlt.', debitAccount: 'Betriebs- und Geschäftsausstattung (BGA)', creditAccount: 'Verb. a. LL', amounts: [850, 1250, 1950, 2800, 3650] },
    { text: 'Wir kaufen einen Firmenwagen und bezahlen per Banküberweisung.', debitAccount: 'Fuhrpark', creditAccount: 'Bank', categoryExample: 'Aktivtausch', amounts: [6800, 9200, 11500, 14700, 18900] },
    { text: 'Wir kaufen Rohstoffe auf Ziel.', debitAccount: 'Rohstoffe', creditAccount: 'Verb. a. LL', amounts: [350, 600, 850, 1100, 1450] },
    { text: 'Ein Kunde begleicht seine offene Rechnung per Banküberweisung.', debitAccount: 'Bank', creditAccount: 'Ford. a. LL', amounts: [420, 680, 950, 1250, 1600] },
    { text: 'Wir überweisen einen Teil unserer offenen Lieferantenrechnung.', debitAccount: 'Verb. a. LL', creditAccount: 'Bank', amounts: [300, 550, 800, 1050, 1350] },
    { text: 'Ein Darlehen wird ausgezahlt und unserem Bankkonto gutgeschrieben.', debitAccount: 'Bank', creditAccount: 'Darlehen', amounts: [2500, 4000, 6500, 9000, 12000] },
    { text: 'Wir zahlen einen Teil der Hypothek per Banküberweisung zurück.', debitAccount: 'Hypothek', creditAccount: 'Bank', categoryExample: 'Aktiv-Passiv-Minderung', amounts: [700, 1200, 1800, 2600, 3500] },
    { text: 'Eine Lieferantenverbindlichkeit wird in ein langfristiges Darlehen umgewandelt.', debitAccount: 'Verb. a. LL', creditAccount: 'Darlehen', categoryExample: 'Passivtausch', amounts: [900, 1500, 2400, 3300, 4800] },
    { text: 'Wir heben Geld vom Bankkonto ab und legen es in die Kasse.', debitAccount: 'Kasse', creditAccount: 'Bank', amounts: [100, 200, 350, 500, 750] },
    { text: 'Ein bebautes Grundstück wird gekauft und durch eine Hypothek finanziert.', debitAccount: 'Bebaute Grundstücke', creditAccount: 'Hypothek', amounts: [8500, 12000, 17500, 23000, 28500] },
    { text: 'Die Eigentümerin erhöht ihre Einlage; das Geld geht auf dem Bankkonto ein.', debitAccount: 'Bank', creditAccount: 'Eigenkapital', amounts: [1000, 2500, 4000, 5500, 7000] },
    { text: 'Wir bezahlen Rohstoffe direkt vom Bankkonto.', debitAccount: 'Rohstoffe', creditAccount: 'Bank', amounts: [280, 460, 720, 940, 1280] }
  ];

  static randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  static createCases() {
    const shuffle = (items) => {
      const shuffled = [...items];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
      return shuffled;
    };
    const categoryExamples = this.templates.filter((template) => template.categoryExample);
    const otherCases = shuffle(this.templates.filter((template) => !template.categoryExample)).slice(0, 6);
    return shuffle([...categoryExamples, ...otherCases]).map((template) => new BusinessCase({
      text: template.text,
      debitAccount: template.debitAccount,
      creditAccount: template.creditAccount,
      amount: this.randomItem(template.amounts)
    }));
  }

  static createAccounts() {
    const assets = [
      ['TA u. Maschinen', 10000, 18000], ['Betriebs- und Geschäftsausstattung (BGA)', 2200, 6800],
      ['Fuhrpark', 4500, 11000],
      ['Rohstoffe', 900, 2600], ['Ford. a. LL', 500, 2400],
      ['Kasse', 200, 900], ['Bank', 3500, 9000],
      ['Bebaute Grundstücke', 12000, 26000]
    ].map(([name, min, max]) => new BalanceAccount({ name, type: 'asset', openingBalance: this.randomBalance(min, max) }));
    const liabilities = [
      ['Darlehen', 5000, 12000], ['Hypothek', 6000, 14000], ['Verb. a. LL', 1200, 4200]
    ].map(([name, min, max]) => new BalanceAccount({ name, type: 'liability', openingBalance: this.randomBalance(min, max) }));
    const assetTotal = assets.reduce((sum, account) => sum + account.openingBalance, 0);
    const debtTotal = liabilities.reduce((sum, account) => sum + account.openingBalance, 0);
    liabilities.push(new BalanceAccount({ name: 'Eigenkapital', type: 'liability', openingBalance: assetTotal - debtTotal }));
    return { assets, liabilities };
  }

  static randomBalance(min, max) {
    return Math.round((min + Math.random() * (max - min)) / 100) * 100;
  }
}

class BalanceSheetTrainer {
  constructor() {
    this.cases = [];
    this.assetAccounts = [];
    this.liabilityAccounts = [];
    this.allAccounts = [];
    this.entryCount = 0;
    this.caseList = document.querySelector('#case-list');
    this.ledgerCaseList = document.querySelector('#ledger-case-list');
    this.accountContainers = {
      asset: document.querySelector('#asset-accounts'),
      liability: document.querySelector('#liability-accounts')
    };
    this.connectControls();
    this.newRound();
  }

  connectControls() {
    document.querySelectorAll('.mode-button').forEach((button) => {
      button.addEventListener('click', () => this.setMode(button.dataset.mode));
    });
    document.querySelector('#new-round').addEventListener('click', () => this.newRound());
    document.querySelector('#check-quiz').addEventListener('click', () => this.checkQuiz());
    document.querySelector('#finish-round').addEventListener('click', () => this.finishRound());
    document.querySelector('#show-solutions').addEventListener('click', () => this.toggleSolutions());
  }

  setMode(mode) {
    document.querySelectorAll('.mode-button').forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelector('#quiz-mode').hidden = mode !== 'quiz';
    document.querySelector('#ledger-mode').hidden = mode !== 'ledger';
  }

  newRound() {
    this.cases = RoundGenerator.createCases();
    const accountGroups = RoundGenerator.createAccounts();
    this.assetAccounts = accountGroups.assets;
    this.liabilityAccounts = accountGroups.liabilities;
    this.allAccounts = [...this.assetAccounts, ...this.liabilityAccounts];
    this.entryCount = 0;
    this.renderCases();
    this.renderAccounts();
    document.querySelector('#results').hidden = true;
    document.querySelector('#quiz-results').hidden = true;
    document.querySelector('#progress-label').textContent = 'Neue Runde bereit';
    document.querySelector('#progress-bar').style.width = '0%';
    document.querySelector('#solutions').hidden = true;
    document.querySelector('#show-solutions').textContent = 'Buchungssätze einblenden';
    document.querySelector('#new-round').textContent = 'Neue Runde mischen';
  }

  formatMoney(amount) {
    return `${amount.toLocaleString('de-DE')} €`;
  }

  getBalanceChangeType(businessCase) {
    const debitType = this.allAccounts.find((account) => account.name === businessCase.debitAccount).type;
    const creditType = this.allAccounts.find((account) => account.name === businessCase.creditAccount).type;
    if (debitType === 'asset' && creditType === 'asset') return 'Aktivtausch';
    if (debitType === 'liability' && creditType === 'liability') return 'Passivtausch';
    if (debitType === 'asset' && creditType === 'liability') return 'Aktiv-Passiv-Mehrung';
    return 'Aktiv-Passiv-Minderung';
  }

  renderCases() {
    this.caseList.innerHTML = '';
    this.ledgerCaseList.innerHTML = '';
    this.cases.forEach((businessCase, index) => {
      const quizItem = document.createElement('li');
      quizItem.className = 'case-item quiz-case';
      quizItem.dataset.caseIndex = index;
      const accountOptions = this.allAccounts.map((account) => `<option value="${account.name}">${account.name}</option>`).join('');
      const sideOptions = '<option value="">Soll oder Haben?</option><option value="Soll">Soll</option><option value="Haben">Haben</option>';
      quizItem.innerHTML = `<span class="case-index">${String(index + 1).padStart(2, '0')}</span><div class="case-content"><p>${businessCase.text}</p><span class="case-amount">Betrag: <strong>${this.formatMoney(businessCase.amount)}</strong></span><div class="quiz-fields"><div class="quiz-answer-pair"><label><span>1. Konto</span><select class="quiz-account-one"><option value="">Konto wählen</option>${accountOptions}</select></label><label><span>Buchungsseite</span><select class="quiz-side-one">${sideOptions}</select></label></div><div class="quiz-answer-pair"><label><span>2. Konto</span><select class="quiz-account-two"><option value="">Konto wählen</option>${accountOptions}</select></label><label><span>Buchungsseite</span><select class="quiz-side-two">${sideOptions}</select></label></div><label class="quiz-change-field"><span>Bilanzveränderung</span><select class="quiz-balance-change"><option value="">Veränderung auswählen</option><option>Aktivtausch</option><option>Passivtausch</option><option>Aktiv-Passiv-Mehrung</option><option>Aktiv-Passiv-Minderung</option></select></label></div><p class="case-feedback" aria-live="polite"></p></div>`;
      this.caseList.append(quizItem);

      const ledgerItem = document.createElement('li');
      ledgerItem.className = 'case-item compact-case';
      ledgerItem.innerHTML = `<span class="case-index">${String(index + 1).padStart(2, '0')}</span><div class="case-content"><p>${businessCase.text}</p></div><strong class="case-amount">${this.formatMoney(businessCase.amount)}</strong>`;
      this.ledgerCaseList.append(ledgerItem);
    });
    document.querySelector('#progress-count').textContent = `${this.cases.length} neue Geschäftsfälle`;
  }

  renderAccounts() {
    this.accountContainers.asset.innerHTML = '';
    this.accountContainers.liability.innerHTML = '';
    this.allAccounts.forEach((account) => {
      const card = document.createElement('article');
      card.className = 'account-card';
      card.dataset.account = account.name;
      card.dataset.type = account.type;
      const beginningSide = account.closingBalanceSide;
      card.innerHTML = `<div class="account-card-head"><h4>${account.name}</h4><span class="account-type">${account.type === 'asset' ? 'Aktivkonto' : 'Passivkonto'}</span></div><div class="t-ledger"><div class="t-ledger-heading"><span>Soll</span><span>Haben</span></div><div class="opening-row"><span class="opening-entry ${beginningSide === 'Soll' ? 'debit-opening' : ''}">${beginningSide === 'Soll' ? `AB ${this.formatMoney(account.openingBalance)}` : ''}</span><span class="opening-entry ${beginningSide === 'Haben' ? 'credit-opening' : ''}">${beginningSide === 'Haben' ? `AB ${this.formatMoney(account.openingBalance)}` : ''}</span></div><div class="entry-list"></div></div><div class="account-entry-form"><label><span>Fall</span><select class="entry-case"><option value="">Nr.</option>${this.cases.map((_, index) => `<option value="${index}">${index + 1}</option>`).join('')}</select></label><label><span>Seite</span><select class="entry-side"><option value="Soll">Soll</option><option value="Haben">Haben</option></select></label><label class="entry-amount-label"><span>Betrag</span><input class="entry-amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="€"></label><button class="add-entry" type="button" aria-label="Buchungszeile zu ${account.name} hinzufügen">+</button></div><div class="account-card-foot"><span>Anfangsbestand</span><strong>${this.formatMoney(account.openingBalance)}</strong></div>`;
      card.querySelector('.add-entry').addEventListener('click', () => this.addAccountEntry(card, account));
      this.accountContainers[account.type].append(card);
    });
  }

  addAccountEntry(card, account) {
    const caseSelect = card.querySelector('.entry-case');
    const sideSelect = card.querySelector('.entry-side');
    const amountInput = card.querySelector('.entry-amount');
    const caseIndex = Number(caseSelect.value);
    const amount = Number(amountInput.value);
    if (caseSelect.value === '' || !Number.isFinite(amount) || amount <= 0) {
      card.classList.add('has-input-error');
      return;
    }
    card.classList.remove('has-input-error');
    const side = sideSelect.value;
    const row = document.createElement('div');
    row.className = `ledger-entry-row ${side === 'Soll' ? 'debit-row' : 'credit-row'}`;
    row.dataset.caseIndex = caseIndex;
    row.dataset.side = side;
    row.dataset.amount = amount;
    const entryCell = document.createElement('span');
    entryCell.className = 'ledger-entry-cell';
    entryCell.innerHTML = `<small>Fall ${caseIndex + 1}</small><strong>${this.formatMoney(amount)}</strong>`;
    row.append(document.createElement('span'), document.createElement('span'));
    const selectedCell = side === 'Soll' ? row.children[0] : row.children[1];
    selectedCell.replaceWith(entryCell);
    const remove = document.createElement('button');
    remove.className = 'remove-entry';
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Buchungszeile entfernen');
    remove.addEventListener('click', () => { row.remove(); this.updateEntryCount(); });
    entryCell.append(remove);
    card.querySelector('.entry-list').append(row);
    this.entryCount += 1;
    caseSelect.value = '';
    amountInput.value = '';
    this.updateEntryCount();
  }

  updateEntryCount() {
    this.entryCount = document.querySelectorAll('.ledger-entry-row:not(.closing-row)').length;
    document.querySelector('#progress-label').textContent = `${this.entryCount} Buchungszeilen eingetragen`;
    document.querySelector('#progress-bar').style.width = `${Math.min(100, this.entryCount / (this.cases.length * 2) * 100)}%`;
  }

  checkQuiz() {
    let correctCount = 0;
    document.querySelectorAll('.quiz-case').forEach((item, index) => {
      const answer = this.cases[index];
      const firstAccount = item.querySelector('.quiz-account-one').value;
      const firstSide = item.querySelector('.quiz-side-one').value;
      const secondAccount = item.querySelector('.quiz-account-two').value;
      const secondSide = item.querySelector('.quiz-side-two').value;
      const changeType = item.querySelector('.quiz-balance-change').value;
      const postingCorrect = answer.matches(firstAccount, firstSide, secondAccount, secondSide);
      const changeCorrect = changeType === this.getBalanceChangeType(answer);
      const correct = postingCorrect && changeCorrect;
      const feedback = item.querySelector('.case-feedback');
      item.classList.toggle('is-correct', correct);
      item.classList.toggle('is-incorrect', !correct);
      feedback.textContent = correct ? 'Richtig' : `Soll: ${answer.debitAccount} · Haben: ${answer.creditAccount} · ${this.getBalanceChangeType(answer)}`;
      feedback.className = `case-feedback ${correct ? 'correct-text' : 'incorrect-text'}`;
      if (correct) correctCount += 1;
    });
    const result = document.querySelector('#quiz-results');
    result.hidden = false;
    result.textContent = `${correctCount} von ${this.cases.length} Buchungssätzen richtig.`;
    result.className = `quiz-results ${correctCount === this.cases.length ? 'all-correct' : ''}`;
  }

  collectEntries() {
    const entries = new Map();
    this.allAccounts.forEach((account) => {
      const card = [...document.querySelectorAll('.account-card')].find((item) => item.dataset.account === account.name);
      const rows = [...card.querySelectorAll('.ledger-entry-row:not(.closing-row)')].map((row) => ({
        caseIndex: Number(row.dataset.caseIndex), side: row.dataset.side, amount: Number(row.dataset.amount)
      }));
      entries.set(account.name, rows);
    });
    return entries;
  }

  checkPosting(entries) {
    let correct = true;
    this.allAccounts.forEach((account) => {
      const rows = entries.get(account.name);
      this.cases.forEach((businessCase, index) => {
        const expectedSide = account.name === businessCase.debitAccount ? 'Soll'
          : account.name === businessCase.creditAccount ? 'Haben' : null;
        const caseRows = rows.filter((entry) => entry.caseIndex === index);
        if (expectedSide === null ? caseRows.length !== 0 : caseRows.length !== 1 || caseRows[0].side !== expectedSide || caseRows[0].amount !== businessCase.amount) {
          correct = false;
        }
      });
    });
    return correct;
  }

  renderClosingEntries(entries) {
    this.allAccounts.forEach((account) => {
      const card = [...document.querySelectorAll('.account-card')].find((item) => item.dataset.account === account.name);
      card.querySelector('.closing-row')?.remove();
      const closingBalance = account.calculateClosingBalance(entries.get(account.name));
      const closingSide = account.closingBalanceSide === 'Soll' ? 'Haben' : 'Soll';
      const row = document.createElement('div');
      row.className = `ledger-entry-row closing-row ${closingSide === 'Soll' ? 'debit-row' : 'credit-row'}`;
      const entryCell = document.createElement('span');
      entryCell.className = 'ledger-entry-cell';
      entryCell.innerHTML = `<small>Schlussbestand</small><strong>${this.formatMoney(closingBalance)}</strong>`;
      row.append(document.createElement('span'), document.createElement('span'));
      row.children[closingSide === 'Soll' ? 0 : 1].replaceWith(entryCell);
      card.querySelector('.entry-list').append(row);
    });
  }

  renderBalances(accounts, entries, containerId, totalId) {
    const container = document.querySelector(containerId);
    let total = 0;
    container.innerHTML = accounts.map((account) => {
      const ending = account.calculateClosingBalance(entries.get(account.name));
      total += ending;
      return `<div class="balance-row"><span>${account.name}</span><strong>${this.formatMoney(ending)}</strong></div>`;
    }).join('');
    document.querySelector(totalId).textContent = `Bilanzsumme: ${this.formatMoney(total)}`;
    return total;
  }

  finishRound() {
    const entries = this.collectEntries();
    this.renderClosingEntries(entries);
    const assetTotal = this.renderBalances(this.assetAccounts, entries, '#asset-balances', '#asset-total');
    const liabilityTotal = this.renderBalances(this.liabilityAccounts, entries, '#liability-balances', '#liability-total');
    const postingsCorrect = this.checkPosting(entries);
    const balancesMatch = assetTotal === liabilityTotal;
    const result = document.querySelector('#results');
    const status = document.querySelector('#result-status');
    const message = document.querySelector('#result-message');
    result.hidden = false;
    status.textContent = postingsCorrect && balancesMatch ? 'Alles stimmt' : 'Bitte noch prüfen';
    status.className = `result-status ${postingsCorrect && balancesMatch ? 'status-good' : 'status-review'}`;
    message.textContent = postingsCorrect
      ? (balancesMatch ? 'Alle Buchungen sind korrekt. Die Schlussbilanz ist ausgeglichen.' : 'Die Buchungen stimmen, aber die Bilanzsummen sind verschieden. Prüfe deine Anfangsbestände und Überträge.')
      : 'Mindestens eine Buchung fehlt oder ist falsch. Deine Schlussbestände wurden trotzdem aus den eingetragenen Werten berechnet.';
    message.className = `result-message ${postingsCorrect && balancesMatch ? 'message-good' : 'message-review'}`;
    document.querySelector('#journal-check').textContent = `${this.entryCount} Buchungszeilen in deinen T-Konten · ${postingsCorrect ? 'Buchungssätze stimmen' : 'Buchungssätze noch nicht vollständig oder fehlerhaft'}`;
    document.querySelector('#solutions').innerHTML = this.cases.map((businessCase, index) => `<div><span>Fall ${index + 1}</span><strong>${businessCase.postingText}</strong><b>${this.formatMoney(businessCase.amount)}</b></div>`).join('');
    document.querySelector('#new-round').textContent = 'Nächste Runde starten';
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleSolutions() {
    const solutions = document.querySelector('#solutions');
    solutions.hidden = !solutions.hidden;
    document.querySelector('#show-solutions').textContent = solutions.hidden ? 'Buchungssätze einblenden' : 'Buchungssätze ausblenden';
  }
}

new BalanceSheetTrainer();
