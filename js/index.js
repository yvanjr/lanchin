// Carregar blocos salvos quando a página carregar
window.onload = function() {
    mostrarBlocos();
};

function criarNovoBloco() {
    const blocoId = Date.now(); // ID único para o bloco
    localStorage.setItem('blocoAtual', blocoId);
    localStorage.setItem('modoEdicao', 'novo');
    window.location.href = 'pages/config-bloco.html';
}

function mostrarBlocos() {
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const listaBlocos = document.getElementById('lista-blocos');
    listaBlocos.innerHTML = '';
    
    blocos.forEach(bloco => {
        const elemento = document.createElement('div');
        elemento.className = 'bloco-vendas';
        
        const data = new Date(parseInt(bloco.id));
        const dataFormatada = data.toLocaleDateString();
        
        // Calcular vendas pagas e a receber
        const vendasPagas = bloco.vendas?.filter(v => v.pago)?.length || 0;
        const vendasReceber = bloco.vendas?.filter(v => !v.pago)?.length || 0;
        const totalVendas = vendasPagas + vendasReceber;
        
        elemento.innerHTML = `
            <div class="bloco-header">
                <h3>${bloco.nomeLanche} • ${dataFormatada}</h3>
                <p class="bloco-valores">
                    Valor: R$ ${bloco.valorVenda.toFixed(2)} | R$ ${(bloco.valorVenda + bloco.valorBebida).toFixed(2)} + bebida
                </p>
            </div>
            <div class="bloco-info">
                <div class="info-item">
                    <span class="info-label">Vendas:</span>
                    <span class="info-value">${totalVendas}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Pagas:</span>
                    <span class="info-value">${vendasPagas}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">A Receber:</span>
                    <span class="info-value ${vendasReceber > 0 ? 'destaque-receber' : ''}">${vendasReceber}</span>
                </div>
            </div>
            <button class="btn-config" onclick="event.stopPropagation(); editarBloco(${bloco.id})" title="Editar Configurações">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        `;
        
        // Adicionar evento de clique ao bloco inteiro
        elemento.style.cursor = 'pointer';
        elemento.onclick = () => abrirBloco(bloco.id);
        listaBlocos.appendChild(elemento);
    });
}

function editarBloco(id) {
    localStorage.setItem('blocoAtual', id);
    localStorage.setItem('modoEdicao', 'editar');
    window.location.href = 'pages/config-bloco.html';
}

function abrirBloco(id) {
    localStorage.setItem('blocoAtual', id);
    window.location.href = 'pages/vendas.html';
}

// Função para fazer a transição entre páginas
function fazerTransicao(destino) {
    document.body.classList.add('fade-out');
    
    setTimeout(() => {
        window.location.href = destino;
    }, 300);
}

// Configurar transições quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Configurar links de navegação
    document.querySelectorAll('a[href]').forEach(link => {
        // Ignorar links externos ou âncoras
        if (link.href.startsWith(window.location.origin) && !link.href.includes('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                fazerTransicao(this.href);
            });
        }
    });

    // Configurar botão voltar do navegador
    window.addEventListener('popstate', function() {
        document.body.classList.add('fade-out');
    });
});
