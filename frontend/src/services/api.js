const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const apiBaseUrl = configuredApiBaseUrl || (import.meta.env.DEV ? "http://localhost:3000" : null)

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL muss außerhalb der Vite-Entwicklungsumgebung gesetzt sein.")
}

export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, "")

export function getImageUrl(image) {
  if (typeof image !== "string") {
    return null
  }

  const imagePath = image.trim()

  if (!imagePath) {
    return null
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }

  return `${API_BASE_URL}/${imagePath.replace(/^\/+/, "")}`
}

function getAuthErrorMessage(responseData, fallbackMessage) {
  const validationMessages = Array.isArray(responseData?.errors)
    ? responseData.errors
        .map(error => typeof error?.msg === "string" ? error.msg.trim() : "")
        .filter(Boolean)
    : []

  if (validationMessages.length > 0) {
    return validationMessages.join(" ")
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message.trim()
  }

  return fallbackMessage
}

function createApiError(message, status, errors) {
  const error = new Error(message)
  error.status = status

  if (Array.isArray(errors)) {
    error.errors = errors
  }

  return error
}

async function fetchAuth(url, options) {
  try {
    return await fetch(url, options)
  } catch {
    throw new Error("Verbindung zum Server konnte nicht hergestellt werden!")
  }
}

// Das Backend bestimmt den Sessionstatus; deshalb wird das HttpOnly-Cookie bei allen Auth-Anfragen berücksichtigt.
export async function loginUser(data) {
  const response = await fetchAuth(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(data)
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getAuthErrorMessage(responseData, "Login fehlgeschlagen!"))
  }

  return responseData
}

export async function registerUser(data) {
  const response = await fetchAuth(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(data)
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getAuthErrorMessage(responseData, "Registrierung fehlgeschlagen!"))
  }

  return responseData
}

export async function getCurrentUser() {
  const response = await fetchAuth(`${API_BASE_URL}/users/profile`, {
    method: "GET",
    credentials: "include"
  })

  const responseData = await response.json().catch(() => null)

  if (response.status === 401 || response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(getAuthErrorMessage(responseData, "Aktueller Benutzer konnte nicht geladen werden!"))
  }

  if (!responseData?.user || typeof responseData.user !== "object" || Array.isArray(responseData.user)) {
    throw new Error("Benutzerdaten konnten nicht geladen werden!")
  }

  return responseData.user
}

export async function logoutUser() {
  const response = await fetchAuth(`${API_BASE_URL}/users/logout`, {
    method: "POST",
    credentials: "include"
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw createApiError(
      getAuthErrorMessage(responseData, "Logout fehlgeschlagen!"),
      response.status
    )
  }

  return responseData
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
      throw createApiError(
        getAuthErrorMessage(responseData, "Rezept konnte nicht geladen werden!"),
        response.status
      )
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
      const fallbackMessage = response.status === 401
        ? "Du bist nicht eingeloggt oder deine Sitzung ist abgelaufen."
        : "Fehler beim Laden deiner Rezepte"
      const message = responseData && responseData.message ? responseData.message : fallbackMessage

      throw createApiError(message, response.status)
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
      throw createApiError(
        getAuthErrorMessage(responseData, "Rezept konnte nicht erstellt werden!"),
        response.status,
        responseData?.errors
      )
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
      throw createApiError(
        getAuthErrorMessage(responseData, "Rezept konnte nicht aktualisiert werden!"),
        response.status,
        responseData?.errors
      )
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
      throw createApiError(
        getAuthErrorMessage(responseData, "Rezept konnte nicht gelöscht werden!"),
        response.status
      )
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
      throw createApiError(
        getAuthErrorMessage(responseData, "Rezeptbild konnte nicht hochgeladen werden!"),
        response.status
      )
    }

    return responseData
  } catch (error) {
    throw error
  }
}

export async function deleteRecipeImage(id) {
  // Entfernt das Bild eines Rezepts (auth-pflichtig, nur Autor)
  const response = await fetch(`${API_BASE_URL}/recipes/${id}/image`, {
    method: "DELETE",
    credentials: "include"
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    throw createApiError(
      getAuthErrorMessage(responseData, "Rezeptbild konnte nicht entfernt werden!"),
      response.status
    );
  }

  return responseData;
}
