var Main = function () {
    var gl = (function () {
        var canvas = document.getElementById("canvas");
        return canvas.getContext("webgl2");
    })();
    var shader;
    var Init = function () {
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, "#version 300 es\n\n\t\t\tprecision mediump float;\n\n\t\t\tout vec2 v_UV;\n\n\t\t\tvoid main() {\n\t\t\t\tv_UV = vec2(\n\t\t\t\t\t(gl_VertexID >> 0) & 1,\n\t\t\t\t\t(gl_VertexID >> 1) & 1\n\t\t\t\t);\n\t\t\t\tgl_Position = vec4(v_UV * 2.0 - 1.0, 0.0, 1.0);\n\t\t\t}\n\t\t");
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(vertexShader));
        }
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, "#version 300 es\n\n\t\t\tprecision mediump float;\n\n\t\t\tout vec4 o_Color;\n\n\t\t\tin vec2 v_UV;\n\n\t\t\tuniform float u_Aspect;\n\n\t\t\tvec3 hueToRGB(float h) {\n\t\t\t\tfloat kr = mod(5.0 + h * 6.0, 6.0);\n\t\t\t\tfloat kg = mod(3.0 + h * 6.0, 6.0);\n\t\t\t\tfloat kb = mod(1.0 + h * 6.0, 6.0);\n\n\t\t\t\tfloat r = 1.0 - max(min(kr, min(4.0 - kr, 1.0)), 0.0);\n\t\t\t\tfloat g = 1.0 - max(min(kg, min(4.0 - kg, 1.0)), 0.0);\n\t\t\t\tfloat b = 1.0 - max(min(kb, min(4.0 - kb, 1.0)), 0.0);\n\n\t\t\t\treturn vec3(r, g, b);\n\t\t\t}\n\n\t\t\tvec2 multiply_complex(vec2 a, vec2 b) {\n\t\t\t\treturn vec2(\n\t\t\t\t\ta.x * b.x - a.y * b.y,\n\t\t\t\t\ta.x * b.y + b.x * a.y\n\t\t\t\t);\n\t\t\t}\n\n\t\t\tvoid main() {\n\t\t\t\tvec2 uv = v_UV * 4.0 - 2.0;\n\t\t\t\tuv.x /= u_Aspect;\n\n\t\t\t\tvec2 value = vec2(0, 0);\n\n\t\t\t\tint maxIterations = 1000;\n\n\t\t\t\tint i;\n\t\t\t\tfor (i = 0; i < maxIterations; i++) {\n\t\t\t\t\tvalue = multiply_complex(value, value) + uv;\n\t\t\t\t\tif (dot(value, value) > 4.0) {\n\t\t\t\t\t\tbreak;\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\tif (i == maxIterations) {\n\t\t\t\t\to_Color = vec4(0.0, 0.0, 0.0, 1.0);\n\t\t\t\t} else {\n\t\t\t\t\to_Color = vec4(hueToRGB(float(i) * 0.01), 1.0);\n\t\t\t\t}\n\t\t\t}\n\t\t");
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
        gl.useProgram(shader);
        gl.uniform1f(gl.getUniformLocation(shader, "u_Aspect"), gl.canvas.height / gl.canvas.width);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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