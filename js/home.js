// Script para a página inicial
document.addEventListener('DOMContentLoaded', function() {
    // Carregar contadores e estatísticas básicas
    carregarEstatisticasBasicas();
    
    // Configurar detecção de orientação para melhor visualização em dispositivos móveis
    adjustForOrientation();
    
    // Executar no carregamento e quando houver mudança de orientação
    window.addEventListener('resize', adjustForOrientation);
    window.addEventListener('orientationchange', adjustForOrientation);
});

// Detecção de orientação para melhor visualização em dispositivos móveis
function adjustForOrientation() {
    const container = document.querySelector('.welcome-container');
    
    if (window.matchMedia("(orientation: landscape) and (max-height: 500px)").matches) {
        container.style.flexDirection = 'row';
    } else if (window.innerWidth < 900) {
        container.style.flexDirection = 'column';
    } else {
        container.style.flexDirection = 'row';
    }
}

function carregarEstatisticasBasicas() {
    // Carregar blocos do localStorage
    const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    
    // Dados básicos que serão exibidos futuramente em gráficos
    const totalBlocos = blocos.length;
    const totalVendas = blocos.reduce((total, bloco) => total + (bloco.vendas?.length || 0), 0);
    const vendasPagas = blocos.reduce((total, bloco) => {
        return total + (bloco.vendas?.filter(v => v.pago)?.length || 0);
    }, 0);
    const vendasPendentes = totalVendas - vendasPagas;
    
    // Calcular valor total vendido
    const valorTotal = blocos.reduce((total, bloco) => {
        const vendas = bloco.vendas || [];
        return total + vendas.reduce((subTotal, venda) => {
            return subTotal + (venda.valor * venda.quantidade);
        }, 0);
    }, 0);
    
    // Registrar no console para desenvolvimento - 
    // futuramente isso será mostrado em gráficos na interface
    console.log('Estatísticas básicas para futuros gráficos:');
    console.log(`Total de blocos: ${totalBlocos}`);
    console.log(`Total de vendas: ${totalVendas}`);
    console.log(`Vendas pagas: ${vendasPagas}`);
    console.log(`Vendas pendentes: ${vendasPendentes}`);
    console.log(`Valor total vendido: R$ ${valorTotal.toFixed(2)}`);
} 