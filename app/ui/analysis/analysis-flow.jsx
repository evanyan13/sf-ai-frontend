"use client";

import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ProfileNode from './profile-node';
import { useSearchParams } from 'next/navigation';
import { BASE_API_URL } from '@/app/constant';

const nodeTypes = {
    profileNode: ProfileNode
};

const initialNodes = [
    {
        id: 'node-1',
        type: 'profileNode',
        position: { x: 0, y: 0 },
        data: { type: 'person', name: 'John Doe' },
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

const initialEdges = [{ id: 'node-1-node-2', source: 'node-1', target: 'node-2' }, { id: 'node-2-node-3', source: 'node-2', target: 'node-3' }];

const nodeColor = (node) => {
    switch (node.data.type) {
        case 'person':
            return '#3b82f6'; // bg-blue-400 equivalent
        case 'company':
            return '#4ade80'; // bg-green-400 equivalent
        case 'state':
            return '#f87171'; // bg-red-400 equivalent
        default:
            return '#9ca3af'; // bg-gray-400 equivalent
    }
};

const transformNodeDate = (nodes) => {
    return nodes.map((node, index) => {
        // Check if node already has a valid position
        if (node.position && typeof node.position.x === "number" && typeof node.position.y === "number") {
            return node
        }

        const column = index % 3
        const row = Math.floor(index / 3)

        return {
            ...node,
            position: {
                x: column * 250,
                y: row * 150,
            },
        }
    })
}

const fetchCofData = async (query) => {
    try {
        const response = await fetch(BASE_API_URL + 'query_to_graph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export default function AnalysisFlow() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query');

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

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

    useEffect(() => {
        const loadData = async () => {
            if (query) {
                setIsLoading(true);
                const data = await fetchCofData(query);
                setIsLoading(false);

                if (data && data.nodes && data.edges) {
                    setNodes(transformNodeDate(data.nodes));
                    setEdges(data.edges);
                } else {
                    setIsError(true);
                }
            }
        }

        loadData();
    }, [query]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading graph data...</p>
                </div>
            </div>
        );
    }

    // Show loading state
    if (isError) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Graph</h3>
                    <p className="text-red-600">We couldn't display the graph for your query. Please try a different search term.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Back to Search
                    </button>
                </div>
            </div>
        );
    }

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
                <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
        </div>
    );
}