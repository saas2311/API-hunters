"use strict";

const API="https://rickandmortyapi.com/api/character";
const POR_PAGINA=8;

const estado={pagina:1,nome:"",status:"",especie:"",genero:"",totalPaginas:1,totalRegistros:0,demo:false};

const $=id=>document.getElementById(id);

const el={
grade:$("grade"),
carregando:$("estadoCarregando"),
vazio:$("estadoVazio"),
erro:$("estadoErro"),
textoVazio:$("textoVazio"),
textoErro:$("textoErro"),
paginacao:$("paginacao"),
anterior:$("botaoAnterior"),
proxima:$("botaoProxima"),
info:$("infoPagina"),
resumo:$("resumo"),
origem:$("origemDados"),
aviso:$("avisoDemo"),
nome:$("campoNome"),
status:$("filtroStatus"),
especie:$("filtroEspecie"),
genero:$("filtroGenero"),
limpar:$("botaoLimpar"),
painel:$("painel"),
painelId:$("painelId"),
painelNome:$("painelNome"),
painelSinal:$("painelSinal"),
painelCorpo:$("painelCorpo"),
fechar:$("painelFechar")
};

function escapar(texto){
return String(texto).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function statusTexto(status){
return {Alive:"Vivo",Dead:"Morto"}[status]||"Situação desconhecida";
}

function generoTexto(genero){
return {Male:"Masculino",Female:"Feminino",Genderless:"Sem gênero"}[genero]||"Desconhecido";
}

function statusClasse(status){
return status==="Alive"?"vivo":status==="Dead"?"morto":"";
}

function estadoTela(nome){
el.carregando.hidden=nome!=="carregando";
el.vazio.hidden=nome!=="vazio";
el.erro.hidden=nome!=="erro";
el.grade.hidden=nome!=="lista";
el.paginacao.hidden=nome!=="lista"||estado.totalPaginas<=1;
}

async function buscar(){
estadoTela("carregando");
el.grade.innerHTML="";
el.resumo.textContent="Consultando a API...";
el.origem.textContent="";

const params=new URLSearchParams({page:estado.pagina});
const filtros={name:estado.nome,status:estado.status,species:estado.especie,gender:estado.genero};

Object.entries(filtros).forEach(([chave,valor])=>valor&&params.set(chave,valor));

try{
const resposta=await fetch(`${API}?${params}`);
if(resposta.status===404) return vazio();
if(!resposta.ok) throw new Error(`Erro ${resposta.status}`);

const dados=await resposta.json();

estado.demo=false;
estado.totalPaginas=dados.info.pages;
estado.totalRegistros=dados.info.count;
render(dados.results);
}catch(erro){
if(erro instanceof TypeError) return usarAcervo();
erroTela(erro.message);
}
}

function render(personagens){
el.grade.innerHTML=personagens.map(p=>`
<li>
<button class="ficha" type="button" data-id="${p.id}">
<div class="retrato"><img src="${p.image}" alt="" loading="lazy"></div>
<div class="dados">
<span class="id">#${String(p.id).padStart(3,"0")}</span>
<h3>${escapar(p.name)}</h3>
<span class="sinal ${statusClasse(p.status)}">${statusTexto(p.status)} · ${escapar(p.species)}</span>
<dl>
<div><dt>Origem:</dt><dd>${escapar(p.origin.name)}</dd></div>
<div><dt>Local:</dt><dd>${escapar(p.location.name)}</dd></div>
</dl>
</div>
</button>
</li>`).join("");

el.resumo.textContent=`${estado.totalRegistros} registro(s) encontrado(s)`;
el.origem.textContent=estado.demo?"acervo local":"dados ao vivo da API";
el.info.textContent=`Página ${estado.pagina} de ${estado.totalPaginas}`;
el.anterior.disabled=estado.pagina===1;
el.proxima.disabled=estado.pagina===estado.totalPaginas;
estadoTela("lista");

el.grade.querySelectorAll(".ficha").forEach(botao=>{
const personagem=personagens.find(p=>p.id==botao.dataset.id);
botao.onclick=()=>abrirPainel(personagem);
botao.querySelector("img").onerror=()=>{
botao.querySelector(".retrato").innerHTML=`<span class="inicial">${personagem.name[0]}</span>`;
};
});
}

function vazio(){
el.textoVazio.textContent=estado.nome?`Nada encontrado para "${estado.nome}". Tente outro nome ou remova algum filtro.`:"Tente remover algum filtro para ampliar a consulta.";
el.resumo.textContent="0 registro encontrado";
el.origem.textContent="";
estadoTela("vazio");
}

function erroTela(mensagem){
el.textoErro.textContent=`${mensagem}. Tente novamente.`;
el.resumo.textContent="Consulta interrompida";
estadoTela("erro");
}

function limpar(){
el.nome.value="";
el.status.value="";
el.especie.value="";
el.genero.value="";
estado.nome=estado.status=estado.especie=estado.genero="";
estado.pagina=1;
buscar();
}

el.nome.oninput=()=>{
clearTimeout(window.busca);
window.busca=setTimeout(()=>{
estado.nome=el.nome.value.trim();
estado.pagina=1;
buscar();
},400);
};

[["status",el.status],["especie",el.especie],["genero",el.genero]].forEach(([chave,campo])=>{
campo.onchange=()=>{
estado[chave]=campo.value;
estado.pagina=1;
buscar();
};
});

el.limpar.onclick=limpar;

el.anterior.onclick=()=>{
if(estado.pagina>1){
estado.pagina--;
buscar();
window.scrollTo({top:0,behavior:"smooth"});
}
};

el.proxima.onclick=()=>{
if(estado.pagina<estado.totalPaginas){
estado.pagina++;
buscar();
window.scrollTo({top:0,behavior:"smooth"});
}
};

document.onclick=e=>{
const acao=e.target.dataset.acao;
if(acao==="limpar") limpar();
if(acao==="recarregar") buscar();
};

function abrirPainel(p){
el.painelId.textContent=`Registro #${String(p.id).padStart(3,"0")}`;
el.painelNome.textContent=p.name;
el.painelSinal.className=`sinal ${statusClasse(p.status)}`;
el.painelSinal.textContent=statusTexto(p.status);
el.painelCorpo.innerHTML=`
<tr><th>Espécie</th><td>${escapar(p.species)}</td></tr>
${p.type?`<tr><th>Subtipo</th><td>${escapar(p.type)}</td></tr>`:""}
<tr><th>Gênero</th><td>${generoTexto(p.gender)}</td></tr>
<tr><th>Origem</th><td>${escapar(p.origin.name)}</td></tr>
<tr><th>Última localização</th><td>${escapar(p.location.name)}</td></tr>
<tr><th>Episódios</th><td>${p.episode.length}</td></tr>`;
el.painel.showModal();
}

el.fechar.onclick=()=>el.painel.close();

const ACERVO=[
[1,"Rick Sanchez","Alive","Human","","Male","Earth (C-137)","Citadel of Ricks",51],
[2,"Morty Smith","Alive","Human","","Male","Earth (C-137)","Citadel of Ricks",51],
[3,"Summer Smith","Alive","Human","","Female","Earth (Replacement Dimension)","Earth (Replacement Dimension)",42],
[4,"Beth Smith","Alive","Human","","Female","Earth (Replacement Dimension)","Earth (Replacement Dimension)",42],
[5,"Jerry Smith","Alive","Human","","Male","Earth (Replacement Dimension)","Earth (Replacement Dimension)",40],
[6,"Abadango Cluster Princess","Alive","Alien","","Female","Abadango","Abadango",1],
[7,"Abradolf Lincler","unknown","Human","Genetic experiment","Male","Earth (Replacement Dimension)","Testicle Monster Dimension",2],
[8,"Adjudicator Rick","Dead","Human","","Male","unknown","Citadel of Ricks",1],
[9,"Agency Director","Dead","Human","","Male","unknown","Earth (Replacement Dimension)",1],
[10,"Alan Rails","Dead","Human","Superhuman","Male","unknown","Worldender's lair",1],
[11,"Albert Einstein","Dead","Human","","Male","Earth (C-137)","Earth (Replacement Dimension)",1],
[12,"Alexander","Dead","Human","","Male","Earth (Replacement Dimension)","Anatomy Park",1],
[13,"Alien Googah","unknown","Alien","","unknown","unknown","Earth (Replacement Dimension)",1],
[14,"Alien Morty","unknown","Alien","","Male","unknown","Citadel of Ricks",1],
[15,"Alien Rick","unknown","Alien","","Male","unknown","Citadel of Ricks",1],
[16,"Amish Cyborg","Dead","Alien","Parasite, Cyborg","Male","unknown","Earth (Replacement Dimension)",1],
[17,"Annie","Alive","Human","","Female","Earth (C-137)","Anatomy Park",1],
[18,"Antenna Morty","Alive","Human","Human with antennae","Male","unknown","Citadel of Ricks",2],
[20,"Ants in my Eyes Johnson","unknown","Human","Human with ants in his eyes","Male","unknown","Interdimensional Cable",1],
[21,"Aqua Morty","unknown","Humanoid","Fish-Person","Male","unknown","Citadel of Ricks",2],
[23,"Arcade Alien","unknown","Alien","","Male","unknown","Immortality Field Resort",2],
[25,"Armothy","Dead","unknown","Self-aware arm","Male","Post-Apocalyptic Earth","Post-Apocalyptic Earth",1],
[28,"Bearded Lady","Dead","Human","","Female","unknown","Earth (Replacement Dimension)",1],
[30,"Beth Sanchez","Alive","Human","","Female","Earth (C-137)","Earth (C-137)",2]
];

const personagens=ACERVO.map(p=>({
id:p[0],name:p[1],status:p[2],species:p[3],type:p[4],gender:p[5],
origin:{name:p[6]},location:{name:p[7]},episode:new Array(p[8]),
image:`https://rickandmortyapi.com/api/character/avatar/${p[0]}.jpeg`
}));

function usarAcervo(){
estado.demo=true;

const filtrados=personagens.filter(p=>
(!estado.nome||p.name.toLowerCase().includes(estado.nome.toLowerCase()))&&
(!estado.status||p.status.toLowerCase()===estado.status)&&
(!estado.especie||p.species.toLowerCase()===estado.especie.toLowerCase())&&
(!estado.genero||p.gender.toLowerCase()===estado.genero)
);

el.aviso.hidden=false;
el.aviso.textContent="A API não respondeu. A consulta está usando o acervo local.";

if(!filtrados.length)return vazio();

estado.totalRegistros=filtrados.length;
estado.totalPaginas=Math.ceil(filtrados.length/POR_PAGINA);
estado.pagina=Math.min(estado.pagina,estado.totalPaginas);

const inicio=(estado.pagina-1)*POR_PAGINA;
render(filtrados.slice(inicio,inicio+POR_PAGINA));
}

buscar();
