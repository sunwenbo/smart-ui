#!/bin/bash
kubectl create ns sre
kubectl create configmap nginx-frontend --from-file=./default.conf -n sre
kubectl apply -f scripts/smart-ui-deploy.yaml
