// Carregar blocos salvos quando a página carregar
window.onload = function() {
    mostrarBlocos();
    
    // Fechar menus abertos ao clicar fora
    document.addEventListener('click', function(e) {
        const menus = document.querySelectorAll('.menu-opcoes');
        menus.forEach(menu => {
            if (menu.style.display === 'block') {
                menu.style.display = 'none';
            }
        });
    });
};

// Configuração da visualização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há blocos e ajustar a visualização para telas menores
    const ajustarVisualizacao = function() {
        // Verificar largura da tela
        if (window.innerWidth <= 480) {
            // Ajustar visualização para telas pequenas
            const blocos = document.querySelectorAll('.bloco-vendas');
            blocos.forEach(bloco => {
                // Garantir que o texto não quebre a interface
                const header = bloco.querySelector('.bloco-header h3');
                if (header && header.textContent.length > 25) {
                    header.title = header.textContent;
                    header.textContent = header.textContent.substring(0, 22) + '...';
                }
            });
        }
    };
    
    // Executar após carregar blocos
    setTimeout(ajustarVisualizacao, 300);
    
    // Ajustar ao redimensionar a tela
    window.addEventListener('resize', ajustarVisualizacao);
});

function criarNovoBloco() {
    const blocoId = Date.now(); // ID único para o bloco
    localStorage.setItem('blocoAtual', blocoId);
    localStorage.setItem('modoEdicao', 'novo');
    fazerTransicao('config-bloco.html');
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
        const dataFormatada = formatarData(parseInt(bloco.id));
        
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
            <button class="btn-config" onclick="event.stopPropagation(); toggleMenuOpcoes(event, ${bloco.id})" title="Opções">
                <i class="fas fa-ellipsis-h"></i>
            </button>
            <div id="menu-opcoes-${bloco.id}" class="menu-opcoes">
                <div class="opcao" onclick="event.stopPropagation(); editarBloco(${bloco.id})">
                    <i class="fas fa-edit"></i> Editar
                </div>
                <div class="opcao opcao-excluir" onclick="event.stopPropagation(); confirmarExclusaoBloco(${bloco.id}, '${bloco.nomeLanche}')">
                    <i class="fas fa-trash-alt"></i> Excluir
                </div>
            </div>
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
    fazerTransicao('config-bloco.html');
}

function abrirBloco(id) {
    localStorage.setItem('blocoAtual', id);
    fazerTransicao('vendas.html');
}

function toggleMenuOpcoes(event, id) {
    event.stopPropagation();
    
    // Fechar todos os outros menus primeiro
    const menus = document.querySelectorAll('.menu-opcoes');
    menus.forEach(menu => {
        if (menu.id !== `menu-opcoes-${id}` && menu.style.display === 'block') {
            menu.style.display = 'none';
        }
    });
    
    // Alternar o menu atual
    const menu = document.getElementById(`menu-opcoes-${id}`);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function excluirBloco(id) {
    // Converter o id para string para garantir comparação consistente
    const idString = id.toString();
    
    let blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    blocos = blocos.filter(bloco => bloco.id.toString() !== idString);
    localStorage.setItem('blocos', JSON.stringify(blocos));
    
    // Mostrar toast de sucesso
    mostrarToast('Bloco excluído com sucesso!', 'success');
    
    // Atualizar a lista de blocos
    mostrarBlocos();
}

// Adicionar modal de confirmação de exclusão
function confirmarExclusaoBloco(id, nome) {
    // Criar elementos da modal
    const modal = document.createElement('div');
    modal.className = 'modal-exclusao';
    modal.id = 'modal-exclusao-bloco';
    
    modal.innerHTML = `
        <div class="modal-conteudo">
            <div class="modal-header">
                <h3>Confirmar Exclusão</h3>
                <button class="btn-fechar-modal" onclick="fecharModalExclusaoBloco()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Tem certeza que deseja excluir o bloco "${nome}"?</p>
                <p class="aviso-exclusao">Todas as vendas associadas a este bloco serão excluídas permanentemente.</p>
            </div>
            <div class="modal-acoes-confirmacao">
                <button class="btn-confirmar-exclusao" onclick="executarExclusaoBloco(${id})">Excluir</button>
            </div>
        </div>
    `;
    
    // Verificar se já existe uma modal e remover
    const modalExistente = document.getElementById('modal-exclusao-bloco');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Adicionar modal ao body
    document.body.appendChild(modal);
    
    // Mostrar a modal
    setTimeout(() => {
        modal.classList.add('mostrar');
    }, 10);
    
    // Configurar para fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            fecharModalExclusaoBloco();
        }
    });
}

// Função para fechar a modal de exclusão
function fecharModalExclusaoBloco() {
    const modal = document.getElementById('modal-exclusao-bloco');
    if (modal) {
        modal.classList.remove('mostrar');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Função para executar a exclusão após confirmação
function executarExclusaoBloco(id) {
    excluirBloco(id);
    fecharModalExclusaoBloco();
}

// Função para mostrar toast
function mostrarToast(mensagem, tipo = 'success', duracao = 3000) {
    // Verificar se já existe um toast e remover
    const toastExistente = document.querySelector('.toast');
    if (toastExistente) {
        toastExistente.remove();
    }
    
    // Criar o elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <div class="toast-conteudo">
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${mensagem}</span>
        </div>
    `;
    
    // Adicionar toast ao body
    document.body.appendChild(toast);
    
    // Mostrar toast com animação
    setTimeout(() => {
        toast.classList.add('mostrar');
    }, 10);
    
    // Esconder toast após a duração
    setTimeout(() => {
        toast.classList.remove('mostrar');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duracao);
} 