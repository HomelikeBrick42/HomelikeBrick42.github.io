const loop = (update: (dt: number) => void) => {
    let last_time = 0;
    let looping = (time: number) => {
        update((time - last_time) / 1000.0);
        last_time = time;
        requestAnimationFrame(looping);
    };
    looping(last_time);
};

const compile_shader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type);
    if (shader === null) throw new Error(`unable to create shader type ${type}`);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // TODO: error detection

    return shader;
};

const compile_shader_program = (gl: WebGL2RenderingContext, vertex_shader_source: string, fragment_shader_source: string): WebGLProgram => {
    const program = gl.createProgram();

    const vertex_shader = compile_shader(gl, gl.VERTEX_SHADER, vertex_shader_source);
    gl.attachShader(program, vertex_shader);

    const fragment_shader = compile_shader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);
    gl.attachShader(program, fragment_shader);

    gl.linkProgram(program);

    // TODO: error detection

    gl.detachShader(program, vertex_shader);
    gl.deleteShader(vertex_shader);
    gl.detachShader(program, fragment_shader);
    gl.deleteShader(fragment_shader);

    return program;
};

const full_screen_vertex_shader = `#version 300 es
precision highp float;

out vec2 uv;

void main() {
    uv = vec2(gl_VertexID & 1, (gl_VertexID >> 1) & 1) * 2.0 - 1.0;
    gl_Position = vec4(uv, 0.0, 1.0);
}
`;

const vga_basis_planes = (canvas: HTMLCanvasElement) => {
    let gl = canvas.getContext("webgl2");
    if (gl === null) {
        console.error("webgl2 is not supported on this device");
        return;
    }

    const vertex_array = gl.createVertexArray();
    gl.bindVertexArray(vertex_array);

    const shader = compile_shader_program(
        gl,
        full_screen_vertex_shader,
        `#version 300 es
precision highp float;

out vec4 o_Color;

in vec2 uv;

uniform float rotation_xz;
uniform float rotation_xy;

vec3 rotate_xz(vec3 v, float angle) {
    return vec3(
        v.x * cos(angle) + v.z * sin(angle),
        v.y,
        v.z * cos(angle) - v.x * sin(angle)
    );
}

vec3 rotate_xy(vec3 v, float angle) {
    return vec3(
        v.x * cos(angle) + v.y * sin(angle),
        v.y * cos(angle) - v.x * sin(angle),
        v.z
    );
}

void main() {
    vec3 direction = normalize(vec3(1, uv.yx));
    direction = rotate_xz(direction, rotation_xz);
    direction = rotate_xy(direction, rotation_xy);

    vec3 origin = direction * -2.0;

    o_Color = vec4(direction * 0.5 + 0.5, 1.0);
}
`
    );

    let rotation_xz = 0;
    let rotation_xy = 0;
    canvas.addEventListener("mousemove", (event) => {
        if (event.buttons & 1) {
            rotation_xz += (event.movementX / canvas.width) * Math.PI;

            rotation_xy -= (event.movementY / canvas.width) * Math.PI;
            rotation_xy = Math.min(Math.max(rotation_xy, -Math.PI), Math.PI);
        }
    });

    gl.useProgram(shader);
    let rotation_xz_location = gl.getUniformLocation(shader, "rotation_xz");
    let rotation_xy_location = gl.getUniformLocation(shader, "rotation_xy");
    loop((dt) => {
        gl.uniform1f(rotation_xz_location, rotation_xz);
        gl.uniform1f(rotation_xy_location, rotation_xy);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
};
