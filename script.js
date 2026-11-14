// Estado do Jogo
let gameState = {
  phase: 1, // 1: Conversa no Plenário, 2: Pergunta Teórica, 3: Exploração nas Ruas, 4: Plenário Final
  signatures: 0,
  targetSignatures: 4,
  popularity: 60,
};

// Variáveis de exploração nas ruas (Canvas)
let canvas, ctx;
let player = {
  x: 80,
  y: 180,
  width: 32,
  height: 48,
  speed: 3.5,
  name: "DEPUTADO",
};

// NPCs posicionados estrategicamente e totalmente acessíveis nas calçadas e ruas
let npcs = [
  {
    id: 0,
    x: 220,
    y: 110,
    name: "Profª. Carla",
    outfit: "pink",
    signed: false,
    dialog:
      "Olá, deputado! Educação e transporte público sustentável são fundamentais. Tem meu apoio total!",
    refuseChance: 0.1,
  },
  {
    id: 1,
    x: 380,
    y: 220,
    name: "Trabalhador João",
    outfit: "blue",
    signed: false,
    dialog:
      "Não sei se político resolve algo na prática... por que eu assinaria seu projeto de lei?",
    refuseChance: 0.5,
  },
  {
    id: 2,
    x: 500,
    y: 270,
    name: "Estudante Lucas",
    outfit: "green",
    signed: false,
    dialog:
      "Demais! Mais ciclovias e ônibus melhores na cidade são o que precisamos para nossa juventude!",
    refuseChance: 0.2,
  },
  {
    id: 3,
    x: 640,
    y: 130,
    name: "Sr. Roberto",
    outfit: "gray",
    signed: false,
    dialog:
      "Já vi muitos prometerem e não cumprirem. Prove que essa lei vai melhorar o trânsito de verdade.",
    refuseChance: 0.6,
  },
];

let keys = {};
let activeNpc = null;
let gameLoopRunning = false;

// Captura de Teclado (WASD / Setas)
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  keys[e.code] = true;
  if (
    (e.key === "e" || e.key === "E" || e.code === "Space") &&
    activeNpc &&
    gameState.phase === 3
  ) {
    e.preventDefault();
    interactWithNpc(activeNpc);
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
  keys[e.code] = false;
});

// Fase 1: Introdução e Conversa Inicial no Plenário
function renderIntro() {
  document.getElementById("hud-stats").classList.add("hidden");
  const viewport = document.getElementById("game-viewport");
  viewport.innerHTML = `
                <div class="flex flex-col items-center justify-center my-auto text-center py-4">
                    <div class="flex justify-center gap-6 mb-4">
                        <div class="bg-slate-900 border-2 border-blue-500 p-3 rounded-xl shadow-md flex flex-col items-center">
                            <span class="text-2xl mb-1">👔</span>
                            <span class="text-[10px] text-blue-400 font-bold pixel-font">Deputado Carlos</span>
                        </div>
                        <div class="bg-slate-900 border-2 border-purple-500 p-3 rounded-xl shadow-md flex flex-col items-center">
                            <span class="text-2xl mb-1">💼</span>
                            <span class="text-[10px] text-purple-400 font-bold pixel-font">Assessor Parlamentar</span>
                        </div>
                    </div>
                    <h2 class="text-sm sm:text-base font-bold text-white mb-3 pixel-font">Reunião no Congresso Nacional</h2>
                    <p class="text-xs sm:text-sm text-slate-300 max-w-xl mb-6 leading-relaxed">
                        <b>Deputado Carlos:</b> "Precisamos criar leis urgentes para beneficiar a mobilidade urbana e resolver o trânsito caótico das grandes cidades. A sociedade está cobrando melhorias!"<br><br>
                        <b>Assessor:</b> "Excelente iniciativa, Deputado! Mas antes de levarmos o projeto ao plenário, precisamos entender quem tem a competência legal e qual é o processo para isso."
                    </p>
                    <button onclick="renderPlenaryQuestion()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl retro-btn pixel-font text-xs shadow-lg">
                        Continuar Debate 🏛️
                    </button>
                </div>
            `;
}

// Fase 2: Pergunta sobre a Responsabilidade de Criar Leis
function renderPlenaryQuestion() {
  gameState.phase = 2;
  const viewport = document.getElementById("game-viewport");
  viewport.innerHTML = `
                <div class="flex flex-col items-center justify-center my-auto text-center py-2">
                    <div class="text-3xl mb-3">❓</div>
                    <h2 class="text-xs sm:text-sm font-bold text-white mb-2 pixel-font">Dúvida Institucional no Plenário</h2>
                    <p class="text-xs sm:text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
                        O Assessor pergunta ao Deputado: <i>"No ordenamento jurídico brasileiro, o papel principal de elaborar, debater e propor novas leis é responsabilidade de quem?"</i>
                    </p>
                    <div class="space-y-3 w-full max-w-lg text-left">
                        <button onclick="answerLegislativeRole(true)" class="w-full bg-slate-900 hover:bg-slate-850 border-2 border-slate-700 p-3.5 rounded-xl text-xs text-slate-200 transition-all flex items-center gap-3">
                            <span class="bg-blue-600 text-white px-2.5 py-1 rounded font-bold pixel-font text-[10px]">A</span>
                            <span>Do Poder Legislativo (Câmara dos Deputados e Senado Federal).</span>
                        </button>
                        <button onclick="answerLegislativeRole(false)" class="w-full bg-slate-900 hover:bg-slate-850 border-2 border-slate-700 p-3.5 rounded-xl text-xs text-slate-200 transition-all flex items-center gap-3">
                            <span class="bg-slate-700 text-white px-2.5 py-1 rounded font-bold pixel-font text-[10px]">B</span>
                            <span>Exclusivamente do Poder Judiciário (Juízes e Tribunais).</span>
                        </button>
                        <button onclick="answerLegislativeRole(false)" class="w-full bg-slate-900 hover:bg-slate-850 border-2 border-slate-700 p-3.5 rounded-xl text-xs text-slate-200 transition-all flex items-center gap-3">
                            <span class="bg-slate-700 text-white px-2.5 py-1 rounded font-bold pixel-font text-[10px]">C</span>
                            <span>Apenas da Polícia Federal e órgãos de segurança pública.</span>
                        </button>
                    </div>
                </div>
            `;
}

function answerLegislativeRole(isCorrect) {
  if (isCorrect) {
    showFeedback(
      "Resposta Correta!",
      "Exato! O Poder Legislativo é o representante legítimo da sociedade encarregado de criar e debater as leis. Agora, vá para as ruas coletar o apoio popular necessário!",
      () => {
        startStreetPhase();
      },
    );
  } else {
    showFeedback(
      "Atenção à Teoria!",
      "Na verdade, a criação de leis é atribuição principal do Poder Legislativo. Vamos reforçar isso ouvindo os cidadãos nas ruas!",
      () => {
        startStreetPhase();
      },
    );
  }
}

// Fase 3: Exploração nas Ruas
function startStreetPhase() {
  gameState.phase = 3;
  document.getElementById("hud-stats").classList.remove("hidden");
  updateHUD();

  const viewport = document.getElementById("game-viewport");
  viewport.innerHTML = `
                <div class="flex flex-col items-center w-full">
                    <div class="flex justify-between w-full mb-2 px-2">
                        <span class="text-xs text-amber-400 font-bold pixel-font">📍 Ruas da Cidade - Coleta de Assinaturas</span>
                        <span class="text-xs text-slate-300">Use <b>WASD</b> / <b>Setas</b> e aperte <b>[E]</b> perto de alguém</span>
                    </div>
                    <div class="relative w-full overflow-hidden rounded-xl border-2 border-slate-600 bg-slate-950 shadow-inner">
                        <canvas id="streetCanvas" width="768" height="360" class="w-full h-auto block"></canvas>
                        <div id="interaction-banner" class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-amber-500 text-amber-300 px-4 py-1.5 rounded-lg text-xs pixel-font shadow-lg hidden">
                            Pressione [E] para conversar
                        </div>
                    </div>
                </div>
            `;

  canvas = document.getElementById("streetCanvas");
  ctx = canvas.getContext("2d");

  npcs.forEach((n) => (n.signed = false));
  gameState.signatures = 0;
  updateHUD();

  gameLoopRunning = true;
  requestAnimationFrame(streetGameLoop);
}

function streetGameLoop() {
  if (!gameLoopRunning || gameState.phase !== 3) return;

  // Movimentação do Deputado
  if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
  if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
  if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += player.speed;

  // Limites da tela
  player.x = Math.max(20, Math.min(canvas.width - 52, player.x));
  player.y = Math.max(50, Math.min(canvas.height - 70, player.y));

  // Checar proximidade com NPCs (incluindo o Estudante Lucas e demais cidadãos)
  activeNpc = null;
  for (let npc of npcs) {
    let dist = Math.hypot(player.x - npc.x, player.y - npc.y);
    if (dist < 45) {
      activeNpc = npc;
      break;
    }
  }

  const banner = document.getElementById("interaction-banner");
  if (activeNpc && !activeNpc.signed) {
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }

  // Renderizar Cenário e Personagens
  drawStreetScene();

  requestAnimationFrame(streetGameLoop);
}

function drawStreetScene() {
  // Asfalto da pista
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calçadas superior e inferior
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 0, canvas.width, 60);
  ctx.fillRect(0, 300, canvas.width, 60);

  // Pista central
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 60, canvas.width, 240);

  // Linhas tracejadas da pista
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(0, 180);
  ctx.lineTo(canvas.width, 180);
  ctx.stroke();
  ctx.setLineDash([]);

  // Postes de iluminação na calçada superior
  for (let i = 80; i < canvas.width; i += 180) {
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(i, 45, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Desenhar NPCs aprimorados em pixel art
  for (let npc of npcs) {
    drawPixelCharacter(ctx, npc.x, npc.y, npc.outfit, npc.name, npc.signed);
  }

  // Desenhar o Jogador (Deputado) em pixel art detalhado
  drawPixelCharacter(ctx, player.x, player.y, "deputy", player.name, false);
}

// Função para desenhar personagens pixel art detalhados
function drawPixelCharacter(ctx, x, y, type, name, signed) {
  // Sombra no chão
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.arc(x + 16, y + 42, 12, 0, Math.PI * 2);
  ctx.fill();

  let suitColor = "#3b82f6";
  let hairColor = "#0f172a";
  let tagColor = "#38bdf8";

  if (type === "pink") {
    suitColor = "#ec4899";
    hairColor = "#78350f";
    tagColor = "#f472b6";
  } else if (type === "blue") {
    suitColor = "#2563eb";
    hairColor = "#1e293b";
    tagColor = "#60a5fa";
  } else if (type === "green") {
    suitColor = "#10b981";
    hairColor = "#b45309";
    tagColor = "#34d399";
  } else if (type === "gray") {
    suitColor = "#64748b";
    hairColor = "#f8fafc";
    tagColor = "#94a3b8";
  } else if (type === "deputy") {
    suitColor = "#1e3a8a";
    hairColor = "#0f172a";
    tagColor = "#38bdf8";
  }

  // Pernas / Calças
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x + 10, y + 28, 4, 14);
  ctx.fillRect(x + 18, y + 28, 4, 14);

  // Tronco / Terno ou Roupa
  ctx.fillStyle = suitColor;
  ctx.fillRect(x + 6, y + 14, 20, 16);

  // Gola branca e gravata/detalhe
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 14, y + 14, 4, 6);
  if (type === "deputy") {
    ctx.fillStyle = "#ef4444"; // Gravata vermelha do deputado
    ctx.fillRect(x + 15, y + 18, 2, 8);
  }

  // Cabeça
  ctx.fillStyle = "#fbcfe8";
  ctx.fillRect(x + 8, y + 2, 16, 14);

  // Cabelo / Chapéu
  ctx.fillStyle = hairColor;
  ctx.fillRect(x + 8, y + 2, 16, 5);

  // Placa de Nome / Crachá Estilo Jogo Retrô
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 10, y - 18, 52, 14);
  ctx.fillStyle = signed ? "#10b981" : tagColor;
  ctx.font = "bold 9px monospace";
  ctx.fillText(name, x - 6, y - 8);

  if (signed) {
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 12px monospace";
    ctx.fillText("✔", x + 12, y - 24);
  }
}

function interactWithNpc(npc) {
  if (npc.signed) return;
  gameLoopRunning = false;
  document.getElementById("interaction-banner").classList.add("hidden");

  let willSign = Math.random() > npc.refuseChance;

  document.getElementById("dialogue-speaker").innerText = npc.name;
  document.getElementById("dialogue-avatar").innerText = "💬";

  let htmlOptions = "";
  if (willSign) {
    document.getElementById("dialogue-text").innerText =
      `"${npc.dialog}"\n\n[O cidadão concordou com a proposta de lei após ouvir suas explicações!]`;
    htmlOptions = `<button onclick="resolveNpcInteraction(true)" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg retro-btn pixel-font text-xs">Conquistar Assinatura! 📝</button>`;
  } else {
    document.getElementById("dialogue-text").innerText =
      `"${npc.dialog}"\n\n[O cidadão hesitou e recusou assinar inicialmente, demonstrando desconfiança na política tradicional.]`;
    htmlOptions = `<button onclick="resolveNpcInteraction(false)" class="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-lg retro-btn pixel-font text-xs">Tentar Argumentar com Sociologia 💡</button>`;
  }

  document.getElementById("dialogue-options").innerHTML = htmlOptions;
  document.getElementById("dialogue-modal").classList.remove("hidden");
}

function resolveNpcInteraction(success) {
  document.getElementById("dialogue-modal").classList.add("hidden");

  if (success) {
    activeNpc.signed = true;
    gameState.signatures++;
    gameState.popularity += 10;
    updateHUD();

    if (gameState.signatures >= gameState.targetSignatures) {
      showFeedback(
        "Parabéns!",
        "Você atingiu a meta de assinaturas nas ruas conversando com os cidadãos! Vamos para a fase de votação definitiva no plenário.",
        () => {
          startPlenaryPhase();
        },
      );
      return;
    }
  } else {
    gameState.popularity -= 5;
    updateHUD();
    showFeedback(
      "Recusa do Eleitor",
      "Nem todos apoiam de imediato. Na sociologia política, a confiança nas instituições exige diálogo transparente e constante!",
      () => {},
    );
  }

  gameLoopRunning = true;
  requestAnimationFrame(streetGameLoop);
}

// Fase 4: Plenário / Votação Final e Encerramento
function startPlenaryPhase() {
  gameState.phase = 4;
  updateHUD();
  const viewport = document.getElementById("game-viewport");

  viewport.innerHTML = `
                <div class="flex flex-col items-center justify-center my-auto text-center py-2">
                    <div class="text-4xl mb-3">🏛️⚖️</div>
                    <h2 class="text-xs sm:text-sm font-bold text-white mb-2 pixel-font">Fase Final: Aprovação no Congresso</h2>
                    <p class="text-xs sm:text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
                        Com as assinaturas colhidas nas ruas, o projeto de lei de mobilidade urbana foi protocolado e aprovado com sucesso no plenário.
                    </p>
                    <button onclick="renderEndGame()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-8 rounded-xl retro-btn pixel-font text-xs shadow-lg">
                        Concluir Trabalho e Ver Relatório 📊
                    </button>
                </div>
            `;
}

let feedbackCallback = null;
function showFeedback(title, message, callback) {
  document.getElementById("feedback-title").innerText = title;
  document.getElementById("feedback-message").innerText = message;
  document.getElementById("feedback-modal").classList.remove("hidden");
  feedbackCallback = callback;
}

function closeFeedbackModal() {
  document.getElementById("feedback-modal").classList.add("hidden");
  if (feedbackCallback) {
    feedbackCallback();
    feedbackCallback = null;
  }
}

function updateHUD() {
  document.getElementById("stat-signatures").innerText =
    gameState.signatures + "/" + gameState.targetSignatures;
  document.getElementById("stat-popularity").innerText =
    gameState.popularity + "%";
  document.getElementById("stat-phase").innerText =
    gameState.phase === 3 ? "Ruas" : "Plenário";
}

function renderEndGame() {
  document.getElementById("hud-stats").classList.add("hidden");
  const viewport = document.getElementById("game-viewport");

  viewport.innerHTML = `
                <div class="flex flex-col items-center justify-center my-auto text-center py-4">
                    <div class="text-5xl mb-3">🏆</div>
                    <h2 class="text-sm sm:text-base font-bold text-white mb-2 pixel-font">Trabalho de Sociologia Concluído!</h2>
                    <p class="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                        Você simulou com perfeição o papel do Legislativo: iniciou no plenário debatendo leis, respondeu à teoria sociológica e foi às ruas interagir com os cidadãos!
                    </p>
                    <div class="bg-slate-900 border-2 border-slate-700 p-4 rounded-xl w-full max-w-sm mb-6 text-left space-y-2 text-xs">
                        <div class="flex justify-between">
                            <span class="text-slate-400">Aprovação Popular Final:</span>
                            <span class="font-bold text-emerald-400 pixel-font">${gameState.popularity}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-400">Assinaturas Coletadas:</span>
                            <span class="font-bold text-amber-400 pixel-font">${gameState.signatures}/${gameState.targetSignatures}</span>
                        </div>
                    </div>
                    <button onclick="renderIntro()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl retro-btn pixel-font text-xs">
                        Jogar Novamente 🔄
                    </button>
                </div>
            `;
}

window.onload = function () {
  renderIntro();
};
