const API_BASE_URL = "https://recipe-api-yhhy.onrender.com"


export async function loginUser(data) {
  // Schickt Login-Daten ans Backend
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // WICHTIG: sorgt dafür, dass das HttpOnly-Cookie vom Backend gesetzt/mitgeschickt wird
      credentials: "include",
      body: JSON.stringify(data)
    })

    const responseData = await response.json().catch(() => null);

    // Wenn der Status nicht 2xx ist, Fehler werfen
    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Login fehlgeschlagen!"

      throw new Error(message)
    }

    // Bei Erfolg, Daten werden an Aufrufer zurück gegeben
    return responseData
  } catch (error) {
    throw error
  }
}

export async function registerUser(data) {
  /* TODO: Backend-Aufruf hier ergänzen */
}

export async function fetchRecipes() {
  /* TODO: Backend-Aufruf hier ergänzen */
}

export async function fetchRecipeById(id) {
  /* TODO: Backend-Aufruf hier ergänzen */
}

export async function fetchMyRecipes() {
  /* TODO: Backend-Aufruf hier ergänzen */
}

export async function createRecipe(data) {
  /* TODO: Backend-Aufruf hier ergänzen */
}

export async function updateRecipe(id, data) {
  /* TODO: Backend-Aufruf hier ergänzen */
}

export async function deleteRecipe(id) {
  /* TODO: Backend-Aufruf hier ergänzen */
}
