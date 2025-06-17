import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import EchoField from './EchoField';
import Upgrades from './Upgrades';
import Inventory from './Inventory';
import AuthPage from './AuthPage';

// Interfaces
interface Ship { id: string; energy_cores: number; chrono_particles: number; engine_level: number; reactor_level: number; fabricator_level: number; scanner_level: number; }
interface GridData { grid_distribution: { [key: string]: { relic_id: string } } }
interface Fragment { quantity: number; relics: { name: string } | null; }

function App() {
  const [session, setSession] = useState<any>(null);
  const [ship, setShip] = useState<Ship | null>(null);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [inventory, setInventory] = useState<Fragment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [probedNodes, setProbedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    async function getGameData() {
      try {
        setLoading(true);
        const user = session.user;
        const [shipRes, gridRes, inventoryRes] = await Promise.all([
          supabase.from('ships').select('*').eq('player_id', user.id).single(),
          supabase.from('daily_grids').select('grid_distribution').order('grid_date', { ascending: false }).limit(1).single(),
          supabase.from('player_relic_fragments').select('quantity, relics(name)').eq('player_id', user.id)
        ]);
        if (shipRes.error) throw shipRes.error; setShip(shipRes.data);
        if (gridRes.error) throw gridRes.error; setGridData(gridRes.data);
        if (inventoryRes.error) throw inventoryRes.error; setInventory(inventoryRes.data);
      } catch (error) { if (error instanceof Error) alert(error.message); } finally { setLoading(false); }
    }
    getGameData();
  }, [session]);

  // --- VERSION CORRIGÉE ET COMPLÈTE DE LA LOGIQUE DE CLIC ---
  const handleProbeNode = async (x: number, y: number) => {
    const coordKey = `${x}_${y}`;
    if (!ship || !session || !gridData || ship.energy_cores <= 0 || probedNodes.has(coordKey)) {
      if (probedNodes.has(coordKey)) console.log("Ce node a déjà été sondé.");
      return;
    }

    const newProbedNodes = new Set(probedNodes).add(coordKey);
    setProbedNodes(newProbedNodes);

    let newShipState = { ...ship, energy_cores: ship.energy_cores - 1 };
    
    const foundRelic = gridData.grid_distribution[coordKey];
    if (foundRelic) {
      console.log(`BINGO! Fragment de relique trouvé : ${foundRelic.relic_id}`);
      await supabase.rpc('award_relic_fragment', { p_player_id: session.user.id, p_relic_id: foundRelic.relic_id });
      const { data: newInventory } = await supabase.from('player_relic_fragments').select('quantity, relics(name)').eq('player_id', session.user.id);
      setInventory(newInventory);
    } else {
      newShipState.chrono_particles += 10;
    }
    setShip(newShipState);

    await supabase.from('ships').update({ 
      energy_cores: newShipState.energy_cores, 
      chrono_particles: newShipState.chrono_particles 
    }).eq('player_id', session.user.id);
  };
  
  // --- VERSION CORRIGÉE ET COMPLÈTE DE LA LOGIQUE D'AMÉLIORATION ---
  const handleUpgradeShip = async (system: string) => {
    if (!ship || !session) return;
    const upgradeCosts: { [key: string]: number } = { engine: 100, reactor: 120, fabricator: 150, scanner: 200 };
    const cost = upgradeCosts[system];
    if (ship.chrono_particles < cost) {
      alert("Pas assez de Chrono-Particules !");
      return;
    }
    const systemLevelKey = `${system}_level` as keyof Ship;
    const currentLevel = ship[systemLevelKey] as number;
    const newShipState = {
      ...ship,
      chrono_particles: ship.chrono_particles - cost,
      [systemLevelKey]: currentLevel + 1,
    };
    setShip(newShipState);

    await supabase.from('ships').update({ 
      chrono_particles: newShipState.chrono_particles, 
      [systemLevelKey]: currentLevel + 1
    }).eq('player_id', session.user.id);
  };
  
  if (!session) {
    return <AuthPage />;
  }

  return (
    <main className="bg-gray-900 text-cyan-400 min-h-screen flex flex-col items-center justify-center font-mono p-4">
      <div className="w-full max-w-md mb-8">
        <div className="border border-cyan-400 p-6 rounded-lg shadow-lg shadow-cyan-500/20 text-center relative">
          <button onClick={() => supabase.auth.signOut()} className="absolute top-2 right-2 text-xs bg-red-800 hover:bg-red-700 text-white py-1 px-2 rounded">
            Déconnexion
          </button>
          <h1 className="text-4xl mb-4 animate-pulse">Starcritters</h1>
          {loading ? <p>Chargement...</p> : ship ? (
            <div className="text-left text-lg space-y-2">
              <p>🔋 Energie: <span className="font-bold text-white">{ship.energy_cores}</span></p>
              <p>⚡ Particules: <span className="font-bold text-white">{ship.chrono_particles}</span></p>
            </div>
          ) : <p className="text-red-500">Erreur de chargement du vaisseau.</p>}
          {ship && <Upgrades ship={ship} onUpgrade={handleUpgradeShip} />}
          {inventory && <Inventory fragments={inventory} />}
        </div>
      </div>
      
      {loading ? <p>Chargement de l'Echo Field...</p> : gridData ? (
        <EchoField gridData={gridData.grid_distribution} probedNodes={probedNodes} onNodeClick={handleProbeNode} />
      ) : <p className="text-red-500">Erreur de chargement de la grille.</p>}
    </main>
  );
}

export default App;