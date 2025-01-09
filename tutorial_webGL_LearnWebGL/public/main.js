const canvas = document.querySelector('canvas')
const gl = canvas.getContext('webgl')

if (!gl) {
    throw new Error ('WebGL not supported')
}

//alert(`Everything's peachy hear with WebGL`) // para dar um aviso antes de atualizar 

// vertexData = [...]

// create buffer
// load vertexData into buffer

// create vertex shader
// create fragment shader
// create program
// attach shaders to program

// enable  vertex attributes

// draw

const vertexData = [
    0, 1, 0,    // v1.position
    1, -1, 0,   // v2.position
    -1, -1, 0,   // v3.position
];

const colorData = [
    1, 0, 0,    // v1.color
    0, 1, 0,    // v2.color
    0, 0, 1     // v3.color
]; 

const positionBuffer = gl.createBuffer(); // cria o buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // carrega dados no buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW); // carrega o buffer

const colorBuffer = gl.createBuffer(); // cria o buffer
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); // carrega dados no buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW); // carrega o buffer


const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

void main() {
    vColor = color;
    gl_Position = vec4(position, 1);
}
`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;

varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor, 1);
}    
`);
gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0); // específicando como a aplaca deva ler o buffer

const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0); // específicando como a aplaca deva ler o buffer

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);
