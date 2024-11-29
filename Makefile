username=mirzaahilmi

oci:
	docker build --tag iotstream:latest .

ociupstream:
	docker build --tag ${username}/iotstream:latest .

.PHONY: oci ociupstream
