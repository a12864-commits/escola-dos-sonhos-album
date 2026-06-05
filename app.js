let cartas = [
{
id:1,
nome:"Messi",
pais:"Argentina",
raridade:"Lendária",
imagem:"https://via.placeholder.com/200x280?text=Messi"
},
{
id:2,
nome:"Mbappé",
pais:"França",
raridade:"Épica",
imagem:"https://via.placeholder.com/200x280?text=Mbappé"
},
{
id:3,
nome:"Bellingham",
pais:"Inglaterra",
raridade:"Rara",
imagem:"https://via.placeholder.com/200x280?text=Bellingham"
},
{
id:4,
nome:"Vinícius Jr",
pais:"Brasil",
raridade:"Épica",
imagem:"https://via.placeholder.com/200x280?text=Vini+Jr"
},
{
id:5,
nome:"Haaland",
pais:"Noruega",
raridade:"Lendária",
imagem:"https://via.placeholder.com/200x280?text=Haaland"
},
{
id:6,
nome:"Musiala",
pais:"Alemanha",
raridade:"Rara",
imagem:"https://via.placeholder.com/200x280?text=Musiala"
},
{
id:7,
nome:"Neymar",
pais:"Brasil",
raridade:"Épica",
imagem:"https://via.placeholder.com/200x280?text=Neymar"
},
{
id:8,
nome:"Rodrygo",
pais:"Brasil",
raridade:"Rara",
imagem:"https://via.placeholder.com/200x280?text=Rodrygo"
},
{
id:9,
nome:"Lewandowski",
pais:"Polônia",
raridade:"Épica",
imagem:"https://via.placeholder.com/200x280?text=Lewandowski"
},
{
id:10,
nome:"Ronaldo",
pais:"Portugal",
raridade:"Lendária",
imagem:"https://via.placeholder.com/200x280?text=Ronaldo"
},
{
id:11,
nome:"Son",
pais:"Coreia do Sul",
raridade:"Rara",
imagem:"https://via.placeholder.com/200x280?text=Son"
},
{
id:12,
nome:"Pedri",
pais:"Espanha",
raridade:"Rara",
imagem:"https://via.placeholder.com/200x280?text=Pedri"
}
];

let colecao=[];
let trocasDisponivel = [];

// Carregar coleção ao iniciar
document.addEventListener('DOMContentLoaded', function(){
  carregarColecao();
  atualizarEstatisticas();
});

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>{
    p.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

function abrirPacote(){
  let sorteadas=[];
  
  for(let i=0; i<5; i++){
    let carta = cartas[Math.floor(Math.random()*cartas.length)];
    
    // Só adiciona se não tiver coletado ainda
    if(!colecao.find(c => c.id === carta.id)){
      colecao.push(carta);
      sorteadas.push(carta);
    }
  }
  
  mostrarNovas(sorteadas);
  mostrarColecao();
  atualizarProgresso();
  atualizarEstatisticas();
  salvarColecao();
}

function mostrarNovas(lista){
  let div = document.getElementById("novasCartas");
  
  if(lista.length === 0){
    div.innerHTML = "<p style='color: #999;'>Você já tem todas essas cartas!</p>";
    return;
  }
  
  div.innerHTML = lista.map(c => `
    <div class="card raridade-${c.raridade.toLowerCase()}">
      <img src="${c.imagem}" alt="${c.nome}" class="card-imagem">
      <h4>${c.nome}</h4>
      <p>${c.pais}</p>
      <p class="raridade">${c.raridade}</p>
    </div>
  `).join("");
}

function mostrarColecao(){
  let div = document.getElementById("cardsContainer");
  
  if(colecao.length === 0){
    div.innerHTML = "<p style='color: #999;'>Nenhuma carta coletada ainda. Abra pacotes!</p>";
    return;
  }
  
  div.innerHTML = colecao.map(c => `
    <div class="card raridade-${c.raridade.toLowerCase()}" onclick="selecionarCartaTroca(${c.id})">
      <img src="${c.imagem}" alt="${c.nome}" class="card-imagem">
      <h4>${c.nome}</h4>
      <p>${c.pais}</p>
      <p class="raridade">${c.raridade}</p>
    </div>
  `).join("");
}

function atualizarProgresso(){
  let unicas = new Set(colecao.map(c=>c.id));
  let percent = (unicas.size/cartas.length)*100;
  
  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("percent").innerText = Math.round(percent) + "%";
}

function atualizarEstatisticas(){
  let unicas = new Set(colecao.map(c=>c.id));
  let lendarias = colecao.filter(c=>c.raridade === "Lendária").length;
  let epicas = colecao.filter(c=>c.raridade === "Épica").length;
  let raras = colecao.filter(c=>c.raridade === "Rara").length;
  
  document.getElementById("totalCartas").textContent = unicas.size;
  document.getElementById("cartasRestantes").textContent = cartas.length - unicas.size;
  document.getElementById("lendarias").textContent = lendarias;
  document.getElementById("epicas").textContent = epicas;
  document.getElementById("raras").textContent = raras;
}

function salvarColecao(){
  localStorage.setItem('colecao', JSON.stringify(colecao));
}

function carregarColecao(){
  const salva = localStorage.getItem('colecao');
  if(salva){
    colecao = JSON.parse(salva);
    mostrarColecao();
    atualizarProgresso();
  }
}

function selecionarCartaTroca(id){
  const carta = colecao.find(c => c.id === id);
  if(!carta) return;
  
  if(trocasDisponivel.find(c => c.id === id)){
    trocasDisponivel = trocasDisponivel.filter(c => c.id !== id);
  } else {
    if(trocasDisponivel.length < 3){
      trocasDisponivel.push(carta);
    } else {
      alert('Máximo 3 cartas por troca!');
      return;
    }
  }
  
  atualizarListaTroca();
}

function atualizarListaTroca(){
  const div = document.getElementById("cartsEmTroca");
  
  if(trocasDisponivel.length === 0){
    div.innerHTML = "<p style='color: #999;'>Selecione cartas para oferecer em troca</p>";
    return;
  }
  
  div.innerHTML = "<h4>Cartas Selecionadas para Troca:</h4>" + trocasDisponivel.map(c => `
    <div class="card-mini raridade-${c.raridade.toLowerCase()}">
      <img src="${c.imagem}" alt="${c.nome}" class="card-imagem-mini">
      <span>${c.nome}</span>
      <button onclick="selecionarCartaTroca(${c.id})" class="btn-remover">✕</button>
    </div>
  `).join("");
}

function enviarTrocaAmigo(){
  if(trocasDisponivel.length === 0){
    alert('Selecione pelo menos 1 carta!');
    return;
  }
  
  const nomeAmigo = prompt('Nome do amigo:');
  if(!nomeAmigo) return;
  
  alert(`✅ Proposta enviada para ${nomeAmigo}!\n\nCartas oferecidas: ${trocasDisponivel.map(c=>c.nome).join(', ')}`);
  trocasDisponivel = [];
  atualizarListaTroca();
}
