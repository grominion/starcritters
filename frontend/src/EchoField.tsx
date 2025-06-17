// src/EchoField.tsx

interface NodeProps {
  x: number;
  y: number;
  hasRelic: boolean;
  isProbed: boolean; // Le Node sait maintenant s'il a été sondé
  onClick: (x: number, y: number) => void;
}

const Node = ({ x, y, hasRelic, isProbed, onClick }: NodeProps) => {
  let bgColor = 'bg-gray-800'; // Couleur par défaut
  if (isProbed) {
    bgColor = hasRelic ? 'bg-yellow-500' : 'bg-gray-600'; // Jaune si relique, gris si vide
  } else if (hasRelic) {
    // On garde la couleur cyan pour les reliques non découvertes (pour notre débogage)
    bgColor = 'bg-cyan-700'; 
  }

  return (
    <div
      className={`w-5 h-5 ${bgColor} border-t border-l border-gray-700 hover:bg-yellow-400 ${isProbed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => onClick(x, y)}
      title={`Node (${x}, ${y})`}
    />
  );
};

interface EchoFieldProps {
  gridData: { [key: string]: { relic_id: string } };
  probedNodes: Set<string>; // On reçoit la liste des nodes sondés
  onNodeClick: (x: number, y: number) => void;
}

const EchoField = ({ gridData, probedNodes, onNodeClick }: EchoFieldProps) => {
  const gridSize = 32;

  return (
    <div className="mt-8 p-2 border-2 border-cyan-800 bg-black bg-opacity-50">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1.25rem)`, gridTemplateRows: `repeat(${gridSize}, 1.25rem)` }}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const coordKey = `${x}_${y}`;
          const hasRelic = !!gridData[coordKey];
          // On vérifie si ce Node a déjà été sondé
          const isProbed = probedNodes.has(coordKey);
          
          return <Node key={`${x}-${y}`} x={x} y={y} hasRelic={hasRelic} isProbed={isProbed} onClick={onNodeClick} />;
        })}
      </div>
    </div>
  );
};

export default EchoField;