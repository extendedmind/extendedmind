Extended Mind
=============

This is the root of the Extended Mind code repository.

Nginx configuration
-------------------

AngularJS is set to use 'html5mode' so you have to configure a rewrite such as this to your 'nginx.conf':

	location / {
	    root  [extendedmind_home]/frontend/core/src/main/webapp;
        index  index_devel.html;
        rewrite ^/(?!(static|api|test)) /index_devel.html break;
    }

After starting Nginx, the development version of extended mind should be running on 'localhost'.

Mac OS X
--------

Installing JDK and XCode are suggested. 

Then you can easily install Brew by:
ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"

And Nginx:
brew install nginx
[http://learnaholic.me/2012/10/10/installing-nginx-in-mac-os-x-mountain-lion/]

Maven should already be installed by default.
