// Carregar dados existentes se estiver no modo de edição
window.onload = function() {
    const modoEdicao = localStorage.getItem('modoEdicao');
    const blocoId = localStorage.getItem('blocoAtual');
    
    // Adicionar listener para mudança no tipo de custo
    document.getElementById('tipoCusto').addEventListener('change', toggleCamposCusto);
    
    if (modoEdicao === 'editar') {
        const blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
        const blocoAtual = blocos.find(b => b.id === blocoId);
        
        if (blocoAtual) {
            document.getElementById('nomeLanche').value = blocoAtual.nomeLanche.toUpperCase();
            document.getElementById('tipoCusto').value = blocoAtual.tipoCusto;
            
            if (blocoAtual.tipoCusto === 'unitario') {
                document.getElementById('custoUnitario').value = blocoAtual.custoUnitario;
                document.getElementById('quantidadeUnitario').value = blocoAtual.quantidade;
            } else {
                document.getElementById('custoTotalInsumos').value = blocoAtual.custoTotalInsumos;
                document.getElementById('quantidadeEstimada').value = blocoAtual.quantidade;
            }
            
            document.getElementById('valorVenda').value = blocoAtual.valorVenda;
            document.getElementById('valorBebida').value = blocoAtual.valorBebida;
            
            // Atualizar título da página
            document.getElementById('titulo-pagina').textContent = 'Editar Configurações do Bloco';
            document.getElementById('btn-salvar').textContent = 'Salvar Alterações';
            
            // Mostrar campos corretos
            toggleCamposCusto();
        }
    }
    
    // Adicionar listeners para atualização dos cálculos
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', atualizarCalculos);
    });
    
    atualizarCalculos();
};

function toggleCamposCusto() {
    const tipoCusto = document.getElementById('tipoCusto').value;
    const camposUnitario = document.getElementById('campos-custo-unitario');
    const camposTotal = document.getElementById('campos-custo-total');
    
    if (tipoCusto === 'unitario') {
        camposUnitario.style.display = 'block';
        camposTotal.style.display = 'none';
        document.getElementById('custoUnitario').required = true;
        document.getElementById('quantidadeUnitario').required = true;
        document.getElementById('custoTotalInsumos').required = false;
        document.getElementById('quantidadeEstimada').required = false;
    } else {
        camposUnitario.style.display = 'none';
        camposTotal.style.display = 'block';
        document.getElementById('custoUnitario').required = false;
        document.getElementById('quantidadeUnitario').required = false;
        document.getElementById('custoTotalInsumos').required = true;
        document.getElementById('quantidadeEstimada').required = true;
    }
    
    atualizarCalculos();
}

function atualizarCalculos() {
    const tipoCusto = document.getElementById('tipoCusto').value;
    let custoTotal, quantidade, custoUnitario;
    
    if (tipoCusto === 'unitario') {
        custoUnitario = parseFloat(document.getElementById('custoUnitario').value) || 0;
        quantidade = parseInt(document.getElementById('quantidadeUnitario').value) || 0;
        custoTotal = custoUnitario * quantidade;
    } else {
        custoTotal = parseFloat(document.getElementById('custoTotalInsumos').value) || 0;
        quantidade = parseInt(document.getElementById('quantidadeEstimada').value) || 0;
        custoUnitario = quantidade > 0 ? custoTotal / quantidade : 0;
    }
    
    const valorVenda = parseFloat(document.getElementById('valorVenda').value) || 0;
    const valorPotencial = valorVenda * quantidade;
    const lucroPotencial = valorPotencial - custoTotal;
    
    document.getElementById('custoTotalResumo').textContent = custoTotal.toFixed(2);
    document.getElementById('custoUnitarioResumo').textContent = custoUnitario.toFixed(2);
    document.getElementById('valorPotencial').textContent = valorPotencial.toFixed(2);
    document.getElementById('lucroPotencial').textContent = lucroPotencial.toFixed(2);
}

// Salvar configurações do bloco
document.getElementById('config-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const blocoId = localStorage.getItem('blocoAtual');
    const modoEdicao = localStorage.getItem('modoEdicao');
    const tipoCusto = document.getElementById('tipoCusto').value;
    
    const blocoConfig = {
        id: blocoId,
        nomeLanche: document.getElementById('nomeLanche').value.toUpperCase(),
        tipoCusto: tipoCusto,
        valorVenda: parseFloat(document.getElementById('valorVenda').value),
        valorBebida: parseFloat(document.getElementById('valorBebida').value)
    };
    
    // Adicionar campos específicos do tipo de custo
    if (tipoCusto === 'unitario') {
        blocoConfig.custoUnitario = parseFloat(document.getElementById('custoUnitario').value);
        blocoConfig.quantidade = parseInt(document.getElementById('quantidadeUnitario').value);
        blocoConfig.custoTotal = blocoConfig.custoUnitario * blocoConfig.quantidade;
    } else {
        blocoConfig.custoTotalInsumos = parseFloat(document.getElementById('custoTotalInsumos').value);
        blocoConfig.quantidade = parseInt(document.getElementById('quantidadeEstimada').value);
        blocoConfig.custoUnitario = blocoConfig.custoTotalInsumos / blocoConfig.quantidade;
        blocoConfig.custoTotal = blocoConfig.custoTotalInsumos;
    }
    
    let blocos = JSON.parse(localStorage.getItem('blocos') || '[]');
    
    if (modoEdicao === 'editar') {
        // Modo edição: atualizar bloco existente
        const blocoIndex = blocos.findIndex(b => b.id === blocoId);
        if (blocoIndex !== -1) {
            // Preservar as vendas existentes
            blocoConfig.vendas = blocos[blocoIndex].vendas;
            blocos[blocoIndex] = blocoConfig;
        }
    } else {
        // Modo novo: adicionar novo bloco
        blocoConfig.vendas = [];
        blocos.push(blocoConfig);
    }
    
    localStorage.setItem('blocos', JSON.stringify(blocos));
    
    // Limpar modo de edição
    localStorage.removeItem('modoEdicao');
    
    // Redirecionar para a página de vendas
    window.location.href = 'vendas.html';
});
