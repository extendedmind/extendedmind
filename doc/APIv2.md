# Extended Mind API v2


## Overview

At the core of every Extended Mind installation is a simple RESTful JSON API. All remote communication happens through this publicly available endpoint that is located at [origin]/api.

NOTE: [origin] in the following addresses needs to be replaced by the Extended Mind server address, for example in development use http://localhost:8008

## Security

There are three types of endpoint security in the API:

1. email/password authentication
2. token authentication
3. no authentication

Authentication is provided using [HTTP Basic access authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).

### Email/password authentication

This method is used for in security related endpoints, such as [origin]/api/v2/authenticate and [origin]/api/v2/users/change_password for obvious reasons.

### Token authenticaton

Token authentication is the most common authentication method. It uses a special HTTP username `token`, and a password obtained from the [origin]/api/v2/authenticate endpoint.

### No authentication

Extended Mind also hosts a few public methods, which use no authentication.
