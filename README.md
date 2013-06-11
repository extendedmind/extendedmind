Extended Mind
=============

This is the root of the Extended Mind code repository.

Nginx configuration
-------------------

AngularJS is set to use 'html5mode' so you have to configure a rewrite such as this to your 'nginx.conf':

	location / {
	    root  [extendedmind_home]/frontend/core/src/main/webapp;
        index  index_devel.html;
        rewrite ^/(?!(static|api)) /index_devel.html break;
    }

After starting Nginx, the development version of extended mind should be running on 'localhost'.
