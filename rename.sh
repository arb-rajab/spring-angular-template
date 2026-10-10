#!/usr/bin/env bash
# Renames this template to your project.
#
#   ./rename.sh my-service                  # Maven groupId stays com.example
#   ./rename.sh my-service com.acme         # custom Maven groupId / Java package root
#
# Replaces the placeholder tokens everywhere in the tree (except .git, node_modules,
# target, dist and .angular), renames files and the Java package directories:
#   com.example.projectname -> com.acme.myservice   (Java package)
#   com.example             -> com.acme             (Maven groupId)
#   project-name            -> my-service           (artifact, image, realm, client, volume names)
#   project_name            -> my_service           (database, database role, OS user in Docker)
#   projectname             -> myservice            (Java package segment)
#   ProjectName             -> MyService            (class names, API title)
# Then deletes itself. Run it once, before the first commit of your project, then:
#   (cd backend && mvn spotless:apply)   # the new package changes import order
#   (cd frontend && npm install)         # refreshes package-lock.json if the name matters to you
set -euo pipefail

if [ $# -lt 1 ] || [ $# -gt 2 ] || ! [[ "$1" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "usage: $0 <kebab-case-name> [maven-group-id]" >&2
  echo "       name: lowercase letters, digits, hyphens; group id default: com.example" >&2
  exit 1
fi

kebab="$1"
group="${2:-com.example}"
if ! [[ "$group" =~ ^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$ ]]; then
  echo "invalid group id '$group' (lowercase dot-separated Java package segments)" >&2
  exit 1
fi

snake="${kebab//-/_}"
flat="${kebab//-/}"
studly=""
IFS='-' read -ra parts <<< "$kebab"
for part in "${parts[@]}"; do
  studly+="$(tr '[:lower:]' '[:upper:]' <<< "${part:0:1}")${part:1}"
done

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

grep -rIl --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=target \
  --exclude-dir=dist --exclude-dir=.angular --exclude=rename.sh --exclude=package-lock.json \
  -e 'project-name' -e 'project_name' -e 'projectname' -e 'ProjectName' -e 'com.example' . |
  while IFS= read -r file; do
    sed -i \
      -e "s#com\.example\.projectname#${group}.${flat}#g" \
      -e "s#com\.example#${group}#g" \
      -e "s#project-name#${kebab}#g" \
      -e "s#project_name#${snake}#g" \
      -e "s#projectname#${flat}#g" \
      -e "s#ProjectName#${studly}#g" \
      "$file"
  done

# Move the Java source trees to the new package directory.
new_pkg_dir="$(tr . / <<< "$group")/${flat}"
for tree in backend/src/main/java backend/src/test/java; do
  if [ -d "$tree/com/example/projectname" ]; then
    mkdir -p "$tree/$new_pkg_dir"
    cp -a "$tree/com/example/projectname/." "$tree/$new_pkg_dir/"
    rm -rf "$tree/com/example/projectname"
    rmdir "$tree/com/example" 2>/dev/null || true
    rmdir "$tree/com" 2>/dev/null || true
  fi
done

# Rename files whose names contain a token (deepest paths first).
find . -depth \( -path ./.git -o -path ./node_modules -o -path '*/target' -o -path ./frontend/dist \) -prune -o \
  \( -name '*ProjectName*' -o -name '*project-name*' -o -name '*project_name*' \) -print |
  while IFS= read -r path; do
    dir="$(dirname "$path")"
    base="$(basename "$path")"
    new="${base//ProjectName/${studly}}"
    new="${new//project-name/${kebab}}"
    new="${new//project_name/${snake}}"
    mv -- "$path" "$dir/$new"
  done

echo "Renamed to '${kebab}' (package ${group}.${flat}, database ${snake})."
echo "Next: cd backend && mvn spotless:apply, then copy .env.example to .env."
rm -- "$0"
