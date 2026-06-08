#!/bin/bash
# =============================================================
#  AO Stats - Android Release Automator
#  Ejecutar desde la raíz del monorepo.
#  Uso:
#    ./apps/android/release.sh patch    →  2.2.0 → 2.2.1
#    ./apps/android/release.sh minor    →  2.2.0 → 2.3.0
#    ./apps/android/release.sh major    →  2.2.0 → 3.0.0
#    ./apps/android/release.sh 2.2.5    →  setea versión exacta
# =============================================================

set -e

ANDROID_DIR="apps/android"
GRADLE_FILE="${ANDROID_DIR}/app/build.gradle.kts"
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ─── Validaciones ───────────────────────────────────────────
if [ ! -f "$GRADLE_FILE" ]; then
    echo -e "${RED}Error: No se encuentra $GRADLE_FILE${NC}"
    echo "Ejecutá este script desde la raíz del monorepo."
    exit 1
fi

if [ -z "$1" ]; then
    echo -e "${YELLOW}Uso:${NC}"
    echo "  ./apps/android/release.sh patch     →  Incrementa fix"
    echo "  ./apps/android/release.sh minor     →  Incrementa minor"
    echo "  ./apps/android/release.sh major     →  Incrementa major"
    echo "  ./apps/android/release.sh 2.2.5     →  Setea versión exacta"
    exit 1
fi

# ─── Leer versión actual ────────────────────────────────────
CURRENT_VERSION=$(grep 'versionName' "$GRADLE_FILE" | head -1 | sed 's/.*"\(.*\)".*/\1/')
CURRENT_CODE=$(grep 'versionCode' "$GRADLE_FILE" | head -1 | sed 's/[^0-9]//g')

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   ${BOLD}AO Stats - Android Release${NC}${CYAN}       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  Versión actual: ${BOLD}v${CURRENT_VERSION}${NC} (code: ${CURRENT_CODE})"

# ─── Calcular nueva versión ─────────────────────────────────
MAJOR=$(echo "$CURRENT_VERSION" | cut -d. -f1)
MINOR=$(echo "$CURRENT_VERSION" | cut -d. -f2)
PATCH=$(echo "$CURRENT_VERSION" | cut -d. -f3)

if [ -z "$PATCH" ]; then
    PATCH=0
fi

case "$1" in
    patch)
        PATCH=$((PATCH + 1))
        NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
        ;;
    minor)
        MINOR=$((MINOR + 1))
        NEW_VERSION="${MAJOR}.${MINOR}.0"
        ;;
    major)
        MAJOR=$((MAJOR + 1))
        NEW_VERSION="${MAJOR}.0.0"
        ;;
    *)
        NEW_VERSION="$1"
        ;;
esac

NEW_CODE=$((CURRENT_CODE + 1))

echo -e "  Nueva versión:  ${GREEN}${BOLD}v${NEW_VERSION}${NC} (code: ${NEW_CODE})"
echo ""

# ─── Confirmación ───────────────────────────────────────────
read -p "$(echo -e ${YELLOW}"¿Continuar con el release v${NEW_VERSION}? [y/N] "${NC})" CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" && "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
    echo -e "${RED}Cancelado.${NC}"
    exit 0
fi

# ─── Actualizar build.gradle.kts ────────────────────────────
echo -e "\n${CYAN}[1/5]${NC} Actualizando versión en ${GRADLE_FILE}..."
sed -i "s/versionCode = ${CURRENT_CODE}/versionCode = ${NEW_CODE}/" "$GRADLE_FILE"
sed -i "s/versionName = \"${CURRENT_VERSION}\"/versionName = \"${NEW_VERSION}\"/" "$GRADLE_FILE"

# ─── Verificar cambios ─────────────────────────────────────
echo -e "${CYAN}[2/5]${NC} Verificando cambios..."
grep -E "versionCode|versionName" "$GRADLE_FILE" | head -2

# ─── Git add + commit ──────────────────────────────────────
echo -e "${CYAN}[3/5]${NC} Commiteando cambios..."
git add -A
git commit -m "chore(android): release v${NEW_VERSION}

- Bump versionCode: ${CURRENT_CODE} → ${NEW_CODE}
- Bump versionName: ${CURRENT_VERSION} → ${NEW_VERSION}"

# ─── Crear tag ──────────────────────────────────────────────
echo -e "${CYAN}[4/5]${NC} Creando tag android-v${NEW_VERSION}..."
git tag -a "android-v${NEW_VERSION}" -m "Android Release v${NEW_VERSION}"

# ─── Push todo ──────────────────────────────────────────────
echo -e "${CYAN}[5/5]${NC} Pusheando a origin..."
git push origin master
git push origin "android-v${NEW_VERSION}"

# ─── Listo ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Release v${NEW_VERSION} publicado${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  GitHub Actions esta compilando el APK..."
echo -e "  Seguilo en las Actions de tu repo"
