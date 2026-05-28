import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: "", // Will be filled later
  token: "", // Will be filled later
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "noticia",
        label: "Noticias",
        path: "content/noticias",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Título",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Fecha",
            required: true,
          },
          {
            type: "string",
            name: "author",
            label: "Autor",
            required: true,
          },
          {
            type: "image",
            name: "image",
            label: "Imagen destacada",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenido",
            isBody: true,
          },
        ],
      },
    ],
  },
});