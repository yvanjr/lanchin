/**
 * Classes de modelo e funções de gerenciamento de dados
 */

/**
 * Gerenciador de blocos de vendas
 */
const BlockManager = {
    /**
     * Retorna todos os blocos salvos
     * @returns {Array} - Lista de blocos
     */
    getAllBlocks: function() {
        return JSON.parse(localStorage.getItem('blocos') || '[]');
    },
    
    /**
     * Salva todos os blocos
     * @param {Array} blocos - Lista de blocos para salvar
     */
    saveAllBlocks: function(blocos) {
        localStorage.setItem('blocos', JSON.stringify(blocos));
    },
    
    /**
     * Obtém um bloco pelo ID
     * @param {string} id - ID do bloco
     * @returns {Object|null} - Bloco encontrado ou null
     */
    getBlockById: function(id) {
        const blocos = this.getAllBlocks();
        return blocos.find(b => b.id === id) || null;
    },
    
    /**
     * Salva um bloco (novo ou existente)
     * @param {Object} bloco - Dados do bloco
     */
    saveBlock: function(bloco) {
        const blocos = this.getAllBlocks();
        const index = blocos.findIndex(b => b.id === bloco.id);
        
        if (index !== -1) {
            blocos[index] = bloco;
        } else {
            blocos.push(bloco);
        }
        
        this.saveAllBlocks(blocos);
    },
    
    /**
     * Remove um bloco pelo ID
     * @param {string} id - ID do bloco
     * @returns {boolean} - True se removido com sucesso
     */
    removeBlock: function(id) {
        const blocos = this.getAllBlocks();
        const filteredBlocks = blocos.filter(b => b.id !== id);
        
        if (filteredBlocks.length !== blocos.length) {
            this.saveAllBlocks(filteredBlocks);
            return true;
        }
        
        return false;
    },
    
    /**
     * Obtém o bloco atual selecionado
     * @returns {Object|null} - Bloco atual
     */
    getCurrentBlock: function() {
        const blocoId = localStorage.getItem('blocoAtual');
        if (!blocoId) return null;
        
        return this.getBlockById(blocoId);
    },
    
    /**
     * Define o ID do bloco atual
     * @param {string} id - ID do bloco
     */
    setCurrentBlockId: function(id) {
        localStorage.setItem('blocoAtual', id);
    },
    
    /**
     * Define o modo de edição
     * @param {string} mode - Modo de edição ('novo' ou 'editar')
     */
    setEditMode: function(mode) {
        localStorage.setItem('modoEdicao', mode);
    },
    
    /**
     * Retorna o modo de edição atual
     * @returns {string|null} - Modo de edição
     */
    getEditMode: function() {
        return localStorage.getItem('modoEdicao');
    },
    
    /**
     * Limpa o modo de edição
     */
    clearEditMode: function() {
        localStorage.removeItem('modoEdicao');
    }
};

/**
 * Gerenciador de vendas
 */
const SalesManager = {
    /**
     * Adiciona uma venda a um bloco
     * @param {string} blocoId - ID do bloco
     * @param {Object} venda - Dados da venda
     * @returns {boolean} - True se adicionado com sucesso
     */
    addSale: function(blocoId, venda) {
        const bloco = BlockManager.getBlockById(blocoId);
        if (!bloco) return false;
        
        if (!bloco.vendas) bloco.vendas = [];
        bloco.vendas.push(venda);
        
        BlockManager.saveBlock(bloco);
        return true;
    },
    
    /**
     * Atualiza uma venda existente
     * @param {string} blocoId - ID do bloco
     * @param {number} vendaIndex - Índice da venda
     * @param {Object} venda - Novos dados da venda
     * @returns {boolean} - True se atualizado com sucesso
     */
    updateSale: function(blocoId, vendaIndex, venda) {
        const bloco = BlockManager.getBlockById(blocoId);
        if (!bloco || !bloco.vendas || vendaIndex >= bloco.vendas.length) return false;
        
        bloco.vendas[vendaIndex] = venda;
        BlockManager.saveBlock(bloco);
        return true;
    },
    
    /**
     * Remove uma venda
     * @param {string} blocoId - ID do bloco
     * @param {number} vendaIndex - Índice da venda
     * @returns {boolean} - True se removido com sucesso
     */
    removeSale: function(blocoId, vendaIndex) {
        const bloco = BlockManager.getBlockById(blocoId);
        if (!bloco || !bloco.vendas || vendaIndex >= bloco.vendas.length) return false;
        
        bloco.vendas.splice(vendaIndex, 1);
        BlockManager.saveBlock(bloco);
        return true;
    },
    
    /**
     * Atualiza o status de pagamento de uma venda
     * @param {string} blocoId - ID do bloco
     * @param {number} vendaIndex - Índice da venda
     * @param {boolean} pago - Status de pagamento
     * @param {string} formaPagamento - Forma de pagamento (opcional)
     * @returns {boolean} - True se atualizado com sucesso
     */
    updatePaymentStatus: function(blocoId, vendaIndex, pago, formaPagamento = null) {
        const bloco = BlockManager.getBlockById(blocoId);
        if (!bloco || !bloco.vendas || vendaIndex >= bloco.vendas.length) return false;
        
        bloco.vendas[vendaIndex].pago = pago;
        if (formaPagamento) {
            bloco.vendas[vendaIndex].formaPagamento = formaPagamento;
        }
        
        BlockManager.saveBlock(bloco);
        return true;
    },
    
    /**
     * Obtém todas as vendas de um bloco
     * @param {string} blocoId - ID do bloco
     * @returns {Array} - Lista de vendas
     */
    getSales: function(blocoId) {
        const bloco = BlockManager.getBlockById(blocoId);
        if (!bloco) return [];
        
        return bloco.vendas || [];
    },
    
    /**
     * Calcula os totais de vendas de um bloco
     * @param {string} blocoId - ID do bloco
     * @returns {Object} - Objeto com os totais
     */
    calculateTotals: function(blocoId) {
        const bloco = BlockManager.getBlockById(blocoId);
        if (!bloco) return { totalVendido: 0, totalRecebido: 0, totalReceber: 0 };
        
        const vendas = bloco.vendas || [];
        
        const totalVendido = vendas.reduce((total, venda) => {
            return total + (venda.valor * venda.quantidade);
        }, 0);
        
        const totalRecebido = vendas.reduce((total, venda) => {
            if (venda.pago) {
                return total + (venda.valor * venda.quantidade);
            }
            return total;
        }, 0);
        
        const totalReceber = totalVendido - totalRecebido;
        
        return {
            totalVendido,
            totalRecebido,
            totalReceber
        };
    }
}; 