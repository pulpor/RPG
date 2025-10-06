// Exemplo de código para teste do feedback automático
// Este é um exemplo de calculadora simples em JavaScript

class Calculadora {
    constructor() {
        this.resultado = 0;
    }

    somar(a, b) {
        return a + b;
    }

    subtrair(a, b) {
        return a - b;
    }

    multiplicar(a, b) {
        return a * b;
    }

    dividir(a, b) {
        if (b === 0) {
            throw new Error("Divisão por zero não é permitida");
        }
        return a / b;
    }

    // Função com alguns problemas intencionais para o feedback
    calcularMedia(numeros) {
        let soma = 0;
        for (let i = 0; i < numeros.length; i++) {
            soma += numeros[i]; // Sem validação de tipo
        }
        return soma / numeros.length; // Não verifica se o array está vazio
    }
}

// Exemplo de uso
const calc = new Calculadora();
console.log("Soma:", calc.somar(5, 3));
console.log("Subtração:", calc.subtrair(10, 4));
console.log("Multiplicação:", calc.multiplicar(6, 7));
console.log("Divisão:", calc.dividir(15, 3));

// Teste da média
const numeros = [1, 2, 3, 4, 5];
console.log("Média:", calc.calcularMedia(numeros));
