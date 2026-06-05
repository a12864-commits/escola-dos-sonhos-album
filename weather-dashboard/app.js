const API_KEY = '2d8fb5b93d4af21d66a2948710284366'; // OpenWeatherMap Free API
const API_URL = 'https://api.openweathermap.org/data/2.5';

let cidadesSalvas = [];

// Carregar cidades salvas
document.addEventListener('DOMContentLoaded', function() {
    const salvas = localStorage.getItem('cidadesSalvas');
    if (salvas) {
        cidadesSalvas = JSON.parse(salvas);
        atualizarListaCidades();
    }
    // Carregar clima de São Paulo por padrão
    buscarClimaPorCidade('São Paulo');
});

// Permitir Enter para buscar
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        buscarClima();
    }
});

function buscarClima() {
    const input = document.getElementById('searchInput');
    const cidade = input.value.trim();
    
    if (!cidade) {
        alert('Digite o nome de uma cidade!');
        return;
    }
    
    buscarClimaPorCidade(cidade);
    input.value = '';
}

function buscarClimaPorCidade(cidade) {
    // Mostrar loading
    document.getElementById('infoPrincipal').innerHTML = '<div class="loading"></div>';
    
    fetch(`${API_URL}/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`)
        .then(response => {
            if (!response.ok) throw new Error('Cidade não encontrada');
            return response.json();
        })
        .then(data => {
            atualizarClimaAtual(data);
            carregarPrevisao(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            document.getElementById('infoPrincipal').innerHTML = 
                `<div class="erro">❌ ${error.message}</div>`;
        });
}

function atualizarClimaAtual(data) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌧️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };

    const icon = iconMap[data.weather[0].icon] || '🌡️';

    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperatura').textContent = Math.round(data.main.temp);
    document.getElementById('descricao').textContent = `${icon} ${data.weather[0].description}`;
    document.getElementById('sensacaoTermica').textContent = `Sensação: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('umidade').textContent = `${data.main.humidity}%`;
    document.getElementById('vento').textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('pressao').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibilidade').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
}

function carregarPrevisao(lat, lon) {
    fetch(`${API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`)
        .then(response => response.json())
        .then(data => {
            atualizarPrevisao(data.list);
        })
        .catch(error => console.error('Erro ao carregar previsão:', error));
}

function atualizarPrevisao(lista) {
    const container = document.getElementById('previsaoContainer');
    container.innerHTML = '';
    
    // Pegar previsão de 5 dias (um por dia ao meio-dia)
    const diasPrevistos = {};
    
    lista.forEach(item => {
        const data = new Date(item.dt * 1000);
        const dia = data.toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' });
        const hora = data.getHours();
        
        // Pegar previsão do meio-dia
        if (hora === 12 || !diasPrevistos[dia]) {
            diasPrevistos[dia] = item;
        }
    });
    
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌧️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    
    Object.entries(diasPrevistos).slice(0, 5).forEach(([dia, item]) => {
        const icon = iconMap[item.weather[0].icon] || '🌡️';
        const card = document.createElement('div');
        card.className = 'card-previsao';
        card.innerHTML = `
            <div class="dia">${dia}</div>
            <div>${icon}</div>
            <div class="temp-max">${Math.round(item.main.temp_max)}°</div>
            <div class="temp-min">${Math.round(item.main.temp_min)}°</div>
        `;
        container.appendChild(card);
    });
}

function salvarCidade() {
    const cityName = document.getElementById('cityName').textContent.split(',')[0].trim();
    
    if (!cidadesSalvas.includes(cityName)) {
        cidadesSalvas.push(cityName);
        localStorage.setItem('cidadesSalvas', JSON.stringify(cidadesSalvas));
        atualizarListaCidades();
    }
}

function removerCidade(cidade) {
    cidadesSalvas = cidadesSalvas.filter(c => c !== cidade);
    localStorage.setItem('cidadesSalvas', JSON.stringify(cidadesSalvas));
    atualizarListaCidades();
}

function atualizarListaCidades() {
    const container = document.getElementById('cidadesSalvas');
    
    if (cidadesSalvas.length === 0) {
        container.innerHTML = '<p style="color: #999;">Nenhuma cidade salva ainda</p>';
        return;
    }
    
    container.innerHTML = cidadesSalvas.map(cidade => `
        <div class="botao-cidade">
            <span onclick="buscarClimaPorCidade('${cidade}')" style="cursor: pointer; flex: 1;">
                📍 ${cidade}
            </span>
            <span class="remover" onclick="removerCidade('${cidade}')">✕</span>
        </div>
    `).join('');
}

// Adicionar botão para salvar cidade atual
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const botaoSalvar = document.createElement('button');
    botaoSalvar.innerHTML = '⭐ Salvar Cidade';
    botaoSalvar.style.cssText = `
        background: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        color: #667eea;
        margin-top: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transition: 0.3s;
    `;
    botaoSalvar.onmouseover = () => botaoSalvar.style.background = '#f0f0f0';
    botaoSalvar.onmouseout = () => botaoSalvar.style.background = 'white';
    botaoSalvar.onclick = salvarCidade;
    header.appendChild(botaoSalvar);
});
