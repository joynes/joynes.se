from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os


class RangeRequestHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        ctype = self.guess_type(path)
        try:
            file_handle = open(path, "rb")
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return None

        file_size = os.fstat(file_handle.fileno()).st_size
        range_header = self.headers.get("Range")
        self.range = None

        if range_header and range_header.startswith("bytes="):
            start_text, _, end_text = range_header[6:].partition("-")
            try:
                if start_text:
                    start = int(start_text)
                    end = int(end_text) if end_text else file_size - 1
                else:
                    suffix = int(end_text)
                    start = max(0, file_size - suffix)
                    end = file_size - 1
                end = min(end, file_size - 1)
                if start > end:
                    raise ValueError
            except ValueError:
                file_handle.close()
                self.send_error(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                return None

            self.range = (start, end)
            file_handle.seek(start)
            self.send_response(HTTPStatus.PARTIAL_CONTENT)
            self.send_header("Content-type", ctype)
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
            self.send_header("Content-Length", str(end - start + 1))
            self.end_headers()
            return file_handle

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(file_size))
        self.end_headers()
        return file_handle

    def copyfile(self, source, outputfile):
        if getattr(self, "range", None) is None:
            return super().copyfile(source, outputfile)

        remaining = self.range[1] - self.range[0] + 1
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 8000), RangeRequestHandler)
    print("Serving HTTP with Range support on 0.0.0.0 port 8000")
    server.serve_forever()
