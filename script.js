const checkBtn = document.getElementById('check-btn');
const stopCheckBtn = document.getElementById('stop-check-btn');
const numbersTextarea = document.getElementById('numbers');
const resultOutputTextarea = document.getElementById('result-output');

const liveNumbersTextarea = document.getElementById('ali-numbers');
const deadNumbersTextarea = document.getElementById('muhammad-numbers');
const unknownNumbersTextarea = document.getElementById('murad-numbers');

let stopChecking = false;
let liveCount = 0;
let deadCount = 0;
let unknownCount = 0;

checkBtn.addEventListener('click', startChecking);
stopCheckBtn.addEventListener('click', () => {
  stopChecking = true;
  stopCheckBtn.disabled = true;
  checkBtn.disabled = false;
  appendToStatusOutput("⏹️ Checking stopped by user.\n");
});

function toggleButtons() {
  checkBtn.disabled = true;
  stopCheckBtn.disabled = false;
}

async function startChecking() {
  stopChecking = false;
  liveCount = 0;
  deadCount = 0;
  unknownCount = 0;

  resultOutputTextarea.value = "";
  liveNumbersTextarea.value = "";
  deadNumbersTextarea.value = "";
  unknownNumbersTextarea.value = "";
  updateSummaryCounts(0, 0, 0);

  const input = numbersTextarea.value.trim();
  const cards = input.split("\n").filter(line => line.trim() !== "");

  if (cards.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No cards provided!',
      text: 'Please enter credit card numbers to check.',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false
    });
    return;
  }

  checkBtn.disabled = true;
  stopCheckBtn.disabled = false;

  appendToStatusOutput(`⏳ Starting check of ${cards.length} cards...\n`);

  for (let i = 0; i < cards.length; i++) {
    if (stopChecking) break;

    const card = cards[i].trim();
    appendToStatusOutput(`➡️ Checking card ${i + 1} of ${cards.length}: ${card}\n`);

    try {
      const apiURL = `https://chkr-api.vercel.app/api/check?cc=${encodeURIComponent(card)}`;
      const response = await fetch(apiURL);

      if (!response.ok) throw new Error(`API responded with status ${response.status}`);

      const data = await response.json();

      let status = 'Unknown';
      if (data.status === 'Live' || data.status === 'APPROVED') status = 'Live';
      else if (data.status === 'Die' || data.status === 'DECLINED') status = 'Dead';

      if (status === 'Live') {
        liveCount++;
        liveNumbersTextarea.value += card + "\n";
      } else if (status === 'Dead') {
        deadCount++;
        deadNumbersTextarea.value += card + "\n";
      } else {
        unknownCount++;
        unknownNumbersTextarea.value += card + "\n";
      }

      appendToStatusOutput(`Result: ${status === 'Live' ? '🟢 Live' : status === 'Dead' ? '🔴 Dead' : '⚪ Unknown'}\n`);
      updateSummaryCounts(liveCount, deadCount, unknownCount);

    } catch (error) {
      appendToStatusOutput(`❌ Error checking card ${card}: ${error.message}\n`);
    }

    if (i !== cards.length - 1) {
      await countdownTimer(2); // 2 second delay
    }
  }

  appendToStatusOutput("\n✅ Checking Finished!\n");
  checkBtn.disabled = false;
  stopCheckBtn.disabled = true;

  Swal.fire({
    icon: 'success',
    title: 'All cards checked!',
    toast: true,
    position: 'top-end',
    timer: 3000,
    showConfirmButton: false
  });
}

function countdownTimer(seconds) {
  return new Promise((resolve) => {
    let timeLeft = seconds;
    const previousStatus = resultOutputTextarea.value.split('\n').slice(1).join('\n');

    const interval = setInterval(() => {
      resultOutputTextarea.value = `⏳ Waiting: ${timeLeft} second(s) left...\n${previousStatus}`;
      timeLeft--;

      if (timeLeft < 0) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

function appendToStatusOutput(text) {
  resultOutputTextarea.value += text;
  resultOutputTextarea.scrollTop = resultOutputTextarea.scrollHeight;
}

function updateSummaryCounts(live, dead, unknown) {
  document.getElementById('ali-count').textContent = live;
  document.getElementById('muhammad-count').textContent = dead;
  document.getElementById('murad-count').textContent = unknown;
}

function copyToClipboard(id) {
  const textarea = document.getElementById(id);
  textarea.select();
  document.execCommand("copy");

  Swal.fire({
    icon: 'success',
    title: 'Copied!',
    toast: true,
    position: 'top-end',
    timer: 1500,
    showConfirmButton: false
  });
}

function toggleMenu() {
  const menu = document.getElementById('dropdown-menu');
  menu.classList.toggle('show');
}

document.addEventListener('click', function (event) {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('dropdown-menu');

  if (!menu.contains(event.target) && !toggle.contains(event.target)) {
    menu.classList.remove('show');
  }
});
