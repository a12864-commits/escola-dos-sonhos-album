let fusosSelecionados = [];
let formatoHora = '24';

// Nomes de cidades por fuso
const nomesCidades = {
    'UTC': '🌍 UTC (Tempo Universal)',
    'America/New_York': '🗽 New York (EST/EDT)',
    'America/Los_Angeles': '🌴 Los Angeles (PST/PDT)',
    'America/Chicago': '🌽 Chicago (CST/CDT)',
    'America/Denver': '🏔️ Denver (MST/MDT)',
    'Europe/London': '🇬🇧 Londres (GMT/BST)',
    'Europe/Paris': '🗼 Paris (CET/CEST)',
    'Europe/Berlin': '🇩🇪 Berlim (CET/CEST)',
    'Europe/Madrid': '🇪🇸 Madri (CET/CEST)',
    'Europe/Amsterdam': '🇳🇱 Amsterdã (CET/CEST)',
    'Africa/Cairo': '🇪🇬 Cairo (EET/EEST)',
    'Africa/Lagos': '🇳🇬 Lagos (WAT)',
    'Africa/Johannesburg': '🇿🇦 Johannesburgo (SAST)',
    'Asia/Dubai': '🏙️ Dubai (GST)',
    'Asia/Bangkok': '🇹🇭 Bangkok (ICT)',
    'Asia/Hong_Kong': '🇭🇰 Hong Kong (HKT)',
    'Asia/Shanghai': '🇨🇳 Xangai (CST)',
    'Asia/Tokyo': '🗾 Tóquio (JST)',
    'Asia/Seoul': '🇰🇷 Seul (KST)',
    'Asia/Singapore': '🇸🇬 Singapura (SGT)',
    'Asia/Kolkata': '🇮🇳 Índia (IST)',
    'Australia/Sydney': '🦘 Sydney (AEST/AEDT)',
    'Australia/Melbourne': '🇦🇺 Melbourne (AEST/AEDT)',
    'Australia/Brisbane': '🇦🇺 Brisbane (AEST)',
    'Pacific/Auckland': '🥝 Auckland (NZST/NZDT)',
    'America/Sao_Paulo': '🇧🇷 São Paulo (BRT/BRST)',
    'America/Mexico_City': '🇲🇽 Cidade do México (CST/CDT)',
    'America/Toronto': '🇨🇦 Toronto (EST/EDT)',
    'America/Vancouver': '🍁 Vancouver (PST/PDT)'
};

// Carregar fusos salvos
document.addEventListener('DOMContentLoaded', function() {
    const salvos = localStorage.getItem('fusosSelecionados');
    if (salvos) {
        fusosSelecionados = JSON.parse(salvos);
    } else {
        // Adicionar São Paulo por padrão
        fusosSelecionados = ['America/Sao_Paulo', 'UTC', 'America/New_York', 'Asia/Tokyo'];
    }
    
    const formatoSalvo = localStorage.getItem('formatoHora');
    if (formatoSalvo) {
        formatoHora = formatoSalvo;
        document.getElementById('tipoFormato').value = formatoHora;
    }

    detectarLocalizacao();
    atualizarRelogios();
    setInterval(atualizarRelogios, 1000);
});

function detectarLocalizacao() {
    // Detectar localização pela hora do navegador
    const now = new Date();
    const offset = -now.getTimezoneOffset() / 60;
    
    let localizacao = 'Sua Localização';
    if (offset >= -5 && offset <= -3) {
        localizacao = '🇧🇷 São Paulo';
    } else if (offset >= -6 && offset <= -4) {
        localizacao = '🗽 New York';
    } else if (offset >= -9 && offset <= -7) {
        localizacao = '🌴 Los Angeles';
    } else if (offset >= 0 && offset <= 1) {
        localizacao = '🇬🇧 Londres/Paris';
    } else if (offset >= 8 && offset <= 10) {
        localizacao = '🇨🇳 Ásia';
    }
    
    document.getElementById('localizacao').textContent = localizacao;
}

function atualizarRelogios() {
    // Atualizar relógio principal
    const agora = new Date();
    atualizarHora(agora, 'horaPrincipal', 'dataPrincipal', 'infoFuso', true);
    
    // Atualizar grid de relógios
    const gridContainer = document.getElementById('gridRelogios');
    gridContainer.innerHTML = '';
    
    if (fusosSelecionados.length === 0) {
        gridContainer.innerHTML = '<div class="mensagem-vazia">📍 Selecione fusos horários para adicionar</div>';
        return;
    }
    
    fusosSelecionados.forEach(fuso => {
        const card = document.createElement('div');
        card.className = 'card-relogio';
        
        const horaId = `hora-${fuso}`;
        const dataId = `data-${fuso}`;
        const periodoId = `periodo-${fuso}`;
        
        card.innerHTML = `
            <button class="botao-remover" onclick="removerFuso('${fuso}')">×</button>
            <div class="nome-cidade">${nomesCidades[fuso] || fuso}</div>
            <div class="fuso-info">${fuso}</div>
            <div class="hora-card" id="${horaId}">00:00:00</div>
            <div class="periodo" id="${periodoId}"></div>
            <div class="data-card" id="${dataId}">-- de -- de ----</div>
        `;
        
        gridContainer.appendChild(card);
        
        // Atualizar hora inicial
        atualizarHoraFuso(fuso, horaId, dataId, periodoId);
    });
}

function atualizarHoraFuso(fuso, horaId, dataId, periodoId) {
    const opcoes = { timeZone: fuso, hour12: false };
    const agora = new Date();
    const horaLocal = new Date(agora.toLocaleString('pt-BR', opcoes));
    
    let hora = String(horaLocal.getHours()).padStart(2, '0');
    const minuto = String(horaLocal.getMinutes()).padStart(2, '0');
    const segundo = String(horaLocal.getSeconds()).padStart(2, '0');
    
    let periodo = '';
    if (formatoHora === '12') {
        const horas = parseInt(hora);
        periodo = horas >= 12 ? 'PM' : 'AM';
        hora = String((horas % 12) || 12).padStart(2, '0');
    }
    
    document.getElementById(horaId).textContent = `${hora}:${minuto}:${segundo}`;
    
    if (periodo) {
        document.getElementById(periodoId).textContent = periodo;
    }
    
    // Atualizar data
    const opcoesDia = { timeZone: fuso, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dataBR = agora.toLocaleDateString('pt-BR', opcoesDia);
    document.getElementById(dataId).textContent = dataBR;
}

function atualizarHora(agora, idHora, idData, idFuso, principal = false) {
    const opcoes = { hour12: false };
    const horaString = agora.toLocaleTimeString('pt-BR', opcoes);
    
    let hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const segundo = String(agora.getSeconds()).padStart(2, '0');
    
    if (formatoHora === '12') {
        const horas = parseInt(hora);
        const periodo = horas >= 12 ? 'PM' : 'AM';
        hora = String((horas % 12) || 12).padStart(2, '0');
        
        if (principal) {
            document.getElementById(idData).innerHTML = `<span style="color: #ff6b6b; font-weight: bold;">${periodo}</span>`;
        }
    }
    
    document.getElementById(idHora).textContent = `${hora}:${minuto}:${segundo}`;
    
    if (idData) {
        const opcoesDia = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const dataBR = agora.toLocaleDateString('pt-BR', opcoesDia);
        document.getElementById(idData).textContent = dataBR;
    }
    
    if (idFuso) {
        const fusoHora = agora.toLocaleString('pt-BR', { timeZoneName: 'short' }).split(' ').pop();
        document.getElementById(idFuso).textContent = fusoHora || 'UTC';
    }
}

function adicionarFuso() {
    const select = document.getElementById('novoFuso');
    const fuso = select.value;
    
    if (!fuso) {
        alert('Por favor, selecione um fuso horário!');
        return;
    }
    
    if (fusosSelecionados.includes(fuso)) {
        alert('Este fuso já foi adicionado!');
        return;
    }
    
    fusosSelecionados.push(fuso);
    localStorage.setItem('fusosSelecionados', JSON.stringify(fusosSelecionados));
    select.value = '';
    atualizarRelogios();
}

function removerFuso(fuso) {
    fusosSelecionados = fusosSelecionados.filter(f => f !== fuso);
    localStorage.setItem('fusosSelecionados', JSON.stringify(fusosSelecionados));
    atualizarRelogios();
}

function atualizarFormato() {
    formatoHora = document.getElementById('tipoFormato').value;
    localStorage.setItem('formatoHora', formatoHora);
    atualizarRelogios();
}

// Atualizar a cada segundo
setInterval(function() {
    const agora = new Date();
    atualizarHora(agora, 'horaPrincipal', 'dataPrincipal', 'infoFuso', true);
    
    fusosSelecionados.forEach(fuso => {
        const horaId = `hora-${fuso}`;
        const dataId = `data-${fuso}`;
        const periodoId = `periodo-${fuso}`;
        
        if (document.getElementById(horaId)) {
            atualizarHoraFuso(fuso, horaId, dataId, periodoId);
        }
    });
}, 1000);
