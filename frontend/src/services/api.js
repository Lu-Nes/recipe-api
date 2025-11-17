export const API_BASE_URL = "http://localhost:3000"

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

    const responseData = await response.json().catch(() => null)

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
  // Schickt Registrierungs-Daten ans Backend
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(data)
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Registrierung fehlgeschlagen!"

      throw new Error(message)
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export async function fetchRecipes() {
  // Holt alle öffentlichen Rezepte
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: "GET",
      credentials: "include"
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Rezepte konnten nicht geladen werden!"

      throw new Error(message)
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export async function fetchRecipeById(id) {
  // Holt ein einzelnes Rezept nach ID
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: "GET",
      credentials: "include"
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Rezept konnte nicht geladen werden!"

      throw new Error(message)
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export async function fetchMyRecipes() {
  // Holt alle eigenen Rezepte (auth-pflichtig)
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/my-recipes`, {
      method: "GET",
      credentials: "include"
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Eigene Rezepte konnten nicht geladen werden!"

      throw new Error(message)
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export async function createRecipe(data) {
  // Erstellt ein neues Rezept (auth-pflichtig)
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(data)
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Rezept konnte nicht erstellt werden!"

      throw new Error(message)
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export async function updateRecipe(id, data) {
  // Aktualisiert ein bestehendes Rezept (auth-pflichtig, nur Autor)
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(data)
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Rezept konnte nicht aktualisiert werden!"

      throw new Error(message)
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export async function deleteRecipe(id) {
  // Löscht ein Rezept (auth-pflichtig, nur Autor)
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: "DELETE",
      credentials: "include"
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Rezept konnte nicht gelöscht werden!"

      throw new Error(message)
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export async function uploadRecipeImage(id, file) {
  // Lädt ein Bild für ein Rezept hoch (auth-pflichtig, nur Autor)
  try {
    const formData = new FormData()
    // Feldname "image" muss zum Multer-Setup passen
    formData.append("image", file)

    const response = await fetch(`${API_BASE_URL}/recipes/${id}/image`, {
      method: "POST",
      credentials: "include",
      body: formData
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      const message = responseData && responseData.message ? responseData.message : "Rezeptbild konnte nicht hochgeladen werden!"

      throw new Error(message)
    }

    return responseData
  } catch (error) {
    throw error
  }
}
