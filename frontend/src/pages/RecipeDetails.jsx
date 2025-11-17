import { useParams, Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchRecipeById, deleteRecipe, uploadRecipeImage, API_BASE_URL } from "../services/api"

function getImageUrl(recipe) {
  if (!recipe || !recipe.image) return null
  const image = recipe.image

  if (image.startsWith("http")) return image
  if (image.startsWith("/")) return API_BASE_URL + image

  return `${API_BASE_URL}/${image}`
}

function RecipeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  const [imageFile, setImageFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await fetchRecipeById(id)
        console.log("Rezeptdetails (Rohdaten):", data)

        if (data && data.recipe) {
          setRecipe(data.recipe)
        } else {
          setRecipe(data)
        }
      } catch (error) {
        console.error("Fehler beim Laden des Rezepts:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipe()
  }, [id])

  const handleDelete = async () => {
    const shouldDelete = window.confirm("Möchtest du dieses Rezept wirklich löschen?")
    if (!shouldDelete) return

    try {
      setIsDeleting(true)
      setError(null)

      await deleteRecipe(id)
      navigate("/recipes")
    } catch (error) {
      console.error("Fehler beim Löschen des Rezepts:", error)
      setError(error.message || "Rezept konnte nicht gelöscht werden.")
      setIsDeleting(false)
    }
  }

  const handleImageUpload = async () => {
    if (!recipe || !imageFile) return

    try {
      setIsUploading(true)
      setUploadError(null)

      const data = await uploadRecipeImage(recipe._id || recipe.id, imageFile)
      console.log("Antwort nach Bild-Upload:", data)

      if (data && data.recipe) {
        setRecipe(data.recipe)
      }

      setImageFile(null)
    } catch (error) {
      console.error("Fehler beim Hochladen des Bildes:", error)
      setUploadError(error.message || "Bild konnte nicht hochgeladen werden.")
    } finally {
      setIsUploading(false)
    }
  }

  const imageUrl = getImageUrl(recipe)
  const buttonStyle = { fontSize: "1rem" }

  return (
    <section className="page">
      <h1>Rezeptdetails</h1>

      {isLoading && <p className="info-text">Rezept wird geladen...</p>}
      {error && <p className="error-text">Fehler: {error}</p>}

      {!isLoading && !error && recipe && (
        <>
          {/* Oberes Rezept-Panel */}
          <article className="card">
            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
              {recipe.title}
            </h2>

            {imageUrl && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1.5rem"
                }}
              >
                <img
                  src={imageUrl}
                  alt={recipe.title}
                  style={{
                    maxWidth: "400px",
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px"
                  }}
                />
              </div>
            )}

            <p>{recipe.description}</p>

            {recipe.ingredients?.length > 0 && (
              <>
                <h3>Zutaten</h3>
                <ul style={{ textAlign: "left" }}>
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            {recipe.steps?.length > 0 && (
              <>
                <h3>Zubereitung</h3>
                <ol style={{ textAlign: "left" }}>
                  {recipe.steps.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              </>
            )}
          </article>

          {/* Bereich Upload-Box + Aktionsbuttons nebeneinander */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              alignItems: "flex-start",
              marginTop: "2rem",
              flexWrap: "wrap"
            }}
          >
            {/* Upload-Box links, etwas schmaler */}
            <div
              className="image-upload"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                flex: "1 1 320px",
                maxWidth: "480px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem"
                }}
              >
                <p className="info-text" style={{ margin: 0 }}>
                  Erlaubt sind JPG oder PNG.
                </p>

                <button
                  type="button"
                  className="button"
                  style={buttonStyle}
                  onClick={() => document.getElementById("image-upload").click()}
                >
                  📁 Datei auswählen
                </button>
              </div>

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={event => setImageFile(event.target.files[0] || null)}
              />

              {imageFile && (
                <p style={{ marginBottom: "1rem" }}>
                  Gewählte Datei: <strong>{imageFile.name}</strong>
                </p>
              )}

              <button
                type="button"
                className="button"
                style={buttonStyle}
                onClick={handleImageUpload}
                disabled={!imageFile || isUploading}
              >
                {isUploading ? "Bild wird hochgeladen..." : "Bild hochladen"}
              </button>

              {uploadError && (
                <p className="error-text">{uploadError}</p>
              )}
            </div>

            {/* Buttons „Rezept bearbeiten / löschen“ rechts, untereinander */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                flex: "0 0 220px"
              }}
            >
              <Link
                to={`/edit/${recipe._id || recipe.id}`}
                className="button"
                style={buttonStyle}
              >
                Rezept bearbeiten
              </Link>

              <button
                type="button"
                className="button button--danger"
                style={buttonStyle}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Rezept wird gelöscht..." : "Rezept löschen"}
              </button>
            </div>
          </div>

          {/* „Zurück zur Übersicht“ mittig darunter */}
          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Link
              to="/recipes"
              className="button button--secondary"
              style={buttonStyle}
            >
              Zurück zur Übersicht
            </Link>
          </div>
        </>
      )}
    </section>
  )
}

export default RecipeDetails
