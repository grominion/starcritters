// src/Upgrades.tsx
interface UpgradesProps {
  ship: { engine_level: number; reactor_level: number; fabricator_level: number; scanner_level: number; };
  onUpgrade: (system: string) => void;
}

const upgradeCosts: { [key: string]: number } = {
  engine: 100, reactor: 120, fabricator: 150, scanner: 200
};

const UpgradeButton = ({ name, level, onUpgrade }: { name: string; level: number; onUpgrade: (system: string) => void; }) => (
  <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
    <div>
      <p className="font-bold">{name}</p>
      <p className="text-sm text-cyan-300">Niveau: {level}</p>
    </div>
    <button 
      onClick={() => onUpgrade(name.toLowerCase())}
      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded text-sm"
    >
      Améliorer ({upgradeCosts[name.toLowerCase()] || 0}⚡)
    </button>
  </div>
);

const Upgrades = ({ ship, onUpgrade }: UpgradesProps) => {
  return (
    <div className="w-full mt-4">
      <h2 className="text-xl text-center mb-2 text-cyan-300">Améliorations</h2>
      <div className="space-y-2">
        <UpgradeButton name="Engine" level={ship.engine_level} onUpgrade={onUpgrade} />
        <UpgradeButton name="Reactor" level={ship.reactor_level} onUpgrade={onUpgrade} />
        <UpgradeButton name="Fabricator" level={ship.fabricator_level} onUpgrade={onUpgrade} />
        <UpgradeButton name="Scanner" level={ship.scanner_level} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

export default Upgrades;