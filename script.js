// script.js - ADMCHECK MOBILE

// ---------- ESTRUTURA FIXA DO CHECKLIST ----------
const estruturaChecklist = [
  {
    categoria: "🔹 DOCUMENTOS OBRIGATÓRIOS",
    itens: [
      "Currículo atualizado",
      "01 Foto 3x4",
      "CTPS Digital",
      "RG – Frente e Verso",
      "CPF",
      "Título de Eleitor",
      "Comprovante de Residência Atual",
      "Certificado de Dispensa de Incorporação (Reservista)",
      "Cartão PIS + Consulta de Qualificação Cadastral",
      "Comprovante de Situação Cadastral do CPF",
      "Atestado de Antecedentes Criminais (Original)",
      "Conta Bancária – Bradesco ou Next",
      "Certificados de Cursos Profissionalizantes",
      "CNH (quando aplicável à função)",
      "Exame Toxicológico (para função motorista)",
      "Curso de Direção Defensiva (para função motorista)",
      "Curso de Primeiros Socorros (para função motorista)",
      "Cartão de Vacina",
      "Atestado Médico Admissional"
    ]
  },
  {
    categoria: "🔹 DOCUMENTOS OPCIONAIS / CONDICIONAIS",
    subcategorias: [
      {
        nome: "📚 Escolaridade",
        itens: ["Ensino Fundamental", "Ensino Médio", "Ensino Superior", "Pós-Graduação", "Mestrado", "Doutorado"]
      },
      {
        nome: "🏛 Registro Profissional",
        itens: ["Registro Profissional (quando profissão regulamentada)", "Registro Profissional Pendente"]
      },
      {
        nome: "👨‍👩‍👧‍👦 Dependentes",
        itens: ["RG e CPF do Cônjuge", "Certidão de Casamento / União Estável", "RG e CPF dos Filhos", "Cartão de Vacina dos Filhos", "Declaração Escolar dos Filhos"]
      }
    ]
  }
];

// UTIL: gera objeto checklist com todos false
function criarChecklistVazio() {
  const checklist = {};
  estruturaChecklist.forEach(sec => {
    if (sec.itens) {
      sec.itens.forEach(item => checklist[item] = false);
    }
    if (sec.subcategorias) {
      sec.subcategorias.forEach(sub => sub.itens.forEach(item => checklist[item] = false));
    }
  });
  return checklist;
}

// localStorage
let funcionarios = JSON.parse(localStorage.getItem('admcheck_func')) || {};
let funcionarioAtivoId = null;

// ----- renderizar sidebar horizontal -----
function renderizarSidebar() {
  const container = document.getElementById('lista-funcionarios');
  const countSpan = document.getElementById('func-count');
  if (!container) return;

  const ids = Object.keys(funcionarios);
  if (countSpan) countSpan.innerText = ids.length;

  if (ids.length === 0) {
    container.innerHTML = '<div class="item-funcionario" style="min-width:auto;opacity:0.6;">➕ Adicione um funcionário</div>';
    return;
  }

  let html = '';
  ids.forEach(id => {
    const f = funcionarios[id];
    const totalItens = Object.keys(f.checklist).length;
    const marcados = Object.values(f.checklist).filter(v => v === true).length;
    let statusClass = 'status-cinza';
    if (totalItens > 0) {
      if (marcados === totalItens) statusClass = 'status-verde';
      else if (marcados > 0) statusClass = 'status-amarelo';
    }
    html += `
      <div class="item-funcionario" data-id="${id}">
        <div class="status-badge ${statusClass}"></div>
        <div class="info-func" onclick="carregarFuncionario('${id}')">
          <div class="matricula-item">${f.matricula}</div>
          <div class="nome-item">${f.nome}</div>
        </div>
        <button class="btn-excluir-item" onclick="abrirModalExcluir('${id}')">✕</button>
      </div>
    `;
  });
  container.innerHTML = html;
}

// calcular status apenas para badges (já usado no render)
function calcularStatus(checklist) {
  const valores = Object.values(checklist);
  if (valores.length === 0) return 'cinza';
  const marcados = valores.filter(v => v).length;
  if (marcados === 0) return 'cinza';
  if (marcados === valores.length) return 'verde';
  return 'amarelo';
}

// renderiza checklist na área principal
function renderizarChecklist(func) {
  const container = document.getElementById('checklist-container');
  if (!func) {
    container.innerHTML = '<div class="categoria" style="opacity:0.5;">⬅ Selecione ou crie um funcionário</div>';
    return;
  }

  let html = '';
  estruturaChecklist.forEach(sec => {
    html += `<div class="categoria">${sec.categoria}</div>`;
    if (sec.itens) {
      sec.itens.forEach(item => {
        const checked = func.checklist[item] ? 'checked' : '';
        const idCheck = `cb-${item.replace(/[^a-zA-Z0-9]/g, '')}`;
        html += `<div class="item-checklist"><input type="checkbox" id="${idCheck}" data-item="${item}" ${checked}><label for="${idCheck}">${item}</label></div>`;
      });
    }
    if (sec.subcategorias) {
      sec.subcategorias.forEach(sub => {
        html += `<div class="subcategoria">${sub.nome}</div>`;
        sub.itens.forEach(item => {
          const checked = func.checklist[item] ? 'checked' : '';
          const idCheck = `cb-${item.replace(/[^a-zA-Z0-9]/g, '')}`;
          html += `<div class="item-checklist"><input type="checkbox" id="${idCheck}" data-item="${item}" ${checked}><label for="${idCheck}">${item}</label></div>`;
        });
      });
    }
  });
  container.innerHTML = html;

  // atrelar eventos de mudança para atualizar status visual em tempo real (salvar apenas no botão salvar)
  document.querySelectorAll('.item-checklist input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', function() {
      // apenas marca visualmente, sem persistir ainda
      if (funcionarioAtivoId && funcionarios[funcionarioAtivoId]) {
        const item = this.dataset.item;
        funcionarios[funcionarioAtivoId].checklist[item] = this.checked;
        // atualiza sidebar (status)
        renderizarSidebar();
      }
    });
  });
}

// carregar funcionário na interface
window.carregarFuncionario = function(id) {
  const func = funcionarios[id];
  if (!func) return;
  funcionarioAtivoId = id;
  document.getElementById('input-matricula').value = func.matricula;
  document.getElementById('input-nome').value = func.nome;
  renderizarChecklist(func);
  renderizarSidebar();
};

// salvar estado atual (checkboxes) no localStorage
function salvarFuncionarioAtivo() {
  if (!funcionarioAtivoId || !funcionarios[funcionarioAtivoId]) return false;
  // checkboxes atuais já atualizaram o objeto via evento change, mas garantimos:
  document.querySelectorAll('.item-checklist input[type=checkbox]').forEach(cb => {
    const item = cb.dataset.item;
    if (item) funcionarios[funcionarioAtivoId].checklist[item] = cb.checked;
  });
  localStorage.setItem('admcheck_func', JSON.stringify(funcionarios));
  renderizarSidebar();
  return true;
}

// criar novo
document.getElementById('btn-criar').addEventListener('click', () => {
  const mat = document.getElementById('input-matricula').value.trim();
  const nome = document.getElementById('input-nome').value.trim();
  if (!mat || !nome) { alert('Preencha matrícula e nome'); return; }

  const id = Date.now().toString();
  funcionarios[id] = {
    matricula: mat,
    nome: nome,
    checklist: criarChecklistVazio()
  };
  localStorage.setItem('admcheck_func', JSON.stringify(funcionarios));
  funcionarioAtivoId = id;
  carregarFuncionario(id);
});

// salvar
document.getElementById('btn-salvar').addEventListener('click', () => {
  if (salvarFuncionarioAtivo()) {
    // toast simples
    const t = document.getElementById('toast');
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 1500);
  } else alert('Nenhum funcionário ativo');
});

// carregar (o mesmo que clicar no item)
document.getElementById('btn-carregar').addEventListener('click', () => {
  const mat = document.getElementById('input-matricula').value.trim();
  const nome = document.getElementById('input-nome').value.trim();
  // tenta achar pelos dados atuais
  const found = Object.entries(funcionarios).find(([_, f]) => f.matricula === mat && f.nome === nome);
  if (found) {
    carregarFuncionario(found[0]);
  } else alert('Funcionário não encontrado com essa matrícula/nome');
});

// exportar txt
document.getElementById('btn-exportar').addEventListener('click', () => {
  if (!funcionarioAtivoId || !funcionarios[funcionarioAtivoId]) { alert('Selecione um funcionário'); return; }
  const f = funcionarios[funcionarioAtivoId];
  let texto = `CHECKLIST ADMISSIONAL\nMatrícula: ${f.matricula}\nNome: ${f.nome}\n\n`;

  estruturaChecklist.forEach(sec => {
    texto += `${sec.categoria}:\n`;
    if (sec.itens) {
      sec.itens.forEach(item => {
        const marcado = f.checklist[item] ? '[X]' : '[ ]';
        texto += `${marcado} ${item}\n`;
      });
    }
    if (sec.subcategorias) {
      sec.subcategorias.forEach(sub => {
        texto += `  ${sub.nome}:\n`;
        sub.itens.forEach(item => {
          const marcado = f.checklist[item] ? '[X]' : '[ ]';
          texto += `    ${marcado} ${item}\n`;
        });
      });
    }
  });

  const blob = new Blob([texto], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${f.matricula}_${f.nome}.txt`.replace(/\s/g, '_');
  a.click();
});

// copiar relatório
document.getElementById('btn-copiar').addEventListener('click', async () => {
  if (!funcionarioAtivoId || !funcionarios[funcionarioAtivoId]) { alert('Selecione um funcionário'); return; }
  const f = funcionarios[funcionarioAtivoId];
  let texto = `CHECKLIST ADMISSIONAL\nMatrícula: ${f.matricula}\nNome: ${f.nome}\n\n`;

  estruturaChecklist.forEach(sec => {
    texto += `${sec.categoria}:\n`;
    if (sec.itens) {
      sec.itens.forEach(item => {
        texto += `${f.checklist[item] ? '[X]' : '[ ]'} ${item}\n`;
      });
    }
    if (sec.subcategorias) {
      sec.subcategorias.forEach(sub => {
        texto += `  ${sub.nome}:\n`;
        sub.itens.forEach(item => {
          texto += `    ${f.checklist[item] ? '[X]' : '[ ]'} ${item}\n`;
        });
      });
    }
  });

  try {
    await navigator.clipboard.writeText(texto);
    document.getElementById('toast').classList.remove('hidden');
    setTimeout(() => document.getElementById('toast').classList.add('hidden'), 1500);
  } catch {
    alert('Não foi possível copiar');
  }
});

// MODAL EXCLUSAO
let excluirId = null;
window.abrirModalExcluir = function(id) {
  excluirId = id;
  document.getElementById('modal-overlay').classList.remove('hidden');
};

document.getElementById('btn-cancelar-excluir').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden');
  excluirId = null;
});

document.getElementById('btn-confirmar-excluir').addEventListener('click', () => {
  if (excluirId && funcionarios[excluirId]) {
    delete funcionarios[excluirId];
    localStorage.setItem('admcheck_func', JSON.stringify(funcionarios));
    if (funcionarioAtivoId === excluirId) {
      funcionarioAtivoId = null;
      document.getElementById('input-matricula').value = '';
      document.getElementById('input-nome').value = '';
      document.getElementById('checklist-container').innerHTML = '<div class="categoria" style="opacity:0.5;">⬅ Selecione ou crie um funcionário</div>';
    }
    renderizarSidebar();
  }
  document.getElementById('modal-overlay').classList.add('hidden');
  excluirId = null;
});

// Fechar modal com ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('modal-overlay').classList.add('hidden');
    excluirId = null;
  }
});

// inicialização
renderizarSidebar();
if (Object.keys(funcionarios).length > 0) {
  const primeiroId = Object.keys(funcionarios)[0];
  carregarFuncionario(primeiroId);
} else {
  document.getElementById('checklist-container').innerHTML = '<div class="categoria" style="opacity:0.5;">👆 Crie um funcionário para começar</div>';
}
