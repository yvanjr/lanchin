// Carregar configurações do bloco atual e mostrar vendas quando a página carregar
window.onload = function() {
    carregarInfoBloco();
    
    // Event listeners
    document.getElementById('comBebida').addEventListener('change', atualizarValor);
    document.getElementById('pagamentoImediato').addEventListener('change', toggleFormaPagamento);
    
    // Event listeners para os botões de quantidade
    document.getElementById('btn-decrease').addEventListener('click', function() {
        updateQuantity(-1);
    });
    document.getElementById('btn-increase').addEventListener('click', function() {
        updateQuantity(1);
    });

    atualizarListaVendas();
    atualizarResumo();
};

// Função para atualizar a quantidade
function updateQuantity(change) {
    const quantityInput = document.getElementById('quantidade');
    const quantityDisplay = document.getElementById('quantity-display');
    
    let quantity = parseInt(quantityInput.value) || 1;
    quantity = Math.max(1, quantity + change); // Não permitir menos que 1
    
    quantityInput.value = quantity;
    quantityDisplay.textContent = quantity;
    
    atualizarValor();
}

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
    const formVenda = document.getElementById('form-venda');
    
    if (pagamentoImediato) {
        formaPagamentoGroup.style.display = 'block';
        formVenda.classList.add('com-pagamento');
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
        formVenda.classList.remove('com-pagamento');
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
        
        // Atualizar o valor no input oculto
        document.getElementById('valor').value = valorTotal.toFixed(2);
        
        // Atualizar o texto de exibição do valor no botão
        const valorDisplay = document.getElementById('valor-display');
        valorDisplay.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
    }
}

// Função para mostrar toast
function mostrarToast(mensagem, tipo = 'success', duracao = 3000) {
    const toastContainer = document.getElementById('toast-container');
    const toastText = document.querySelector('.toast-text');
    const toastIcon = document.querySelector('.toast-icon');
    
    // Definir o ícone com base no tipo
    const icones = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-circle'
    };
    
    toastIcon.innerHTML = `<i class="fas ${icones[tipo]}"></i>`;
    toastIcon.className = 'toast-icon ' + tipo;
    
    // Definir o texto
    toastText.textContent = mensagem;
    
    // Mostrar o toast
    toastContainer.classList.add('show');
    
    // Esconder o toast após a duração definida
    setTimeout(() => {
        toastContainer.classList.remove('show');
    }, duracao);
}

function adicionarVenda() {
    const nome = document.getElementById('nome').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const valorTotal = parseFloat(document.getElementById('valor').value);
    const valorUnitario = valorTotal / quantidade;
    const comBebida = document.getElementById('comBebida').checked;
    const pagamentoImediato = document.getElementById('pagamentoImediato').checked;
    const formaPagamento = pagamentoImediato ? 
        document.querySelector('#formaPagamentoGroup .opcao-pagamento.ativo')?.getAttribute('data-forma') : null;

    if (!nome || !quantidade || isNaN(valorTotal) || valorTotal <= 0) {
        alert('Por favor, preencha todos os campos!');
        return false;
    }

    if (pagamentoImediato && !formaPagamento) {
        alert('Por favor, selecione uma forma de pagamento!');
        return false;
    }

    const blocoId = localStorage.getItem('blocoAtual');
    if (!blocoId) {
        alert('Nenhum bloco selecionado!');
        return false;
    }

    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    
    if (blocoIndex === -1) {
        alert('Bloco não encontrado!');
        return false;
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
    document.getElementById('quantity-display').textContent = '1';
    document.getElementById('valor').value = '';
    document.getElementById('valor-display').textContent = 'R$ 0,00';
    document.getElementById('comBebida').checked = true;
    document.getElementById('pagamentoImediato').checked = false;
    document.getElementById('formaPagamentoGroup').style.display = 'none';

    carregarInfoBloco();
    atualizarListaVendas();
    atualizarResumo();
    
    // Mostrar toast de confirmação
    mostrarToast('Venda adicionada com sucesso!', 'success');
    
    return true;
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

// Variável para armazenar o índice da venda a ser excluída
let vendaParaExcluir = null;

function confirmarExclusao(index) {
    event.stopPropagation();
    vendaParaExcluir = index;
    
    // Mostrar o modal de confirmação
    const modal = document.getElementById('modal-exclusao');
    modal.style.display = 'flex';
    
    requestAnimationFrame(() => {
        modal.classList.add('mostrar');
    });
    
    // Fechar o menu de opções da venda
    document.querySelectorAll('.venda-opcoes').forEach(op => {
        op.classList.remove('mostrar');
        op.closest('.venda-item').classList.remove('menu-ativo');
    });
}

function fecharModalExclusao() {
    const modal = document.getElementById('modal-exclusao');
    const modalContent = modal.querySelector('.modal-content');
    
    // Primeiro, animar o conteúdo do modal descendo
    modalContent.style.transform = 'translateY(100%)';
    
    // Depois, reduzir a opacidade do backdrop
    setTimeout(() => {
        modal.classList.remove('mostrar');
        
        // Aguardar a animação terminar antes de esconder o modal
        modal.addEventListener('transitionend', function handler() {
            modal.style.display = 'none';
            // Resetar o transform para o próximo uso
            modalContent.style.transform = '';
            modal.removeEventListener('transitionend', handler);
        }, { once: true });
    }, 50);
    
    vendaParaExcluir = null;
}

function executarExclusao() {
    if (vendaParaExcluir === null) return;
    
    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    
    if (blocoIndex !== -1) {
        blocos[blocoIndex].vendas.splice(vendaParaExcluir, 1);
        localStorage.setItem('blocos', JSON.stringify(blocos));
        atualizarListaVendas();
        atualizarResumo();
        
        // Mostrar toast de confirmação
        mostrarToast('Venda excluída com sucesso!', 'info');
    }
    
    fecharModalExclusao();
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
    const modalContent = modal.querySelector('.modal-content');
    
    // Primeiro, animar o conteúdo do modal descendo
    modalContent.style.transform = 'translateY(100%)';
    
    // Depois, reduzir a opacidade do backdrop
    setTimeout(() => {
        modal.classList.remove('mostrar');
        
        // Aguardar a animação terminar antes de esconder o modal
        modal.addEventListener('transitionend', function handler() {
            modal.style.display = 'none';
            // Resetar o transform para o próximo uso
            modalContent.style.transform = '';
            modal.removeEventListener('transitionend', handler);
        }, { once: true }); // once: true garante que o evento só será acionado uma vez
    }, 50); // Pequeno delay para que a animação do conteúdo comece primeiro
    
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
    
    // Mostrar toast de confirmação
    mostrarToast(`Pagamento registrado: ${formaPagamento}`, 'success');
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
        
        // Mostrar toast de confirmação
        mostrarToast('Pagamento estornado com sucesso!', 'warning');
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
    document.getElementById('quantity-display').textContent = venda.quantidade;
    
    // Calcular e preencher o valor total
    const valorTotal = (venda.valor * venda.quantidade).toFixed(2);
    document.getElementById('valor').value = valorTotal;
    document.getElementById('valor-display').textContent = `R$ ${valorTotal.replace('.', ',')}`;
    
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

    // Modificar o botão de adicionar para salvar
    const btnAdicionar = document.querySelector('.btn-adicionar-com-valor');
    btnAdicionar.querySelector('.fixed-text').textContent = 'Adicionar';
    
    // Mudar o onclick do botão para salvar
    btnAdicionar.onclick = function() {
        salvarEdicao();
        return true;
    };
    
    // Ajustar a função do botão X para cancelar edição
    document.querySelector('.btn-fechar').onclick = function() {
        cancelarEdicao();
    };

    // Mostrar o formulário e adicionar o overlay escuro
    document.body.classList.add('form-venda-ativo');
    document.getElementById('form-venda').classList.add('mostrar');
    document.querySelector('.fab-add-venda').style.display = 'none';

    // Fechar o menu de opções
    document.querySelectorAll('.venda-opcoes').forEach(op => {
        op.classList.remove('mostrar');
        op.closest('.venda-item').classList.remove('menu-ativo');
    });
}

function salvarEdicao() {
    if (vendaEmEdicao === null) return;

    const blocoId = localStorage.getItem('blocoAtual');
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    const blocoIndex = blocos.findIndex(b => b.id === blocoId);
    const formaPagamento = document.getElementById('pagamentoImediato').checked ? 
        document.querySelector('#formaPagamentoGroup .opcao-pagamento.ativo')?.getAttribute('data-forma') : null;
    
    const nome = document.getElementById('nome').value;    
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const valorTotal = parseFloat(document.getElementById('valor').value);
    
    const venda = {
        nome: nome.toUpperCase(),
        quantidade: quantidade,
        valor: valorTotal / quantidade,
        comBebida: document.getElementById('comBebida').checked,
        pago: document.getElementById('pagamentoImediato').checked,
        timestamp: blocos[blocoIndex].vendas[vendaEmEdicao].timestamp,
        formaPagamento: formaPagamento
    };

    blocos[blocoIndex].vendas[vendaEmEdicao] = venda;
    localStorage.setItem('blocos', JSON.stringify(blocos));

    // Restaurar o estado normal e fechar o formulário
    vendaEmEdicao = null;
    resetarFormulario();
    ocultarFormVenda();
    atualizarListaVendas();
    atualizarResumo();
    
    // Mostrar toast de confirmação
    mostrarToast('Venda atualizada com sucesso!', 'success');
}

function cancelarEdicao() {
    vendaEmEdicao = null;
    resetarFormulario();
    ocultarFormVenda();
    atualizarListaVendas();
    atualizarResumo();
}

function resetarFormulario() {
    // Restaurar o título original do formulário
    document.querySelector('.form-title').textContent = 'Nova Venda';

    // Limpar campos
    document.getElementById('nome').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('quantity-display').textContent = '1';
    document.getElementById('valor').value = '';
    document.getElementById('valor-display').textContent = 'R$ 0,00';
    document.getElementById('comBebida').checked = true;
    document.getElementById('pagamentoImediato').checked = false;
    document.getElementById('formaPagamentoGroup').style.display = 'none';
    document.getElementById('form-venda').classList.remove('com-pagamento');

    // Desativar modo de edição
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('modo-edicao');
    });

    // Restaurar o botão adicionar
    const btnAdicionar = document.querySelector('.btn-adicionar-com-valor');
    btnAdicionar.querySelector('.fixed-text').textContent = 'Adicionar';
    
    // Restaurar os event listeners originais
    btnAdicionar.onclick = function() {
        const result = adicionarVenda();
        if (result !== false) {
            ocultarFormVenda();
        }
        return result;
    };
    
    // Restaurar a função do botão X
    document.querySelector('.btn-fechar').onclick = ocultarFormVenda;
    
    carregarInfoBloco();
}

function mostrarFormVenda() {
    // Prevenir que o evento se propague para o documento
    if (event) event.stopPropagation();
    
    // Adicionar flag para evitar fechamento imediato
    window.formularioRecemAberto = true;
    
    // Primeiro mostrar o formulário
    const formVenda = document.getElementById('form-venda');
    formVenda.classList.add('mostrar');
    document.querySelector('.fab-add-venda').style.display = 'none';
    
    // Depois aplicar o overlay escuro com um pequeno atraso
    setTimeout(() => {
        document.body.classList.add('form-venda-ativo');
        document.getElementById('nome').focus();
        atualizarValor();
    }, 50);
    
    // Remover a flag após um atraso maior
    setTimeout(() => {
        window.formularioRecemAberto = false;
    }, 500);
}

function ocultarFormVenda() {
    const formVenda = document.getElementById('form-venda');
    
    // Primeiro remover o overlay escuro
    document.body.classList.remove('form-venda-ativo');
    
    // Depois fechar o formulário com um pequeno atraso
    setTimeout(() => {
        formVenda.classList.remove('mostrar');
        document.querySelector('.fab-add-venda').style.display = 'flex';
    }, 50);
    
    // Não precisamos mais do event listener de transição
    // pois estamos removendo tudo em ordem específica
}

// Inicialização do formulário e eventos
document.addEventListener('DOMContentLoaded', function() {
    ocultarFormVenda();
    
    // Define a função padrão para o botão X
    document.querySelector('.btn-fechar').onclick = ocultarFormVenda;
    
    // Configurar evento de adicionar venda
    const btnAdicionar = document.querySelector('.btn-adicionar-com-valor');
    btnAdicionar.onclick = function() {
        const result = adicionarVenda();
        if (result !== false) {
            ocultarFormVenda();
        }
        return result;
    };
    
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
    // Se o formulário foi recém-aberto OU se clicou no botão FAB, não fechar
    if (window.formularioRecemAberto) return;
    
    const formVenda = document.getElementById('form-venda');
    const fabAddVenda = document.querySelector('.fab-add-venda');
    
    // Se clicou no botão FAB, não feche o formulário
    if (event.target === fabAddVenda || fabAddVenda.contains(event.target)) {
        return;
    }
    
    if (formVenda.classList.contains('mostrar') && 
        !formVenda.contains(event.target)) {
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
    
    // Fechar modais ao clicar fora
    document.getElementById('modal-pagamento').addEventListener('click', function(event) {
        if (event.target === this) {
            fecharModalPagamento();
        }
    });
    
    document.getElementById('modal-exclusao').addEventListener('click', function(event) {
        if (event.target === this) {
            fecharModalExclusao();
        }
    });
});
