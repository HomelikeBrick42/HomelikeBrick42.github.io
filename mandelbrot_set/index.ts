const Main = (): void => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const zoomIn = document.getElementById("zoom-in") as HTMLButtonElement;
    const zoomOut = document.getElementById("zoom-out") as HTMLButtonElement;
    const startX = document.getElementById("start-x") as HTMLInputElement;
    const startY = document.getElementById("start-y") as HTMLInputElement;

    const gl = canvas.getContext("webgl2");

    let shader: WebGLProgram;
    let offsetX: number = 0;
    let offsetY: number = 0;
    let zoom: number = 2;

    const Init = (): void => {
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, `#version 300 es

			precision mediump float;

			out vec2 v_UV;

			void main() {
				v_UV = vec2(
					(gl_VertexID >> 0) & 1,
					(gl_VertexID >> 1) & 1
				);
				gl_Position = vec4(v_UV * 2.0 - 1.0, 0.0, 1.0);
			}
		`);
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) as boolean) {
            console.error(gl.getShaderInfoLog(vertexShader));
        }

        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, `#version 300 es

			precision mediump float;

			out vec4 o_Color;

			in vec2 v_UV;

			uniform float u_Aspect;
			uniform vec2 u_Offset;
			uniform float u_Zoom;
			uniform vec2 u_Start;

			vec3 hueToRGB(float h) {
				float kr = mod(5.0 + h * 6.0, 6.0);
				float kg = mod(3.0 + h * 6.0, 6.0);
				float kb = mod(1.0 + h * 6.0, 6.0);

				float r = 1.0 - max(min(kr, min(4.0 - kr, 1.0)), 0.0);
				float g = 1.0 - max(min(kg, min(4.0 - kg, 1.0)), 0.0);
				float b = 1.0 - max(min(kb, min(4.0 - kb, 1.0)), 0.0);

				return vec3(r, g, b);
			}

			vec2 multiply_complex(vec2 a, vec2 b) {
				return vec2(
					a.x * b.x - a.y * b.y,
					a.x * b.y + b.x * a.y
				);
			}

			void main() {
				vec2 uv = v_UV * 2.0 - 1.0;
				uv.x /= u_Aspect;
                uv *= u_Zoom;
                uv += u_Offset;

				const int maxIterations = 1000;

				vec2 value = u_Start;

				int i;
				for (i = 0; i < maxIterations; i++) {
					value = multiply_complex(value, value) + uv;
					if (dot(value, value) > 4.0) {
						break;
					}
				}

				if (i == maxIterations) {
					o_Color = vec4(0.0, 0.0, 0.0, 1.0);
				} else {
					o_Color = vec4(hueToRGB(float(i) * 0.01), 1.0);
				}
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
        gl.useProgram(shader);
        gl.uniform1f(gl.getUniformLocation(shader, "u_Aspect"), gl.canvas.height / gl.canvas.width);
        gl.uniform2f(gl.getUniformLocation(shader, "u_Offset"), offsetX, offsetY);
        gl.uniform1f(gl.getUniformLocation(shader, "u_Zoom"), zoom);
        gl.uniform2f(gl.getUniformLocation(shader, "u_Start"), parseInt(startX.value) / 10000, parseInt(startY.value) / 10000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    const ResizeCallback = (): void => {
        gl.canvas.width = window.innerWidth - 4;
        gl.canvas.height = window.innerHeight - 4;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    window.onresize = ResizeCallback;

    let clicking: boolean = false;
    window.onmousedown = (e: MouseEvent): void => {
        clicking = true;
    };
    window.onmouseup = (e: MouseEvent): void => {
        clicking = false;
    };
    window.onmousemove = (e: MouseEvent): void => {
        if (clicking) {
            offsetX -= e.movementX / canvas.width * zoom * 2.5;
            offsetY += e.movementY / canvas.width * zoom * 2.5;
        }
    };

    zoomIn.onclick = (e: MouseEvent) => {
        zoom /= 1.3;
    };
    zoomOut.onclick = (e: MouseEvent) => {
        zoom *= 1.3;
    };

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
