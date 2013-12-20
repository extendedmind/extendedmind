# variables
ANDROID_ROOT="app/platforms/android"
RELEASE_BUILDDIR="bin"
RELEASE_UNSIGNED="em-release-unsigned.apk" # produced by "ant release" command
KEYSTORE_FILE="extended_mind_android.keystore"
RELEASE_BUILD_APK="em-release.apk"

# new dir
cd ${ANDROID_ROOT}

# clean
rm ${RELEASE_BUILDDIR}/${RELEASE_BUILD_APK}

# run phonegap command locally
phonegap local build android

# make new build using ant release configuration
ant release

# sign the build with keystore file, there is a prompt for password here (ant release does this)
# jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${KEYSTORE_FILE} ${RELEASE_BUILDDIR}/${RELEASE_UNSIGNED} extendedmind_beta

# verify signing succeeded
jarsigner -verify ${RELEASE_BUILDDIR}/${RELEASE_BUILD_APK}

# align the package (source, destination) (ant relase does this)
# zipalign -v 4 ${RELEASE_BUILDDIR}/${RELEASE_UNSIGNED} ${RELEASE_BUILDDIR}/${RELEASE_BUILD_APK}