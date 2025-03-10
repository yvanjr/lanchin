// Carregar configurações do bloco atual e mostrar vendas quando a página carregar
window.onload = function() {
    carregarInfoBloco();
    
    // Event listeners
    document.getElementById('comBebida').addEventListener('change', atualizarValor);
    document.getElementById('quantidade').addEventListener('input', atualizarValor);
    document.getElementById('pagamentoImediato').addEventListener('change', toggleFormaPagamento);
    
    // document.getElementById('nome').focus();

    atualizarListaVendas();
    atualizarResumo();
};

    // Selecionar conteúdo ao focar
    document.getElementById('quantidade').addEventListener('focus', function() {
        this.select();
    });
    
    document.getElementById('valor').addEventListener('focus', function() {
        this.select();
    });

    document.getElementById('nome').addEventListener('focus', function() {
        this.select();
    });    

function carregarInfoBloco() {
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const bloco = blocos.find(b => b.id === blocoId);
    
    if (bloco) {
        document.getElementById('info-bloco').textContent = `Vendas • ${bloco.nomeLanche}`;
        
        // Adicionar informação de valores abaixo do título
        const configInfo = document.getElementById('config-info');
        configInfo.className = 'bloco-valores';
        configInfo.textContent = `Valor: R$ ${bloco.valorVenda.toFixed(2)} | R$ ${(bloco.valorVenda + bloco.valorBebida).toFixed(2)} + bebida`;
        
        // Preencher valor considerando que a checkbox de bebida já vem marcada
        const valorTotal = bloco.valorVenda + bloco.valorBebida;
        document.getElementById('valor').value = valorTotal.toFixed(2);
    }
}

function toggleFormaPagamento() {
    const pagamentoImediato = document.getElementById('pagamentoImediato').checked;
    const formaPagamentoGroup = document.getElementById('formaPagamentoGroup');
    
    if (pagamentoImediato) {
        formaPagamentoGroup.style.display = 'block';
        // Força um reflow para a transição funcionar
        formaPagamentoGroup.offsetHeight;
        
        // Adiciona event listeners aos botões
        document.querySelectorAll('#formaPagamentoGroup .opcao-pagamento').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove a classe ativa de todos os botões
                document.querySelectorAll('#formaPagamentoGroup .opcao-pagamento').forEach(b => 
                    b.classList.remove('ativo'));
                // Adiciona a classe ativa ao botão clicado
                this.classList.add('ativo');
            });
        });
        
        // Marca o primeiro botão como ativo por padrão
        const primeiroBotao = document.querySelector('#formaPagamentoGroup .opcao-pagamento');
        if (primeiroBotao) primeiroBotao.classList.add('ativo');
    } else {
        formaPagamentoGroup.style.display = 'none';
        // Remove a classe ativa de todos os botões
        document.querySelectorAll('#formaPagamentoGroup .opcao-pagamento').forEach(btn => 
            btn.classList.remove('ativo'));
    }
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
    const valorUnitario = parseFloat(document.getElementById('valor').value) / quantidade;
    const comBebida = document.getElementById('comBebida').checked;
    const pagamentoImediato = document.getElementById('pagamentoImediato').checked;
    const formaPagamento = pagamentoImediato ? 
        document.querySelector('#formaPagamentoGroup .opcao-pagamento.ativo')?.getAttribute('data-forma') : null;

    if (!nome || !quantidade || !valorUnitario) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (pagamentoImediato && !formaPagamento) {
        alert('Por favor, selecione uma forma de pagamento!');
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
        nome: nome.toUpperCase(),
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

    carregarInfoBloco();

    // document.getElementById('nome').focus();

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
    const listaVendas = document.getElementById('lista-vendas');
    listaVendas.innerHTML = '';
    
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const bloco = blocos.find(b => b.id === blocoId);
    
    if (!bloco || !bloco.vendas) return;

    bloco.vendas.forEach((venda, index) => {
        const elemento = document.createElement('div');
        elemento.className = `venda-item${venda.pago ? ' pago' : ''}`;
        
        const subtotal = venda.valor * venda.quantidade;
        const comBebida = venda.comBebida ? ' + Bebida' : '';
        const statusPagamento = venda.pago ? 
            `<i class="fas fa-check-circle"></i> Pago (${venda.formaPagamento})` : 
            '<i class="fas fa-clock"></i> Pendente';
        
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
                <button onclick="event.stopPropagation(); togglePagamento(${index})">
                    <i class="fas fa-${venda.pago ? 'undo' : 'check'}"></i>
                    ${venda.pago ? 'Estornar' : 'Pagar'}
                </button>
                <button onclick="event.stopPropagation(); editarVenda(${index})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="opcao-excluir" onclick="event.stopPropagation(); confirmarExclusao(${index})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        
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
            atualizarResumo();
        }
    }
}

let vendaIndexAtual = null;

function mostrarModalPagamento(index) {
    vendaIndexAtual = index;
    const modal = document.getElementById('modal-pagamento');
    modal.style.display = 'flex';
    
    requestAnimationFrame(() => {
        modal.classList.add('mostrar');
    });
    
    // Adicionar event listeners para as opções de pagamento
    document.querySelectorAll('.opcao-pagamento').forEach(opcao => {
        opcao.onclick = function() {
            const formaPagamento = this.getAttribute('data-forma');
            confirmarPagamento(formaPagamento);
        };
    });
}

function fecharModalPagamento() {
    const modal = document.getElementById('modal-pagamento');
    modal.classList.remove('mostrar');
    
    // Aguardar a animação terminar antes de esconder o modal
    modal.addEventListener('transitionend', function handler() {
        modal.style.display = 'none';
        modal.removeEventListener('transitionend', handler);
    });
    
    vendaIndexAtual = null;
}

function confirmarPagamento(formaPagamento) {
    if (vendaIndexAtual === null) return;
    
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    
    if (blocoIndex === -1) {
        alert('Bloco não encontrado!');
        return;
    }

    const venda = blocos[blocoIndex].vendas[vendaIndexAtual];
    venda.pago = true;
    venda.formaPagamento = formaPagamento;

    localStorage.setItem('blocos', JSON.stringify(blocos));
    fecharModalPagamento();
    atualizarListaVendas();
    atualizarResumo();
}

function togglePagamento(index) {
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    
    if (blocoIndex === -1) {
        alert('Bloco não encontrado!');
        return;
    }

    const venda = blocos[blocoIndex].vendas[index];
    
    if (venda.pago) {
        // Se já está pago, apenas estorna
        venda.pago = false;
        venda.formaPagamento = null;
        localStorage.setItem('blocos', JSON.stringify(blocos));
        atualizarListaVendas();
        atualizarResumo();
    } else {
        // Se não está pago, mostra o modal de pagamento
        mostrarModalPagamento(index);
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

function atualizarResumo() {
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const bloco = blocos.find(b => b.id === blocoId);
    
    if (!bloco || !bloco.vendas) return;

    let totalVendido = 0;
    let totalRecebido = 0;
    
    bloco.vendas.forEach(venda => {
        const valorTotal = venda.valor * venda.quantidade; // Calcula o valor total (unitário x quantidade)
        totalVendido += valorTotal;
        if (venda.pago) {
            totalRecebido += valorTotal;
        }
    });

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

    // Alterar o título do formulário
    document.querySelector('.form-title').textContent = 'Editar Venda';

    // Preencher os campos com os dados da venda
    document.getElementById('nome').value = venda.nome;
    document.getElementById('quantidade').value = venda.quantidade;
    document.getElementById('valor').value = (venda.valor * venda.quantidade).toFixed(2);
    document.getElementById('comBebida').checked = venda.comBebida;
    document.getElementById('pagamentoImediato').checked = venda.pago;
    
    if (venda.pago) {
        document.getElementById('formaPagamentoGroup').style.display = 'block';
        // Marca o botão correspondente como ativo
        document.querySelectorAll('#formaPagamentoGroup .opcao-pagamento').forEach(btn => {
            if (btn.getAttribute('data-forma') === venda.formaPagamento) {
                btn.classList.add('ativo');
            } else {
                btn.classList.remove('ativo');
            }
        });
    }

    // Ativar modo de edição
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.add('modo-edicao');
    });

    // Mostrar botões de edição e ocultar botões de nova venda
    document.querySelector('.botoes-edicao').classList.add('ativo');
    document.querySelector('.botoes-nova-venda').style.display = 'none';

    // Mostrar o formulário
    document.getElementById('form-venda').classList.add('mostrar');
    document.querySelector('.fab-add-venda').style.display = 'none';

    // Fechar o menu de opções
    document.querySelectorAll('.venda-opcoes').forEach(op => {
        op.classList.remove('mostrar');
        op.closest('.venda-item').classList.remove('menu-ativo');
    });

    // Rolar até o topo do formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });

    atualizarListaVendas();
    atualizarResumo();
}

function salvarEdicao() {
    if (vendaEmEdicao === null) return;

    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    const formaPagamento = document.getElementById('pagamentoImediato').checked ? 
        document.querySelector('#formaPagamentoGroup .opcao-pagamento.ativo')?.getAttribute('data-forma') : null;
        
    const venda = {
        nome: document.getElementById('nome').value,
        quantidade: parseInt(document.getElementById('quantidade').value),
        valor: parseFloat(document.getElementById('valor').value) / parseInt(document.getElementById('quantidade').value),
        comBebida: document.getElementById('comBebida').checked,
        pago: document.getElementById('pagamentoImediato').checked,
        timestamp: blocos[blocoIndex].vendas[vendaEmEdicao].timestamp,
        formaPagamento: formaPagamento
    };

    blocos[blocoIndex].vendas[vendaEmEdicao] = venda;
    localStorage.setItem('blocos', JSON.stringify(blocos));

    cancelarEdicao();
    atualizarListaVendas();
    atualizarResumo();
}

function cancelarEdicao() {
    vendaEmEdicao = null;

    // Restaurar o título original do formulário
    document.querySelector('.form-title').textContent = 'Nova Venda';

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

    // Ocultar botões de edição e mostrar botões de nova venda
    document.querySelector('.botoes-edicao').classList.remove('ativo');
    document.querySelector('.botoes-nova-venda').style.display = 'flex';

    // Ocultar o formulário
    document.getElementById('form-venda').classList.remove('mostrar');
    document.querySelector('.fab-add-venda').style.display = 'flex';

    carregarInfoBloco();
    atualizarListaVendas();
    atualizarResumo();
}

function mostrarFormVenda() {
    document.body.classList.add('form-venda-ativo');
    requestAnimationFrame(() => {
        document.getElementById('form-venda').classList.add('mostrar');
        document.querySelector('.fab-add-venda').style.display = 'none';
        document.getElementById('nome').focus();
    });
}

function ocultarFormVenda() {
    const formVenda = document.getElementById('form-venda');
    formVenda.classList.remove('mostrar');
    document.querySelector('.fab-add-venda').style.display = 'flex';
    
    // Aguardar a animação terminar antes de remover a classe do body
    formVenda.addEventListener('transitionend', function handler() {
        document.body.classList.remove('form-venda-ativo');
        formVenda.removeEventListener('transitionend', handler);
    });
}

// Inicialização do formulário e eventos
document.addEventListener('DOMContentLoaded', function() {
    ocultarFormVenda();
    
    // Verificar se há vendas e mostrar mensagem caso não haja
    const verificarVendas = function() {
        const listaVendas = document.getElementById('lista-vendas');
        const semVendas = document.getElementById('sem-vendas');
        
        if (listaVendas.children.length === 0) {
            semVendas.style.display = 'block';
        } else {
            semVendas.style.display = 'none';
        }
    };
    
    // Executar na inicialização
    verificarVendas();
    
    // Observar mudanças na lista de vendas
    const observer = new MutationObserver(verificarVendas);
    observer.observe(document.getElementById('lista-vendas'), { childList: true });
    
    // Fechar formulário ao clicar fora dele
    document.addEventListener('click', function(event) {
        const formVenda = document.getElementById('form-venda');
        const fabAddVenda = document.querySelector('.fab-add-venda');
        
        if (formVenda.classList.contains('mostrar') && 
            !formVenda.contains(event.target) && 
            !fabAddVenda.contains(event.target)) {
            // Verificar se não há dados preenchidos antes de fechar
            const nome = document.getElementById('nome').value;
            if (!nome.trim()) {
                ocultarFormVenda();
            }
        }
    });
    
    // Ajustar scroll em inputs para evitar problemas em telas pequenas
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
    
    // Ocultar formulário quando a venda for adicionada com sucesso
    const btnAdicionar = document.querySelector('.btn-adicionar');
    const originalAddHandler = btnAdicionar.onclick;
    btnAdicionar.onclick = function() {
        const result = adicionarVenda();
        if (result !== false) {
            ocultarFormVenda();
        }
        return result;
    };

    // Fechar modal ao clicar fora
    document.getElementById('modal-pagamento').addEventListener('click', function(event) {
        if (event.target === this) {
            fecharModalPagamento();
        }
    });
});
