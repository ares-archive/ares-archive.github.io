interface Env {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { code, redirect_uri } = await context.request.json() as { code: string, redirect_uri: string };

    if (!code || !redirect_uri) {
      return new Response("Missing code or redirect_uri", { status: 400 });
    }

    // 1. Scambia il codice temporaneo con Discord per ottenere un Access Token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: context.env.DISCORD_CLIENT_ID,
        client_secret: context.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return new Response(`Errore scambio token: ${errText}`, { status: 400 });
    }

    const tokenData = await tokenResponse.json() as { access_token: string };

    // 2. Chiedi a Discord i dati dell'utente usando il Token appena ottenuto
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return new Response("Errore recupero utente Discord", { status: 400 });
    }

    const userData = await userResponse.json() as { id: string; username: string; global_name?: string; avatar?: string };

    // Costruiamo l'URL dell'avatar ufficiale dell'utente
    const avatarUrl = userData.avatar 
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.id) % 5}.png`;

    // Restituiamo i dati puliti al frontend React
    return Response.json({
      id: userData.id,
      username: userData.username,
      globalName: userData.global_name || userData.username,
      avatar: avatarUrl
    });

  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
};