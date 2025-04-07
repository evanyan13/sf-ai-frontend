"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    MiniMap,
    useReactFlow,
    Panel,
} from "@xyflow/react"
import Dagre from "@dagrejs/dagre"
import ProfileNode from "./profile-node"
import CustomEdge from "./custom-edge"
import { useSearchParams } from "next/navigation"
import { BASE_API_URL } from "@/app/constant"

import "@xyflow/react/dist/style.css"

const nodeTypes = {
    profileNode: ProfileNode,
}

const edgeTypes = {
    customEdge: CustomEdge,
}

const initialNodes = [
    {
        id: "node-1",
        type: "profileNode",
        position: { x: 0, y: 0 },
        data: { type: "person", name: "John Doe" },
    },
    {
        id: "node-2",
        type: "profileNode",
        position: { x: 200, y: 0 },
        data: { type: "company", name: "Legal Consult LLC" },
    },
    {
        id: "node-3",
        type: "profileNode",
        position: { x: 500, y: 0 },
        data: { type: "state", name: "California" },
    },
]

const initialEdges = [
    { id: "node-1-node-2", source: "node-1", target: "node-2", type: "customEdge" },
    { id: "node-2-node-3", source: "node-2", target: "node-3", type: "customEdge" },
]

const nodeColor = (node) => {
    switch (node.data.type) {
        case "person":
            return "#3b82f6" // bg-blue-400 equivalent
        case "company":
            return "#4ade80" // bg-green-400 equivalent
        case "state":
            return "#f87171" // bg-red-400 equivalent
        default:
            return "#9ca3af" // bg-gray-400 equivalent
    }
}

// Dagre layout function
const getLayoutedElements = (nodes, edges, options = { direction: "TB" }) => {
    // Create a new directed graph
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

    // Set the graph direction (TB = top-bottom, LR = left-right)
    g.setGraph({
        rankdir: options.direction,
        nodesep: 80, // Increase space between nodes in the same rank
        ranksep: 100, // Increase space between ranks
        ranker: "network-simplex", // Use network-simplex for better layout
    })

    // Add edges to the graph
    edges.forEach((edge) => g.setEdge(edge.source, edge.target))

    // Add nodes to the graph with dimensions
    nodes.forEach((node) => {
        // Use default dimensions if not available
        const width = node.width || 180
        const height = node.height || 80

        g.setNode(node.id, { width, height })
    })

    // Run the layout algorithm
    Dagre.layout(g)

    // Get the positioned nodes
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = g.node(node.id)

        return {
            ...node,
            // We need to adjust the position because Dagre positions nodes at their center
            // while ReactFlow positions nodes at their top-left corner
            position: {
                x: nodeWithPosition.x - (node.width || 180) / 2,
                y: nodeWithPosition.y - (node.height || 80) / 2,
            },
        }
    })

    return {
        nodes: layoutedNodes,
        edges,
    }
}

const fetchCofData = async (query) => {
    console.log("Fetching data for query:", JSON.stringify({ query }))
    // const isExploded = true;
    const isExploded = false;

    try {
        const urlEndpoint = isExploded ? "queries_to_graph" : "queries_to_graph_v2"

        const response = await fetch(BASE_API_URL + urlEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Fetched data:", data)
        return data
    } catch (error) {
        console.error("Error fetching data:", error)
        return null
    }
}

const positionNodesInGrid = (nodes, columns = 3, startX = 50, startY = 50, xGap = 250, yGap = 150) => {
    return nodes.map((node, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);

        return {
            ...node,
            position: {
                x: startX + (column * xGap),
                y: startY + (row * yGap)
            }
        };
    });
};

function AnalysisFlowContentInner({ query }) {
    const { fitView } = useReactFlow()
    const [nodes, setNodes] = useState(initialNodes)
    const [edges, setEdges] = useState(initialEdges)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [layoutDirection, setLayoutDirection] = useState("TB") // Default to top-bottom

    const onNodesChangeHandler = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [])

    const onEdgesChangeHandler = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: "customEdge" }, eds)),
        []
    )

    // Apply layout with the current direction
    const applyLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, {
            direction: layoutDirection,
        })

        setNodes([...layoutedNodes])
        setEdges([...layoutedEdges])

        // Use setTimeout to ensure the nodes are rendered before fitting the view
        setTimeout(() => {
            fitView({ padding: 0.2 })
        }, 50)
    }, [nodes, edges, layoutDirection, fitView])

    // Change layout direction
    const onLayoutDirectionChange = useCallback(
        (direction) => {
            setLayoutDirection(direction)

            // Apply the new layout after state update
            setTimeout(() => {
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, { direction })

                setNodes([...layoutedNodes])
                setEdges([...layoutedEdges])

                setTimeout(() => {
                    fitView({ padding: 0.2 })
                }, 50)
            }, 10)
        },
        [nodes, edges, fitView],
    )

    useEffect(() => {
        const loadData = async () => {
            if (query) {
                setIsLoading(true)
                const data = await fetchCofData(query)
                setIsLoading(false)

                if (data && data.nodes && data.edges) {
                    // First set the nodes with their original positions
                    const positionedNodes = positionNodesInGrid(data.nodes);
                    setNodes(positionedNodes);
                    setEdges(data.edges)

                    // Then apply layout in the next render cycle
                    setTimeout(() => {
                        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(data.nodes, data.edges, {
                            direction: layoutDirection,
                        })

                        setNodes([...layoutedNodes])
                        setEdges([...layoutedEdges])

                        setTimeout(() => {
                            fitView({ padding: 0.2 })
                        }, 50)
                    }, 10)
                } else {
                    setIsError(true)
                }
            } else {
                // Apply layout to initial nodes
                setTimeout(() => {
                    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges, {
                        direction: layoutDirection,
                    })

                    setNodes([...layoutedNodes])
                    setEdges([...layoutedEdges])
                    setIsLoading(false)

                    setTimeout(() => {
                        fitView({ padding: 0.2 })
                    }, 50)
                }, 10)
            }
        }

        loadData()
    }, [query, fitView, layoutDirection])

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading graph data...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (isError) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-red-500 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Graph</h3>
                    <p className="text-red-600">
                        We couldn't display the graph for your query. Please try a different search term.
                    </p>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Back to Search
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChangeHandler}
                onEdgesChange={onEdgesChangeHandler}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
            >
                <Background />
                <Controls />
                <Panel position="top-right" className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onLayoutDirectionChange("TB")}
                            className={`px-3 py-1 rounded ${layoutDirection === "TB" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                }`}
                        >
                            Horizontal Layout
                        </button>
                        <button
                            onClick={() => onLayoutDirectionChange("LR")}
                            className={`px-3 py-1 rounded ${layoutDirection === "LR" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                }`}
                        >
                            Vertical Layout
                        </button>
                    </div>
                    <button onClick={applyLayout} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                        Reset Layout
                    </button>
                </Panel>
                <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
        </div>
    )
}

// Create a wrapper component that includes the ReactFlowProvider
function AnalysisFlowContent() {
    const searchParams = useSearchParams()
    const query = searchParams.get("query")

    return (
        <ReactFlowProvider>
            <AnalysisFlowContentInner query={query} />
        </ReactFlowProvider>
    )
}

export default function AnalysisFlow() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <AnalysisFlowContent />
        </Suspense>
    )
}

