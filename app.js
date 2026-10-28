import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// SUAS CHAVES DO FIREBASE CONSOLE
const firebaseConfig = {
   apiKey: "AIzaSyB6Nnu6x0vF13CgBgiFMBoHogTessmtbEk",
  authDomain: "minhas-despesas-5d61f.firebaseapp.com",
  projectId: "minhas-despesas-5d61f",
  storageBucket: "minhas-despesas-5d61f.firebasestorage.app",
  messagingSenderId: "943467909687",
  appId: "1:943467909687:web:901cf0997ba5ed636a65b2",
  measurementId: "G-TL6JB2FMDT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ID fixo da sala para você e sua esposa compartilharem o mesmo banco
const SALA_ID = "orcamento-familia-sunna";

let dados = {
    abaAtiva: 'despesas',
    itens: [
        { id: 1, tipo: 'receita', nome: 'Salário Tarcísio', valor: 2500.00, status: 'pago' },
        { id: 2, tipo: 'receita', nome: 'Salário Lilianne', valor: 2400.00, status: 'pago' },
        { id: 3, tipo: 'receita', nome: 'Auxílio Lilianne', valor: 580.00, status: 'pago' },
        { id: 4, tipo: 'despesa', nome: 'Cartão', valor: 4500.00, status: 'pendente' },
        { id: 5, tipo: 'despesa', nome: 'Água', valor: 120.00, status: 'pendente' },
        { id: 6, tipo: 'despesa', nome: 'Luz', valor: 220.00, status: 'pendente' },
        { id: 7, tipo: 'despesa', nome: 'Apartamento', valor: 745.00, status: 'pendente' },
        { id: 8, tipo: 'despesa', nome: 'Internet', valor: 110.00, status: 'pendente' },
        { id: 9, tipo: 'despesa', nome: 'Telefone Júnior', valor: 51.00, status: 'pendente' },
        { id: 10, tipo: 'despesa', nome: 'Telefone Lili', valor: 55.00, status: 'pendente' },
        { id: 11, tipo: 'despesa', nome: 'Lidiane', valor: 180.00, status: 'pendente' },
        { id: 12, tipo: 'despesa', nome: 'Shopee Júnior', valor: 125.00, status: 'pendente' },
        { id: 13, tipo: 'despesa', nome: 'Cartão Riachuelo', valor: 98.65, status: 'pendente' },
        { id: 14, tipo: 'despesa', nome: 'Negociação Nubank Júnior', valor: 108.00, status: 'pendente' },
        { id: 15, tipo: 'despesa', nome: 'Plano de saúde', valor: 366.00, status: 'pago' },
        { id: 16, tipo: 'despesa', nome: 'Carol', valor: 300.00, status: 'pendente' }
    ]
};

// Autentica de forma 100% invisível sem pedir login
signInAnonymously(auth).then(() => {
    const docRef = doc(db, "orcamentos_compartilhados", SALA_ID);
    
    // Escuta alterações em tempo real do banco de dados no Firebase
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            dados = docSnap.data();
            atualizarUI();
        } else {
            // Se for o primeiro acesso, cria o banco com os dados iniciais
            salvarNoFirebase();
        }
    });
}).catch(err => console.error("Erro na autenticação anônima:", err));

async function salvarNoFirebase() {
    try {
        await setDoc(doc(db, "orcamentos_compartilhados", SALA_ID), dados);
    } catch (e) {
        console.error("Erro ao salvar no Firebase:", e);
    }
}

function formatarMoeda(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function atualizarUI() {
    let totalRec = 0, totalGas = 0, gasPago = 0, gasPendente = 0;

    dados.itens.forEach(item => {
        if (item.tipo === 'receita') totalRec += item.valor;
        else {
            totalGas += item.valor;
            if (item.status === 'pago') gasPago += item.valor;
            else gasPendente += item.valor;
        }
    });

    const saldo = totalRec - totalGas;

    document.getElementById('totalReceitas').innerText = formatarMoeda(totalRec);
    document.getElementById('totalGastos').innerText = formatarMoeda(totalGas);
    document.getElementById('valPago').innerText = formatarMoeda(gasPago);
    document.getElementById('valPendente').innerText = formatarMoeda(gasPendente);

    const elSaldo = document.getElementById('saldoTotal');
    const elStatus = document.getElementById('saldoStatus');
    elSaldo.innerText = formatarMoeda(saldo);

    if (saldo >= 0) {
        elSaldo.className = "text-3xl font-extrabold mt-1 tracking-tight text-emerald-400";
        elStatus.innerText = "Superávit no período";
        elStatus.className = "text-xs mt-1 text-emerald-200 font-medium";
    } else {
        elSaldo.className = "text-3xl font-extrabold mt-1 tracking-tight text-white";
        elStatus.innerText = "As despesas superam as receitas";
        elStatus.className = "text-xs mt-1 text-red-300 font-medium";
    }

    const pctPago = totalGas > 0 ? (gasPago / totalGas) * 100 : 0;
    document.getElementById('barraPago').style.width = `${pctPago}%`;
    document.getElementById('barraPendente').style.width = `${100 - pctPago}%`;

    renderizarLista();
}

window.switchTab = function(aba) {
    dados.abaAtiva = aba;
    const btnD = document.getElementById('btnTabDespesas');
    const btnR = document.getElementById('btnTabReceitas');
    if (aba === 'despesas') {
        btnD.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-slate-900 shadow-sm transition";
        btnR.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 transition";
    } else {
        btnR.className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-slate-900 shadow-sm transition";
        btnD.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 transition";
    }
    renderizarLista();
};

function renderizarLista() {
    const lista = document.getElementById('listaTransacoes');
    lista.innerHTML = '';

    const filtrados = dados.itens.filter(i => dados.abaAtiva === 'despesas' ? i.tipo === 'despesa' : i.tipo === 'receita');

    if (filtrados.length === 0) {
        lista.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs">Nenhum registro encontrado.</div>`;
        return;
    }

    filtrados.forEach(item => {
        const div = document.createElement('div');
        div.className = "bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between";
        
        const isPago = item.status === 'pago';
        const badgeColor = isPago ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200';
        const statusText = item.tipo === 'despesa' ? (isPago ? 'Pago' : 'A Pagar') : (isPago ? 'Recebido' : 'Pendente');

        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <button onclick="alternarStatus(${item.id})" class="w-6 h-6 rounded-lg border-2 ${isPago ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'} flex items-center justify-center text-xs font-bold transition">
                    ${isPago ? '✓' : ''}
                </button>
                <div>
                    <h4 class="text-sm font-bold text-slate-800">${item.nome}</h4>
                    <span class="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-semibold rounded-full border ${badgeColor}">${statusText}</span>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <span class="text-sm font-extrabold ${item.tipo === 'receita' ? 'text-emerald-600' : 'text-slate-900'}">${formatarMoeda(item.valor)}</span>
                <button onclick="removerItem(${item.id})" class="text-slate-300 hover:text-rose-500 text-xs font-bold">&times;</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

window.alternarStatus = function(id) {
    const item = dados.itens.find(i => i.id === id);
    if (item) {
        item.status = item.status === 'pago' ? 'pendente' : 'pago';
        salvarNoFirebase();
    }
};

window.removerItem = function(id) {
    if (confirm('Deseja excluir este item?')) {
        dados.itens = dados.itens.filter(i => i.id !== id);
        salvarNoFirebase();
    }
};

window.openAddModal = function() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal').classList.add('flex');
};

window.closeModal = function() {
    document.getElementById('modal').classList.remove('flex');
    document.getElementById('modal').classList.add('hidden');
};

window.salvarTransacao = function(e) {
    e.preventDefault();
    const novoItem = {
        id: Date.now(),
        tipo: document.getElementById('tipo').value,
        nome: document.getElementById('descricao').value,
        valor: parseFloat(document.getElementById('valor').value),
        status: document.getElementById('status').value
    };
    dados.itens.push(novoItem);
    salvarNoFirebase();
    closeModal();
};
