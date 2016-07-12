# Development instructions for OS X

Here are instructions to get you started.

## 1. Minimal setup

### 1.1. Install Java and Maven

To compile Extended Mind, download the latest Java 8 JDK (*Both OpenJDK and Oracle JDK are supported*), and install the latest Apache Maven 3 (*e.g. with Brew on OS X*). Then setup a **$JAVA_HOME** environment variable to point to the JDK install directory, and **$MAVEN_OPTS** variable to increased stack space, by adding the following in your `.bashrc` or similar:

```
export JAVA_HOME=$(/usr/libexec/java_home)
export MAVEN_OPTS="-Xss8M"
```
### 1.2. Build the essentials

After Java and Maven are installed run from the project root:


```
mvn clean install
```

If you're using Oracle Java, access to the Extended Mind CI server might fail with:

```
sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
```

because the Let's Encrypt certificate we use is not (yet) supported by default in the Oracle JDK. To fix the problem, obtain the [Let's Encrypt Authority X3 Intermediate Certificate pem file](https://letsencrypt.org/certificates/) and then run (*on OS X*):

**NOTE**: Remember to replace `[YOUR_LOCATION]` with correct directory.

```
sudo keytool -trustcacerts -keystore $JAVA_HOME/jre/lib/security/cacerts -storepass changeit -noprompt -importcert -file [YOUR_LOCATION]/lets-encrypt-x3-cross-signed.pem
```

to add the certificate to the JDK keystore.

### 1.3. Setup frontend developement environment

To debug the Extended Mind UI at localhost, you want to install a local nginx server (*e.g. using Brew on OS X*).

AngularJS is set to use `html5mode` so you have to configure a rewrite such as the following to your `nginx.conf`.
Default installation location on OS X is `/usr/local/etc/nginx/nginx.conf`.

**NOTE**: Remember to replace `[EXTENDED_MIND_HOME]` with correct directory.

```
server {
	listen	8235;
	location / {
		root	[EXTENDED_MIND_HOME]/frontend/app/src;
    	index	index_devel.html index.html;
    	rewrite	^/(?!(static|api|analytics|test|styleguide)) /index_devel.html break;
	}
}
```
Then start nginx with

```
sudo nginx
```

### 1.4. Frontend development tips
You can bookmark following ulrs to speed up the development:

| Links | What it does |
| :--- | :--- |
| http://localhost:8235/fresh | starts fresh session |
| http://localhost:8235/fresh?offline=true | starts fresh offline session |
| http://localhost:8235/new | starts the tutorial |
