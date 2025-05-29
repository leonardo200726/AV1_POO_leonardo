
// Armazenamento de disciplinas
let disciplinas = JSON.parse(localStorage.getItem('disciplinas')) || [];
let chart = null;

// Elementos DOM
const disciplinaForm = document.getElementById('disciplinaForm');
const editDisciplinaForm = document.getElementById('editDisciplinaForm');
const disciplinasTableBody = document.getElementById('disciplinasTableBody');
const mediaGeralElement = document.getElementById('mediaGeral');
const mediaGeralBar = document.getElementById('mediaGeralBar');
const totalDisciplinasElement = document.getElementById('totalDisciplinas');
const disciplinasAprovadasElement = document.getElementById('disciplinasAprovadas');
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');

// Funções auxiliares
function calcularMediaPonderada() {
    if (disciplinas.length === 0) return 0;
    
    const somaProdutos = disciplinas.reduce((acc, disciplina) => {
        return acc + (disciplina.nota * disciplina.peso);
    }, 0);
    
    const somaPesos = disciplinas.reduce((acc, disciplina) => {
        return acc + disciplina.peso;
    }, 0);
    
    return somaProdutos / somaPesos;
}

function getStatusClass(nota) {
    if (nota >= 7) return 'status-good';
    if (nota >= 5) return 'status-warning';
    return 'status-danger';
}

function getStatusText(nota) {
    if (nota >= 7) return 'Aprovado';
    if (nota >= 5) return 'Recuperação';
    return 'Reprovado';
}

function contarDisciplinasAprovadas() {
    return disciplinas.filter(disciplina => disciplina.nota >= 7).length;
}

function atualizarEstatisticas() {
    const mediaGeral = calcularMediaPonderada();
    mediaGeralElement.textContent = mediaGeral.toFixed(1);
    mediaGeralBar.style.width = `${(mediaGeral * 10)}%`;
    
    totalDisciplinasElement.textContent = disciplinas.length;
    disciplinasAprovadasElement.textContent = contarDisciplinasAprovadas();
    
    if (mediaGeral >= 7) {
        mediaGeralBar.style.backgroundColor = '#2ecc71';
    } else if (mediaGeral >= 5) {
        mediaGeralBar.style.backgroundColor = '#f1c40f';
    } else {
        mediaGeralBar.style.backgroundColor = '#e74c3c';
    }
}

function renderizarTabela() {
    if (disciplinas.length === 0) {
        disciplinasTableBody.innerHTML = `
            <tr class="no-data">
                <td colspan="5">Nenhuma disciplina cadastrada</td>
            </tr>
        `;
        return;
    }
    
    disciplinasTableBody.innerHTML = '';
    
    disciplinas.forEach((disciplina, index) => {
        const row = document.createElement('tr');
        
        const statusClass = getStatusClass(disciplina.nota);
        const statusText = getStatusText(disciplina.nota);
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${disciplina.cor}; margin-right: 8px;"></div>
                    ${disciplina.nome}
                </div>
            </td>
            <td>${disciplina.nota.toFixed(1)}</td>
            <td>${disciplina.peso}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="actions">
                <button class="btn" onclick="editarDisciplina(${index})">Editar</button>
                <button class="btn btn-danger" onclick="removerDisciplina(${index})">Remover</button>
            </td>
        `;
        
        disciplinasTableBody.appendChild(row);
    });
}

function atualizarGrafico() {
    const ctx = document.getElementById('chartContainer');
    
    // Destruir o gráfico anterior se existir
    if (chart) {
        chart.destroy();
    }
    
    if (disciplinas.length === 0) {
        return;
    }
    
    const labels = disciplinas.map(d => d.nome);
    const notas = disciplinas.map(d => d.nota);
    const cores = disciplinas.map(d => d.cor);
    
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Notas',
                data: notas,
                backgroundColor: cores,
                borderColor: cores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function salvarDados() {
    localStorage.setItem('disciplinas', JSON.stringify(disciplinas));
}

// Função para editar disciplina
function editarDisciplina(index) {
    const disciplina = disciplinas[index];
    
    document.getElementById('editIndex').value = index;
    document.getElementById('editNomeDisciplina').value = disciplina.nome;
    document.getElementById('editNotaDisciplina').value = disciplina.nota;
    document.getElementById('editPesoDisciplina').value = disciplina.peso;
    document.getElementById('editCorDisciplina').value = disciplina.cor;
    
    editModal.style.display = 'flex';
}

// Função para remover disciplina
function removerDisciplina(index) {
    if (confirm('Tem certeza que deseja remover esta disciplina?')) {
        disciplinas.splice(index, 1);
        salvarDados();
        atualizarEstatisticas();
        renderizarTabela();
        atualizarGrafico();
    }
}

// Event Listeners
disciplinaForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nomeDisciplina').value;
    const nota = parseFloat(document.getElementById('notaDisciplina').value);
    const peso = parseInt(document.getElementById('pesoDisciplina').value);
    const cor = document.getElementById('corDisciplina').value;
    
    disciplinas.push({
        nome,
        nota,
        peso,
        cor
    });
    
    salvarDados();
    atualizarEstatisticas();
    renderizarTabela();
    atualizarGrafico();
    
    // Limpar o formulário
    disciplinaForm.reset();
    document.getElementById('corDisciplina').value = '#3498db';
});

editDisciplinaForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const index = parseInt(document.getElementById('editIndex').value);
    const nome = document.getElementById('editNomeDisciplina').value;
    const nota = parseFloat(document.getElementById('editNotaDisciplina').value);
    const peso = parseInt(document.getElementById('editPesoDisciplina').value);
    const cor = document.getElementById('editCorDisciplina').value;
    
    disciplinas[index] = {
        nome,
        nota,
        peso,
        cor
    };
    
    salvarDados();
    atualizarEstatisticas();
    renderizarTabela();
    atualizarGrafico();
    
    // Fechar o modal
    editModal.style.display = 'none';
});

closeEditModal.addEventListener('click', function() {
    editModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
});

// Definindo as funções como globais para acesso no HTML
window.editarDisciplina = editarDisciplina;
window.removerDisciplina = removerDisciplina;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    atualizarEstatisticas();
    renderizarTabela();
    atualizarGrafico();
});
