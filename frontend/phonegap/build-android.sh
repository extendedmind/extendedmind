# variables
ANDROID_ROOT="app/platforms/android"
RELEASE_BUILDDIR="bin"
RELEASE_UNSIGNED="em-release-unsigned.apk" # produced by "ant release" command
RELEASE_BUILD_APK="em-release.apk"

# check required environment variables are set
: ${ANDROID_HOME:?"Need to set ANDROID_HOME non-empty"}

# new dir
cd ${ANDROID_ROOT}
pwd

# clean
if [ -d ${RELEASE_BUILDDIR} ]; then
	echo "Deleting build directory"
    rm -r ${RELEASE_BUILDDIR}
fi

# make sure cordova assets are updated
# phonegap platform update android

# run phonegap command locally
cordova build android | grep -A 5 error

# make new build using ant release configuration
ant release

# sign the build with keystore file, there is a prompt for password here (ant release does this)
# jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${KEYSTORE_FILE} ${RELEASE_BUILDDIR}/${RELEASE_UNSIGNED} extendedmind_beta

# verify signing succeeded
# TODO: enable again once the maven script is polished
# jarsigner -verify ${RELEASE_BUILDDIR}/${RELEASE_BUILD_APK}

# align the package (source, destination) (ant relase does this)
# zipalign -v 4 ${RELEASE_BUILDDIR}/${RELEASE_UNSIGNED} ${RELEASE_BUILDDIR}/${RELEASE_BUILD_APK}