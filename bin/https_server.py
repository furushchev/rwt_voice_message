#!/usr/bin/env python
# -*- coding: utf-8 -*-

import BaseHTTPServer, SimpleHTTPServer
import ssl
import os, subprocess

HOSTNAME="musca.jsk.imi.i.u-tokyo.ac.jp"
PORT=4443
PEM_PATH="config/server.pem"


def run_shellcommand(*args):
    '''run the provided command and return its stdout'''
    args = sum([(arg if type(arg) == list else [arg]) for arg in args], [])
    return subprocess.Popen(args,
                            stdout=subprocess.PIPE).communicate()[0].strip()

package_path = run_shellcommand("rospack", "find", "rwt_voice_message")

httpd = BaseHTTPServer.HTTPServer((HOSTNAME, PORT), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile=os.path.join(package_path, PEM_PATH), server_side=True)
print os.path.join(package_path, "www")
os.chdir(os.path.join(package_path, "www"));
httpd.serve_forever()
