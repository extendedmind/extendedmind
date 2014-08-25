Extended Mind
=============

This is the root of the Extended Mind code repository.

Nginx configuration
-------------------

AngularJS is set to use 'html5mode' so you have to configure a rewrite such as this to your 'nginx.conf'.  
Default installation location on OS X is `/usr/local/etc/nginx/nginx.conf`
```
	location / {
    root  [extendedmind_home]/frontend/core/src/main/webapp;
    index  index_devel.html index.html;
    rewrite ^/(?!(static|api|collect|evaluate|landing|test|styleguide)) /index_devel.html break;
  }
```
After starting Nginx, the development version of extended mind should be running on 'localhost'. To add support for collecting analytics to Cube, also add
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

Mac OS X
--------

Installing JDK and XCode are suggested. 

Then you can easily install Brew by:
`ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"`

And Nginx:
`brew install nginx`
[http://learnaholic.me/2012/10/10/installing-nginx-in-mac-os-x-mountain-lion/]

Prior to OSX Maveric, Maven should already be installed by default.
- In Mavericks, install with Brew: `brew install maven`
