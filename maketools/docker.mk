.PHONY: docker-run docker-stop

PORT ?= 8081

docker-run:
	$(Q)docker run --rm -p "${PORT}:80" \
		-v $(PWD)/html:/usr/share/nginx/html:ro \
		-v $(PWD)/test/data:/usr/share/nginx/html/data:ro \
		-v $(PWD)/test/config:/usr/share/nginx/html/config:ro \
		--name index-web -d nginx

docker-stop:
	$(Q)docker stop index-web
