# Extended Mind

This is the root of the Extended Mind code repository.

## Development

### Compile

To compile Extended Mind, download the latest Java 8 JDK (Both OpenJDK and Oracle JDK are supported), and install the latest Apache Maven 3 (e.g. with Brew on OSX). Then setup a $JAVA_HOME environment variable to point to the JDK install directory, and $MAVEN_OPTS variable to increased stack space, by adding the following in your .bashrc:

```
export JAVA_HOME=$(/usr/libexec/java_home)
export MAVEN_OPTS="-Xss8M"
```

After that run:

```
mvn clean install
```

in this directory. If you're using Oracle Java, access to the Extended Mind CI server might fail with:

```
sun.security.validator.ValidatorException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
```

because the Let's Encrypt certificate we use is not (yet) supported by default in the Oracle JDK. To fix the problem, obtain the [Let's Encrypt CA pem file](https://letsencrypt.org/certificates/) and then run (on OSX):

```
sudo keytool -trustcacerts -keystore $JAVA_HOME/jre/lib/security/cacerts -storepass changeit -noprompt -importcert -file lets_encrypt_authority_x1.pem
```

to add the certificate to the JDK keystore.

### Developement Environment

To debug the Extended Mind UI at localhost, you want to install a local NGinx server (e.g. using Brew on OSX).

AngularJS is set to use 'html5mode' so you have to configure a rewrite such as the following to your `nginx.conf`.
Default installation location on OS X is `/usr/local/etc/nginx/nginx.conf`.

```
location / {
    root  [extendedmind_home]/frontend/app/src;
    index  index_devel.html index.html;
    rewrite ^/(?!(static|api|collect|evaluate|test|styleguide)) /index_devel.html break;
}
```

In production, it is critical that `/api/shutdown` and `/api/tick` are
only allowed locally with a segment like this, where the backend is
running at port 8081:

```
location /api {
       if ($request_uri ~ /api/shutdown.*) {
         return 403;
       }
       if ($request_uri ~ /api/tick.*) {
         return 403;
       }
       rewrite /api(.*) $1 break;
       proxy_pass http://127.0.0.1:8081;
       proxy_redirect     off;
       proxy_set_header   Host             $host;
       proxy_set_header   X-Real-IP        $remote_addr;
       proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
}
```

After starting Nginx, the development version of extended mind should be running on 'localhost'. To add support for collecting analytics to Cube, also add:
```
  location /collect {
    rewrite /collect(.*) $1 break;
    proxy_pass http://127.0.0.1:1080;
    proxy_redirect     off;
    proxy_set_header   Host             $host;
    proxy_set_header   X-Real-IP        $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
  }
  location /evaluate/ {
    rewrite /evaluate(.*) $1 break;
    proxy_pass http://127.0.0.1:1081;
    proxy_redirect     off;
    proxy_set_header   Host             $host;
    proxy_set_header   X-Real-IP        $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
  }
```
