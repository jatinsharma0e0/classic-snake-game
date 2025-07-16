#!/usr/bin/env python3
import http.server
import socketserver
import os
import socket

PORT = 5000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def find_available_port(start_port=5000):
    port = start_port
    while is_port_in_use(port) and port < start_port + 100:
        port += 1
    return port

os.chdir('.')

# Find an available port
available_port = find_available_port(PORT)
if available_port != PORT:
    print(f"Port {PORT} is in use, using port {available_port}")
    PORT = available_port

class ReuseAddrTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReuseAddrTCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Serving at http://0.0.0.0:{PORT}")
    httpd.serve_forever()