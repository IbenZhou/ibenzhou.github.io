# Third-party notices

This tool runs entirely in the browser.

## CheerpJ 4.1

The Java 8 runtime is [CheerpJ](https://cheerpj.com/), by Leaning Technologies Ltd.
It is loaded from the official CheerpJ CDN (`https://cjrtnc.leaningtech.com/4.1/`) and is **not** bundled with this project.
CheerpJ is used under its free personal / educational / hobby license.

## OpenJDK 8 `tools.jar`

The in-browser Java compiler is the OpenJDK 8 `tools.jar` from the Adoptium Temurin 8u504 build.
It is licensed under the GNU General Public License, version 2, with the Classpath Exception.
The license text is in `vendor/LICENSE-tools.jar.txt` and `vendor/ASSEMBLY_EXCEPTION.txt`.
Corresponding source: <https://github.com/adoptium/openjdk-jdk8u>.
The jar is served from the site root as `/tools-8u504-r2.jar` because CheerpJ mounts `/app/` at the site root.

## Monaco Editor 0.52.2

The code editor is [Monaco Editor](https://github.com/microsoft/monaco-editor), © Microsoft Corporation,
licensed under the MIT License. The trimmed build is vendored under `vendor/monaco/`.
