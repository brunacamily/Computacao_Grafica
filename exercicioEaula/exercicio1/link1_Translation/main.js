"use strict";

var vertexShaderSource = `#version 300 es

// um atributo é uma entrada (in) para um shader de vértice.
// Ele receberá dados de um buffer
in vec2 a_position;

// Usado para passar a resolução do canvas
uniform vec2 u_resolution;

// tradução a ser adicionada à posição
uniform vec2 u_translation;

// todos os shaders têm uma função main
void main() {
  // Adiciona a tradução
  vec2 position = a_position + u_translation;

  // converte a posição de pixels para 0.0 a 1.0
  vec2 zeroToOne = position / u_resolution;

  // converte de 0->1 para 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // converte de 0->2 para -1->+1 (espaço de recorte)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// precisamos declarar uma saída para o shader de fragmento
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

function main() {
  // Obter o contexto WebGL
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use nossas funções auxiliares para compilar os shaders e vinculá-los em um programa
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // procurar onde os dados dos vértices precisam ser enviados.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // procurar os locais dos uniforms
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var translationLocation = gl.getUniformLocation(program, "u_translation");

  // Criar um buffer
  var positionBuffer = gl.createBuffer();

  // Criar um objeto de array de vértices (estado de atributo)
  var vao = gl.createVertexArray();

  // e torná-lo o que estamos trabalhando no momento
  gl.bindVertexArray(vao);

  // Ativar o atributo
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Vinculá-lo ao ARRAY_BUFFER (pense nisso como ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Definir a geometria.
  setGeometry(gl);

  // Dizer ao atributo como obter dados do positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 componentes por iteração
  var type = gl.FLOAT;   // os dados são floats de 32 bits
  var normalize = false; // não normalizar os dados
  var stride = 0;        // 0 = avançar size * sizeof(tipo) a cada iteração para obter a próxima posição
  var offset = 0;        // começar no início do buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // Primeiro, vamos criar algumas variáveis
  // para armazenar a tradução,
  var translation = [0, 0];
  var color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();


    // Supondo que o buffer esteja definido como `positionBuffer`:
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const bufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
    console.log(`Tamanho do buffer: ${bufferSize} bytes`);


  // Configurar a interface de usuário.
  webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  // Desenhar a cena.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Dizer ao WebGL como converter de espaço de recorte para pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Limpar o canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Dizer para usar nosso programa (par de shaders)
    gl.useProgram(program);

    // Vincular o conjunto de atributos/buffer que queremos.
    gl.bindVertexArray(vao);

    // Passar a resolução do canvas para podermos converter de
    // pixels para espaço de recorte no shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // Definir a cor.
    gl.uniform4fv(colorLocation, color);

    // Definir a tradução.
    gl.uniform2fv(translationLocation, translation);

    // Desenhar a geometria.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 18;
    gl.drawArrays(primitiveType, offset, count);
  }
}


// Preenche o buffer com os valores que definem um retângulo.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

// Preenche o buffer ARRAY_BUFFER atual
// com os valores que definem a letra 'F'.
function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // coluna esquerda
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,

          // barra superior
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,

          // barra do meio
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90,
      ]),
      gl.STATIC_DRAW);
}

main();
