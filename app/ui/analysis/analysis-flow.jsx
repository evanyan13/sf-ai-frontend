"use client";
import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ProfileNode from './profile-node';

const nodeTypes = {
    profileNode: ProfileNode
};

const initialNodes = [
    {
        id: 'node-1',
        type: 'profileNode',
        position: { x: 0, y: 0 },
        data: { type: 'individual', name: 'John Doe' },
    },
    {
        id: 'node-2',
        type: 'profileNode',
        position: { x: 200, y: 0 },
        data: { type: 'company', name: 'Legal Consult LLC' },
    },
    {
        id: 'node-3',
        type: 'profileNode',
        position: { x: 500, y: 0 },
        data: { type: 'state', name: 'California' },
    },
];

const initialEdges = [{ id: '1-2', source: '1', target: '2' }];

export default function AnalysisFlow() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    return (
        <div style={{ height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeTypes}
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}