Crear en @file/index.html 

un javascript que busque un query en la URL

puede funcionar con el query en español o ingles

?cotizacion=a122
?quote=a122

hay que crea una fuente de verdad de las cotizaciones / base de datos (arbol de datos JSON)

que sera

```json
{
    "cotizaciones": [
        {
            "id": "a122",
            "cliente": "Cliente 1",
            "tipo": "devs",
            "folio": "abc123",
            "fecha": "Fecha 1",
            "url_md": "/cotizaciones/s001.md"
        }
    ]
}
```

FORMATO DE FOLIADO

una letra y 3 numeros

EXISTEN 4 LETRAS

- s
- d
- m
- b

existen 4 categorias

- marketing
- devs
- branding
- studio

cada letra corresponde a una categoria

- s -> marketing
- d -> devs
- m -> branding
- b -> studio


Ejemplo:

- s001
- b001
- m001
- d001



FORMATO DE FECHAS

debe res legible por el humano con menor carga cognitiva
ejemplo:
03 de febrero de 2026

hay que tener un json de clientes tambien

```json
{
    "clientes": [
        {
            "id": "1",
            "nombre": "Cliente 1",
            "contactos": [
                {
                    "nombre": "Contacto 1",
                    "email": "  [EMAIL_ADDRESS]",
                    "telefono": "123456789"
                }
            ]
        }
    ]
}
```

el contenido de la cotizacion se obtendra de un archivo md

que tendra el siguiente formato:

@modelo-cotizacion-estandar.md

se renderizara con la api

<script type="module">
      import { marked } from "https://cdn.jsdelivr.net/npm/marked/+esm";

      const url =
        "";

      const res = await fetch(url);
      const markdown = await res.text();

      document.getElementById("content").innerHTML = marked(markdown);
    </script>