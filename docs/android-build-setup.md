# CachyOS Android & Java SDK Development Setup Guide

Setup guide for building Android deployment artifacts (`.apk`, `.aab`) locally via Expo/React Native. Tuned for a dual-core/quad-thread CPU (e.g. Intel Core i3) with 16GB RAM to avoid system freezes during compilation.

Verified working on this machine (`domicoop-mobile`, fish shell) as of 2026-07-12.

---

## 1. Core System & SDK Installation

```bash
# Update core repositories and system binaries
sudo pacman -Syu

# Install Java 17 Development Kit (LTS)
sudo pacman -S jdk17-openjdk

# Install command-line Android build utilities and target platform from the AUR
paru -S android-sdk-cmdline-tools-latest android-sdk-build-tools android-platform-35 android-sdk-platform-tools
```

AUR packages install the SDK to `/opt/android-sdk`, **owned by `root`**. Fix ownership before doing anything else, or license acceptance in step 3 will silently fail (see note there):

```bash
sudo chown -R "$USER:$USER" /opt/android-sdk
```

---

## 2. Environment Configuration

**fish shell** (`~/.config/fish/config.fish`) — fish does not use `export`, and needs `set -gx`:

```fish
# Java Development Kit path mapping
set -gx JAVA_HOME /usr/lib/jvm/default

# Android SDK path mapping (AUR installs default to /opt)
set -gx ANDROID_HOME /opt/android-sdk

# Bind utility binaries to PATH
set -gx PATH $ANDROID_HOME/platform-tools $ANDROID_HOME/cmdline-tools/latest/bin $ANDROID_HOME/emulator $PATH
```

**bash/zsh** (`~/.bashrc` / `~/.zshrc`) — note this needs `$` on every variable reference, which the original draft of this guide omitted (`PATH=PATH:ANDROID_HOME/emulator` is a broken no-op, not `$PATH:$ANDROID_HOME/emulator`):

```bash
export JAVA_HOME=/usr/lib/jvm/default
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator
```

Reload your shell config after editing (`source <file>`).

---

## 3. Accept SDK Licenses

Not optional — Gradle will fail the build with `LicenceNotAcceptedException` (e.g. for the NDK package) until every license under the SDK's package list is accepted:

```bash
yes | sdkmanager --licenses --sdk_root=$ANDROID_HOME
```

**Gotcha:** if `/opt/android-sdk` is still root-owned (see step 1), this command prints `All SDK package licenses accepted` but writes nothing — no `licenses/` directory is created, and the next Gradle build fails with the exact same error. Verify it actually wrote files:

```bash
ls $ANDROID_HOME/licenses
```

If that directory doesn't exist after running the command, fix ownership (step 1) and re-run.

---

## 4. Hardware Resource Optimizations (Core i3 / 16GB RAM)

`~/.gradle/gradle.properties`:

```properties
# Allocate 4GB of your 16GB RAM strictly to the Gradle daemon
org.gradle.jvmargs=-Xmx4096m -XX:+UseParallelGC

# Reuse previously calculated task outputs across builds
org.gradle.caching=true

# Allow independent modules to build concurrently
org.gradle.parallel=true

# Critical throttling: cap parallel worker threads to 3,
# leaving 1 thread free so the desktop stays responsive.
org.gradle.workers.max=3
```

---

## 5. USB Debugging Rules (optional, only needed for on-device testing)

```bash
sudo pacman -S android-udev
```

Unplug and reconnect your test device via USB after installing.

---

## 6. Local Expo Project Compilation Pipeline

### Step A: Initialize the native codebase (only if `android/` doesn't already exist)

```bash
npx expo prebuild
```

### Step B: Build target artifacts

```bash
cd android
chmod +x gradlew

# Installable testing package
./gradlew assembleRelease

# Production Play Console bundle
./gradlew bundleRelease
```

First build is slow (NDK/native compilation) — expect ~1hr on this hardware. Subsequent builds are much faster due to caching.

### Step C: File locations

* **APK:** `android/app/build/outputs/apk/release/app-release.apk`
* **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`
