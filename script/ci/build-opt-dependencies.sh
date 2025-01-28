#!/bin/bash

export bin=@pact-foundation/pact-core
export pkg_version=${pkg_version:-$(cat package.json | jq -r .version)}

if [ -z "${supported_platforms+x}" ]; then
	supported_platforms=("linux-x64-glibc" "linux-arm64-glibc" "linux-x64-musl" "linux-arm64-musl" "darwin-x64" "darwin-arm64" "windows-x64")
fi

setup_package_vars(){
		unset node_os
		unset node_arch
		unset node_libc
		unset libc
		IFS='-' read -r node_os node_arch node_libc <<< "$supported_platform"
		export node_os=$node_os
		export node_pkg_os=$node_os
		export node_arch=$node_arch
		export node_libc=$node_libc
		export prebuild_package="$node_os-$node_arch"
		# we need to overwrite windows as win32 in the package.json
		if [ "$node_os" = "windows" ]; then
			export node_pkg_os=win32
			export prebuild_package="win32-$node_arch"
		fi
		if [ "$node_libc" = "glibc" ]; then
			export libc='"libc": ["glibc"],'
		fi
		if [ "$node_libc" = "musl" ]; then
			export libc='"libc": ["musl"],'
		fi
		export standalone_package=prebuilds/$prebuild_package
		if [ "$node_libc" = "musl" ] || [ "$node_libc" = "glibc" ]; then
			export node_pkg=${bin}-$node_os-$node_arch-$node_libc
		else
			export node_pkg=${bin}-$node_os-$node_arch
		fi
}

clean() {
	rm -rf @pact-foundation
	npm run clean-libs
}

libs() {
	echo $1
	if [ -n "$1" ]; then
		tag=$1
	else
		tag=v${pkg_version}
	fi
	FETCH_ASSETS=true ./script/ci/check-release-libs.sh --fetch-assets -t $tag
}

build() {
	for supported_platform in "${supported_platforms[@]}"; do
		setup_package_vars
		echo "Building for $node_os-$node_arch"
		echo "Building $node_pkg"
		echo "Build $node_libc"
		mkdir -p "$node_pkg/prebuilds"
		cp -R "$standalone_package" "$node_pkg/prebuilds"
		if [ "$node_libc" = "glibc" ]; then
			find "$node_pkg/prebuilds" -type f -name '*musl*' -exec rm -f {} +
		fi
		if [ "$node_libc" = "musl" ]; then
			find "$node_pkg/prebuilds" -type f ! -name '*musl*' -exec rm -f {} +
		fi
		envsubst < package.json.tmpl > "$node_pkg/package.json"
		if [ "${PUBLISH:-false}" = true ]; then
			(cd $node_pkg && npm publish --access public)
		else
			(cd $node_pkg && npm publish --access public --dry-run)
		fi
	done
}

update() {
	for supported_platform in "${supported_platforms[@]}"; do
		setup_package_vars
		jq '.optionalDependencies."'$node_pkg'" = "'$pkg_version'"' package.json > package-new.json
		mv package-new.json package.json
	done
}

publish() {
	set -eu
	for supported_platform in "${supported_platforms[@]}"; do
		setup_package_vars
		echo "Building for $node_os-$node_arch"
		echo "Building $node_pkg for $node_os-$node_arch"
		if [ "${PUBLISH:-false}" = true ]; then
			(cd $node_pkg && npm publish --access public)
		else
			(cd $node_pkg && npm publish --access public --dry-run)
		fi
	done
}

link() {
	set -eu
	for supported_platform in "${supported_platforms[@]}"; do
		setup_package_vars
		(cd $node_pkg && npm link || echo "cannot link for platform")
		npm link $node_pkg || echo "cannot link for platform"
	done
}

determine_platform(){
	case "$(uname -s)" in
    Linux)
        if [ "$(uname -m)" == "x86_64" ]; then
            if [ -f /etc/os-release ] && grep -q 'Alpine' /etc/os-release; then
                current_platform="linux-x64-musl"
            else
                current_platform="linux-x64-glibc"
            fi
        elif [ "$(uname -m)" == "aarch64" ]; then
            if [ -f /etc/os-release ] && grep -q 'Alpine' /etc/os-release; then
                current_platform="linux-arm64-musl"
            else
                export current_platform="linux-arm64-glibc"
            fi
        fi
        ;;
    Darwin)
        if [ "$(uname -m)" == "x86_64" ]; then
            export current_platform="darwin-x64"
        elif [ "$(uname -m)" == "arm64" ]; then
            export current_platform="darwin-arm64"
        fi
        ;;
    CYGWIN*|MINGW32*|MSYS*|MINGW*)
        export current_platform="windows-x64"
        ;;
    *)
        echo "Unsupported platform: $(uname -s)"
        exit 1
        ;;
	esac
	if [ -z "$current_platform" ]; then
		echo "Error: could not determine current_platform"
		exit 1
	fi
	echo $current_platform
}

help() {
	echo "Pact platform/arch specific dependency builder"

	echo "Usage: $0 {clean|libs|build_opt_deps|update_opt_deps|publish_opt_package|link|determine_platform|help}"
	echo
	echo "Functions:"
	echo "  clean                - Clean the build environment"
	echo "  libs                 - Fetch and check release libraries"
	echo "  build_opt_deps       - Build optional dependencies for supported platforms"
	echo "  update_opt_deps      - Update optional dependencies in package.json"
	echo "  publish_opt_package  - Publish the optional package"
	echo "  link                 - Link the package for development"
	echo "  determine_platform   - Determine the current platform"
	echo "  help                 - Display this help message"

	echo
	echo "Supported platforms:"
	for platform in "${supported_platforms[@]}"; do
		echo "  - $platform"
	done
	echo
	echo "Example to run for the current platform:"
	echo '  supported_platforms=$(./script/ci/build_opt_dependencies.sh determine_platform) ./script/ci/build_opt_dependencies.sh link'
}

if [ $# -eq 0 ]; then
	help
	exit 1
fi

"$@"