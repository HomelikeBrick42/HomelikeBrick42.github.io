"use strict";
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Normalized() {
        let length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return new Vector3(this.x / length, this.y / length, this.z / length);
    }
    static Cross(a, b) {
        return new Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext('webgl2');
    let time = 0;
    let mandelbulbShader;
    const Init = () => {
        const VertexShader = `#version 300 es

        precision highp float;

        out vec2 v_UV;

        void main() {
            v_UV = vec2(
                (gl_VertexID >> 0) & 1,
                (gl_VertexID >> 1) & 1
            );
            gl_Position = vec4(v_UV * 2.0 - 1.0, 0.0, 1.0);
        }
        `;
        const FragmentShader = `#version 300 es

        precision highp float;

        layout(location = 0) out vec4 o_Color;

        in vec2 v_UV;

        uniform float u_Aspect;
        uniform vec3 u_Position;
        uniform vec3 u_Forward;
        uniform vec3 u_Right;
        uniform vec3 u_Up;

        const int MaxSteps = 500;
        const float MaxDistance = 2000.0;
        const float MinDistance = 0.001;
        const vec3 LightDir = normalize(vec3(0.3, 1.0, 0.4));

        float Sphere(vec3 pos, float radius) {
            return length(pos) - radius;
        }

        float Mandelbulb(vec3 pos) {
            return 1.0;
        }

        float DE(vec3 pos) {
            const vec3 Min = vec3(-10.0, -10.0, -10.0);
            const vec3 Max = vec3(+10.0, +10.0, +10.0);

            float radius = 2.0;
            return Sphere(
                mod(pos - Min, Max - Min) + Min,
                radius
            );
        }

        vec3 RayMarch(vec3 rayPos, vec3 rayDir) {
            float totalDistance = 0.0f;
            int step;
            for (step = 0; step < MaxSteps; step++) {
                vec3 point = rayPos + rayDir * totalDistance;
                float distance = DE(point);
                totalDistance += distance;
                if (abs(totalDistance) > MaxDistance) break;
                if (abs(distance) < MinDistance) {
                    const vec3 xDir = vec3(MinDistance, 0.0, 0.0);
                    const vec3 yDir = vec3(0.0, MinDistance, 0.0);
                    const vec3 zDir = vec3(0.0, 0.0, MinDistance);
                    vec3 normal = normalize(
                        vec3(
                            DE(point+xDir)-DE(point-xDir),
		                    DE(point+yDir)-DE(point-yDir),
		                    DE(point+zDir)-DE(point-zDir)
                        )
                    );
                    float steps = 1.0 - float(step) / float(MaxSteps);
                    float light = steps * max(0.3, dot(normal, LightDir));
                    return (normal * 0.5 + 0.5) * vec3(steps * light);
                }
            }
            return mix(vec3(1.0), vec3(0.5, 0.7, 1.0), rayDir.y);
        }

        void main() {
            o_Color = vec4(1.0, 0.0, 1.0, 1.0);

            vec2 normUV = v_UV * 2.0 - 1.0;
            normUV.x *= u_Aspect;

            vec3 rayPos = u_Position;
            vec3 rayDir = normalize(
                u_Right * normUV.x +
                u_Up * normUV.y +
                u_Forward
            );

            o_Color.rgb = RayMarch(rayPos, rayDir);
        }
        `;
        const CreateShader = (source, type) => {
            const shader = gl.createShader(type); // TODO: do a null check
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
            }
            return shader;
        };
        mandelbulbShader = gl.createProgram(); // TODO: do a null check
        const vertexShader = CreateShader(VertexShader, gl.VERTEX_SHADER);
        const fragmentShader = CreateShader(FragmentShader, gl.FRAGMENT_SHADER);
        gl.attachShader(mandelbulbShader, vertexShader);
        gl.attachShader(mandelbulbShader, fragmentShader);
        gl.linkProgram(mandelbulbShader);
        if (!gl.getProgramParameter(mandelbulbShader, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(mandelbulbShader));
        }
        gl.detachShader(mandelbulbShader, vertexShader);
        gl.deleteShader(vertexShader);
        gl.detachShader(mandelbulbShader, fragmentShader);
        gl.deleteShader(fragmentShader);
    };
    const DeInit = () => {
        if (mandelbulbShader !== undefined) {
            gl.deleteProgram(mandelbulbShader);
        }
    };
    let position = new Vector3(0.0, 10.0, 0.0);
    let pitch = 0;
    let yaw = 0;
    let forward = new Vector3(0.0, 0.0, 1.0);
    let right = new Vector3(1.0, 0.0, 0.0);
    let up = new Vector3(0.0, 1.0, 0.0);
    let movementX = 0;
    let movementY = 0;
    {
        let clicking = false;
        canvas.addEventListener('mousedown', () => {
            clicking = true;
        });
        canvas.addEventListener('mouseup', () => {
            clicking = false;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (clicking) {
                movementX += e.movementX;
                movementY += e.movementY;
            }
        });
    }
    {
        let clicking = false;
        let lastX = 0;
        let lastY = 0;
        canvas.addEventListener('touchstart', (e) => {
            clicking = true;
            lastX = e.changedTouches[0].clientX;
            lastY = e.changedTouches[0].clientY;
            e.preventDefault();
        });
        canvas.addEventListener('touchend', (e) => {
            clicking = false;
            e.preventDefault();
        });
        canvas.addEventListener('touchmove', (e) => {
            if (clicking) {
                movementX += e.touches[0].clientX - lastX;
                movementY += e.touches[0].clientY - lastY;
            }
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            e.preventDefault();
        });
    }
    const Update = (dt) => {
        yaw -= movementX / canvas.width * 10000.0 * dt;
        pitch -= movementY / canvas.height * 10000.0 * dt;
        movementX = 0;
        movementY = 0;
        pitch = Math.min(90.0, Math.max(-90.0, pitch));
        forward = new Vector3(Math.sin(yaw * (Math.PI / 180.0)) * Math.cos(pitch * (Math.PI / 180.0)), -Math.sin(pitch * (Math.PI / 180.0)), Math.cos(yaw * (Math.PI / 180.0)) * Math.cos(pitch * (Math.PI / 180.0))).Normalized();
        right = Vector3.Cross(new Vector3(0.0, 1.0, 0.0), forward).Normalized();
        up = Vector3.Cross(forward, right).Normalized();
    };
    const Draw = () => {
        gl.useProgram(mandelbulbShader);
        gl.uniform1f(gl.getUniformLocation(mandelbulbShader, "u_Aspect"), canvas.width / canvas.height);
        gl.uniform3f(gl.getUniformLocation(mandelbulbShader, "u_Position"), position.x, position.y, position.z);
        gl.uniform3f(gl.getUniformLocation(mandelbulbShader, "u_Forward"), forward.x, forward.y, forward.z);
        gl.uniform3f(gl.getUniformLocation(mandelbulbShader, "u_Right"), right.x, right.y, right.z);
        gl.uniform3f(gl.getUniformLocation(mandelbulbShader, "u_Up"), up.x, up.y, up.z);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const Resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', Resize);
    Resize();
    let lastTime = 0;
    const Loop = (t) => {
        time = t / 1000;
        let dt = time - lastTime;
        lastTime = time;
        Update(dt);
        Draw();
        requestAnimationFrame(Loop);
    };
    Init();
    window.addEventListener('beforeunload', DeInit);
    Loop(lastTime);
});
//# sourceMappingURL=index.js.map