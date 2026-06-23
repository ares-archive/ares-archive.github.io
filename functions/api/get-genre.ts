const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return new Response("Missing steamId parameter", { status: 400, headers: corsHeaders });
  }

  try {
    // Interroghiamo l'API pubblica dello store di Steam
    const steamResponse = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamId}&l=italian`);
    
    if (!steamResponse.ok) {
      return new Response("Errore di comunicazione con Steam", { status: 500, headers: corsHeaders });
    }

    const data = await steamResponse.json() as any;

    // Controlliamo se Steam ha trovato il gioco con quell'ID
    if (!data[steamId] || !data[steamId].success || !data[steamId].data.genres) {
      return new Response(JSON.stringify({ genre: "All" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Estraiamo la lista dei generi passati da Steam
    const steamGenres = data[steamId].data.genres as { id: string; description: string }[];
    
    // Mappiamo i generi di Steam con le stringhe esatte dei tuoi filtri (image_337505.jpg)
    // Se ad esempio Steam risponde "Azione", noi restituiamo "Action" al frontend/Supabase
    let detectedGenre = "All";
    const primaryGenre = steamGenres[0].description.toLowerCase();

    if (primaryGenre.includes("azion") || primaryGenre.includes("action")) {
      detectedGenre = "Action";
    } else if (primaryGenre.includes("avventur") || primaryGenre.includes("adventure")) {
      detectedGenre = "Adventure";
    } else if (primaryGenre.includes("rpg") || primaryGenre.includes("ruolo") || primaryGenre.includes("role")) {
      detectedGenre = "RPG";
    } else if (primaryGenre.includes("indie")) {
      detectedGenre = "Indie";
    } else if (primaryGenre.includes("strateg") || primaryGenre.includes("strategy")) {
      detectedGenre = "Strategy";
    } else if (steamGenres.some(g => g.description.toLowerCase().includes("indie"))) {
      // Controllo secondario: se non è primo ma c'è "Indie" nella lista
      detectedGenre = "Indie";
    }

    return new Response(JSON.stringify({ genre: detectedGenre }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }
};