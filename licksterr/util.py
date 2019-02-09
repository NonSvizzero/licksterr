import json
import logging
import tempfile
from functools import wraps
from time import time

from flask import request, abort

logger = logging.getLogger(__name__)

OK = json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


def timing(f, level=logging.DEBUG, verbose=False):
    @wraps(f)
    def wrap(*args, **kw):
        ts = time()
        result = f(*args, **kw)
        te = time()
        args_description = f"args:[{args}, {kw}]" if verbose else ''
        logger.log(level, f'func:{f.__name__} {args_description} took: {te-ts:2.4f}sec')
        return result

    return wrap


def flask_file_handler(f):
    @wraps(f)
    def wrap(*args, **kw):
        if not request.files:
            logger.debug("Received upload request without files.")
            abort(400)
        file = list(request.files.values())[0]
        extension = file.filename[-4:]
        if extension not in {'.gp3', '.gp4', '.gp5'}:
            abort(400)
        contents = file.read()
        with tempfile.TemporaryFile() as temp_file:
            temp_file.write(contents)
            temp_file.seek(0)
            response = f(file, temp_file, *args, **kw)
            return response

    return wrap


def row2dict(row):
    d = {}
    for column in row.__table__.columns:
        d[column.name] = getattr(row, column.name)

    return d
