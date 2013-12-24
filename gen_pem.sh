#!/bin/bash

openssl req -new -x509 -subj="/C=AU/ST=Some-State/L=city/O=Dis/CN=www.example.com/" -keyout server.pem -out server.pem -days 365 -nodes
mkdir config
mv server.pem config
