import { Handle, Position } from "@xyflow/react";
import whiteImage from "../assets/white_box.png";

function UrlPreviewNode({ data }) {
  const url = data?.url;
  const score = data?.score;

  return (
    <div className="flex items-center gap-4 p-4 border border-white rounded-lg bg-black max-w-xl">
      <div className="relative w-20 h-20">
        <img
          src={whiteImage}
          alt="Preview"
          className="w-20 h-20 object-cover rounded-md flex-shrink-0"
        />
        {score !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center text-black text-lg font-semibold">
            {(score * 100).toFixed(1) + "%"}
          </div>
        )}
      </div>
      <div className="break-all text-white">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:underline"
        >
          {url}
        </a>
      </div>
      {["Top", "Right", "Bottom", "Left"].map((pos) => (
        <Handle
          key={`target-${pos}`}
          type="target"
          position={Position[pos]}
          id={pos.toLowerCase()}
          style={{ opacity: 0 }}
        />
      ))}
      {["Top", "Right", "Bottom", "Left"].map((pos) => (
        <Handle
          key={`source-${pos}`}
          type="source"
          position={Position[pos]}
          id={pos.toLowerCase()}
          style={{ opacity: 0 }}
        />
      ))}
    </div>
  );
}

export default UrlPreviewNode;
