// Script para a página inicial
document.addEventListener('DOMContentLoaded', function() {
    // Carregar contadores e estatísticas básicas
    carregarEstatisticasBasicas();
});

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