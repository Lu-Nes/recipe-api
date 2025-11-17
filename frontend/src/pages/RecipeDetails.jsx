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
    const shouldDelete = window.confirm(
      "Möchtest du dieses Rezept wirklich löschen?"
    )

    if (!shouldDelete) return

    try {
      setIsDeleting(true)
      setError(null)

      await deleteRecipe(id)
      console.log("Rezept erfolgreich gelöscht")

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

  return (
    <section className="page">
      <h1>Rezeptdetails</h1>

      {isLoading && <p className="info-text">Rezept wird geladen...</p>}
      {error && !isLoading && <p className="error-text">Fehler: {error}</p>}

      {!isLoading && !error && recipe && (
        <>
          <article className="card">

            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
              {recipe.title}
            </h2>

            {imageUrl && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
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

          <div className="image-upload">
            <h3>Rezeptbild hochladen</h3>
            <p className="info-text">
              Erlaubt sind JPG oder PNG.
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={event => setImageFile(event.target.files[0] || null)}
              />

              <button
                type="button"
                className="button"
                onClick={() => document.getElementById("image-upload").click()}
                style={{ marginBottom: "0.5rem" }}
              >
                📁 Datei auswählen
              </button>

              {imageFile && (
                <span style={{ marginLeft: "1rem" }}>
                  {imageFile.name}
                </span>
              )}
            </div>

            <button
              type="button"
              className="button"
              onClick={handleImageUpload}
              disabled={!imageFile || isUploading}
            >
              {isUploading ? "Bild wird hochgeladen..." : "Bild hochladen"}
            </button>

            {uploadError && (
              <p className="error-text">
                Fehler beim Bild-Upload: {uploadError}
              </p>
            )}
          </div>

          <div
            className="page__actions"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center"
            }}
          >
            <Link to="/recipes" className="button button--secondary">
              Zurück zur Übersicht
            </Link>

            <Link to={`/edit/${recipe._id || recipe.id}`} className="button">
              Rezept bearbeiten
            </Link>

            <div style={{ flex: 1 }}></div>

            <button
              type="button"
              className="button button--danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Rezept wird gelöscht..." : "Rezept löschen"}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default RecipeDetails
