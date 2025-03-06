// Carregar blocos salvos quando a página carregar
window.onload = function() {
    mostrarBlocos();
};

function criarNovoBloco() {
    const blocoId = Date.now(); // ID único para o bloco
    localStorage.setItem('blocoAtual', blocoId);
    localStorage.setItem('modoEdicao', 'novo');
    window.location.href = 'config-bloco.html';
}

function mostrarBlocos() {
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const listaBlocos = document.getElementById('lista-blocos');
    listaBlocos.innerHTML = '';
    
    if (blocos.length === 0) {
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-vazia';
        mensagem.innerHTML = `
            <p>Não há blocos de vendas cadastrados.</p>
            <p>Clique no botão acima para criar um novo bloco.</p>
        `;
        listaBlocos.appendChild(mensagem);
        return;
    }
    
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
                    <span class="info-label">Vendido</span>
                    <span class="info-value">${totalVendas}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Pago</span>
                    <span class="info-value">${vendasPagas}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Pendente</span>
                    <span class="info-value ${vendasReceber > 0 ? 'destaque-receber' : ''}">${vendasReceber}</span>
                </div>
            </div>
            <button class="btn-config" onclick="event.stopPropagation(); editarBloco(${bloco.id})" title="Editar Configurações">
                <i class="fas fa-ellipsis-h"></i>
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
    window.location.href = 'config-bloco.html';
}

function abrirBloco(id) {
    localStorage.setItem('blocoAtual', id);
    window.location.href = 'vendas.html';
} 