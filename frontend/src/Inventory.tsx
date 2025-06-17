// src/Inventory.tsx

// On met à jour l'interface ici aussi pour qu'elle corresponde
interface Fragment {
  quantity: number;
  relics: { name: string }[] | null;
}

interface InventoryProps {
  fragments: Fragment[] | null;
}

const Inventory = ({ fragments }: InventoryProps) => {
  if (!fragments || fragments.length === 0) {
    return (
      <div className="w-full mt-4">
        <h2 className="text-xl text-center mb-2 text-cyan-300">Inventaire</h2>
        <p className="text-center text-gray-500">Aucun fragment collecté.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <h2 className="text-xl text-center mb-2 text-cyan-300">Inventaire</h2>
      <div className="space-y-1 text-left bg-gray-800 p-2 rounded">
        {fragments.map((fragment, index) => (
          <p key={index} className="text-sm">
            {/* La seule modification est ici : on prend le premier élément de la liste */}
            🧩 {fragment.relics?.[0]?.name || 'Relique Inconnue'}: 
            <span className="font-bold text-white float-right">{fragment.quantity}x</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default Inventory;