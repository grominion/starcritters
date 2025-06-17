// Important: This line allows us to use TypeScript types for Supabase.
/// <reference types="https/esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'
import { corsHeaders } from '../_shared/cors.ts'

// Define the structure of our data for type safety.
interface Relic {
  id: string
  name: string
  value_usd: number
  desirability_score: number
}

// =================================================================
// THE CORE LOGIC OF OUR GAME'S ECONOMY
// =================================================================
Deno.serve(async (req) => {
  // This function must be called with a POST request for security.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    // 1. SETUP: Create a Supabase client to interact with our database.
    // We use the 'service_role' key to have admin-level access,
    // which is required to write to restricted tables like 'daily_grids'.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // =================================================================
    // PHASE 1: DATA INGESTION
    // =================================================================

    // Fetch the latest economic report (from yesterday).
    const { data: latestReport, error: reportError } = await supabaseAdmin
      .from('daily_economic_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(1)
      .single()

    if (reportError || !latestReport) {
      throw new Error(`Could not fetch latest economic report: ${reportError?.message || 'No reports found'}`)
    }

    // Fetch the full catalog of available relics.
    const { data: relics, error: relicsError } = await supabaseAdmin
      .from('relics')
      .select('id, name, value_usd, desirability_score')

    if (relicsError || !relics) {
      throw new Error(`Could not fetch relics catalog: ${relicsError?.message}`)
    }

    // =================================================================
    // PHASE 2: ECONOMIC POLICY & BUDGETING
    // =================================================================
    const TARGET_MARGIN = 0.5 // 50% profit margin
    const BASE_FRAGMENTS_PER_GRID = 250 // Baseline number of fragments

    // Calculate today's prize budget.
    const prizeBudgetUsd = latestReport.total_revenue_usd * (1 - TARGET_MARGIN)

    // For now, we'll keep fragment count static.
    // In the future, we would use player growth to adjust this.
    const totalFragmentsToPlace = BASE_FRAGMENTS_PER_GRID

    console.log(`Today's Prize Budget: $${prizeBudgetUsd}`)
    console.log(`Total Fragments to Place: ${totalFragmentsToPlace}`)

    // =================================================================
    // PHASE 3: THE AI CORE - MOCK IMPLEMENTATION
    // =================================================================

    // In a real application, we would construct a detailed prompt here
    // and send it to an LLM like GPT-4, Claude, or Gemini.
    // For this MVP, we will SIMULATE the AI's response to avoid
    // the complexity of managing API keys and external calls.

    console.log("Simulating AI call to generate grid distribution...")

    const simulatedAiResponse = {
      mystery_image_theme: "A raccoon astronaut discovering a crystal cave",
      grid_distribution: {
        // We will just place fragments of the first relic we find for this simulation.
        "10_15": { "relic_id": relics[0].id },
        "25_40": { "relic_id": relics[0].id },
        "50_5":  { "relic_id": relics[0].id },
        "5_60":  { "relic_id": relics[1].id },
        "33_33": { "relic_id": relics[1].id },
      },
    }

    // =================================================================
    // PHASE 4: EXECUTION & FINALIZATION
    // =================================================================

    // 1. Validate the AI response (even our simulated one).
    // Let's check if the total value of placed fragments respects the budget.
    let placedValue = 0
    const gridDistribution = simulatedAiResponse.grid_distribution
    for (const coord in gridDistribution) {
      const relicId = gridDistribution[coord].relic_id
      const relicInfo = relics.find(r => r.id === relicId)
      if (relicInfo) {
        placedValue += relicInfo.value_usd
      }
    }

    console.log(`Total value of placed relics: $${placedValue.toFixed(2)}`)
    if (placedValue > prizeBudgetUsd) {
      throw new Error(
        `AI Budget Exceeded: Placed value ($${placedValue}) is greater than budget ($${prizeBudgetUsd}).`
      )
    }

    // 2. Generate the mystery image URL (using a placeholder service).
    const themeForUrl = simulatedAiResponse.mystery_image_theme.replace(/\s/g, '+')
    const mysteryImageUrl = `https://source.unsplash.com/1024x1024/?${themeForUrl}`

    // 3. Commit the new grid to the database.
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    const { error: insertError } = await supabaseAdmin
      .from('daily_grids')
      .insert({
        grid_date: today,
        mystery_image_theme: simulatedAiResponse.mystery_image_theme,
        mystery_image_url: mysteryImageUrl,
        grid_distribution: simulatedAiResponse.grid_distribution,
      })

    if (insertError) {
      // Handle cases where a grid for today might already exist.
      if (insertError.code === '23505') { // Uniqueness violation
        throw new Error(`A grid for date ${today} already exists.`)
      }
      throw new Error(`Failed to insert new grid into database: ${insertError.message}`)
    }

    // If we reach here, everything was successful.
    return new Response(JSON.stringify({ message: `Successfully generated grid for ${today}.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // Generic error handling.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})