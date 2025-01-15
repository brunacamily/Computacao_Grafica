"use strict";

var vertexShaderSource = `#version 300 es

// um atributo é uma entrada (in) para um shader de vértice.
// Ele receberá dados de um buffer
in vec2 a_position;

// Usado para passar a resolução do canvas
uniform vec2 u_resolution;

// Uma matriz para transformar as posições
uniform mat3 u_matrix;

// todos os shaders têm uma função principal
void main() {
  // Multiplica a posição pela matriz.
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;

  // converte a posição de pixels para o intervalo de 0.0 a 1.0
  vec2 zeroToOne = position / u_resolution;

  // converte de 0->1 para 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // converte de 0->2 para -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// precisamos declarar uma saída para o fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;


function main() {
  // Obtém um contexto WebGL
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Usa nossas funções utilitárias para compilar os shaders e vinculá-los em um programa
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // procura onde os dados dos vértices precisam ir.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // procura as localizações dos uniforms
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Cria um buffer
  var positionBuffer = gl.createBuffer();

  // Cria um objeto de array de vértices (estado do atributo)
  var vao = gl.createVertexArray();

  // e faz dele o que estamos usando no momento
  gl.bindVertexArray(vao);

  // Ativa o atributo
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Faz a ligação ao ARRAY_BUFFER (pense nisso como ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Define a geometria.
  setGeometry(gl);

  // Informa ao atributo como pegar os dados do positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 componentes por iteração
  var type = gl.FLOAT;   // os dados são floats de 32bits
  var normalize = false; // não normaliza os dados
  var stride = 0;        // 0 = move para frente size * sizeof(tipo) a cada iteração para obter a próxima posição
  var offset = 0;        // começa no início do buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // Primeiro, vamos criar algumas variáveis
  // para armazenar a translação,
  var translation = [0, 0];
  var translation2 = [0, 180];
  var rotationInRadians = 0;
  var rotationInRadians2 = 0;
  var scale = [0.85, 0.85];
  var scale2 = [0.85, 0.85];
  var color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

    // Supondo que o buffer esteja definido como `positionBuffer`:
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const bufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
    console.log(`Tamanho do buffer: ${bufferSize} bytes`);

  //===================================================
  // Obtém o elemento do seletor
  const modeSelector = document.getElementById('modeSelector');
  const output = document.createElement('div'); // Cria um elemento para exibir a saída
  document.body.appendChild(output); // Adiciona o elemento ao corpo da página

  // Inicializa o seletor como 'f1' e chama a função de atualização
  modeSelector.value = 'f1';  // Inicializa com 'f1'
  updateSelect({ target: modeSelector }); // Aciona a função para aplicar as configurações de 'f1'


  // Adiciona o ouvinte de evento para o dropdown
  modeSelector.addEventListener('change', updateSelect);

  // Função que é chamada quando o valor do seletor muda
  function updateSelect(event) {
    // Obtém o valor selecionado no dropdown
    const selectedMode = event.target.value;

    // Verifica o valor selecionado e altera a saída conforme necessário
    if (selectedMode === 'f1') {

      // Configura uma interface de usuário.
      webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition1(0), max: gl.canvas.width });
      webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition1(1), max: gl.canvas.height});
      webglLessonsUI.setupSlider("#angle",  {value: rotationInRadians * 180 / Math.PI | 0, slide: updateAngle, max: 360});
      webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
      webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});
      

    } else if (selectedMode === 'f2') {

      // Configura uma interface de usuário.
      webglLessonsUI.setupSlider("#x",      {value: translation2[0], slide: updatePosition2(0), max: gl.canvas.width });
      webglLessonsUI.setupSlider("#y",      {value: translation2[1], slide: updatePosition2(1), max: gl.canvas.height});
      webglLessonsUI.setupSlider("#angle",  {value: rotationInRadians2 * 180 / Math.PI | 0, slide: updateAngle2, max: 360});
      webglLessonsUI.setupSlider("#scaleX", {value: scale2[0], slide: updateScale2(0), min: -5, max: 5, step: 0.01, precision: 2});
      webglLessonsUI.setupSlider("#scaleY", {value: scale2[1], slide: updateScale2(1), min: -5, max: 5, step: 0.01, precision: 2});
    

    }
  }
//==================================================
  
  function updatePosition1(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updatePosition2(index) {
    return function(event, ui) {
      translation2[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    rotationInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
  }

  function updateAngle2(event, ui) {
    var angleInDegrees = 360 - ui.value;
    rotationInRadians2 = angleInDegrees * Math.PI / 180;
    drawScene();
  }

  function updateScale(index) {
    return function(event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  function updateScale2(index) {
    return function(event, ui) {
      scale2[index] = ui.value;
      drawScene();
    };
  }

  // Desenha a cena.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
    // Informa ao WebGL como converter de clip space para pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
    // Limpa o canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    // Informa ao WebGL para usar nosso programa (par de shaders)
    gl.useProgram(program);
  
    // Faz a ligação ao conjunto de atributos/buffer que queremos.
    gl.bindVertexArray(vao);
  
    // Passa a resolução do canvas para podermos converter de
    // pixels para clipspace no shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  
    // Define a cor.
    gl.uniform4fv(colorLocation, color);
  
    // Primeiro "f"
    var translationMatrix1 = m3.translation(translation[0], translation[1]);
    var rotationMatrix1 = m3.rotation(rotationInRadians);
    var scaleMatrix1 = m3.scaling(scale[0], scale[1]);
  
    var matrix1 = m3.identity();
    matrix1 = m3.multiply(matrix1, translationMatrix1);
    matrix1 = m3.multiply(matrix1, rotationMatrix1);
    matrix1 = m3.multiply(matrix1, scaleMatrix1);
    
    gl.uniformMatrix3fv(matrixLocation, false, matrix1);
    gl.drawArrays(gl.TRIANGLES, 0, 18);
  
    // Segundo "f"
    var translationMatrix2 = m3.translation(translation2[0], translation2[1]);
    var rotationMatrix2 = m3.rotation(rotationInRadians2);
    var scaleMatrix2 = m3.scaling(scale2[0], scale2[1]);
  
    var matrix2 = m3.identity();
    matrix2 = m3.multiply(matrix2, translationMatrix2);
    matrix2 = m3.multiply(matrix2, rotationMatrix2);
    matrix2 = m3.multiply(matrix2, scaleMatrix2);
    
    gl.uniformMatrix3fv(matrixLocation, false, matrix2);
    gl.drawArrays(gl.TRIANGLES, 0, 18);
  }
  
}

// Preenche o buffer ARRAY_BUFFER atual
// com os valores que definem a letra 'F'.
function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // coluna da esquerda
          0, 0,
          30, 0,
          0, 150,
          0, 150,
          30, 0,
          30, 150,

          // parte superior
          30, 0,
          100, 0,
          30, 30,
          30, 30,
          100, 0,
          100, 30,

          // parte do meio
          30, 60,
          67, 60,
          30, 90,
          30, 90,
          67, 60,
          67, 90,
      ]),
      gl.STATIC_DRAW);
}



var m3 = {
  identity: function identity() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },

  translation: function translation(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function rotation(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c, -s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function scaling(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function multiply(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];

    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};

main();
