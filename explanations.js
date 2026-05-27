"use strict";
const loop = (update) => {
    let last_time = 0;
    let looping = (time) => {
        update((time - last_time) / 1000.0);
        last_time = time;
        requestAnimationFrame(looping);
    };
    looping(last_time);
};
const compile_shader = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (shader === null)
        throw new Error(`unable to create shader type ${type}`);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    // TODO: error detection
    return shader;
};
const compile_shader_program = (gl, vertex_shader_source, fragment_shader_source) => {
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
const vga_basis_planes = (canvas) => {
    let gl = canvas.getContext("webgl2");
    if (gl === null) {
        console.error("webgl2 is not supported on this device");
        return;
    }
    const vertex_array = gl.createVertexArray();
    gl.bindVertexArray(vertex_array);
    const shader = compile_shader_program(gl, full_screen_vertex_shader, `#version 300 es
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

float origin_plane_distance(vec3 normal, vec3 position) {
    return abs(dot(position, normal));
}

// https://iquilezles.org/articles/distfunctions/
float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

void main() {
    vec3 direction = normalize(vec3(1, uv.yx));
    direction = rotate_xy(direction, rotation_xy);
    direction = rotate_xz(direction, rotation_xz);

    vec3 position = vec3(-2.5, 0, 0);
    position = rotate_xy(position, rotation_xy);
    position = rotate_xz(position, rotation_xz);

    vec3 color = vec3(0, 0, 0);
    for (int steps = 0; steps < 100; steps++) {
        vec3 planes[3] = vec3[3](
            vec3(1, 0, 0),
            vec3(0, 1, 0),
            vec3(0, 0, 1)
        );

        float box = sdBox(position, vec3(1));

        int closest_plane = 0;
        float closest_distance = max(origin_plane_distance(planes[0], position), box);
        for (int i = 1; i < planes.length(); i++) {
            float distance = max(origin_plane_distance(planes[i], position), box);
            if (distance < closest_distance) {
                closest_distance = distance;
                closest_plane = i;
            }
        }

        if (abs(closest_distance) < 0.01) {
            color = planes[closest_plane];
            break;
        }

        if (closest_distance > 10.0)
            break;
        position += direction * closest_distance;
    }
    o_Color = vec4(color, 1);
}
`);
    let rotation_xz = -0.1 * Math.PI;
    let rotation_xy = 0.075 * Math.PI;
    canvas.addEventListener("mousemove", (event) => {
        if (event.buttons & 1) {
            rotation_xz -= (event.movementX / canvas.width) * Math.PI;
            rotation_xy += (event.movementY / canvas.width) * Math.PI;
            rotation_xy = Math.min(Math.max(rotation_xy, Math.PI * -0.5), Math.PI * 0.5);
        }
    });
    gl.useProgram(shader);
    let rotation_xz_location = gl.getUniformLocation(shader, "rotation_xz");
    let rotation_xy_location = gl.getUniformLocation(shader, "rotation_xy");
    loop((_) => {
        gl.uniform1f(rotation_xz_location, rotation_xz);
        gl.uniform1f(rotation_xy_location, rotation_xy);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
};
