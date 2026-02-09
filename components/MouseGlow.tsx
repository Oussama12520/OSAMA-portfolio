import React, { useEffect, useRef } from 'react';

const MouseGlow: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Cube Logic
        const cubes: { x: number; y: number; z: number; size: number; rotation: { x: number, y: number, z: number }; speed: { x: number, y: number, z: number } }[] = [];
        const count = 20;

        for (let i = 0; i < count; i++) {
            cubes.push({
                x: (Math.random() - 0.5) * width * 1.5,
                y: (Math.random() - 0.5) * height * 1.5,
                z: Math.random() * 500 + 100,
                size: Math.random() * 30 + 20,
                rotation: { x: Math.random(), y: Math.random(), z: Math.random() },
                speed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            });
        }

        const project = (x: number, y: number, z: number) => {
            const scale = 500 / (500 + z);
            return { x: width / 2 + x * scale, y: height / 2 + y * scale, scale };
        };

        const drawCube = (cube: any) => {
            // Simple 8 vertices of a cube
            const v = [
                { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
                { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
            ];

            // Rotate & Scale
            const rotatedV = v.map(p => {
                // Rotate X
                let y = p.y * Math.cos(cube.rotation.x) - p.z * Math.sin(cube.rotation.x);
                let z = p.y * Math.sin(cube.rotation.x) + p.z * Math.cos(cube.rotation.x);
                let x = p.x;

                // Rotate Y
                let z2 = z * Math.cos(cube.rotation.y) - x * Math.sin(cube.rotation.y);
                let x2 = z * Math.sin(cube.rotation.y) + x * Math.cos(cube.rotation.y);

                // Apply Size + World Position
                return {
                    x: x2 * cube.size + cube.x,
                    y: y * cube.size + cube.y,
                    z: z2 * cube.size + cube.z
                };
            });

            // Project to 2D
            const points = rotatedV.map(p => project(p.x, p.y, p.z));

            ctx.strokeStyle = '#10B981'; // Emerald
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;

            // Draw Edges
            const edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Front face
                [4, 5], [5, 6], [6, 7], [7, 4], // Back face
                [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting lines
            ];

            ctx.beginPath();
            edges.forEach(edge => {
                ctx.moveTo(points[edge[0]].x, points[edge[0]].y);
                ctx.lineTo(points[edge[1]].x, points[edge[1]].y);
            });
            ctx.stroke();

            return points; // Return points for connection logic
        };

        let time = 0;
        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            time += 0.01;
            cubes.forEach(cube => {
                cube.rotation.x += cube.speed.x;
                cube.rotation.y += cube.speed.y;
                cube.rotation.z += cube.speed.z;

                // Interactive tilt
                // cube.x += Math.sin(time) * 0.5;
            });

            // Sort by Z for simpler rendering (painters algorithm basic)
            cubes.sort((a, b) => b.z - a.z);

            const allPoints: { x: number, y: number }[] = [];

            cubes.forEach(cube => {
                const pts = drawCube(cube);
                allPoints.push(pts[0]); // Track centers/corners for connections (optional)
            });

            requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        const animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-40"
        />
    );
};

export default MouseGlow;
