const destinations = {
  bbs: {
    title: 'Apfel Orchard BBS',
    status: 'Ready',
    description: 'Launches the live WebSocket terminal bridge to the Synchronet BBS.',
    command: 'CONNECT bbs.gutapfel.com.apfelorchardlabs.org',
    endpoint: 'wss://bbs.gutapfel.com.apfelorchardlabs.org/'
  },
  wang: {
    title: 'Save The WANG',
    status: 'Branch',
    description: 'Preservation notes, recovered media, hardware records, and Wang Professional Computer work.',
    command: 'OPEN https://savethewang.org',
    href: 'https://savethewang.org'
  },
  ibm: {
    title: 'IBM Clones',
    status: 'Grafting',
    description: 'Future home for PC compatibles, cards, drives, utilities, and clone-era notes.',
    command: 'C:\\>DIR /W'
  },
  amiga: {
    title: 'Archive The Amiga',
    status: 'Germinating',
    description: 'Future archive for Amiga disks, demos, sound, graphics, and restoration notes.',
    command: 'SYS:WORKBENCH'
  }
};

const select = document.getElementById('destinationSelect');
const preview = document.getElementById('destinationPreview');
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const shell = document.getElementById('terminalShell');
const terminalTitle = document.getElementById('terminalTitle');
const terminalNote = document.getElementById('terminalNote');
const terminalHost = document.getElementById('liveTerminal');

let term;
let fitAddon;
let socket;

function renderDestination() {
  const destination = destinations[select.value];
  preview.innerHTML = `
    <span class="path-status">${escapeHtml(destination.status)}</span>
    <h2>${escapeHtml(destination.title)}</h2>
    <p>${escapeHtml(destination.description)}</p>
    <code>${escapeHtml(destination.command)}</code>
  `;

  connectButton.textContent = destination.endpoint ? 'Connect terminal' : 'Open destination';
  terminalTitle.textContent = destination.title.toUpperCase();
  terminalNote.innerHTML = destination.endpoint
    ? `Browser terminal endpoint: <code>${escapeHtml(destination.endpoint)}</code>`
    : 'This branch is not wired to the live terminal yet.';
}

function connectSelectedDestination() {
  const destination = destinations[select.value];

  if (destination.href) {
    window.location.href = destination.href;
    return;
  }

  if (!destination.endpoint) {
    showLocalTerminal(destination);
    return;
  }

  openLiveTerminal(destination);
}

function createTerminal() {
  terminalHost.innerHTML = '';
  term = new Terminal({
    cursorBlink: true,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 15,
    theme: {
      background: '#020503',
      foreground: '#62ff8c',
      cursor: '#ffe7b5',
      selectionBackground: '#244b30'
    }
  });
  fitAddon = new FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  term.open(terminalHost);
  fitAddon.fit();
  window.addEventListener('resize', fitTerminal, { passive: true });
}

function openLiveTerminal(destination) {
  disconnectTerminal();
  shell.hidden = false;
  createTerminal();
  term.writeln('APFEL ORCHARD TERMINAL');
  term.writeln('Opening WebSocket bridge...');
  term.writeln('');

  try {
    socket = new WebSocket(destination.endpoint);
    socket.binaryType = 'arraybuffer';

    socket.addEventListener('open', () => {
      term.writeln('CONNECT 57600');
      term.writeln('');
      const attachAddon = new AttachAddon.AttachAddon(socket);
      term.loadAddon(attachAddon);
      fitTerminal();
    });

    socket.addEventListener('close', () => {
      term.writeln('');
      term.writeln('[connection closed]');
    });

    socket.addEventListener('error', () => {
      term.writeln('');
      term.writeln('[connection error]');
      term.writeln('Check the Cloudflare/WebSocket route for the BBS endpoint.');
    });
  } catch (error) {
    term.writeln('[terminal unavailable]');
    term.writeln(String(error));
  }
}

function showLocalTerminal(destination) {
  disconnectTerminal();
  shell.hidden = false;
  createTerminal();
  term.writeln('APFEL ORCHARD TERMINAL');
  term.writeln('----------------------');
  term.writeln(destination.title.toUpperCase());
  term.writeln('');
  term.writeln(destination.description);
  term.writeln('');
  term.writeln(destination.command);
  term.writeln('');
  term.writeln('[destination not connected to live terminal yet]');
}

function disconnectTerminal() {
  if (socket && socket.readyState <= 1) socket.close();
  socket = null;
  if (term) term.dispose();
  term = null;
  fitAddon = null;
  terminalHost.innerHTML = '';
}

function fitTerminal() {
  if (fitAddon) fitAddon.fit();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

select.addEventListener('change', renderDestination);
connectButton.addEventListener('click', connectSelectedDestination);
disconnectButton.addEventListener('click', () => {
  disconnectTerminal();
  shell.hidden = true;
});

renderDestination();
