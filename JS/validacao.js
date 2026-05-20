/* 

  PROJETO ACADÊMICO - VALIDAÇÃO DE FORMULÁRIO CLIENT-SIDE
  ATENÇÃO: Este código NÃO envia, NÃO armazena e NÃO coleta dados.
  
    - Todos os dados ficam APENAS no navegador do usuário
    - Validação feita localmente para fins didáticos
    - Nenhuma informação é enviada para servidor
    - alert() final é apenas demonstração visual
  
  LGPD: 100% seguro. Dados não saem da máquina.

*/

/* 
    ===== VALIDAÇÃO DO FORMULÁRIO =====
    Este arquivo contém TODA a lógica de validação
    Separado do HTML e CSS (padrão da indústria)
    
    O que faz:
    - Valida campos em tempo real (enquanto digita)
    - Formata CPF, CEP, telefone automático
    - Mostra mensagens de erro
    - Impede envio se tiver erro
*/

// ===== PEGA O FORM =====
// document.getElementById: pega um elemento pelo ID
const form = document.getElementById('formCadastro');

// ===== OBJETO COM REGRAS DE VALIDAÇÃO =====
// Cada chave é um tipo de validação (usada no data-validate)
const validacoes = {
    /* 
        nome: deve ter pelo menos 3 caracteres
        /^[a-záàâãéèêíïóôõöúçñ\s]+$/i: regex que permite só letras e espaços
    */
   nome: {
    validar: (valor) => {
        return valor.trim().length >= 3 && /^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(valor);
      },
      mensagem: 'Nome deve ter pelo menos 3 caracteres (apenas letras)'
    },
    /* CPF: valida o algoritmo do CPF (muito importante!) */
    cpf: {
        validar: (valor) => {
            // Remove caracteres especiais (pontos e hífen)
            const cpf = valor.replace(/\D/g, '');

            // CPF deve ter 11 dígitos
            if (cpf.length !==11) return false;

            // Rejeita CPFs conhecidos como inválidos (111.111.111-11, etc)
            if (/^(\d)\1{10}$/.test(cpf)) return false; //Rejeita 111.111.111-11, 22222222222, etc. CPF tudo igual é inválido.
            /*^       = Começa aqui
              (\d)    = Captura 1 dígito. Ex: 1
              \1{10}  = Repete o dígito capturado 10x. Ex: 1111111111
              $       = Termina aqui
              .test() = Testa se bate*/

            // Validação do primeiro dígito
            let soma = 0;
            for (let i = 0; i < 9; i++) {
                soma += parseInt(cpf[i]) * (10 - i);
            }
            let resto = soma % 11;
            let dv1 = resto < 2 ? 0 : 11 - resto;

            if (parseInt(cpf[9]) !== dv1) return false;

            // Validação do segundo dígito
            soma = 0;
            for (let i = 0; i < 10; i++) {
                soma += parseInt(cpf[i]) * (11 - i);
            }
            resto = soma % 11;
            let dv2 = resto < 2 ? 0 : 11 - resto;

            return parseInt(cpf[10]) === dv2;
        },
        mensagem: 'CPF inválido'
    },
    /* RG: simples, só verifica se não tá vazio */
    rg: {
        validar: (valor) => valor.trim().length > 0,
        mensagem: 'RG é obrigatório!'
    },

    /* Data: verifica se é maior de 18 anos */
    data: {
        validar: (valor) => {
            if (!valor) return true; // opcional

            const dataNascimento = new Date(valor);
            const hoje = new Date(); // Pega data atual
            let idade = hoje.getFullYear() - dataNascimento.getFullYear(); // Pega o ANO. Ex: 2026
            const mes = hoje.getMonth() - dataNascimento.getMonth(); // Pega o MÊS, mas começa em 0! Jan=0, Dez=11
            
            if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) { // Pega o DIA do mês. 1 a 31
                idade--;
            }

            return idade >= 18;
        },
        mensagem: 'Deve ser maior de 18 anos!'
    },

    endereco: {
        validar: (valor) => valor.trim().length > 0, //.trim()Tira espaço do início e fim
        mensagem: 'Número é obrigatório!'
    },
    
    bairro: {
        validar: (valor) => valor.trim().length >= 3,
        mensagem: 'Bairro deve ter pelo menos 3 caracteres!'
    },

    cidade: {
        validar: (valor) => valor.trim().length >= 3,
        mensagem: 'Cidade deve ter pelo menos 3 caracteres!'
    },

    estado: {
        validar: (valor) => valor.trim().length > 0,
        mensagem: 'Selecione um estado!'
    },

    /* CEP: formato 00000-000 */
    cep: {
        validar: (valor) => {
            const cep = valor.replace(/\D/g, ''); /*
    /\D/g = Regex. \D = tudo que NÃO é dígito. g = global, pega todos
    '' = Substitui por nada

    esultado: "123.456.789-01".replace(/\D/g, '') vira "12345678901". Tira ponto e hífen.

    As barras / / são só a forma de escrever regex em JS. Igual aspas pra texto.*/
            return cep.length === 8;
        },
        mensagem: 'CEP deve ter 8 dígitos'
    },

    /* Telefone: valida formato (XX) 9 XXXX-XXXX */
    telefone: {
        validar: (valor) => {
            if (!valor) return true; // Opicional
            const telefone = valor.replace(/\D/g, '');
            return telefone.length >= 10;
        },
        mensagem: 'Telefone inválido'
    },

    /* Email: regex simples pra validar */
    email: {
        validar: (valor) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(valor);
        },
        mensagem: 'Email inválido!'
    }
};

// ===== FUNÇÃO: FORMATA CPF =====
// Enquanto digita, transforma 12345678901 em 123.456.789-01
function formatarCPF(valor) {
    const cpf = valor.replace(/\D/g, ''); // Remove não-números

    if (cpf.length <= 3) {
        return cpf;
    } else if (cpf.length <= 6) {
        return cpf.slice(0, 3) + '.' + cpf.slice(3);
    } else if (cpf.length <= 9) {
        return cpf.slice(0, 3) + '.' + cpf.slice(3, 6) + '.' + cpf.slice(6);
    } else {
        return cpf.slice(0, 3) + '.' + cpf.slice(3, 6) + '.' + cpf.slice(6, 9) + '-' + cpf.slice(9, 11);
    }
}

// ===== FUNÇÃO: FORMATA CEP =====
// 00000000 vira 00000-000
function formatarCEP(valor) {
    const cep = valor.replace(/\D/g, '');

    if (cep.length <= 5) {
        return cep;
    } else {
        return cep.slice(0, 5) + '-' + cep.slice(5, 8);
    }
}

// ===== FUNÇÃO: FORMATA TELEFONE =====
// 11987654321 vira (11) 9 8765-4321
function formatarTelefone(valor) {
    const telefone = valor.replace(/\D/g, '');

    if (telefone.length <= 2) {
        return telefone;
    } else if (telefone.length <= 7) {
        return '(' + telefone.slice(0, 2) + ') ' + telefone.slice(2);
    } else {
        return '(' + telefone.slice(0, 2) + ') ' + telefone.slice(2, 7) + '-' + telefone.slice(7, 11);
    }
}

// ===== FUNÇÃO: VALIDA UM CAMPO =====
function validarCampo(campo) {
    const tipo = campo.dataset.validate; //Pega o data-validate
    const valor = campo.value;
    const erroElement = document.getElementById(`erro-${campo.id}`);

    // Se não tem regra de validação, passa
    if (!validacoes[tipo]) {
        return true;
    }

    const validacao = validacoes[tipo];
    const isValido = validacao.validar(valor);

    // Se é inválido, mostra erro
    if (!isValido) {
        campo.setAttribute('data-invalid', 'true');
        erroElement.textContent = validacao.mensagem;
        erroElement.classList.add('show');
        return false;
    } else {
        // Se é valido, remove erro
        campo.setAttribute('data-invalid', 'false');
        erroElement.textContent = '';
        erroElement.classList.remove('show');
        return true;
    }
}

// ===== ADICIONA LISTENERS EM TODOS OS CAMPOS =====
// Isso faz a validação em tempo real!

const campos = form.querySelectorAll('[data-validate]');

campos.forEach(campo => {
    /* 
        'blur': quando sai do campo (deixa de focar)
        Valida quando o usuário sai do campo
    */
    campo.addEventListener('blur', function() {
        validarCampo(this);
    });

    /* 
        'input': enquanto digita
        Formata o campo se for CPF, CEP ou telefone
    */
    campo.addEventListener('input', function () {
        if (campo.id === 'cpf') {
            campo.value = formatarCPF(campo.value);
        } else if (campo.id === 'cep') {
            campo.value = formatarCEP(campo.value);
        } else if (campo.id === 'telefone') {
            campo.value = formatarTelefone(campo.value);
        }
   });
});

// ===== QUANDO ENVIA O FORM =====
form.addEventListener('submit', function (e) {
    /* 
        preventDefault: cancela o envio padrão
        Deixa a gente validar tudo primeiro
    */
    e.preventDefault();

    let temErro = false;

    /* Valida TODOS os campos */
    campos.forEach(campo => {
        if (!validarCampo(campo)) {
            temErro = true;
        }
    });

    // Se não tem erro, mostra mensagem de sucesso
    if (!temErro) {
        alert('✅ Formulário válido! DADOS NÃO ENVIADOS - Apenas teste local!');

        /* 
            Aqui você pode:
            1. Enviar pra um backend com fetch:
            
            const dados = new FormData(form);
            fetch('/api/cadastro', {
                method: 'POST',
                body: dados
            })
            .then(response => response.json())
            .then(dados => console.log('Sucesso:', dados))
            .catch(erro => console.error('Erro:', erro));
            
            2. Ou deixar o form enviar normalmente (remover preventDefault)
        */
    } else {
        alert('❌ Preencha os campos corretamente!')
    }
});

// ===== FUNÇÃO EXTRA: PEGA OS DADOS DO FORM ESTRUTURADO =====
// Use essa se quiser pega os dados em formato objeto
function obterDadosForm() {
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    // Interesses é array (múltiplos checkboxes)
    dados.interesses = formData.getAll('interesses');

    return dados;
}

// Exemplo: console.log(obterDadosForm());

// Pega os elementos
const telaAviso = document.getElementById('telaAviso');
const formContainer = document.getElementById('formContainer');
const btnEntendi = document.getElementById('btnEntendi');

// Quando clicar no botão
btnEntendi.addEventListener('click', function() {
    telaAviso.style.display = 'none';  //Esconde o aviso
    formContainer.style.display = 'block'; //Mostra o formulário
})