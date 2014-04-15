# variables
RELEASE_BUILDDIR="bin"
RELEASE_UNSIGNED="em-release-unsigned.apk" # produced by "ant release" command
RELEASE_BUILD_APK="em-release.apk"

# check required environment variables are there
: ${ANDROID_HOME:?"Need to set ANDROID_HOME non-empty"}

# copy fonts
cp ~/.phonegap/android/HelveticaNeueLight.otf app/www/static/fonts/HelveticaNeueLight.otf
cp ~/.phonegap/android/HelveticaNeueRoman.ttf app/www/static/fonts/HelveticaNeueRoman.ttf

# new dir
cd app

# clean
if [ -d ${RELEASE_BUILDDIR} ]; then
	echo "Deleting build directory"
    rm -r ${RELEASE_BUILDDIR}
fi

# run phonegap command locally
cordova build android

# copy platform specific index file
cp www/phonegap-android.html platforms/android/assets/www/index.html

cd platforms/android

# make new build using ant release configuration
ant release
