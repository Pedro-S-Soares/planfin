#!/usr/bin/env bash
# Deploy de produção do Planfin com backup obrigatório antes.
#
# O `fly deploy` roda as migrations (release_command), então nada sobe sem um
# backup novo e verde no repositório privado Pedro-S-Soares/planfin-backups.
#
# Uso:
#   scripts/deploy.sh                 # backup + backend
#   scripts/deploy.sh --frontend      # backup + backend + frontend (Vercel)
#   scripts/deploy.sh --backup-only   # só o backup (não publica nada)
#
# Opções:
#   --allow-any-ref   não exigir que o HEAD seja igual a origin/main
#   -h, --help        mostra esta ajuda
#
# Requisitos: gh (logado com acesso ao repo de backups), flyctl logado e, com
# --frontend, vercel logado e mobile/.vercel/project.json presente.
set -euo pipefail

BACKUP_REPO="Pedro-S-Soares/planfin-backups"
BACKUP_WORKFLOW="backup.yml"
FLY_APP="planfin-api"
FRONTEND_URL="https://planfin.app.br"
API_HOST="api.planfin.app.br"

with_frontend=0
backup_only=0
allow_any_ref=0

usage() { sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'; }
log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERRO: %s\n' "$*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --frontend) with_frontend=1 ;;
    --backup-only) backup_only=1 ;;
    --allow-any-ref) allow_any_ref=1 ;;
    -h | --help) usage; exit 0 ;;
    *) die "opção desconhecida: $1 (use --help)" ;;
  esac
  shift
done

root="$(git rev-parse --show-toplevel)"
cd "$root"

for cmd in gh git curl; do
  command -v "$cmd" > /dev/null || die "comando '$cmd' não encontrado"
done
if [[ $backup_only -eq 0 ]]; then
  command -v fly > /dev/null || die "flyctl ('fly') não encontrado"
  fly auth whoami > /dev/null 2>&1 || die "flyctl não está logado (fly auth login)"
fi
if [[ $with_frontend -eq 1 ]]; then
  command -v vercel > /dev/null || die "vercel CLI não encontrado"
  [[ -f mobile/.vercel/project.json ]] ||
    die "mobile/.vercel/project.json ausente (copie do checkout principal ou rode 'vercel link' em mobile/)"
fi
gh auth status > /dev/null 2>&1 || die "gh não está logado (gh auth login)"

# 0. Publicar só o que está na origin/main, com a árvore limpa.
if [[ $backup_only -eq 0 ]]; then
  if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
    die "há mudanças não commitadas; o deploy usa a árvore local"
  fi
  if [[ $allow_any_ref -eq 0 ]]; then
    git fetch -q origin main
    head_sha="$(git rev-parse HEAD)"
    main_sha="$(git rev-parse origin/main)"
    [[ "$head_sha" == "$main_sha" ]] ||
      die "HEAD ($head_sha) difere de origin/main ($main_sha); faça checkout da origin/main ou use --allow-any-ref"
  fi
fi

# 1. Backup no repositório privado, esperando o run exato terminar verde.
request_id="deploy-$(date -u +%Y%m%dT%H%M%SZ)-$$-$RANDOM"
log "Disparando backup ($request_id) em $BACKUP_REPO"
gh workflow run "$BACKUP_WORKFLOW" -R "$BACKUP_REPO" -f request_id="$request_id"

run_id=""
for _ in $(seq 1 30); do
  run_id="$(gh run list -R "$BACKUP_REPO" --workflow "$BACKUP_WORKFLOW" --event workflow_dispatch \
    --limit 20 --json databaseId,displayTitle \
    --jq ".[] | select(.displayTitle == \"backup $request_id\") | .databaseId" | head -n1)"
  [[ -n "$run_id" ]] && break
  sleep 2
done
[[ -n "$run_id" ]] || die "não achei o run do backup '$request_id' depois de 60s"

run_url="https://github.com/$BACKUP_REPO/actions/runs/$run_id"
log "Acompanhando $run_url"
if ! gh run watch "$run_id" -R "$BACKUP_REPO" --exit-status --interval 10; then
  die "backup falhou ($run_url). Deploy abortado, nada foi publicado."
fi
conclusion="$(gh run view "$run_id" -R "$BACKUP_REPO" --json conclusion --jq .conclusion)"
[[ "$conclusion" == "success" ]] || die "backup terminou como '$conclusion' ($run_url). Deploy abortado."
log "Backup OK: $run_url"

if [[ $backup_only -eq 1 ]]; then
  exit 0
fi

# 2. Backend (roda as migrations no release_command).
log "Deploy do backend ($FLY_APP)"
(cd backend && fly deploy --remote-only -a "$FLY_APP")

# 3. Frontend (opcional).
if [[ $with_frontend -eq 1 ]]; then
  log "Deploy do frontend (Vercel)"
  (cd mobile && vercel deploy --prod --yes)

  log "Conferindo o bundle publicado em $FRONTEND_URL"
  html="$(curl -fsSL "$FRONTEND_URL/")"
  scripts="$(grep -oE 'src="/_expo/static/js/[^"]+\.js"' <<< "$html" | sed -E 's/^src="|"$//g')"
  [[ -n "$scripts" ]] || die "não achei o bundle JS em $FRONTEND_URL"
  found_api=0
  for path in $scripts; do
    bundle="$(curl -fsSL "$FRONTEND_URL$path")"
    if grep -q 'localhost' <<< "$bundle"; then
      die "o bundle $path contém 'localhost': EXPO_PUBLIC_API_URL errada no build da Vercel"
    fi
    grep -q "$API_HOST" <<< "$bundle" && found_api=1
  done
  [[ $found_api -eq 1 ]] || die "nenhum bundle aponta para $API_HOST"
  log "Bundle OK: aponta para $API_HOST e não contém localhost"
fi

log "Deploy concluído"
