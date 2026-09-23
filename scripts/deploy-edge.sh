#!/usr/bin/env bash
# Deploy da Edge Function process-consultation.
#
# Precisa do Personal Access Token do Supabase (supabase.com/dashboard/account/tokens):
#   SUPABASE_ACCESS_TOKEN=sbp_xxx ./scripts/deploy-edge.sh
#
# Antes de subir, roda a bateria local: `npm run check`.
set -euo pipefail

PROJETO="hkjukobqpjezhpxzplpj"
FUNCAO="process-consultation"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Falta SUPABASE_ACCESS_TOKEN. Pegue em supabase.com/dashboard/account/tokens" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "→ validando antes de subir"
npm run check

echo "→ deploy de $FUNCAO no projeto $PROJETO"
npx --yes supabase@latest functions deploy "$FUNCAO" \
  --project-ref "$PROJETO" \
  --use-api

echo
echo "Subiu. Pra conferir que o encadeamento de socio esta no ar, faca uma"
echo "consulta CNPJ Socios e procure nos logs da funcao:"
echo '  "socio encontrado" ou "nenhum socio PF no retorno do CNPJ"'
