index-web
=========

Web frontend for [nginx-proxy-index](https://github.com/ZenDevelopmentEcosystem/nginx-proxy-index).

Usage
-----

The application is generally bundled with the image `perbohlin/nginx-proxy-index`,
 [nginx-proxy-index](https://github.com/ZenDevelopmentEcosystem/nginx-proxy-index)
and does not need to be run separately.

Development
-----------

To run the application, with test data:

```console
docker run --rm -p "8081:80" -v $(pwd)/html:/usr/share/nginx/html -v $(pwd)/test-data:/usr/share/nginx/html/data --name index-web -d nginx
```

Run `make check` before pull-requests.
