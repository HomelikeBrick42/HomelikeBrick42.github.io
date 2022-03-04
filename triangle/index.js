var Main = function () {
    var gl = (function () {
        var canvas = document.getElementById("canvas");
        return canvas.getContext("webgl2");
    })();
    var vertexArray;
    var vertexBuffer;
    var shader;
    var Init = function () {
        vertexArray = gl.createVertexArray();
        gl.bindVertexArray(vertexArray);
        var vertices = [
            +0.0, +0.5, 1.0, 0.0, 0.0,
            +0.5, -0.5, 0.0, 1.0, 0.0,
            -0.5, -0.5, 0.0, 0.0, 1.0,
        ];
        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 5 * 4, 0 * 4);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 5 * 4, 2 * 4);
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, "\n\t\t\tprecision mediump float;\n\n\t\t\tattribute vec4 a_Position;\n\t\t\tattribute vec4 a_Color;\n\n    \t\tvarying vec4 v_Color;\n\n\t\t\tuniform float u_Aspect;\n\n\t\t\tvoid main() {\n\t\t\t\tgl_Position = a_Position;\n\t\t\t\tgl_Position.x *= u_Aspect;\n\t\t\t\tv_Color = a_Color;\n\t\t\t}\n\t\t");
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(vertexShader));
        }
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, "\n\t\t\tprecision mediump float;\n\n    \t\tvarying vec4 v_Color;\n\n\t\t\tvoid main() {\n\t\t\t\tgl_FragColor = v_Color;\n\t\t\t}\n\t\t");
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(fragmentShader));
        }
        shader = gl.createProgram();
        gl.attachShader(shader, vertexShader);
        gl.attachShader(shader, fragmentShader);
        gl.linkProgram(shader);
        if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(shader));
        }
        gl.detachShader(shader, vertexShader);
        gl.detachShader(shader, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    };
    var Update = function (dt) {
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(shader);
        gl.uniform1f(gl.getUniformLocation(shader, "u_Aspect"), gl.canvas.height / gl.canvas.width);
        gl.bindVertexArray(vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    var ResizeCallback = function () {
        gl.canvas.width = window.innerWidth - 4;
        gl.canvas.height = window.innerHeight - 4;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };
    window.onresize = ResizeCallback;
    Init();
    ResizeCallback();
    var lastTime = 0;
    var Loop = function (time) {
        var dt = time - lastTime;
        lastTime = time;
        Update(dt);
        requestAnimationFrame(Loop);
    };
    requestAnimationFrame(Loop);
};
Main();
//# sourceMappingURL=index.js.map