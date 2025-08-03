import { useState, useCallback, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UrlPreviewNode from "./UrlPreviewNode";
import { ReactFlow, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function getHandleDirection(dx, dy, reversed = false) {
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) return reversed ? "left" : "right";
    else return reversed ? "right" : "left";
  } else {
    if (dy > 0) return reversed ? "top" : "bottom";
    else return reversed ? "bottom" : "top";
  }
}

function Graph() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data;

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );

  const nodeTypes = {
    urlPreview: UrlPreviewNode,
  };

  useLayoutEffect(() => {
    if (!data || data.length === 0) {
      navigate("/");
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    const radius = 600;

    const sourceNode = {
      id: "node-0",
      type: "urlPreview",
      position: { x: centerX, y: centerY },
      data: { url: data[0].url },
    };

    const surroundingNodes = data.slice(1).map((item, i, arr) => {
      const angle = (2 * Math.PI * i) / arr.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        id: `node-${i + 1}`,
        type: "urlPreview",
        position: { x, y },
        data: {
          url: item.url,
          score: item.score,
        },
      };
    });

    setNodes([sourceNode, ...surroundingNodes]);

    const edgesFromSource = surroundingNodes.map((node) => {
      const dx = node.position.x - centerX;
      const dy = node.position.y - centerY;

      const sourceHandle = getHandleDirection(dx, dy, false);
      const targetHandle = getHandleDirection(dx, dy, true);

      return {
        id: `edge-0-${node.id}`,
        source: "node-0",
        sourceHandle,
        target: node.id,
        targetHandle,
        style: {
          stroke: "#776d6dff",
          strokeWidth: 3,
        },
      };
    });

    setEdges(edgesFromSource);
  }, [data, navigate]);

  return (
    <div className="bg-dot-grid flex flex-col items-center justify-center h-screen gap-4">
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </div>
  );
}

export default Graph;
