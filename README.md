index-web
=========

Web frontend for [nginx-proxy-index](https://github.com/ZenDevelopmentEcosystem/nginx-proxy-index).

Usage
-----

The application is generally bundled with the image `perbohlin/nginx-proxy-index`,
 [nginx-proxy-index](https://github.com/ZenDevelopmentEcosystem/nginx-proxy-index)
and does not need to be run separately.

To use in other projects, draw inspiration from this Dockerfile snippet on how
to integrate it in an nginx-container:

```Dockerfile
RUN git clone "https://github.com/ZenDevelopmentEcosystem/index-web" \
   && cp -r index-web/html /usr/share/nginx/html \
   && cp index-web/docker-entrypoint.d/* /docker-entrypoint.d/
   && rm -rf index-web
```

Configuration
-------------

The application reads its configuration from `config/config.json`.
To override the configuration, either set the variable `INDEX_WEB_CONFIG` with
the desired content, or override config-file through mount.

The config.json format is as follows:

```json
{
    "index": "data/index.json",
    "use-groups": false,
    "groups": [
        {
            "name": "Group Name",
            "id": "group-id",
            "order": 0
        }
    ]
}
```

index
: The path to the index.json file on the web-server.

use-groups
: true| false, if the UI should render the different groups or a single list.

group, name
: The name of the group. It will be shown as the human readable representation of the group name.

group, id
: The ID for the group. It is the ID that is set on containers using the INDEX_GROUP environmental variable.

group, order
: The listing order among the groups. Groups with the same order, is sorted alphabetical.
  If `use-groups` is false, the order has no effect. and the sites will be sorted alphabetical.

Development
-----------

To run the application, with test data:

```console
docker run --rm -p "8081:80" \
    -v $(pwd)/html:/usr/share/nginx/html \
    -v $(pwd)/test/data:/usr/share/nginx/html/data \
    -v $(pwd)/test/config:/usr/share/nginx/html/config \
    --name index-web -d nginx
```

Run `make check` before pull-requests.
