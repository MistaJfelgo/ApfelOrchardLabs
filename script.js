const terminal = document.getElementById('terminalText');

const lines = [
  'APFEL ORCHARD GATEWAY',
  '----------------------',
  '[1] BBS',
  '[2] SAVE THE WANG',
  '[3] IBM CLONES',
  '[4] AMIGA',
  '',
  'DIAL 254-566-2753',
  'TO CONNECT',
  '',
  'ATDT2545662753'
];

let output = '';
let line = 0;
let char = 0;

function typeTerminal() {
  if (!terminal) return;

  if (line < lines.length) {
    if (char < lines[line].length) {
      output += lines[line][char];
      char++;
    } else {
      output += '\n';
      line++;
      char = 0;
    }
    terminal.innerHTML = `${escapeHtml(output)}<span class="cursor">_</span>`;
    window.setTimeout(typeTerminal, line > 9 ? 70 : 34);
  } else {
    terminal.innerHTML = `${escapeHtml(output)}<span class="cursor">_</span>`;
    window.setTimeout(resetTerminal, 7000);
  }
}

function resetTerminal() {
  output = '';
  line = 0;
  char = 0;
  typeTerminal();
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

window.addEventListener('DOMContentLoaded', () => {
  typeTerminal();
});
