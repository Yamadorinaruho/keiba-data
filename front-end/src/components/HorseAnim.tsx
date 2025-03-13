import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect } from 'react';
// import { OrbitControls } from '@react-three/drei';


type PositionProps = {
    x: number,
    y: number,
    z: number
}

export default function HorseAnim({ x, y, z } : PositionProps) {
    const pos_x = x;
    const pos_y = y;
    const pos_z = z;
    function HorseModel() {
        const { scene, animations } = useGLTF("/the_horse.glb")
        const { actions, names } = useAnimations(animations, scene);
    
        useEffect(() => {
        if (actions[names[0]]) {
            actions[names[0]]?.play();
        }
        }, [actions, names]);
        return <primitive object={scene} scale={1.5} position={[pos_x, pos_y, pos_z]} rotation={[1, -1.5, 0.2]}/>;
    }



    return (
        <>
            <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 2.5, ease: "linear" }}
            className="absolute w-full h-full opacity-70"
            >
            <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <Suspense fallback={null}>
                    <HorseModel  /> 
                </Suspense>
                {/* <OrbitControls /> */}
            </Canvas>
            </motion.div>
        </> 
    );
}