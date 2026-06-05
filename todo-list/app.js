let tarefas = [];
let filtroAtual = 'todas';
let tarefaEmEdicao = null;

// Carregar tarefas ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    carregarTarefas();
    atualizarData();
    renderizarTarefas();
    atualizarEstatisticas();
});

function atualizarData() {
    const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const hoje = new Date().toLocaleDateString('pt-BR', opcoes);
    document.getElementById('dataAtual').textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1);
}

function adicionarTarefa() {
    const input = document.getElementById('novaTagefa');
    const prioridade = document.getElementById('prioridade').value;
    const texto = input.value.trim();

    if (!texto) {
        alert('Digite uma tarefa!');
        return;
    }

    const tarefa = {
        id: Date.now(),
        texto: texto,
        concluida: false,
        prioridade: prioridade,
        dataCriacao: new Date().toLocaleDateString('pt-BR')
    };

    tarefas.push(tarefa);
    salvarTarefas();
    input.value = '';
    document.getElementById('prioridade').value = 'media';
    renderizarTarefas();
    atualizarEstatisticas();
}

function renderizarTarefas() {
    const container = document.getElementById('listaTagefas');
    let tarefasFiltradas = tarefas;

    // Aplicar filtro
    if (filtroAtual === 'ativa') {
        tarefasFiltradas = tarefas.filter(t => !t.concluida);
    } else if (filtroAtual === 'concluida') {
        tarefasFiltradas = tarefas.filter(t => t.concluida);
    } else if (filtroAtual === 'alta') {
        tarefasFiltradas = tarefas.filter(t => t.prioridade === 'alta');
    }

    // Ordenar por prioridade (alta > média > baixa) e depois por data
    const ordem = { 'alta': 0, 'media': 1, 'baixa': 2 };
    tarefasFiltradas.sort((a, b) => ordem[a.prioridade] - ordem[b.prioridade]);

    if (tarefasFiltradas.length === 0) {
        container.innerHTML = '<p class="mensagem-vazia">🎉 Nenhuma tarefa! Aproveite e relaxe!</p>';
        return;
    }

    container.innerHTML = tarefasFiltradas.map(tarefa => `
        <div class="tarefa-item prioridade-${tarefa.prioridade} ${tarefa.concluida ? 'concluida' : ''} ${tarefaEmEdicao === tarefa.id ? 'em-edicao' : ''}">
            <input 
                type="checkbox" 
                ${tarefa.concluida ? 'checked' : ''}
                onchange="alternarConcluida(${tarefa.id})"
            />
            ${tarefaEmEdicao === tarefa.id ? `
                <input 
                    type="text" 
                    class="tarefa-edit-input"
                    id="input-edit-${tarefa.id}"
                    value="${tarefa.texto}"
                    onkeypress="if(event.key==='Enter') salvarEdicao(${tarefa.id}); if(event.key==='Escape') cancelarEdicao()"
                />
            ` : `
                <div class="tarefa-conteudo">
                    <span class="tarefa-texto">${tarefa.texto}</span>
                    <span class="tarefa-prioridade ${tarefa.prioridade}">
                        ${tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)} - ${tarefa.dataCriacao}
                    </span>
                </div>
            `}
            <div class="tarefa-acoes">
                ${tarefaEmEdicao === tarefa.id ? `
                    <button class="btn-salvar" onclick="salvarEdicao(${tarefa.id})"><i class="fas fa-check"></i></button>
                    <button class="btn-cancelar" onclick="cancelarEdicao()"><i class="fas fa-times"></i></button>
                ` : `
                    <button class="btn-editar" onclick="iniciarEdicao(${tarefa.id})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-deletar" onclick="deletarTarefa(${tarefa.id})" title="Deletar"><i class="fas fa-trash"></i></button>
                `}
            </div>
        </div>
    `).join('');

    // Focar no input se estiver em edição
    if (tarefaEmEdicao) {
        const inputEdit = document.getElementById(`input-edit-${tarefaEmEdicao}`);
        if (inputEdit) {
            inputEdit.focus();
            inputEdit.select();
        }
    }
}

function alternarConcluida(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        salvarTarefas();
        renderizarTarefas();
        atualizarEstatisticas();
    }
}

function iniciarEdicao(id) {
    tarefaEmEdicao = id;
    renderizarTarefas();
}

function salvarEdicao(id) {
    const inputEdit = document.getElementById(`input-edit-${id}`);
    const novoTexto = inputEdit.value.trim();

    if (!novoTexto) {
        alert('Tarefa não pode estar vazia!');
        return;
    }

    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.texto = novoTexto;
        salvarTarefas();
        tarefaEmEdicao = null;
        renderizarTarefas();
    }
}

function cancelarEdicao() {
    tarefaEmEdicao = null;
    renderizarTarefas();
}

function deletarTarefa(id) {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
        tarefas = tarefas.filter(t => t.id !== id);
        salvarTarefas();
        renderizarTarefas();
        atualizarEstatisticas();
    }
}

function filtrarTarefas(filtro) {
    filtroAtual = filtro;

    // Atualizar botões ativos
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('ativo'));
    event.target.classList.add('ativo');

    renderizarTarefas();
}

function atualizarEstatisticas() {
    const total = tarefas.length;
    const ativas = tarefas.filter(t => !t.concluida).length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const progresso = total === 0 ? 0 : Math.round((concluidas / total) * 100);

    document.getElementById('totalTarefas').textContent = total;
    document.getElementById('ativasTarefas').textContent = ativas;
    document.getElementById('concluidasTarefas').textContent = concluidas;
    document.getElementById('progressoTarefas').textContent = progresso + '%';
    document.getElementById('progressoBarra').style.width = progresso + '%';

    // Mostrar/esconder botões de ação
    const acoesLote = document.getElementById('acoesLote');
    if (total > 0) {
        acoesLote.style.display = 'flex';
    } else {
        acoesLote.style.display = 'none';
    }
}

function limparConcluidas() {
    if (confirm('Deletar todas as tarefas concluídas?')) {
        tarefas = tarefas.filter(t => !t.concluida);
        salvarTarefas();
        renderizarTarefas();
        atualizarEstatisticas();
    }
}

function limparTodas() {
    if (confirm('Deletar TODAS as tarefas? Esta ação não pode ser desfeita!')) {
        tarefas = [];
        salvarTarefas();
        renderizarTarefas();
        atualizarEstatisticas();
    }
}

function exportarTarefas() {
    if (tarefas.length === 0) {
        alert('Nenhuma tarefa para exportar!');
        return;
    }

    const texto = tarefas.map(t => 
        `[${t.concluida ? 'X' : ' '}] ${t.texto} (${t.prioridade} - ${t.dataCriacao})`
    ).join('\n');

    const elemento = document.createElement('a');
    elemento.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(texto));
    elemento.setAttribute('download', `tarefas-${new Date().toLocaleDateString('pt-BR')}.txt`);
    elemento.style.display = 'none';
    document.body.appendChild(elemento);
    elemento.click();
    document.body.removeChild(elemento);

    alert('✅ Tarefas exportadas com sucesso!');
}

function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function carregarTarefas() {
    const salvas = localStorage.getItem('tarefas');
    if (salvas) {
        tarefas = JSON.parse(salvas);
    }
}
