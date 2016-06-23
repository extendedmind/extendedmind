# Production

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