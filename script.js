/* =========================================================
   Currículo - Miguel Couto
   Tema claro/escuro, menu mobile e formulário de contato
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* =======================================================
     1. MODO CLARO / MODO ESCURO
     ======================================================= */

  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const CHAVE_TEMA = "tema-preferido";

  function aplicarTema(tema) {
    const claro = tema === "claro";
    body.classList.toggle("light-mode", claro);
    if (themeToggle) themeToggle.checked = claro;
  }

  // Carrega a preferência salva; se não houver, segue o tema do sistema.
  let temaSalvo = null;
  try {
    temaSalvo = localStorage.getItem(CHAVE_TEMA);
  } catch (e) {
    temaSalvo = null;
  }

  if (temaSalvo) {
    aplicarTema(temaSalvo);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    aplicarTema("claro");
  } else {
    aplicarTema("escuro");
  }

  if (themeToggle) {
    themeToggle.addEventListener("change", function () {
      const tema = themeToggle.checked ? "claro" : "escuro";
      aplicarTema(tema);
      try {
        localStorage.setItem(CHAVE_TEMA, tema);
      } catch (e) {
        /* localStorage indisponível: o tema segue funcionando na sessão */
      }
    });
  }


  /* =======================================================
     2. MENU MOBILE
     ======================================================= */

  const menuToggle = document.getElementById("menuToggle");
  const navList = document.querySelector(".nav-list");

  function fecharMenu() {
    if (!navList || !menuToggle) return;
    navList.classList.remove("aberto");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  }

  if (menuToggle && navList) {
    menuToggle.addEventListener("click", function () {
      const aberto = navList.classList.toggle("aberto");
      menuToggle.setAttribute("aria-expanded", String(aberto));
      menuToggle.innerHTML = aberto
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    // Fecha ao clicar em um link do menu
    navList.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", fecharMenu);
    });

    // Fecha ao clicar fora do header
    document.addEventListener("click", function (evento) {
      const header = document.querySelector("header");
      if (header && !header.contains(evento.target)) fecharMenu();
    });

    // Fecha ao voltar para a largura de desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) fecharMenu();
    });
  }


  /* =======================================================
     3. MÁSCARAS DO FORMULÁRIO
     ======================================================= */

  // Nome: apenas letras (com acentos), espaços, apóstrofo e hífen.
  // Capitaliza cada palavra, ignorando as preposições comuns.
  function mascaraNome(valor) {
    const limpo = valor
      .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'\- ]/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/, "");

    const minusculas = ["de", "da", "do", "das", "dos", "e"];

    return limpo
      .toLowerCase()
      .split(" ")
      .map(function (palavra, indice) {
        if (!palavra) return palavra;
        if (indice > 0 && minusculas.indexOf(palavra) !== -1) return palavra;
        return palavra.charAt(0).toUpperCase() + palavra.slice(1);
      })
      .join(" ");
  }

  // E-mail: sem espaços, sempre minúsculo, só caracteres válidos.
  function mascaraEmail(valor) {
    return valor.replace(/\s/g, "").replace(/[^a-zA-Z0-9@._+\-]/g, "").toLowerCase();
  }

  // Telefone: (31) 9999-9999 ou (31) 99999-9999
  function mascaraTelefone(valor) {
    const d = valor.replace(/\D/g, "").slice(0, 11);

    if (d.length === 0) return "";
    if (d.length <= 2) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  // Data: dd/mm/aaaa
  function mascaraData(valor) {
    const d = valor.replace(/\D/g, "").slice(0, 8);

    if (d.length === 0) return "";
    if (d.length <= 2) return d;
    if (d.length <= 4) return d.slice(0, 2) + "/" + d.slice(2);
    return d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
  }

  const mascaras = {
    nome: mascaraNome,
    email: mascaraEmail,
    telefone: mascaraTelefone,
    data: mascaraData
  };

  // Aplica a máscara preservando a posição aproximada do cursor.
  function aplicarMascara(campo) {
    const funcao = mascaras[campo.dataset.mask];
    if (!funcao) return;

    const posicaoOriginal = campo.selectionStart;
    const tamanhoAntes = campo.value.length;
    const novoValor = funcao(campo.value);

    if (novoValor === campo.value) return;

    campo.value = novoValor;

    const diferenca = novoValor.length - tamanhoAntes;
    const novaPosicao = Math.max(0, posicaoOriginal + diferenca);

    if (campo.type !== "email") {
      try {
        campo.setSelectionRange(novaPosicao, novaPosicao);
      } catch (e) {
        /* alguns tipos de input não suportam seleção */
      }
    }
  }

  document.querySelectorAll("[data-mask]").forEach(function (campo) {
    campo.addEventListener("input", function () {
      aplicarMascara(campo);
      limparErro(campo);
    });

    campo.addEventListener("paste", function () {
      setTimeout(function () {
        aplicarMascara(campo);
      }, 0);
    });
  });


  /* =======================================================
     4. CONTADOR DE CARACTERES
     ======================================================= */

  const mensagem = document.getElementById("mensagem");
  const contadorMensagem = document.getElementById("contadorMensagem");

  function atualizarContador() {
    if (!mensagem || !contadorMensagem) return;
    contadorMensagem.textContent = mensagem.value.length + " / 600";
  }

  if (mensagem) {
    mensagem.addEventListener("input", function () {
      atualizarContador();
      limparErro(mensagem);
    });
    atualizarContador();
  }


  /* =======================================================
     5. VALIDAÇÃO E ENVIO
     ======================================================= */

  const formulario = document.getElementById("contatoForm");
  const status = document.getElementById("formStatus");
  const btnLimpar = document.getElementById("btnLimpar");

  function mostrarErro(campo, texto) {
    const alvo = document.getElementById("erro-" + campo.id);
    if (alvo) alvo.textContent = texto;
    campo.classList.add("invalido");
  }

  function limparErro(campo) {
    const alvo = document.getElementById("erro-" + campo.id);
    if (alvo) alvo.textContent = "";
    campo.classList.remove("invalido");
  }

  function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(valor);
  }

  function telefoneValido(valor) {
    const d = valor.replace(/\D/g, "");
    if (d.length !== 10 && d.length !== 11) return false;
    if (d.length === 11 && d.charAt(2) !== "9") return false;
    const ddd = parseInt(d.slice(0, 2), 10);
    return ddd >= 11 && ddd <= 99;
  }

  function dataValida(valor) {
    const partes = valor.split("/");
    if (partes.length !== 3) return false;

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    if (!dia || !mes || !ano) return false;
    if (mes < 1 || mes > 12) return false;
    if (ano < 2020 || ano > 2100) return false;

    const diasNoMes = new Date(ano, mes, 0).getDate();
    return dia >= 1 && dia <= diasNoMes;
  }

  function validarFormulario() {
    let valido = true;

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const telefone = document.getElementById("telefone");
    const assunto = document.getElementById("assunto");
    const data = document.getElementById("data");

    [nome, email, telefone, assunto, data, mensagem].forEach(function (campo) {
      if (campo) limparErro(campo);
    });

    if (nome.value.trim().length < 3) {
      mostrarErro(nome, "Informe seu nome completo (mínimo 3 letras).");
      valido = false;
    }

    if (!emailValido(email.value.trim())) {
      mostrarErro(email, "Informe um e-mail válido.");
      valido = false;
    }

    if (telefone.value.trim() !== "" && !telefoneValido(telefone.value)) {
      mostrarErro(telefone, "Telefone incompleto ou inválido.");
      valido = false;
    }

    if (assunto.value === "") {
      mostrarErro(assunto, "Escolha um assunto.");
      valido = false;
    }

    if (data.value.trim() !== "" && !dataValida(data.value)) {
      mostrarErro(data, "Data inválida. Use o formato dd/mm/aaaa.");
      valido = false;
    }

    if (mensagem.value.trim().length < 10) {
      mostrarErro(mensagem, "A mensagem precisa ter pelo menos 10 caracteres.");
      valido = false;
    }

    return valido;
  }

  if (formulario) {
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();

      if (!validarFormulario()) {
        status.textContent = "Confira os campos destacados antes de enviar.";
        status.className = "form-status erro";
        const primeiroErro = formulario.querySelector(".invalido");
        if (primeiroErro) primeiroErro.focus();
        return;
      }

      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const telefone = document.getElementById("telefone").value.trim();
      const empresa = document.getElementById("empresa").value.trim();
      const assunto = document.getElementById("assunto").value;
      const data = document.getElementById("data").value.trim();
      const texto = mensagem.value.trim();

      const corpo =
        "Nome: " + nome + "\n" +
        "E-mail: " + email + "\n" +
        (telefone ? "Telefone: " + telefone + "\n" : "") +
        (empresa ? "Empresa: " + empresa + "\n" : "") +
        (data ? "Melhor data para contato: " + data + "\n" : "") +
        "\nMensagem:\n" + texto;

      const url =
        "https://mail.google.com/mail/?view=cm&fs=1&to=miguelcoutomarquws@gmail.com" +
        "&su=" + encodeURIComponent(assunto + " - " + nome) +
        "&body=" + encodeURIComponent(corpo);

      window.open(url, "_blank");

      status.textContent = "Tudo certo! Abrimos seu e-mail com a mensagem pronta para envio.";
      status.className = "form-status sucesso";

      formulario.reset();
      atualizarContador();
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", function () {
      formulario.reset();
      formulario.querySelectorAll("input, select, textarea").forEach(limparErro);
      status.textContent = "";
      status.className = "form-status";
      atualizarContador();
    });
  }

});
