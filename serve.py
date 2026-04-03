import http.server, os, functools
os.chdir("/Users/jonathanramundi/Desktop/Classificateur de veille")
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory="/Users/jonathanramundi/Desktop/Classificateur de veille")
http.server.HTTPServer(("", 8080), handler).serve_forever()
