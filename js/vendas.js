// Carregar configurações do bloco atual e mostrar vendas quando a página carregar
window.onload = function() {
    carregarInfoBloco();
    
    // Event listeners
    document.getElementById('comBebida').addEventListener('change', atualizarValor);
    document.getElementById('quantidade').addEventListener('input', atualizarValor);
    document.getElementById('pagamentoImediato').addEventListener('change', toggleFormaPagamento);
    
    document.getElementById('nome').focus();

    atualizarListaVendas();
    atualizarResumo();
};

function carregarInfoBloco() {
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const bloco = blocos.find(b => b.id === blocoId);
    
    if (bloco) {
        document.getElementById('info-bloco').textContent = `Vendas • ${bloco.nomeLanche}`;
        
        // Adicionar informação de valores abaixo do título
        const configInfo = document.getElementById('config-info');
        configInfo.className = 'bloco-valores';
        configInfo.textContent = `Valor: R$ ${bloco.valorVenda.toFixed(2)} | R$ ${(bloco.valorVenda + bloco.valorBebida).toFixed(2)} (com bebida)`;
        
        // Preencher valor considerando que a checkbox de bebida já vem marcada
        const valorTotal = bloco.valorVenda + bloco.valorBebida;
        document.getElementById('valor').value = valorTotal.toFixed(2);
    }
}

function toggleFormaPagamento() {
    const pagamentoImediato = document.getElementById('pagamentoImediato').checked;
    document.getElementById('formaPagamentoGroup').style.display = pagamentoImediato ? 'block' : 'none';
}

function atualizarValor() {
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoAtual = blocos.find(b => b.id === blocoId);
    
    if (blocoAtual) {
        const quantidade = parseInt(document.getElementById('quantidade').value) || 1;
        const comBebida = document.getElementById('comBebida').checked;
        const valorBase = blocoAtual.valorVenda * quantidade;
        const valorTotal = comBebida ? valorBase + (blocoAtual.valorBebida * quantidade) : valorBase;
        
        document.getElementById('valor').value = valorTotal.toFixed(2);
    }
}

function adicionarVenda() {
    const nome = document.getElementById('nome').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const valorUnitario = parseFloat(document.getElementById('valor').value) / quantidade; // Obtém o valor unitário
    const comBebida = document.getElementById('comBebida').checked;
    const pagamentoImediato = document.getElementById('pagamentoImediato').checked;
    const formaPagamento = pagamentoImediato ? document.getElementById('formaPagamento').value : null;

    if (!nome || !quantidade || !valorUnitario) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const blocoId = localStorage.getItem('blocoAtual');
    if (!blocoId) {
        alert('Nenhum bloco selecionado!');
        return;
    }

    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    
    if (blocoIndex === -1) {
        alert('Bloco não encontrado!');
        return;
    }

    const venda = {
        nome,
        quantidade,
        valor: valorUnitario,
        comBebida,
        pago: pagamentoImediato,
        formaPagamento,
        timestamp: new Date().getTime()
    };

    blocos[blocoIndex].vendas.push(venda);
    localStorage.setItem('blocos', JSON.stringify(blocos));

    // Limpar campos
    document.getElementById('nome').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('valor').value = '';
    document.getElementById('comBebida').checked = true;
    document.getElementById('pagamentoImediato').checked = false;
    document.getElementById('formaPagamentoGroup').style.display = 'none';

    document.getElementById('nome').focus();

    carregarInfoBloco();
    atualizarListaVendas();
    atualizarResumo();

}

function formatarDataHora(timestamp) {
    const data = new Date(timestamp);
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    const hora = data.getHours().toString().padStart(2, '0');
    const minuto = data.getMinutes().toString().padStart(2, '0');
    const segundo = data.getSeconds().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
}

function atualizarListaVendas() {
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const bloco = blocos.find(b => b.id === blocoId);
    const listaVendas = document.getElementById('lista-vendas');
    
    if (!bloco || !bloco.vendas) return;
    
    listaVendas.innerHTML = '';
    bloco.vendas.forEach((venda, index) => {
        const elemento = document.createElement('div');
        elemento.className = `venda-item ${venda.pago ? 'pago' : ''}`;
        elemento.dataset.id = index;
        
        const subtotal = venda.quantidade * venda.valor;
        const comBebida = venda.comBebida ? ' + Bebida' : '';
        const statusPagamento = venda.pago 
            ? `<i class="fas fa-check-circle"></i> Pago (${venda.formaPagamento})` 
            : '<i class="fas fa-clock"></i> Pendente';
        
        elemento.innerHTML = `
            <div class="venda-conteudo">
                <div class="venda-header">
                    <span class="venda-numero">#${(index + 1).toString().padStart(2, '0')}</span>
                    <span class="venda-data">${formatarDataHora(venda.timestamp)}</span>
                </div>
                
                <div class="venda-cliente">
                    ${venda.nome}
                </div>
                
                <div class="venda-detalhes">
                    <span class="item-nome">${bloco.nomeLanche}${comBebida}</span>
                    <span class="item-calculo">${venda.quantidade}x R$ ${venda.valor.toFixed(2)}</span>
                    <span class="item-subtotal">R$ ${subtotal.toFixed(2)}</span>
                </div>
                
                <div class="venda-status">
                    ${statusPagamento}
                </div>
            </div>
            
            <div class="venda-opcoes">
                <button class="opcao-pagar" onclick="event.stopPropagation(); togglePagamento(${index})">
                    ${venda.pago ? 'Estornar' : 'Pagar'}
                </button>
                <button class="opcao-editar" onclick="event.stopPropagation(); editarVenda(${index})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="opcao-excluir" onclick="event.stopPropagation(); confirmarExclusao(${index})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        
        // Adicionar evento de clique para mostrar/ocultar opções
        elemento.addEventListener('click', function() {
            const opcoes = this.querySelector('.venda-opcoes');
            document.querySelectorAll('.venda-opcoes').forEach(op => {
                if (op !== opcoes) {
                    op.classList.remove('mostrar');
                    op.closest('.venda-item').classList.remove('menu-ativo');
                }
            });
            opcoes.classList.toggle('mostrar');
            this.classList.toggle('menu-ativo');
        });
        
        listaVendas.appendChild(elemento);
    });
    
    atualizarTotais();
}

function confirmarExclusao(index) {
    event.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
        const blocoId = localStorage.getItem('blocoAtual');
        const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
        const blocoIndex = blocos.findIndex(b => b.id === blocoId);
        
        if (blocoIndex !== -1) {
            blocos[blocoIndex].vendas.splice(index, 1);
            localStorage.setItem('blocos', JSON.stringify(blocos));
            atualizarListaVendas();
        }
    }
}

function togglePagamento(index) {
    event.stopPropagation();
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    
    if (blocoIndex !== -1) {
        const venda = blocos[blocoIndex].vendas[index];
        if (venda.pago) {
            venda.pago = false;
            delete venda.formaPagamento;
        } else {
            const formaPagamento = prompt('Forma de pagamento (dinheiro/pix):', 'dinheiro');
            if (formaPagamento && ['dinheiro', 'pix'].includes(formaPagamento.toLowerCase())) {
                venda.pago = true;
                venda.formaPagamento = formaPagamento.toLowerCase();
            }
        }
        localStorage.setItem('blocos', JSON.stringify(blocos));
        atualizarListaVendas();
    }
}

function atualizarTotais() {
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoAtual = blocos.find(b => b.id === blocoId);
    
    if (!blocoAtual || !blocoAtual.vendas) return;
    
    const totalVendido = blocoAtual.vendas.reduce((total, venda) => total + venda.valor, 0);
    const totalRecebido = blocoAtual.vendas
        .filter(venda => venda.pago)
        .reduce((total, venda) => total + venda.valor, 0);
    const totalReceber = totalVendido - totalRecebido;
    
    document.getElementById('totalVendido').textContent = totalVendido.toFixed(2);
    document.getElementById('totalRecebido').textContent = totalRecebido.toFixed(2);
    document.getElementById('totalReceber').textContent = totalReceber.toFixed(2);
}

let vendaEmEdicao = null;

function editarVenda(index) {
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const bloco = blocos.find(b => b.id === blocoId);
    const venda = bloco.vendas[index];
    vendaEmEdicao = index;

    // Preencher os campos com os dados da venda
    document.getElementById('nome').value = venda.nome;
    document.getElementById('quantidade').value = venda.quantidade;
    document.getElementById('valor').value = venda.valor.toFixed(2);
    document.getElementById('comBebida').checked = venda.comBebida;
    document.getElementById('pagamentoImediato').checked = venda.pago;
    
    if (venda.pago) {
        document.getElementById('formaPagamentoGroup').style.display = 'block';
        document.getElementById('formaPagamento').value = venda.formaPagamento || 'dinheiro';
    }

    // Ativar modo de edição
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.add('modo-edicao');
    });

    // Mostrar botões de edição e ocultar botão adicionar
    document.querySelector('.botoes-edicao').classList.add('ativo');
    document.querySelector('.btn-adicionar').classList.add('oculto');

    // Rolar até o topo do formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
    atualizarListaVendas();
}

function salvarEdicao() {
    if (vendaEmEdicao === null) return;

    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    const venda = {
        nome: document.getElementById('nome').value,
        quantidade: parseInt(document.getElementById('quantidade').value),
        valor: parseFloat(document.getElementById('valor').value),
        comBebida: document.getElementById('comBebida').checked,
        pago: document.getElementById('pagamentoImediato').checked,
        timestamp: blocos[blocoIndex].vendas[vendaEmEdicao].timestamp,
        formaPagamento: document.getElementById('pagamentoImediato').checked ? 
            document.getElementById('formaPagamento').value : null
    };

    blocos[blocoIndex].vendas[vendaEmEdicao] = venda;
    localStorage.setItem('blocos', JSON.stringify(blocos));

    cancelarEdicao();
    atualizarListaVendas();
    atualizarResumo();
}

function cancelarEdicao() {
    vendaEmEdicao = null;

    // Limpar campos
    document.getElementById('nome').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('valor').value = '';
    document.getElementById('comBebida').checked = true;
    document.getElementById('pagamentoImediato').checked = false;
    document.getElementById('formaPagamentoGroup').style.display = 'none';

    // Desativar modo de edição
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('modo-edicao');
    });

    // Ocultar botões de edição e mostrar botão adicionar
    document.querySelector('.botoes-edicao').classList.remove('ativo');
    document.querySelector('.btn-adicionar').classList.remove('oculto');

    carregarInfoBloco();
    document.getElementById('nome').focus();
}
