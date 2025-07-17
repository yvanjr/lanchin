/**
 * Utilitários comuns para o sistema
 */

/**
 * Exibe uma mensagem de toast
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo do toast (success, error, warning, info)
 * @param {number} duracao - Duração em milissegundos
 */
function mostrarToast(mensagem, tipo = 'success', duracao = 3000) {
    // Verificar se já existe um toast e remover
    const toastExistente = document.querySelector('.toast');
    if (toastExistente) {
        toastExistente.remove();
    }
    
    // Criar elemento de toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${obterIconeToast(tipo)}"></i>
            <span>${mensagem}</span>
        </div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(toast);
    
    // Adicionar classe para mostrar com animação
    setTimeout(() => {
        toast.classList.add('mostrar');
    }, 10);
    
    // Remover após a duração
    setTimeout(() => {
        toast.classList.remove('mostrar');
        // Remover o elemento após a animação
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duracao);
}

/**
 * Retorna o ícone correspondente ao tipo de toast
 * @param {string} tipo - Tipo do toast
 * @returns {string} - Classe do ícone
 */
function obterIconeToast(tipo) {
    switch (tipo) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-times-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

/**
 * Faz a transição entre páginas com efeito de fade
 * @param {string} destino - URL de destino
 */
function fazerTransicao(destino) {
    document.body.classList.add('fade-out');
    
    setTimeout(() => {
        window.location.href = destino;
    }, 300);
}

/**
 * Formata um valor para exibição monetária
 * @param {number} valor - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
function formatarMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

/**
 * Formata uma data para exibição
 * @param {number} timestamp - Timestamp em milissegundos
 * @returns {string} - Data formatada
 */
function formatarData(timestamp) {
    const data = new Date(timestamp);
    return data.toLocaleDateString('pt-BR');
}

/**
 * Ajusta inputs para scroll suave em telas pequenas
 */
function configurarScrollInputs() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        });
    });
} 