const Main = (): void => {
    const gl = ((): WebGL2RenderingContext => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        return canvas.getContext("webgl2");
    })();

    let vertexArray: WebGLVertexArrayObject;
    let vertexBuffer: WebGLBuffer;

    let shader: WebGLProgram;

    const Init = (): void => {
        vertexArray = gl.createVertexArray();
        gl.bindVertexArray(vertexArray);

        const vertices: number[] = [
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

        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, `
			precision mediump float;

			attribute vec4 a_Position;
			attribute vec4 a_Color;

    		varying vec4 v_Color;

			uniform float u_Aspect;

			void main() {
				gl_Position = a_Position;
				gl_Position.x *= u_Aspect;
				v_Color = a_Color;
			}
		`);
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) as boolean) {
            console.error(gl.getShaderInfoLog(vertexShader));
        }

        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, `
			precision mediump float;

    		varying vec4 v_Color;

			void main() {
				gl_FragColor = v_Color;
			}
		`);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) as boolean) {
            console.error(gl.getShaderInfoLog(fragmentShader));
        }

        shader = gl.createProgram();
        gl.attachShader(shader, vertexShader);
        gl.attachShader(shader, fragmentShader);
        gl.linkProgram(shader);

        if (!gl.getProgramParameter(shader, gl.LINK_STATUS) as boolean) {
            console.error(gl.getProgramInfoLog(shader));
        }

        gl.detachShader(shader, vertexShader);
        gl.detachShader(shader, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    }

    const Update = (dt: number): void => {
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(shader);
        gl.uniform1f(gl.getUniformLocation(shader, "u_Aspect"), gl.canvas.height / gl.canvas.width);

        gl.bindVertexArray(vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const ResizeCallback = (): void => {
        gl.canvas.width = window.innerWidth - 4;
        gl.canvas.height = window.innerHeight - 4;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    window.onresize = ResizeCallback;

    Init();
    ResizeCallback();

    let lastTime = 0;
    const Loop = (time: number): void => {
        const dt = time - lastTime;
        lastTime = time;
        Update(dt);
        requestAnimationFrame(Loop);
    }
    requestAnimationFrame(Loop);
}

Main();
