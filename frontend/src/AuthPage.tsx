// src/AuthPage.tsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './supabaseClient'

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-white animate-pulse">
            Starcritters
          </h1>
        </div>
        {/* C'est le composant magique qui fait tout pour nous ! */}
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google', 'github']} // Optionnel: on peut ajouter des connexions sociales
        />
      </div>
    </div>
  )
}

export default AuthPage