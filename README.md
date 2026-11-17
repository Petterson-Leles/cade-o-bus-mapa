# Cadê o Busão · mapa de BH

Imagens do mapa de Belo Horizonte usadas pelo app de relógio **Cadê o Busão** (Zepp OS).
O app baixa estas imagens uma vez, com permissão de quem usa, e mostra as ruas no fundo do mapa.

## Conteúdo

- `manifest.json`: projeção, área coberta, níveis de zoom, tamanho de cada tema e o caminho das imagens.
- `dark/` e `light/`: um tema por pasta; dentro, um nível de zoom por pasta (`40`, `80` e `160` pixels por km), com imagens de 256×256 nomeadas `{x}_{y}.png`.
- `tools/`: como as imagens foram desenhadas.

| Tema | Tamanho |
| --- | --- |
| Escuro | ~3,7 MB |
| Claro | ~3,3 MB |

## Projeção

Equiretangular simples, igual à do app:

```
x = (lon - origin.lon) * 111320 * cos(latRef) * pxPerKm / 1000
y = (origin.lat - lat) * 111320 * pxPerKm / 1000
```

A imagem `{x}_{y}.png` cobre os pixels de `x*256` a `x*256+255` (idem para `y`).

## Atribuição e licença

Dados do mapa © colaboradores do [OpenStreetMap](https://www.openstreetmap.org/copyright), disponíveis sob a
[Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/). Estas imagens são uma obra
produzida a partir desses dados e precisam manter esta atribuição.
