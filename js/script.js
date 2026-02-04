"use strict"

alert("Digite a cidade e o país separados por vírgula");

const input = document.getElementById("input-pagina");
const botao = document.getElementById("button-pagina");

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        botao.click();
    }
});

const ul = document.getElementById("lista-horas");
for (let i = 0; i < 24; i++) {
    const li = document.createElement("li");
    li.id = `hora-${i}`
    ul.appendChild(li);
}   

//receber o nome por uma api, pegar lat e long e converter para outra api onde posso pegar os dados
async function recebendoDadosApi() {
    let receberNome = document.getElementById("input-pagina").value;
    const nome_limpo = receberNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    let api = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${nome_limpo}&count=10&language=en&format=json`);
    let dadosApi = await api.json();

    let latApi = dadosApi.results[0].latitude;
    let longApi = dadosApi.results[0].longitude;

    let api2 = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latApi}&longitude=${longApi}&daily=temperature_2m_min,temperature_2m_max,weather_code&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,snowfall,showers,rain,precipitation,weather_code,wind_speed_10m,is_day,apparent_temperature`);
    let dadosApi2 = await api2.json();

    usandoSelect(dadosApi,dadosApi2);
    document.getElementById("h2-principal").innerText = `${dadosApi2.current.temperature_2m}°`;
    document.getElementById("texto-cidade").innerText = `${dadosApi.results[0].name}, ${dadosApi.results[0].country} `;

    //recebendo dia da semana e transferindo para as divs
    const datas = dadosApi2.daily.time;
    const dataAtual = new Date(`${datas[0]}T00:00:00`);

    const formatoPortugues = dataAtual.toLocaleDateString("pt-BR", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric"
    });
    document.getElementById("texto-dia").innerText = formatoPortugues;

    //apparent_temperature - sensação termica
    document.getElementById("sensacao-termica").innerText = `${dadosApi2.current.apparent_temperature} ${dadosApi2.current_units.apparent_temperature}`;
    document.getElementById("humidade").innerText = `${dadosApi2.current.relative_humidity_2m} ${dadosApi2.current_units.relative_humidity_2m}`
    document.getElementById("vento").innerText = `${dadosApi2.current.wind_speed_10m} ${dadosApi2.current_units.wind_speed_10m}`;
    document.getElementById("precipitacao").innerText = `${dadosApi2.current.precipitation} ${dadosApi2.current_units.precipitation}`;


    let codClima = dadosApi2.daily.weather_code;

    for (let i = 0; i < 7; i++) {
        const idImg = `img-${["um", "dois", "tres", "quat", "cinc", "seis", "sete"][i]}`;
        document.getElementById(idImg).src = pegarIconeClima(codClima[i]);
    }

    //recebendo nome dos dias da semana
    function nomeDiaSemana(indice) {
        const datas = dadosApi2.daily.time;
        const data = new Date(`${datas[indice]}T00:00:00`);
        return data.toLocaleDateString("pt-BR", { weekday: "short" });
    }

    //recebendo nomes dos dias da semana
    let idDia = ["texto-um", "texto-dois", "texto-tres", "texto-quat", "texto-cinc", "texto-seis", "texto-sete"];

    for (let i = 0; i < idDia.length; i++) {
        document.getElementById(idDia[i]).innerText = nomeDiaSemana(i);
    }


    const pegarMin = dadosApi2.daily.temperature_2m_min;
    const min = ["min-1", "min-2", "min-3", "min-4", "min-5", "min-6", "min-7"];

    for (let i = 0; i < min.length; i++) {
        document.getElementById(min[i]).innerText = `${pegarMin[i].toFixed(0)}°`;//para nao usar as casas decimais
    }

    const pegarMax = dadosApi2.daily.temperature_2m_max;
    const max = ["max-1", "max-2", "max-3", "max-4", "max-5", "max-6", "max-7"];

    for (let i = 0; i < max.length; i++) {
        document.getElementById(max[i]).innerText = `${pegarMax[i].toFixed(0)}°`;
    }
}

async function usandoSelect(dadosApi,dadosApi2) {
     dadosApi = dadosApi;
    
     dadosApi2 = dadosApi2;

    const select = document.getElementById("elemento-select");

    for (let i = 0; i < 7; i++) {
        let option = select.querySelector(`option[value="${i}"]`);
        if (!option) continue;

        const data = dadosApi2.daily.time[i];
        const dataFormatada = new Date(`${data}T00:00:00`);
        const nomeDiaSemana = dataFormatada.toLocaleDateString("pt-BR", { weekday: "long" });
        option.innerText = nomeDiaSemana;
    }

    select.addEventListener("change", function () {
        const diaSelecionado = parseInt(this.value);
        atualizaTemp(diaSelecionado, dadosApi2);
    });

    atualizaTemp(0, dadosApi2);
}

function atualizaTemp(indiceDia, dadosApi2) {
    const times = dadosApi2.hourly.time;
    const temps = dadosApi2.hourly.temperature_2m;
    const climaDia = dadosApi2.hourly.weather_code;

    const inicio = indiceDia * 24;

    for (let i = 0; i < 24; i++) {
        const li = document.getElementById(`hora-${i}`);
        li.innerHTML = "";

        const indexReal = inicio + i;

        const div = document.createElement('div');
        const p = document.createElement('p');
        const p2 = document.createElement('p');
        const img = document.createElement('img');

        li.appendChild(div);
        div.appendChild(img);
        div.appendChild(p);
        li.appendChild(p2);

        const dataHora = new Date(times[indexReal]);
        const horaFormatada = dataHora.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        // insere conteúdo
        p.innerText = horaFormatada;
        p2.innerText = `${temps[indexReal].toFixed(0)}°C`;
        img.src = pegarIconeClima(climaDia[indexReal]);

        // ids para estilizar
        div.id = "div-li";
        p2.id = "p-li";
    }
}


//mapeando cada image de acordo com o codigo enviado pela API
function pegarIconeClima(codigo) {
    switch (codigo) {
        case 0: return "img/ensolarado.svg";
        case 1: return "img/parcialmenteNublado.svg";
        case 2:
        case 3:
        case 45:
        case 48:
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
        case 80:
        case 81:
            return "img/nublado.svg";
        case 71:
        case 73:
        case 75:
        case 77:
        case 82:
        case 85:
            return "img/chuva.svg";
        case 86:
        case 95:
        case 96:
        case 99:
            return "img/tempestades.svg";
        default:
            return "img/desconhecido.svg";
    }
}