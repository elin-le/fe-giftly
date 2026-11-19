#!/usr/bin/env bash
# Sinh PROJECT_SNAPSHOT.md — bản chụp trạng thái dự án để đưa cho AI đọc
# thay vì để AI tự quét toàn bộ mã nguồn.
#
# Cách dùng:
#   bash scripts/snapshot.sh [--check] [--out <file>]
#     --check        chạy thêm typecheck + test và ghi kết quả vào snapshot
#     --out <file>   đường dẫn file đầu ra (mặc định: PROJECT_SNAPSHOT.md)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OUT="PROJECT_SNAPSHOT.md"
RUN_CHECKS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check) RUN_CHECKS=true; shift ;;
    --out)
      [[ $# -ge 2 ]] || { echo "Thiếu giá trị cho --out" >&2; exit 1; }
      OUT="$2"; shift 2 ;;
    -h|--help) sed -n '2,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Tham số không hợp lệ: $1" >&2; exit 1 ;;
  esac
done

command -v node >/dev/null || { echo "Cần cài Node.js để chạy snapshot" >&2; exit 1; }

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

section() { printf '\n## %s\n\n' "$1" >> "$TMP"; }
emit()    { printf '%s\n' "$@" >> "$TMP"; }

SRC_FILES() { find src -type f \( -name '*.ts' -o -name '*.tsx' \) ! -name '*.test.*' ! -name '*.d.ts' ! -path 'src/test/*'; }

# ── Tiêu đề ───────────────────────────────────────────────────────────────
emit "# PROJECT SNAPSHOT — Giftly Frontend" ""
emit "> Tự động sinh bởi \`scripts/snapshot.sh\`. **Không sửa tay** — chạy lại \`npm run snapshot\` khi cần."
emit "> Nguyên tắc làm việc: xem \`AGENTS.md\`."
emit "" "- Thời điểm tạo: $(date '+%Y-%m-%d %H:%M:%S %z')"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  emit "- Git branch: \`$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')\`"
  emit "- Commit gần nhất: \`$(git log -1 --pretty='%h %s' 2>/dev/null || echo 'chưa có commit')\`"
  CHANGED="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
  emit "- File đang thay đổi chưa commit: ${CHANGED}"
else
  emit "- Git: chưa khởi tạo repository"
fi

# ── Stack ────────────────────────────────────────────────────────────────
section "Stack & phiên bản"
node -e '
const p = require("./package.json");
const row = ([n, v]) => `| \`${n}\` | ${v} |`;
const table = (title, obj) => {
  const entries = Object.entries(obj || {});
  if (!entries.length) return "";
  return `**${title}**\n\n| Package | Version |\n|---|---|\n${entries.map(row).join("\n")}\n`;
};
console.log(table("dependencies", p.dependencies));
console.log(table("devDependencies", p.devDependencies));
' >> "$TMP"

section "Scripts"
node -e '
const p = require("./package.json");
for (const [k, v] of Object.entries(p.scripts || {})) console.log(`- \`npm run ${k}\` → \`${v}\``);
' >> "$TMP"

# ── Cấu trúc ──────────────────────────────────────────────────────────────
section "Cấu trúc thư mục"
emit '```'
{
  find src docs scripts -mindepth 0 \
    \( -name node_modules -o -name dist -o -name .DS_Store -o -name .gitkeep \) -prune -o -print 2>/dev/null \
    | sort | awk -F/ '{ printf "%*s%s\n", (NF - 1) * 2, "", $NF }'
} >> "$TMP"
emit '```'

# ── Routes ───────────────────────────────────────────────────────────────
section "Routes (src/app/router.tsx)"
if [[ -f src/app/router.tsx ]]; then
  emit '```'
  grep -nE "path:|index:|element:" src/app/router.tsx | sed 's/^\([0-9]*\):\s*/L\1  /' >> "$TMP" || true
  emit '```'
else
  emit "_Chưa có router._"
fi

# ── Features ─────────────────────────────────────────────────────────────
section "Features"
emit "| Feature | Source | Test | Store | Có pages |" "|---|---|---|---|---|"
for dir in src/features/*/; do
  [[ -d "$dir" ]] || continue
  name="$(basename "$dir")"
  total="$(find "$dir" -type f \( -name '*.ts' -o -name '*.tsx' \) ! -name '*.test.*' | wc -l | tr -d ' ')"
  tests="$(find "$dir" -type f -name '*.test.*' | wc -l | tr -d ' ')"
  store="$(find "$dir" -maxdepth 1 -name '*Store.ts' | head -1 | xargs -r basename 2>/dev/null || true)"
  pages="không"; [[ -d "${dir}pages" ]] && pages="có"
  emit "| \`${name}\` | ${total} | ${tests} | ${store:-—} | ${pages} |"
done

# ── Thống kê ─────────────────────────────────────────────────────────────
section "Thống kê"
SRC_COUNT="$(SRC_FILES | wc -l | tr -d ' ')"
TEST_COUNT="$(find src -type f -name '*.test.*' | wc -l | tr -d ' ')"
LOC="$(SRC_FILES | xargs cat 2>/dev/null | wc -l | tr -d ' ')"
emit "- File mã nguồn (không tính test): ${SRC_COUNT}" \
     "- File test: ${TEST_COUNT}" \
     "- Số dòng mã nguồn: ${LOC}"

emit "" "**File nguồn chưa có test đi kèm** (logic nên có test):" ""
MISSING=0
while IFS= read -r file; do
  base="${file%.*}"; ext="${file##*.}"
  # Chỉ yêu cầu test cho store, hook, schema, hàm thuần và api; bỏ qua UI thuần/page/index
  case "$file" in
    *Store.ts|*/hooks/*.ts|*Schema.ts|*/lib/*.ts|*/api/client.ts|*/api/errors.ts|*Status.ts)
      if [[ ! -f "${base}.test.${ext}" && ! -f "${base}.test.ts" && ! -f "${base}.test.tsx" ]]; then
        emit "- \`${file}\`"; MISSING=$((MISSING + 1))
      fi ;;
  esac
done < <(SRC_FILES | sort)
[[ $MISSING -eq 0 ]] && emit "- _(không có)_"

# ── Kiểm tra (tuỳ chọn) ───────────────────────────────────────────────────
if $RUN_CHECKS; then
  section "Kết quả kiểm tra"
  if npx tsc -b >/tmp/giftly-tsc.log 2>&1; then
    emit "- Typecheck: ✅ pass"
  else
    emit "- Typecheck: ❌ lỗi" '```' "$(head -n 20 /tmp/giftly-tsc.log)" '```'
  fi
  if npx vitest run >/tmp/giftly-test.log 2>&1; then
    emit "- Test: ✅ pass — $(grep -E 'Tests ' /tmp/giftly-test.log | sed 's/^ *//' | head -1)"
  else
    emit "- Test: ❌ có test lỗi" '```' "$(grep -E 'FAIL|✗|×|Tests ' /tmp/giftly-test.log | head -n 20)" '```'
  fi
fi

# ── TODO / FIXME ─────────────────────────────────────────────────────────
section "TODO / FIXME"
TODOS="$(grep -rnE 'TODO|FIXME' src --include='*.ts' --include='*.tsx' 2>/dev/null || true)"
if [[ -n "$TODOS" ]]; then emit '```' "$TODOS" '```'; else emit "- _(không có)_"; fi

# ── Biến môi trường ──────────────────────────────────────────────────────
section "Biến môi trường (.env.example)"
if [[ -f .env.example ]]; then emit '```' "$(cat .env.example)" '```'; else emit "_Chưa có .env.example._"; fi

# ── Tài liệu ─────────────────────────────────────────────────────────────
section "Tài liệu (docs/)"
emit "| File | Số dòng |" "|---|---|"
while IFS= read -r doc; do
  emit "| \`${doc}\` | $(wc -l < "$doc" | tr -d ' ') |"
done < <(find docs -type f -name '*.md' | sort)

mv "$TMP" "$OUT"
trap - EXIT
echo "Đã tạo ${OUT}"
